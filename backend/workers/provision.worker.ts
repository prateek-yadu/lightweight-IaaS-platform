import { config } from "dotenv";
import { Job, Worker } from "bullmq";
import { redisConnection } from "../lib/redis";

config({ path: "../.env" });

const worker = new Worker(process.env.REDIS_QUEUE_NAME || '', async (job: Job) => {

    try {

        // will call lxd api to creare instance
        const createInstance: any = await (await fetch(`${process.env.LXD_AGENT_SERVER}/api/v1/instance`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(job.data)
        })).json();

        if (createInstance.status !== 100) {
            throw new Error("Instance creation failed");
        }

    } catch (error: any) {
        throw new Error("Instance creation failed, Reason:", error);
    }

}, redisConnection);