import { Request, Response } from 'express';
import db from '../db';
import axios from 'axios';
import { appSettings } from '../config/settings';

// Helper function to fetch OAuth token
async function getOAuthToken(): Promise<string | null> {
  try {
    // In a real app, we might get these from env vars
    const response = await axios.post('http://localhost:3000/crm/token', {
      client_id: 'dummy',
      client_secret: 'dummy',
    });

    return response.data.access_token;
  } catch (error) {
    // Only log detailed error if enhanced logging is enabled
    if (appSettings.enhancedLogging) {
      console.log('Failed to get OAuth token:', error);
    } else {
      console.log('Failed to get OAuth token. Enable enhanced logging for details.');
    }
    return null;
  }
}

// Main sync function to process pending users
export async function syncPendingUsers(): Promise<{ success: number; failed: number }> {
  // Get OAuth token
  const token = await getOAuthToken();
  if (!token) {
    return { success: 0, failed: 0 };
  }

  // Fetch pending users
  const pendingUsers = await db('users').where({ sync_status: 'pending' });

  let successCount = 0;
  let failedCount = 0;

  // Process each user
  for (const user of pendingUsers) {
    try {
      // Send user to CRM
      const response = await axios.post(
        'http://localhost:3000/crm/users',
        {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Update user with successful sync
      await db('users').where({ id: user.id }).update({
        sync_status: 'synced',
        crm_id: response.data.crm_id,
        last_updated: db.fn.now(),
      });

      successCount++;
    } catch (error) {
      // Update user with failed sync
      await db('users').where({ id: user.id }).update({
        sync_status: 'failed',
        last_updated: db.fn.now(),
      });

      failedCount++;

      // Only log detailed error if enhanced logging is enabled
      if (appSettings.enhancedLogging) {
        console.log(`Failed to sync user ${user.id}:`, error);
      } else {
        console.log(`Failed to sync user ${user.id}. Enable enhanced logging for details.`);
      }
    }
  }

  return { success: successCount, failed: failedCount };
}

// Controller method for manual sync
export const triggerSync = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await syncPendingUsers();

    res.status(200).json({
      message: 'Sync process completed',
      synced: result.success,
      failed: result.failed,
    });
  } catch (error) {
    console.error('Error during sync process:', error);
    res.status(500).json({ error: 'Failed to complete sync process' });
  }
};
