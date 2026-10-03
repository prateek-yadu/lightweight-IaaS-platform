package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/controller"
)

func healthRoute(rg *gin.RouterGroup) {

	getHealth := rg.Group("/health")

	getHealth.GET("", controller.GetHealth)

}
