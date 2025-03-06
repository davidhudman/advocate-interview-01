import { Request, Response } from 'express';

interface CRMUser {
  crmId: string;
  name: string;
  email: string;
  phone: string;
}

// In-memory storage for mock CRM users
const crmUsers: Record<string, CRMUser> = {};
let userCounter = 1;

// Generate an OAuth2 token
export const generateToken = (req: Request, res: Response): void => {
  const { client_id, client_secret } = req.body;

  // Very basic validation
  if (client_id !== 'dummy' || client_secret !== 'dummy') {
    res.status(401).json({ error: 'Invalid client credentials' });
    return;
  }

  // Return a mock token
  res.status(200).json({
    access_token: 'mock_token',
    expires_in: 3600,
  });
};

// Create a new user in the CRM
export const createUser = (req: Request, res: Response): void => {
  const { name, email, phone } = req.body;

  // Validate required fields
  if (!name || !email || !phone) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const crmId = `CRM${userCounter++}`;

  // Store the user in our mock database
  crmUsers[crmId] = { crmId, name, email, phone };

  // Return just the CRM ID
  res.status(201).json({ crm_id: crmId });
};

// Get a user by CRM ID
export const getUserById = (req: Request, res: Response): void => {
  const { crmId } = req.params;

  const user = crmUsers[crmId];

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.status(200).json({
    crm_id: crmId,
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
};
