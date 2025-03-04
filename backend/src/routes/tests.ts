import { Router } from 'express';
import { runTests } from '../controllers/tests';

const router = Router();

router.post('/', runTests);

export default router;
