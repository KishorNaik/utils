# `FireAndForgetWrapper`

The `FireAndForgetWrapper` provides utility functions to execute tasks in a "fire-and-forget" manner. This means the tasks are initiated and then run in the background without blocking the main execution thread and without waiting for their completion. It uses `setImmediate` to schedule the work to run on the next cycle of the Node.js event loop.

This is useful for operations that don't need to be completed before the current flow of execution continues, such as logging, sending notifications, or kicking off a non-critical background process.

This utility is located at `src/core/shared/utils/miscellaneous/jobs/fireForgot/index.ts`.

## Namespace: `FireAndForgetWrapper`

### `Job(callBack: () => void)`

Schedules a synchronous, simple function to be executed in the background.

**Parameters:**

- `callBack` (`() => void`): The function to execute. It should not throw any errors, as they will not be caught.

**Example:**

```typescript
import { FireAndForgetWrapper } from './fire-and-forget';

console.log('Scheduling a simple job.');

FireAndForgetWrapper.Job(() => {
	// This code runs in the background
	console.log('Simple fire-and-forget job executed!');
});

console.log('Main thread continues without waiting.');
```

### `JobAsync(params: IJobAsync)`

Schedules an asynchronous job to be executed in the background, with support for error handling and cleanup.

**Parameters:**

The function accepts a single `params` object with the following properties, defined by the `IJobAsync` interface:

- `onRun` (`() => Promise<void>`): The main asynchronous task to execute.
- `onError` (`(err: Error) => void`): A callback function that is invoked if an error occurs in either the `onRun` or `onCleanup` phases.
- `onCleanup` (`() => Promise<void>`): An asynchronous function that is guaranteed to be called after `onRun` has completed, regardless of whether it succeeded or failed. It's similar to a `finally` block.

**Example:**

```typescript
import { FireAndForgetWrapper } from './fire-and-forget';

console.log('Scheduling an async job.');

FireAndForgetWrapper.JobAsync({
	onRun: async () => {
		console.log('Async job started...');
		await new Promise((resolve) => setTimeout(resolve, 1000));
		// Uncomment the line below to simulate an error
		// throw new Error('Something went wrong during the run!');
		console.log('Async job finished.');
	},
	onError: (err) => {
		console.error('Caught an error:', err.message);
	},
	onCleanup: async () => {
		console.log('Cleanup logic running...');
		await new Promise((resolve) => setTimeout(resolve, 200));
		console.log('Cleanup finished.');
	},
});

console.log('Main thread continues its work.');
```

**Output (Success):**

```
Scheduling an async job.
Main thread continues its work.
Async job started...
Async job finished.
Cleanup logic running...
Cleanup finished.
```

**Output (with Error):**

```
Scheduling an async job.
Main thread continues its work.
Async job started...
Caught an error: Something went wrong during the run!
Cleanup logic running...
Cleanup finished.
```
