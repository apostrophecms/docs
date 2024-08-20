# Piece type REST API

Apostrophe provides built-in REST end points for all [piece types](/reference/glossary.md#piece). The exact document properties returned will depend on the piece type's fields.

## Endpoints

**Note:** `:piece-name` represents the name of a piece type module. For example, you would request all pieces of an `article` piece type with `/api/v1/article`.

### REST endpoints

[Authentication](/reference/api/authentication.md) is required for all requests other than `GET` requests for pieces with defined [`publicApiProjection`](/reference/module-api/module-options.md#publicapiprojection).

| Method | Path | Description |
|---------|---------|---------|
|`GET` | [`/api/v1/:piece-name`](#get-api-v1-piece-name)| Get all pieces of a given type, paginated|
|`GET` | [`/api/v1/:piece-name/:_id`](#get-api-v1-piece-name-id)| Get a single piece with a specified ID |
|`POST` | [`/api/v1/:piece-name`](#post-api-v1-piece-name)| Insert a new piece of the specified type |
|`PUT` | [`/api/v1/:piece-name/:_id`](#put-api-v1-piece-name-id)| Fully replace a specific piece document |
|`PATCH` | [`/api/v1/:piece-name/:_id`](#patch-api-v1-piece-name-id)| Update only certain fields on a specific document |
|`DELETE` | [`/api/v1/:piece-name/:_id`](#delete-api-v1-piece-name-id) | **Permanently deletes a piece document** |

### Additional piece endpoints

| Method | Path | Description |
|---------|---------|---------|
|`POST` | [`/api/v1/:piece-name/:_id/publish`](#post-api-v1-piece-name-id-publish) | Publish the draft version of a piece |

**This guide will use an `article` piece type as an example.** In addition to standard piece fields, this hypothetical piece type has the following fields (for the sake of illustration):
- `author`: a `relationship` field connected to the `user` piece type
- `category`: a String field
- `body`: an `area` field using the rich text widget.

## `GET /api/v1/:piece-name`

### Basic query parameters

| Parameter | Example | Description |
|----------|------|-------------|
|`page` | `?page=2` | The page of results to return |
|`perPage` | `?perPage=20` | Number of pieces to return on each page |
|`search` | `?search=shoes` | A search query to filter the response |
|`autocomplete` | `?autocomplete=sho` | A partial word to filter the response |
|`aposMode` | `?aposMode=draft` | Set to `draft` to request the draft version of piece documents instead of the current published versions. Set to `published` or leave it off to get the published version. Authentication is required to get drafts. |
|`aposLocale` | `?aposLocale=fr` | Set to a valid locale to request piece document versions for that locale. Defaults to the default locale. |
|`render-areas` | `?render-areas=true` | Replaces area `items` data with a `_rendered` property set to a string of HTML based on widget templates. |
<!-- TODO: link to docs about locales when available. -->

#### More about pagination

Apostrophe REST APIs are paginated. Use `page` and `perPage`, not `skip` and `limit`. For best performance, load content when you need it and avoid large values for `perPage`.

#### More about search

`search` produces the most complete search results, while `autocomplete` supports an incomplete final word in the query, so it is better suited to "search as you type" interfaces. Since the results are more complete with `search` (as long as the user has finished typing the last word), providing a way to trigger a full `search` is still recommended when using `autocomplete`.

#### Querying on individual fields

You can also query based on the value of most top level [schema fields](/reference/field-types/index.md) present in the document, including fields you add yourself. For example, you can query on slugs, string fields, and relationships:

| Parameter | Example | Description |
|----------|------|-------------|
|`slug` | `?slug=friday-gathering` | The value of the slug field |
|`title` | `?title=Friday%20Gathering` | The value of the title field |
|`_topic` | `?_topic=idOfTopicGoesHere` | The `_id` property of a related piece |
|`topic` | `?topic=cheese` | The `slug` property of a related piece |
|`_topic[]` | `?_topic[]=cheese&_topic[]=bread` | An "OR" search on multiple related pieces |
|`_topicAnd[]` | `?_topicAnd[]=cheese&_topicAnd[]=bread` | An "AND" search on multiple related pieces |

`slug` and `title` exist in all piece types. For the `_topic` and `topic` examples, your piece type must have a [relationship field](../field-types/relationship.md) by that name permitting the user to select related topics, for instance:

```javascript
fields: {
  add: {
    _topic: {
      relationship: {
        withType: 'topic'
      }
    }
  }
}
```

Note that `title` is not intended as a general-purpose search and titles might not be unique.

#### Relationship searches on `_id` versus `slug`

Leaving the `_` off the query parameter for a relationship field causes it to match on the slug rather than the `_id` of the related document. This is useful for public-facing URLs.

#### Relationship searches for multiple related documents

Multiple values can be passed for the same relationship field using the `[]` suffix on each one. This creates an "OR" search. In the example above, you'll receive all pieces that have a relationship to cheese OR bread.

To perform an "AND" search, add `And` to the end of the query parameter name as shown in the last example above.

#### Querying on custom query builders

It is possible to create your own custom query builders that receive query parameters and customize the search results. For discussion and an example, see the [queries](../module-api/module-overview.md#queries-self-query) module configuration function.

### Request example

```javascript
// Request inside an async function.
const response = await fetch('http://example.net/api/v1/article?apikey=myapikey&aposMode=draft', {
  method: 'GET'
});
const document = await response.json();
```

### Response

By default, `GET` requests return the published and default locale version of each piece.

| Property | Type | Description |
|----------|------|-------------|
|`pages` | Number | The total number of pages of results |
|`currentPage` | Number | The current page of results |
|`results` | Array | An array of individual piece objects. See the [getOne](#get-api-v1-piece-name-id) response for the document structure.|


``` json
  {
    // Total number of pages of results (10 per page by default)
    "pages": 4,
    // The returned page of results
    "currentPage": 1,
    // Piece document results
    "results": [
      {
        "_id": "ckitdo5oq004pu69kr6oxo6fr",
        "archived": false,
        "visibility": "public",
        "type": "article",
        "title": "ES6 and Beyond: modern JavaScript is so worth it",
        "slug": "es6-and-beyond-modern-javascript-is-so-worth-it",
        // ... additional properties
      },
      // ... up to nine additional documents, by default
    ]
  }
```

In case of an error an appropriate HTTP status code is returned.

## `GET /api/v1/:piece-name/:_id`

### Query parameters

| Parameter | Example | Description |
|----------|------|-------------|
|`aposMode` | `?aposMode=draft` | Set to `draft` or `published` to request a specific mode version of the piece. Authentication is required to get drafts. |
|`aposLocale` | `?aposLocale=fr` | Set to a valid locale to request the piece document version for that locale. |
|`render-areas` | `?render-areas=true` | Replaces area `items` data with a `_rendered` property set to a string of HTML based on widget templates. |

<!-- TODO: link to docs about locales and modes when available. -->
<!-- Read more about [mode and locale parameters on single-document requests](/guide/rest-apis#locale-and-mode-in-single-document-requests). -->
::: info
Query parameters will override the locale and mode present in the `_id`. So, if the `aposLocale=es` parameter is supplied, a `GET` request to the `_id` `###:en:published` will return the Spanish, not English, locale.
You can also elect to use the `aposDocId` instead of the `_id` and use the query parameters to pass in the locale and mode parameters found in the `_id`.
:::

### Request example

```javascript
// Request inside an async function.
const response = await fetch('http://example.net/api/v1/article/ckitdo5oq004pu69kr6oxo6fr?apikey=myapikey&aposMode=draft&aposLocale=en', {
  method: 'GET'
});
const document = await response.json();
```

### Response

The successful `GET` request returns the matching document. See the [piece document response example](#piece-document-response-example) below for a sample response body. In case of an error an appropriate HTTP status code is returned.

## `POST /api/v1/:piece-name`

### Query parameters

| Parameter | Example | Description |
|----------|------|-------------|
|`aposMode` | `?aposMode=draft` | Set to `draft` to insert a piece as a draft instead of immediately published. Set to `published` or leave it off to insert a published piece. |
|`aposLocale` | `?aposLocale=fr` | Set to a valid locale to request piece document versions for that locale. Defaults to the default locale. |
<!-- TODO: link to docs about locales when available. -->

### Request example

```javascript
// Object with, at a minimum, properties for each required piece field.
const data = { ... };
// Request inside an async function.
const response = await fetch('http://example.net/api/v1/article?apikey=myapikey', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
const document = await response.json();
```

### Response

The successful `POST` request returns the newly created document. See the [piece document response example](#piece-document-response-example) below for a sample response body. In case of an error an appropriate HTTP status code is returned.

### Duplicating existing pieces

The optional `_copyingId` property may be added to the **body** of the
request, e.g. included in the `data` object passed to `JSON.stringify`
above. If this property contains the `_id` of an existing piece of the
same type, the properties of that piece will be applied first as
defaults, and then overridden by any properties present in the body.

In addition, this value becomes the `copyOfId` property of the new piece.
[`beforeInsert` handlers](/reference/server-events.md#beforeinsert) of individual piece types can access this property
to duplicate additional application-specific resources as needed.

## `PUT /api/v1/:piece-name/:_id`

### Query parameters

| Parameter | Example | Description |
|----------|------|-------------|
|`aposMode` | `?aposMode=draft` | Set to `draft` or `published` to replace a specific mode version of the piece. |
|`aposLocale` | `?aposLocale=fr` | Set to a valid locale to replace the piece document version for that locale. |

<!-- TODO: link to docs about locales and modes when available. -->
<!-- Read more about [mode and locale parameters on single-document requests](/guide/rest-apis#locale-and-mode-in-single-document-requests). -->

### Request example

```javascript
// Object with, at a minimum, properties for each required piece field.
const data = { ... };
// Request inside an async function.
const response = await fetch('http://example.net/api/v1/article/ckitdo5oq004pu69kr6oxo6fr:fr:published?apikey=myapikey', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
const document = await response.json();
```

### Response

The successful `PUT` request returns the newly created document. See the [piece document response example](#piece-document-response-example) below for a sample response body. In case of an error an appropriate HTTP status code is returned.

## `PATCH /api/v1/:piece-name/:_id`

### Query parameters

| Parameter | Example | Description |
|----------|------|-------------|
|`aposMode` | `?aposMode=draft` | Set to `draft` or `published` to update a specific mode version of the piece. |
|`aposLocale` | `?aposLocale=fr` | Set to a valid locale to update the piece document version for that locale. |

If a `PATCH` operation is attempted in the published mode, the changes in the patch are applied to both the draft and the current document, but properties of the draft not mentioned in the patch are not published. This is to prevent unexpected outcomes.

<!-- TODO: link to docs about locales and modes when available. -->
<!-- Read more about [mode and locale parameters on single-document requests](/guide/rest-apis#locale-and-mode-in-single-document-requests). -->

### Request example

```javascript
// Object with *only* the document fields to overwrite.
// This example only changes the article's category to "Nerd Post."
const data = {
  category: 'Nerd Post'
};
// Request inside an async function.
const response = await fetch('http://example.net/api/v1/article/ckitdo5oq004pu69kr6oxo6fr?apikey=myapikey&aposMode=published&aposLocale=en', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
const document = await response.json();
```

### MongoDB-style requests

The `PATCH` request body may use MongoDB-style operators. For example, you may use dot or "at" notation to update a nested property:

```javascript
{
  // Via "dot notation"
  "description.items.0.content": "<p>Update only the rich text.</p>",
  // Same thing via "@ notation," which finds the nested item with that _id
  "@ckgwegpfw00033h5xqlfb74nk.content": "<p>Update only the rich text.</p>"
}
```

### Response

The successful `PATCH` request returns the complete patched document. See the [piece document response example](#piece-document-response-example) below for a sample response body. In case of an error an appropriate HTTP status code is returned.

## `DELETE /api/v1/:piece-name/:_id`

**Authentication required.**

This API route **permanently deletes the piece database document**. Moving pieces to the archive in the Apostrophe user interface or using a `PATCH` request to set `archived: true` do not permanently delete database documents and should be considered.

`DELETE` requests will be rejected if the `_id` matches the draft mode of a page that has an existing published mode document.

### Query parameters

| Parameter | Example | Description |
|----------|------|-------------|
|`aposMode` | `?aposMode=draft` | Set to `draft` or `published` to delete a specific mode version of the piece. |
|`aposLocale` | `?aposLocale=fr` | Set to a valid locale to delete the piece document version for that locale. |

<!-- TODO: link to docs about locales and modes when available. -->
<!-- Read more about [mode and locale parameters on single-document requests](/guide/rest-apis#locale-and-mode-in-single-document-requests). -->

### Request example

```javascript
// Request inside an async function.
await fetch('http://example.net/api/v1/article/ckitdo5oq004pu69kr6oxo6fr:en:published?apikey=myapikey', {
  method: 'DELETE'
});
```

### Response

The successful `DELETE` request simply responds with a `200` HTTP response status code. In case of an error an appropriate HTTP status code is returned.

## `POST /api/v1/:piece-name/:_id/publish`

**Authentication required.**

Publish an existing `draft` mode document in a document set.

The `:_id` segment of the route should be one of the following:
- The `_id` property of the draft piece to be published
- The `_id` property of the published piece to be replaced by the current `draft` version
- The `aposDocId` property of the pieces in the document set

The `body` of the request is ignored.

### Query parameters

| Parameter | Example | Description |
|----------|------|-------------|
|`aposLocale` | `?aposLocale=fr` | Identify a valid locale to publish the draft for that locale. Defaults to the locale of the `_id` in the request or the default locale. |
<!-- TODO: link to docs about locales when available. -->

### Request example

```javascript
// Request inside an async function.
const response = await fetch('http://example.net/api/v1/article/ckhdscx5900054z9k88uqs16w:en:draft/publish?apikey=myapikey', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});
const article = await response.json();
```

### Response

The successful `POST` request returns the newly published piece. See the [piece document response example](#piece-document-response-example) below for a sample response body. In case of an error an appropriate HTTP status code is returned.

## Piece document response example

### Common properties

| Property | Format | Description |
|----------|------|-------------|
|`_id` | String | A unique and permanent ID for the document|
|`visibility` | String | The visibility setting, controlling public availability|
|`archived` | Boolean | Whether the document is archived |
|`type` | String | The piece type name|
|`title` | String | The entered title, or name, of the *document*|
|`slug`| String | A unique, but changeable, identifier for the piece|
|`createdAt` | Date | An [ISO date string](https://en.wikipedia.org/wiki/ISO_8601) of the document's creation date and time|
|`updatedAt` | Date | An [ISO date string](https://en.wikipedia.org/wiki/ISO_8601) of the document's last update date and time|
|Content properties | Variable | Additional properties specific to the piece type and its fields|

<!-- **TODO:** Link to examples of each field's response format. -->

### Example

``` json
{
  "_id": "ckitdo5oq004pu69kr6oxo6fr",
  "archive": false,
  "visibility": "public",
  "type": "article",
  "title": "ES6 and Beyond: modern JavaScript is so worth it",
  "category": "Tech Tips",
  "slug": "es6-and-beyond-modern-javascript-is-so-worth-it",
  "main": {
    "_id": "ckitdnl9l005t2a681hdgry8r",
    "items": [
      {
        "_id": "ckitdo2fl005x2a68ibiv795n",
        "metaType": "widget",
        "type": "@apostrophecms/rich-text",
        "content": "<p>I'm an old dog. I've been coding the web since 1993. So why do I want to teach you new tricks?</p><p>In 1993 I hopped an Amtrak train from Connecticut to Seattle. Three days of the same designated vegetarian meal. Hoo boy. But the scenery was worth the food.</p><p>And on arrival I discovered two beautiful things: coffee, and Seattle's spoken word scene. Yes, I read slam poetry in dive bars. Very punk rock.</p><p>How did that turn out? Well I was, uh, popular with the critics. Audiences, not so much. Hey, I had fun.</p><p>There was one small problem: I didn't yet have a job.</p><p>Fortunately my former employer at Cold Spring Harbor Laboratory on Long Island called me up one day to ask: \"hey, when you said you could rebuild our cell biology visualization software for this new World Wide Web thing... were you joking?\"</p><p>I quickly decided I wasn't joking. And so I worked remotely from Seattle. Over a 14.4kbps modem. That's <em>way slower than bad 3G</em> for you youngins.</p><p>And so I helped take an application that was limited to a handful of researchers with access to high-end workstations (think \"Unix! I know this\" in Jurassic Park) and bring it to anyone with a decent PC and a modem. <em>Slowly</em>. <em>Barely</em>. But still.</p><p>That was a \"new tricks\" moment. And also a punk rock moment. Something that was difficult and reserved for a priesthood with the relevant skills became that much more accessible.</p><p>&hellip;</p>",
        "_edit": true,
        "_docId": "ckitdo5oq004pu69kr6oxo6fr"
      }
    ],
    "metaType": "area",
    "_edit": true,
    "_docId": "ckitdo5oq004pu69kr6oxo6fr"
  },
  "metaType": "doc",
  "createdAt": "2020-12-17T21:50:45.195Z",
  "updatedAt": "2020-12-21T17:25:34.339Z",
  "updatedBy": {
    "_id": "ckhdsd0hk0003509kchzbdl83",
    "firstName": "Super",
    "lastName": "Admin",
    "username": "admin"
  },
  "authorIds": [
    "ckitdleax002tu69kejca3ho0"
  ],
  "_edit": true,
  "_author": [
    {
      "_id": "ckitdleax002tu69kejca3ho0",
      "archive": false,
      "disabled": false,
      "type": "@apostrophecms/user",
      "firstName": "Tom",
      "lastName": "Boutell",
      "title": "Tom Boutell",
      "slug": "user-tom-boutell",
      "username": "tom",
      "email": "tboutell@example.net",
      "metaType": "doc",
      "createdAt": "2020-12-17T21:48:36.393Z",
      "updatedAt": "2020-12-21T17:25:13.940Z",
      "updatedBy": {
        "_id": "ckhdsd0hk0003509kchzbdl83",
        "firstName": "Super",
        "lastName": "Admin",
        "username": "admin"
      },
      "_edit": true
    }
  ],
  "_url": "http://example.net/blog/es6-and-beyond-modern-javascript-is-so-worth-it",
  "_parentUrl": "http://example.net/blog"
}
```
