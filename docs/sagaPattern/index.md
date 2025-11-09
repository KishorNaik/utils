# Saga Orchestrator Pattern

The `SagaOrchestratorBuilder` provides an implementation of the **Saga design pattern**, a crucial strategy for managing data consistency across multiple services in a distributed system (e.g., microservices). A saga is a sequence of local transactions where each transaction updates data within a single service and triggers the next transaction. If a transaction fails, the saga executes compensating transactions to undo the preceding work.

This implementation uses an **Orchestration-based** approach, where a central `SagaOrchestratorBuilder` is responsible for telling the saga's participants (the steps) what to do and when.

This utility is located at `src/core/shared/utils/helpers/saga/builder/index.ts`.

## Core Concepts

-   **Saga:** A long-running process composed of multiple steps. The entire process succeeds only if all steps succeed.
-   **Step:** A single operation in the saga. Each step has an `action` to perform the work and a `compensate` action to undo that work.
-   **Action:** The primary logic of a step (e.g., create an order, charge a credit card).
-   **Compensation:** The logic to reverse an action (e.g., cancel the order, refund the credit card). Compensation is triggered if any step in the saga fails.
-   **Orchestrator:** The `SagaOrchestratorBuilder` instance, which manages the entire process, executing actions and triggering compensations as needed.
-   **Context:** A shared object (`ISagaContext`) that is passed through all steps, allowing them to share data.

## Class: `SagaOrchestratorBuilder<TContext>`

A builder class used to define, configure, and run a saga.

### `constructor(name, initialContext, logger)`

Initializes a new saga orchestrator.

-   **Parameters:**
    -   `name` (`string`): A descriptive name for the saga (used in logs).
    -   `initialContext` (`TContext`): The initial data object for the saga's shared context.
    -   `logger` (`winston.Logger`): A logger instance for detailed execution logging.

### `step<TResult>(step: SagaStep<TContext, TResult>)`

Adds a step to the saga's sequence. This is a chainable method.

-   **Parameters:**
    -   `step` (`SagaStep`): A step definition object, which must include:
        -   `label` (`string`): A unique name for the step.
        -   `action`: An async function that performs the step's logic. It receives the saga context and must return a `Result`.
        -   `compensate`: An async function that undoes the action. It also receives the saga context.
        -   `retry` (`number`, optional): The number of times to retry the action upon failure.
        -   `onError` (optional): A hook to execute when the step's action fails.

### `getStepResult<TResult>(label: string)`

Retrieves the successful result of a previously executed step.

### `runAsync(resumeFromLabel?: string)`

Starts the execution of the saga. The orchestrator will run each step's `action` in the defined order.

-   If a step fails (returns an `Err` result) and has no retries left, the orchestrator will:
    1.  Stop moving forward.
    2.  Go backward through the list of successfully completed steps.
    3.  Execute the `compensate` function for each one.
    4.  Throw a `SagaExecutionException` to indicate the saga has failed.
-   If all steps succeed, the method completes, and the saga is considered successful.

-   **Parameters:**
    -   `resumeFromLabel` (`string`, optional): If provided, the saga will skip all steps until it finds the one with this label and resume execution from there. This is useful for recovering a failed saga.

## Usage Example

Consider a "Create Order" saga that involves creating an order, reserving inventory, and processing a payment.

```typescript
import { SagaOrchestratorBuilder } from './saga-builder';
import { ResultFactory } from '../path/to/result-factory';
import winston from 'winston';

// --- 1. Define the Saga Context ---
interface IOrderSagaContext {
  orderId?: string;
  paymentTransactionId?: string;
  userId: string;
  productId: string;
  quantity: number;
}

// --- 2. Define Services (mocked for this example) ---
const orderService = {
  create: async (ctx) => ResultFactory.success({ orderId: 'order-123' }),
  cancel: async (ctx) => console.log(`Order ${ctx.context.orderId} cancelled.`),
};
const inventoryService = {
  reserve: async (ctx) => ResultFactory.success({ reserved: true }),
  // reserve: async (ctx) => ResultFactory.error(500, 'Inventory service is down!'), // <-- UNCOMMENT TO TEST FAILURE
  release: async (ctx) => console.log(`Inventory for product ${ctx.context.productId} released.`),
};
const paymentService = {
  process: async (ctx) => ResultFactory.success({ paymentTransactionId: 'txn-abc' }),
  refund: async (ctx) => console.log(`Payment ${ctx.context.paymentTransactionId} refunded.`),
};

// --- 3. Build and Run the Saga ---
async function executeCreateOrderSaga() {
  const logger = winston.createLogger(/* ... */);
  const initialContext: IOrderSagaContext = { userId: 'user-abc', productId: 'prod-xyz', quantity: 2 };

  const saga = new SagaOrchestratorBuilder('CreateOrderSaga', initialContext, logger);

  try {
    saga
      .step({
        label: 'CreateOrder',
        action: async (ctx) => {
          const result = await orderService.create(ctx);
          if (result.isOk()) ctx.context.orderId = result.value.orderId;
          return result;
        },
        compensate: async (ctx) => orderService.cancel(ctx),
      })
      .step({
        label: 'ReserveInventory',
        action: (ctx) => inventoryService.reserve(ctx),
        compensate: (ctx) => inventoryService.release(ctx),
        retry: 2, // Retry this step up to 2 times
      })
      .step({
        label: 'ProcessPayment',
        action: async (ctx) => {
          const result = await paymentService.process(ctx);
          if (result.isOk()) ctx.context.paymentTransactionId = result.value.paymentTransactionId;
          return result;
        },
        compensate: (ctx) => paymentService.refund(ctx),
      });

    await saga.runAsync();

    if (saga.getContext().isSuccess) {
      console.log('Saga completed successfully!');
      const paymentResult = saga.getStepResult<{ paymentTransactionId: string }>('ProcessPayment');
      console.log('Payment Transaction ID:', paymentResult?.paymentTransactionId);
    }
  } catch (error) {
    console.error(`Saga failed: ${error.message}`);
    // The error object (SagaExecutionException) contains details about the failure
  }
}

executeCreateOrderSaga();
```
