---
extends: '@apostrophecms/module'
---

# `@apostrophecms/attachment`

**Alias:** `apos.attachment`

<AposRefExtends :module="$frontmatter.extends" />

The `attachment` module coordinates the addition and manipulation of any files added to the database and works alongside the `@apostrophecms/uploadfs` module. This includes rescaling and cropping of images, as well as the uploading of non-image files like '.pdf' or '.csv'. It exposes multiple template helpers and command line tasks for attachment retrieval and manipulation.

Options and configuration settings for this module are passed in through both `modules/@apostrophecms/attachment/index.js` and `modules/@apostrophecms/uploadfs/index.js`.

## Options

This reference is unusual compared to other reference pages in that it documents some settings that are passed directly to `@apostrophecms/uploadfs`. For these, see the [selected settings](#selecteduploadfssettings) of the `@apostrophecms/uploadfs` module section of this reference. 
|  Property | Type | Description |
|---|---|---|
| [`fileGroups`](#filegroups) | Array | Assigns uploaded files to either an 'image' or 'office' category to allow for upload and manipulation. |
| [`addFileGroups`](#addFileGroups) | Array | Allows addition of extension(s) to existing groups or creation of new groups. |

### `fileGroups`

This option should be passed to the `@apostrophecms/attachment` module. By default, this option is set to an array with two objects and any array passed through this option will *replace* the default values.

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    fileGroups: [
      {
        name: 'images',
        label: 'apostrophe:images',
        extensions: [
          'gif',
          'jpg',
          'png',
          'svg',
          'webp'
        ],
        extensionMaps: { jpeg: 'jpg' }
      },
      {
        name: 'office',
        label: 'apostrophe:office',
        extensions: [
          'txt',
          'rtf',
          'pdf',
          'xls',
          'ppt',
          'doc',
          'pptx',
          'sldx',
          'ppsx',
          'potx',
          'xlsx',
          'xltx',
          'csv',
          'docx',
          'dotx'
        ],
        extensionMaps: {}
      }
    ];
...
```
<template v-slot:caption>
  module/@apostrophecms/attachment/index.js
</template>

</AposCodeBlock>

The first default object's `name` property is set to `images` and an `extensions` key with an array of strings containing the non-prefixed extensions of file types that can be uploaded and attached to `@apostrophecms/image` pieces. In order to allow different spelling, e.g. 'jpg' or 'jpeg', the `extensionMaps` option takes an object with the alternative spelling as key and the extension it should map to as value.

::: info
Passing a new image extension type through replacement of the `@apostrophecms/attachment` default `fileGroups` option will not automatically cause the new image type to be re-sized or cropped, only added to the database and written to the designated uploadfs folder.
:::

The second default object is very similar, but for the `name` key it takes a value of `office`, indicating that these file types can be attached to `@apostrophecms/file` pieces and should not be processed. Again, the `extensions` key takes an array of non-prefixed strings indicating the allowed file types. The `extensionMaps` maps alternative spellings to the specified extension.

### `addFileGroups`

This option should be passed to the `@apostrophecms/attachment` module and it takes an array of objects. This option allows you to specify new `fileGroups` containing allowed extensions for use in the `attachment` schema field. Passing this option an object with the same `name` property as an existing file group will merge the `extensions` and `extensionMaps` with the existing group.

A new extension can be added to the existing groups, either `office` or `image` by setting the object `name` property to the same value as the group you want to add the extension into.

### Example

<AposCodeBlock>

```javascript
module.exports= {
  options: {
    addFileGroups: [
      // adds tif extension to the 'images' group
      {
        name: 'images',
        extensions: [
          'tif'
        ],
        extensionMaps: {
          tiff: 'tif'
        }
      }
    ]
  }
};
```

<template v-slot:caption>
  modules/@apostrophecms/attachment/index.js
</template>

</AposCodeBlock>

In addition to `name`, the object can have both `extensions` and `extensionMaps` properties that take values just like the properties in the `fileGroups` options. Both are optional, you only are required to supply one, but can supply both.

The `addFileGroups` option can also be used to add a new grouping without eliminating the existing groups. This is accomplished through the addition of a new object containing `name`, `label`, `extensions` and `extensionMaps` properties. All are required.

### Example

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    addFileGroups: [
      {
        name: 'logfiles',
        extensions: [
          'etl',
          'evt',
          'evtx'
        ],
        extensionMaps: {}
      }
    ]
  }
};
```

<template v-slot:caption>
  modules/@apostrophecms/attachment/index.js
</template>

</AposCodeBlock>

This example will make a new group, `logfiles`, but leave the `images` and `office` groups unaltered. This new group will be available to use in the `attachment` field `fileGroup` setting.

::: info
A single `addFileGroups` option can be used to both alter existing groups and add new groups by passing multiple objects in the array.
:::

## Configuration

|  Property | Type | Description |
|---|---|---|
| [`imageSizes`](#imagesizes) | Object | Takes an object with `add` and `remove` properties to change the image sizes created upon image import. |

### `imageSizes`
This configuration setting should be passed to the `@apostrophecms/attachment` module. It gets passed as a top-level property, not within the `options` property. By default it is assigned an array containing six image size objects. Each of these objects has a `name`, `width`, and `height` property. The `width` and `height` values are unitless. The default sizes are:

```javascript
  imageSizes: {
    add: {
      max: {
        width: 1600,
        height: 1600
      },
      full: {
        width: 1140,
        height: 1140
      },
      'two-thirds': {
        width: 760,
        height: 760
      },
      'one-half': {
        width: 570,
        height: 700
      },
      'one-third': {
        width: 380,
        height: 700
      },
      'one-sixth': {
        width: 190,
        height: 350
      }
    }
  ```
  
Additional sizes can be added through an object composed of size objects containing `name`, `width`, and `height` properties. This object is passed as value to the `add` key of `imageSizes`. Default sizes can be removed by passing an array containing their names to the `remove` key of `imageSizes`.

::: info
The Apostrophe admin UI may display various sizes to help you manage your images, so remove sizes with care.
:::

#### Example

<AposCodeBlock>

```javascript
module.exports = {
  imageSizes: {
    add: {
      mini: {
        width: 200,
        height: 200
      }
    },
    remove: ['one-half']
  },
};
```
<template v-slot:caption>
  modules/@apostrophecms/attachment/index.js
</template>
</AposCodeBlock>

## Featured methods

### `checkExtension(field, attachment)`
This method checks whether the supplied attachment file extension is allowed by a particular schema field. It will return `null` if the attachment file extension is allowed, an array of file extensions that are allowed if it is not, or an empty array if it is not allowed and the allowed extensions are not known.

The `field` parameter takes an object and informs the method what file extensions are allowed. To greenlist extensions by [fileGroup](#filegroups), `field.fileGroups` or `field.fileGroup` take a string, array, or object. The `attachment.group` key value will be checked against the passed value.To greenlist by `attachment.extension`, `field.extensions` or `field.extension` take a string, array, or object. The `attachment.extension` key value will be checked against the passed value.

### `insert(req, file, options)`
This method inserts the supplied file as an Apostrophe attachment. It returns `attachment` where `attachment` is an attachment object that can be passed to the [`url()` method](#urlmethod), or used for the value of a `type: 'attachment'` schema field.

The `file` parameter accepts an object with `name` and `path` properties. The `name` should be set to the name of the file, while the `path` should be the actual full path to the file on disk. This is designed to work well with the [`connect-multiparty`](https://www.npmjs.com/package/connect-multiparty) npm module, which is used as middleware by the upload route of this module. But you can also use it to copy files into uploadfs as part of a command line task or other server-side logic.

The `options` parameter is optional. If `options.permissions` is explicitly set to `false` then permissions are not checked.

### `crop(req, _id, crop)`
This method takes the image specified by the `_id` of an existing attachment, copies it to the uploadfs specified temporary location, applies the crop, and then saves it back into uploadfs storage. The `crop` parameter takes an object with `top`, `left`, `width`, and `height` properties. The passed values should be unitless, but must be JavaScript numbers, not strings.

### `addFileGroup(group)`
This method takes an object specifying either a new file group or that extends an existing group. For new file groups the object should have `name`, `extensions`, and `extensionMaps` properties that are set-up like the objects passed through array to the `fileGroups` option of this module.

To extend an existing file group the object should have a `name` property matching the `name` value of an existing file group (`office` or `images`, by default). The object should also have an `extensions` property, `extensionMaps` property, or both. These properties are structured like the properties of the same name in the `fileGroups` objects.


## Template helpers

Template helpers are methods available for use in template files. Because this module has an alias, you can call these in templates using the alias path.  For example, `apos.attachment.getWidth(attachment)`.

### `all(within, options)`
This helper finds all attachments referenced within a document, whether they are properties or sub-properties. It returns an array of attachment objects, or an empty array. Content found in the alt text, credit and credit url fields for image attachments will be returned, respectively,  in the `_alt`, `_credit`, and `_creditUrl` properties of the attachment object. Note: `apos.image.all(within, options)` is a wrapper for this helper that will automatically return only image attachments.

The `within` parameter is required and specifies the object to be searched. In general, the passed document should be the minimum necessary. So for example, use `data.piece._people` instead of `page.body`.

The `options` parameter is optional and takes an object with several potential properties.

`options.group` takes the `name` of the specific [`fileGroup`](#filegroup) to be searched - usually either `images` or `office`. 

`options.extension` takes a single extension type as a non-prefixed string and filters the returned array to only include those types.

`option.extensions` takes an array of non-prefixed strings used to filter the results.

`options.annotate` takes a boolean value. If set to true, it will add a `_urls` property to any image attachment objects in the returned array. The image `_urls` property contains sub-properties named for each image name size with the URL as a string value. The `_urls` will also contain an `uncropped` property with sub-properties named for each image name size and the URL as value. For non-image files, `annotate: true` will add a `_url` property to the object in the returned array with the URL of the attachment as value.

<AposCodeBlock>

``` njk
{% if data.page._people %}
  {% set images = apos.attachment.all(data.page._people, { group: 'images' }) %}
  {% for selfie in images %}
    <img src="{{ selfie._urls['one-third'] }}">
  {% endfor %}
{% endif %}
```

<template v-slot:caption>
  modules/default-page/views/page.html
  </template>
</AposCodeBlock>

### `first`(within, options)
This helper finds the first attachment referenced within a document, whether it is a property or sub-property. It returns an object, or undefined if no attachments are found.  Content found in the alt text, credit and credit url fields for image attachments will be returned, respectively,  in the `_alt`, `_credit`, and `_creditUrl` properties of the attachment object. Note: `apos.image.first(within, options)` is a wrapper for this and will automatically return only image attachments.

The `within` parameter is required and specifies the object to be searched. In general, the passed document should be the minimum necessary. So for example, use `data.piece._people` instead of `page.body`.

The `options` parameter is optional and takes an object with several potential properties.

`options.group` takes the `name` of the specific [`fileGroup`](#filegroup) to be searched - usually either `images` or `office`. 

`options.extension` takes a single extension type as a non-prefixed string and filters the returned array to only include those types.

`option.extensions` takes an array of non-prefixed strings used to filter the results.

`options.annotate` takes a boolean value. If set to true, it will add a `_urls` property to any image attachment objects in the returned array. The image `_urls` property contains sub-properties named for each image name size with the URL as a string value. The `_urls` will also contain an `uncropped` property with sub-properties named for each image name size and the URL as value. For non-image files, `annotate: true` will add a `_url` property to the object in the returned array with the URL of the attachment as value.

<AposCodeBlock>

``` njk
{% if data.page._people %}
  {% set image = apos.attachment.first(data.page._people, { group: 'images' }) %}
   <img src="{{ image._urls['one-third'] }}">
{% endif %}
```
<template v-slot:caption>
  modules/default-page/views/page.html
  </template>
</AposCodeBlock>


### `focalPointToObjectPosition(attachment)`
If the attachment has a focal point defined, this helper will return the focal point position converted to CSS syntax for `object-position` as a string with coordinates as percentages. This string does not have an `;` appended, so it must be added. If no focal point is set for the attachment it returns `center center`.

<AposCodeBlock>

``` njk
{% if data.page._people %}
  {% set image = apos.attachment.first(data.page._people, { group: 'images' }) %}
  {% set focalPoint = apos.attachment.focalPointToObjectPosition(image) %}
   // focal point = '20% 20%'  
  <img src="{{ image._urls['one-third'] }}" style="object-position: {{ focalPoint }};">
{% endif %}
```
<template v-slot:caption>
  modules/default-page/views/page.html
  </template>
</AposCodeBlock>

### `getFocalPoint(attachment)`
If the attachment has a focal point defined, this helper will return an object containing an `x` property with the x-postition, and `y` property with the y-position, as percentages. The numbers are supplied unitless. If there is no focal point defined it returns null.

<AposCodeBlock>

``` njk
{% if data.page._people %}
  {% set image = apos.attachment.first(data.page._people, { group: 'images' }) %}
  {% set focalPoint = apos.attachment.getFocalPoint(image) %}
   // focal point = '{ x: 20, y: 20 }'  
  <img src="{{ image._urls['one-third'] }}" style="object-position: left {{ focalPoint.x }}% top {{ focalPoint.y }}%;">
{% endif %}
```
<template v-slot:caption>
  modules/default-page/views/page.html
  </template>
</AposCodeBlock>

### `getHeight(attachment)`
Returns either the original size attachment height, or the cropped height if the image has been cropped in the document.

<AposCodeBlock>

``` njk
{% if data.page._people %}
  {% set image = apos.attachment.first(data.page._people, { group: 'images' }) %}
  {% set imageHeight = apos.attachment.getHeight(image) %}  <img src="{{ image._urls['one-third'] }}" height="{{ imageHeight }}" >
{% endif %}
```
<template v-slot:caption>
  modules/default-page/views/page.html
  </template>
</AposCodeBlock>

### `getWidth(attachment)`
Returns either the original size attachment width or the cropped width if the image has been cropped in the document.

<AposCodeBlock>

``` njk
{% if data.page._people %}
  {% set image = apos.attachment.first(data.page._people, { group: 'images' }) %}
  {% set imageWidth = apos.attachment.getWidth(image) %}
  <img src="{{ image._urls['one-third'] }}" width="{{ imageWidth }}" >
{% endif %}
```
<template v-slot:caption>
  modules/default-page/views/page.html
  </template>
</AposCodeBlock>

### `hasFocalPoint(attachment)`
Returns `true` if the image attachment associated with the document has a focal point set.

<AposCodeBlock>

``` njk
{% if data.page._people %}
  {% set image = apos.attachment.first(data.page._people, { group: 'images' }) %}
  {% if hasFocalPoint(image) %}
    {% set focalPoint = apos.attachment.focalPointToObjectPosition(image) %}
    <img src="{{ image._urls['one-third'] }}" style="object-position: {{ focalPoint }};">
  {% endif %}
{% endif %}
```
<template v-slot:caption>
  modules/default-page/views/page.html
  </template>
</AposCodeBlock>

### `isCroppable(attachment)`
Checks the attachment extension against the `fileGroups` option to determine if the attachment can be cropped.

### `url(attachment, options)`<a name="urlmethod"></a>
Returns the URL of the passed attachment. If `options.size` is set to the name of an existing size, it will return the URL for that size. `options.full` will return the URL for the "full width" (1140px, by default), not the original. For the original, pass `original` as the `size` value. By default the full size is returned. if `options.uploadfsPath` is `true`, the uploadfs path will be returned.

## Module tasks

### `rescale`
This method will regenerate all sizes of all image attachments. This is useful after a new sizes is added to the configuration. Note: this might take a considerable amount of time.

Usage
```bash
node app @apostrophecms/attachment:rescale
```

## Selected `@apostrophecms/uploadfs` module settings<a name="selecteduploadfssettings"></a>

These options should be added to the `modules/@apostrophecms/uploadfs/index.js` file inside the `uploadfs` option. See the [`@apostrophecms/uploadfs` reference page](/reference/modules/uploadfs.html) for the remainder of the module options and settings.

|  Property | Type | Description |
|---|---|---|
| [`copyOriginal`](#copyoriginal) | Boolean | Undefined by default. If set to `false` the original image will not be copied to the database, only scaled images. |
| [`image`](#image) | String \|\| Object | Sets the image processor to 'sharp' (by default), 'imagemagick, or a custom processor passed in an object. |
| `orientOriginals` | Boolean | Unless set to `false`, the uploaded image will be reoriented according to header data. |
| [`postprocessors`](#postprocessors) | Array | Takes an array of objects detailing optional postprocessors for images. |
| `scaledJpegQuality` | Integer | Sets the JPEG quality setting for scaled images - defaults to 80. |
| `sizeAvailableInArchive` | String | Takes the name of a size to make available even if the document is archived. Defaults to 'one-sixth'. |

### `copyOriginal`

This setting should be passed to the `@apostrophecms/uploadfs` module. By default, the `copyOriginal` value is undefined, resulting in storage of the original image in the database. Explicitly setting this to `false` will block this behavior. This option is ignored for non-image files.

### `image`
This setting should be passed to the `@apostrophecms/uploadfs` module. The 'image' setting defaults to 'sharp' and using the built-in [sharp.js](https://www.npmjs.com/package/sharp) image processor. This property also accepts `imagemagick` if it has been installed or an object specifying a custom processor. See the `uploadfs` npm module [`sharp.js`](https://github.com/apostrophecms/uploadfs/blob/main/lib/image/sharp.js) file for example.

#### Example

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    uploadfs: {
      copyOriginal: false
    }
  }
};
```
<template v-slot:caption>
  module/@apostrophecms/uploadfs/index.js
</template>

</AposCodeBlock>

### `postprocessors`
This setting should be passed to the `@apostrophecms/uploadfs` module. It is possible to configure `uploadfs` to run a postprocessor on every custom-sized image that it generates. This is intended for file size optimization tools like `imagemin`.

Here is an example based on the `imagemin` documentation:

<AposCodeBlock>

```javascript
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

uploadfs({
  storage: 'local',
  image: 'sharp',
  postprocessors: [
    {
      postprocessor: imagemin,
      extensions: [ 'gif', 'jpg', 'png' ],
      options: {
        plugins: [
          imageminJpegtran(),
          imageminPngquant({quality: '0.3-0.8'})
        ]
      }
    }
  ]
});
```

  <template v-slot:caption>
    modules/@apostrophecms/uploadfs/index.js
  </template>
</AposCodeBlock>

## Related documentation

- [Attachment schema field](https://v3.docs.apostrophecms.org/reference/field-types/attachment.html#attachment)
- [API attachment response](https://v3.docs.apostrophecms.org/reference/api/field-formats.html#attachment)
- [API crop endpoint](https://v3.docs.apostrophecms.org/reference/api/media.html#post-api-v1-apostrophecms-attachment-crop)
- [API upload endpoint](https://v3.docs.apostrophecms.org/reference/api/media.html#post-api-v1-apostrophecms-attachment-upload)