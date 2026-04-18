import { config } from "dotenv";
import { Job, Worker } from "bullmq";
// @ts-ignore
import { redisConnection } from "../lib/redis.ts";
// @ts-ignore
import { pool } from "../lib/db.ts";

config({ path: "../.env" });

const worker = new Worker(process.env.REDIS_LIFECYCLE_QUEUE || '', async (job: Job) => {

    try {


        switch (job.data.operation) {
            case "start":
            case "stop":
            case "restart":

                // gets instance
                const getInstanceInfo: any = await (await fetch(`${process.env.LXD_AGENT_SERVER}/api/v1/instance/${job.data.name}`, {
                    method: "GET"
                })).json();

                // performs operation if instance exists
                if (getInstanceInfo.status === 200) {

                    // if status is already set as operation then, skip # TODO
                    // do a req, if already in thet state skip # TODO

                    // req to change instance state
                    const instanceOperationReq: any = await (await fetch(`${process.env.LXD_AGENT_SERVER}/api/v1/instance/${job.data.name}/${job.data.operation}`, { method: "PUT" })).json();

                    if (job.data.operation === "restart") {
                        // update status to restarting
                        const [setStatusToRestarting]: any = await pool.query('UPDATE instances SET status=? WHERE id=?', ["restarting", job.data.name]);
                    }

                    if (job.data.operation === "start") {
                        // update status to starting
                        const [setStatusToStarting]: any = await pool.query('UPDATE instances SET status=? WHERE id=?', ["starting", job.data.name]);
                    }

                    if (job.data.operation === "stop") {
                        // update status to stopping
                        const [setStatusToStopping]: any = await pool.query('UPDATE instances SET status=? WHERE id=?', ["stopping", job.data.name]);
                    }

                    if (instanceOperationReq.status !== 200) {
                        throw new Error("Operation failed");
                    }
                } else {
                    throw new Error(`Instance not present to perform ${job.data.operation} operation`);
                }

                break;

            case "delete":

                // gets instance
                const getInstanceReq: any = await (await fetch(`${process.env.LXD_AGENT_SERVER}/api/v1/instance/${job.data.name}`, {
                    method: "GET"
                })).json();

                if (getInstanceReq.status === 404) {
                    // cleanup

                    // delete data from instance table
                    const [deleteInstance]: any = await pool.query('DELETE FROM instances WHERE id=?', [job.data.name]);

                    // release user plan from in_use
                    const [releaseUserPlan]: any = await pool.query('UPDATE user_plans SET in_use=0 WHERE id=?', [job.data.planId]);

                    // release reserved IP
                    const [releaseIP]: any = await pool.query('UPDATE ip_addresses SET in_use=0 WHERE id=?', [job.data.instanceIPID]);

                } else {

                    // --- ignore when retry

                    if (job.attemptsMade < 1) {
                        // send data to lxd agent to delete instance
                        const instanceDeletetionReq: any = await (await fetch(`${process.env.LXD_AGENT_SERVER}/api/v1/instance`, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ id: job.data.name })
                        })).json();

                        if (instanceDeletetionReq.status !== 200) {
                            throw new Error("LXD can not create operation");
                        }

                        // update status to deleting
                        const [setStatusToDeleting]: any = await pool.query('UPDATE instances SET status=? WHERE id=?', ["deleting", job.data.name]);

                    }

                    // ---

                    throw new Error("delete operation success, retrying for database clean up");

                }

                break;
        }



    } catch (error: any) {
        throw new Error("Instance creation failed, Reason:", error);
    }

}, redisConnection);