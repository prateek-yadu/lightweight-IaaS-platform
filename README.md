# lightweight IaaS platform (VPS Clone)

## Introduction

The aim of this project is to understand under the hood how VPS providers work. This project is heavily inspired by Hostinger's VPS Pannel and trying to replicate the billing process seen in the hostinger. Though this project is inspired by hostinger, in future releases it is planned to make project standout as it's own niche.

![Demo Video](frontend/public/videos/demo.webm)

## Features

- using LXD for VM initialization.
- complete instance lifecycle with.
- statefull connection b/w client and server using socket.io.
- implemented workers for instance operation & state sync.
- using cloud-init for VM setup and initialization.
- queueing logic using bullMQ.
- separation of business and infrastructure logic.
- logging and metrics support.
- visualization of logs & metrics using grafana dashboard.
- alerting system if something went wrong.
- health check implementation with basic health checking.
- docker-compose file for easy deployments and setup.

## Architecture
![Architecture Overview](__docs__/architecture/Architecture%20design.png)

## Tech Stack

**Frontend :-** vite/react, Typescript, redux toolkit, tailwindcss, socket.io (client)

**Backend :-** expressjs, Typescript, bullMQ, socket.io, jsonwebtoken

**Database :-** Mysql

**Caching/Queues :-** Redis

**Infrastructure :-** LXD, Cloud-init, Docker

**Monitoring & Observibility :-** Grafana, loki, prometheus

## Requirements

The project should meet the following requirements as development and testing is done on those specific versions.

**Operating System :-** Linux (Ubuntu 24.04 Preferred)

| Name | Version | 
|------|---------| 
| LXD | 5.21.4 LTS |
| LXC | 5.21.4 LTS |
| Mysql | 9.7.0 |
| Redis | 8.6.3 |
| Nginx | 1.30.0 |
| NodeJs | v24.15.0 |

## Quick start

To run project you can either use docker or run manually. I recommend to run this project using docker.

Additionally before Quick Start refer to the `__docs__/lxd/README.md` for setup docs of LXD.

Now that LXD is installed let's continue.

### Run via npm

To run project manually you need to perform some extra steps.

- Install Redis.
- Install mysql and import sql file from `__deploy__/mysql/prateek_labs.sql`.
- Also import `my.cnf` file from `__deploy__/mysql/my.cnf`.
- You also need to setup Nginx refer to `__docs__/nginx/README.md` for setup guide.

Now that everything is configured let's start.

#### Frontend

To run frontend navigate to the `frontend` directory and run :-

```bash 
npm run dev # For development
```

#### LXD Agent

To run the agent navigate to the `lxd_agent` directory and run :-

```bash 
npm run dev # For development
```


#### Backend

To run backend navigate to the `backend` directory and run :-

```bash 
npm run dev # For development
```

#### Workers

To run workers navigate to the `backend` directory and run :-

```bash 
# For development
npm run event-worker
npm run lifecycle-worker
npm run provision-worker
npm run sync-worker
npm run expiry-worker
```

### Run Via Docker

docker compose will run all the server and services including monitoring stack.

```bash
docker compose up
```

> [!NOTE]
> Before starting server add environment variables in backend and lxd_agent.

## Documentation

For detailed documentation refer to the `__docs__` directory. 

## Limitations

- Project currently does not support multiple regions.
- Only one Operating System support.
- No support for adding ssh keys from UI.
- No support for Oauth registeration/login.
- basic API for plan purchase, no payment gateway integration like razorpay or stripe.
- No test cases.

## Future Implementation

- Seperate router for each users.
- bandwidth limit & analytics.
- Firewall configuration via UI.
- Market place for pre-built images.
- VMs metrics on dashboard (client's bowser).
- Multi region or server support.
