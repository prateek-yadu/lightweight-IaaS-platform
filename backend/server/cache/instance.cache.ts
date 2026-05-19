import { Redis } from "ioredis";
import { pool } from "../../lib/db.js";
import { redisConnection } from "../../lib/redis.js";

const redis = new Redis(redisConnection.connection);
const pipeline = redis.pipeline();

export const cacheInstances = async (userId: string) => {
  const [instances]: any = await pool.query(
    "SELECT id FROM instances WHERE user_id=?",
    [userId],
  );

  // if instnace is present add to cache
  if (instances.length !== 0) {
    for (const instance of instances) {
      pipeline.set(`instance-cache:${instance.id}`, userId, "EX", 86400);
    }
    pipeline.exec();
  }
};


// runs when user disconnects from socker.io
export const removeCahe = async (userId: string) => {
    const [instances]: any = await pool.query(
    "SELECT id FROM instances WHERE user_id=?",
    [userId],
  );

  // if instnace is present delete from cache
  if (instances.length !== 0) {
    for (const instance of instances) {
      pipeline.del(`instance-cache:${instance.id}`, userId);
    }
    pipeline.exec();
  }
};
