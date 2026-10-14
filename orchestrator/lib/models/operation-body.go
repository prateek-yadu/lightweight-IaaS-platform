package models

type Operation struct {
	Id             string `json:"id" binding:"required"`
	Instance       string `json:"instance" binding:"required"`
	Status         string `json:"status" binding:"required"`
	Timestamp      any    `json:"timestamp" binding:"required"`
	Operation_type any    `json:"type" binding:"required"`
}
