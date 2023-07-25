---
extends: '@apostrophecms/module'
---

# `@apostrophecms/error`

<AposRefExtends :module="$frontmatter.extends" />

This module establishes an error method used throughout Apostrophe code to help format code errors consistently.

::: info
`apos.error` is the error construction method, not an alias to this module.
:::

## Related documentation

- [HTTP module error codes](/reference/modules/http.md#adderrors)

## Featured methods

### `error(name, message, data)`

Returns an Error object suitable to throw. The `name` argument will
be applied to the Error object. Certain values of `name` match to certain HTTP status codes. [See the `@apostrophecms/http` module.](/reference/modules/http.md#adderrors)

`message` may be skipped completely, or included as a string for a longer description. `data` is optional and may contain data about the error, safe to share with an untrusted client.

If the error is caught by Apostrophe's [`apiRoutes`](/reference/module-api/module-overview.md#apiroutes-self), [`restApiRoutes`](/reference/module-api/module-overview.md#restapiroutes-self), and [`renderRoutes`](/reference/module-api/module-overview.md#renderroutes-self) mechanisms, and `name` matches to a status code, an appropriate HTTP error is sent. The HTTP response to the client will consist of a JSON object with `name`, `data`, and `message` properties (the latter two only if present). If the `name` argument does not match a code, a general 500 error is sent to avoid disclosing inappropriate information and the error is only logged by Apostrophe server-side.

``` json
{
  "name": "invalid",
  "data": {},
  "message": "Your credentials are incorrect, or there is no such user"
}
```

For brevity, this method is aliased as `apos.error`.

<AposCodeBlock>

  ```javascript
  module.exports = {
    // ...
    apiRoutes(self) {
      return {
        post: {
          async newest(req) {
            const product = await self.find(req).sort({
              createdAt: -1
            }).toObject();

            if (!product) {
              // 👇 Throwing an error with the error method.
              throw self.apos.error('notfound', 'No products were found.');
            }

            return { product };
          }
        }
      };
    }
  };
  ```
  <template v-slot:caption>
    modules/product/index.js
  </template>
</AposCodeBlock>
