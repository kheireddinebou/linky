import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { httpGetUserData } from "./user.controller.js";

const router = Router();

router.get("/getUserData", authenticate, httpGetUserData);

export default router;
