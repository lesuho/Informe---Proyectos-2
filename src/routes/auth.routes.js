import { Router } from "express";
import { register, login, logout, verifyToken } from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify", verifyToken);

export default router;