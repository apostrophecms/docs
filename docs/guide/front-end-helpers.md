# Front end helper methods

Apostrophe provides a small library of front-end utility methods to support implementing client-side JavaScript. These can be useful in widget players, for example. [General utility methods](#general-utility-methods) area available on `apos.util` and [HTTP request methods](#http-request-methods) are available on `apos.http`.

## General utility methods

These are all available in the browser on `apos.util`, e.g., `apos.util.addClass(el, 'is-active')`. They include wrappers for common browser APIs, classic DOM traversal methods, and Apostrophe-specific utilities. They are also compatible with all modern browsers as well as Internet Explorer 11.

| Method | What is it? |
| -------- | ----------- |
| [`addClass`](#addclass-el-classname) | Add a class to a DOM element, if missing. |
| [`assign`](#assign-target-src1-src2) | Assigns properties from one or more source objects to a target object. |
| [`attachmentUrl`](#attachmenturl-fileobj-options) | Get the file URL for an Apostrophe attachment object. |
| [`closest`](#closest-el-selector) | Returns the closest ancestor element that matches the selector. |
| [`emit`](#emit-el-name-data) | Emit a custom browser event on a DOM element. |
| [`getCookie`](#getcookie-name) | Get the value of a browser cookie. |
| [`onReady`](#onready-fn) | Runs the function passed in when Apostrophe refreshes page content during editing.
| [`removeClass`](#removeclass-el-classname) | Remove a class from a DOM element, if present. |
| [`sameSite`](#samesite-uri) | Returns `true` if a URI argument matches the same website as the current page. |

### `addClass(el, className)`

Add a class to a DOM element, if missing. Often used with [`removeClass`](#removeclass-el-classname). Supports browsers without the matching native method.

| Argument | What is it? |
| -------- | ----------- |
| `el` | a DOM element |
| `className` | a string to be added to the `class` attribute |

```javascript
const myElement = document.querySelector('[data-my-element]');

apos.util.addClass(myElement, 'is-active');
```

### `assign(target, src1, src2, ...)`

Assigns properties from one or more source objects to a target object. Uses [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) when available. Supports browsers without the matching native method.

| Argument | What is it? |
| -------- | ----------- |
| `target` | an object on which to add source object properties |
| `src1`, `src2`, etc. | one or more source objects whose properties should copy to the target object |

```javascript
const options = {
  name: 'balloon',
  color: 'blue'
};

apos.util.assign(options, {
  color: 'red',
  language: 'French'
});

console.log(options)
// {
//   name: 'balloon',
//   color: 'red',
//   language: 'French'
// }
```

### `attachmentUrl(fileObj, options)`

Get the file URL for an Apostrophe attachment object. Optionally pass an options object to get a specific version of the file. File (non-image) attachment objects include a single `_url` property already, so this is primarily used for retrieving specific versions of an image.

| Argument | What is it? |
| -------- | ----------- |
| `fileObj` | an attachment object, such as from an attachment field value or using a template helper method to parse an [image widget](/guide/core-widgets.md#image-widget) value |
| `options` | image options to apply for the resulting URL |

| Options | What is it? |
| -------- | ----------- |
| `size` | an image size name to retrieve, such as one of the [standard image file variations](/guide/core-widgets.md#specifying-the-fallback-size) |

<!-- TODO: Add this line back when the cropping UI is available. -->
<!-- | `crop` | an object of image cropping coordinates with `left`, `top` and `width` properties (usually populated from the cropping UI and included on the image object) | -->

```javascript
// Getting an image attachment object after stashing the stringified object
// on a `data-image` attribute in the template
const imageObj = document.querySelector('[data-thumbnail]').dataset.image;

const smallImage = apos.util.attachmentUrl(imageObj, {
  size: 'one-third'
});
```

### `closest(el, selector)`

Returns the closest ancestor element that matches the selector. The element itself is considered the closest possible match. Supports browsers without the matching native method.

| Argument | What is it? |
| -------- | ----------- |
| `el` | a DOM element |
| `selector` | a string to use as a CSS selector to match |

```javascript
const menuToggle = document.querySelector('[data-toggle]');

const menu = apos.util.closest(myElement, '[data-menu]');
```

### `emit(el, name, data)`

Emit a custom browser event on a DOM element. Optionally include a `data` object to include on the event. For event listeners, use the standard browser [`addEventListener` method](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).

| Argument | What is it? |
| -------- | ----------- |
| `el` | a DOM element |
| `name` | a string to use as the event name |
| `data` | (optional) an object containing data to include on the event object |

```javascript
const myElement = document.querySelector('[data-my-element]');

apos.util.emit(myElement, 'openChat', {
  url: window.location
});
```

### `getCookie(name)`

Get the value of a browser cookie.

| Argument | What is it? |
| -------- | ----------- |
| `name` | The name of a browser cookie |

```javascript
apos.util.getCookie('cookiename');
```

### `onReady(fn)`

Runs the function passed in when the page loads as well as when Apostrophe refreshes page content during editing. When logged out it will run the function on initial page load. This is not necessary in [widget players](/guide/custom-widgets.md#client-side-javascript-for-widgets).

::: note
This method was previously named `onReadyAndRefresh`. The name was changed, though the previous name will still work through the 3.x major version.
:::

| Argument | What is it? |
| -------- | ----------- |
| `fn` | a function that should run when page content is ready |

```javascript
const loadNewsletterForm = function () {
  // Code that loads a sign-up form...
}

apos.util.onReady(loadNewsletterForm);
```

### `removeClass(el, className)`

Remove a class from a DOM element, if present. Often used with [`addClass`](#addclass-el-classname). Supports browsers without the matching native method.

| Argument | What is it? |
| -------- | ----------- |
| `el` | a DOM element |
| `className` | a string to be added to the `class` attribute |

```javascript
const myElement = document.querySelector('[data-my-element]');

apos.util.removeClass(myElement, 'is-hidden');
```

### `sameSite(uri)`

Returns `true` if the URI pass in matches the same website (same host and port) as the current page. This is used in some HTTP utility methods.

| Argument | What is it? |
| -------- | ----------- |
| `uri` | a valid URI |

```javascript
const targetUrl = 'https://some-website.rocks/api/gems'
const siteMatches = apos.util.sameSite(targetUrl);
```

::: note
There is also a `runPlayers` method on `apos.util`. That is run for us using `apos.util.onReady` and runs all registered widget players. It is unlikely that it will need to be run in project-level code.
:::

## HTTP request methods

These are all available in the browser on `apos.http`, e.g., `apos.http.get('/api/v1/article')`. They include utility methods to make requests with each HTTP method (`GET`, `POST`, `PATCH`, `PUT`, and `DELETE`) as well as other helpers for making HTTP requests.

| Method | What is it? |
| -------- | ----------- |
| [`get`](#get-url-options-callback) | Send a `GET` request. |
| [`post`](#post-url-options-callback) | Send a `POST` request. |
| [`patch`](#patch-url-options-callback) | Send a `PATCH` request. |
| [`put`](#put-url-options-callback) | Send a `PUT` request. |
| [`delete`](#delete-url-options-callback) | Send a `DELETE` request. |
| [`remote`](#remotemet-hod-url-options-callback) | The HTTP request method that powers other request methods. |
| [`parseQuery`](#parsequery-query) | Parses a URL query string, returning an object of parameters. |
| [`addQueryToUrl`](#addquerytourl-url-data) | Returns a URL with data object properties added as a query string. |

### `get(url, options, callback)`

Send a `GET` request. The response will be returned via a Promise unless a callback is included. Query string data may be in `options.qs`. You do NOT have to pass a callback unless you must support IE11 and do not otherwise have Promise support.

| Argument | What is it? |
| -------- | ----------- |
| `url` | The path to a resource or service |
| `options` | Request options. See [`apos.http.remote`](#remote-method-url-options-callback) for details. |
| `callback` | An optional callback function, required when not using Promises. Receives `error` and `result` arguments. |

```javascript
async function logArticles() {
  let articles;

  try {
    articles = await apos.http.get('/api/v1/article');
    console.info(articles);
  } catch (err) {
    console.error(err);
  }
}

logArticles();
```

### `post(url, options, callback)`

Send a `POST` request. The response will be returned via a Promise unless a callback is included. `options.body` should be an object containing properties to be passed as `POST` body data. You do NOT have to pass a callback unless you must support IE11 and do not otherwise have Promise support.

See [the `get` method](#get-url-options-callback) for argument details and a related example.

### `patch(url, options, callback)`

Send a `PATCH` request. The response will be returned via a Promise unless a callback is included. `PATCH` body data should be in `options.body`. You do NOT have to pass a callback unless you must support IE11 and do not otherwise have Promise support.

See [the `get` method](#get-url-options-callback) for argument details and a related example.

### `put(url, options, callback)`

Send a `PUT` request. The response will be returned via a Promise unless a callback is included. `PUT` body data should be in `options.body`. You do NOT have to pass a callback unless you must support IE11 and do not otherwise have Promise support.

See [the `get` method](#get-url-options-callback) for argument details and a related example.

### `delete(url, options, callback)`

Send a `DELETE` request. The response will be returned via a Promise unless a callback is included. You do NOT have to pass a callback unless you must support IE11 and do not otherwise have Promise support.

See [the `get` method](#get-url-options-callback) for argument details and a related example.

### `remote(method, url, options, callback)`

Send an HTTP request with a specific method to the given URL, returning the response body. The response will be returned via a Promise unless a callback is included. You do NOT have to pass a callback unless you must support IE11 and do not otherwise have Promise support.

::: note
**This method is used to power the individual HTTP request methods. We recommend using those instead.** They will produce the same result as using `remote` and including the proper HTTP method name.
:::

| Argument | What is it? |
| -------- | ----------- |
| `method` | An HTTP method name: `GET`, `POST`, `PUT`, `PATCH`, or `DELETE`  |
| `url` | The path to a resource or service  |
| `options` | Request options. See below. |
| `callback` | An optional callback function receiving when not using Promises. Receives `error` and `result` arguments. |

| Options | What is it? |
| ------- | ----------- |
| `qs` | An object of query string parameters set to values. |
| `body` | The request body. If an object or array it is sent as JSON. Otherwise sent as-is, unless the `send` option is set to `'json'`. |
| `send` | Set to `'json'` to *always* send the request body as JSON, even if a [`FormData` object](https://www.npmjs.com/package/form-data) or non-object. This is not necessary when the body is a normal object. |
| `parse` | Set to `'json'` to *always* parse the response as JSON. Otherwise the response body is parsed as JSON only if the `Content-Type` is `application/json`. |
| `headers` | An object containing HTTP header names and values. |
| `draft` | If `true`, always add `aposMode=draft` to the query string, creating one if needed. |
| `csrf` | Set to `false` to prevent sending the `X-XSRF-TOKEN` header when talking to the same site. |
| `fullResponse` | If `true`, return an object with `status`, `headers` and `body` properties, rather than returning the body directly. The individual `headers` are canonicalized to lowercase names. If there are duplicate headers after canonicalizing only the last value is returned. If a header appears multiple times an array is returned for it. |
| `downloadProgress` | Optional. A function accepting `received` and `total` arguments. It may never be called. If called, `received` will be the bytes sent so far and `total` will be the total bytes to be received. If the total is unknown, it will be `null` |
| `uploadProgress` | Optional. A function accepting `sent` and `total` arguments. It may never be called. If it is called, `sent` will be the bytes sent so far and `total` will be the total bytes to be sent. If the total is unknown, it will be `null`. |
| `prefix` | If explicitly set to `false`, do not automatically prefix the URL, even if the site has a site-wide prefix or locale prefix. It can become handy when the given url is already prefixed, which is the case when using the document's computed `_url` field for instance. |

If the status code is greater than 400 an error is thrown. The error object will be similar to a `fullResponse` object, with a `status` property.

If the URL is site-relative (starts with `/`) it will be requested from the Apostrophe site itself.

::: tip
Just before the `XMLHttpRequest` is sent, this method emits an event matching the HTTP method. For example, `apos-before-post` for `POST` requests, `apos-before-get` for `GET` requests, etc. The event object has `uri`, `data` and `request` properties. `request` is the `XMLHttpRequest` object.

You can use this to set custom headers on all requests, for example.
:::

### `parseQuery(query)`

Returns a data object from parsing a URL query string (e.g., `?theme=light&aposRefresh=1`). The argument should only include the query string part of a URL. The leading question mark (`?`) is allowed but not required. A parameter with no value will be set to `null`.

| Argument | What is it? |
| -------- | ----------- |
| `query` | A url query string |

```javascript
const simpleParams = apos.http.parseQuery('?refresh=true&number=7');
const nestedParams = apos.http.parseQuery('?product%5Bprice%5D=50&product%5Bname%5D=Cheese')
```

::: note
`apos.http.parseQuery()` supports query parameter objects and arrays (when escaped), as well as bracket nesting.
:::

### `addQueryToUrl(url, data)`

Returns a URL with data object properties added as a query string. This supports data object values as objects and arrays. If `data` is an empty object no query string is added. **If the URL already includes a query string it is discarded and replaced.**

| Argument | What is it? |
| -------- | ----------- |
| `url` | A url |
| `data` | An object with data to convert to a query string |

```javascript
const updatedUrl = apos.http.addQueryToUrl(location.href, {
  theme: 'dark',
  'search-complete': 1
});
```
