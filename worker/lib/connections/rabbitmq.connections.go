package connections

import (
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/models"
	amqp "github.com/rabbitmq/amqp091-go"
	"log"
)

var RabbitPtr *models.Rabbit

func ConnectToMQ(url string) {

	conn, err := amqp.Dial(url)

	if err != nil {
		log.Println("ERR: RabbitMQ Connection Error")
		panic(err)
	}

	log.Printf("INFO: Connected to RabbitMQ")

	RabbitPtr = &models.Rabbit{Conn: conn}
}
