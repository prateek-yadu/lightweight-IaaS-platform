package models

import "libvirt.org/go/libvirt"

type LibvirtPtr struct {
	Conn *libvirt.Connect
}
