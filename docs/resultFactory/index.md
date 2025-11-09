# `ResultFactory`

The `ResultFactory` is a utility class for creating `Result` objects, leveraging the `neverthrow` library to handle success and error states in a functional and type-safe manner. Its design is inspired by the `Result` type in Rust. It standardizes the creation of `Ok` (success) and `Err` (error) results across the application.

This class is located at `src/core/shared/utils/miscellaneous/response/result/index.ts`.

## Class: `ResultFactory`

A factory class for creating `Result<T, ResultError>` objects. All methods are static.

### `success<T>(data: T)`

Creates a `Result` object representing a successful outcome.

**Parameters:**

-   `data` (T): The data to be wrapped in the success result.

**Returns:** `Result<T, ResultError>` - An `Ok` variant containing the data.

**Example:**

```typescript
import { ResultFactory } from './result-factory';

const user = { id: 1, name: 'John Doe' };
const successResult = ResultFactory.success(user);

if (successResult.isOk()) {
  console.log(successResult.value); // { id: 1, name: 'John Doe' }
}
```

### `error<T>(...)`

Creates a `Result` object representing an error outcome. It constructs a `ResultError` and wraps it in an `Err` variant.

**Parameters:**

-   `statusCode` (StatusCodes): The HTTP status code associated with the error.
-   `message` (string): A descriptive error message.
-   `fallbackObject` (object, optional): An object to fall back to, if applicable.
-   `stackTrace` (string, optional): The stack trace of the error.

**Returns:** `Result<T, ResultError>` - An `Err` variant containing a `ResultError`.

**Example:**

```typescript
import { ResultFactory } from './result-factory';
import { StatusCodes } from 'http-status-codes';

const errorResult = ResultFactory.error(
  StatusCodes.NOT_FOUND,
  'User not found'
);

if (errorResult.isErr()) {
  console.error(errorResult.error.message); // 'User not found'
}
```

### `errorInstance<T>(resultError: ResultError | Result<T, ResultError>)`

A utility method to ensure a consistent `Result<T, ResultError>` type is returned when dealing with errors. If it receives a `ResultError` instance, it wraps it in an `Err`. If it already receives a `Result` object, it returns it as is.

**Parameters:**

-   `resultError` (`ResultError` | `Result<T, ResultError>`): The error to be normalized into an `Err` result.

**Returns:** `Result<T, ResultError>` - An `Err` variant of the result.

**Example:**

```typescript
import { ResultFactory } from './result-factory';
import { ResultError } from '../path/to/result-error';
import { StatusCodes } from 'http-status-codes';

const directError = new ResultError(StatusCodes.BAD_REQUEST, 'Invalid input');
const errorResult = ResultFactory.errorInstance(directError);

if (errorResult.isErr()) {
  // This is an Err
}
```
