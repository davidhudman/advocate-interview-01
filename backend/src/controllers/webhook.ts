import { Request, Response } from 'express';
import Joi from 'joi';
import db from '../db';

// Define validation schema for webhook payload
const webhookSchema = Joi.object({
  crm_id: Joi.string().required(),
  updated_fields: Joi.object({
    phone: Joi.string().optional(),
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
  }).required(),
  timestamp: Joi.string().isoDate().optional(),
});

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate webhook payload
    const { error, value } = webhookSchema.validate(req.body);

    if (error) {
      // Return the specific validation error message
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { crm_id, updated_fields } = value;

    // Find user with the given crm_id
    const user = await db('users').where({ crm_id }).first();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update user with the provided fields
    await db('users')
      .where({ crm_id })
      .update({
        ...updated_fields,
      });

    // Include both the success field and the message
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
};
