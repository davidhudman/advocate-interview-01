import { Router } from 'express';
import { handleWebhook } from '../controllers/webhook';

const router = Router();

// POST /webhook - Handle CRM webhook
router.post('/', handleWebhook);

export default router;
