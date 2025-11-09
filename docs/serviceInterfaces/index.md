# Service Handler Interfaces

This collection of interfaces defines a set of contracts for service handlers, following the **Interface Segregation Principle (ISP)**. ISP is one of the five SOLID principles of object-oriented design, and it states that no client should be forced to depend on methods it does not use.

Instead of a single, monolithic service interface, this file provides multiple, small, specific ("segregated") interfaces. This allows a class to implement only the contract that precisely matches its functionality. For example, a service that takes no parameters and returns no data doesn't need to be cluttered with generic `TParams` or `TResult` types.

All interfaces are built around the `Result` type from `neverthrow`, ensuring that every service handler explicitly communicates success or failure.

This utility is located at `src/core/shared/utils/helpers/services/index.ts`.

## Core Concepts

The interfaces are variations based on four characteristics:

1.  **Execution Model**: Asynchronous (`handleAsync`) vs. Synchronous (`handle`).
2.  **Input**: Requires parameters (`<TParams>`) vs. No parameters (`NoParams`).
3.  **Output**: Returns a meaningful result (`<TResult>`) vs. Returns a void confirmation (`VoidResult`).

## Asynchronous Service Interfaces

These interfaces are for services that perform I/O operations or other asynchronous work and return a `Promise`.

### `IServiceHandlerAsync<TParams, TResult>`

The most common async interface. For a service that takes parameters and returns a meaningful result.

-   **Method:** `handleAsync(params: TParams): Promise<Result<TResult, ResultError>>`

### `IServiceHandlerNoParamsAsync<TResult>`

For an async service that takes no parameters but returns a result (e.g., fetching a list of all items).

-   **Method:** `handleAsync(): Promise<Result<TResult, ResultError>>`

### `IServiceHandlerVoidAsync<TParams>`

For an async service that takes parameters but does not return any data, other than success or failure (e.g., updating a record).

-   **Method:** `handleAsync(params: TParams): Promise<Result<VoidResult, ResultError>>`

### `IServiceHandlerNoParamsVoidAsync`

For an async service that takes no parameters and returns no data (e.g., triggering a background process).

-   **Method:** `handleAsync(): Promise<Result<VoidResult, ResultError>>`

## Synchronous Service Interfaces

These interfaces are for services that perform immediate, synchronous computations.

### `IServiceHandler<TParams, TResult>`

The most common sync interface. For a service that takes parameters and returns a result.

-   **Method:** `handle(params: TParams): Result<TResult, ResultError>`

### `IServiceHandlerNoParams<TResult>`

For a sync service that takes no parameters but returns a result.

-   **Method:** `handle(): Result<TResult, ResultError>`

### `IServiceHandlerVoid<TParams>`

For a sync service that takes parameters but returns no data.

-   **Method:** `handle(params: TParams): Result<VoidResult, ResultError>`

### `IServiceHandlerNoParamsVoid`

For a sync service that takes no parameters and returns no data.

-   **Method:** `handle(): Result<VoidResult, ResultError>`

## Usage Example

By using these specific interfaces, classes become more self-documenting and focused.

```typescript
import { IServiceHandlerAsync, IServiceHandlerNoParamsVoid } from './service-interfaces';
import { Result } from 'neverthrow';
import { ResultFactory } from '../path/to/result-factory';

// --- Example 1: A service that fetches a user by ID ---

interface GetUserParams {
  userId: string;
}

interface User {
  id: string;
  name: string;
}

class GetUserService implements IServiceHandlerAsync<GetUserParams, User> {
  public async handleAsync(params: GetUserParams): Promise<Result<User, any>> {
    // In a real app, you would fetch from a database
    if (params.userId === '1') {
      return ResultFactory.success({ id: '1', name: 'John Doe' });
    }
    return ResultFactory.error(404, 'User not found');
  }
}


// --- Example 2: A service that triggers a system cleanup ---

class CleanupService implements IServiceHandlerNoParamsVoid {
  public handle(): Result<void, any> {
    // Perform synchronous cleanup tasks
    console.log('Cleaning up resources...');
    return ResultFactory.success(undefined); // Using VOID_RESULT would be better
  }
}
```
