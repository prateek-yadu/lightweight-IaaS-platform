package response

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func BadRequest(c *gin.Context, errorMessage error) {
	c.JSON(http.StatusBadRequest, gin.H{
		"status": http.StatusBadRequest,
		"error":  string(errorMessage.Error()),
	})
}
