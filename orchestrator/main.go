package main

import (
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/lib/connections"
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/routes"
	"log"
)

func main() {

	// connect to rabbitMQ
	connections.ConnectToMQ()
	log.Println("INFO: server running on: http://localhost:8765")
	routes.Run()
}
