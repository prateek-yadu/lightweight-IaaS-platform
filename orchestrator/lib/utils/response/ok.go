package response

import (
	"github.com/gin-gonic/gin"
	"maps"
	"net/http"
)

func OK(c *gin.Context, message map[string]any) {

	response := map[string]any{
		"status": http.StatusOK,
	}

	maps.Copy(response, message)

	c.JSON(http.StatusOK, response)
}
