# Piece type REST endpoints

Every [piece type](TODO) has built in REST end points that share their overall structure in common. The exact document properties returned will depend on the piece type's fields.

## Endpoints

**Note:** `:piece-name` represents the `name` option for a piece type. For example, you would request all pieces of an `article` piece type with `/api/v1/article`.

| Method | Path | Description |
|---------|---------|---------|
|GET | [`/api/v1/:piece-name` ](#get-api-v1-piece-name)| Get all pieces of a given type, paginated.|
|GET | [`/api/v1/:piece-name/:id` ](#get-api-v1-piece-name-id)| Get a single piece with a specified ID. |
|POST | [`/api/v1/:piece-name` ](#post-api-v1-piece-name)| Add a new piece of the specified type. |
|PUT | [`/api/v1/:piece-name/:id` ](#put-api-v1-piece-name-id)| Fully replace a specific piece document. |
|PATCH | [`/api/v1/:piece-name/:id` ](#patch-api-v1-piece-name-id)| Update only certain fields on a specific document. |
|DELETE | Not supported | Instead `PATCH` the `trash` property to `true`. |

**This guide will use an `article` piece type as an example.** In addition to standard piece fields, this hypothetical piece type has the following fields (for the sake of illustration):
- `author`: a `relationship` field connected to the `user` piece type
- `category`: a String field
- `body`: an `area` field with rich text and image widgets

## `GET: /api/v1/:piece-name`

### Query parameters

| Parameter | Example | Description |
|----------|------|-------------|
|`pages` | `?page=2` | The page of results to return |
|`search` | `?search=shoes` | A search query to filter the response |
|`includeFields` | `?includeFields=title,color,size` | The only fields to include in the response documents |
|`excludeFields` | `?excludeFields=description,photo` | The fields that should *not* be in the response documents |

#### Custom filters

You may configure custom filters for a piece type as well. See [the guide on custom filters for more information](TODO).

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
        "title": "The Powers of the Senate",
        "slug": "the-powers-of-the-senate",
        // ... additional properties
      },
      // ... up to nine additional documents, by default
    ]
  }
```

## `GET: /api/v1/:piece-name/:id`

### Query parameters

| Parameter | Example | Description |
|----------|------|-------------|
|`includeFields` | `?includeFields=title,color,size` | The only fields to include in the response documents |
|`excludeFields` | `?excludeFields=description,photo` | The fields that should *not* be in the response documents |

### Response

| Property | Format | Description |
|----------|------|-------------|
|`_id` | String | A unique and permanent ID for the document|
|`visibility` | String | The visibility setting, controlling public availability|
|`trash` | Boolean | Whether the document is "trashed"|
|`type` | String | The piece type name|
|`title` | String | The entered title, or name, of the *document*|
|`slug`| String | A unique, but changeable, |
|`createdAt` | Date | An [ISO date string](https://en.wikipedia.org/wiki/ISO_8601) of the document's creation date and time|
|`updatedAt` | Date | An [ISO date string](https://en.wikipedia.org/wiki/ISO_8601) of the document's last update date and time|
|Content properties | Variable | Additional properties specific to the piece type and its fields|

**TODO:** Link to examples of each field's response format.

## `POST: /api/v1/:piece-name`

### Request body

## `PUT: /api/v1/:piece-name/:id`

### Request body

## `PATCH: /apoi/v1/:piece-name/:id`

### Request body

PATCH /api/v1/@apostrophecms/doc/:docId