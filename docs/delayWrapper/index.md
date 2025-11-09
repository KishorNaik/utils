# `delay`

The `delay` function is a simple utility that provides a promise-based pause for a specified duration. It is a convenient wrapper around `setTimeout` that can be easily used with `async/await` syntax to pause execution.

This utility is located at `src/core/shared/utils/miscellaneous/delay/index.ts`.

## Function: `delay(ms: number)`

Pauses the execution for a given number of milliseconds.

**Parameters:**

- `ms` (`number`): The number of milliseconds to delay.

**Returns:** `Promise<void>` - A `Promise` that resolves after the specified `ms` have elapsed.

## Usage Example

The `delay` function is typically used within an `async` function to wait for a period of time before continuing.

```typescript
import { delay } from './delay';

async function runWithDelays() {
	console.log('Starting...');

	await delay(1000); // Wait for 1 second
	console.log('One second has passed.');

	await delay(2000); // Wait for another 2 seconds
	console.log('Two more seconds have passed.');

	console.log('Finished.');
}

runWithDelays();
```

**Output of the example:**

```
Starting...
(after 1 second)
One second has passed.
(after 2 more seconds)
Two more seconds have passed.
Finished.
```
