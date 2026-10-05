package types

type InstanceState struct {
	State string `json:"state" binding:"required"`
}
