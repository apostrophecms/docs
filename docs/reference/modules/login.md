---
extends: '@apostrophecms/module'
---

# `@apostrophecms/login`

<AposRefExtends :module="$frontmatter.extends" />

This module manages Apostrophe's standard login form and related capabilities.

## Options
 
|  Property | Type | Description |
|---|---|---|
|`localLogin` | Boolean | If false, the login form is disabled.|
|`passwordReset` | Boolean | If true, a password reset link is added to the login. |
| `passwordResetHours` | Integer | If `passwordReset` is true it controls how many hours a reset token is valid. |
|`bearerTokens` | Object | If set to an object, the `lifetime` subproperty determines the lifetime of a bearer token for the REST API.| 
|`throttle` | Object | Used to prevent brute-force password guessing.|

### `localLogin`

Defaults to `true`. If set to `false`, the normal login form at `/login` is completely disabled.

### `passwordReset`

Defaults to `false`. If both `localLogin` and `passwordReset` are set to `true`, a password reset link is added to the login form. Clicking on this link brings up a form for the user to enter the email address associated with their account. The address is compared to the list of existing user emails and a reset link is sent if that email is found. Note, the site email settings must be correctly configured prior to using the password reset. See the [email documentation](/guide/front-end-assets.html) for help in configuring the module. It is also recommended that the `baseUrl` be set in the `app.js` file. The user will not be notified if the email check fails or if the email fails to send due to improper configuration. However, debug information will output in the terminal.

### `passwordResetHours`

Defaults to `48`, giving the user 48 hours to reset the password based on the emailed link.

### `bearerTokens`

If set to an object with a `lifetime` subproperty, a bearer token is valid for that many seconds. If this option is not set, the lifetime defaults to 2 weeks.

### `throttle`

Can be set to an object with the subproperties `allowedAttempts` (defaults to 3), `perMinutes` (defaults to 1), and `lockoutMinutes` (defaults to 1). Prevents brute-force guessing of a single user's password.
