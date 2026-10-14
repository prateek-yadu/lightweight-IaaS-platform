package models

import (
	"github.com/redis/go-redis/v9"
)

type Redis struct {
	Client *redis.Client
}
