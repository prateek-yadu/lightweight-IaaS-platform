import { Router } from "express";
import { me, RenewSubscribedPlan, subscribedPlans } from "../../controller/me.controller.js";

const router = Router();

router.get("/me", me);

// user subscribed plans 
router.get("/me/plans", subscribedPlans);

// renew user subscribed plan 
router.post("/me/plans/:id/renew", RenewSubscribedPlan);

export default router;