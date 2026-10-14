package connections

import (
	"github.com/prateek-yadu/lightweight-IaaS-platform/orchestrator/lib/models"
	"github.com/redis/go-redis/v9"
	"log"
	"os"
)

var RedisPtr *models.Redis

func ConnectToRedis() {

	// get value from env variable
	redisUrl := os.Getenv("REDIS_URL")

	opt, err := redis.ParseURL(redisUrl)

	if err != nil {
		log.Println("ERR: Redis Connection Error")
		panic(err)
	}

	client := redis.NewClient(opt)

	log.Printf("INFO: Connected to Redis")

	RedisPtr = &models.Redis{Client: client}
}
