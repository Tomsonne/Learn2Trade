import { Router } from 'express'
import marketRoutes from './market.routes.js'
import authRoutes from "./auth.routes.js";

const router = Router()
router.use(marketRoutes) // prix et forex
router.use("/auth", authRoutes);

export default router
