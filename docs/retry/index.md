# `RetryWrapper`

The `RetryWrapper` provides a mechanism to automatically retry an asynchronous operation that might fail intermittently. It is designed to work with functions that return a `Result` type from the `neverthrow` library, allowing for robust handling of operations that can result in either success (`Ok`) or a known error (`Err`).

This utility is located at `src/core/shared/utils/miscellaneous/retry/index.ts`.

## Namespace: `RetryWrapper`

### `runAsync<T, TArgs>(params: RetryOptions<T, TArgs>)`

This asynchronous function executes a given function and retries it upon failure, up to a specified maximum number of attempts.

**Parameters:**

The function accepts a single `params` object with the following properties:

-   `fn` (`(...args: TArgs) => Promise<Result<T, ResultError>>`): The asynchronous function to execute. It must return a `Promise` that resolves to a `Result` object.
-   `args` (`TArgs`): An array of arguments to pass to the `fn` function.
-   `maxRetry` (`number`): The maximum number of times to attempt the operation.
-   `delay` (`number`, optional): The time in milliseconds to wait between retry attempts. Defaults to `0`.

**Returns:** `Promise<Result<T, ResultError>>` - A `Promise` that resolves to:
-   An `Ok` result containing the successful value if the operation succeeds.
-   An `Err` result if the operation fails after all retry attempts.
-   An `Err` result if an unexpected exception is thrown during execution.

## Usage Example

The following example demonstrates how to use `RetryWrapper.runAsync` to handle an unstable task that has a chance of failing.

```typescript
import { RetryWrapper } from './retry';
import { Result } from 'neverthrow';
import { ResultError } from '../path/to/result-error';
import { ResultFactory } from '../path/to/result-factory';
import { StatusCodes } from 'http-status-codes';

// An example of an unstable function that might fail.
const unstableTask = async (name: string): Promise<Result<string, ResultError>> => {
  console.log(`Attempting to run task for ${name}...`);
  if (Math.random() < 0.6) { // 60% chance of failure
    console.error('Task failed!');
    return ResultFactory.error(StatusCodes.SERVICE_UNAVAILABLE, `${name} failed`);
  }
  return ResultFactory.success(`Hello, ${name}!`);
};

(async () => {
  const result = await RetryWrapper.runAsync({
    fn: unstableTask,
    args: ['Kishor'],
    maxRetry: 5,
    delay: 1000 // Wait 1 second between retries
  });

  if (result.isOk()) {
    console.log('✅ Success:', result.value);
  } else {
    console.error('❌ Failure after all retries:', result.error.message);
  }
})();
```

**Possible Output:**

```
Attempting to run task for Kishor...
Task failed!
Attempting to run task for Kishor...
Task failed!
Attempting to run task for Kishor...
✅ Success: Hello, Kishor!
```

Or, if it fails all attempts:

```
Attempting to run task for Kishor...
Task failed!
Attempting to run task for Kishor...
Task failed!
Attempting to run task for Kishor...
Task failed!
Attempting to run task for Kishor...
Task failed!
Attempting to run task for Kishor...
Task failed!
❌ Failure after all retries: Operation failed after 5 retries
```
