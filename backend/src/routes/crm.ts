import { Router } from 'express';
import { generateToken, createUser, getUserById } from '../controllers/crm';
import { validateToken } from '../middleware/auth';

const router = Router();

// OAuth token endpoint
router.post('/token', generateToken);

// CRM user endpoints (protected by auth middleware)
router.post('/users', validateToken, createUser);
router.get('/users/:crmId', validateToken, getUserById);

export default router;
