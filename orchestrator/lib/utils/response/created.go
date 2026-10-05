package response

import (
	"github.com/gin-gonic/gin"
	"maps"
	"net/http"
)

func Created(c *gin.Context, message map[string]any) {

	response := map[string]any{
		"status": http.StatusCreated,
	}

	maps.Copy(response, message)

	c.JSON(http.StatusCreated, response)
}
