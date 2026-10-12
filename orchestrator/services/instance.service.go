package services

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/lib/connections"
	amqp "github.com/rabbitmq/amqp091-go"
	"time"
)

func UpdateInstanceState(instanceName string, state string) (gin.H, error) {

	if !(state == "start" || state == "shutdown" || state == "reboot") {
		return nil, errors.New("state '" + state + "' not supported")
	}

	conn := connections.RabbitPtr.Conn

	// open a channel
	ch, err := conn.Channel()

	if err != nil {
		return nil, errors.New("can not create rabbitMQ channel")
	}

	defer ch.Close()

	// create exchange
	err = ch.ExchangeDeclare(
		"libvirt_operations", // name
		"topic",              // type
		true,                 // durability
		false,                // auto-deleted
		false,                // internal
		false,                // no-wait
		nil,                  // arguments
	)

	if err != nil {
		return nil, errors.New("Failed to declare an exchange")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// generate uuid
	operationId := uuid.New().String()

	// body to send in topic
	body, err := json.Marshal(map[string]any{
		"id":   operationId,
		"type": "start_instance",
		"payload": map[string]any{
			"instance_name": instanceName,
			"state":         state,
		},
		"status": "pending",
	})

	if err != nil {
		return nil, errors.New("Error in creating body for topic")
	}

	// send body into topic
	err = ch.PublishWithContext(ctx,
		"libvirt_operations", // exchange
		"instance.start",     // routing key
		false,                // mandatory
		false,                // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        []byte(body),
		})

	if err != nil {
		return nil, errors.New("Failed to publish a message")
	}

	return map[string]any{
		"id":          operationId,
		"status":      "pending",
		"description": "updating instance state to " + state,
		"created_at":  time.Now().UTC(),
	}, nil
}
