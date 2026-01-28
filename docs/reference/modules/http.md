---
extends: '@apostrophecms/module'
---

# `@apostrophecms/http`

**Alias:** `apos.http`

<AposRefExtends :module="$frontmatter.extends" />

This module adds methods for easy HTTP requests in Apostrophe project and module server-side code. These methods are compatible with the respective [client-side HTTP methods](/guide/front-end-helpers.md#http-request-methods). It also defines error codes for use with the main `apos.error()` method.
<!-- TODO: Link to the error module reference. -->

## Options

|  Property | Type | Description |
|---|---|---|
|`addErrors` | Object | An object of error names and their associated HTTP response codes. |

### `addErrors`

<!-- TODO: Link to the error module reference. -->
This module's named errors are used in the `apos.error()` method. The default error names and their codes in Apostrophe are:
- `min`: 400
- `max`: 400
- `invalid`: 400
- `forbidden`: 403
- `notfound`: 404
- `required`: 422
- `conflict`: 409
- `locked`: 409
- `unprocessable`: 422
- `unimplemented`: 501

Unnamed errors are returned with the 500 error code, so it does not need to be registered. Additional error codes can be added with the `addErrors` option.

<AposCodeBlock>

  ```javascript
  module.exports = {
    options: {
      addErrors: {
        timeout: 408
      }
    }
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/http/index.js
  </template>
  
</AposCodeBlock>

## Related documentation

- [Front end HTTP helper methods](/guide/front-end-helpers.md#http-request-methods)

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/packages/apostrophe/modules/%40apostrophecms/http/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

Because this module has an alias, you can call these from another module from the alias path. For example, `self.apos.http.addError()`.

### `addError(name, code)`

An alternate way to register error names to HTTP error codes. Pass the semantic name as the first argument, followed by the `code` integer. The error code number becomes the HTTP status code when the error name is used in the `self.apos.error()` method.
<!-- TODO: Link to the error module reference. -->

### `async get(url, options)`

Fetch the given URL (`url`) via a `GET` request and return the response body. If the URL is relative (starts with `/`) it will be requested from the Apostrophe site itself. This is helpful to avoid needing to construct the base URL across environments.

Accepts the following properties on the optional `options` object:

| Option | Type |Description |
| -------- | ------ | ----------- |
| `qs` | Object | An object of query parameters and values. It may contain nested objects, arrays, and properties with null values. |
| `jar` | Object | Pass in a cookie jar obtained from `apos.http.jar()`. |
| `parse` | String | Set to `json` to always parse the response body as JSON, otherwise the response body is parsed as JSON only if the `content-type` is `application/json`. |
| `headers` | Object | An object containing header names and values. |
| `fullResponse` | Boolean | If `true`, return an object with `status`, `headers` and `body` properties, rather than returning the body directly. The individual `headers` are canonicalized to lowercase names. If a header appears multiple times an array is returned for it. |

If the status code is >= 400 an error is thrown. The error object will be
similar to a `fullResponse` object, with a `status` property.

### `async head(url, options)`

Make a `HEAD` request for the given URL and return the response object,
which will include a `status` property as well as `headers`. If the URL is relative (starts with `/`) it will be requested from the Apostrophe site itself. This is helpful to avoid needing to construct the base URL across environments.

Accepts the following properties on the optional `options` object:

| Option | Type |Description |
| -------- | ------ | ----------- |
| `qs` | Object | An object of query parameters and values. It may contain nested objects, arrays, and properties with null values. |
| `jar` | Object | Pass in a cookie jar obtained from `apos.http.jar()`. |
| `headers` | Object | An object containing header names and values. |

If the status code is >= 400 an error is thrown. The error object will be
similar to a `fullResponse` object, with a `status` property.

### `async post(url, options)`

Send a `POST` request to the given URL and return the response body. If the URL is relative (starts with `/`) it will be requested from the Apostrophe site itself. This is helpful to avoid needing to construct the base URL across environments.

Accepts the following properties on the optional `options` object:

| Option | Type |Description |
| -------- | ------ | ----------- |
| `qs` | Object | An object of query parameters and values. It may contain nested objects, arrays, and properties with null values. |
| `jar` | Object | Pass in a cookie jar obtained from `apos.http.jar()`. |
| `send` | String | Can be 'json' to always send `options.body` JSON-encoded, or `form` to send it URL-encoded. |
| `body` | Variable | The request body. If an object or array, it is sent as JSON. If a [`FormData` object](https://www.npmjs.com/package/form-data), it is sent as a `multipart/form-data` upload. Otherwise it is sent as-is, unless the `send` option is set. |
| `parse` | String | Set to `json` to always parse the response body as JSON, otherwise the response body is parsed as JSON only if the `content-type` is `application/json`. |
| `headers` | Object | An object containing header names and values. |
| `csrf` | Boolean/String | If set to `true`, which is the default, and the `jar` contains the CSRF cookie for this Apostrophe site due to a previous `GET` request, send it as the X-XSRF-TOKEN header. If a string, send the current value of the cookie of that name in the `jar` as the X-XSRF-TOKEN header. If `false`, disable this feature. |
| `fullResponse` | Boolean | If `true`, return an object with `status`, `headers` and `body` properties, rather than returning the body directly. The individual `headers` are canonicalized to lowercase names. If a header appears multiple times an array is returned for it. |

If the status code is >= 400 an error is thrown. The error object will be
similar to a `fullResponse` object, with a `status` property.

### `async delete(url, options)`

Send a `DELETE` request to the given URL and return the response body. If the URL is relative (starts with `/`) it will be requested from the Apostrophe site itself. This is helpful to avoid needing to construct the base URL across environments.

Accepts the following properties on the optional `options` object:

| Option | Type |Description |
| -------- | ------ | ----------- |
| `qs` | Object | An object of query parameters and values. It may contain nested objects, arrays, and properties with null values. |
| `jar` | Object | Pass in a cookie jar obtained from `apos.http.jar()`. |
| `send` | String | Can be 'json' to always send `options.body` JSON-encoded, or `form` to send it URL-encoded. |
| `body` | Variable | The request body. If an object or array, it is sent as JSON. If a [`FormData` object](https://www.npmjs.com/package/form-data), it is sent as a `multipart/form-data` upload. Otherwise it is sent as-is, unless the `send` option is set. |
| `parse` | String | Set to `json` to always parse the response body as JSON, otherwise the response body is parsed as JSON only if the `content-type` is `application/json`. |
| `headers` | Object | An object containing header names and values. |
| `csrf` | Boolean/String | If set to `true`, which is the default, and the `jar` contains the CSRF cookie for this Apostrophe site due to a previous `GET` request, send it as the X-XSRF-TOKEN header. If a string, send the current value of the cookie of that name in the `jar` as the X-XSRF-TOKEN header. If `false`, disable this feature. |
| `fullResponse` | Boolean | If `true`, return an object with `status`, `headers` and `body` properties, rather than returning the body directly. The individual `headers` are canonicalized to lowercase names. If a header appears multiple times an array is returned for it. |

If the status code is >= 400 an error is thrown. The error object will be
similar to a `fullResponse` object, with a `status` property.

### `async put(url, options)`

Send a `PUT` request to the given URL and return the response body. If the URL is relative (starts with `/`) it will be requested from the Apostrophe site itself. This is helpful to avoid needing to construct the base URL across environments.

Accepts the following properties on the optional `options` object:

| Option | Type |Description |
| -------- | ------ | ----------- |
| `qs` | Object | An object of query parameters and values. It may contain nested objects, arrays, and properties with null values. |
| `jar` | Object | Pass in a cookie jar obtained from `apos.http.jar()`. |
| `send` | String | Can be 'json' to always send `options.body` JSON-encoded, or `form` to send it URL-encoded. |
| `body` | Variable | The request body. If an object or array, it is sent as JSON. If a [`FormData` object](https://www.npmjs.com/package/form-data), it is sent as a `multipart/form-data` upload. Otherwise it is sent as-is, unless the `send` option is set. |
| `parse` | String | Set to `json` to always parse the response body as JSON, otherwise the response body is parsed as JSON only if the `content-type` is `application/json`. |
| `headers` | Object | An object containing header names and values. |
| `csrf` | Boolean/String | If set to `true`, which is the default, and the `jar` contains the CSRF cookie for this Apostrophe site due to a previous `GET` request, send it as the X-XSRF-TOKEN header. If a string, send the current value of the cookie of that name in the `jar` as the X-XSRF-TOKEN header. If `false`, disable this feature. |
| `fullResponse` | Boolean | If `true`, return an object with `status`, `headers` and `body` properties, rather than returning the body directly. The individual `headers` are canonicalized to lowercase names. If a header appears multiple times an array is returned for it. |

If the status code is >= 400 an error is thrown. The error object will be
similar to a `fullResponse` object, with a `status` property.

### `async patch(url, options)`

Send a `PATCH` request to the given URL and return the response body. If the URL is relative (starts with `/`) it will be requested from the Apostrophe site itself. This is helpful to avoid needing to construct the base URL across environments.

Accepts the following properties on the optional `options` object:

| Option | Type |Description |
| -------- | ------ | ----------- |
| `qs` | Object | An object of query parameters and values. It may contain nested objects, arrays, and properties with null values. |
| `jar` | Object | Pass in a cookie jar obtained from `apos.http.jar()`. |
| `send` | String | Can be 'json' to always send `options.body` JSON-encoded, or `form` to send it URL-encoded. |
| `body` | Variable | The request body. If an object or array, it is sent as JSON. If a [`FormData` object](https://www.npmjs.com/package/form-data), it is sent as a `multipart/form-data` upload. Otherwise it is sent as-is, unless the `send` option is set. |
| `parse` | String | Set to `json` to always parse the response body as JSON, otherwise the response body is parsed as JSON only if the `content-type` is `application/json`. |
| `headers` | Object | An object containing header names and values. |
| `csrf` | Boolean/String | If set to `true`, which is the default, and the `jar` contains the CSRF cookie for this Apostrophe site due to a previous `GET` request, send it as the X-XSRF-TOKEN header. If a string, send the current value of the cookie of that name in the `jar` as the X-XSRF-TOKEN header. If `false`, disable this feature. |
| `fullResponse` | Boolean | If `true`, return an object with `status`, `headers` and `body` properties, rather than returning the body directly. The individual `headers` are canonicalized to lowercase names. If a header appears multiple times an array is returned for it. |

If the status code is >= 400 an error is thrown. The error object will be
similar to a `fullResponse` object, with a `status` property.

### `jar()`

This method returns a "cookie jar," a set of HTTP cookies, compatible with the `jar` option in the request methods and the `getCookie()` method. The use of other cookie stores is not recommended.

### `getCookie(jar, url, name)`

Given a cookie jar received from `apos.http.jar()` and a context URL (`url`), this returns the current value for the given cookie (`name`), or `undefined` if there is no cookie set to that name.
