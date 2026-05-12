FROM node:24.15.0

WORKDIR /expiry-worker

COPY package*.json .

RUN npm install

RUN npm i -g tsx

COPY lib/db.ts lib/db.ts
COPY lib/logger.utils.ts lib/logger.utils.ts
COPY lib/redis.ts lib/redis.ts
COPY server/queues/instance/lifecycle.queue.ts server/queues/instance/lifecycle.queue.ts
COPY server/queues/queue.config.ts server/queues/queue.config.ts
COPY server/utils/validators/planValidators.ts server/utils/validators/planValidators.ts

COPY workers/expiry.worker.ts workers/expiry.worker.ts

# LXD Configuration
ENV LXD_AGENT_SERVER=YOUR_LXD_AGENT_SERVER_URL

# Database Configuration
ENV DB_HOST=YOUR_DATABASE_HOST
ENV DB_PORT=3306
ENV DB_NAME=YOUR_DATABASE_NAME
ENV DB_USER=YOUR_DATABASE_USER
ENV DB_PASSWD=YOUR_DATABASE_PASSWORD

# Redis Configuration
ENV REDIS_SERVER=YOUR_REDIS_HOST
ENV REDIS_SERVER_PORT=6379
ENV REDIS_PROVISIONING_QUEUE=provision-instance
ENV REDIS_LIFECYCLE_QUEUE=instance-lifecycle

CMD [ "npm", "run", "expiry-worker" ]

