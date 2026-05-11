import { config } from "dotenv";
import { pool } from "../lib/db.js";
import { lifecycleQueue } from "../server/queues/instance/lifecycle.queue.js";
import { Redis } from "ioredis";

config({ path: "../.env" });

const redis = new Redis();

const sleep = (sec: number) =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000));

const getAllInstanceFromServer = async () => {
  try {
    const req: any = await fetch(
      `${process.env.LXD_AGENT_SERVER}/api/v1/instance`,
    );

    if (req.status === 200) {
      const data = await req.json();

      const instances = new Map();

      for (const instance of data.data.metadata) {
        instances.set(instance.name, instance.status.toLowerCase());
      }
      return instances;
    } else {
      // log error
      console.log("Something went wrong");
    }
  } catch (error: any) {
    // log error
    console.log(error.message);
  }
};

const getAllInstanceFromDB = async () => {
  try {
    const [allInstance]: any = await pool.query(
      "SELECT id, status FROM instances",
    );
    const instances = new Map();

    if (allInstance.length > 0) {
      for (const instance of allInstance) {
        instances.set(instance.id, instance.status.toLowerCase());
      }
    }
    return instances;
  } catch (error: any) {
    // log error
    console.log(error.message);
  }
};

const sendToDeleteQueue = async (instanceId: string) => {
  try {
    // get instance info
    const [instanceInfo]: any = await pool.query(
      "SELECT i.id AS vm_id, p.id AS ip_id, i.name, i.user_id, i.status, p.ip, i.user_plan_id FROM instances i INNER JOIN ip_addresses p ON i.address_id=p.id WHERE i.id=?",
      [instanceId],
    );

    if (instanceInfo.length != 0) {
      // store user info
      const planId = instanceInfo[0]?.user_plan_id;
      const vmId = instanceInfo[0]?.vm_id;
      const vmIPId = instanceInfo[0]?.ip_id;

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
        // log error
        console.log("Error deleting instance from redis side");
        return;
      }
    }
  } catch (error: any) {
    // log error
    console.log(error.message);
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

const deleteInstance = async (instanceId: string, instanceStatus: string) => {
  try {
    if (instanceStatus === "stopped") {
      // call lxd agent and remove instance
      const instanceDeletetionReq: any = await (
        await fetch(`${process.env.LXD_AGENT_SERVER}/api/v1/instance`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: instanceId }),
        })
      ).json();

      if (instanceDeletetionReq.status !== 200) {
        throw new Error("LXD can not create operation");
      } else {
        // logo deleted instance
        console.log(`deleted instance: ${instanceId}`);
      }
    } else {
      // stop instance -> will be deleted next time worker runs
      await stopInstance(instanceId);
    }
  } catch (error: any) {
    // log error
    console.log(error);
    console.log("can not delete instance");
  }
};

const syncInstnaceState = async (
  instanceRecordFromDB: any,
  instanceRecordFromServer: any,
) => {
  for (const instance of instanceRecordFromDB) {
    // checks if instance exists on server
    if (instanceRecordFromServer.get(instance[0])) {
      const statusInDB = instance[1];
      const statusInServer = instanceRecordFromServer.get(instance[0]);

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
      await sendToDeleteQueue(instance[0]);
    }
  }
};

const removeGhotInstnace = async (
  instanceRecordFromDB: any,
  instanceRecordFromServer: any,
) => {
  for (const instance of instanceRecordFromServer) {
    if (!instanceRecordFromDB.get(instance[0])) {
      await deleteInstance(instance[0], instance[1]);
    }
  }
};

const syncWorker = async () => {
  try {
    // fetch all instance list from server
    const instnaceFromServer: any = await getAllInstanceFromServer();

    // fetch all instance list from db
    const instnaceFromDB: any = await getAllInstanceFromDB();

    if (instnaceFromDB?.size > 0) {
      await syncInstnaceState(instnaceFromDB, instnaceFromServer);
    }

    if (instnaceFromServer?.size > 0) {
      await removeGhotInstnace(instnaceFromDB, instnaceFromServer);
    }
  } catch (error: any) {
    // log error
    console.log(error.message);
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
  sendHealthStatus();
  syncWorker();
  await sleep(10);
}
