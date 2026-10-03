package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/services"
	"net/http"
)

func GetHealth(c *gin.Context) {

	res := services.GetHealth()

	c.JSON(http.StatusOK, gin.H{
		"status": res,
	})
}
