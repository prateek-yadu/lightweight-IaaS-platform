export const connection = {
    connection: {
        host: process.env.REDIS_SERVER || 'localhost',
        port: Number(process.env.REDIS_SERVER_PORT) || 6379
    }
};