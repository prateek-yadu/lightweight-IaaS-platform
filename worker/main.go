package main

import (
	"flag"
	"fmt"
	// "strings"

	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/connections"
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/operations/instance"
)

func main() {
	libvirtConnectionString := flag.String("libvirtUrl", "", "libvirt connection string\n")
	rabbitConnectionString := flag.String("rabbitUrl", "", "rabbitmq connection string\n")
	redisConnectionString := flag.String("redisUrl", "", "redis connection string\n")
	goldenImageDir := flag.String("glodenImgDir", "", "golden image directory location\n") // only needed for create instance worker
	storageDir := flag.String("storageDir", "", "instance disk directory location\n")      // only needed for create instance worker
	workerType := flag.String("type", "", `set worker type
	- "instance.start"	start instance
	- "instance.shutdown" shutdown instance
	- "instance.reboot" reboot instance
	- "instance.create" create instance
	- "instance.delete" delete instance
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
	case "instance.create":
		instance.CreateInstance(*goldenImageDir, *storageDir)
	case "instance.start":
		instance.StartInstance()
	case "instance.shutdown":
		instance.StopInstance()
	case "instance.reboot":
		instance.RebootInstance()
	case "instance.delete":
		instance.DeleteInstance(*goldenImageDir, *storageDir)
	default:
		fmt.Printf("worker does not exists, try help!")
	}
}