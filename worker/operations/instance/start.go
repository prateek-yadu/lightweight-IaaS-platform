package instance

import (
	"encoding/json"
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/connections"
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/models"
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/utils/funcs"
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/utils/types"
	amqp "github.com/rabbitmq/amqp091-go"
	"log"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func StartInstance() {

	ch, err := connections.RabbitPtr.Conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	err = ch.ExchangeDeclare(
		"libvirt_operations", // name
		"topic",              // type
		true,                 // durability
		false,                // auto-deleted
		false,                // internal
		false,                // no-wait
		nil,                  // arguments
	)
	failOnError(err, "Failed to declare an exchange")

	q, err := ch.QueueDeclare(
		"start_instance", // name
		true,             // durability
		false,            // delete when unused
		false,            // exclusive
		false,            // no-wait
		nil,              // arguments
	)
	failOnError(err, "Failed to declare a queue")

	err = ch.QueueBind(
		q.Name,               // queue name
		"instance.start",     // routing key
		"libvirt_operations", // exchange
		false,
		nil)
	failOnError(err, "Failed to bind a queue")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto ack
		false,  // exclusive
		false,  // no local
		false,  // no wait
		nil,    // args
	)
	failOnError(err, "Failed to register a consumer")

	done := make(chan bool)

	go worker(msgs, done)

	funcs.GracefullShutdown()
}

func worker(msgs <-chan amqp.Delivery, done chan bool) {
	for d := range msgs {

		// parse json
		var operation models.InstanceOperation
		byt := d.Body
		if err := json.Unmarshal(byt, &operation); err != nil {
			panic(err)
		}

		// update operation state to running
		operation.Status = types.StatusRunning

		// libvirt connection
		conn := connections.LibvirtPtr.Conn

		// update instance state
		dom, err := conn.LookupDomainByName(operation.Payload.Instance)

		if err != nil {
			log.Println("error occured coz", err)

			if dom != nil {
				dom.Free()
			}

			// update operation state to failed
			operation.Status = types.StatusFailed

			d.Ack(false)
			continue
		}

		dom.Create()
		dom.Free()

		// update operation state to success
		operation.Status = types.StatusSuccess
		d.Ack(true)
	}
	done <- true
}
