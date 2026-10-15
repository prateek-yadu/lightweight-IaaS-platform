package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/lib/utils/response"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/services"
)

func GetAllOperations(c *gin.Context) {
	res, err := services.GetAllOperations()
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, res)
}

func GetOperation(c *gin.Context) {

	operationId := c.Param("operationId")

	res, err := services.GetOperation(operationId)
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, res)
}
