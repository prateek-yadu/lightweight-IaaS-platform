package instance

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"os/exec"
	"strings"

	"github.com/google/uuid"
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/connections"
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/models"
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/utils/funcs"
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/utils/types"
	amqp "github.com/rabbitmq/amqp091-go"
)

func CreateInstance(goldenImgDir string, storageDir string) {

	ch, err := connections.RabbitPtr.Conn.Channel()
	funcs.FailOnError(err, "Failed to open a channel")
	defer ch.Close()

	err = ch.ExchangeDeclare(
		"libvirt_operations", // name
		"topic",              // type
		true,                 // durability
		false,                // auto-deleted
		false,                // internal
		false,                // no-wait
		nil,                  // arguments
	)
	funcs.FailOnError(err, "Failed to declare an exchange")

	q, err := ch.QueueDeclare(
		"create_instance", // name
		true,              // durability
		false,             // delete when unused
		false,             // exclusive
		false,             // no-wait
		nil,               // arguments
	)
	funcs.FailOnError(err, "Failed to declare a queue")

	err = ch.QueueBind(
		q.Name,               // queue name
		"instance.create",    // routing key
		"libvirt_operations", // exchange
		false,
		nil)
	funcs.FailOnError(err, "Failed to bind a queue")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto ack
		false,  // exclusive
		false,  // no local
		false,  // no wait
		nil,    // args
	)
	funcs.FailOnError(err, "Failed to register a consumer")

	done := make(chan bool)

	go CreateInstanceWorker(msgs, done, goldenImgDir, storageDir)

	funcs.GracefullShutdown()
}

func CreateInstanceWorker(msgs <-chan amqp.Delivery, done chan bool, goldenImgDir string, storageDir string) {
	for d := range msgs {

		// parse json
		var operation models.InstanceCreateOperation
		byt := d.Body
		if err := json.Unmarshal(byt, &operation); err != nil {
			// update operation state to failed
			errUpdateFailed := funcs.UpdateOperationState(operation.Id, types.StatusFailed)

			if errUpdateFailed != nil {
				log.Println(errUpdateFailed.Error())
			}

			continue
		}

		// update operation state to running
		errUpadteRunnung := funcs.UpdateOperationState(operation.Id, types.StatusRunning)

		if errUpadteRunnung != nil {
			log.Println(errUpadteRunnung.Error())
		}

		// look for golden image
		imageExists := funcs.FileExists(goldenImgDir + operation.Payload.OS + ".qcow2")

		// checks if storage location is vailed
		storageVailed := funcs.FileExists(storageDir)

		if !imageExists || !storageVailed {
			// update operation state to failed
			errUpdateFailed := funcs.UpdateOperationState(operation.Id, types.StatusFailed)

			if errUpdateFailed != nil {
				log.Println(errUpdateFailed.Error())
			}

			continue
		}

		// prepare disk
		diskId := uuid.NewString()

		cmd := exec.Command("cp", goldenImgDir+operation.Payload.OS+".qcow2", storageDir+diskId+".qcow2")
		_, err := cmd.Output()

		if err != nil {
			// update operation state to failed
			errUpdateFailed := funcs.UpdateOperationState(operation.Id, types.StatusFailed)

			if errUpdateFailed != nil {
				log.Println(errUpdateFailed.Error())
			}

			continue
		}

		// resize disk
		diskSize := fmt.Sprintf("%d", operation.Payload.Storage) + "G"
		resizeCmd := exec.Command("qemu-img", "resize", storageDir+diskId+".qcow2", diskSize)
		_, resizeErr := resizeCmd.Output()

		if resizeErr != nil {
			// update operation state to failed
			errUpdateFailed := funcs.UpdateOperationState(operation.Id, types.StatusFailed)

			if errUpdateFailed != nil {
				log.Println(errUpdateFailed.Error())
			}

			continue
		}

		// domain defination XML
		const domainXMLTemplate = `
<domain type='kvm'>
	<name>{{.Name}}</name>
	<uuid>{{.UUID}}</uuid>
	<memory unit='GiB'>{{.Memory}}</memory>
	<currentMemory unit='GiB'>{{.Memory}}</currentMemory>
	<vcpu placement='static'>{{.VCPU}}</vcpu>
	<os>
		<type arch='x86_64' machine='pc-q35-noble'>hvm</type>
		<boot dev='hd'/>
	</os>
	<features>
		<acpi/>
		<apic/>
		<vmport state='off'/>
	</features>
	<cpu mode='host-passthrough' check='none' migratable='on'/>
	<clock offset='utc'>
		<timer name='rtc' tickpolicy='catchup'/>
		<timer name='pit' tickpolicy='delay'/>
		<timer name='hpet' present='no'/>
	</clock>
	<on_poweroff>destroy</on_poweroff>
	<on_reboot>restart</on_reboot>
	<on_crash>destroy</on_crash>
	<devices>
		<emulator>/usr/bin/qemu-system-x86_64</emulator>
		<disk type='file' device='disk'>
			<driver name='qemu' type='qcow2'/>
			<source file='{{.Disk}}'/>
			<target dev='vda' bus='virtio'/>
		</disk>
		<interface type='network'>
			<source network='default'/>
			<model type='virtio'/>
		</interface>
		<console type='pty'>
			<target type='serial' port='0'/>
		</console>
		<graphics type='spice' autoport='yes'>
			<listen type='address'/>
			<image compression='off'/>
		</graphics>
		<video>
			<model type='qxl' ram='65536' vram='65536' vgamem='16384' heads='1' primary='yes'/>
		</video>
		<watchdog model='itco' action='reset'/>
		<memballoon model='virtio'></memballoon>
		<rng model='virtio'>
			<backend model='random'>/dev/urandom</backend>
		</rng>
	</devices>
</domain>
	`

		// define domain

		domainInfo := models.Domain{Name: operation.Payload.Name, UUID: operation.Payload.UUID, Memory: operation.Payload.Memory, VCPU: operation.Payload.VCPU, Disk: storageDir + diskId + ".qcow2"}

		var domXML strings.Builder

		t := template.Must(template.New("domain").Parse(domainXMLTemplate))
		templateError := t.Execute(&domXML, domainInfo)

		if templateError != nil {
			// update operation state to failed
			errUpdateFailed := funcs.UpdateOperationState(operation.Id, types.StatusFailed)

			if errUpdateFailed != nil {
				log.Println(errUpdateFailed.Error())
			}

			continue
		}

		conn := connections.LibvirtPtr.Conn

		dom, err := conn.DomainDefineXML(domXML.String())

		if err != nil {
			if dom != nil {
				dom.Free()
			}

			// update operation state to failed
			errUpdateFailed := funcs.UpdateOperationState(operation.Id, types.StatusFailed)

			if errUpdateFailed != nil {
				log.Println(errUpdateFailed.Error())
			}

			d.Ack(false)
			continue
		}

		dom.Free()

		// update operation state to success
		operationUpdateSuccess := funcs.UpdateOperationState(operation.Id, types.StatusSuccess)

		if operationUpdateSuccess != nil {
			log.Println(operationUpdateSuccess.Error())
		}

		d.Ack(true)
	}
	done <- true
}
