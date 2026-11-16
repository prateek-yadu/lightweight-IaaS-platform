package models

type InstanceCreateOperation struct {
	Id             string                 `json:"id" binding:"required"`
	Status         string                 `json:"status" binding:"required"`
	Payload        CreateOperationPayload `json:"payload" binding:"required"`
	Operation_type string                 `json:"type" binding:"required"`
}

type InstanceUpdateOperation struct {
	Id             string                 `json:"id" binding:"required"`
	Status         string                 `json:"status" binding:"required"`
	Payload        UpdateOperationPayload `json:"payload" binding:"required"`
	Operation_type string                 `json:"type" binding:"required"`
}

type UpdateOperationPayload struct {
	Instance string `json:"instance" binding:"required"`
	State    string `json:"state" binding:"required"`
}

type CreateOperationPayload struct {
	Name    string `json:"name" binding:"required"`
	UUID    string `json:"uuid" binding:"required"`
	VCPU    int    `json:"vCPU" binding:"required"`
	Memory  int    `json:"memory" binding:"required"`
	Storage int    `json:"storage" binding:"required"`
	OS      string `json:"os" binding:"required"`
	Auth    Auth   `json:"auth" binding:"required"`
}

type Auth struct {
	Password string   `json:"password"`
	SSH_KEY  []string `json:"ssh_key"`
}
