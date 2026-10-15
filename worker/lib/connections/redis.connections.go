package connections

import (
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/models"
	"github.com/redis/go-redis/v9"
	"log"
)

var RedisPtr *models.Redis

func ConnectToRedis(url string) {

	opt, err := redis.ParseURL(url)

	if err != nil {
		log.Println("ERR: Redis Connection Error")
		panic(err)
	}

	client := redis.NewClient(opt)

	log.Printf("INFO: Connected to Redis")

	RedisPtr = &models.Redis{Client: client}
}
