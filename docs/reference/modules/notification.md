---
extends: '@apostrophecms/module'
---

# `@apostrophecms/notification`

**Alias:** `apos.notification`

<AposRefExtends :module="$frontmatter.extends" />

This module implements a way to display notifications to logged-in users that can be triggered from either the server- or browser-side using `apos.notify`. These notifications can be customized for type, e.g. `success`, and can also be used to emit bus events that can be polled by other modules. The module itself has two options for controlling new notice polling frequency.

## Options

|  Property | Type | Default | Description |
|---|---|---|---|
| [`queryInterval`](#queryinterval) | integer | 500 | Interval in milliseconds between MongoDB queries |
| [`longPollingTimeout`](#longpollingtimeout) | integer | 10000 | Interval in milliseconds for the polling request to stay open. |

### `queryInterval`
This option sets the duration in milliseconds(ms) between MongoDB queries while long polling for notifications. It defaults to 500ms (1/2 a second). If you prefer fewer queries you can set this to a larger value, however, the queries are indexed queries on a small amount of data and shouldn't impact your app.

### `longPollingTimeout`
This option sets the duration of the long polling request in milliseconds. It defaults to 10000ms (10 seconds). This duration is typically a good balance between reducing overall server requests and avoiding timeouts from network intermediaries like proxy servers. It also helps in managing server resources efficiently by not keeping connections open excessively long and ensures a responsive user experience by providing timely updates without the overhead of constant querying.

## Usage
The usage of `apos.notify` differs slightly server- vs client-side. In both cases, you need to pass the desired message string and an object of options. When using the method server-side, the first argument should be either the `req` object, or a user `_id` string.

```javascript
self.apos.notify(req, 'message', options, interpolation);
```
When using this client-side, from either on-page JavaScript or within an admin UI Vue component, this argument should not be included.

```javascript
apos.notify('message', options, interpolation);
```
The message will be interpolated by i18next if there is a corresponding localization key, or passed directly if no key is found. You can pass additional keys to be interpolated and added to the message using either an `interpolation` object passed as the third argument, or as `options.interpolation`.

### Example
![A screenshot of the resulting notification from the code example]()
The translation strings file:
<AposCodeBlock>

```json
{
  "eventRegistrationSuccess": "Thank you, {{name}}, for registering for {{eventName}}!"
}
```
  <template v-slot:caption>
    modules/event/i18n/en.json
  </template>

</AposCodeBlock>

The form submission JavaScript:

<AposCodeBlock>

```javascript
export default () => {
  function onFormSubmit(formData) {
    const messageKey = 'eventRegistrationSuccess';
    const interpolate = {
      name: formData.name,
      eventName: formData.eventName
    };

    apos.notify(messageKey, { interpolate: interpolate, type: 'success' });
    // or
    apos.notify(messageKey, { type: 'success' }, interpolate);
  }
};

```
  <template v-slot:caption>
    modules/event/ui/src/index.js
  </template>

</AposCodeBlock>

Within the `options` argument object you can pass several different properties. The value of the `type` property dictates the styling of notification.
