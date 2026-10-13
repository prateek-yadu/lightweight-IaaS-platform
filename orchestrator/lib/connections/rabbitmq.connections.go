package connections

import (
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/lib/models"
	amqp "github.com/rabbitmq/amqp091-go"
	"log"
	"os"
)

var RabbitPtr *models.Rabbit

func ConnectToMQ() {

	// get value from env variable
	rabbitUrl := os.Getenv("RABBITMQ_URL")

	conn, err := amqp.Dial(rabbitUrl)

	if err != nil {
		log.Println("ERR: RabbitMQ Connection Error")
		panic(err)
	}

	log.Printf("INFO: Connected to RabbitMQ")

	RabbitPtr = &models.Rabbit{Conn: conn}
}
