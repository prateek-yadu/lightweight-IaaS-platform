package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/controller"
)

func operationsRoutes(rg *gin.RouterGroup) {
	operations := rg.Group("/operations")

	operations.GET("", controller.GetAllOperations)
	operations.GET(":operationId", controller.GetOperation)
}
