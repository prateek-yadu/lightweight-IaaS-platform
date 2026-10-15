package funcs

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/connections"
	"github.com/prateek-yadu/lightweight-IaaS-platform/worker/lib/utils/types"
)

func UpdateOperationState(id string, status string) error {

	// connect to redis
	redis := connections.RedisPtr.Client
	ctx := context.Background()

	var data = redis.Get(ctx, "operation:"+id).Val()

	if status == types.StatusSuccess || status == types.StatusFailed {
		updatedString := strings.ReplaceAll(data, `"status":"running"`, `"status":"`+status+`"`)
		err := redis.Set(ctx, "operation:"+id, updatedString, time.Hour*2)
		if err.Err() != nil {
			return errors.New("Failed to update operation status to redis")
		}

	} else {
		updatedString := strings.ReplaceAll(data, `"status":"pending"`, `"status":"`+status+`"`)
		err := redis.Set(ctx, "operation:"+id, updatedString, 0)
		if err.Err() != nil {
			return errors.New("Failed to update operation status to redis")
		}
	}
	return nil
}
