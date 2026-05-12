import {Redis} from "ioredis";
import { pool } from "../lib/db.js";
import { lifecycleQueue } from "../server/queues/instance/lifecycle.queue.js";
import { isExpired } from "../server/utils/validators/planValidators.js";
import { redisConnection } from "../lib/redis.js";

const redis = new Redis(redisConnection.connection);


const getExpiredHrs = (expiredDate: Date) => {
  const currentDate = new Date();

  // @ts-ignore
  const hrDiff = Math.floor(Math.abs(currentDate - expiredDate) / 36e5);
  // 36e5 => 60*60*1000
  return hrDiff;
};

const sleep = (sec: number) =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000));

const getExpiredInstance = async () => {
  try {
    const [instnaces]: any = await pool.query(
      "SELECT i.id, i.status, p.id AS ip_id, up.id AS plan_id, up.expires_at FROM instances i INNER JOIN ip_addresses p ON i.address_id=p.id INNER JOIN user_plans up ON i.user_plan_id=up.id",
    );

    const expiredInstnaceList: any = [];

    for (const instance of instnaces) {
      const expired: boolean = isExpired(instance.expires_at);
      if (expired) {
        expiredInstnaceList.push(instance);
      }
    }

    return expiredInstnaceList;
  } catch (error) {
    throw new Error("Can not get expired instances");
  }
};

const stopInstance = async (instanceId: string) => {
  try {
    // call lxd agent to stop instance
    const instanceStopReq = await fetch(
      `${process.env.LXD_AGENT_SERVER}/api/v1/instance/${instanceId}/stop`,
      { method: "PUT" },
    );

    if (!(instanceStopReq.status == 200)) {
      throw new Error("can not stop instance");
    }
  } catch (error: any) {
    throw new Error("can not stop instance", error);
  }
};

const stopExpiredIstances = async () => {
  // get all expired instances
  const list: any = await getExpiredInstance();

  if (list.length > 0) {
    // stop instance
    for (const instance of list) {
      await stopInstance(instance.id);
    }
  }
};

const sendTODeletionQueue = async (instance: any) => {
  const queueData: any = {
    name: instance.id,
    operation: "delete",
    instanceIPID: instance.ip_id,
    planId: instance.plan_id,
  };

  // sends to lifecycle queue
  const queueReq = await lifecycleQueue(queueData);

  if (queueReq === "waiting" || queueReq === "active") {
    return;
  } else {
    // log error
    throw new Error("Error deleting instance from redis side");
  }
};

const removeExpiredInstance = async () => {
  // get all expired instances
  const list: any = await getExpiredInstance();

  // remove instance if plan expired more than 48 hrs
  if (list.length > 0) {
    for (const instance of list) {
      const hours: number = getExpiredHrs(instance.expires_at);
      if (hours > 42) {
        // remove instance
        await sendTODeletionQueue(instance);
      }
    }
  }
};

const expiryWorker = async () => {
  try {
    // stop expired instnaces
    await stopExpiredIstances();

    // remove expired instances in age is > 48 hrs
    await removeExpiredInstance();
  } catch (error: any) {
    console.log("Error", error.message);
  }
};

const sendHealthStatus = async () => {
  const payload = {
    status: "OK",
    lastCheck: Date.now(),
  };
  await redis.set(
    "health:workers:expiry-worker",
    JSON.stringify(payload),
    "EX",
    25,
  );
};

while (true) {
  await sendHealthStatus();
  await expiryWorker();
  await sleep(10);
}
