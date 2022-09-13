---
extends: '@apostrophecms/module'
---

# `@apostrophecms/cache`

**Alias:** `apos.cache`

<AposRefExtends :module="$frontmatter.extends" />

The `@apostrophecms/cache` module is a general-purpose cache implementation for improved performance in all areas where results can be retained and reused temporarily. Any number of namespaces can be used to separately maintain data. It is powered by a MongoDB collection.

## Methods

### `async set(namespace, key, value, lifetime)`
The `set()` method is asynchronous and should be called with an await to insure that any data is cached prior to trying to retrieve it. The method takes four parameters. The first, `namespace`, takes a string and is used to prevent collisions between keys when caching unrelated data. The `key` parameter takes a string and is the identifier that can be used to retrieve the item to be stored. The `value` parameter takes any JSON-friendly value and does not need to be stringified. The optional `lifetime` parameter takes the number of seconds for the value to exist as an integer. If set to zero or unspecified then there won't be an expiration time. However, the cache should not be used for primary storage as it could be cleared at any time, partially cleared to free space, et cetera.

#### Example

```javascript
…
const url = `http://api.weatherapi.com/v1/forcast.json?q=${zipCode}`;
// Check the cache for the data we want
let weatherData = await self.apos.cache.get('weatherApi', zipCode);
if (!weatherData) {
  // The data wasn't cached, so let's get it the hard way
  const response = await fetch(url, {options});
  weatherData = await response.json();
  // let's cache for an hour = 60 seconds * 60 minutes = 3600
  await self.apos.cache.set('weatherApi', zipCode, weatherData, 3600);
}
// Now we can use the data
…
```

### `async get(namespace, key)`
The `get()` method is asynchronous and should be called with await. It allows you to retrieve a value that was previously added to the database by the `set()` method. The retrieved value is specified by the same `namespace` string and `key` string used in the `set()` method. This method returns the cached value or `undefined` if the specified key does not exist in the specified namespace.

#### Example

```javascript
…
// Check the cache for the data we want
const url = `http://api.weatherapi.com/v1/forcast.json?q=${zipCode}`;
// Check the cache for the data we want
let weatherData = await self.apos.cache.get('weatherApi', zipCode);
if (!weatherData) {
  // The data wasn't cached, so let's get it the hard way
  const response = await fetch(url, {options});
  weatherData = await response.json();
  // let's cache for an hour = 60 seconds * 60 minutes = 3600
  await self.apos.cache.set('weatherApi', zipCode, weatherData, 3600);
}
// Now we can use the data
…
```

### `clear(namespace)`
The `clear()` method is an asynchronous method and should be called with await. The method clears all keys that were set with the same `namespace` argument.

::: note
This method clears an entire namespace. To overwrite a single key's value, just call the `set()` method again.
:::

## Module tasks

### `clear-cache <namespace(s)>`
This CLI task will clear all of the values in the supplied namespace(s).

Full command: `node app @apostrophecms/cache:clear-cache namespace1 namespace2`
