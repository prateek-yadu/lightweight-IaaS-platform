import { Queue } from "bullmq";
import { instanceData } from "../../types/InstanceData.js";
import { connection } from "../queue.config.js";

// creates new queue
const queue = new Queue("provision_instance", connection);

// init queue
export const provisioningQueue = async (instance: instanceData) => {
    let res = await queue.add(`create-instance-${instance.id}`, instance, {
        removeOnComplete: true
    });

    return res.getState();
};