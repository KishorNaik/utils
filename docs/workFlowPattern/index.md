# Workflow Pipeline Pattern

The `PipelineWorkflow` class provides a robust and structured way to execute a sequence of operations (or "steps"). This pattern is designed to handle complex business logic by breaking it down into smaller, manageable, and testable units.

The pipeline manages the execution flow, passes state between steps, provides detailed logging, and ensures consistent, centralized error handling.

This utility is located at `src/core/shared/utils/helpers/workflow/pipeline/index.ts`.

## Core Concepts

- **Pipeline:** An instance of the `PipelineWorkflow` class that orchestrates the steps.
- **Step:** A single unit of work within the pipeline. Each step is an async function that returns a `Result` object (`Ok` for success, `Err` for failure).
- **Context:** A shared state (`Map`) managed by the pipeline. The successful result of each step is automatically stored in the context, keyed by the step's name. This allows later steps to access the output of earlier steps.
- **Error Handling:** If any step returns an `Err` or throws an exception, the pipeline immediately halts and throws a `PipelineWorkflowException`, preventing further execution.

## Class: `PipelineWorkflow`

### `constructor(logger: winston.Logger)`

Initializes a new pipeline instance.

- **Parameters:**
    - `logger` (`winston.Logger`): A Winston logger instance for detailed, structured logging of the pipeline's execution.

### `step<TResult>(name, action)`

Executes a single, sequential step in the pipeline.

- **Parameters:**
    - `name` (`string`): A unique name for the step. The result will be stored in the context under this name.
    - `action` (`() => Promise<Result<TResult, ResultError>>`): The async function to execute for this step.
- **Returns:** `Promise<TResult>` - A `Promise` that resolves with the value of the successful result. It throws an exception if the step fails.

### `stepParallel<TSteps>(steps)`

Executes multiple steps concurrently. The pipeline waits for all parallel steps to complete before moving on. If any step fails, all other parallel operations will still attempt to complete, but the pipeline will halt and throw an error immediately after.

- **Parameters:**
    - `steps` (`StepDefinition[]`): An array of step definitions to execute in parallel. Use the `defineParallelSteps` helper to create this array.
- **Returns:** `Promise<[R1, R2, ...]>` - A `Promise` that resolves to a tuple containing the results of each step in the order they were defined.

### `ifElseStep<TResult>(name, condition, ifAction, elseAction)`

Allows for conditional branching within the pipeline. It executes one of two actions based on a condition evaluated against the current context.

- **Parameters:**
    - `name` (`string`): A base name for the step. The executed branch will be logged as `name_IF` or `name_ELSE`.
    - `condition` (`(context: Map<string, any>) => boolean`): A function that receives the current context and returns `true` or `false`.
    - `ifAction`: The action to execute if the condition is `true`.
    - `elseAction`: The action to execute if the condition is `false`.
- **Returns:** `Promise<TResult>` - A `Promise` that resolves with the result of the executed branch.

### `getResult<TResult>(name)`

Retrieves the output of a previously completed step from the pipeline's context.

- **Parameters:**
    - `name` (`string`): The name of the step whose result you want to retrieve.
- **Returns:** `TResult` - The stored result of the specified step.

## Usage Example

This example shows a pipeline for processing a new user order.

```typescript
import { PipelineWorkflow, defineParallelStep, defineParallelSteps } from './pipeline';
import { ResultFactory } from '../path/to/result-factory';
import winston from 'winston'; // Assuming you have a logger configured

// --- Mock Services and Data ---
const logger = winston.createLogger(/* ... */);
const orderRequest = { userId: 'user-123', productId: 'prod-456', amount: 99.99 };

const fetchUser = async (userId: string) =>
	ResultFactory.success({ id: userId, name: 'John Doe', loyaltyPoints: 50 });
const fetchProduct = async (productId: string) =>
	ResultFactory.success({ id: productId, name: 'Widget', stock: 10 });
const chargeCard = async (userId: string, amount: number) =>
	ResultFactory.success({ transactionId: 'txn-abc' });
const updateInventory = async (productId: string) => ResultFactory.success({ updated: true });
const grantLoyaltyPoints = async (userId: string) => ResultFactory.success({ pointsAdded: 10 });

// --- Pipeline Execution ---
async function processOrder() {
	const pipeline = new PipelineWorkflow(logger);

	try {
		// 1. Run initial data-fetching steps in parallel
		await pipeline.stepParallel(
			defineParallelSteps(
				defineParallelStep('user', () => fetchUser(orderRequest.userId)),
				defineParallelStep('product', () => fetchProduct(orderRequest.productId))
			)
		);

		// 2. Retrieve results from the context and perform a sequential step
		const product = pipeline.getResult<{ stock: number }>('product');
		if (product.stock <= 0) {
			return ResultFactory.error(400, 'Product out of stock');
		}

		// 3. Use if/else to decide on an action
		await pipeline.ifElseStep(
			'payment',
			(context) => context.get('user').loyaltyPoints > 100,
			() => ResultFactory.success({ transactionId: 'paid-with-points' }), // ifAction
			() => chargeCard(orderRequest.userId, orderRequest.amount) // elseAction
		);

		// 4. Run final steps in parallel
		await pipeline.stepParallel(
			defineParallelSteps(
				defineParallelStep('inventory', () => updateInventory(orderRequest.productId)),
				defineParallelStep('loyalty', () => grantLoyaltyPoints(orderRequest.userId))
			)
		);

		const finalResult = pipeline.getResult<{ transactionId: string }>('payment_ELSE');
		return ResultFactory.success({ status: 'Order Complete', ...finalResult });
	} catch (error) {
		// The pipeline automatically logs errors, but you can catch the final exception
		console.error('Pipeline failed:', error.message);
		return ResultFactory.error(error.statusCode || 500, error.message);
	}
}

processOrder();
```
