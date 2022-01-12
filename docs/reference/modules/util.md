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

#### `log(string)`

Logs a message passed as a string. The default implementation wraps `console.log` and passes on all arguments, so substitution strings may be used.

If a `logger` option function does not include a `log` function, the `info` method will be used. This allows an instance of [bole](https://www.npmjs.com/package/bole) or similar loggers to be passed to the `logger` option.

#### `info(string)`

Logs a informational message passed as a string. The default implementation wraps `console.info` and passes on all arguments, so substitution strings may be used.

#### `debug(string)`

Logs a debugging message passed as a string. The default implementation wraps `console.debug` (or `console.log` if that's unavailable) and passes on all arguments, so substitution strings may be used.

#### `warn(string)`

Logs a warning message passed as a string. The default implementation wraps `console.warn` and passes on all arguments, so substitution strings may be used.

#### `warnDev(string)`

Identical behavior to [`apos.util.warn`](#warn-string) except that the warning is not displayed if `process.env.NODE_ENV` is `production`. It will log the message every time it is called. See `warnDevOnce()` for a quieter version when messages may become repetitive.

#### `warnDevOnce(name, string)`

Identical to `apos.util.warnDev`, except that the warning is only displayed once for each registered `name`. `name` should be a string not already used in an unrelated `warnDevOnce` call.

Example:
```javascript
apos.util.warnDevOnce('github-connection-error', 'There was an error connecting to your Github account.')
```

The warnings will be allowed in production mode if the command line option `--all-[name]` is present when running the app (or CLI task): `node app --all-github-connection-error`.

All warnings for a particular name will be *muted* if the option `--ignore-[name]` is used: `node app --ignore-github-connection-error`.

#### `error(string)`

Logs an error message passed as a string. The default implementation wraps `console.error` and passes on all arguments, so substitution strings may be used.

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

Escape a plaintext `string` correctly for use in HTML.

If `{ pretty: true }` is in the `options` object, new lines become `br` tags, and URLs become links to those URLs. Otherwise this does basic escaping. For backwards compatibility, if the second argument is truthy and not an object, `{ pretty: true }` is assumed.

If `{ single: true }` is in the `options` object, single-quotes are escaped, otherwise double-quotes are escaped.

#### `htmlToPlaintext(htmlString)`
#### `capitalizeFirst()`
#### `cssName()`
#### `camelName()`
#### `addSlashIfNeeded()`
#### `slugify()`
#### `sortify()`

### Other utility methods

#### `generateId()`

Returns a unique identifier (ID) for a new page or other object. IDs are generated with the `cuid` module which prevents collisions and ensures a certain level of complexity. This should not be used for passwords, however.

#### `md5()`
#### `md5File()`
#### `fileLength()`
#### `searchify()`
#### `clonePermanent()`
#### `orderById()`
#### `isAjaxRequest()`
#### `insensitiveSort()`
#### `insensitiveSortByProperty()`
#### `insensitiveSortCompare()`
#### `findNestedObjectById()`
#### `findNestedObjectAndDotPathById()`
#### `profile()`
#### `now()`
#### `getManagerOf()`
#### `get()`
#### `resolveAtReference()`
#### `set()`
#### `recursionGuard()`
#### `cloneReq()`

## Module tasks

### `reset`

Full command: `node app @apostrophecms/db:reset`

Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed posuere consectetur est at lobortis.
