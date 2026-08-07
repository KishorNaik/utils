# Collections

The `collections` module exposes typed data structures and collection helpers that make common list, dictionary, queue, and stack operations easier to use in TypeScript.

These utilities are exported from `src/core/exports/packages/index.ts` via `ts-generic-collections-linq`, and they are intended to provide a consistent API for working with collection-based data across the repository.

## Exported Collection Types

- `List<T>` — a resizable, ordered list with LINQ-style traversal and transformation support.
- `Dictionary<TKey, TValue>` — a key/value map for fast lookups by key.
- `SortedDictionary<TKey, TValue>` — a dictionary that maintains entries in sorted key order.
- `Queue<T>` — a first-in, first-out collection for sequential processing.
- `Stack<T>` — a last-in, first-out collection for push/pop workflows.
- `RandomizedQueue<T>` — a queue that removes items in random order.

## When to use these collections

Use these typed collections when you need a richer abstraction than plain arrays or objects:

- `List<T>` for list operations with expressive iteration and query support.
- `Dictionary<TKey, TValue>` for keyed lookup data structures.
- `SortedDictionary<TKey, TValue>` when insertion order must follow a sorted key sequence.
- `Queue<T>` for task queues, event pipelines, or processing sequences.
- `Stack<T>` for undo/redo stacks, backtracking, or nested state management.
- `RandomizedQueue<T>` for randomized sampling or shuffled dequeue behavior.

## Quick start

```ts
import { List, Dictionary, Queue, Stack, RandomizedQueue } from '@kishornaik/utils';

const users = new List<string>();
users.add('alice');
users.add('bob');
users.add('carol');

const found = users.where((x) => x.startsWith('b')).toArray();

const settings = new Dictionary<string, string>();
settings.add('theme', 'dark');
settings.add('locale', 'en-US');

const queue = new Queue<number>();
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);
const next = queue.dequeue();

const stack = new Stack<string>();
stack.push('first');
stack.push('second');
const last = stack.pop();

const randomQueue = new RandomizedQueue<number>();
randomQueue.enqueue(10);
randomQueue.enqueue(20);
randomQueue.enqueue(30);
const randomItem = randomQueue.dequeue();
```

## List<T>

`List<T>` is the most feature-rich collection in this library. It implements LINQ-style enumerable behavior and includes common list-manipulation methods.

### Creating and populating a list

```ts
import { List } from '@kishornaik/utils';

const numbers = new List<number>([1, 2, 3]);
const moreNumbers = new List<number>();
moreNumbers.addRange([4, 5, 6]);
```

### List operations

```ts
const items = new List<string>(['alpha', 'beta', 'gamma']);

items.add('delta');
items.addRange(['epsilon', 'zeta']);
items.remove((x) => x === 'beta');
items.removeAt(1);
items.clear();
```

### LINQ-style examples for List<T>

```ts
import { List } from '@kishornaik/utils';

interface Product {
	id: number;
	name: string;
	category: string;
	price: number;
}

const products = new List<Product>([
	{ id: 1, name: 'Pen', category: 'office', price: 1.5 },
	{ id: 2, name: 'Notebook', category: 'office', price: 4.0 },
	{ id: 3, name: 'Mug', category: 'kitchen', price: 8.0 },
	{ id: 4, name: 'Desk Lamp', category: 'office', price: 20.0 },
]);

const third = products.elementAt(2);
const hasOffice = products.any((item) => item.category === 'office');
const allOffice = products.all((item) => item.category === 'office');
const singleMug = products.single((item) => item.name === 'Mug');
const firstProduct = products.first();
const lastProduct = products.last();
const singleOrDefault = products.singleOrDefault((item) => item.id === 99);
const firstOrDefault = products.firstOrDefault((item) => item.price > 100);
const lastOrDefault = products.lastOrDefault((item) => item.category === 'office');

const officeItems = products.where((item) => item.category === 'office').toArray();
const productNames = products.select((item) => item.name).toArray();
const categoryWords = products.selectMany((item) => item.name.split(' ')).toArray();

const suppliers = new List<{ code: string; name: string }>([
	{ code: 'office', name: 'Office Supply Co.' },
	{ code: 'kitchen', name: 'Kitchen Goods Ltd.' },
]);

const joined = products
	.join(
		suppliers,
		(product) => product.category,
		(supplier) => supplier.code,
		(product, supplier) => ({ product: product.name, supplier: supplier.name })
	)
	.toArray();

const grouped = products.groupBy((item) => [item.category]).toArray();

const ordered = products
	.orderBy({
		compare: (x, y) => x.price - y.price,
	})
	.toArray();

const distinctCategories = products
	.select((item) => item.category)
	.distinct({
		equals: (a, b) => a === b,
		hashCode: (value) => value.hashCode?.() ?? 0,
	})
	.toArray();

const unionProducts = products
	.union(new List<Product>([{ id: 5, name: 'Pencil', category: 'office', price: 0.8 }]))
	.toArray();
const reversed = products.reverse().toArray();
const skipped = products.skip(1).take(2).toArray();
const totalPrice = products.sum((item) => item.price);
const averagePrice = products.avg((item) => item.price);
const minPrice = products.min((item) => item.price);
const maxPrice = products.max((item) => item.price);
const countOffice = products.count((item) => item.category === 'office');
products.forEach((item) => console.log(item.name));
const productArray = products.toArray();
const enumerable = products.asEnumerable();
const length = products.length;
```

## Dictionary<TKey, TValue> and SortedDictionary<TKey, TValue>

These collections store key/value pairs and support lookup-oriented operations.

### Creating and using dictionaries

```ts
import { Dictionary, SortedDictionary } from '@kishornaik/utils';

const settings = new Dictionary<string, string>();
settings.add('theme', 'dark');
settings.add('locale', 'en-US');

const exists = settings.containsKey('theme');
const value = settings.tryGetValue('theme');

const sorted = new SortedDictionary<number, string>();
sorted.add(3, 'c');
sorted.add(1, 'a');
sorted.add(2, 'b');
```

### Dictionary operations

```ts
const dictionary = new Dictionary<string, number>();
dictionary.add('one', 1);
dictionary.add('two', 2);

dictionary.remove((x) => x.key === 'one');
dictionary.removeAt(0);
dictionary.clear();

const hasValue = dictionary.containsValue(2);
```

### LINQ-style examples for dictionaries

```ts
const dictionary = new Dictionary<string, number>();
dictionary.add('one', 1);
dictionary.add('two', 2);
dictionary.add('three', 3);

const entries = dictionary.where((x) => x.value > 1).toArray();
const keys = dictionary.select((x) => x.key).toArray();
const values = dictionary.select((x) => x.value).toArray();
const firstEntry = dictionary.first();
```

## Queue<T> and RandomizedQueue<T>

These collections model first-in-first-out behavior, with `RandomizedQueue<T>` removing items at random.

### Queue examples

```ts
import { Queue, RandomizedQueue } from '@kishornaik/utils';

const queue = new Queue<number>();
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);

const next = queue.dequeue();
const peeked = queue.peek();
queue.clear();
```

### RandomizedQueue examples

```ts
const randomQueue = new RandomizedQueue<number>();
randomQueue.enqueue(10);
randomQueue.enqueue(20);
randomQueue.enqueue(30);

const peeked = randomQueue.peek();
const removed = randomQueue.dequeue();
```

## Stack<T>

`Stack<T>` provides last-in-first-out behavior and is useful for backtracking, undo/redo flows, and recursive traversal.

### Stack examples

```ts
import { Stack } from '@kishornaik/utils';

const stack = new Stack<string>();
stack.push('first');
stack.push('second');

const last = stack.pop();
const peeked = stack.peek();
stack.clear();
```

## API summary

The collection library provides the following public capabilities:

- `List<T>`: `add`, `addRange`, `remove`, `removeAt`, `clear`, plus LINQ-style methods such as `elementAt`, `any`, `all`, `single`, `first`, `last`, `where`, `select`, `selectMany`, `join`, `groupBy`, `orderBy`, `distinct`, `union`, `reverse`, `skip`, `take`, `sum`, `avg`, `min`, `max`, `count`, `forEach`, `toArray`, `asEnumerable`
- `Dictionary<TKey, TValue>` / `SortedDictionary<TKey, TValue>`: `add`, `addRange`, `remove`, `removeAt`, `clear`, `containsKey`, `containsValue`, `tryGetValue`, plus LINQ-style enumeration over key/value entries
- `Queue<T>` / `RandomizedQueue<T>`: `enqueue`, `dequeue`, `peek`, `contains`, `clear`, `forEach`, `toArray`
- `Stack<T>`: `push`, `pop`, `peek`, `contains`, `clear`, `forEach`, `toArray`

## Notes

These collection objects are strongly typed and designed to improve clarity and safety when working with structured data. They are especially useful in scenarios where array or object primitives do not clearly express a collection’s intended behavior.
