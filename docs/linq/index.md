# LINQ

The `linq` module provides a lightweight, chainable API for querying arrays, objects, and other enumerable sequences in a .NET-inspired style. It is useful when you want expressive transformations and filters without resorting to imperative loops.

This package re-exports `Enumerable` from the upstream `linq` library for convenience in the shared utilities package.

## Import

```ts
import { Enumerable } from '@kishornaik/utils';
```

## API reference overview

The upstream implementation exposes a broad set of methods. The examples below are grouped by capability so developers can quickly find the right pattern for their use case.

### 1. Creating sequences

```ts
const numbers = Enumerable.from([1, 2, 3, 4, 5]);
const range = Enumerable.range(1, 5).toArray();
const rangeDown = Enumerable.rangeDown(5, 3).toArray();
const rangeTo = Enumerable.rangeTo(1, 5).toArray();
const repeated = Enumerable.repeat('x', 3).toArray();
const generated = Enumerable.generate(() => Math.random(), 3).toArray();
const infinite = Enumerable.toInfinity(1).take(5).toArray();
const negativeInfinite = Enumerable.toNegativeInfinity(5).take(5).toArray();
const unfolded = Enumerable.unfold(1, (x) => x * 2)
	.take(5)
	.toArray();
const choice = Enumerable.choice(1, 2, 3).toArray();
const cycle = Enumerable.cycle([1, 2, 3]).take(5).toArray();
const empty = Enumerable.empty().toArray();
const made = Enumerable.make('value').toArray();
const matched = Enumerable.matches('abc123def456', /\d+/g).toArray();

let created = 0;
const finalized = Enumerable.repeatWithFinalize(
	() => ({ id: ++created }),
	(item) => console.log('released', item.id)
)
	.take(2)
	.toArray();

const deferred = Enumerable.defer(() => Enumerable.from([10, 20, 30])).toArray();
```

### 2. Filtering, projection, and flattening

```ts
const values = Enumerable.from([1, 2, 3, 4, 5, 6]);
const evens = values
	.where((x) => x % 2 === 0)
	.select((x) => x * 10)
	.toArray();

const withIndex = Enumerable.from(['alpha', 'beta', 'gamma'])
	.select((value, index) => ({ value, index }))
	.toArray();

const words = Enumerable.from(['hello', 'world'])
	.selectMany((value) => value.split(''))
	.toArray();

const pairs = Enumerable.from([10, 20, 30])
	.pairwise((prev, curr) => prev + curr)
	.toArray();
const scanned = Enumerable.from([1, 2, 3])
	.scan(0, (acc, value) => acc + value)
	.toArray();
const chosen = Enumerable.from([1, 2, 3, 4])
	.choose((x) => (x % 2 === 0 ? x * 10 : null))
	.toArray();
const typed = Enumerable.from([1, 'two', true]).ofType(Number).toArray();
const flattened = Enumerable.from([
	[1, 2],
	[3, 4],
])
	.flatten()
	.toArray();

const tree = Enumerable.from([1, 2, 3])
	.traverseBreadthFirst((x) => [x + 1, x + 2])
	.take(6)
	.toArray();
const treeDepth = Enumerable.from([1])
	.traverseDepthFirst((x) => [x + 1, x + 2])
	.take(6)
	.toArray();

const zipped = Enumerable.from([1, 2, 3])
	.zip(Enumerable.from(['a', 'b', 'c']), (left, right) => `${left}${right}`)
	.toArray();
const merged = Enumerable.from([1, 2])
	.merge(Enumerable.from([3, 4]))
	.toArray();
```

### 3. Joining and grouping data

```ts
const products = Enumerable.from([
	{ id: 1, category: 'office' },
	{ id: 2, category: 'kitchen' },
]);

const categories = Enumerable.from([
	{ code: 'office', name: 'Office Supplies' },
	{ code: 'kitchen', name: 'Kitchen Goods' },
]);

const joined = products
	.join(
		categories,
		(product) => product.category,
		(category) => category.code,
		(product, category) => ({ productId: product.id, categoryName: category.name })
	)
	.toArray();

const leftJoined = products
	.leftJoin(
		categories,
		(product) => product.category,
		(category) => category.code,
		(product, category) => ({ productId: product.id, categoryName: category?.name ?? 'n/a' })
	)
	.toArray();

const grouped = Enumerable.from([
	{ id: 1, name: 'Alice', department: 'Engineering' },
	{ id: 2, name: 'Bob', department: 'Sales' },
	{ id: 3, name: 'Carol', department: 'Engineering' },
])
	.groupBy((x) => x.department)
	.toArray();

const partitioned = Enumerable.from([
	{ id: 1, name: 'Alice', department: 'Engineering' },
	{ id: 2, name: 'Bob', department: 'Sales' },
	{ id: 3, name: 'Carol', department: 'Engineering' },
])
	.partitionBy((x) => x.department)
	.toArray();

const buffered = Enumerable.from([1, 2, 3, 4]).buffer(2).toArray();
```

### 4. Set operations and equality checks

```ts
const distinctValues = Enumerable.from([1, 1, 2, 2, 3]).distinct().toArray();
const distinctUntilChanged = Enumerable.from([1, 1, 2, 2, 3]).distinctUntilChanged().toArray();
const exceptValues = Enumerable.from([1, 2, 3])
	.except(Enumerable.from([3, 4]))
	.toArray();
const intersectValues = Enumerable.from([1, 2, 3])
	.intersect(Enumerable.from([3, 4, 5]))
	.toArray();
const unionValues = Enumerable.from([1, 2, 3])
	.union(Enumerable.from([3, 4, 5]))
	.toArray();
const concatValues = Enumerable.from([1, 2])
	.concat(Enumerable.from([3, 4]))
	.toArray();
const inserted = Enumerable.from([1, 2, 4])
	.insert(2, Enumerable.from([3]))
	.toArray();
const alternated = Enumerable.from([1, 2, 3]).alternate(0).toArray();
const containsValue = Enumerable.from([1, 2, 3]).contains(2);
const defaulted = Enumerable.from<number>([]).defaultIfEmpty(0).toArray();
const equal = Enumerable.from([1, 2, 3]).sequenceEqual([1, 2, 3]);
const hasAny = Enumerable.from([10, 20, 30]).any((x) => x > 25);
const allArePositive = Enumerable.from([10, 20, 30]).all((x) => x > 0);
const emptyCheck = Enumerable.empty().isEmpty();
```

### 5. Ordering and sampling

```ts
const users = Enumerable.from([
	{ id: 1, name: 'Alice' },
	{ id: 2, name: 'Bob' },
	{ id: 3, name: 'Carol' },
]);

const ordered = users.orderBy((x) => x.name).toArray();
const orderedDesc = users.orderByDescending((x) => x.name).toArray();
const reversed = users.reverse().toArray();
const shuffled = users.shuffle().toArray();
const weighted = users
	.weightedSample((x) => x.id)
	.take(2)
	.toArray();

const thenOrdered = users
	.orderBy((x) => x.name)
	.thenBy((x) => x.id)
	.toArray();
const thenOrderedDesc = users
	.orderBy((x) => x.name)
	.thenByDescending((x) => x.id)
	.toArray();
```

### 6. Aggregation and paging

```ts
const numbers = Enumerable.from([10, 20, 30]);

const total = numbers.sum((x) => x);
const average = numbers.average((x) => x);
const minimum = numbers.min((x) => x);
const maximum = numbers.max((x) => x);
const count = numbers.count();
const aggregate = numbers.aggregate(
	0,
	(acc, value) => acc + value,
	(result) => result
);
const maxBy = Enumerable.from([{ value: 1 }, { value: 3 }, { value: 2 }]).maxBy((x) => x.value);
const minBy = Enumerable.from([{ value: 1 }, { value: 3 }, { value: 2 }]).minBy((x) => x.value);

const first = numbers.first();
const firstOrDefault = numbers.firstOrDefault();
const last = numbers.last();
const lastOrDefault = numbers.lastOrDefault();
const single = Enumerable.from([42]).single();
const singleOrDefault = Enumerable.from<number>([]).singleOrDefault();
const elementAt = numbers.elementAt(1);
const elementAtOrDefault = numbers.elementAtOrDefault(5, 0);
const skipped = numbers.skip(1).take(2).toArray();
const skippedWhile = Enumerable.from([1, 2, 3, 4])
	.skipWhile((x) => x < 3)
	.toArray();
const taken = numbers.take(2).toArray();
const takenWhile = Enumerable.from([1, 2, 3, 4])
	.takeWhile((x) => x < 3)
	.toArray();
const exceptLast = Enumerable.from([1, 2, 3, 4]).takeExceptLast(2).toArray();
const fromLast = Enumerable.from([1, 2, 3, 4]).takeFromLast(2).toArray();
const indexOf = Enumerable.from(['a', 'b', 'c']).indexOf('b');
const lastIndexOf = Enumerable.from(['a', 'b', 'c', 'b']).lastIndexOf('b');
```

### 7. Conversion helpers

```ts
const names = Enumerable.from(['Alice', 'Bob', 'Carol']);

const asArray = names.toArray();
const asObject = Enumerable.from([
	{ id: 1, name: 'Alice' },
	{ id: 2, name: 'Bob' },
]).toObject(
	(x) => x.id,
	(x) => x.name
);

const asDictionary = Enumerable.from([
	{ id: 1, name: 'Alice' },
	{ id: 2, name: 'Bob' },
]).toDictionary(
	(x) => x.id,
	(x) => x.name
);

const lookup = Enumerable.from([
	{ id: 1, category: 'office' },
	{ id: 2, category: 'office' },
]).toLookup(
	(x) => x.category,
	(x) => x.id
);

const joinedString = names.toJoinedString(', ');
const jsonString = Enumerable.from([1, 2, 3]).toJSONString();
const castValue = Enumerable.from([1, 2, 3]).cast();
const asEnumerable = Enumerable.from([1, 2, 3]).asEnumerable();
```

### 8. Actions, side effects, and flow control

```ts
Enumerable.from([1, 2, 3])
	.doAction((x) => console.log('visiting', x))
	.forEach((x) => console.log('value', x));

Enumerable.from([1, 2, 3]).force();
```

### 9. Error handling and debugging

```ts
const safe = Enumerable.from([1, 2, 3])
	.doAction(() => {
		throw new Error('boom');
	})
	.catchError((err) => console.error(err))
	.toArray();

Enumerable.from([1, 2, 3])
	.finallyAction(() => console.log('finished'))
	.toArray();
Enumerable.from([1, 2, 3])
	.log((x) => x)
	.toArray();
Enumerable.from([1, 2, 3])
	.trace('trace-label', (x) => x)
	.toArray();
```

### 10. Functional helpers and memoization

```ts
const shared = Enumerable.from([1, 2, 3]).share();
const memoized = Enumerable.from([1, 2, 3]).memoize();
const bound = Enumerable.from([1, 2, 3]).letBind((items) => items.select((x) => x * 2));
```

## Public API inventory

The following public methods are covered by the examples above:

- Static creators: `choice`, `cycle`, `empty`, `from`, `make`, `matches`, `range`, `rangeDown`, `rangeTo`, `repeat`, `repeatWithFinalize`, `generate`, `toInfinity`, `toNegativeInfinity`, `unfold`, `defer`
- Projection and traversal: `flatten`, `pairwise`, `scan`, `select`, `selectMany`, `where`, `choose`, `ofType`, `traverseBreadthFirst`, `traverseDepthFirst`, `zip`, `merge`
- Join and grouping: `join`, `leftJoin`, `groupJoin`, `groupBy`, `partitionBy`, `buffer`
- Set and comparison helpers: `all`, `any`, `isEmpty`, `concat`, `insert`, `alternate`, `contains`, `defaultIfEmpty`, `distinct`, `distinctUntilChanged`, `except`, `intersect`, `sequenceEqual`, `union`
- Ordering helpers: `orderBy`, `orderByDescending`, `reverse`, `shuffle`, `weightedSample`, `thenBy`, `thenByDescending`
- Aggregation and paging: `aggregate`, `average`, `count`, `max`, `min`, `maxBy`, `minBy`, `sum`, `elementAt`, `elementAtOrDefault`, `first`, `firstOrDefault`, `last`, `lastOrDefault`, `single`, `singleOrDefault`, `skip`, `skipWhile`, `take`, `takeWhile`, `takeExceptLast`, `takeFromLast`, `indexOf`, `lastIndexOf`
- Conversion and action helpers: `cast`, `asEnumerable`, `toArray`, `toLookup`, `toObject`, `toDictionary`, `toJSONString`, `toJoinedString`, `doAction`, `forEach`, `force`
- Functional and debugging helpers: `letBind`, `share`, `memoize`, `catchError`, `finallyAction`, `log`, `trace`

## When to use it

- Transforming arrays with readable, chainable syntax.
- Filtering and sorting data for API responses, mapping layers, or domain models.
- Building fluent query pipelines without adding much ceremony to plain JavaScript or TypeScript code.
- Working with collections when a .NET-like LINQ style feels more expressive than raw loops.
