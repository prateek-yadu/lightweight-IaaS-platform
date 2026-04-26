import { config } from "dotenv";

config({ path: ".env" });

export const redisConnection = {
    connection: {
        host: process.env.REDIS_SERVER, 
        port: Number(process.env.REDIS_SERVER_PORT)
    }
}