---
extends: '@apostrophecms/module'
---

# `@apostrophecms/express`

<AposRefExtends :module="$frontmatter.extends" />

This module initializes the Express framework, which Apostrophe uses and extends to implement both API routes and page-serving routes. The Express `app` object is made available as `apos.app`, and the `express` object itself as `apos.express`. This module also adds a number of standard middleware functions and implements the server side of CSRF protection for Apostrophe.

## Options

|  Property | Type | Description |
|---|---|---|
|`address` | String | Apostrophe listens for connections on all interfaces (`0.0.0.0`) unless this option is set to another address. If the `ADDRESS` environment variable is set, it is used instead. |
|`apiKeys` | Object | Configure API keys for request authentication. See [the authentication guide](/reference/api/authentication.md#api-keys) for more. |
|`bodyParser` | Object | The `json` and `urlencoded` properties of this object are merged with Apostrophe's default options to be passed to the [`body-parser` npm module's](https://www.npmjs.com/package/body-parser) `json` and `urlencoded` methods. |
|`csrf` | Boolean/Object | Set to `false` to disable CSRF protection or to an object with a `name` property to customize the CSRF cookie name. See below. |
|`expressBearerToken` | Object | An options object passed to [`express-bearer-token`](https://www.npmjs.com/package/express-bearer-token) for the bearer token middleware. |
|`port` | Integer | Apostrophe listens for connections on port `3000` unless this option is set to another port. If the `PORT` environment variable is set, it is used instead. |
|`session` | Object | Properties of the `session` option are used to create the session middleware. See below. |
|`trustProxy` | Boolean | Enables the [trust proxy option for Express](https://expressjs.com/en/api.html#trust.proxy.options.table). Set to `true` to tell the Express app to  respect `X-Forwarded-* ` headers. This is helpful when Apostrophe is generating `http:` URLs even though a proxy like nginx is being used to serve it over `https:`. |

### `session`

The `session` options object is passed to the
[express-session](https://npmjs.org/package/express-session) function. If each is not otherwise specified, Apostrophe enables the following defaults:

```javascript
{
  // Does not save sessions until something is stored in them. This greatly
  // reduces `aposSessions` collection size.
  saveUninitialized: false,
  // We are using the 3.x mongo store which is compatible with the
  // `resave: false` option, preventing the vast majority of session-related
  // race conditions.
  resave: false,
  // Always update the cookie, so that each successive access revives your
  // login session timeout.
  rolling: true,
  // This option should be customized in every project.
  secret: 'you should have a secret',
  name: self.apos.shortName + '.sid',
  cookie: {}
}
```

By default Apostrophe stores sessions in MongoDB so it is not necessary to install another solution. If you want to use another session store, you can pass an instance as the store sub-option, but it's easier to let Apostrophe do the work of setting it up:

<AposCodeBlock>
  ```javascript
  module.exports = {
    options: {
      session: {
        store: {
          name: 'connect-redis',
          options: {
            // redis-specific options here
          }
        }
      }
    }
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/express/index.js
  </template>
</AposCodeBlock>

Be sure to install `connect-redis`, or the store of your choice, as an npm dependency of your project.

### `csrf`

By default, Apostrophe implements [CSRF protection](https://en.wikipedia.org/wiki/Cross-site_request_forgery) via an `XSRF-TOKEN` cookie. All non-safe HTTP requests (not `GET`, `HEAD`, `OPTIONS` or `TRACE`) automatically receive protection via CSRF middleware, which rejects requests in which the CSRF token does not match the header. *If the request was made with a valid API key or bearer token it bypasses this check.*

If the `csrf` option is set to `false`, CSRF protection is disabled. **This is not recommended.** Set this option to an object with a `name` property to set that property's value as the CSRF cookie name.

You can configure exceptions to CSRF protection by setting the [`csrfExceptions` option](/reference/module-api/module-options.md#csrfexceptions) of any module to an array of route names specific to that module, or URLs (starting with `/`). Exceptions may use [Minimatch](https://github.com/isaacs/minimatch) wildcards (`*` and `**`).

You may need to use this feature when implementing `POST` form submissions that do not send the header.

## Related documentation

- [Custom express routes](/reference/module-api/module-overview.md#routes-self)
- [Authentication with API keys](/reference/api/authentication.md#api-keys)

## Featured methods

This module's methods are used to generate the Express app. Customization should be done using the options described above. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/express/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->
