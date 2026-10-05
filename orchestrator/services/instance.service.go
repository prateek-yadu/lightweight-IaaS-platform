package services

import (
	"github.com/gin-gonic/gin"
	"time"
)

func UpdateInstanceState(instanceName string, state string) (gin.H, error) {

	return map[string]any{
		"message":      "working on route",
		"operation_id": "opi_1234567890",
		"created_at":   time.Now().UTC(),
	}, nil
}
