package models

type InstanceOperation struct {
	Id             string                 `json:"id" binding:"required"`
	Status         string                 `json:"status" binding:"required"`
	Payload        UpdateOperationPayload `json:"payload" binding:"required"`
	Operation_type string                 `json:"type" binding:"required"`
}

type UpdateOperationPayload struct {
	Instance string `json:"instance" binding:"required"`
	State    string `json:"state" binding:"required"`
}
