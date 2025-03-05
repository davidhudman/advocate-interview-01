import { Router } from 'express';
import { createUser, getUserById } from '../controllers/users';

const router = Router();

// POST /users - Create a new user
router.post('/', createUser);

// GET /users/:id - Get a user by ID
router.get('/:id', getUserById);

export default router;
