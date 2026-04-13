import { Router } from "express";
import { Login, Logout, Register, Validate } from "../../controller/auth.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post('/login', Login);

router.post('/logout', Logout);

router.post('/register', Register);

router.post('/validate', authMiddleware, Validate);


export default router;