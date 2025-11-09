# `Lazy<T>`

The `Lazy<T>` class provides a mechanism for lazy initialization, inspired by the `Lazy<T>` class in the .NET Framework. It defers the creation of an object until it is first accessed. This can be useful for improving performance by avoiding unnecessary computations or resource allocations, especially for objects that are expensive to create and may not be used at all.

This class is located at `src/core/shared/utils/miscellaneous/lazy/index.ts`.

## Class: `Lazy<T>`

A generic class that encapsulates the logic for lazy initialization.

### `constructor(factory: () => T)`

The constructor for the `Lazy<T>` class.

**Parameters:**

- `factory` (`() => T`): A function that, when called, returns the value of type `T`. This function is executed only once, the first time the `value` property is accessed.

### `get value(): T`

A getter property that returns the lazily initialized value. On the first access, it calls the factory function provided in the constructor to create the value, caches it, and returns it. Subsequent accesses will return the cached value without re-executing the factory function.

**Returns:** `T` - The lazily initialized value.

## Usage Example

```typescript
import { Lazy } from './lazy';

// An expensive object to create
class HeavyObject {
	constructor() {
		console.log('HeavyObject created');
	}

	doSomething() {
		console.log('Doing something...');
	}
}

// The factory function for the HeavyObject
const heavyObjectFactory = () => new HeavyObject();

// Create a Lazy instance with the factory
const lazyHeavyObject = new Lazy<HeavyObject>(heavyObjectFactory);

console.log('Lazy instance created, but the object is not yet initialized.');

// Access the 'value' property to get the object
// This is where the factory is called for the first time
const instance1 = lazyHeavyObject.value;
instance1.doSomething();

// Access the 'value' property again
// The factory is NOT called this time; the cached instance is returned
const instance2 = lazyHeavyObject.value;

// Verify that both instances are the same
console.log(instance1 === instance2); // true
```

**Output of the example:**

```
Lazy instance created, but the object is not yet initialized.
HeavyObject created
Doing something...
true
```
