package types

type CreateInstance struct {
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
