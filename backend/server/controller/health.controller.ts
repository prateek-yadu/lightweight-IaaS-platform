import { Request, Response } from "express";
import { pool } from "../../lib/db.js";
import { Redis } from "ioredis";
import { redisConnection } from "../../lib/redis.js";

type OverallHealth = "Stable" | "Critical" | undefined;

const checkMYSQLHealth = async () => {
  try {
    const connection = await pool.getConnection();
    const pingRes: any = await connection.ping();
    connection.release(); // closes connection

    switch (pingRes) {
      case true:
        return "OK";
      case false:
        return "DOWN";
    }
  } catch (error) {
    return "DOWN";
  }
};

const checkRedisHealth = async () => {
  const redis = new Redis(redisConnection.connection);
  try {
    const pingRes = await redis.ping();
    redis.disconnect(); // closes redis connection

    if (pingRes === "PONG") {
      return "OK";
    } else {
      return "DOWN";
    }
  } catch (error) {
    redis.disconnect(); // closes redis connection
    return "DOWN";
  }
};

const checkWorkerHealth = async (worker: string) => {
  const redis = new Redis(redisConnection.connection);
  try {
    const workerStatus: any = await redis.get(`health:workers:${worker}`);
    redis.disconnect(); // closes redis connection

    if (workerStatus === null) {
      return "DOWN";
    } else {
      const parsedStatus = JSON.parse(workerStatus).status;

      switch (parsedStatus) {
        case undefined:
          return "DOWN";

        case "OK":
          return "OK";

        case "DOWN":
          return "DOWN";
      }
    }
  } catch (error) {
    redis.disconnect(); // closes redis connection
    return "DOWN";
  }
};

const checkLXDAgentHealth = async () => {
  const req = await fetch(`${process.env.LXD_AGENT_SERVER}/api/v1/health`);
  if (req.status === 200) {
    const parsedData: any = await req.json();
    if (parsedData.health == "Stable") {
      return "OK";
    } else {
      return "DOWN";
    }
  } else {
    return "DOWN";
  }
};

export const shallowHealth = async (req: Request, res: Response) => {
  try {
    let overAllhealth: OverallHealth;
    const mysqlHealth = await checkMYSQLHealth();
    const redisHealth = await checkRedisHealth();
    const lxdAgentHealth = await checkLXDAgentHealth();
    const eventWorkerHealth = await checkWorkerHealth("event-worker");
    const provisionWorkerHealth = await checkWorkerHealth("provision-worker");
    const lifecycleWorkerHealth = await checkWorkerHealth("lifecycle-worker");

    if (
      mysqlHealth === "OK" &&
      redisHealth === "OK" &&
      lxdAgentHealth === "OK" &&
      eventWorkerHealth === "OK" &&
      provisionWorkerHealth === "OK" &&
      lifecycleWorkerHealth === "OK"
    ) {
      overAllhealth = "Stable";
    } else {
      overAllhealth = "Critical";
    }

    const health = {
      health: overAllhealth,
      uptime: process.uptime(), // sends uptime in seconds
      lastCheck: Date.now(),
    };
    res.json(health);
  } catch (error) {
    const health = {
      health: "Critical",
      uptime: process.uptime(), // sends uptime in seconds
      lastCheck: Date.now(),
    };
    res.json(health);
  }
};

export const deepHealth = async (req: Request, res: Response) => {
  try {
    let overAllhealth: OverallHealth;

    const mysqlHealth = await checkMYSQLHealth();
    const redisHealth = await checkRedisHealth();
    const lxdAgentHealth = await checkLXDAgentHealth();
    const eventWorkerHealth = await checkWorkerHealth("event-worker");
    const provisionWorkerHealth = await checkWorkerHealth("provision-worker");
    const lifecycleWorkerHealth = await checkWorkerHealth("lifecycle-worker");

    if (
      mysqlHealth === "OK" &&
      redisHealth === "OK" &&
      lxdAgentHealth === "OK" &&
      eventWorkerHealth === "OK" &&
      provisionWorkerHealth === "OK" &&
      lifecycleWorkerHealth === "OK"
    ) {
      overAllhealth = "Stable";
    } else {
      overAllhealth = "Critical";
    }

    const health = {
      health: overAllhealth,
      services: {
        backend: "OK",
        lxd_agent: lxdAgentHealth,
        mysql: mysqlHealth,
        redis: redisHealth,
        event_worker: eventWorkerHealth,
        provisioning_worker: provisionWorkerHealth,
        lifecycle_worker: lifecycleWorkerHealth,
        sync_worker: "TODO WORKER",
      },
      uptime: process.uptime(), // sends uptime in seconds
      lastCheck: Date.now(),
    };
    res.json(health);
  } catch (error) {
    let overAllhealth: OverallHealth;

    const mysqlHealth = await checkMYSQLHealth();
    const redisHealth = await checkRedisHealth();
    const lxdAgentHealth = await checkLXDAgentHealth();
    const eventWorkerHealth = await checkWorkerHealth("event-worker");
    const provisionWorkerHealth = await checkWorkerHealth("provision-worker");
    const lifecycleWorkerHealth = await checkWorkerHealth("lifecycle-worker");

    if (
      mysqlHealth === "OK" &&
      redisHealth === "OK" &&
      lxdAgentHealth === "OK" &&
      eventWorkerHealth === "OK" &&
      provisionWorkerHealth === "OK" &&
      lifecycleWorkerHealth === "OK"
    ) {
      overAllhealth = "Stable";
    } else {
      overAllhealth = "Critical";
    }

    const health = {
      health: overAllhealth,
      services: {
        backend: "OK",
        lxd_agent: lxdAgentHealth,
        mysql: mysqlHealth,
        redis: redisHealth,
        event_worker: eventWorkerHealth,
        provisioning_worker: provisionWorkerHealth,
        lifecycle_worker: lifecycleWorkerHealth,
        sync_worker: "TODO WORKER",
      },
      uptime: process.uptime(), // sends uptime in seconds
      lastCheck: Date.now(),
    };
    res.json(health);
  }
};
