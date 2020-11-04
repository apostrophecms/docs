---
title: "REST APIs"
---

# REST APIs in A3

REST APIs are a common component of headless applications, including Jamstack applications. In A2, Apostrophe provided these via the optional [apostrophe-headless](https://npmjs.com/package/apostrophe-headless) module.

In A3, Apostrophe's internal APIs follow the REST pattern from the very beginning, so there is no need for a separate headless module.

Specifically, Apostrophe provides headless REST APIs for both pieces and pages.

In addition, Apostrophe provides web APIs for uploading attachments, logging in and out, and embedding third-party content via the oEmbed standard.

## Limitations in `3.0.0-alpha.1`: api keys and bearer tokens

In the `3.0.0-alpha.1` release, APIs marked "login required" can only be accessed after logging into Apostrophe. The login API creates a session cookie which must be retained and sent back with future requests. While effective for editing a website, this is not typical practice for headless applications.

Before the final release of 3.0, we will also incorporate support for both api keys and bearer tokens. The former are suitable for API calls from other websites, while the latter are more secure for use in native apps.

## REST APIs for Pieces

All piece types in Apostrophe have a corresponding REST API. By default, this API is only available to logged-in users for security reasons. However you can enable it for public use via the `publicApiProjection` option, which must be a MongoDB-style projection indicating the fields to include in the response:

```javascript
// in ./module/product/index.js
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

This opens the door to using Apostrophe as a headless backend for Jamstack and native apps.

The following APIs are provided. Here we will assume your project contains the [product module from the pieces section](pieces.md).

### `GET /api/v1/product`

Returns all products as a JSON object:

```js
{
  "pages": 1,
  "currentPage": 1,
  "results": [
    {
      "_id": "ckgsj5in400d5xi4lb6fu29rh",
      "type": "product",
      "title": "Toaster",
      "description": {
        "metaType": "area",
        "_id": "ckgsj57c3001c2a67pfkrtlv7",
        "items": [
          {
            "_id": "ckgwegpfw00033h5xqlfb74nk",
            "metaType": "widget",
            "type": "@apostrophecms/rich-text",
            "content": "<p>This is a phenomenal toaster.</p>",
          }
        ],
      },
      "color": "red",
      "slug": "toaster"
    }, // more products
  ]
}
```

Note `pages` and `currentPage`. For performance reasons, not all of the products will be sent in a single response. You can fetch the second page of responses with:

```
GET /api/v1/product?page=2
```

### `GET /api/v1/product/:docId`

Returns an individual piece as a JSON object:

```js
{
  "_id": "ckgsj5in400d5xi4lb6fu29rh",
  "type": "product",
  "title": "Toaster",
  "description": {
    "metaType": "area",
    "_id": "ckgsj57c3001c2a67pfkrtlv7",
    "items": [
      {
        "_id": "ckgwegpfw00033h5xqlfb74nk",
        "metaType": "widget",
        "type": "@apostrophecms/rich-text",
        "content": "<p>This is a phenomenal toaster.</p>",
      }
    ],
  },
  "color": "red",
  "slug": "toaster"
}
```

### `POST /api/v1/product`

**Requires login.** POSTs a new product to the server. The request body should use the JSON encoding and be in the same format returned above.

### `PUT /api/v1/product/:docId`

**Requires login.** PUTs an updated version of the document to the server. The request body should use the JSON encoding and be in the same format returned above. However, **in most cases you should use PATCH**, particularly if you are only interested in updating certain fields.

### `PATCH /api/v1/product:docId`

**Requires login.** Identical to PUT, except that only the properties mentioned in the JSON body are updated. All other properties are left as-is.

In addition, we extend the REST convention with MongoDB-style operators:

```js
{
  // Via "not notation"
  "description.items.0.content": "<p>Update just the rich text.</p>",
  // Same thing via "@ notation," which finds the nested item with that _id
  "@ckgwegpfw00033h5xqlfb74nk.content": "<p>Update just the rich text.</p>"
}
```

### `DELETE /api/v1/product:docId`

**NOT supported. Instead PATCH the `trash` property to `true`.** Apostrophe never discards your work, so the `DELETE` verb is not applicable. However you may mark any piece as trash by `PATCH`ing that property. You may bring it back later by setting the property to `false`.

## REST APIs for Pages

Pages are challenging to represent RESTfully because of the page tree. Normally the "get all" operation of a REST API returns an array, but in this case an array is not appropriate. So the "get all" operation returns the home page instead, with a `_children` array property. Those pages in turn may have their own children:

### `GET /api/v1/@apostrophecms/page`

```js
{
  "_id": "ckgrzqh5a000bx7ecn4hpskk7",
  "slug": "/",
  "rank": 0,
  "level": 0,
  "title": "Home",
  "type": "@apostrophecms/home-page",
  "path": "ckgrzqh5a000bx7ecn4hpskk7",
  "trash": false,
  "main": {
    "_id": "ckgrzsklg0007ulec0ffxg5bj",
    "items": [
      {
        "_id": "ckh286ybv002b2a6716xndtft",
        "video": {
          "url": "https://vimeo.com/76979871",
          "title": "The New Vimeo Player (You Know, For Videos)",
          "thumbnail": "https://i.vimeocdn.com/video/452001751_295x166.jpg"
        },
        "metaType": "widget",
        "type": "@apostrophecms/video",
        "_edit": true,
        "_docId": "ckgrzqh5a000bx7ecn4hpskk7"
      },
      {
        "_id": "ckgs3ltc800073h5xhfgut3vi",
        "metaType": "widget",
        "type": "@apostrophecms/rich-text",
        "content": "<p>Welcome! We think you'll enjoy our website.</p>"
      }
    ]
  },
  "_url": "/",
  "_ancestors": [],
  "_children": [
    {
      "_id": "ckgs04kh6000b6fecsfjp95w0",
      "type": "default-page",
      "title": "About",
      "slug": "/about",
      "main": {
        "_id": "ckgs02ri400043h5xrb73a9x7",
        "items": [
          {
            "_id": "ckgs14nsp00013h5xnpvnjhve",
            "type": "@apostrophecms/rich-text",
            "content": "<p>This is the page about our company and how remarkably wonderful and modest we are.<p>"
          }
        ],
        "metaType": "area"
      },
      "rank": 0,
      "path": "ckgrzqh5a000bx7ecn4hpskk7/ckgs04kh6000b6fecsfjp95w0",
      "level": 1,
      "_url": "/about",
      "_children": []
    }, // ... more child pages
  ]
}
```

### `POST /api/v1/@apostrophecms/page`

**Requires login.** POSTs a new page to the server. Works just like POSTing a piece, with the following addition:

* You must pass `_position` and `_targetId`. `_targetId` must be the `_id` of an existing page, or one of the convenient shorthands `_trash` and `_home`. `_position` may be `before`, `after`, `firstChild`, or `lastChild`. Alternatively `_position` may be an integer in which case the new page is inserted as a child at that point in the list.

### `PUT /api/v1/@apostrophecms/page/:docId`

**Requires login.** PUTs an updated version of the page to the server. Works just like `PUT` for pieces, with this exception: you may include `_position` and `_targetId`, although it is not mandatory. If you do not the position in the tree does not change.

### `PATCH /api/v1/@apostrophecms/page/:docId`

**Requires login.** Identical to PATCHing a piece, except that you may include `_position` and `_targetId` if you wish to change the position in the tree. To easily move a page into the trash, set `_targetId` to `_trash` and `_position` to `lastChild`. You may similarly move pages out of the trash by moving them to a position relative to a page that is not in the trash.

### `DELETE /api/v1/@apostrophecms/page:docId`

**NOT supported.** Instead set `_targetId` to `_trash` and `_position` to `lastChild`. You may similarly move pages out of the trash by moving them to a position relative to a page that is not in the trash.

## PATCHing a document of any type

**Requires login.** As a convenience, you may also `PATCH` a document without specifying the exact module that should handle it:

### `PATCH /api/v1/@apostrophecms/doc/:docId`

In this case the request is routed to the appropriate module. Apostrophe uses this route for in-context editing.

## Uploading attachments

**Login required.** You may upload media by making a POST request:

```
POST /api/v1/@apostrophecms/attachment/upload
```

When you do so, the encoding should be `multitype/form-data`, and the request body should contain one file upload for a field named `file`.

If the request is accepted, the response will be a JSON-encoded object suitable for use as the value of a field of type `attachment`. Typical practice is to next `POST` or `PATCH` a piece or page that contains an attachment field, such as the `@apostrophecms/image` piece type.

## Logging in and logging out

You may log in and out via these APIs:

### POST /api/v1/@apostrophecms/login/login

The request body must contain `username` and `password` properties. If a `200` status code is received, a login session has been established, and a session cookie will be included in the response. This cookie must be sent back with future requests that require login.

### POST /api/v1/@apostrophecms/login/logout

**Login required.** If a `200` status code is received, the login session has been terminated and the session cookie is no longer valid for future requests.

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
      // GET /api/v1/mydatabase
      async getAll(req) {
        // ... await data from a custom database, then ...
        return {
          results
        };
      },
      // GET /api/v1/mydatabase/:docId
      async getOne(req, _id) {
        // ... await one result from a custom database, then ...
        return result;
      },
      // PATCH /api/v1/mydatabase/:docId
      async patch(req, _id) {
        // ... patch fields in one record in a custom database, then ...
        return result;
      },
      // PUT /api/v1/product/:docId
      async put(req, _id) {
        // Replace one record in a custom database, then ...
        return result;
      },
      // DELETE /api/v1/product/:docId
      async delete(req, _id) {
        // Delete one record from a custom database, then ...
        return result;
      }
    };
  },

  // apiRoutes are helpful for edge cases that don't
  // match up well with the REST conventions
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
GET /api/v1/mydatabase/:docId
```

And so on.

::: tip Note:
When writing your own custom REST APIs, you are solely responsible for security. Apostrophe does not check whether the user is logged in or has suitable privileges.
:::
