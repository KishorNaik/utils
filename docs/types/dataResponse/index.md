# API Response Types

This document outlines the standardized data structures used for API responses throughout the application. These models ensure that all API responses have a consistent and predictable shape, making them easier for clients to consume.

These types are located at `src/core/shared/models/response/data.Response.ts`.

## `DataResponse<TData>`

This is the primary generic model for all API responses. It wraps the actual data payload (`data`) with consistent metadata about the response status, pagination, and tracing.

### Properties

- `success` (`boolean`, optional):
  Indicates the outcome of the request. `true` for success, `false` for failure.

- `statusCode` (`StatusCodes`, optional):
  The standard HTTP status code (e.g., `200` for OK, `404` for Not Found).

- `data` (`TData`, optional):
  The main payload of the response. The type `TData` is generic and will change depending on the resource being requested. For error responses, this is typically `undefined`.

- `message` (`string`, optional):
  A human-readable message providing more context about the response, such as a success message or a description of an error.

- `pagination` (`PaginationDataResponseModel`, optional):
  If the response data is a paginated list, this object will contain the pagination metadata. See `PaginationDataResponseModel` below.

- `timestamp` (`string`, optional):
  An ISO 8601 timestamp indicating when the response was generated.

- `traceId` (`string`, optional):
  A unique identifier for the request/response cycle, used for logging and debugging purposes.

- `metaData` (`unknown`, optional):
  A field to hold any extra, non-standard metadata that might be relevant to the response.

## `PaginationDataResponseModel`

This model defines the structure of the `pagination` object within a `DataResponse`. It is included in responses that return a subset of a larger collection of data.

### Properties

- `currentPage` (`number`, optional):
  The page number of the data being returned (1-based).

- `totalPages` (`number`, optional):
  The total number of pages available for the collection.

- `pageSize` (`number`, optional):
  The maximum number of items included on a single page.

- `totalCount` (`number`, optional):
  The total number of items in the entire collection, across all pages.

- `hasPrevious` (`boolean`, optional):
  `true` if there is a page before the current one.

- `hasNext` (`boolean`, optional):
  `true` if there is a page after the current one.

## Example JSON Response

Here is an example of what a `DataResponse` might look like when fetching a paginated list of users.

```json
{
	"success": true,
	"statusCode": 200,
	"message": "Users retrieved successfully.",
	"data": [
		{ "id": 101, "name": "Alice" },
		{ "id": 102, "name": "Bob" }
	],
	"pagination": {
		"currentPage": 1,
		"totalPages": 5,
		"pageSize": 2,
		"totalCount": 10,
		"hasPrevious": false,
		"hasNext": true
	},
	"timestamp": "2025-11-09T12:30:00.000Z",
	"traceId": "trace-abc-123"
}
```
