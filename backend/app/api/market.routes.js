import { Router } from 'express'
import { getPrices, getForex } from '../services/market.service.js'
const router = Router()
router.get('/prices', async (req, res) => {
  try {
    res.json({ status: 'ok', data: await getPrices() })
  } catch (e) {
    res.status(503).json({ status:'error', error:{code:'UPSTREAM_DOWN', message:String(e.message||e)}})
  }
})
router.get('/forex', async (req, res) => {
  try { res.json({ status: 'ok', data: await getForex() })}
  catch (e) {res.status(503).json({ status:'error', error:{ code:'UPSTREAM_DOWN', message:String(e.message||e)}})}
})
export default router
