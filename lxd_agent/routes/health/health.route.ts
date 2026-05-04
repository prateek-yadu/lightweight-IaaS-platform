import { Router } from "express"
import { deepHealth, shallowHealth } from "../../controller/health.controller.js";

const router = Router();

router.get("/", shallowHealth);

router.get("/detail", deepHealth);
// router.get("/", deepHealth);

export default router;
