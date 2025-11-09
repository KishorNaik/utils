# Delegate Types

This file defines a collection of generic function types inspired by the common **delegate** types in the .NET Framework, such as `Action`, `Func`, and `Predicate`.

In .NET, a delegate is a type that represents a reference to a method with a specific signature. These TypeScript types serve a similar purpose: they provide standardized, semantically clear names for common function signatures, making the code easier to read and understand, especially for developers with a C# background.

These types are defined within the `DelegateWrapper` namespace.

This utility is located at `src/core/shared/utils/helpers/delegates/index.ts`.

## Namespace: `DelegateWrapper`

### `Action<T extends any[]>`

Represents a function that accepts a list of arguments but does not return a value (`void`). This is analogous to the .NET `System.Action` delegate.

- **Signature:** `(...arg: T) => void`

#### Usage Example

```typescript
import { DelegateWrapper } from './delegates';

// This function matches the Action<[string, number]> signature
const logMessage: DelegateWrapper.Action<[string, number]> = (level, code) => {
	console.log(`Log Level: ${level}, Code: ${code}`);
};

logMessage('INFO', 200);
```

### `Func<T extends any[], TResult>`

Represents a function that accepts a list of arguments and returns a value of type `TResult`. This is analogous to the .NET `System.Func` delegate.

- **Signature:** `(...args: T) => TResult`

#### Usage Example

```typescript
import { DelegateWrapper } from './delegates';

// This function matches the Func<[number, number], string> signature
const addAndFormat: DelegateWrapper.Func<[number, number], string> = (a, b) => {
	const sum = a + b;
	return `The sum is ${sum}`;
};

const result = addAndFormat(10, 5);
console.log(result); // "The sum is 15"
```

### `Predicate<T>`

Represents a special type of `Func` that takes a single argument and returns a `boolean` value. Predicates are typically used to test whether an item satisfies a certain condition. This is analogous to the .NET `System.Predicate<T>` delegate.

- **Signature:** `(arg: T) => boolean`

#### Usage Example

```typescript
import { DelegateWrapper } from './delegates';

interface User {
	id: number;
	isActive: boolean;
}

// This function matches the Predicate<User> signature
const isActiveUser: DelegateWrapper.Predicate<User> = (user) => {
	return user.isActive;
};

const users: User[] = [
	{ id: 1, isActive: true },
	{ id: 2, isActive: false },
	{ id: 3, isActive: true },
];

const activeUsers = users.filter(isActiveUser);
console.log(activeUsers); // [{ id: 1, isActive: true }, { id: 3, isActive: true }]
```
