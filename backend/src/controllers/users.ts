import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import db from '../db';
import { CreateUserRequest } from '../types/user';

// Define validation schema
const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
});

// Create a new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body using Joi
    const { error, value } = userSchema.validate(req.body);

    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { name, email, phone } = value as CreateUserRequest;

    // Generate UUID
    const id = uuidv4();

    // Insert user into the database
    const [user] = await db('users').insert(
      {
        id,
        name,
        email,
        phone,
        sync_status: 'pending',
        crm_id: null,
      },
      ['id', 'name', 'email', 'phone', 'sync_status', 'crm_id', 'last_updated'],
    );

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await db('users').where({ id }).first();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
};
