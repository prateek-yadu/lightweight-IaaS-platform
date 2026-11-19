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

func DeleteInstance(goldenImgDir string, storageDir string) {

	ch, err := connections.RabbitPtr.Conn.Channel()
	funcs.FailOnError(err, "Failed to open a channel")
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
	funcs.FailOnError(err, "Failed to declare an exchange")

	q, err := ch.QueueDeclare(
		"delete_instance", // name
		true,              // durability
		false,             // delete when unused
		false,             // exclusive
		false,             // no-wait
		nil,               // arguments
	)
	funcs.FailOnError(err, "Failed to declare a queue")

	err = ch.QueueBind(
		q.Name,               // queue name
		"instance.delete",    // routing key
		"libvirt_operations", // exchange
		false,
		nil)
	funcs.FailOnError(err, "Failed to bind a queue")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto ack
		false,  // exclusive
		false,  // no local
		false,  // no wait
		nil,    // args
	)
	funcs.FailOnError(err, "Failed to register a consumer")

	done := make(chan bool)

	go RemoveInstanceWorker(msgs, done, goldenImgDir, storageDir)

	funcs.GracefullShutdown()
}

func RemoveInstanceWorker(msgs <-chan amqp.Delivery, done chan bool, goldenImgDir string, storageDir string) {
	for d := range msgs {

		// parse json
		var operation models.DeleteInstanceOperation
		byt := d.Body
		if err := json.Unmarshal(byt, &operation); err != nil {
			// update operation state to failed
			errUpdateFailed := funcs.UpdateOperationState(operation.Id, types.StatusFailed)

			if errUpdateFailed != nil {
				log.Println(errUpdateFailed.Error())
			}

			continue
		}

		// update operation state to running
		errUpadteRunnung := funcs.UpdateOperationState(operation.Id, types.StatusRunning)

		if errUpadteRunnung != nil {
			log.Println(errUpadteRunnung.Error())
		}

		conn := connections.LibvirtPtr.Conn

		dom, err := conn.LookupDomainByUUIDString(operation.Payload.UUID)

		if err != nil {
			if dom != nil {
				dom.Free()
			}

			// update operation state to failed
			errUpdateFailed := funcs.UpdateOperationState(operation.Id, types.StatusFailed)

			if errUpdateFailed != nil {
				log.Println(errUpdateFailed.Error())
			}

			d.Ack(false)
			continue
		}

		undefineErr := dom.Undefine()

		if undefineErr != nil {
			if dom != nil {
				dom.Free()
			}

			// update operation state to failed
			errUpdateFailed := funcs.UpdateOperationState(operation.Id, types.StatusFailed)

			if errUpdateFailed != nil {
				log.Println(errUpdateFailed.Error())
			}

			d.Ack(false)
			continue
		}

		dom.Free()

		// update operation state to success
		operationUpdateSuccess := funcs.UpdateOperationState(operation.Id, types.StatusSuccess)

		if operationUpdateSuccess != nil {
			log.Println(operationUpdateSuccess.Error())
		}

		d.Ack(true)
	}
	done <- true
}
