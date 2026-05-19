import { config } from "dotenv";
import { Job, Worker } from "bullmq";
import { redisConnection } from "../lib/redis.js";
import { Redis } from "ioredis";
import { logger } from "../lib/logger.utils.js";

config({ path: "../.env" });

// new redis instance
const redis = new Redis(redisConnection.connection);

var iscrashed = false;

const worker = new Worker(
  process.env.REDIS_PROVISIONING_QUEUE || "provision-instance",
  async (job: Job) => {
    try {
      // will call lxd api to creare instance
      const createInstance: any = await (
        await fetch(`${process.env.LXD_AGENT_SERVER}/api/v1/instance`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(job.data),
        })
      ).json();

      if (createInstance.status !== 200) {
        await logger.worker.log("provision", {
          type: "error",
          message: `Instnace ${job.data.name} provision failed.`,
        });
      } else {
        await logger.worker.log("provision", {
          type: "success",
          message: `Instnace ${job.data.name} provisioned successfully.`,
        });
      }
    } catch (error: any) {
      await logger.worker.log("provision", {
        type: "error",
        message: `Instance ${job.data.name} provision failed.`,
      });
    }
  },
  redisConnection,
);

worker.on("ready", async () => {
  await logger.worker.log("provision", {
    type: "info",
    message: "Worker is up and running.",
  });
  iscrashed = false;
});

worker.on("error", async () => {
  await logger.worker.log("provision", {
    type: "error",
    message: "Worker went down.",
  });
  iscrashed = true;
});

setInterval(() => {
  const payload = {
    status: iscrashed ? "DOWN" : "OK",
    lastCheck: Date.now(),
  };
  redis.set(
    "health:workers:provision-worker",
    JSON.stringify(payload),
    "EX",
    15,
  );
}, 5000);
