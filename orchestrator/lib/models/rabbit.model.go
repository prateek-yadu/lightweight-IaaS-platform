package models

import amqp "github.com/rabbitmq/amqp091-go"

type Rabbit struct {
	Conn *amqp.Connection
}
