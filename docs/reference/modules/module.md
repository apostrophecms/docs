# `@apostrophecms/module`

This module is the foundation of all other Apostrophe modules. It is not *directly* used for any functionality, but [every other module inherits its behavior and functionality](/guide/modules.md#module-inheritance). Every other module has access to use the features documented here. Critically, this module includes initialization behavior that all modules need to start up correctly and register features.

:::warning
**This module should almost never be configured directly in project code.** In other words, there should almost never be a `modules/@apostrophecms/module/index.js` file in a project codebase. The only reason to do so would be to add a feature that every other module will need. There should *never* be a `@apostrophecms/module: {}` line in an `app.js` file.

**Instead, configure the options below on other modules as needed** (e.g., configure the `alias` option on a module to create an easy reference to *that* module). Similarly, run the methods below as needed from the most appropriate module (e.g., use `self.email` from a contact page-type module).
:::

## Options

|  Property | Type | Description |
|---|---|---|
|`alias` | String | A name to use for quick access to the module on the `apos` object (e.g., `'book'` to access a module on `self.apos.book`). Otherwise the longer syntax is necessary (e.g., `self.apos.modules.book`). |
|`templateData` | Object | An object of properties to include on the `data` object in templates belonging to that module. |

## Featured methods

The following methods belong to this module and may be useful in project-level code. As noted above, *they should be used via another module.* They cannot be directly called from this module as it is not instantiated.

See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/packages/apostrophe/modules/%40apostrophecms/module/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

### `async render(req, template, data)`

Returns rendered HTML for a template with the data provided. You must pass `req`, a request object, as the first argument. The `template` argument should be the name of a template file in the module's `views` directory. If the `template` argument has no file extension Apostrophe will look for an `.html` or `.njk` file.

All properties of `data` can be used in Nunjucks templates as properties of the `data` object. This argument may be omitted to include no additional data.

### `async renderString(req, string, data)`

Returns rendered HTML for a Nunjucks-style string with the data provided. You must pass `req`, a request object, as the first argument. The `string` argument will be used as the template itself for rendering (not the template filename).

All properties of `data` can be used in Nunjucks templates as properties of the `data` object. This argument may be omitted to include no additional data.

### `async send(req, template, data)`

The `send()` method renders a template with data as with the [`render()`](#async-render-req-template-data), then sends the rendered HTML as a response to the request (`req`).

### `async sendPage(req, template, data)`

Similar to the [`send()`](#async-send-req-template-data) method, this renders a template and sends the rendered HTML as a response to the request (`req`). Where `send()` is used to render general template files, `sendPage()` is specifically used to render and send *full pages* for Apostrophe projects. Page templates should extend the outer layout template &ndash; either directly (`{% extends data.outerLayout %}`) or by extending a template that does so.

Templates rendered and sent with this method have full access to all template [data properties](/guide/template-data.md) appropriate for the related module. The template is also wrapped with the proper layout file (`'@apostrophecms/template:outerLayout.html'` by default), including the full `head` tag.

This method triggers the `@apostrophecms/page` module to emit a [`beforeSend` event](/reference/server-events.md#beforesend).

### `enableBrowserData(scene)`

Call this method from a module's [initialization function](/reference/module-api/module-overview.md#initialization-function) if the module implements the [`getBrowserData()` method](#getbrowserdata-req). **This is only necessary for modules that do not already do this** (all doc type and widget type modules already do this). The data returned by `getBrowserData(req)` will then be available on `apos.modules['the-module-name']` in the browser.

The `scene` argument is only needed if making the data available while logged-out. By default browser data is pushed only for the `apos` scene (the logged-in context), so the anonymous site visitor experience will include the extra data (except on the /login page and other pages that opt into the `apos` scene). If `scene` is set to `public` then the data is available to all visitors.

### `getBrowserData(req)`

The `getBrowserData()` method can be extended to adjust or add data that the module makes available in the browser. It should return an object to make the data available in browsers (as controlled by [the `enableBrowserData()` method](#enablebrowserdata-scene)).

The data will be available on a property of the `apos.modules` object matching the module name. For example, `@apostrophecms/i18n` module data is available on `apos.modules['@apostrophecms/i18n']`. If the module has an alias the data will also be accessible via `apos.yourAlias`.

Many Apostrophe core modules already populate browser data, including piece type, page type, and widget type modules. For this reason, **it is ususally correct to *extend* this method to add additional browser data** using the module's [`extendMethods` customization function](/reference/module-api/module-overview.md#extendmethods-self).

Avoid returning large data structures, as this will impact page load time and performance.

### `getOption(req, dotPathOrArray, def)`

This is a convenience method to fetch properties of `self.options` in a module. It will look for, then return the option identified by the second argument.

`req` is required to provide extensibility. Modules can use it to change the response based on the current page and other factors tied to the request. The second argument, `dotPathOrArray`, may be a dot path (`'flavors.grape.sweetness'`) or an array `[ 'flavors', 'grape', 'sweetness' ]`.

The optional `def` argument is returned if the property, or any of its ancestors, does not exist. If no third argument is given in this situation, `undefined` is returned.

#### Using `getOption()` in templates

`getOption()` is also made available in templates as a global function (directly as `getOption()`), not as a property of a module or the `apos` object. *In templates, skip the `req` argument.*

Normally in templates this returns options located in the module that called `render()` (often the module the template file belongs to). If you prefix the option path with a cross-module key, such as `module-name:optionName`, it will return the option located in the specified module.

### `email(req, templateName, data, options)`

Use the `email()` method to send email messages from a module. It renders an HTML email message using the template specified by `templateName`, which receives the third argument as its `data` object.

**Either the `nodemailer` option must be configured on the `@apostrophecms/email` module or another Nodemailer transport must be defined on that module as  `self.transport` before this method can be used.** Examples of other email transports include ones built for particular services that wrap Nodemailer themselves (e.g., `nodemailer-mailjet-transport`, `nodemailer-mailgun-transport`).

A plain text version is automatically generated for email clients that require or prefer it, including plain text versions of links. You do not need a separate plain text template.

The `options` object is passed on to the email transport except that `options.html` and `options.plaintext` are automatically provided via the template.

In particular, the `options` object should contain:
- `from`: The email address the message should come from.
- `to`: One or more email recipient addresses (comma-separated in a string for multiple).
- `subject`: The subject line

You can also configure a default `from` address, either globally by setting the `from` option of the `@apostrophecms/email` module, or locally for a particular module by adding an `email` option with a `from` property. If you need to localize `options.subject`, you can call `req.t(subject)`.

This method returns `info` as per the Nodemailer documentation. With most transports, a successful return indicates the message was handed off but has not necessarily arrived yet and could still bounce back at some point.

### `emit(name, ...args)`

The `emit()` method is used to emit server-side events. Events are automatically associated with the module that emitted them. The first argument is the name of the event. Additional arguments are passed, in order, to the event handlers listening to the event.

See the [server events guide](/guide/server-events.md) for more on this subject.

### `logInfo(req, 'event-type', 'notification message', { key: 'value' })`

The `logInfo()` method is used to log notifications with a severity of `info`. The `event-type` argument is required and uniquely identifies the notification. The remainder of the arguments are optional.

Adding the `req` object populates the log notification with the `originalUrl`, `path`, `method`, `ip`, `query`, and `requestId` from this object.

The `notification message` and object added as the final argument will both be added to the notification by the [`@apostrophecms/log` module](/reference/modules/log.html).

### `logDebug(req, 'event-type', 'notification message', { key: 'value' })`

The `logDebug()` method is used to log notifications with a severity of `debug`. The `event-type` argument is required and uniquely identifies the notification. The remainder of the arguments are optional.

Adding the `req` object populates the log notification with the `originalUrl`, `path`, `method`, `ip`, `query`, and `requestId` from this object.

The `notification message` and object added as the final argument will both be added to the notification by the [`@apostrophecms/log` module](/reference/modules/log.html).

### `logWarn(req, 'event-type', 'notification message', { key: 'value' })`

The `logWarn()` method is used to log notifications with a severity of `warn`. The `event-type` argument is required and uniquely identifies the notification. The remainder of the arguments are optional.

Adding the `req` object populates the log notification with the `originalUrl`, `path`, `method`, `ip`, `query`, and `requestId` from this object.

The `notification message` and object added as the final argument will both be added to the notification by the [`@apostrophecms/log` module](/reference/modules/log.html).

### `logError(req, 'event-type', 'notification message', { key: 'value' })`

The `logError()` method is used to log notifications with a severity of `error`. The `event-type` argument is required and uniquely identifies the notification. The remainder of the arguments are optional.

Adding the `req` object populates the log notification with the `originalUrl`, `path`, `method`, `ip`, `query`, and `requestId` from this object.

The `notification message` and object added as the final argument will both be added to the notification by the [`@apostrophecms/log` module](/reference/modules/log.html).

