# Testing Issues with Timers in the Retry Utility

## Initial Problem

When implementing tests for the retry utility, we encountered several timeout-related errors:

```
/Users/davidhudman/dev/repo/interviews/advocate-interview-01/backend/tests/retry.test.ts
✓ should succeed on first attempt if function succeeds
✗ should retry and succeed on second attempt
✗ should retry with exponential backoff and fail after all retries
[1m[31m  [1m● [22m[1mRetry Utility › should retry and succeed on second attempt[39m[22m

    thrown: "Exceeded timeout of 5000 ms for a test.
    Add a timeout value to this test to increase the timeout, if this is a long-running test. See https://jestjs.io/docs/api#testname-fn-timeout."
```

The issue was that Jest's timer mocks weren't working correctly with our asynchronous retry logic, causing tests to exceed the default timeout.

## Question

> I'm seeing these errors now and the code is looking messy. Is there a way to clean this all up and fix the errors?
>
> Even when increasing the timeout to 10000ms, the tests were still failing with similar errors.

## Solution Approaches

There are three main approaches to testing code with timeouts:

1. **Using real timeouts**: Use actual timeouts but with shorter durations

   - ✅ Simple implementation (no mocks needed)
   - ✅ Tests the real implementation end-to-end
   - ❌ Tests take longer to run (even with short timeouts)
   - ❌ Might be flaky on slow CI environments

2. **Using Jest's timer mocks**: Use Jest's fake timers to simulate time passing

   - ✅ Tests run quickly
   - ❌ More complex to set up
   - ❌ Caused the issues we were seeing with TypeScript and timeouts

3. **Dependency injection approach**: Extract the delay functionality and mock it
   - ✅ Tests run very quickly
   - ✅ Doesn't slow down the test suite
   - ✅ Reasonably simple implementation
   - ✅ Works well with TypeScript

## Chosen Solution

We chose the dependency injection approach by:

1. Extracting the delay function to make it mockable:

   ```typescript
   // Add a delay function that can be replaced in tests
   export const delay = (ms: number): Promise<void> =>
     new Promise((resolve) => setTimeout(resolve, ms));
   ```

2. Using this function instead of direct setTimeout calls:

   ```typescript
   // Use the delay function instead of directly using setTimeout
   await delay(delayTime);
   ```

3. Mocking the delay function in tests:
   ```typescript
   jest.mock("../src/utils/retry", () => {
     // Import the actual module
     const actual = jest.requireActual("../src/utils/retry");

     // Return a modified version that mocks the delay function
     return {
       ...actual,
       delay: jest.fn().mockResolvedValue(undefined),
     };
   });
   ```

This approach gives us the best of both worlds:

- Tests run instantly without waiting for actual timeouts
- The code is simpler and more maintainable than using Jest's timer mocks
- We avoid the TypeScript errors related to mocking setTimeout directly
- The retry logic itself is still fully tested, just without the actual delays

While it might be acceptable to use real timeouts with short durations to reduce complexity, the current approach strikes a good balance between simplicity and test performance.
