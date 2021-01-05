# Piece type REST endpoints

Every [piece type](TODO) has built in REST end points that share their overall structure in common. The exact document properties returned will depend on the piece type's fields.

## Endpoints

**Note:** `:piece-name` represents the name of a piece type module. For example, you would request all pieces of an `article` piece type with `/api/v1/article`.

| Method | Path | Description | Auth required |
|---------|---------|---------|---------|
|GET | [`/api/v1/:piece-name`](#get-api-v1-piece-name)| Get all pieces of a given type, paginated| FALSE |
|GET | [`/api/v1/:piece-name/:id`](#get-api-v1-piece-name-id)| Get a single piece with a specified ID | FALSE |
|POST | [`/api/v1/:piece-name`](#post-api-v1-piece-name)| Insert a new piece of the specified type | TRUE |
|PUT | [`/api/v1/:piece-name/:id`](#put-api-v1-piece-name-id)| Fully replace a specific piece document | TRUE |
|PATCH | [`/api/v1/:piece-name/:id`](#patch-api-v1-piece-name-id)| Update only certain fields on a specific document | TRUE |
|DELETE | Not supported | Instead `PATCH` the `trash` property to `true` | n/a |

**This guide will use an `article` piece type as an example.** In addition to standard piece fields, this hypothetical piece type has the following fields (for the sake of illustration):
- `author`: a `relationship` field connected to the `user` piece type
- `category`: a String field
- `body`: an `area` field using the rich text widget.

## `GET /api/v1/:piece-name`

### Query parameters

| Parameter | Example | Description |
|----------|------|-------------|
|`page` | `?page=2` | The page of results to return |
|`search` | `?search=shoes` | A search query to filter the response |

#### Custom filters

You may configure custom filters for a piece type as well. See [the guide on custom filters for more information](TODO).

### Request example

```javascript
// Request inside an async function.
const response = await fetch('http://example.net/api/v1/article?apikey=myapikey', {
  method: 'GET'
});
const document = response.json();
```

### Response

| Property | Type | Description |
|----------|------|-------------|
|`pages` | Number | The total number of pages of results |
|`page` | Number | The current page of results |
|`results` | Array | An array of individual piece objects. See the [getOne](#get-api-v1-piece-name-id) response for the document structure.|


```json
  {
    // Total number of pages of results (10 per page by default)
    "pages": 4,
    // The returned page of results
    "currentPage": 1,
    // Piece document results
    "results": [
      {
        "_id": "ckitdo5oq004pu69kr6oxo6fr",
        "trash": false,
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

On error an appropriate HTTP status code is returned.

## `GET /api/v1/:piece-name/:id`

### Request example

```javascript
// Request inside an async function.
const response = await fetch('http://example.net/api/v1/article/ckitdo5oq004pu69kr6oxo6fr?apikey=myapikey', {
  method: 'GET'
});
const document = response.json();
```

### Response

The successful GET request returns the matching document. See the [piece document response example](#piece-document-response-example) below for a sample response body. On error an appropriate HTTP status code is returned.

## `POST /api/v1/:piece-name`

**Authentication required.**

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
const document = response.json();
```

### Response

The successful POST request returns the newly created document. See the [piece document response example](#piece-document-response-example) below for a sample response body. On error an appropriate HTTP status code is returned.

## `PUT /api/v1/:piece-name/:id`

**Authentication required.**

### Request example

```javascript
// Object with, at a minimum, properties for each required piece field.
const data = { ... };
// Request inside an async function.
const response = await fetch('http://example.net/api/v1/article/ckitdo5oq004pu69kr6oxo6fr?apikey=myapikey', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
const document = response.json();
```

### Response

The successful PUT request returns the newly created document. See the [piece document response example](#piece-document-response-example) below for a sample response body. On error an appropriate HTTP status code is returned.

## `PATCH /api/v1/:piece-name/:id`

**Authentication required.**

### Request example

```javascript
// Object with *only* the document fields to overwrite.
// This example only changes the article's category to "Nerd Post."
const data = {
  category: 'Nerd Post'
};
// Request inside an async function.
const response = await fetch('http://example.net/api/v1/article/ckitdo5oq004pu69kr6oxo6fr?apikey=myapikey', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
const document = response.json();
```

:::tip
As a convenience, you may make a PATCH request for any MongoDB document, regardless of type using a catch-all route using the document's `_id` property:
```
PATCH /api/v1/@apostrophecms/doc/:id
```
:::

### MongoDB-style requests

The PATCH request body may use MongoDB-style operators. For example, you may use dot or "at" notation to update a nested property:

```javascript
{
  // Via "dot notation"
  "description.items.0.content": "<p>Update only the rich text.</p>",
  // Same thing via "@ notation," which finds the nested item with that _id
  "@ckgwegpfw00033h5xqlfb74nk.content": "<p>Update only the rich text.</p>"
}
```

### Response

The successful PATCH request returns the complete patched document. See the [piece document response example](#piece-document-response-example) below for a sample response body. On error an appropriate HTTP status code is returned.

## Piece document response example

### Common properties

| Property | Format | Description |
|----------|------|-------------|
|`_id` | String | A unique and permanent ID for the document|
|`visibility` | String | The visibility setting, controlling public availability|
|`trash` | Boolean | Whether the document is "trashed"|
|`type` | String | The piece type name|
|`title` | String | The entered title, or name, of the *document*|
|`slug`| String | A unique, but changeable, identifier for the piece|
|`createdAt` | Date | An [ISO date string](https://en.wikipedia.org/wiki/ISO_8601) of the document's creation date and time|
|`updatedAt` | Date | An [ISO date string](https://en.wikipedia.org/wiki/ISO_8601) of the document's last update date and time|
|Content properties | Variable | Additional properties specific to the piece type and its fields|

**TODO:** Link to examples of each field's response format.

### Example

```json
{
  "_id": "ckitdo5oq004pu69kr6oxo6fr",
  "trash": false,
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
      "trash": false,
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