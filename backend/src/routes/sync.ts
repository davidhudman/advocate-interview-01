import { Router } from 'express';
import { triggerSync } from '../controllers/sync';

const router = Router();

// POST /sync - Manually trigger sync
router.post('/', triggerSync);

export default router;
