import { Request, Response } from "express";
import send from "../utils/response/response.js";
import { pool } from "../../lib/db.js";
import { v4 as uuidv4 } from "uuid";
import { validateVMName } from "../utils/validators/index.js";
import { logger } from "../../lib/logger.utils.js";
import { instanceData } from "../interface/InstanceData.js";
import { provisioningQueue } from "../queues/instance/provisioning.queue.js";
import { lifecycleQueue } from "../queues/instance/lifecycle.queue.js";
import { lifecycleQueueData } from "../interface/lifecycleQueueData.js";
import {Redis} from "ioredis";
import { redisConnection } from "../../lib/redis.js";

interface customRequest extends Request {
  id?: string;
}

export const allVMs = async (req: customRequest, res: Response) => {
  try {
    const userId = req.id;

    const [vm]: any = await pool.query(
      "SELECT i.id, i.name, i.description, i.status, m.full_name AS image, p.ip, r.name AS region_name, r.code AS region_code, up.expires_at, pl.name AS plan, pl.vCPU, pl.memory, pl.storage, pl.backups FROM instances i INNER JOIN ip_addresses p ON i.address_id=p.id INNER JOIN images m ON i.image_id=m.id INNER JOIN regions r ON i.region_id=r.id INNER JOIN user_plans up ON i.user_plan_id=up.id INNER JOIN plans pl ON up.plan_id=pl.id WHERE i.user_id=?",
      [userId],
    );

    if (vm.length != 0) {
      send.ok(res, "", vm);
    } else {
      send.notFound(res, "No VM Found.");
    }
  } catch (error) {
    logger.log("instance", {
      ip: req.ip,
      message: `Internal error`,
      type: "error",
      route: "GET /vms",
    });

    send.internalError(res);
  }
};

export const getVM = async (req: customRequest, res: Response) => {
  try {
    const userId = req.id;
    const vmName = req.params.vmId;

    const [vm]: any = await pool.query(
      "SELECT i.id, i.name, i.description, i.status, m.full_name AS image, p.ip, r.name AS region_name, r.code AS region_code, up.expires_at, pl.name AS plan, pl.vCPU, pl.memory, pl.storage, pl.backups FROM instances i INNER JOIN ip_addresses p ON i.address_id=p.id INNER JOIN images m ON i.image_id=m.id INNER JOIN regions r ON i.region_id=r.id INNER JOIN user_plans up ON i.user_plan_id=up.id INNER JOIN plans pl ON up.plan_id=pl.id WHERE i.name=? AND i.user_id=?",
      [vmName, userId],
    );

    if (vm.length != 0) {
      send.ok(res, "", vm[0]);
    } else {
      send.notFound(res, "VM not found by this name.");
    }
  } catch (error) {
    logger.log("instance", {
      ip: req.ip,
      message: `Internal error`,
      type: "error",
      route: "GET /vms/:vmId",
    });

    send.internalError(res);
  }
};

export const createVM = async (req: customRequest, res: Response) => {
  try {
    const redis = new Redis(redisConnection.connection)
    const { vmName, vmDescription, rootPassword, planId } = req.body; // gets user's subscribed plan ID

    const isVailedVMName = validateVMName(vmName); // checks if VM Name is vailed (eg, db01.prateek.inc, staging-server-prateek-labs)or not

    if (!isVailedVMName) {
      logger.log("instance", {
        ip: req.ip,
        message: `[validator]: Failed vm name check`,
        type: "error",
        route: "POST /vms",
        userId: req.id,
      });

      send.badRequest(res, "Enter vailed VM Name"); // sends error is VM name is not vailed
    } else {
      if (rootPassword == undefined || rootPassword.length <= 0) {
        logger.log("instance", {
          ip: req.ip,
          message: `[validator]: Failed vm password check`,
          type: "error",
          route: "POST /vms",
          userId: req.id,
        });

        // cheks root password exists
        send.badRequest(res, "Enter Root Password");
        return;
      }

      const userId: string | undefined = req.id; // gets user ID

      // gets user plan details
      const [plan, fields]: any = await pool.query(
        "SELECT u.in_use, u.expires_at, p.name, p.vCPU, p.memory, p.storage, p.backups FROM user_plans u INNER JOIN plans p ON u.plan_id=p.id WHERE u.id=? AND u.user_id=?",
        [planId, userId],
      );

      const currentDate = new Date();
      const expired: boolean = plan[0]?.expires_at <= currentDate;
      const inUse: boolean = plan[0]?.in_use === 1;

      // checks if plan exists
      if (plan.length != 0) {
        // check if plan is expired
        if (expired) {
          logger.log("instance", {
            ip: req.ip,
            message: `User trying to create VM with expired plan`,
            type: "error",
            route: "POST /vms",
            userId: req.id,
          });

          send.forbidden(res, "Plan Expired.");
        } else {
          // check if plan in use
          if (inUse) {
            logger.log("instance", {
              ip: req.ip,
              message: `User trying to create VM with plan already in use`,
              type: "error",
              route: "POST /vms",
              userId: req.id,
            });

            send.forbidden(
              res,
              "Instance is already initialized with this plan.",
            );
          } else {
            // generates VM's ID (stored as name in LXC/LXD and ID in DB)
            const vmID = `vm-${uuidv4()}`;

            // chcek if vm name is same or not
            const [vmExists]: any = await pool.query(
              "SELECT name FROM instances WHERE name=? AND user_id=?",
              [vmName, userId],
            );

            // sends conflict error if vm name is already thier
            if (vmExists.length != 0) {
              logger.log("instance", {
                ip: req.ip,
                message: `VM already initialized with given name`,
                type: "error",
                route: "POST /vms",
                userId: req.id,
              });

              send.conflict(res, "VM already exists with this name");
              return;
            }

            // gets available IP
            const [ip, fields]: any = await pool.query(
              "SELECT * FROM ip_addresses WHERE in_use=0 ORDER BY id ASC LIMIT 1",
            );

            const assignableIP = ip[0].ip;
            const assignableIPId = ip[0].id;

            // cheks if IP exists to assign to VM
            if (assignableIP == undefined) {
              logger.log("instance", {
                ip: req.ip,
                message: `Failed to create VM due to no assignable IP available`,
                type: "error",
                route: "POST /vms",
              });

              send.internalError(res); // No assignable IP Found
            } else {
              const vmData: instanceData = {
                id: vmID,
                vCPU: plan[0].vCPU,
                memory: plan[0].memory,
                storage: plan[0].storage,
                ipAddress: assignableIP,
                rootPassword: rootPassword,
              };

              // sends to provisioning queue
              const queueReq = await provisioningQueue(vmData);

              if (queueReq === "waiting" || queueReq === "active") {
                // set current ip in_use to true
                const [reserveIP, fields]: any = await pool.query(
                  "UPDATE ip_addresses SET in_use=1 WHERE id=?",
                  [assignableIPId],
                );

                // sets userPlan in_use section to true (restricts creating multiple VMs from one plan)
                const [userPlan, userPlanfields]: any = await pool.query(
                  "UPDATE user_plans set in_use=1 WHERE id=?",
                  planId,
                );

                // NOTE: images and region are not yet been implementaed so its not fuctional (image and region is decided by lxd_agent)

                const [instance, instanceFields]: any = await pool.query(
                  "INSERT INTO instances (id, name, description, status, image_id, address_id, user_id, user_plan_id, region_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                  [
                    vmID,
                    vmName,
                    vmDescription,
                    "provisioning",
                    1,
                    ip[0].id,
                    userId,
                    planId,
                    1,
                  ],
                );

                // cache VM to instnace-cache to recive instance state info
                await redis.set(`instance-cache:${vmID}`, userId || vmID, "EX", 86400 );

                logger.log("instance", {
                  ip: req.ip,
                  message: `Provisioning Instance`,
                  type: "success",
                  route: "POST /vms",
                  userId: req.id,
                });

                send.ok(res, "Provisioning Instance");
              } else {
                logger.log("instance", {
                  ip: req.ip,
                  message: `VM Provision failed`,
                  type: "error",
                  route: "POST /vms",
                  userId: req.id,
                });

                // error coz queue related problem
                send.internalError(res);
              }
            }
          }
        }
      } else {
        logger.log("instance", {
          ip: req.ip,
          message: `VM creation failed because plan not vailed`,
          type: "error",
          route: "POST /vms",
          userId: req.id,
        });

        send.notFound(res, "Plan does not exist.");
      }
    }
  } catch (error) {
    logger.log("instance", {
      ip: req.ip,
      message: `Internal error`,
      type: "error",
      route: "POST /vms",
    });

    send.internalError(res);
  }
};

export const startVM = async (req: customRequest, res: Response) => {
  try {
    const userId = req.id;
    const vmName = req.params.vmId;

    const [vmExists]: any = await pool.query(
      "SELECT id AS vm_id, name, status, user_plan_id FROM instances WHERE name=? AND user_id=?",
      [vmName, userId],
    );

    const planId = vmExists[0]?.user_plan_id;
    const vmStatus = vmExists[0]?.status;
    const vmId = vmExists[0]?.vm_id;

    if (vmExists.length != 0) {
      // gets plan from VM is provisioned
      const [plan]: any = await pool.query(
        "SELECT u.in_use, u.expires_at, p.name, p.vCPU, p.memory, p.storage, p.backups FROM user_plans u INNER JOIN plans p ON u.plan_id=p.id WHERE u.id=? AND u.user_id=?",
        [planId, userId],
      );

      const currentDate = new Date();
      const expired: boolean = plan[0]?.expires_at <= currentDate;

      // cheks if plan is expired
      if (expired) {
        logger.log("instance", {
          ip: req.ip,
          message: `Can not perform any action plan expired`,
          type: "error",
          route: "PUT /vms/:vmId/start",
          userId: req.id,
          vmId: vmId,
        });

        send.forbidden(res, "Can not perform any action plan expired.");
      } else {
        if (vmStatus === "running") {
          logger.log("instance", {
            ip: req.ip,
            message: `Can not start, VM already running`,
            type: "info",
            route: "PUT /vms/:vmId/start",
            userId: req.id,
            vmId: vmId,
          });

          send.badRequest(res, "VM is already Running.");
        } else {
          // data required by queue
          const queueData: lifecycleQueueData = {
            name: vmId,
            operation: "start",
          };

          // sends to lifecycle queue
          const queueReq = await lifecycleQueue(queueData);

          if (queueReq === "waiting" || queueReq === "active") {
            logger.log("instance", {
              ip: req.ip,
              message: `Starting VM`,
              type: "info",
              route: "PUT /vms/:vmId/start",
              userId: req.id,
              vmId: vmId,
            });

            send.ok(res, "Starting VM");
          } else {
            logger.log("instance", {
              ip: req.ip,
              message: `Internal error`,
              type: "error",
              route: "PUT /vms/:vmId/start",
            });

            send.internalError(res);
          }
        }
      }
    } else {
      logger.log("instance", {
        ip: req.ip,
        message: `No VM Found by the name ${vmName}`,
        type: "info",
        route: "PUT /vms/:vmId/start",
        userId: req.id,
      });

      send.notFound(res, "VM not found");
    }
  } catch (error) {
    logger.log("instance", {
      ip: req.ip,
      message: `Internal error`,
      type: "error",
      route: "POST /vms",
    });

    send.internalError(res);
  }
};

export const stoptVM = async (req: customRequest, res: Response) => {
  try {
    const userId = req.id;
    const vmName = req.params.vmId;

    const [vmExists]: any = await pool.query(
      "SELECT id AS vm_id, name, status, user_plan_id FROM instances WHERE name=? AND user_id=?",
      [vmName, userId],
    );

    const planId = vmExists[0]?.user_plan_id;
    const vmStatus = vmExists[0]?.status;
    const vmId = vmExists[0]?.vm_id;

    if (vmExists.length != 0) {
      // gets plan from VM is provisioned
      const [plan]: any = await pool.query(
        "SELECT u.in_use, u.expires_at, p.name, p.vCPU, p.memory, p.storage, p.backups FROM user_plans u INNER JOIN plans p ON u.plan_id=p.id WHERE u.id=? AND u.user_id=?",
        [planId, userId],
      );

      const currentDate = new Date();
      const expired: boolean = plan[0]?.expires_at <= currentDate;

      // cheks if plan is expired
      if (expired) {
        logger.log("instance", {
          ip: req.ip,
          message: `Can not perform any action plan expired`,
          type: "error",
          route: "PUT /vms/:vmId/stop",
          userId: req.id,
          vmId: vmId,
        });

        send.forbidden(res, "Can not perform any action plan expired.");
      } else {
        if (vmStatus === "stopped") {
          logger.log("instance", {
            ip: req.ip,
            message: `Can not stop VM, already Stopped`,
            type: "info",
            route: "PUT /vms/:vmId/stop",
            userId: req.id,
            vmId: vmId,
          });

          send.badRequest(res, "VM is already Stopped.");
        } else {
          // data required by queue
          const queueData: lifecycleQueueData = {
            name: vmId,
            operation: "stop",
          };

          // sends to lifecycle queue
          const queueReq = await lifecycleQueue(queueData);

          if (queueReq === "waiting" || queueReq === "active") {
            logger.log("instance", {
              ip: req.ip,
              message: `Stoppping VM`,
              type: "info",
              route: "PUT /vms/:vmId/stop",
              userId: req.id,
              vmId: vmId,
            });

            send.ok(res, "Stopping VM.");
          } else {
            logger.log("instance", {
              ip: req.ip,
              message: `Internal error`,
              type: "error",
              route: "PUT /vms/:vmId/stop",
            });
            send.internalError(res);
          }
        }
      }
    } else {
      logger.log("instance", {
        ip: req.ip,
        message: `Vm not found by name ${vmName}`,
        type: "info",
        route: "PUT /vms/:vmId/stop",
        userId: req.id,
      });

      send.notFound(res, "VM not found");
    }
  } catch (error) {
    logger.log("instance", {
      ip: req.ip,
      message: `Internal error`,
      type: "error",
      route: "PUT /vms/:vmId/stop",
    });

    send.internalError(res);
  }
};

export const restartVM = async (req: customRequest, res: Response) => {
  try {
    const userId = req.id;
    const vmName = req.params.vmId;

    const [vmExists]: any = await pool.query(
      "SELECT id AS vm_id, name, status, user_plan_id FROM instances WHERE name=? AND user_id=?",
      [vmName, userId],
    );

    const planId = vmExists[0]?.user_plan_id;
    const vmStatus = vmExists[0]?.status;
    const vmId = vmExists[0]?.vm_id;

    if (vmExists.length != 0) {
      // gets plan from VM is provisioned
      const [plan]: any = await pool.query(
        "SELECT u.in_use, u.expires_at, p.name, p.vCPU, p.memory, p.storage, p.backups FROM user_plans u INNER JOIN plans p ON u.plan_id=p.id WHERE u.id=? AND u.user_id=?",
        [planId, userId],
      );

      const currentDate = new Date();
      const expired: boolean = plan[0]?.expires_at <= currentDate;

      // cheks if plan is expired
      if (expired) {
        logger.log("instance", {
          ip: req.ip,
          message: `Can not perform any action plan expired`,
          type: "error",
          route: "PUT /vms/:vmId/restart",
          userId: req.id,
          vmId: vmId,
        });

        send.forbidden(res, "Can not perform any action plan expired.");
      } else {
        if (vmStatus === "stopped") {
          logger.log("instance", {
            ip: req.ip,
            message: `Cannot restart VM, VM not running`,
            type: "info",
            route: "PUT /vms/:vmId/restart",
            userId: req.id,
            vmId: vmId,
          });

          send.badRequest(res, "VM is not Running.");
        } else {
          // data required by queue
          const queueData: lifecycleQueueData = {
            name: vmId,
            operation: "restart",
          };

          // sends to lifecycle queue
          const queueReq = await lifecycleQueue(queueData);

          if (queueReq === "waiting" || queueReq === "active") {
            logger.log("instance", {
              ip: req.ip,
              message: `Restarting VM`,
              type: "info",
              route: "PUT /vms/:vmId/restart",
              userId: req.id,
              vmId: vmId,
            });

            send.ok(res, "VM is restarting.");
          } else {
            logger.log("instance", {
              ip: req.ip,
              message: `Internal error`,
              type: "error",
              route: "PUT /vms/:vmId/restart",
            });

            send.internalError(res);
          }
        }
      }
    } else {
      logger.log("instance", {
        ip: req.ip,
        message: `VM not found by the name ${vmName}`,
        type: "error",
        route: "PUT /vms/:vmId/restart",
        userId: req.id,
      });

      send.notFound(res, "VM not found");
    }
  } catch (error) {
    logger.log("instance", {
      ip: req.ip,
      message: `Internal error`,
      type: "error",
      route: "PUT /vms/:vmId/restart",
    });

    send.internalError(res);
  }
};

export const destroyVM = async (req: customRequest, res: Response) => {
  try {
    const userId = req.id;
    const vmName = req.params.vmId;

    const [vmExists]: any = await pool.query(
      "SELECT i.id AS vm_id, p.id AS ip_id, i.name, i.status, p.ip, i.user_plan_id FROM instances i INNER JOIN ip_addresses p ON i.address_id=p.id WHERE i.name=? AND i.user_id=?",
      [vmName, userId],
    );

    const planId = vmExists[0]?.user_plan_id;
    const vmStatus = vmExists[0]?.status;
    const vmId = vmExists[0]?.vm_id;
    const vmIPId = vmExists[0]?.ip_id;

    if (vmExists.length != 0) {
      // gets plan from VM is provisioned
      const [plan]: any = await pool.query(
        "SELECT u.in_use, u.expires_at, p.name, p.vCPU, p.memory, p.storage, p.backups FROM user_plans u INNER JOIN plans p ON u.plan_id=p.id WHERE u.id=? AND u.user_id=?",
        [planId, userId],
      );

      const currentDate = new Date();
      const expired: boolean = plan[0]?.expires_at <= currentDate;

      // cheks if plan is expired
      if (expired) {
        logger.log("instance", {
          ip: req.ip,
          message: `Can not perform any action plan expired.`,
          type: "error",
          route: "DELETE /vms/:vmId",
          userId: req.id,
          vmId: vmId,
        });

        send.forbidden(res, "Can not perform any action plan expired.");
      } else {
        if (vmStatus !== "stopped") {
          logger.log("instance", {
            ip: req.ip,
            message: `Cannot destroy VM while running, Stop VM`,
            type: "info",
            route: "DELETE /vms/:vmId",
            userId: req.id,
            vmId: vmId,
          });

          send.badRequest(res, "Stop the VM first");
        } else {
          // data required by queue
          const queueData: lifecycleQueueData = {
            name: vmId,
            operation: "delete",
            instanceIPID: vmIPId,
            planId: planId,
          };

          // sends to lifecycle queue
          const queueReq = await lifecycleQueue(queueData);

          if (queueReq === "waiting" || queueReq === "active") {
            logger.log("instance", {
              ip: req.ip,
              message: `deleting vm`,
              type: "info",
              route: "DELETE /vms/:vmId",
              userId: req.id,
              vmId: vmId,
            });

            send.ok(res, "deleting vm.");
          } else {
            logger.log("instance", {
              ip: req.ip,
              message: `Internal error`,
              type: "error",
              route: "DELETE /vms/:vmId",
            });
            send.internalError(res);
          }
        }
      }
    } else {
      logger.log("instance", {
        ip: req.ip,
        message: `VM not found by the name ${vmName}`,
        type: "error",
        route: "DELETE /vms/:vmId",
      });

      send.notFound(res, "VM not found");
    }
  } catch (error) {
    logger.log("instance", {
      ip: req.ip,
      message: `Internal error`,
      type: "error",
      route: "DELETE /vms/:vmId",
    });

    send.internalError(res);
  }
};
