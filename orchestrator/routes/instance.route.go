package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/controller"
)

func instanceRoute(rg *gin.RouterGroup) {

	instance := rg.Group("/instance")

	instance.POST("", controller.CreateInstance)

	instance.PUT(":name", controller.UpdateInstanceState)
}
