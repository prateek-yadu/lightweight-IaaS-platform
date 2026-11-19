package controller

import (
	"github.com/gin-gonic/gin"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/lib/utils/response"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/lib/utils/types"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/services"
)

func UpdateInstanceState(c *gin.Context) {

	var body types.InstanceState
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, err)
		return
	}

	instanceName := c.Param("name")

	res, err := services.UpdateInstanceState(instanceName, body.State)

	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.Created(c, res)
}

func CreateInstance(c *gin.Context) {
	var body types.CreateInstance

	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, err)
		return
	}

	res, err := services.CreateInstance(body)

	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.Created(c, res)

}

func DeleteInstance(c *gin.Context) {
	uuid := c.Param("uuid")

	// parse body

	res, err := services.DeleteInstance(uuid)

	if err != nil {
		response.InternalServerError(c, err)
	}

	// will return deleted instance uuid
	response.NoContent(c, res)
}
