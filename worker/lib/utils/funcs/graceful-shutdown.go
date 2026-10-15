package funcs

import (
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/connections"
	"log"
	"os"
	"os/signal"
	"syscall"
)

func GracefullShutdown() {
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
		// close libvirt connection
		libvirt := connections.LibvirtPtr
		libvirt.Conn.Close()
		log.Println("INFO: Libvirt connection closed successfully!")

		// close rabbitMQ connection
		rabbit := connections.RabbitPtr
		rabbit.Conn.Close()
		log.Println("INFO: Rabbit connection closed successfully!")

		// close Redis connection
		redis := connections.RedisPtr
		redis.Client.Close()
		log.Println("INFO: Redis connection closed successfully!")
	}()

	log.Println("INFO: Worker exiting")
}
