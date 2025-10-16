import { Router } from "express";
import * as assetController from "../controllers/asset.controller.js";

const router = Router();

router.get("/", assetController.getAllAssets);

export default router;
