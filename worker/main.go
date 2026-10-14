package main

import (
	"flag"
	"fmt"
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/connections"
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/operations/instance"
)

func main() {
	libvirtConnectionString := flag.String("libvirtUrl", "", "libvirt connection string\n")
	rabbitConnectionString := flag.String("rabbitUrl", "", "rabbitmq connection string\n")
	redisConnectionString := flag.String("redisUrl", "", "redis connection string\n")
	workerType := flag.String("type", "", `set worker type
	- "instance.start"	start instance
`)

	flag.Parse()

	if *libvirtConnectionString == "" || *rabbitConnectionString == "" || *workerType == "" {
		fmt.Println("Error! Please run help to see avaialble arguments")
		return
	}

	// connections
	connections.ConnectToMQ(*rabbitConnectionString)
	connections.LibvirtConnect(*libvirtConnectionString)
	connections.ConnectToRedis(*redisConnectionString)

	switch *workerType {
	case "instance.start":
		instance.StartInstance()
	default:
		fmt.Printf("worker does not exists, try help!")
	}
}
