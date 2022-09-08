---
extends: '@apostrophecms/module'
---

# `@apostrophecms/cache`

**Alias:** `apos.cache`

<AposRefExtends :module="$frontmatter.extends" />

The `@apostrophecms/cache` module is a general-purpose cache implementation for improved performance in all areas where results can be retained and reused temporarily. Any number of distinct cache objects can be created, each identified by unique names. It is powered by a MongoDB collection.

## Methods

### `set(namespace, key, value, lifetime)`
The `set()` method is asynchronous and should be called with an await to insure that any data is cached prior to trying to retrieve it. The method takes four parameters. The first, `namespace`, takes a string that specifies the name of the cache where data should be stored. The `key` parameter takes a string and is the identifier that can be used to retrieve the item to be stored. The `value` parameter takes any JSON-friendly value and does not need to be stringified. The optional `lifetime` parameter takes the number of seconds for the value to exist as an integer. If set to zero or unspecified then there won't be an expiration time. However, the caches should not be used for primary storage as they could be cleared at some point.

#### Example

```javascript
…
const response = await fetch('https://api.endpoint.com', {options});
const data = await response.json();
// let's cache for an hour = 60 seconds * 60 minutes = 3600 
const cache = await self.apos.cache.set('apiData', 'specificData', data, 3600);
…
```

### `get(namespace, key)`
The `get()` method is asynchronous and should be called with an await. It allows you to retrieve a value that was previously added to the database by the `set()` method. The retrieved value is specified by the same `namespace` string and `key` string used in the `set()` method. This method returns the cached value or `undefined` if the specified key does not exist.

#### Example

```javascript
…
const specificData = await self.apos.cache.get('apiData', 'specificData');
if (specificData === undefined) {
  console.Error('That specificData does not exist');
}
…
```

### `clear(namespace)`
The `clear()` method is an asynchronous method and should be called with await. The method clears all values within a cache designated by the `namespace` argument, which matches the string used in the `set()` method.

::: note
Calling the `set()` method with an existing `namespace` and `key` will overwrite the existing data. It isn't necessary to clear the namespace and potentially clear other cached values.
:::

## Module tasks

### `clear-cache <namespace(s)>`
This CLI task will clear all of the values in the supplied namespace(s).

Full command: `node app @apostrophecms/cache:clear-cache namespace1 namespace2`
