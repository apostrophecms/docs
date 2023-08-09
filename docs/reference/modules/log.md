---
extends: '@apostrophecms/module'
---

# `@apostrophecms/log`

**Alias:** `apos.log`

<AposRefExtends :module="$frontmatter.extends" />

This module provides structured logging for Apostrophe projects. It intercepts the log notifications emitted by the `logDebug()`, `logInfo()`, `logWarn()`, and `logError()` methods of the [`@apostrophecms/module`](/reference/modules/module.html) and creates new objects. These objects can be sent to 3rd-party logging packages and easily filtered based on event-type and severity.

## Options

|  Property | Type | Description |
|---|---|---|
| [`logger`](#logger) | Object/Function | Optional. Used for outputting logs to 3rd-party packages or custom logging functions. |
| [`messageAs`](#messageas) | String | Optional. If this option is set, it converts the log notification from a string and object to just an object with the `messageAs` string as a property with the notification string as value. |
| [`filter`](#filter) | Object | Optional. Takes named objects that determine what log notices are emitted |

### `logger`
The `logger` option can take an object or a function. Any passed function should take `apos` and return an object of methods. Alternatively, the object can be passed directly to `logger`. The object should include methods for `debug()`, `info()`, `warn()`, and `error`. Optionally, this object can also include a `destroy()` method that will be called and awaited during the `apostrophe:destroy` event. Typically the `logger` takes a 3rd-party logging package as value.

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
Some 3rd-party logging packages require an object for each log event. Setting the `messageAs` option to a string will convert the returned log notification from a string plus an object to an object only. The value of this option will be used as a key in the new object and the notification string will be added as value.

For example:
``` javascript
self.logError('event-type', 'notification message', { key: 'value' });
```
Will log:
``` sh
'current-module-name: event-type: notification message',
{
  type: 'event-type',
  severity: 'error',
  module: 'current-module-name',
  key: 'value'
}
```
If the `messageAs` is set to a string of `myMessage`, instead the log will return:
``` sh
{
  type: 'event-type',
  severity: 'error',
  module: 'current-module-name',
  key: 'value',
  myMessage: 'current-module-name: event-type: notification message'
}
```

The string value for `messageAs` will depend on the logging package being used. Several examples are presented in the [logging section](/guide/logging.html) of the guide.

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
      'apostrophecms/login': {
        events: [ 'success', 'failure' ]
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
export APOS_FILTER_LOGS='*:severity:warn,error;@apostrophecms/login:events:success,failure'
```
