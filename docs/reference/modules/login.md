---
extends: '@apostrophecms/module'
---

# `@apostrophecms/login`

<AposRefExtends :module="$frontmatter.extends" />

This module manages Apostrophe's standard login form and related capabilities.

## Options
 
|  Property | Type | Description |
|---|---|---|
| [`loginUrl`](#loginurl) | String | Sets the login endpoint.|
|[`localLogin`](#locallogin) | Boolean | If false, the login form is disabled.|
|[`passwordReset`](#passwordreset) | Boolean | If true, a password reset link is added to the login. |
| [`passwordResetHours`](#passwordresethours) | Integer | If `passwordReset` is true it controls how many hours a reset token is valid. |
|[`bearerTokens`](#bearertokens) | Object | If set to an object, the `lifetime` subproperty determines the lifetime of a bearer token for the REST API.| 
|[`throttle`](#throttle) | Object | Used to prevent brute-force password guessing.|
| [`whoamiFields`](#whoamifields) | Array | Additional user fields to include in `whoami` API responses.|
| [`minimumWhoamiFields`](#minimumwhoamifields) | Array | Core user fields always included in `whoami` API responses.|

### `loginUrl`

The default login endpoint for access to the ApostropheCMS backend is `/login`. Passing a string to the `loginUrl` option will change this endpoint. Note that the desired endpoint should be prefixed with a forward slash, e.g. `/admin-login`.
### `localLogin`

Defaults to `true`. If set to `false`, the normal login form at `/login` is completely disabled.

### `passwordReset`

Defaults to `false`. If both `localLogin` and `passwordReset` are set to `true`, a password reset link is added to the login form. Clicking on this link brings up a form for the user to enter the email address associated with their account. The address is compared to the list of existing user emails and a reset link is sent if that email is found. Note, the site email settings must be correctly configured prior to using the password reset. See the [email guide](/guide/sending-email.html) for help in configuring the module. It is also recommended that the `baseUrl` be set in the `data/local.js` or other server configuration file or through the `APOS_BASE_URL` environment variable. The user will not be notified if the email check fails or if the email fails to send due to improper configuration. However, debug information will output in the terminal.

### `passwordResetHours`

Defaults to `48`, giving the user 48 hours to reset the password based on the emailed link.

### `bearerTokens`

If set to an object with a `lifetime` subproperty, a bearer token is valid for that many milliseconds. If this option is not set, the lifetime defaults to 2 weeks. To
convert days to milliseconds, you can use logic like: `86400 * 1000 * days`

### `throttle`

Can be set to an object with the subproperties `allowedAttempts` (defaults to 3), `perMinutes` (defaults to 1), and `lockoutMinutes` (defaults to 1). Prevents brute-force guessing of a single user's password.

### `whoamiFields`

An array of additional user field names to include in responses from the `/api/v1/@apostrophecms/login/whoami` endpoint. These fields are combined with `minimumWhoamiFields` to determine what user information is returned.

<AposCodeBlock>

```javascript
export default {
  options: {
    whoamiFields: ['email', 'firstName', 'lastName', 'phone']
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/login/index.js
  </template>
</AposCodeBlock>

Only fields that exist on the user document and are not `undefined` will be included in the response.

### `minimumWhoamiFields`

An array of core user field names that are always included in `whoami` API responses, regardless of the `whoamiFields` configuration. This ensures essential user identification fields are always available.

The default minimum fields typically include basic identifiers like `_id`, `username`, and `title`. You can extend this list if your application requires additional fields to always be present:

<AposCodeBlock>

```javascript
export default {
  options: {
    minimumWhoamiFields: ['_id', 'username', 'title', 'role']
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/login/index.js
  </template>
</AposCodeBlock>

**Security note:** The `whoami` endpoint only returns explicitly configured fields, never the complete user object. This prevents accidental exposure of sensitive user data like password hashes or internal system fields.

## API Routes

### POST `/api/v1/@apostrophecms/login/login`
Authenticates a user and returns a bearer token or establishes a session. See the [REST API reference](/reference/api/authentication.html#bearer-tokens) for details.

### POST `/api/v1/@apostrophecms/login/logout` 
Ends the current user session and invalidates tokens. See the [REST API reference](/reference/api/authentication.html#end-session) for details.

### GET/POST `/api/v1/@apostrophecms/login/whoami`
Returns information about the currently authenticated user. See the [REST API reference](/reference/api/authentication.html#getting-current-user-information) for details.

### GET/POST `/api/v1/@apostrophecms/login/context`
Returns login context information including environment and requirements.

### POST `/api/v1/@apostrophecms/login/resetRequest`
Initiates a password reset process (if `passwordReset` is enabled).

### POST `/api/v1/@apostrophecms/login/reset`
Completes a password reset (if `passwordReset` is enabled).
