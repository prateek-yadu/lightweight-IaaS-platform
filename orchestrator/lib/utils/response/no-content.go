package response

import (
	"maps"
	"net/http"
	"github.com/gin-gonic/gin"
)

func NoContent(c *gin.Context, message map[string]any) {
	response := map[string]any{
		"status": http.StatusCreated,
	}

	maps.Copy(response, message)

	c.JSON(http.StatusCreated, response)
}
