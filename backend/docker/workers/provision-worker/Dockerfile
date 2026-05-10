FROM node:24.15.0

WORKDIR /event-worker

COPY package*.json .

RUN npm install

COPY lib/db.ts lib/db.ts
COPY lib/logger.utils.ts lib/logger.utils.ts
COPY lib/redis.ts lib/redis.ts

COPY workers/provision.worker.ts workers/provision.worker.ts

# LXD Configuration
ENV LXD_SERVER=YOUR_LXD_SERVER_URL
ENV LXD_AGENT_SERVER=YOUR_LXD_AGENT_SERVER_URL
ENV PROJECT=YOUR_PROJECT_NAME

# Database Configuration
ENV DB_HOST=YOUR_DATABASE_HOST
ENV DB_PORT=3306
ENV DB_NAME=YOUR_DATABASE_NAME
ENV DB_USER=YOUR_DATABASE_USER
ENV DB_PASSWD=YOUR_DATABASE_PASSWORD

# Security Configuration
ENV SALTROUNDS=10
ENV JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY

# Application Environment
ENV IN_PROD=false

# Redis Configuration
ENV REDIS_SERVER=YOUR_REDIS_HOST
ENV REDIS_SERVER_PORT=6379
ENV REDIS_PROVISIONING_QUEUE=provision-instance
ENV REDIS_LIFECYCLE_QUEUE=instance-lifecycle

# LXD Event Listener Configuration
ENV LXD_EVENTS=lifecycle

EXPOSE 3000

CMD [ "npm", "run", "provision-worker" ]

