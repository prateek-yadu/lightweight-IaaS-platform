import { config } from "dotenv";
import { Redis } from "ioredis";
import { pool } from "../lib/db.js";
import { logger } from "../lib/logger.utils.js";
import { redisConnection } from "../lib/redis.js";

// dotenv config
config({ path: "../.env" });

// creates socket connection
const socket = new WebSocket(
  `${process.env.LXD_SERVER}/1.0/events?type=${process.env.LXD_EVENTS}&project=${process.env.PROJECT}`,
);
const redis = new Redis(redisConnection.connection);

var iscrashed = false;

socket.addEventListener("open", async () => {
  iscrashed = false;
  await logger.worker.log("event", {
    type: "info",
    message: "Listening for socket connection...",
  });
});

socket.addEventListener("message", async (event) => {
  try {
    const message = JSON.parse(event.data);

    const project = message.metadata.project; // gets project name
    const instance = message.metadata.name; // gets instance name
    const operation = message.metadata.action; // gets operation eg.instance-shutdown, instance-started

    // verifies if project matches the project in dotenv
    if (project === process.env.PROJECT) {
      // update state in db
      switch (operation) {
        case "instance-started":
        case "instance-restarted":
          const [setStatusToRunning]: any = await pool.query(
            "UPDATE instances SET status=? WHERE id=?",
            ["running", instance],
          );
          break;
        case "instance-shutdown":
        case "instance-stopped":
          const [setStatusToStopped]: any = await pool.query(
            "UPDATE instances SET status=? WHERE id=?",
            ["stopped", instance],
          );
          break;
      }

      // sends to redis pub/sub
      redis.publish(
        process.env.REDIS_PUBSUB_INSTANCE_EVENT_CHANNEL || "instance-events",
        JSON.stringify({
          instance,
          operation,
        }),
      );
    }
  } catch (error) {
    await logger.worker.log("event", {
      type: "error",
      message: "Error while performing operation.",
    });
  }
});

socket.addEventListener("error", async (error) => {
  await logger.worker.log("event", {
    type: "error",
    message: "Socket connection error.",
  });
});

socket.addEventListener("close", async () => {
  await logger.worker.log("event", {
    type: "error",
    message: "Socket connection closed by server.",
  });
  iscrashed = true;
});

setInterval(() => {
  const payload = {
    status: iscrashed ? "DOWN" : "OK",
    lastCheck: Date.now(),
  };
  redis.set("health:workers:event-worker", JSON.stringify(payload), "EX", 15);
}, 5000);
