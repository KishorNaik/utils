# `DataResponseFactory`

The `DataResponseFactory` is a utility class designed to standardize the creation of API response objects throughout the application. It provides a consistent structure for both successful and error responses, incorporating data, status codes, messages, and optional metadata.

This class is located at `src/core/shared/utils/miscellaneous/response/data/index.ts`.

## Class: `DataResponseFactory`

A factory class for creating `DataResponse<TData>` objects. All methods are static and can be called directly without instantiating the class.

### `response<TData>(...)`

A generic static method to create a `DataResponse` object. This is the base method used by other convenience methods like `success` and `error`.

**Parameters:**

-   `success` (boolean, optional): Indicates if the request was successful.
-   `statusCode` (StatusCodes, optional): The HTTP status code of the response.
-   `data` (TData, optional): The payload of the response.
-   `message` (string, optional): A message providing more information about the response.
-   `pagination` (PaginationDataResponseModel, optional): Pagination details, if applicable.
-   `traceId` (string, optional): A unique identifier for tracing the request.
-   `metaData` (unknown, optional): Any additional metadata.

**Returns:** `DataResponse<TData>` - A structured response object.

**Example:**

```typescript
import { StatusCodes } from 'http-status-codes';
import { DataResponseFactory } from './data-response-factory';

const response = DataResponseFactory.response<string>(
  true,
  StatusCodes.OK,
  'User data',
  'Successfully retrieved user.',
  undefined,
  'trace-id-123'
);
```

### `success<TData>(...)`

A static convenience method to create a successful `DataResponse` object, automatically setting `success` to `true`.

**Parameters:**

-   `statusCode` (StatusCodes, optional): The HTTP status code.
-   `data` (TData, optional): The response payload.
-   `message` (string, optional): A success message.
-   `pagination` (PaginationDataResponseModel, optional): Pagination details.
-   `traceId` (string, optional): The request trace ID.
-   `metaData` (unknown, optional): Additional metadata.

**Returns:** `DataResponse<TData>` - A successful response object.

**Example:**

```typescript
import { StatusCodes } from 'http-status-codes';
import { DataResponseFactory } from './data-response-factory';

const successResponse = DataResponseFactory.success<string>(
  StatusCodes.OK,
  'Operation successful',
  'Data processed.'
);
```

### `error<TData>(...)`

A static convenience method to create an error `DataResponse` object. It automatically sets `success` to `false` and `data` to `undefined`.

**Parameters:**

-   `statusCode` (StatusCodes, optional): The HTTP error status code.
-   `message` (string, optional): An error message.
-   `pagination` (PaginationDataResponseModel, optional): Pagination details.
-   `traceId` (string, optional): The request trace ID.
-   `metaData` (unknown, optional): Additional metadata.

**Returns:** `DataResponse<TData>` - An error response object.

**Example:**

```typescript
import { StatusCodes } from 'http-status-codes';
import { DataResponseFactory } from './data-response-factory';

const errorResponse = DataResponseFactory.error(
  StatusCodes.NOT_FOUND,
  'User not found.'
);
```

### `pipelineError<TData>(...)`

An asynchronous static method designed to handle errors that occur within a `PipelineWorkflow`. It checks for and rolls back any active database transactions using `QueryRunner`. It then formats the error into a standard `DataResponse` object.

**Parameters:**

-   `error` (Error | PipelineWorkflowException): The error object caught.
-   `queryRunner` (QueryRunner, optional): The TypeORM query runner to manage transactions.
-   `traceId` (string, optional): The request trace ID.
-   `metaData` (unknown, optional): Additional metadata.

**Returns:** `Promise<DataResponse<TData>>` - A promise that resolves to an error response object.

**Example:**

```typescript
import { DataResponseFactory } from './data-response-factory';
import { PipelineWorkflowException } from '../path/to/pipeline/exception';
import { StatusCodes } from 'http-status-codes';

try {
  // ... some operation that might fail
  throw new PipelineWorkflowException(StatusCodes.BAD_REQUEST, 'Invalid input.');
} catch (error) {
  const errorResponse = await DataResponseFactory.pipelineError(error);
  // errorResponse will be a formatted error response
}
```
