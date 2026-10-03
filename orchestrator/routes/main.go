package routes

import (
	"context"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

var router = gin.Default()

func getRoutes() {
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"project": "lightweight-IaaS-platform-orchestrator", "repository": "https://github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator"})
	})

	api := router.Group("/api")
	healthRoute(api)
}

// Run will start the server
func Run() {
	getRoutes()

	srv := &http.Server{
		Addr:    ":8765",
		Handler: router.Handler(),
	}

	go func() {
		// service connections
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server with
	// a timeout of 5 seconds.
	quit := make(chan os.Signal, 1)
	// kill (no params) by default sends syscall.SIGTERM
	// kill -2 is syscall.SIGINT
	// kill -9 is syscall.SIGKILL but can't be caught, so don't need add it
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	// clean-up code
	defer func() {
		log.Println("INFO: server closed successfully!")

	}()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Println("ERR: Server Shutdown:", err)
	}

	log.Println("INFO: Server exiting")
}
