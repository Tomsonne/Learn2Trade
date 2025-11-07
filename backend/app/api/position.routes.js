// app/api/position.route.js
import { Router } from "express";
import { listPositionsWithMarket } from "../services/position.service.js";

const router = Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.get("/", async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId requis" });
    if (!UUID_RE.test(userId)) return res.status(400).json({ error: "userId invalide (UUID attendu)" });

    const data = await listPositionsWithMarket(userId);
    res.json({ data });
  } catch (e) { next(e); }
});

export default router;
