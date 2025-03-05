import logger from './logger';

// Add a delay function that can be replaced in tests
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param retries Maximum number of retries
 * @param initialDelay Initial delay in ms
 * @param operation Description of the operation for logging
 * @returns Result of the function or throws the last error
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  initialDelay = 1000,
  operation = 'operation',
): Promise<T> {
  let currentTry = 0;
  let lastError: Error | null = null;

  while (currentTry <= retries) {
    try {
      if (currentTry > 0) {
        logger.info(`Retry attempt ${currentTry}/${retries} for ${operation}`);
      }
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (currentTry === retries) {
        logger.error(`All ${retries} retries failed for ${operation}`, {
          error: lastError.message,
        });
        throw lastError;
      }

      const delayTime = initialDelay * Math.pow(2, currentTry);
      logger.warn(
        `Attempt ${currentTry + 1} failed for ${operation}. Retrying in ${delayTime}ms...`,
        {
          error: lastError.message,
          retry: currentTry + 1,
          maxRetries: retries,
        },
      );

      // Use the delay function instead of directly using setTimeout
      await delay(delayTime);
      currentTry++;
    }
  }

  // This should never be reached but TypeScript needs it
  throw lastError || new Error(`Unknown error during ${operation}`);
}
