# `GuardWrapper`

The `GuardWrapper` class provides a clean, chainable interface for implementing guard clauses to validate inputs. Inspired by the `guard` statement in the Swift programming language, it helps ensure that certain conditions are met before proceeding with execution. If a condition fails, it exits early with a structured error.

It is particularly useful for validating arguments in functions or properties in objects at the beginning of a method. The wrapper uses the `neverthrow` `Result` type to return either a success signal or a detailed error.

This utility is located at `src/core/shared/utils/miscellaneous/guard/index.ts`.

## Class: `GuardWrapper`

### `check(value: unknown, keyHint?: string)`

Adds a **required** value to the validation chain. The `validate` method will fail if this value is `null`, `undefined`, or an empty string (`''`).

**Parameters:**

-   `value` (`unknown`): The value to check.
-   `keyHint` (`string`, optional): A descriptive name for the value, used to create more informative error messages.

**Returns:** `GuardWrapper` - The instance of the `GuardWrapper` to allow for method chaining.

### `optional(value: unknown, keyHint?: string)`

Adds an **optional** value to the validation chain. The `validate` method will fail only if this value is an empty string (`''`). `null` and `undefined` are considered valid (i.e., the value is simply not present).

**Parameters:**

-   `value` (`unknown`): The value to check.
-   `keyHint` (`string`, optional): A descriptive name for the value.

**Returns:** `GuardWrapper` - The instance of the `GuardWrapper` for chaining.

### `validate()`

Executes the validation against all the values added via `check` and `optional`. It processes them in the order they were added and returns immediately upon the first failure.

**Returns:** `Result<VoidResult, ResultError>`
-   `Ok<VoidResult>`: If all validations pass.
-   `Err<ResultError>`: If any validation fails, containing a `ResultError` with a `BAD_REQUEST` status code and a message indicating which check failed.

## Usage Example

```typescript
import { GuardWrapper } from './guard';
import { Result } from 'neverthrow';

function processUserData(name: string, age: number | null, email?: string) {
  const guardResult = new GuardWrapper()
    .check(name, 'userName')
    .check(age, 'userAge')
    .optional(email, 'userEmail')
    .validate();

  if (guardResult.isErr()) {
    // The guard clause failed, return the error
    return guardResult;
  }

  // All checks passed, proceed with the logic
  console.log(`Processing user: ${name}, Age: ${age}, Email: ${email || 'N/A'}`);
  // ... function logic here
  return Result.ok({ success: true });
}

// --- Scenarios ---

// 1. Valid data
const result1 = processUserData('John Doe', 30, 'john.doe@example.com');
if (result1.isErr()) console.error('Failure 1:', result1.error.message);


// 2. Missing required value ('name' is an empty string)
const result2 = processUserData('', 30);
if (result2.isErr()) console.error('Failure 2:', result2.error.message);
// Output: Failure 2: Required value [userName] is missing or invalid

// 3. Invalid optional value ('email' is present but empty)
const result3 = processUserData('Jane Doe', 25, '');
if (result3.isErr()) console.error('Failure 3:', result3.error.message);
// Output: Failure 3: Optional value [userEmail] is present but invalid

// 4. Missing optional value (valid case)
const result4 = processUserData('Sam Smith', 40, undefined);
if (result4.isErr()) console.error('Failure 4:', result4.error.message);
```
