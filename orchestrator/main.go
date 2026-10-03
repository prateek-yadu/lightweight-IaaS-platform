package main

import (
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/routes"
	"log"
)

func main() {
	log.Println("INFO: server running on: http://localhost:8765")
	routes.Run()
}
