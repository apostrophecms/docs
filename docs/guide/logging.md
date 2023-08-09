# Logging in Apostrophe

Logging is a fundamental aspect of any web application, especially those that require user authentication. It serves as a vital tool for monitoring system behavior, troubleshooting issues, and maintaining security. By recording various events and transactions within the system, logs provide insights into user interactions, system performance, and potential errors. 

Unlike traditional unstructured logs, structured logs provide a consistent and machine-readable format, making it easier to analyze and monitor user activities and system performance. This is particularly important for Apostrophe projects with login features, as it facilitates tracking of authentication attempts, quicker detection of suspicious activities, and helps ensures the security and integrity of user data. By employing structured logging, developers and system administrators can quickly identify and respond to potential issues, enhancing both the user experience and the overall stability of the website.

### Log notifications

Apostrophe has multiple methods for logging simple messages available through the [`@apostrophecms/util` module](/reference/modules/util.html#logging-utilities). These include `log(msg)`, `warnDev(msg)`, and `warnDevOnce(name, msg)`. The latter two of these methods allow you to log a warning only when `process.env.NODE_ENV` is not `production`. The `warnDevOnce()` allows the error to be named, and will only log a warning once per unique name when the site isn't in production, even if the conditions for emitting the warning occur multiple times. These can be called from any module using `self.apos.util.<method name>`, for example, `self.apos.util.log('My log message')`. These methods are wrappers for the `console.log()` and `console.warn()` methods, and like those methods, you can use substitution strings within the message being passed. There are also four additional legacy methods for `info(msg)`, `debug(msg)`, `(msg)`, and `error(msg)`, but these have been deprecated in favor of the methods exposed by the `@apostrophecms/module` module.

The [`@apostrophecms/module` module](/reference/modules/module.html) provides four methods that can provide more detailed logging information than the methods provided by the `util` module. The `logInfo()`, `logDebug()`, `logWarn()`, and `logError()` methods are available on `self` from any module. All of these methods require an `eventType` argument. This argument provides a name for the notification being logged. For example, the `@apostrophe/login` module emits an `eventType` of `incorrect-username` if there is a login attempt with an unknown user name: 

``` javascript
self.logInfo('incorrect-username', {
  username,
  ip,
  attempts: attempts + 1,
  requestId
});
```

In addition to the required `event-type`, these methods can take three optional arguments. Following the `event-type` they can each take a string. This message string will be included, along with the module name that is emitting the notification. As a last argument, each can take an object containing any number of key:value properties. These will be deconstructed in the final log notification.

For example:

``` javascript
self.logError('event-type', 'notification message', { key: 'value' });
```
Will log:
```
'current-module-name: event-type: notification message',
{
  type: 'event-type',
  severity: 'error',
  module: 'current-module-name',
  key: 'value'
}
```

Finally, you can further enrich to log notification by prepending the other arguments with the `req` object. This will add the `originalUrl`, `path`, `method`, `ip`, `query`, and `requestId` from this object.

``` javascript
self.logError( req, 'event-type', 'notification message', { key: 'value' });
```

## The `@apostrophecms/log` module

Apostrophe provides structured logging through the [`@apostrophecms/log` module](/reference/modules/log.html). This module adds several options, including the `logger` option that lets you specify a function or object with at least `info`, `debug`, `warn` and `error` methods. This allows you to pass notifications to 3rd-party logging packages, such as `pino`, `winston`, and `bunyan`, to name three popular packages. It can take other functions, including a `destroy()`, which will be run just prior to project shut-down. If the logger option is not set, then the notifications are sent to the `STDOUT` (info, log, debug) or `STDERR` (warn, error), which is typically `console` in an Apostrophe project unless set to something else.

The module includes an option called `messageAs`, which allows you to customize how messages are handled. By default, the module returns a message string and an object separately. However, if you set the `messageAs` option to a specific string, the module will instead insert the message string into the object, using that string as the key. This feature is designed to support certain logging packages that require this specific format. For instance, the `pino` logging package expects the message string to be a value within an object, associated with the key `msg`. 

Lastly, the `filter` option in the module gives you control over which notifications are logged. It accepts an object containing named sub-objects, where each name represents either a specific module or a wildcard symbol '*', which matches any module. Inside these sub-objects, you can define criteria based on severity levels (such as `debug`, `info`, `warn`, and `error`) and the names of specific event types to determine which notifications will be emitted.

- The `severity` key allows you to specify the severity levels you want to include, by taking an array of strings representing those levels.
- The `events` key lets you list the specific event types you want to include, by taking an array of strings representing those types.
- If you want to emit all notifications, you can simply set `'*': true` within the `filter` object.

Note that these filters will not impact log notifications that are emitted by the `@apostrophecms/util` methods such as `self.apos.util.info('message')`.

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

### Login attempt logging
The `@apostrophecms/login` module has four `self.logInfo()` calls that are made based on the success or failure of a login attempt. The `incorrect-username` event is logged if an attempt is made to login with a user name that is not in the database. The `incorrect-password` event is logged if an attempt to login is made with a correct user name, but an incorrect password for that user. The `correct-password` event is logged if both the user name and password are correct. Because of additional login options, like time-based one-time passwords, this does not indicate that login was successful. Finally, the `complete` event is logged once login is successful. All of these events also add several pieces of information into the log object. The `username` from `req.body.username`, `ip` from `req.ip`, and number of login attempts as `attempts`.

Example output:

``` sh
[09:54:51.333] INFO (82299): @apostrophecms/login: correct-password
    module: "@apostrophecms/login"
    type: "correct-password"
    severity: "info"
    username: "admin"
    ip: "::1"
    attempts: 0
    requestId: "cll3sl5sd000gi3lsch2j1t5v"
[09:54:51.336] INFO (82299): @apostrophecms/login: complete
    module: "@apostrophecms/login"
    type: "complete"
    severity: "info"
    url: "/api/v1/@apostrophecms/login/login"
    path: "/api/v1/@apostrophecms/login/login"
    method: "POST"
    ip: "::1"
    query: {}
    requestId: "cll3sl5sd000gi3lsch2j1t5v"
    username: "admin"
    attempts: 0
```
::: note
The `ip` here `::1` because the project is being run on `localhost:3000`
:::

### Popular package set-up

#### Pino
This is a simple set-up for [`Pino`](https://github.com/pinojs/pino), please consult the documentation for your specific needs.
Installing:

```sh
npm install pino
```
And optionally:

```sh
npm i pino-pretty
```

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

#### Winston

This is a simple set-up for [`Winston`](https://github.com/winstonjs/winston), please consult the documentation for your specific needs.
Installing:

```sh
npm install winton
```

<AposCodeBlock>

``` javascript
const { createLogger, format, transports } = require('winston');
module.exports = {
  options: {
    logger: createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      transports: [
        new transports.File({
          // sends error notifications to the error.log file
          filename: "error.log",
          level: "error"
        }),
        new transports.File({
          // sends all notifications to the combined.log file
          filename: "combined.log"
        })
      ]
    }),
    messageAs: 'msg'
  }
};

```

<template v-slot:caption>
/modules/@apostrophecms/log/index.js
</template>
</AposCodeBlock>

#### Bunyan

This is a simple set-up for [`Bunyan`](https://github.com/trentm/node-bunyan), please consult the documentation for your specific needs.
Installing:

```sh
npm install bunyan
```

<AposCodeBlock>

``` javascript
const { createLogger } = require('bunyan');
module.exports = {
  options: {
    logger: createLogger({
      name: 'apostrophe',
      streams: [
        // {
        //   log INFO and above to stdout
        //   level: 'trace',
        //   stream: process.stdout
        // },
        {
          // log INFO and above to a file
          level: 'info',
          path: './combined.log'
        },
        {
          // log ERROR and above to a file
          level: 'error',
          path: './error.log'
        }
      ]
    }),
    messageAs: 'msg'
  }
};

```

<template v-slot:caption>
modules/@apostrophecms/log/index.js
</template>
</AposCodeBlock>
