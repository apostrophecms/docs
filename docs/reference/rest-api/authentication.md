# Authentication

## API keys

API keys are great for server-to-server communication, because they don't expire. They are unsuitable for client-side requests or use in headless applications because it is possible for end users to determine the API key and use it for their own purposes. For these roles see the section on [bearer tokens below](#bearer-tokens) below.

Configure API keys as an option in the `@apostrophecms/express` module in `app.js`. Alternately, all `@apostrophecms/express` configuration may be added in a separate `modules/@apostrophecms/express/index.js` file.

```javascript
// In app.js
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

:::tip NOTE
Right now `admin` is the only supported role value for API requests. Any other role will result in an anonymous request, which is the same as using no API key. This will change in the next alpha release when the rest of the permissions model comes in.
:::

### Usage

Add an `authorization` [HTTP header](https://javascript.info/fetch#request-headers) to each request:

```
ApiKey myapikey1029384756
```

Alternatively you may pass the api key as the `apikey` or `apiKey` query parameter:

```
http://example.net/api/v1/article?apikey=myapikey1029384756
```

## Bearer tokens

Bearer tokens are more appropriate for browser use and headless applications because they are tied to a single user account. To obtain a bearer token, make a POST request to `/api/v1/login/login`, with the following body properties:

Example:

```javascript
{
  username: 'your-username-here',
  password: 'your-secure-password'
}
```

A successful response will return a JSON object with a `token` property.

```javascript
{
  token: 'random123Token456xyz'
}
```

### Usage

Add this token to all REST API requests that require login by passing an `Authorization` header. This includes POST, PUT, PATCH and DELETE operations. You will also get more complete results from GET operations, including access to documents with `visibility` set to `loginRequired`.

Your `authorization` HTTP header should look like:

```
Bearer random123Token456xyz
```

Note the need for the word "Bearer" before the key.

To log out and destroy the token, send a POST request to `/api/v1/login/logout`, with the same `authorization` header. No body properties are required. After logging out, the token is no longer accepted.
`