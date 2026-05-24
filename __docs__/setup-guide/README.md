# Running Project

You can run the project either by docker compose or run every service manually. Here, I will cover both.

- Running via docker
- Running manually

## Essentials

Before even running `docker compose` you need to setup some things which are :-

- LXC/LXD
- Nginx

A detailed setup guide for each of them is located in `__docs__/setup/lxd` and `__docs__/setup/nginx` directory.

### Adding env file

Before running anything please go to the `backend`, `frontend` and `lxd_agent` directory and add the .env file. For reference .env.example file is provided. The variables are pretty self explanatory so you won't have any problems. A detailed guide will be coming soon regarding this topic.

Now that everything is set up, let's get started.

## Running via Docker

Running via docker is very simple just run the following command :-

```bash
docker compose up -d
```

This will run the full project including redis, mysql, proxy server along with monitoring stack.

> [!NOTE]
> Grafana will run but you need to import the dashboard manually from the `__deploy__/grafana/system-logs-dashboard.json` file.

## Running Manually

To run a project manually you need to perform some extra steps.

- Install Redis.
- Install mysql and import sql file from `__deploy__/mysql/prateek_labs.sql`.
- Also import `my.cnf` file from `__deploy__/mysql/my.cnf`.
- You will also need to set up Nginx. Please refer to `__docs__/setup/nginx/README.md` for setup guide.

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

> [!NOTE]
> You have to manually set up grafana and loki. Currently docs are not present for it.If you want a monitoring stack for now I recommend using docker compose setup docs will be coming soon.
