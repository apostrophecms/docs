# Logging in ApostropheCMS

Logging is a fundamental aspect of any web application, especially those that require user authentication. It serves as a vital tool for monitoring system behavior, troubleshooting issues, and maintaining security. By recording various events and transactions within the system, logs provide insights into user interactions, system performance, and potential errors.

Every message ApostropheCMS produces — from core, from your project code, and from third-party modules that call the standard logging methods — is a **typed event** with named fields, not free-form text. The logger, not the code that calls it, decides how an entry ultimately looks: as one JSON object per line for log aggregators, or as a compact, colorized view for local development. A single top-level `log` option configures the entire process, from its very first line. No existing logging API changes shape — `apos.util.log` and the module-level `logInfo`/`logWarn`/`logError` methods work exactly as before, they just produce structured output now.

::: info
As of this release, production log output is **one JSON object per line**, for standalone projects and multisite alike. Message text hasn't gone anywhere — it now lives in the `msg` field of that object. If something in your deployment parses the old text format, see [Upgrading from earlier releases](#upgrading-from-earlier-releases) below.
:::

## What a developer sees

### Development

On a color-capable terminal, ApostropheCMS renders a compact, colorized view by default:

```
  apostrophe v4.32.0  ready in 12ms

  ┃ Local     http://localhost:3000
  ┃ Admin     http://localhost:3000/login
  ┃ Node      v24.18.0 · development

14:02:12 [@apostrophecms/asset] build-started  dir=ui/src
14:02:12 [@apostrophecms/asset] build-complete  ms=840
14:02:12 [@apostrophecms/login] incorrect-username  username=admin ip=127.0.0.1
14:02:12 [WARN] [@apostrophecms/schema] widget-not-allowed: widget type "video" is not allowed in this area
14:02:12 [ERROR] [article] api-error: conflict  status=409 path=/api/v1/article
    Error: conflict
        at Object.error (lib/error.js:12)
        at async apiRoute (index.js:44)
14:02:12 [@apostrophecms/migration] migration-skipped  name=add-slug-index
```

A few reading rules apply consistently across the framework:

- A dimmed `HH:mm:ss` timestamp comes first, then a severity badge for warnings and errors only, then the origin.
- `[module]` labels always show the **full** module name, so it's clear which package logged the entry.
- Small data objects render inline as `key=value`; larger ones are indented below the line.
- Stack traces are indented under their entry, and a multi-line message indents its continuation lines so a block of text reads as one entry rather than several.
- `debug` entries are dimmed, and the startup banner appears once, when the site starts listening.

### Production

In production, the same entries are emitted as one JSON object per line, with no color codes and no multi-line output — stack traces are escaped inside the JSON string:

```json
{"severity":"info","type":"apos-listening","url":"http://localhost:3000","adminUrl":"http://localhost:3000/login"}
{"severity":"info","module":"@apostrophecms/asset","type":"build-complete","ms":840}
{"severity":"info","module":"@apostrophecms/login","type":"incorrect-username","username":"admin","ip":"127.0.0.1"}
{"severity":"warn","module":"@apostrophecms/schema","type":"widget-not-allowed","msg":"widget type \"video\" is not allowed in this area"}
{"severity":"error","module":"article","type":"api-error","msg":"conflict","status":409,"path":"/api/v1/article","stack":"Error: conflict\n    at Object.error (lib/error.js:12)\n    at async apiRoute (index.js:44)"}
```

`debug` and `info` entries go to standard output, `warn` and `error` to standard error, exactly as before, so any existing fd-based routing keeps working.

There is deliberately no timestamp field in structured output. Anything that consumes it already stamps every line — pino, winston, Docker under systemd or Kubernetes, journald — so ApostropheCMS's own timestamp would only duplicate that. The timestamp you see in the development view is a rendering concern of the human-readable formats, not part of the data.

## The `log` option

Logging is configured in `app.js`, and only there. ApostropheCMS builds its logger before anything else in the process — before `data/local.js` is even read and merged — so that startup failures and cluster notices are never invisible to whatever is watching your logs. A `log` key placed in `data/local.js` has no effect and is dropped with a startup warning telling you where it belongs. This applies to a multisite root `app.js` as well. Make per-environment differences with the [environment variables](#environment-variables) below rather than a per-environment configuration file.

<AposCodeBlock>

```javascript
import apostrophe from 'apostrophe';
import pino from 'pino';

apostrophe({
  root: import.meta,
  shortName: 'my-site',
  log: {
    format: 'structured',   // how the built-in renderer draws; ignored when `logger` is set
    logger: pino(),         // optional: any object with debug, info, warn, error
    messageAs: 'msg',       // shape delivered to a custom logger
    filter: { '*': { severity: [ 'warn', 'error' ] } }
  },
  modules: { /* ... */ }
});
```

<template v-slot:caption>
app.js
</template>
</AposCodeBlock>

Two things are worth understanding about this option:

- **It works from the first line of the process.** Module options don't exist until the module system has booted, so a logger configured at the module level could never see cluster notices or fatal startup failures. The top-level `log` option has no such gap — this is what lets an aggregator distinguish a crash-looping deployment from silence.
- **When present, it's the whole logging configuration.** The [legacy `@apostrophecms/log` module options](#the-legacy-apostrophecms-log-module) and the legacy `@apostrophecms/util` `logger` option are then ignored wholesale, and a startup warning lists exactly which keys were displaced — useful when migrating a project one step at a time. Projects that don't set the top-level option keep the previous behavior unchanged.

Migrating existing module-level options to the top-level option is a paste: the keys are the same names with the same meaning. The one restriction is that `logger` must be an object here, not a factory function.

| Key | Controls | Relevant |
| -- | -- | -- |
| `format` | how the built-in renderer draws to stdout/stderr | only **without** `logger` |
| `logger` | replaces the built-in renderer as the destination | always |
| `messageAs` | delivery shape to a custom logger | only **with** `logger` |
| `filter` | which events are emitted at all | always |

### Formats

| Format | Output |
| -- | -- |
| `structured` | one JSON object per line — the aggregator-ready format |
| `pretty` | the colorized development view shown above, with the startup banner |
| `plain` | the same layout as `pretty`, with zero ANSI codes — for CI logs and piped output |
| `legacy` | the output shape of previous releases (`message {json}`) — an escape hatch |
| `auto` | the default; resolves per environment, as described below |

`auto` resolves to `structured` when `NODE_ENV` is `production`, to `pretty` on a color-capable terminal, and to `plain` otherwise (a pipe, a CI log). Color capability follows the standard chain: `NO_COLOR` turns it off, `FORCE_COLOR` turns it on, otherwise an interactive terminal is color-capable, and CI is treated as color-capable.

### Environment variables

| Variable | Effect |
| -- | -- |
| `APOS_LOG_FORMAT` | `structured`, `pretty`, `plain`, `legacy`, or `auto`; overrides the option |
| `APOS_FILTER_LOGS` | the filter, in `module:criterion:values;…` syntax; overrides the option |
| `NO_COLOR` / `FORCE_COLOR` | force color off or on |

Precedence is **environment variable > configured option > auto detection**, for every logger in the process. That means one environment variable can put an entire deployment — pre-boot lines, module lines, multisite proxy and per-site instances — into the same mode at once, with no code change and no release. Getting JSON out of a development machine, or human-readable output out of a running container, is one variable either way.

### Severity and filtering

- In development every severity is kept. In production, the default keeps only `warn` and `error`.
- The `filter` option (or `APOS_FILTER_LOGS`) selects by module name or `*`, by a list of severity levels, by a list of event types, or any mix of these. An entry is kept if **either** criterion matches.
- The startup event is always kept in production, regardless of the severity floor, so production logs still confirm the site came up. A configuration that names its own `*` events takes that over.

<AposCodeBlock>

```javascript
log: {
  filter: {
    // By module name, or *. Any mix of severity levels and specific event
    // types can be given, and entries are kept if *either* criterion is met.
    '*': {
      severity: [ 'warn', 'error' ]
    },
    '@apostrophecms/login': {
      events: [ 'incorrect-user', 'incorrect-password', 'complete' ]
    }
  }
}
```

<template v-slot:caption>
app.js
</template>
</AposCodeBlock>

With this configuration, ApostropheCMS logs warning and error notifications from **all** modules, and additionally logs the `incorrect-user`, `incorrect-password`, and `complete` events from `@apostrophecms/login`, even though they have a severity of `info`.

The same filter passed as `APOS_FILTER_LOGS` would look like:

```sh
export APOS_FILTER_LOGS='*:severity:warn,error;@apostrophecms/login:events:incorrect-user,incorrect-password,complete'
```

Note that these filters don't affect log notifications emitted by the `@apostrophecms/util` methods, such as `self.apos.util.info('message')`.

## Logging from your own code

Nothing changed about how you call `self.logInfo()`, `logDebug()`, `logWarn()`, `logError()`, or the `apos.util.*` methods. What changed is what happens after the call: every notification now travels as a structured envelope to a single renderer.

### Module methods: the first argument is an event type

All ApostropheCMS modules provide `logInfo()`, `logDebug()`, `logWarn()`, and `logError()` on `self`. The first argument to each of these is the **event type** — a short, stable, machine-readable name such as `widget-not-allowed`. This is the field you'll later filter and query on. For example, the `@apostrophecms/login` module emits `incorrect-username` when there's a login attempt with an unknown username:

```javascript
self.logWarn(req, 'widget-not-allowed', 'widget type "video" is not allowed in this area', {
  widgetType: 'video'
});
```

Following the required event type, these methods accept two more optional arguments: a human-readable message string, and an object of `key: value` data. Passing the optional `req` object as the first argument, before the event type, enriches the entry with the request's URL, path, method, IP, query, and request ID.

**Writing a sentence where the event type belongs is the easy mistake to make, and nothing rejects it** — any string is a valid event type, so `self.logInfo('Configuring the site theme')` will produce an entry whose `type` field is a sentence. This matters because several different kinds of objects in ApostropheCMS expose the same four method names, but not all of them treat their first argument the same way:

| What you're holding | Call shape | First argument |
| -- | -- | -- |
| A module (`self.logInfo` and friends) | `([req,] type[, msg][, data])` | **event type** |
| A logger from `apostrophe/logger.js`, its `child()`, or the logger multisite passes to `sites(site, { logger })` | `(type[, msg][, data])` | **event type** |
| `apos.util.log` / `info` / `warn` / `error` (the legacy surface) | `(message[, data])` | message |
| A console-shaped logger ApostropheCMS injects into a library such as uploadfs | `console.*` semantics | message; the event type was fixed when the logger was built |

The severities are `debug`, `info`, `warn`, and `error` — there is no `log`. On the message-first surfaces, `log` exists and means `info`, as it does on the console. On the type-first surfaces, calling `.log()` throws an error naming the four valid severities, because silently treating a console-style message as an event type would be worse than failing loudly.

### The `apos.util` methods

Apostrophe provides methods for logging simple messages through the [`@apostrophecms/util` module](/reference/modules/util.html#logging-utilities): `log(msg)`, `warnDev(msg)`, and `warnDevOnce(name, msg)`. The latter two log a warning only when `process.env.NODE_ENV` is not `production`; `warnDevOnce()` additionally names the warning and logs it only once per unique name outside of production, even if the condition recurs. These are called from any module as `self.apos.util.<method name>`, for example `self.apos.util.log('My log message')`, and, like `console.log()`, they accept substitution strings within the message.

On this legacy surface, **an object in the final position is always the event data** — its keys become fields of the entry — while everything before it is composed into the message the way `console.log` composes it, substitution strings included. So `apos.util.warn('Cannot load', name, { id })` files `id` as a queryable field rather than folding it into the message text. The one surface that does *not* do this is the console-shaped logger handed to a library like uploadfs: it composes every argument exactly as `console.warn` would, because the library is writing for the console and its event type was already decided when the logger was built.

`info(msg)`, `debug(msg)`, `warn(msg)`, and `error(msg)` also exist on `@apostrophecms/util`, but are deprecated in favor of the module-level methods above.

## Custom loggers (pino, winston, and other packages)

A custom logger bypasses the built-in renderer entirely and owns its own formatting. Set it with the `logger` option, either at the top level in `app.js` (recommended — see [The `log` option](#the-log-option)) or, for projects that haven't migrated, on the legacy `@apostrophecms/log` module.

The logger must provide `debug`, `info`, `warn`, and `error` methods; this is validated when the logger is built, so a misconfiguration fails loudly at startup rather than silently at the first warning. Depending on `messageAs`, it receives either the whole envelope as a single object, or a `[ message, data ]` pair:

- If `messageAs` is unset, the logger receives the message string and the data object as separate arguments.
- If `messageAs` is set to a string, ApostropheCMS instead inserts the message string into the data object under that key before passing a single object to the logger. `pino`, for example, expects a `msg` property, so `messageAs: 'msg'` is typical there.

If the logger holds a resource — a transport, a connection, a buffer — it should also provide a `destroy()` method, which ApostropheCMS awaits just before shutdown. The rule that governs sharing a logger is simple: **whoever hands a logger onward decides whether the receiver may destroy it, by including or omitting `destroy` on what they hand over.** This is what keeps one shared logger alive across the many sites of a multisite process.

<AposCodeBlock>

```javascript
log: {
  logger: 'pino',
  messageAs: 'msg',
  filter: {
    '*': {
      severity: [ 'warn', 'error' ]
    }
  }
}
```

<template v-slot:caption>
app.js
</template>
</AposCodeBlock>

### The legacy `@apostrophecms/log` module

Before the top-level `log` option existed, structured logging was configured on the [`@apostrophecms/log` module](/reference/modules/log.html), using the same `logger`, `messageAs`, and `filter` options described above. This module-level configuration still works for projects that haven't adopted the top-level option, but it can't see the earliest lines of the process — cluster notices and fatal startup failures happen before the module system boots. **New projects should configure `log` at the top level in `app.js` instead.** If a top-level `log` option is present, any options set on the `@apostrophecms/log` module are ignored, and a startup warning names the ignored keys.

## The standalone logger

The same logger is available as a plain factory, with no `apos` object involved. This is the seam that lets ApostropheCMS log before its own module system exists, and the seam multisite is built on — and it's useful to any project that wants its own scripts to log in the same format as the site they belong to.

<AposCodeBlock>

```javascript
import createLogger from 'apostrophe/logger.js';

const logger = createLogger({
  format: 'auto',                  // structured | pretty | plain | legacy | auto
  logger: pino(),                  // optional; bypasses the built-in renderer
  context: { scope: 'multisite' }  // base fields merged into every entry
});

logger.info('proxy-listening', { port });
logger.error('startup-failed', err.message, { stack: err.stack });
const siteLogger = logger.child({ site: 'site-a' });
```

<template v-slot:caption>
logger.js
</template>
</AposCodeBlock>

The factory returns an object with the four severity methods, `child(context)` for merging in additional context, and a `format` property for introspection. `child()` is ApostropheCMS's own construct, not a backend capability, so it behaves identically whether the destination is pino, winston, or a hand-written object.

The `.js` extension is part of the specifier when importing from ESM. A CommonJS project reaches the same factory with `require('apostrophe/logger')`.

## Long-running tasks

Migrations, localization, and other long-running tasks used to print a line per item, which is exactly the kind of flood that makes production logs unusable. They now emit a **start event, a progress event every hundred items, and a summary**, with per-item detail available at `debug` severity for development. Production log volume goes down; the development experience stays just as informative.

## Multisite

In a multisite deployment, the site name is a **field**, not a text prefix. In development it still renders as a `[site-a]` label; in structured output it's a `site` property you can query and route on.

```
14:02:12 [multisite] proxy-listening  port=3000
14:02:12 [site-a] [multisite] spinup  ms=412
14:02:12 [WARN] [site-a] [@apostrophecms/login] incorrect-password  username=editor
```

```json
{"severity":"info","type":"proxy-listening","scope":"multisite","port":3000}
{"severity":"info","type":"spinup","scope":"multisite","site":"site-a","ms":412}
{"severity":"warn","module":"@apostrophecms/login","type":"incorrect-password","site":"site-a","username":"editor"}
```

A few things to know when configuring logging for multisite:

- **The `log` option of the root `app.js` is the whole logging configuration** — for multisite's own orchestration lines, for the dashboard, and for every site. Configure pino (or another logger) there, and every site logs to it with its `site` field bound.
- **Structured is multisite's production default**, as in core.
- **Per-site module-level log options are ignored**, with the standard startup warning, and a per-site `format` is ignored too — every instance shares one output stream, so rendering is process-global by design. The one exception is a site returning its own `{ log: { logger } }` from `sites(site)`: a custom logger owns its own output, so it can't corrupt the shared stream.
- **The site configuration function receives that site's logger** as its second argument, giving configuration code that used to reach for `console.log` (it runs before the site has an `apos` object) a labeled, correctly formatted channel. Remember that the first argument is still an event type, not a sentence:

  ```javascript
  export default async function (site, { logger } = {}) {
    logger?.info('site-theme-configured', { theme: site.theme });
    return { /* the site's Apostrophe configuration */ };
  }
  ```

  The `logger` argument is optional — a wrapper that calls `sites(site)` with one argument simply gets `undefined`.
- `LOG_LEVEL` and `VERBOSE` remain as aliases for the standard severity filter, and now apply to multisite's own lines and to every instance alike.
- Shutdown happens in order: sites, then dashboard, then the logger last, so the shutdown itself can be logged, exactly once. Multisite installs no signal handlers of its own — a deployment wires `SIGTERM` to `destroy()` itself.

A production multisite process is quiet by design: one line confirming the proxy is listening, then nothing until something warns or fails. `VERBOSE=1` brings the detail back, including asset build progress.

## Login attempt logging

The `@apostrophecms/login` module logs four events based on the outcome of a login attempt: `incorrect-username`, when the given username isn't in the database; `incorrect-password`, when the username is correct but the password isn't; `correct-password`, when both are correct (further login steps, like a time-based one-time password, may still follow); and `complete`, once login has fully succeeded. All four add `username` (from `req.body.username`), `ip` (from `req.ip`), and the login attempt count as `attempts`.

Example output using Pino as configured in [Popular package setup](#popular-package-setup) below:

``` sh
[09:54:51.333] INFO (82299): correct-password
    module: "@apostrophecms/login"
    type: "correct-password"
    severity: "info"
    username: "admin"
    ip: "::1"
    attempts: 0
    requestId: "cll3sl5sd000gi3lsch2j1t5v"
[09:54:51.336] INFO (82299): complete
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
::: info
The `ip` shown here is `::1` because the project is running on `localhost:3000`.
:::

## Upgrading from earlier releases

**The change that matters:** production log output is now one JSON object per line, for standalone projects and multisite alike. Message text hasn't changed — it's the `msg` field of the object. If anything scrapes the previous production format — a deploy script grepping `Listening at`, a custom log parser, a dashboard built on the old shape — check it against the new output. Two escape hatches are available without a code change:

- `format: 'legacy'` in the `log` option pins the exact `message {json}` shape of past releases.
- `APOS_LOG_FORMAT=legacy` does the same on a running deployment; `APOS_LOG_FORMAT=plain` restores greppable, human-readable lines without going all the way back to the old shape.

A few smaller things changed as well:

- **Custom loggers receive a clean message.** The message no longer carries the composed `'<module>: <event-type>'` prefix; read the `module` and `type` fields instead. This removes data that used to be duplicated between the message and the object.
- **An event's `stack` is the error's own stack string**, no longer an array of trimmed lines with the first one removed. Human-readable formats indent it below the entry; structured mode carries it as one escaped string.
- `apos.util.warnDev()` no longer prefixes a warning icon, since the renderer now marks severity itself.
- **Long-running tasks print start, periodic progress, and a summary** instead of a line per item — see [Long-running tasks](#long-running-tasks).
- Development output changed freely — it's a developer experience, not a contract.
- **No API changed shape.** `logInfo()`, `logDebug()`, `logWarn()`, `logError()`, `apos.util.*`, `logger`, `messageAs`, and `filter` all work exactly as before. Existing module-level configuration keeps working unchanged for projects that haven't adopted the new top-level `log` option.
- Tests that spy on console output may need updating where formats changed. Apostrophe's test mode keeps stable, indented output to minimize that churn.

## Popular package setup

### Pino
This is a simple setup for [Pino](https://github.com/pinojs/pino); consult its documentation for your specific needs.

```sh
npm install pino
```
And optionally:

```sh
npm i pino-pretty
```

<AposCodeBlock>

``` javascript
import apostrophe from 'apostrophe';
import { pino } from 'pino';

apostrophe({
  root: import.meta,
  shortName: 'my-site',
  log: {
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
  },
  modules: { /* ... */ }
});
```

<template v-slot:caption>
app.js
</template>
</AposCodeBlock>

### Winston

This is a simple setup for [Winston](https://github.com/winstonjs/winston); consult its documentation for your specific needs.

```sh
npm install winston
```

<AposCodeBlock>

``` javascript
import apostrophe from 'apostrophe';
import { createLogger, format, transports } from 'winston';

apostrophe({
  root: import.meta,
  shortName: 'my-site',
  log: {
    logger: createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      transports: [
        // logs everything to the console
        new transports.Console({
          level: 'verbose',
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        }),
        // logs errors only to error.log
        new transports.File({
          filename: 'error.log',
          level: 'error'
        }),
        // logs info and above to combined.log
        new transports.File({
          filename: 'combined.log'
        })
      ]
    }),
    messageAs: 'message'
  },
  modules: { /* ... */ }
});
```

<template v-slot:caption>
app.js
</template>
</AposCodeBlock>

### Bunyan

This is a simple setup for [Bunyan](https://github.com/trentm/node-bunyan); consult its documentation for your specific needs.

```sh
npm install bunyan
```

<AposCodeBlock>

``` javascript
import apostrophe from 'apostrophe';
import { createLogger } from 'bunyan';

apostrophe({
  root: import.meta,
  shortName: 'my-site',
  log: {
    logger: createLogger({
      name: 'apostrophe',
      streams: [
        {
          // log TRACE and above to stdout
          level: 'trace',
          stream: process.stdout
        },
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
  },
  modules: { /* ... */ }
});
```

<template v-slot:caption>
app.js
</template>
</AposCodeBlock>
