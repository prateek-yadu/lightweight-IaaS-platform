package services

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/lib/connections"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/lib/utils/types"
	amqp "github.com/rabbitmq/amqp091-go"
	"time"
)

func UpdateInstanceState(instanceName string, state string) (gin.H, error) {

	switch state {
	case "start":
		return startInstance(instanceName, state)
	case "shutdown":
		return stopInstance(instanceName, state)
	default:
		return nil, errors.New("state '" + state + "' not supported")
	}

}

func startInstance(instanceName string, state string) (gin.H, error) {
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
		"type": types.StartInstance,
		"payload": map[string]any{
			"instance": instanceName,
			"state":    state,
		},
		"status":    types.StatusPending,
		"timestamp": time.Now().UTC(),
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

	res := map[string]any{
		"id":        operationId,
		"status":    types.StatusPending,
		"instance":  instanceName,
		"type":      types.StartInstance,
		"timestamp": time.Now().UTC(),
	}

	resJson, err := json.Marshal(res)

	// send operation to redis
	redis := connections.RedisPtr.Client

	// redis context
	rctx := context.Background()

	key := "operation:" + operationId

	redisErr := redis.Set(rctx, key, string(resJson), 0)

	if redisErr.Err() != nil {
		return nil, errors.New("Failed to update operation status to redis")
	}

	return res, nil
}

func stopInstance(instanceName string, state string) (gin.H, error) {
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
		"type": types.StopInstance,
		"payload": map[string]any{
			"instance": instanceName,
			"state":    state,
			"force":    false,
		},
		"status":    types.StatusPending,
		"timestamp": time.Now().UTC(),
	})

	if err != nil {
		return nil, errors.New("Error in creating body for topic")
	}

	// send body into topic
	err = ch.PublishWithContext(ctx,
		"libvirt_operations", // exchange
		"instance.stop",      // routing key
		false,                // mandatory
		false,                // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        []byte(body),
		})

	if err != nil {
		return nil, errors.New("Failed to publish a message")
	}

	res := map[string]any{
		"id":        operationId,
		"status":    types.StatusPending,
		"instance":  instanceName,
		"type":      types.StopInstance,
		"timestamp": time.Now().UTC(),
	}

	resJson, err := json.Marshal(res)

	// send operation to redis
	redis := connections.RedisPtr.Client

	// redis context
	rctx := context.Background()

	key := "operation:" + operationId

	redisErr := redis.Set(rctx, key, string(resJson), 0)

	if redisErr.Err() != nil {
		return nil, errors.New("Failed to update operation status to redis")
	}

	return res, nil
}
