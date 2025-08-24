import { Router } from "express";
import { httpRedirectToOriginalUrl } from "./redirects.controller.js";

const router = Router();

router.get("/:shortCode", httpRedirectToOriginalUrl);

export default router;
