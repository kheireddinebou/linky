import { Router } from "express";
import { httpLogin, httpRegisterWithEmail } from "./auth.controller.js";

const router = Router();

router.post("/register", httpRegisterWithEmail);
router.post("/login", httpLogin);

export default router;
