import { Router } from 'express'
import marketRoutes from './market.routes.js'

const router = Router()
router.use(marketRoutes) // prix et forex

export default router
