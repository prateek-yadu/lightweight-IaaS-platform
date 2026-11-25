package main

import (
	"log"

	"github.com/prateek-yadu/lightweight-IaaS-platform/controller/routes"
)

func main() {
	
	log.Println("INFO: server running on: http://localhost:8765")
	routes.Run()
}
