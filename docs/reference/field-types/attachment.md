# `attachment`

An `attachment` field allows the user to upload a file to the server, or replace a file which was previously uploaded. Attachments are most often used indirectly through the core image <!-- TODO: link --> and file <!-- TODO: link --> piece types. Each of those piece types contains an attachment field and some metadata fields, making them a convenient way to reuse files.

You may also use attachment fields directly as well, however **doing so means that the uploaded file will not be available in the media library or file manager**. It will only be accessible as a property of the piece or page where it is uploaded. This can be appropriate for files that are only relevant for a single piece of content, such as resumés and job applications for a specific person.

## Module field definition

All fields in a piece or page module use their object key as their database field name (e.g., `resume` below).

```javascript
// Configuring the `resume` field in a module's `fields.add` subsection:
resume: {
  label: 'Resumé',
  type: 'attachment',
  group: 'office'
},
```

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|------------|
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`attachment` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`group` | String | n/a | Can be set to `image` or `office` to limit the file types that can be uploaded. See more below. |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup | universal |
|`required` | Boolean | `false` | If `true`, the field is mandatory |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |`aspectRatio` | Array | n/a | Only applies to image files. If set to an array like `[ 2, 1 ]`, the image must have that aspect ratio and will be autocropped if the user does not manually crop. Only suitable if group is images. | -->
<!-- |`contextual` | Boolean | `false` | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |`crop` | Boolean | `false` | Only applies to image files. If `true`, the user may crop the attachment. Only suitable if group is images. | -->
<!-- |`minSize` | Array | n/a | Only applies to image files. if set to an array like `[ 640, 480 ]`, the image must have at least the specified minimum width and height. Only suitable if group is images. | -->
<!-- |`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value | -->

::: warning NOTE
The uploaded files are stored in a web-accessible folder, however their file names are prepended with a randomized ID to avoid naming collisions.
:::

## Custom file groups

Developers can configure file type groups in addition to `office` and `image` using the `fileGroups` option of the `@apostrophecms/attachment` module. Those custom groups names can then be used for an attachment field's `group` setting.

<!-- TODO: Link to the attachment module page for this instead once available. -->

## Use in templates

The `attachment` field value will be an object with various properties, including many metadata properties. They can be accessed directly, but it is more common to use a template helper when working with attachments in templates.

The most common helper method for attachments in templates is `apos.attachments.url`. Once an attachment field has a value, you can obtain the file's public URL with the `apos.attachments.url` template helper.

<!-- TODO: Link to the attachment module for other helpers. -->

```django
<!-- `data.piece.resume` is an attachment object -->
<a href="{{ apos.attachment.url(data.piece.resume) }}">Download</a>
```