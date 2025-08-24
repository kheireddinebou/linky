import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import {
  httpCreateUrl,
  httpDeleteUrl,
  httpGetUrl,
  httpGetUrls,
  httpUpdateUrl,
} from "./url.controller";

const router = Router();

router.post("/", authenticate, httpCreateUrl);
router.get("/", authenticate, httpGetUrls);
router.get("/:id", authenticate, httpGetUrl);
router.put("/:id", authenticate, httpUpdateUrl);
router.delete("/:id", authenticate, httpDeleteUrl);

export default router;
