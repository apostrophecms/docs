# Media APIs

The `@apostrophecms/attachment` module manages all media file uploading. Once uploaded, an attachment object should typically be added to an Apostrophe piece or page document (including, but not limited to, `@apostrophecms/image` and `@apostrophecms/file` pieces). It is not common, and not generally recommended, to leave uploaded attachments unconnected from any Apostrophe document.

For attachments meant to be included in the media or file libraries, metadata and organization those media are primarily managed through the respective `@apostrophecms/image` and `@apostrophecms/file` piece types. See the [pieces REST API documentation](./pieces.md) for additional information.

> [!TIP]
> **Handling Large Query Strings**
>
> When working with large sets of media (such as batch operations on hundreds of files), you may encounter query string length limitations. ApostropheCMS 4.x includes middleware that allows you to convert GET requests with large query strings to POST requests using the `__aposGetWithQuery` property. See the [POST-as-GET middleware guide](#post-as-get-middleware) below for details.

## Endpoints

| Method | Path | Description | Auth required |
|---------|---------|---------|---------|
|`POST` | [`/api/v1/@apostrophecms/attachment/upload`](#post-api-v1-apostrophecms-attachment-upload) | Upload a media file | TRUE |
|`POST` | [`/api/v1/@apostrophecms/attachment/crop`](#post-api-v1-apostrophecms-attachment-crop) | Crop an image file | TRUE |
|`GET` | [`/api/v1/@apostrophecms/image`](#media-get-request) | Get an image document with a specified ID | FALSE |
|`POST` | [`/api/v1/@apostrophecms/image`](#media-post-request) | Insert a new image | TRUE |
|`GET` | [`/api/v1/@apostrophecms/file`](#media-get-request) | Get a file document with a specified ID | FALSE |
|`POST` | [`/api/v1/@apostrophecms/file`](#media-post-request) | Insert a new file | TRUE |

## `POST /api/v1/@apostrophecms/attachment/upload`

**Authentication required.**

The `body` of the request should use the `multipart/form-data` encoding, with the file itself uploaded under the name `file`. In a client-side request, the `body` of the request should be a `FormData` object.

### Request example

```javascript
// Create a `FormData` object
const formData = new window.FormData();

// Append a file as per the FormData API:
// https://developer.mozilla.org/en-US/docs/Web/API/FormData/append
formData.append('file', myfile);

// Request inside an async function.
const attachment = await fetch('/api/v1/@apostrophecms/attachment/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  body: formData
});
```

### Response

The successful `POST` request returns the newly created attachment. In case of an error an appropriate HTTP status code is returned.

| Property | Format | Description |
|----------|------|-------------|
|`_id` | String | A unique and permanent ID for the attachment |
|`_url` | String | The file URL (the original size, if an image) |
|`_urls` | Object | An object with keys for the generated image size variants, if an image file |
|`archivedDocIds` | Array | An array of string IDs that represent image or file documents using this attachment that are archived |
|`createdAt` | Date | An [ISO date string](https://en.wikipedia.org/wiki/ISO_8601) of the attachment's creation date and time|
|`docIds` | Array | An array of string IDs that represent image or file documents using this attachment (empty at initial upload) |
|`extension` | String | The file's file extension, e.g., `png`, `pdf` |
|`group` | String | The associated file group, including `image` or `office` by default |
|`height` | Number | Height of the image file, if an image |
|`landscape` | Boolean | `true` if an image with landscape aspect ratio |
|`length` | Number | The file size in bytes |
|`md5` | String | MD5 checksum value for the file |
|`name` | String | A "slugified" version of the file name (generally lowercased and joined with dashes) |
|`portrait` | Boolean | `true` if an image with portrait aspect ratio |
|`title` | String | A "sortified" version of the file name (case-insensitive) |
|`type` | String | 'attachment' |
|`updatedAt` | Date | An [ISO date string](https://en.wikipedia.org/wiki/ISO_8601) of the attachment's last update date and time|
|`width` | Number | Width of the image file, if an image |

``` json
// This is a PNG upload with filename `blue-box.png`
{
  "_id": "ckj0akbxa003vp39kfbxgb8zg",
  "group": "images",
  "createdAt": "2020-12-22T17:58:11.314Z",
  "name": "blue-box",
  "title": "blue box",
  "extension": "png",
  "type": "attachment",
  "docIds": [],
  "archivedDocIds": [],
  "length": 10497,
  "md5": "630eeaaecd0bdc07c4a82eeca4c07588",
  "width": 600,
  "height": 106,
  "landscape": true,
  "_urls": {
    "max": "https://example.net/uploads/attachments/ckj0akbxa003vp39kfbxgb8zg-blue-box.max.png",
    "full": "https://example.net/uploads/attachments/ckj0akbxa003vp39kfbxgb8zg-blue-box.full.png",
    "two-thirds": "https://example.net/uploads/attachments/ckj0akbxa003vp39kfbxgb8zg-blue-box.two-thirds.png",
    "one-half": "https://example.net/uploads/attachments/ckj0akbxa003vp39kfbxgb8zg-blue-box.one-half.png",
    "one-third": "https://example.net/uploads/attachments/ckj0akbxa003vp39kfbxgb8zg-blue-box.one-third.png",
    "one-sixth": "https://example.net/uploads/attachments/ckj0akbxa003vp39kfbxgb8zg-blue-box.one-sixth.png",
    "original": "https://example.net/uploads/attachments/ckj0akbxa003vp39kfbxgb8zg-blue-box.png"
  }
}
```

## `POST /api/v1/@apostrophecms/attachment/crop`

**Authentication required.**

This route uploads a new, cropped version of an existing image. The `crop` object is appended to the `crops` array property of the attachment document.

The `body` of the request should include:

| Property | Format | Description |
|----------|------|-------------|
|`_id` | String | The `_id` property of an existing image attachment document |
|`crop` | Object | An object containing `top`, `left`, `width` and `height` properties |

The newly uploaded image file will be stored with a file name using the `crop` properties as well as the `_id`, `name`, and file extension of the original attachment, formatted as `{_id}-{name}.{top}.{left}.{width}.{height}.{extension}`

### Response

The successful `POST` request returns `true`. In case of an error an appropriate HTTP status code is returned.

## Media `GET` request

Endpoints:

- `GET /api/v1/@apostrophecms/image`
- `GET /api/v1/@apostrophecms/file`

A `GET` request for an image or file is generally a normal [piece type `GET` request](./pieces.md#get-api-v1-piece-name-id). In addition to the typical piece document properties, it will also include an `attachment` property, containing an object similar to one returned from [an attachment upload request](#post-api-v1-apostrophecms-attachment-upload).

## Media `POST` request

**Authentication required.**

- `POST /api/v1/@apostrophecms/image`
- `POST /api/v1/@apostrophecms/file`

A `POST` request for an image or file is generally a normal [piece type `POST` request](./pieces.md#get-api-v1-piece-name-id). However, creating a new image or file piece requires a **two-step process**:

1. **Upload the file**: First, use the [`/api/v1/@apostrophecms/attachment/upload`](#post-api-v1-apostrophecms-attachment-upload) endpoint to upload the actual file and receive an attachment object.

2. **Create the piece**: Then, use the image or file `POST` endpoint to create the piece document, including the attachment object in the request body.

The `POST` request body must include an `attachment` property containing the complete attachment object returned from the upload request. In addition to the typical piece document properties, this creates the metadata and organization structure needed for the media library.

### Example: Creating a new image piece

```javascript
// Step 1: Upload the file
const formData = new FormData();
formData.append('file', imageFile);

const attachmentResponse = await fetch('/api/v1/@apostrophecms/attachment/upload', {
  method: 'POST',
  body: formData
});

const attachment = await attachmentResponse.json();

// Step 2: Create the image piece
const imageResponse = await fetch('/api/v1/@apostrophecms/image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My Image',
    alt: 'Description of my image',
    attachment: attachment, // Include the complete attachment object
    // ... other piece properties
  })
});

const imageDocument = await imageResponse.json();
```

## POST-as-GET Middleware

When working with large datasets in the media library (such as batch operations on hundreds of files), you may encounter query string length limitations that prevent standard `GET` requests from working properly. ApostropheCMS 4.x includes middleware that allows you to work around this limitation by converting `GET` requests with large query strings to `POST` requests.

### How it works

The middleware detects `POST` requests that contain a special `__aposGetWithQuery` property in the request body. When found, it:

1. Changes the request method from `POST` to `GET`
2. Moves the contents of `__aposGetWithQuery` to `req.query`
3. Preserves any existing query parameters (like `aposMode` and `aposLocale`)
4. Removes the request body

This allows you to send large amounts of query data through the request body while maintaining the semantic meaning of a `GET` request.

### Usage

Instead of passing large query parameters in the query string:

```javascript
// This might fail with very large query strings
const apiResponse = await apos.http.get('/api/v1/@apostrophecms/image', {
  qs: {
    ids: ['id1', 'id2', 'id3', /* ... hundreds more IDs ... */]
  },
  draft: true
});
```

Use the POST-as-GET pattern:

```javascript
// This will work with large datasets
const apiResponse = await apos.http.post('/api/v1/@apostrophecms/image', {
  body: {
    __aposGetWithQuery: {
      ids: ['id1', 'id2', 'id3', /* ... hundreds more IDs ... */]
    }
  },
  draft: true
});
```

### Important notes

- The original query string parameters are preserved and merged with the `__aposGetWithQuery` content
- Options like `draft: true` passed to `apos.http.post()` are still transformed into query string parameters as normal
- This middleware is particularly useful for batch operations in the media manager, such as applying tags to multiple selected images
- The middleware is transparent to your application logic - the request is processed as a normal GET request after the conversion