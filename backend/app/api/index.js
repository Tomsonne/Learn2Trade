import { Router } from 'express'
import marketRoutes from './market.routes.js'

const router = Router()
// monte les routes sous /api/v1/market/
router.use('/market', marketRoutes) // prix et forex ohlc marketchartrange

export default router
