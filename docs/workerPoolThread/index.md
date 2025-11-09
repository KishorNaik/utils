# `TaskWorkerThread`

The `TaskWorkerThread` class provides a high-level abstraction for running CPU-intensive tasks in a separate worker thread pool, preventing them from blocking the main Node.js event loop. It uses the `workerpool` library to manage a pool of workers, and includes features like task registration, timeouts, and automatic retries.

This is ideal for offloading heavy computations, such as image processing, complex calculations, or data manipulation, ensuring the main application remains responsive.

This utility is located at `src/core/shared/utils/helpers/thread/index.ts`.

## Class: `TaskWorkerThread`

A static class that manages task registration and execution in a worker pool.

### `registerTask<T>(name: string, fn: TaskFn<T>)`

Registers a function that can be executed by a worker thread. A task must be registered before it can be run.

-   **Parameters:**
    -   `name` (`string`): A unique name to identify the task.
    -   `fn` (`(...args: any[]) => T | Promise<T>`): The function to execute in the worker thread. It can be synchronous or asynchronous.

### `runTask<T>(name: string, args: any[], options: TaskOptions = {})`

Executes a previously registered task in a worker thread.

-   **Parameters:**
    -   `name` (`string`): The name of the registered task to run.
    -   `args` (`any[]`): An array of arguments to pass to the task function.
    -   `options` (`TaskOptions`, optional): An object to configure the task execution:
        -   `module` (`string`): The name of the worker pool to use. This allows for segmenting tasks into different pools. Defaults to `'default'`.
        -   `timeoutMs` (`number`): The maximum time in milliseconds to wait for the task to complete. Defaults to `3000`.
        -   `retries` (`number`): The number of times to retry the task if it fails (due to timeout or other errors). Defaults to `2`.
        -   `traceId` (`string`): A unique ID for logging and tracing. A default one is generated if not provided.

-   **Returns:** `Promise<T>` - A `Promise` that resolves with the return value of the task function. It rejects if the task fails after all retries.

### `terminateAll()`

Gracefully terminates all active worker pools. This should be called during application shutdown to ensure a clean exit.

-   **Returns:** `Promise<void>`

## How It Works

1.  **Registration:** You first "register" a function with a unique name. This makes the function's code available to the worker pool.
2.  **Execution:** When you call `runTask`, the class finds the corresponding worker pool (or creates one) and tells it to execute the registered function with the provided arguments.
3.  **Offloading:** The `workerpool` library sends the function and its arguments to a separate Node.js process (a worker thread). The CPU-intensive work happens there.
4.  **Return Value:** Once the worker thread completes the task, it sends the result back to the main thread, and the `Promise` returned by `runTask` resolves with that value.

## Usage Example

This example demonstrates how to register and run a CPU-intensive task.

**1. Define and Register the Task**

This would typically be done at application startup.

```typescript
import { TaskWorkerThread } from './task-worker-thread';

// A CPU-intensive function (e.g., calculating Fibonacci)
const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

// Register the function as a task named 'calculateFibonacci'
TaskWorkerThread.registerTask<number>('calculateFibonacci', fibonacci);

console.log('Task "calculateFibonacci" has been registered.');
```

**2. Run the Task**

This can be done anywhere in your application where you need the result of the heavy computation.

```typescript
async function performHeavyCalculation() {
  try {
    console.log('Offloading Fibonacci calculation to a worker thread...');
    const result = await TaskWorkerThread.runTask<number>(
      'calculateFibonacci', // Name of the registered task
      [40], // Arguments for the fibonacci function
      {
        module: 'math-workers', // Use a specific pool for math tasks
        timeoutMs: 5000, // Allow up to 5 seconds
        retries: 1
      }
    );
    console.log(`The result of the calculation is: ${result}`);
  } catch (error) {
    console.error('The task failed to complete:', error);
  }
}

performHeavyCalculation();
```

**3. Terminate Pools on Shutdown**

Ensure you clean up the worker pools when your application exits.

```typescript
process.on('beforeExit', async () => {
  console.log('Terminating all worker pools...');
  await TaskWorkerThread.terminateAll();
  console.log('Pools terminated.');
});
```
