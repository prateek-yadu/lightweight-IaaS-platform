package connections

import (
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/models"
	"libvirt.org/go/libvirt"
	"log"
)

var LibvirtPtr *models.LibvirtPtr

func LibvirtConnect(url string) {
	conn, err := libvirt.NewConnect(url)
	if err != nil {
		log.Println("ERR: Libvirt Connection Error")
		panic(err)
	}

	log.Println("INFO: Connected to libvirt API")

	LibvirtPtr = &models.LibvirtPtr{Conn: conn}
}
