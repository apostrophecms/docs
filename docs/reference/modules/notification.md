---
extends: '@apostrophecms/module'
---

# `@apostrophecms/notification`

**Alias:** `apos.notification`

<AposRefExtends :module="$frontmatter.extends" />

This module implements a way to display notifications to logged-in users that can be triggered from either the server- or browser-side using `apos.notification`. These notifications can be customized for type, e.g. `success`, and can also be used to emit bus events that can be polled by other modules. The module itself has options for controlling new notice polling frequency.

## Options

|  Property | Type | Default | Description |
|---|---|---|---|
| [`queryInterval`](#queryinterval) | integer | 500 | Interval in milliseconds between MongoDB queries |
| [`longPollingTimeout`](#longpollingtimeout) | integer | 10000 | Interval in milliseconds for the polling request to stay open. |

### `queryInterval`
This option sets the duration in milliseconds(ms) between MongoDB queries while long polling for notifications. It defaults to 500ms (1/2 a second). If you prefer fewer queries you can set this to a larger value, however the queries are indexed queries on a small amount of data and shouldn't impact your app.

### `longPollingTimeout`
This option sets the duration of the long polling request in milliseconds. It defaults to 10000ms (10 seconds). This duration is typically a good balance between reducing overall server requests and avoiding timeouts from network intermediaries like proxy servers. It also helps in managing server resources efficiently by not keeping connections open excessively long and ensures a responsive user experience by providing timely updates without the overhead of constant querying.

## Usage
A notification can be generated 