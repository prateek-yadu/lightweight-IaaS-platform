package response

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func InternalServerError(c *gin.Context, errorMessage error) {
	c.JSON(http.StatusInternalServerError, gin.H{
		"status": http.StatusInternalServerError,
		"error":  string(errorMessage.Error()),
	})
}
