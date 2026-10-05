package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/controller"
)

func instanceRoute(rg *gin.RouterGroup) {

	instance := rg.Group("/instance")

	instance.PUT(":name", controller.UpdateInstanceState)
}
