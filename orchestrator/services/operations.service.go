package services

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/lib/connections"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/lib/models"
	"log"
)

func GetAllOperations() (gin.H, error) {

	redis := connections.RedisPtr.Client

	// redis context
	ctx := context.Background()

	// get all operations
	keys, err := redis.Keys(ctx, "operation:*").Result()

	if err != nil {
		return nil, errors.New("Error getting keys")
	}

	// temperory var to store operation details
	temp := models.Operation{}

	// All operations
	var operations = []models.Operation{}

	// fetch keys value
	for _, key := range keys {

		operation := redis.Get(ctx, key).Val()

		err := json.Unmarshal([]byte(operation), &temp)

		if err != nil {
			log.Println("WARN: Can not unmarshal some operations at route GET /api/operations")
			continue
		}

		operations = append(operations, temp)
	}

	return map[string]any{
		"operations": operations,
	}, nil
}

func GetOperation(operationId string) (gin.H, error) {

	redis := connections.RedisPtr.Client

	// redis context
	ctx := context.Background()

	// store operation
	res := models.Operation{}

	operation := redis.Get(ctx, "operation:"+operationId).Val()

	err := json.Unmarshal([]byte(operation), &res)

	if err != nil {
		return nil, errors.New("Error can not convert operation to json")
	}

	return map[string]any{
		"operation": res,
	}, nil
}
