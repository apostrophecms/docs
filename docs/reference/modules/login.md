---
extends: '@apostrophecms/module'
---

# `@apostrophecms/login`

<AposRefExtends :module="$frontmatter.extends" />

This module manages Apostrophe's standard login form and related capabilities.

## Options

   localLogin: true,
    bearerTokens: true,
    throttle: {
      allowedAttempts: 3,
      perMinutes: 1,
      lockoutMinutes: 1
    }
 
|  Property | Type | Description |
|---|---|---|
|`localLogin` | Boolean | Defaults to `true`. If false, the login form is disabled.|
|`bearerTokens` | Boolean | Defaults to `true`. If set to an object, the `lifetime` subproperty determines the lifetime of a bearer token for the REST API.| 
|`throttle` | Object | Used to prevent brute-force password guessing.|

### `localLogin`

Defaults to `true`. If set to `false`, the normal login form at `/login` is completely disabled.

### `bearerTokens`

If set to an object with a `lifetime` subproperty, a bearer token is valid for that many seconds. If this option is not set, the lifetime defaults to 2 weeks.

### `throttle`

Can be set to an object with the subproperties `allowedAttempts` (defaults to 3), `perMinutes` (defaults to 1), and `lockoutMinutes` (defaults to 1). Prevents brute-force guessing of a single user's password.
