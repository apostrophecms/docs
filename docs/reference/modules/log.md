---
extends: '@apostrophecms/module'
---

# `@apostrophecms/log`

**Alias:** `apos.structuredLog`

<AposRefExtends :module="$frontmatter.extends" />

This module provides structured logging for Apostrophe projects. It intercepts the log notifications emitted by the `logDebug()`, `logInfo()`, `logWarn()`, and `logError()` methods of every Apostrophe module and creates new objects. These objects can be sent to third-party logging packages and easily filtered based on event-type and severity.

::: warning
Configuring `logger`, `messageAs`, and `filter` on this module still works, but it can't see the earliest lines of the process — cluster notices and fatal startup failures happen before the module system boots. **New projects should configure these same options under the top-level `log` option in `app.js` instead.** If a top-level `log` option is present, any options set here are ignored, and a startup warning names the ignored keys. See [Logging in ApostropheCMS](/guide/logging.md#the-log-option) for details.
:::

## Options

|  Property | Type | Description |
|---|---|---|
| [`logger`](#logger) | Object/Function | Optional. Used for outputting logs to third-party packages or custom logging functions. |
| [`messageAs`](#messageas) | String | Optional. If this option is set, it converts the log notification from a string and object to just an object with the `messageAs` string as a property with the notification string as value. |
| [`filter`](#filter) | Object | Optional. Takes named objects that determine what log notices are emitted |

### `logger`
The `logger` option can take an object or a function. Any passed function should take `apos` and return an object of methods. Alternatively, the object can be passed directly to `logger`. The object should include methods for `debug()`, `info()`, `warn()`, and `error()` — this is validated when the logger is built, so a misconfigured logger fails loudly at startup rather than silently at the first warning. An example implementation of these methods can be found in the Apostrophe [`util/lib/logger.js` file](https://github.com/apostrophecms/apostrophe/blob/main/packages/apostrophe/modules/%40apostrophecms/util/lib/logger.js). Optionally, this object can also include a `destroy()` method that will be called and awaited during the `apostrophe:destroy` event. Typically the `logger` takes a third-party logging package as value.

The example below configures `logger` on this legacy module directly. For a new project, set the same option under the top-level `log` option in `app.js` instead — see [Popular package setup](/guide/logging.md#popular-package-setup) in the guide for the equivalent Pino, Winston, and Bunyan examples in that form.

<AposCodeBlock>

``` javascript
const { pino } = require('pino');

module.exports = {
  options: {
    logger: pino({
      transport: {
        targets: [
          {
            // output to stdout and stderr
            level: 'debug',
            // if optional pino-pretty package installed
            target: 'pino-pretty',
            options: {}
          },
          {
            // sends error notifications to the error.log file
            level: 'error',
            target: 'pino/file',
            options: {
              destination: './error.log',
              // create the destination file if it does not exist
              mkdir: true
            }
          },
          {
            // sends all notifications to the combined.log file
            level: 'debug',
            target: 'pino/file',
            options: {
              destination: './combined.log',
              mkdir: true
            }
          }
        ]
      }
    }),
    messageAs: 'msg'
  }
};

```

<template v-slot:caption>
/modules/@apostrophecms/log/index.js
</template>
</AposCodeBlock>

### `messageAs`
Some third-party logging packages require an object for each log event. Setting the `messageAs` option to a string will convert the returned log notification from a string plus an object to an object only. The value of this option will be used as a key in the new object and the notification string will be added as value.

For example:
``` javascript
self.logError('event-type', 'notification message', { key: 'value' });
```
Without `messageAs` set, the logger receives the message and data object as separate arguments:
``` sh
'notification message',
{
  type: 'event-type',
  severity: 'error',
  module: 'current-module-name',
  key: 'value'
}
```
If `messageAs` is set to a string of `myMessage`, the logger instead receives a single object:
``` sh
{
  type: 'event-type',
  severity: 'error',
  module: 'current-module-name',
  key: 'value',
  myMessage: 'notification message'
}
```
The message no longer carries a composed `'<module>: <event-type>: <message>'` prefix — read the `module` and `type` fields instead, which avoids duplicating that data inside the message string.

The string value for `messageAs` will depend on the logging package being used. Several examples are presented in the [logging section](/guide/logging.html#popular-package-setup) of the guide.

### `filter`
The `filter` option allows for the selection of a subset of log notifications. It takes an object of named sub-objects. The name for each of the sub-objects should either be a module name, like `@apostrophecms/login`, or an `*` wildcard to indicate that the filtering rules should apply to all modules. Each sub-object can have two properties. The `severity` key takes an array of strings for each severity level that is allowed for the named module. If using the stock log methods, valid values are `debug`, `info`, `warn`, and `error`. The `events` key takes an array of strings for event-type names that are allowed for the named module. These event-type names are passed as the first argument to the [`@apostrophecms/module`](/reference/modules/module.html) module logging methods.

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    logger: 'pino',
    messageAs: 'msg',
    filter: {
      // By module name, or *. We can specify any mix of severity levels and specific event types,
      // and entries are kept if *either* criterion is met
      '*': {
        severity: [ 'warn', 'error' ]
      },
      '@apostrophecms/login': {
        events: [ 'incorrect-username', 'incorrect-password', 'complete' ]
      }
    }
  }
};
```

<template v-slot:caption>
modules/@apostrophecms/log/index.js
</template>
</AposCodeBlock>

These filters can also be passed through an environment variable, `APOS_FILTER_LOGS`. For example, the filters passed through this `index.js` example would be:

``` sh
export APOS_FILTER_LOGS='*:severity:warn,error;@apostrophecms/login:events:incorrect-username,incorrect-password,complete'
```

The startup event is always kept in production regardless of the severity floor, so production logs still confirm the site came up, unless a configuration names its own `*` events that takes over.
