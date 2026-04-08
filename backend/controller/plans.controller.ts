import { Request, Response } from "express";
import send from "../utils/response/response.js";
import { pool } from "../db/config.js";
import { v4 as uuidv4 } from 'uuid';
import { logger } from "../utils/logger/logger.utils.js";

interface customRequest extends Request {
    id?: string;
}

export const Plans = async (req: Request, res: Response) => {

    try {
        // gets all plan information 
        const [plans, fields]: any = await pool.query('SELECT id, name, description, price, vCPU, memory, storage, backups, validity_days FROM plans');

        send.ok(res, "", plans);

    } catch (error) {
        logger.log("billing", { ip: req.ip, message: `Internal server error`, type: "error", route: "GET /plans" });
        send.internalError(res);
    }
};

export const purchasePlan = async (req: customRequest, res: Response) => {

    try {
        const planId: string = req.params.id.toString(); // gets Plan ID

        const [plan, fields]: any = await pool.query('SELECT name, validity_days FROM plans WHERE id = ?', [planId]); // gets requested plan

        if (plan.length != 0) {
            const userId = req.id; // gets userId
            const userPlanTableId = uuidv4(); // generates ID for user_plan Table 
            const planValidity = plan[0].validity_days;

            const [userPlan, fields]: any = await pool.query("INSERT INTO user_plans (id, user_id, plan_id, expires_at) VALUES (?, ?, ?, (SELECT DATE_ADD((SELECT NOW()), INTERVAL ? DAY)))", [userPlanTableId, userId, planId, planValidity]);

            logger.log("billing", { ip: req.ip, message: `Plan purchased successfully`, type: "success", route: "POST /:id/purchase", userId: req.id });
            send.ok(res, "Plan Purchased Successfully.");
        } else {

            logger.log("billing", { ip: req.ip, message: `Trying to Purchase non-existing plan`, type: "error", route: "POST /:id/purchase", userId: req.id });
            send.notFound(res, "Plan Not Found.");
        }

    } catch (error) {
        logger.log("billing", { ip: req.ip, message: `Internal server error`, type: "error", route: "POST /:id/purchase" });
        send.internalError(res);
    }

};