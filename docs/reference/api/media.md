# Media APIs


The `@apostrophecms/attachment` module manages all media file upload. Once uploaded, metadata and organization of image and other files are primarily managed through the respective `@apostrophecms/image` and `@apostrophecms/file` piece types. See the [pieces REST API documentation](./pieces.md) for additional information.

## Endpoints

| Method | Path | Description | Auth required |
|---------|---------|---------|---------|
|POST | [`/api/v1/@apostrophecms/attachment/upload`](#post-api-v1-apostrophecms-attachment-upload) | Upload a media file | TRUE |
|POST | [`/api/v1/@apostrophecms/attachment/crop`](#post-api-v1-apostrophecms-attachment-crop) | Crop an image file | TRUE |
|GET | [`/api/v1/@apostrophecms/image`](#media-get-request) | Get an image document with a specified ID | FALSE |
|POST | [`/api/v1/@apostrophecms/image`](#media-post-request) | Insert a new image | TRUE |
|GET | [`/api/v1/@apostrophecms/file`](#media-get-request) | Get a file document with a specified ID | FALSE |
|POST | [`/api/v1/@apostrophecms/file`](#media-post-request) | Insert a new file | TRUE |

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
|`docIds` | Array | An array of string IDs that represent image or file documents using this attachment (empty at initial upload) |
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

This route uploads a new, cropped version of an existing image. The `crop` object is appended to the `crops` array property of the attachment document.

The `body` of the request should include:

| Property | Format | Description |
|----------|------|-------------|
|`_id` | String | The `_id` property of an existing image attachment document |
|`crop` | Object | An object containing `top`, `left`, `width` and `height` properties |

The newly uploaded image file with have a file name using the `crop` properties as well as the `_id`, `name`, and file extension of the original attachment, formatted as `{_id}-{name}.{top}.{left}.{width}.{height}.{extension}`

### Response

The successful POST request returns `true`.

## Media `GET` request

Endpoints:

- `GET: /api/v1/@apostrophecms/image`
- `GET: /api/v1/@apostrophecms/file`

A GET request for an image or file is generally a normal [piece type GET request](./pieces.md#get-api-v1-piece-name-id). In addition to the typical piece document properties, it will also include an `attachment` property, containing an object similar to one returned from [an attachment upload request](#post-api-v1-apostrophecms-attachment-upload).

## Media `POST` request

**Authentication required.**

- `POST: /api/v1/@apostrophecms/image`
- `POST: /api/v1/@apostrophecms/file`

A POST request for an image or file is generally a normal [piece type POST request](./pieces.md#get-api-v1-piece-name-id). In addition to the typical piece document properties, it must also include an `attachment` property, containing the attachment object returned from [an attachment upload request](#post-api-v1-apostrophecms-attachment-upload).
