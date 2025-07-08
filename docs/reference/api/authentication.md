# Authentication

## API keys

API keys are great for server-to-server communication because they don't expire. However, they are unsuitable for client-side requests or use in headless applications because it is possible for end users to determine the API key and use it for their own purposes. For these roles, see the section on [bearer tokens](#bearer-tokens) below.

Configure API keys as an option in the `@apostrophecms/express` module in `app.js`. Alternately, all `@apostrophecms/express` configuration may be added in a separate `modules/@apostrophecms/express/index.js` file.

<AposCodeBlock>

``` javascript
require('apostrophe')({
  modules: {
    '@apostrophecms/express': {
      options: {
        apiKeys: {
          // Use your own key value. Ideally use a strong, randomly generated
          // key.
          'myapikey1029384756': {
            // The user role associated with this key
            role: 'admin'
          }
        }
      }
    },
    // ...
```
<template v-slot:caption>
  app.js
</template>
</AposCodeBlock>

### Usage

Add an `authorization` [HTTP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization) to each request:

```
Authorization: ApiKey myapikey1029384756

```

Alternatively, you may pass the api key as the `apikey` or `apiKey` query parameter:

```
http://example.net/api/v1/article?apikey=myapikey1029384756
```

## Bearer tokens

Bearer tokens are more appropriate for browser use and headless applications because they are tied to a single user account. To obtain a bearer token, make a `POST` request to `/api/v1/@apostrophecms/login/login`, with the `username` and `password` body properties:

```javascript
// Request inside an async function.
const response = await fetch('http://example.net/api/v1/@apostrophecms/login/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'your-username-here',
    password: 'your-secure-password'
  })
});
const data = await response.json();
```

### Response

A successful response will return a JSON object with a `token` property.

``` json
{
  token: 'random123Token456xyz'
}
```

In case of an error an appropriate HTTP status code is returned.

### Usage

Add this token to all REST API requests that require login by passing an `Authorization` header. This includes `POST`, `PUT`, `PATCH` and `DELETE` operations. Using authorization for `GET` operations will return more complete results, including access to documents with `visibility` set to `loginRequired`.

Your `authorization` HTTP header should look like:

```
Bearer random123Token456xyz
```

Note the need for the word "Bearer" before the key.

To log out and destroy the token, send a `POST` request to `/api/v1/login/logout`, with the same `authorization` header. No body properties are required. After logging out, the token is no longer accepted.
`

## Session cookies

As an alternative to a bearer token, you may request a session cookie. This is the mechanism Apostrophe's admin user interface uses to log in. Session cookies will automatically persist across tabs, but there is slightly more overhead to each request. To use this method, include `session: true` in the `POST` request to `/api/v1/@apostrophecms/login/login`.

``` javascript
// Request inside an async function.
const response = await fetch('http://example.net/api/v1/@apostrophecms/login/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials:'include',
  body: JSON.stringify({
    username: 'your-username-here',
    password: 'your-secure-password',
    session: true
  })
});
```

### Response

A successful response will return a session cookie via the `Set-Cookie` header, which should be automatically honored in the browser context. In case of an error, an appropriate HTTP status code is returned. For more information about custom log-in requirements, see the documentation [here](https://docs.apostrophecms.org/guide/custom-login-requirements.html) in our guide.

### End session

Using the session cookie, send a `POST` request to `/api/v1/@apostrophecms/login/logout` to end the user session.

``` javascript
// Request inside an async function.
const response = await fetch('http://example.net/api/v1/@apostrophecms/login/logout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  credentials: 'include',
  body: JSON.stringify({
    username: 'your-username-here',
    password: 'your-secure-password',
    session: true
  })
});
```

## Allowing public access

All piece types in Apostrophe have a corresponding REST API. By default, this API is only available to authenticated users for security reasons. However, you can enable it for public use via the `publicApiProjection` option, which must be a MongoDB-style projection indicating the fields to include in the response:

<AposCodeBlock>

``` javascript
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    publicApiProjection: {
      title: 1,
      _url: 1,
      description: 1,
      color: 1
    }
  }
};
```

<template v-slot:caption>
  modules/product/index.js
</template>
</AposCodeBlock>

## Allowing full `GET` access for guest users

By default, even a logged-in user can only see content exposed by the `publicApiProjection`,
unless they have at least some editing privileges.

If your project involves "guest" users who have no editing privileges, or at least none
that are exposed via Apostrophe permissions and roles, but should have full read access
to the REST APIs you can enable this for each relevant piece type:

<AposCodeBlock>

``` javascript
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    guestApiAccess: true
  }
};
```

<template v-slot:caption>
  modules/product/index.js
</template>
</AposCodeBlock>

You can also enable it for pages:

<AposCodeBlock>

``` javascript
module.exports = {
  options: {
    guestApiAccess: true
  }
};
```

<template v-slot:caption>
  modules/@apostrophecms/page/index.js
</template>
</AposCodeBlock>

This does not grant guest users access to anything the public could not see if it
was being accessed as part of an ordinary website page. For instance, this does not
mean that guests can view drafts.

## Getting current user information

After authentication, you can retrieve information about the currently logged-in user by making a request to the `/api/v1/@apostrophecms/login/whoami` endpoint.

### Usage

**With API key (header):**
```javascript
const response = await fetch('http://example.net/api/v1/@apostrophecms/login/whoami', {
  method: 'POST',
  headers: {
    'Authorization': 'ApiKey your-api-key-here',
    'Content-Type': 'application/json'
  }
});
const user = await response.json();
```

**With API key (query parameter):**
```javascript
const response = await fetch('http://example.net/api/v1/@apostrophecms/login/whoami?apikey=your-api-key-here', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});
const user = await response.json();
```

**With bearer token:**
```javascript
const response = await fetch('http://example.net/api/v1/@apostrophecms/login/whoami', {
  method: 'POST', // Recommended
  headers: {
    'Authorization': 'Bearer your-token-here',
    'Content-Type': 'application/json'
  }
});
const user = await response.json();
```

**With session cookie:**
```javascript
const response = await fetch('http://example.net/api/v1/@apostrophecms/login/whoami', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include' // Include session cookies
});
const user = await response.json();
```

### Response

Returns a JSON object containing user information based on configured fields:

```json
{
  "_id": "user123",
  "username": "john-doe",
  "title": "John Doe",
  "email": "john@example.com"
}
```

### Error handling

- Returns a 404 status code for unauthenticated requests
- No user information is returned if the user is not logged in

The specific fields returned can be configured in the `@apostrophecms/login` module. See the [login module documentation](/reference/modules/login.html) for configuration options.