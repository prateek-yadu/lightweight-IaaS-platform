import { pool } from "../lib/db.js";
import { isExpired } from "../server/utils/validators/planValidators.js";



const sleep = (sec: number) =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000));

const getExpiredInstance = async () => {
  try {
    const [instnaces]: any = await pool.query(
      "SELECT i.id, i.name, i.description, i.status, m.full_name AS image, p.ip, r.name AS region_name, r.code AS region_code, up.expires_at, pl.name AS plan, pl.vCPU, pl.memory, pl.storage, pl.backups FROM instances i INNER JOIN ip_addresses p ON i.address_id=p.id INNER JOIN images m ON i.image_id=m.id INNER JOIN regions r ON i.region_id=r.id INNER JOIN user_plans up ON i.user_plan_id=up.id INNER JOIN plans pl ON up.plan_id=pl.id",
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

    if(!(instanceStopReq.status == 200)){
        throw new Error("can not stop instance")
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
      stopInstance(instance.id);
    }
  }
};

const expiryWorker = async () => {
  try {
    // stop expired instnaces
    await stopExpiredIstances();

    // remove expired instances in age is > 48 hrs
  } catch (error: any) {
    console.log("Error", error.message);
  }
};

while (true) {
  await expiryWorker();
  await sleep(10);
}
