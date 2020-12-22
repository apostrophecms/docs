# Media APIs


The `@apostrophecms/attachment` module manages all media file upload. Once uploaded, metadata and organization of image and other files are primarily managed through the respective `@apostrophecms/image` and `@apostrophecms/file` piece types. See the [pieces REST API documentation](./pieces.md) for additional information.

## Endpoints

| Method | Path | Description | Auth required |
|---------|---------|---------|---------|
|POST | [`/api/v1/@apostrophecms/attachment/upload`](#post-api-v1-apostrophecms-attachment-upload) | Upload a media file | TRUE |
|POST | [`/api/v1/@apostrophecms/attachment/crop`](#post-api-v1-apostrophecms-attachment-crop) | Crop an image file | TRUE |
|GET | [`/api/v1/@apostrophecms/image`](#get-api-v1-apostrophecms-image) | Get an image document with a specified ID | TRUE |
|POST | [`/api/v1/@apostrophecms/image`](#post-api-v1-apostrophecms-image) | Insert a new image | TRUE |
|GET | [`/api/v1/@apostrophecms/file`](#get-api-v1-apostrophecms-file) | Get a file document with a specified ID | TRUE |
|POST | [`/api/v1/@apostrophecms/file`](#post-api-v1-apostrophecms-file) | Insert a new file | TRUE |

## `POST: /api/v1/@apostrophecms/attachment/upload`

**Authentication required.**

The `body` of the request should be a `FormData` object.

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

The successful POST request returns the newly created attachment document.

| Property | Format | Description |
|----------|------|-------------|
|`_id` | String | A unique and permanent ID for the document |
|`_url` | String | File URL, if a non-image file |
|`_urls` | Object | An object with keys for the generated image size variants, if an image file |
|`createdAt` | Date | An [ISO date string](https://en.wikipedia.org/wiki/ISO_8601) of the document's creation date and time|
|`docIds` | Array | An array of string IDs that represent image or file documents using this attachment |
|`extension` | String | The file's file extension, e.g., `png`, `pdf` |
|`group` | String | The associated file group, including `image` or `office` by default |
|`height` | Number | Height of the image file, if an image |
|`landscape` | Boolean | `true` if an image with landscape aspect ratio |
|`length` | Object | File stats output from [`fs.stat`](https://nodejs.org/api/fs.html#fs_fs_stat_path_options_callback), including `size` in bytes |
|`md5` | String | MD5 checksum value for the file |
|`name` | String | A "slugified" version of the file name (generally lowercased and joined with dashes) |
|`ownerId` | String | The document ID for the user who uploaded the file |
|`portrait` | Boolean | `true` if an image with portrait aspect ratio |
|`title` | String | A "sortified" version of the file name (case-insensitive) |
|`type` | String | 'attachment' |
|`trashDocIds` | Array | An array of string IDs that represent image or file documents using this attachment in the trash |
|`updatedAt` | Date | An [ISO date string](https://en.wikipedia.org/wiki/ISO_8601) of the document's last update date and time|
|`width` | Number | Width of the image file, if an image |

```json
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
  "trashDocIds": [],
  "length": {
    "dev": 16777220,
    "mode": 33188,
    "nlink": 1,
    "uid": 501,
    "gid": 20,
    "rdev": 0,
    "blksize": 4096,
    "ino": 140102237,
    "size": 10497,
    "blocks": 24,
    "atimeMs": 1608659891038.2366,
    "mtimeMs": 1608659891038.5925,
    "ctimeMs": 1608659891038.5925,
    "birthtimeMs": 1608659891038.2366,
    "atime": "2020-12-22T17:58:11.038Z",
    "mtime": "2020-12-22T17:58:11.039Z",
    "ctime": "2020-12-22T17:58:11.039Z",
    "birthtime": "2020-12-22T17:58:11.038Z"
  },
  "md5": "630eeaaecd0bdc07c4a82eeca4c07588",
  "width": 600,
  "height": 106,
  "landscape": true,
  "ownerId": "ckhdsd0hk0003509kchzbdl83",
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

## `POST: /api/v1/@apostrophecms/attachment/crop`

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
```

### Response

The successful POST request returns the newly created document. See the [piece document response example](#piece-document-response-example) below for a sample response body.

## `GET: /api/v1/@apostrophecms/image`

### Request example

```javascript
// Request inside an async function.
const document = await fetch('http://example.net/api/v1/article/ckitdo5oq004pu69kr6oxo6fr?apikey=myapikey', {
  method: 'GET'
});
```

### Response

The successful GET request returns the matching document. See the [piece document response example](#piece-document-response-example) below for a sample response body.

## `POST: /api/v1/@apostrophecms/image`

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
```

### Response

The successful POST request returns the newly created document. See the [piece document response example](#piece-document-response-example) below for a sample response body.

## `GET: /api/v1/@apostrophecms/file`

### Request example

```javascript
// Request inside an async function.
const document = await fetch('http://example.net/api/v1/article/ckitdo5oq004pu69kr6oxo6fr?apikey=myapikey', {
  method: 'GET'
});
```

### Response

The successful GET request returns the matching document. See the [piece document response example](#piece-document-response-example) below for a sample response body.
```