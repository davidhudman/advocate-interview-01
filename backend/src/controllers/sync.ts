import { Request, Response } from 'express';
import db from '../db';
import axios from 'axios';
import logger from '../utils/logger';
import { retryWithBackoff } from '../utils/retry';

// Function to get OAuth token with retry
async function getOAuthToken(): Promise<string> {
  return retryWithBackoff(
    async () => {
      const response = await axios.post('http://localhost:3000/crm/token', {
        client_id: 'dummy',
        client_secret: 'dummy',
      });
      return response.data.access_token;
    },
    3,
    1000,
    'OAuth token retrieval',
  );
}

// Function to create user in CRM with retry
async function createUserInCRM(user: any, token: string): Promise<string> {
  return retryWithBackoff(
    async () => {
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
      return response.data.crm_id;
    },
    3,
    1000,
    `CRM user creation for ${user.email}`,
  );
}

export const syncPendingUsers = async (): Promise<{ success: number; failed: number }> => {
  let successCount = 0;
  let failedCount = 0;

  try {
    // Get pending users
    const pendingUsers = await db('users').where({ sync_status: 'pending' });

    if (pendingUsers.length === 0) {
      logger.info('No pending users to sync');
      return { success: 0, failed: 0 };
    }

    logger.info(`Found ${pendingUsers.length} pending users to sync`);

    // Get OAuth token - if this fails, we won't mark users as failed
    // since we never actually attempted to sync them
    let token;
    try {
      token = await getOAuthToken();
    } catch (error) {
      logger.error('Failed to obtain OAuth token, aborting sync', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Return early without marking any users as failed
      return { success: 0, failed: 0 };
    }

    // Process each user only if we have a valid token
    for (const user of pendingUsers) {
      try {
        // Create user in CRM
        const crmId = await createUserInCRM(user, token);

        // Update user in our DB
        await db('users').where({ id: user.id }).update({
          crm_id: crmId,
          sync_status: 'synced',
        });

        successCount++;
        logger.info(`Successfully synced user ${user.email} with CRM ID ${crmId}`);
      } catch (error) {
        failedCount++;
        logger.error(`Failed to sync user ${user.email}`, {
          userId: user.id,
          error: error instanceof Error ? error.message : String(error),
        });

        // Update user status to failed
        await db('users').where({ id: user.id }).update({
          sync_status: 'failed',
        });
      }
    }

    return { success: successCount, failed: failedCount };
  } catch (error) {
    logger.error('Error in syncPendingUsers', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export const triggerSync = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Sync manually triggered via API endpoint');
    const result = await syncPendingUsers();

    res.status(200).json({
      message: 'Sync completed',
      synced: result.success,
      failed: result.failed,
    });
  } catch (error) {
    logger.error('Error triggering sync', {
      error: error instanceof Error ? error.message : String(error),
    });

    res.status(500).json({
      error: 'Failed to complete sync process',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
