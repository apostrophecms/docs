---
title: "REST APIs"
---

# REST APIs

REST APIs are a common component of headless applications, including Jamstack applications. In A2, Apostrophe provided these via the optional [apostrophe-headless](https://npmjs.com/package/apostrophe-headless) module.

In A3, Apostrophe's internal APIs follow the REST pattern from the very beginning, so there is no need for a separate headless module. Specifically, Apostrophe provides headless REST APIs for both pieces and pages. In addition, Apostrophe provides web APIs for uploading attachments, logging in and out, and embedding third-party content via the oEmbed standard.

APIs cover CRUD and other operations for pieces, pages, and media. See the [API reference for details on usage](/reference/api/README.md).

## Locale and mode in API calls

Once published, most Apostrophe document types have both a draft and a published copy in the database. If you are using multiple locales in your project, there may be documents for each locale as well. The `apos-mode` and `apos-locale` query parameters help support using REST API routes to manage those versions.

Passing `draft` or `published` values on `apos-mode` and your locale names on the `apos-locale` parameter tell Apostrophe to execute that request for those versions of the piece or page you are working with. For example, `GET /api/v1/product?apos-mode=draft&apos-locale=fr` will get all the draft and `fr` (French) locale versions of the product documents. These can be used independently, so you can only use `apos-mode` and Apostrophe will use the default locale value. Or only use `apos-locale` and Apostrophe will use `published` for the mode.

### Locale and mode in single-document requests

**The exception to those assumed values are with `GET`, `PATCH`, and other requests that include a document `_id` value.** Document IDs include mode and locale information already. `ckgsj5in400d5xi4lb6fu29rh:fr:draft` ends with `:fr:draft`, indicating that it is the `fr` locale and `draft` version of a particular piece or page.

You may still use the `apos-mode` and `apos-locale` parameters with these requests related to existing documents, however. If present, they will always take precendence. For example, a `GET` request with the document ID `ckgsj5in400d5xi4lb6fu29rh:fr:published` will normally return a product document in the `fr` locale and that is published.

If we add an `apos-mode` parameter using the same route, we can get the draft version. So a `GET` request to `/api/v1/product/ckgsj5in400d5xi4lb6fu29rh:fr:published?apos-mode=draft` returns the draft version, even though the route includes the published mode. This allows developers to work on multiple versions of a single document without repeatedly updating the `_id` value in their code.

## Creating Your Own REST APIs

Apostrophe provides many REST APIs, but also provides a convenient way to write your own. You don't need this for pieces or pages, but it can be useful for wrapping your own project-specific backends:

```js
// in ./app.js
require('apostrophe') {
  modules: {
    mydatabase: {}
  }
};
```

```js
// in ./modules/mydatabase/index.js

module.exports = {

  // This module does not extend anything. (Technically, it extends
  // @apostrophecms/module, the default base class.)

  restApiRoutes(self, options) {
    return {
      // GET /api/v1/product
      async getAll(req) {
        // Get real data from somewhere
        const results = [];
        return {
          results
        };
      },
      // GET /api/v1/product/:_id
      async getOne(req, _id) {
        // Get real data from somewhere
        const result = {};
        return result;
      },
      // PATCH /api/v1/product/:_id
      async patch(req, _id) {
        // Modify an object somewhere
        return {};
      },
      // PUT /api/v1/product/:_id
      async put(req, _id) {
        // Replace an object somewhere
        return {};
      },
      // DELETE /api/v1/product/:_id
      async delete(req, _id) {
        // Delete an object somewhere
        return;
      }
    };
  },

  // apiRoutes are also helpful, for related edge cases that don't
  // match up well with the REST conventions.
  // This route becomes accessible as: `POST /api/v1/mydatabase/merge`

  apiRoutes(self, options) {
    return {
      post: {
        async merge(req) {
          // merge two records in the database somehow
        }
      }
    };
  }

};
```

The resulting APIs are available via:

```
GET /api/v1/mydatabase
GET /api/v1/mydatabase/:_id
```

And so on.

::: tip Note:
When writing your own custom REST APIs, you are solely responsible for security. Apostrophe does not check whether the user is logged in or has suitable privileges.
:::
