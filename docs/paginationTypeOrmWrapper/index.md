# `PagedList<T>` for TypeORM

The `PagedList<T>` class is a utility designed to simplify pagination when working with TypeORM's `SelectQueryBuilder`. It takes a query builder, a page number, and a page size, and it efficiently calculates all the necessary pagination metadata (like total count and total pages) while also modifying the query builder to fetch the correct slice of data for the requested page.

This utility is located at `src/core/shared/utils/miscellaneous/pageList/index.ts`.

## How It Works

The static method `toPagedListAsync` is the entry point. For efficiency, it runs two database queries in parallel:

1.  **Count Query:** It calls `queryBuilder.getCount()` to get the total number of records that match the `WHERE` conditions of your query.
2.  **Data Query Modification:** It applies `skip()` and `take()` methods to the original query builder to limit the results to the specific page you requested.

It then returns a `PagedList` instance containing the modified query builder and all the pagination metadata. To get the actual items for the page, you must then execute the query builder stored in the instance (e.g., by calling `.getMany()`).

## Class: `PagedList<T>`

An instance of this class represents a single page of data from a larger set.

### Properties

-   `selectQueryBuilder` (`SelectQueryBuilder<T>`): The TypeORM query builder, already configured with the correct `skip` and `take` values for the current page. You need to execute this (e.g., with `.getMany()`) to get the page's data.
-   `currentPage` (`number`): The current page number (1-based).
-   `totalPages` (`number`): The total number of pages available.
-   `pageSize` (`number`): The number of items per page.
-   `totalCount` (`number`): The total number of items across all pages.
-   `hasPrevious` (`boolean`): A getter that returns `true` if there is a page before the current one.
-   `hasNext` (`boolean`): A getter that returns `true` if there is a page after the current one.

### Static Method: `toPagedListAsync<T>(queryBuilder, pageNumber, pageSize)`

The factory method used to create and configure a `PagedList` instance.

-   **Parameters:**
    -   `queryBuilder` (`SelectQueryBuilder<T>`): The initial TypeORM query builder with all your `where`, `join`, and `orderBy` clauses.
    -   `pageNumber` (`number`): The desired page number to retrieve.
    -   `pageSize` (`number`): The number of items to include on the page.
-   **Returns:** `Promise<PagedList<T>>` - A `Promise` that resolves to a new `PagedList` instance.

## Usage Example

This example shows how to paginate a list of active users from a repository.

```typescript
import { PagedList } from './paged-list';
import { createConnection, getRepository, SelectQueryBuilder } from 'typeorm';
import { User } from '../path/to/your/user/entity'; // Your TypeORM entity

// Assume you have a TypeORM connection established
// await createConnection({...});

async function getActiveUsers(pageNumber: number, pageSize: number) {
  // 1. Get the repository and create a base query
  const userRepository = getRepository(User);
  const queryBuilder: SelectQueryBuilder<User> = userRepository.createQueryBuilder('user')
    .where('user.isActive = :isActive', { isActive: true })
    .orderBy('user.createdAt', 'DESC');

  // 2. Get the pagination metadata and the configured query builder
  const pagedList = await PagedList.toPagedListAsync(queryBuilder, pageNumber, pageSize);

  // 3. Execute the query on the builder inside the pagedList to get the items
  const usersOnPage = await pagedList.selectQueryBuilder.getMany();

  // 4. Return the data and the pagination info
  return {
    items: usersOnPage,
    currentPage: pagedList.currentPage,
    totalPages: pagedList.totalPages,
    totalCount: pagedList.totalCount,
    hasPrevious: pagedList.hasPrevious,
    hasNext: pagedList.hasNext,
  };
}

// --- Fetching page 2, with 10 items per page ---
(async () => {
  const result = await getActiveUsers(2, 10);

  console.log(`Showing page ${result.currentPage} of ${result.totalPages}`);
  console.log(`Total users: ${result.totalCount}`);
  console.log('Users on this page:', result.items.map(u => u.id));
})();
```
