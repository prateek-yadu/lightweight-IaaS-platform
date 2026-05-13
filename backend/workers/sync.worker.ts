import { config } from "dotenv";
import { pool } from "../lib/db.js";
import { lifecycleQueue } from "../server/queues/instance/lifecycle.queue.js";
import { Redis } from "ioredis";
import { redisConnection } from "../lib/redis.js";

config({ path: "../.env" });

const redis = new Redis(redisConnection.connection);

const sleep = (sec: number) =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000));

const getMins = (date: Date) => {
  const currentDate = new Date();

  // @ts-ignore
  const minDiff = Math.floor(Math.abs(currentDate - date) / (1000 * 60));

  return minDiff;
};

const instnaceFromServer = async () => {
  try {
    const req: any = await fetch(
      `${process.env.LXD_AGENT_SERVER}/api/v1/instance`,
    );

    if (req.status === 200) {
      const data = await req.json();

      const instances = new Map();

      for (const instance of data.data.metadata) {
        instances.set(instance.name, JSON.stringify(instance));
      }
      return instances;
    } else {
      // log error
      console.log("Something went wrong");
    }
  } catch (error) {
    throw new Error("failed to fetch instance list from server");
  }
};

const instnaceFromDB = async () => {
  try {
    const [allInstance]: any = await pool.query(
      "SELECT i.id, i.status, i.created_at, p.id AS ip_id, up.id AS plan_id FROM instances i INNER JOIN ip_addresses p ON i.address_id=p.id INNER JOIN user_plans up ON i.user_plan_id=up.id",
    );

    const instances = new Map();

    if (allInstance.length > 0) {
      for (const instance of allInstance) {
        instances.set(instance.id, JSON.stringify(instance));
      }
    }
    return instances;
  } catch (error) {
    throw new Error("failed to fetch instance list from database");
  }
};

const sendTODeletionQueue = async (instance: any) => {
  try {
    // store instance info
    const planId = instance.plan_id;
    const vmId = instance.id;
    const vmIPId = instance.ip_id;

    // send data to queue for deletiong
    const queueData: any = {
      name: vmId,
      operation: "delete",
      instanceIPID: vmIPId,
      planId: planId,
    };

    // sends to lifecycle queue
    const queueReq = await lifecycleQueue(queueData);

    if (queueReq === "waiting" || queueReq === "active") {
      return;
    } else {
      throw new Error("Error deleting instance");
    }
  } catch (error) {
    throw new Error("Error deleting instance");
  }
};

const syncState = async (dbList: any, serverList: any) => {
  // sync
  for (const instance of dbList) {
    const parsedDBData = await JSON.parse(instance[1]);

    // checks if instance exists on server
    if (serverList.get(instance[0])) {
      const parsedServerData = await JSON.parse(serverList.get(instance[0]));

      const statusInDB = parsedDBData.status;
      const statusInServer = parsedServerData.status.toLowerCase();

      if (statusInDB !== statusInServer) {
        // update state in db
        const [updateStateInDB]: any = await pool.query(
          "UPDATE instances SET status=? WHERE id=?",
          [statusInServer, instance[0]],
        );
      }
    } else {
      // executes when records does not exists on server
      // remove records from db

      // gets instance created hours before
      const createdMins = getMins(new Date(parsedDBData.created_at));

      // check if instance created_at is < 1 hr or not
      if (createdMins > 15) {
        await sendTODeletionQueue(parsedDBData); // else
      }
    }
  }
};

const stopInstance = async (instanceId: string) => {
  const instanceOperationReq: any = await (
    await fetch(
      `${process.env.LXD_AGENT_SERVER}/api/v1/instance/${instanceId}/stop`,
      { method: "PUT" },
    )
  ).json();
};

const deleteInstance = async (instance: any) => {
  try {
    if (instance.status.toLowerCase() === "stopped") {
      // call lxd agent and remove instance
      const instanceDeletetionReq: any = await (
        await fetch(`${process.env.LXD_AGENT_SERVER}/api/v1/instance`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: instance.name }),
        })
      ).json();

      if (instanceDeletetionReq.status !== 200) {
        throw new Error("LXD can not create operation");
      } else {
        // logo deleted instance
        console.log(`deleted instance: ${instance.name}`);
      }
    } else {
      // stop instance -> will be deleted next time worker runs
      await stopInstance(instance.name);
    }
  } catch (error: any) {
    // log error
    console.log(error);
    console.log("can not delete instance");
  }
};

const removeGhost = async (dbList: any, serverList: any) => {
  try {
    for (const instance of serverList) {
      if (!dbList.get(instance[0])) {
        const parsedServerData = await JSON.parse(instance[1]);

        // check if instance created date is > 1 hrs
        const createdMins = getMins(new Date(parsedServerData.created_at));

        if (createdMins > 15) {
          await deleteInstance(parsedServerData);
        }
      }
    }
  } catch (error) {
    throw new Error("error removing ghost instance");
  }
};

const syncWorker = async () => {
  // calls server instnace list
  const dbList: any = await instnaceFromDB();

  // calls db instnace list
  const serverList: any = await instnaceFromServer();

  // syncs instnace state b/w server and db
  if (dbList?.size > 0) {
    await syncState(dbList, serverList);
  }

  if (serverList?.size > 0) {
    await removeGhost(dbList, serverList);
  }
};

const sendHealthStatus = async () => {
  const payload = {
    status: "OK",
    lastCheck: Date.now(),
  };
  await redis.set(
    "health:workers:sync-worker",
    JSON.stringify(payload),
    "EX",
    25,
  );
};

while (true) {
  await sendHealthStatus();
  await syncWorker();
  await sleep(10);
}
