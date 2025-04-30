import { Router } from 'express';
import { suggestPriority } from '../controllers/ai.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/suggest-priority', auth, suggestPriority);

export default router;
