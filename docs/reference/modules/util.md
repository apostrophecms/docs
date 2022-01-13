---
sidebarDepth: 2
---

# `@apostrophecms/util`

**Alias:** `apos.util`

The `@apostrophecms/util` module contains utility methods and tools that do not primarily operate with any particular other module.

## Options

|  Property | Type | Description |
|---|---|---|
|`logger` | Function | A function that accepts the Apostrophe instance object (`self.apos`) and returns an object with at least `info`, `debug`, `warn`, and `error` methods for logging messages. Similarly named `util` module methods use these functions. See [the default logger function](https://github.com/apostrophecms/apostrophe/blob/main/modules/@apostrophecms/util/lib/logger.js) for an example. Overrides should be written with support for substitution strings. See the [`console.log` documentation](https://developer.mozilla.org/en-US/docs/Web/API/Console/log). |
| `stackLimit` | Integer | Defaults to 50. This is the maximum size of the asynchronous stack, tracking active widget loaders, async components, and relationship loaders. |

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/util/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

Because this module has an alias, you can call these from another module from the alias path. For example, `self.apos.util.log()`.

### Logging utilities

The descriptions for `log`, `info`, `debug`, `warn`, and `error` below reflect default behavior. See the `logger` option description above for information about custom behavior.

#### `log(msg)`

Logs a message or input, `msg`. The default implementation wraps `console.log` and passes on all arguments, so substitution strings may be used.

If a `logger` option function does not include a `log` function, the `info` method will be used. This allows an instance of [bole](https://www.npmjs.com/package/bole) or similar loggers to be passed to the `logger` option.

#### `info(msg)`

Logs a informational message. The default implementation wraps `console.info` and passes on all arguments, so substitution strings may be used.

#### `debug(msg)`

Logs a debugging message. The default implementation wraps `console.debug` (or `console.log` if that's unavailable) and passes on all arguments, so substitution strings may be used.

#### `warn(msg)`

Logs a warning message. The default implementation wraps `console.warn` and passes on all arguments, so substitution strings may be used.

#### `warnDev(msg)`

Identical behavior to [`apos.util.warn`](#warn-string) except that the warning is not displayed if `process.env.NODE_ENV` is `production`. It will log the message every time it is called. See `warnDevOnce()` for a quieter version when messages may become repetitive.

#### `warnDevOnce(name, msg)`

Identical to `apos.util.warnDev`, except that the warning is only displayed once for each registered `name`. `name` should be a string not already used in an unrelated `warnDevOnce` call.

Example:
```javascript
apos.util.warnDevOnce('github-connection-error', 'There was an error connecting to your Github account.')
```

The warnings will be allowed in production mode if the command line option `--all-[name]` is present when running the app (or CLI task): `node app --all-github-connection-error`.

All warnings for a particular name will be *muted* if the option `--ignore-[name]` is used: `node app --ignore-github-connection-error`.

#### `error(msg)`

Logs an error message. The default implementation wraps `console.error` and passes on all arguments, so substitution strings may be used.

### String manipulation methods

#### `globalReplace(source, target, replacement)`

Globally replaces a target string within a source string. This allows global string replacement without using regular expressions. Arguments are:

- **`source`**: A string that will be mutated by replacing substrings.
- **`target`**: A string that should be replaced every time it appears in `source`.
- **`replacement`**: A string used to replace `target` wherever it appears in `source`.

#### `truncatePlaintext(string, length, pruneString)`

Truncate a `string` at the specified number of characters (`length`) without breaking words if possible. `pruneString` will be used at the end of the result as long as it does not force the end result to be longer than `length`. `'...'` will be used if `pruneString` is omitted.

See the [Underscore.String.js `prune` function](https://gabceb.github.io/underscore.string.site/#prune), of which this is a copy (replacing RegExp with XRegExp for better UTF-8 support).

#### `escapeHtml(string, options)`

Escape a plaintext `string` correctly for use in HTML. `options` is an object of options, but may be omitted.

If `{ pretty: true }` is in the `options` object, new lines become `br` tags, and URLs become links to those URLs. Otherwise this does basic escaping. For backwards compatibility, if the second argument is truthy and not an object, `{ pretty: true }` is assumed.

If `{ single: true }` is in the `options` object, single-quotes are escaped, otherwise double-quotes are escaped.

#### `htmlToPlaintext(htmlString)`

A method to convert a string of HTML to simple plain text (no rich text indicators). This is meant for basic HTML conversion, such as converting the contents of a piece's rich text widget teaser into unformatted text to be displayed on the index page. It returns a string of plain text.

#### `capitalizeFirst(string)`

`capitalizeFirst` accepts a string argument and returns the string with the first letter capitalized.

#### `cssName(camelString)`

This method is used to convert "camel case" strings (`spiderMan`) into CSS-friendly "kebab case" (`spider-man`). It returns the converted string.

#### `camelName(string)`

This method converts a string to camel case and returns the converted string. Any characters that are not alphanumeric will be removed and the following character (if alphanumeric) will be capitalized.

#### `addSlashIfNeeded(path)`

`addSlashIfNeeded()` accepts a string and returns it with a slash at the end only if there is not one already. It is useful for ensuring uniform URL paths in code.

#### `slugify(string, options)`

This is a wrapper for the [sluggo](https://www.npmjs.com/package/sluggo) utility. It accepts a string and options object. It returns the string lower cased and with spaces and non-alphanumeric characters replaced with a dash (by default). See the sluggo documentation for other options.

#### `sortify(string)`

`sortify` does the same thing as `slugify`, but whitespace and non-alphanumeric characters are replaced with a single space instead of a dash. This is used to make strings uniform for sorting, including for populating document properties such as `titleSortified` that store the uniform version.

### Other utility methods

#### `generateId()`

Returns a unique identifier (ID) for a new page or other object. IDs are generated with the `cuid` module which prevents collisions and ensures a certain level of complexity. This should not be used for passwords, however.

#### `md5(string)`

Perform an md5 checksum on a string. Returns a hex string.

#### `async md5File(filepath)`

Perform an md5 checksum on a file at a given path. Async. Returns a Promise that resolves to a hex string.

#### `async fileLength(filepath)`

Accepts a file path and returns a Promise that resolves to the file size in bytes.

#### `clonePermanent(object, keepScalars)`

Clone the given object recursively, discarding all properties whose names begin with underscores (`_`) except for `_id`. Returns the cloned object.

This removes the output of relationships and other dynamic loaders, so that dynamically available content is not stored redundantly in MongoDB. Object values that are `Date` objects are cloned as such. All other non-JSON objects are cloned as plain JSON objects.

If `keepScalars` is true, properties beginning with underscores are kept as long as they are not objects. This is useful when using `clonePermanent` to limit JSON inserted into browser attributes, rather than filtering for the database. Preserving simple string properties like `_url` is usually a good thing in the former case.

If the `object` argument is an array, the clone is also an array. Arrays are cloned as such only if they are true arrays (`Array.isArray()` returns `true`).

#### `orderById(ids, items, idProperty)`

`ids` should be an array of MongoDB identifiers (`_id` properties). The elements of the `items` array, which should be the result of a mongodb query, are returned in the order specified by `ids` array.

This is useful after performing an `$in` query with MongoDB (`$in` does _not_ sort its results in the order given). Any IDs that do not actually exist for an item in the `items` array are not returned, and vice versa. You should not assume the result will have the same length as either array.

Optionally you may specify a property name other than `_id` as the third argument (`idProperty`). You may use dot notation in this argument.

#### `isAjaxRequest(req)`

Returns `true` if the `req` request object is an AJAX request (`req.xhr` is set, or `req.query.xhr` is set to emulate it) _and_ Apostrophe's main content area refresh mechanism is not in play (`req.query.aposRefresh` is not `'1'`).

#### `insensitiveSort(strings)`

Sort an array of strings (`strings`) in place (does not return), comparing strings in a case-insensitive way.

#### `insensitiveSortByProperty(objects, property)`

Sort an array of objects (`objects`) in place (does not return), based on the value of the given `property` of each object, in a case-insensitive way.

#### `findNestedObjectById(object, _id, options)`

Within an `object` (typically a full content document or widget object), find and return a nested object with the given `_id` property. This works regardless of the target object's nesting depth. Useful to locate a specific widget within a document.

Pass `{ ignoreDynamicProperties: true }` as the `options` argument to skip objects set on dynamic properties (those starting with `_`) during this check.

#### `findNestedObjectAndDotPathById(object, _id, options)`

Similar to `findNestedObjectById`. Within an `object` (typically a full content document or widget object), find a nested object with the given `_id` property. This works regardless of the target object's nesting depth. Useful to locate a specific widget within a document.

Unlike `findNestedObjectById`, **this returns an object with two properties:**
- `object`: The target object as returned by the other method.
- `dotPath`: The dot notation path to the target object.

Pass `{ ignoreDynamicProperties: true }` as the `options` argument to skip objects set on dynamic properties (those starting with `_`) during this check.

#### `getManagerOf(object)`

Given a widget or document object, this returns the appropriate manager module.

#### `get(obj, path)`

Returns the value at the given `path` from the object or array `obj`.

`path` supports dot notation like MongoDB. If the first dot notation segment of `path` begins with `@xyz` (or `@` followed by any alphanumeric value) the nested object within `obj` with an `_id` property equal to `xyz` is found and returned, no matter how deeply nested it is.

#### `set(obj, path, val)`

Set a value (`val`) at the provided `path` within the object or
array `obj`, mutating `obj`.

`path` supports dot notation like MongoDB. If the first dot notation segment of `path` begins with `@xyz` (or `@` followed by any alphanumeric value) the nested object within `obj` with an `_id` property equal to `xyz` is located, no matter how deeply nested it is. If `@xyz` is the full `path` argument, the nested object is replaced with `val`. If there are further components via dot notation, they are used to locate the final location for `val`.

The `@` syntax works only for locating nested objects. You may not pass `@abc` where `abc` is the `_id` of `obj` itself.

#### `cloneReq(req, properties)`

Returns a *new* `req` object with the properties of the original plus any in the optional `properties` parameter. Used when a request object with one change is desired, such as `mode: 'published'`. Avoids the need to push and pop properties of the original `req`. Also available as `req.clone(properties)`.

## Template helpers

Template helpers are methods available for use in template files. Because this module has an alias, you can call these in templates using the alias path. For example, `apos.util.log()`.

Some of these utility helpers replicate JavaScript APIs that are not available in Nunjucks templates natively.

#### `slugify(string, options)`

A wrapper of the [`slugify()` method](#slugify-string-options) described above.

### `log(msg)`

A wrapper of the [`log()` method](#log-msg) described above.

### `generateId()`

A wrapper of the [`generateId()` method](#generateid) described above.

### `isCurrentYear(d)`

Returns `true` if the `Date` object (`d`) refers to a date in the current year.

### `isUndefined(val)`

Returns `true` if the value `val` is strictly equal to `undefined`.

### `isFalse(val)`

Returns `true` if the value `val` is strictly equal to `false`.

### `isFunction(val)`

Returns `true` if the value `val` is a function (`typeof val === 'function'`).

### `startCase(str)`

Returns a string `str` to start case (first letter of each word is capitalized).Used to make default labels out of camel case property names.

### `eqStrict(a, b)`

Returns `true` if values `a` and `b` are strictly equal. The Nunjucks template syntax does not recognize `===` to test this.

### `contains(list, val)`

Returns `true` if the list `list` contains the specified value, `val`. `list` may be an array, object, or string (to look for a substring). This uses the [lodash `includes` method](https://lodash.com/docs/4.17.15#includes).

If `val` is an array, this returns `true` if the list contains *any of* the specified values.

### `containsProperty(list, prop)`

Returns `true` if the list contains *at least* one object with the named property, `prop`. `list` may be an array, object, or string (to look for a substring). This uses the [lodash `has` method](https://lodash.com/docs/4.17.15#has).

If `list` is a single object, this function returns `true` if that object has a property `prop`.

## Object and array helpers

### `inspect(obj)`

Logs the properties of an object, `obj`, in detail. Invokes the Node.js [`util.inspect()`](https://nodejs.org/docs/latest-v8.x/api/util.html#util_util_inspect_object_options) method on the object, to a depth of 10.

### `reverse(arr)`

Returns the array, `arr`, in reverse order.

### `beginsWith(list, val)`

If the `list` argument is a string, returns `true` if it starts with the value `val`. If the `list` argument is an array, returns true if *at least one* of its items begins with `val`.

### `find(arr, prop, val)`

Finds and returns the *first* array (`arr`) item, if any, that has the specified value (`val`) for the specified property (`prop`).

### `filter(arr, prop, val)`

Finds and returns *all* array (`arr`) items, if any, that have the specified value (`val`) for the specified property (`prop`).

### `reject(arr, prop, val)`

Returns the array (`arr`), *filtering out* any items, if any, that have the specified value (`val`) for the specified property (`prop`).

### `filterNonempty(arr, prop)`

Finds and returns *all* array (`arr`) items, if any, that have *truthy values* for the specified property (`prop`).

### `filterEmpty()`

Finds and returns *all* array (`arr`) items, if any, that have *falsy values* for the specified property (`prop`).

### `isEmpty(obj)`

Returns `true` if the specified array or object (`obj`) is considered empty Objects are empty if they have no own enumerable properties. Arrays are considered empty if they have a length of 0.

### `pluck(arr, prop)`

Given an *array of objects* (`arr`) with the given property (`prop`), return an array with the value of that property for each object.

### `omit(obj, paths)`

Given an object (`obj`), returns an object without the named path or property paths (`paths`). `paths` may be a string or array of strings.

### `difference(arr1, arr2, prop)`

Given the arrays `arr1` and `arr2`, this returns a subset of elements in `arr1` that *do not* appear in `arr2`. If `arr2` is not an array it is treated as an empty array.

If `prop` is present, then that property of each object in `arr1` is compared to `arr2` items. This is useful when `arr1` contains field choice objects (e.g., in [select fields](/reference/field-types/select.md#choices-configuration)) with a `value` property, while `arr2 `just contains actual values.

A deep comparison is performed with the [lodash `isEqual` method](https://lodash.com/docs/4.17.15#isEqual).

### `concat(arr1, arr2, /* arr3, arr4... */)`

Concatenate all of the array and/or value arguments into a single array. If an argument is an array, all of its elements are individually added to the
resulting array. If an argument is a non-array value, it is added directly to the array.

### `groupBy(items, key)`

Returns an object that groups items in a collection (`items`) by the property named by `key` on each of the values.

If the first item in `items` has an array on the property named by `key`, this returns an object that groups each item by their shared array values.

### `object(/* key1, value1, key2, value2... */)`

Given a series of alternating keys and values, this function returns an object with the keys set to the following values. For instance, `apos.util.object('name', 'bob')` returns `{ name: 'bob' }`. This is useful since Nunjucks does not allow you to create an object with a property whose name is unknown at the time the template is written.

### `merge(/* obj1, obj2, obj3... */)`

This helper accepts any number of object arguments. It then merges them into a new object and the returns resulting object. If several objects have a property, the last object passed in wins.

If any argument is `null`, it is skipped gracefully. This allows you to pass in an unexamined variable without checking if it is `null`.
