# Utils Functions

## ![Node.js v22](https://img.shields.io/badge/Node.js-22.x-green.svg) ![TypeScript v5.9](https://img.shields.io/badge/TypeScript-5.9-blue.svg) ![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-yellow.svg) ![Module System: CommonJS](https://img.shields.io/badge/Module%20System-CommonJS-orange.svg) ![NPM Version: 1.0.12](https://img.shields.io/badge/NPM%20Version-1.0.12-purple.svg)

## 📦 Overview

`@kishornaik/utils` is a curated collection of core utility functions and service wrappers designed specifically for the [expressjs_tsoa_boilerplate](https://github.com/KishorNaik/expressjs_tsoa_boilerplate) project.

It provides a robust foundation of reusable components to:

- 🚀 Accelerate development
- 🧼 Improve code quality
- 🧩 Promote modular architecture
- ✅ Ensure consistency across features

Whether you're building secure endpoints, background workers, validation flows, or structured logging — this package provides the foundational tools to do it cleanly and efficiently

## 📚 Documentation

This project includes detailed documentation for its core utilities and wrappers. All documentation is located in the [`/docs`](/docs) directory.

### Core Utilities

-   [**DTO Validation Service**](./docs/dtoValidation/index.md) - A wrapper for `class-validator` to validate data transfer objects.
-   [**AES Encryption Utility**](./docs/aesWrapper/index.md) - A secure utility for AES-256-CBC encryption and decryption.
-   [**HMAC Wrapper**](./docs/hmacWrapper/index.md) - A utility for creating and verifying HMAC signatures for message authenticity.
-   [**`DataResponseFactory`**](./docs/core/shared/utils/miscellaneous/response/data/index.md) - A factory for creating standardized API data responses.
-   [**`ResultFactory`**](./docs/resultFactory/index.md) - A factory for creating `Result` objects (Ok/Err), inspired by Rust.
-   [**`Lazy<T>`**](./docs/lazy/index.md) - A class for lazy initialization of objects, inspired by .NET's `Lazy<T>`.
-   [**`RetryWrapper`**](./docs/retry/index.md) - A utility to automatically retry failed asynchronous operations.
-   [**`FireAndForgetWrapper`**](./docs/fireAndForgetJob/index.md) - Utilities for running background jobs without awaiting their completion.
-   [**`GuardWrapper`**](./docs/guardWrapper/index.md) - A chainable utility for implementing guard clauses, inspired by Swift.
-   [**`delay`**](./docs/delayWrapper/index.md) - A simple promise-based delay function.
-   [**`BufferWrapper`**](./docs/bufferWrapper/index.md) - A collection of helpers for working with Node.js Buffers.
-   [**`executeBatchArrayAsync`**](./docs/executeBatchArray/index.md) - A function for processing large arrays in manageable batches.
-   [**`PagedList<T>` for TypeORM**](./docs/paginationTypeOrmWrapper/index.md) - A utility for simplifying pagination with TypeORM's `SelectQueryBuilder`.

### Design Patterns & Helpers

-   [**Saga Orchestrator Pattern**](./docs/sagaPattern/index.md) - A builder for managing data consistency across distributed services using the Saga pattern.
-   [**Workflow Pipeline Pattern**](./docs/workFlowPattern/index.md) - A robust pattern for orchestrating a series of operations (steps).
-   [**Worker Pool Thread (`TaskWorkerThread`)**](./docs/workerPoolThread/index.md) - A manager for running CPU-intensive tasks in a separate thread pool.
-   [**Service Handler Interfaces**](./docs/serviceInterfaces/index.md) - A set of contracts applying the Interface Segregation Principle.
-   [**Delegate Types**](./docs/delegates/index.md) - A collection of function types (`Action`, `Func`, `Predicate`) inspired by .NET delegates.

### Core Types

-   [**API Response Types (`DataResponse`)**](./docs/types/dataResponse/index.md) - The standardized structure for all API responses.
