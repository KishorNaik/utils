# `executeBatchArrayAsync`

The `executeBatchArrayAsync` function is a powerful utility for processing large arrays of items in manageable batches. It provides control over the batch size, concurrency, and execution mode (parallel or sequential) to prevent overwhelming system resources like memory or CPU.

It is designed to work with a handler function that returns a `Result` type, and it aggregates all success and error outcomes into a single summary object.

This utility is located at `src/core/shared/utils/miscellaneous/batchArray/index.ts`.

## Function: `executeBatchArrayAsync<TInput, TOutput>(options)`

Executes a handler function for each item in an array, processing them in batches.

### Options

The function accepts a single `options` object with the following properties:

-   `items` (`TInput[]`): The array of items to be processed.
-   `handler` (`(item: TInput) => Promise<Result<TOutput | VoidResult, ResultError>>`): An asynchronous function that is called for each item. It should return a `Promise` that resolves to a `Result` object.
-   `batchSize` (`number`, optional): The number of items to process in each major batch. **Default: `10`**.
-   `concurrency` (`number`, optional): The maximum number of items to process in parallel at any given time within a batch (only applies to `'parallel'` mode). **Default: `batchSize`**.
-   `runMode` (`'sequential' | 'parallel'`, optional): The execution strategy.
    -   `'parallel'`: Processes items in parallel, up to the `concurrency` limit. This is faster but more resource-intensive.
    -   `'sequential'`: Processes items one by one within each batch. This is slower but uses fewer resources.
    -   **Default: `'parallel'`**.

### Returns

`Promise<BatchArrayExecutionResult<TOutput>>` - A `Promise` that resolves to an object containing the results:

-   `success` (`Result[]`): An array of all the `Ok` results returned by the handler.
-   `error` (`Result[]`): An array of all the `Err` results returned by the handler.

## Usage Example

Imagine you have a list of `outbox` messages that need to be sent. Each `handleAsync` call is an async operation.

```typescript
import { executeBatchArrayAsync } from './execute-batch-array';
import { Result } from 'neverthrow';
import { ResultFactory } from '../path/to/result-factory';
import { StatusCodes } from 'http-status-codes';

// Mock service to handle a task
const service = {
  handleAsync: async (item: { id: number }): Promise<Result<string, any>> => {
    console.log(`Processing item ${item.id}...`);
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50)); // Simulate work

    if (item.id % 5 === 0) { // Simulate a failure for every 5th item
      return ResultFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, `Failed to process item ${item.id}`);
    }
    return ResultFactory.success(`Successfully processed item ${item.id}`);
  }
};

// --- Main execution ---
(async () => {
  const itemsToProcess = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));

  console.log('--- Starting Parallel Execution ---');
  const parallelResult = await executeBatchArrayAsync({
    items: itemsToProcess,
    handler: (item) => service.handleAsync(item),
    batchSize: 5,
    concurrency: 5, // Process up to 5 items at a time
    runMode: 'parallel'
  });

  console.log(`Parallel Execution Done. Successes: ${parallelResult.success.length}, Failures: ${parallelResult.error.length}`);
  parallelResult.error.forEach(e => e.isErr() && console.error(e.error.message));


  console.log('\n--- Starting Sequential Execution ---');
  const sequentialResult = await executeBatchArrayAsync({
    items: itemsToProcess,
    handler: (item) => service.handleAsync(item),
    batchSize: 5,
    runMode: 'sequential' // Processes one-by-one
  });

  console.log(`Sequential Execution Done. Successes: ${sequentialResult.success.length}, Failures: ${sequentialResult.error.length}`);
  sequentialResult.error.forEach(e => e.isErr() && console.error(e.error.message));
})();
```
