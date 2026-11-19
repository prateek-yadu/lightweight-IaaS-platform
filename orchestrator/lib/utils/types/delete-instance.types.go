package types

type DeleteInstance struct {
	UUID string `json:"uuid" binding:"required"`
}
