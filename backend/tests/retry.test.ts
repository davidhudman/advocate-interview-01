import { retryWithBackoff, delay as actualDelay } from '../src/utils/retry';
import logger from '../src/utils/logger';

// Mock the logger
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock the delay function
jest.mock('../src/utils/retry', () => {
  // Import the actual module
  const actual = jest.requireActual('../src/utils/retry');

  // Return a modified version that mocks the delay function
  return {
    ...actual,
    delay: jest.fn().mockResolvedValue(undefined),
  };
});

describe('Retry Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed on first attempt if function succeeds', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');

    const result = await retryWithBackoff(mockFn, 3, 1000, 'test operation');

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(logger.info).not.toHaveBeenCalled(); // No retry info logs
  });

  it('should retry and succeed on second attempt', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce('success');

    const result = await retryWithBackoff(mockFn, 3, 50, 'test operation');

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('Retry attempt 1/3 for test operation');
  });

  it('should retry with exponential backoff and fail after all retries', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));

    await expect(retryWithBackoff(mockFn, 3, 50, 'test operation')).rejects.toThrow('Always fails');

    expect(mockFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
    expect(logger.warn).toHaveBeenCalledTimes(3);
    expect(logger.error).toHaveBeenCalledWith(
      'All 3 retries failed for test operation',
      expect.any(Object),
    );
  });
});
