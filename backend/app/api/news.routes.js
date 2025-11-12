import { Router } from 'express';
import { refreshCoinDesk, getNews } from '../controllers/news.controller.js';

const router = Router();
router.post('/refresh', refreshCoinDesk);
router.get('/', getNews);

export default router;
