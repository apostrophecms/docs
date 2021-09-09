# Working with images and media files

There are a few ways to configure a field schema to allow editors to select images or other media files.

1. [An image widget](#the-image-widget-option)
2. [An attachment field](#the-attachment-field-option)
3. [A relationship field](#the-relationship-field-option)

In addition to covering the main ways to allow editors to choose files for their content, we'll also look at how to use the data from each approach in templates. We'll focus on how developers would get the file URL plus critical image information for generating markup.

## The image widget option

The core [image widget](/guide/core-widgets.md#image-widget) is a good way to allow editors to select an image. If we want to use the provided image widget template to render it as HTML, it's definitely the right choice. Once the editor selects an image, the full image is displayed in the editor interface.

<AposCodeBlock>
```javascript
module.exports = {
  // ...
  fields: {
    add: {
      photo: {
        label: 'Photo',
        type: 'area',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/image': {}
          }
        }
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/article/index.js
  </template>
</AposCodeBlock>

![an image widget in an area field](/images/media-image-widget.png)

### Using an image widget in templates

If presenting an image using the image widget and its template, the process is not different from rendering any other area in a template. Use the `area` template tag, including the context reference and the area field name.

<AposCodeBlock>
```django
{% area data.piece, 'photo' %}
```
  <template v-slot:caption>
    modules/article-page/views/show.html
  </template>
</AposCodeBlock>

Done. The core image widget is design to render a responsive image with alt text (if it was entered for the image). When that is all that's needed this is a great option.

## The attachment field option

The [attachment field](/reference/field-types/attachment.md) is the direct route for uploading any type of file (e.g., image, PDF) to the file system. It is a fairly simple field that does not do much more than upload the file.

Importantly, a file uploaded through an attachment field *will not appear in either the media library* or the non-image files library. If the image or file is meant to be reused, this will not be best. However if the file should only be associated with one particular page or piece it can work well. Uploading resumes associated with job applicants is one such example.

<AposCodeBlock>
```javascript
module.exports = {
  // ...
  fields: {
    add: {
      fileUpload: {
        label: 'File upload',
        type: 'attachment',
        fileGroup: 'office'
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/article/index.js
  </template>
</AposCodeBlock>

![an attachment field](/images/media-attachment.png)

### Using attachment field values in templates

Getting file information from an attachment field value is simpler than the other options since you have immediate access to the attachment object. If the field on a piece type is called `fileUpload`, the attachment object is `data.piece.fileUpload` in a show page template.

Apostrophe generates multiple sizes of each uploaded image as discussed [regarding the image widget](/guide/core-widgets.md#image-widget). There is a helper method available in templates to retrieve the url: `apos.attachment.url()`. This method will take into account any custom media hosting settings for the website.

For non-image attachments, simply pass the attachment object into the method.

<AposCodeBlock>
```django
{% set fileUrl = apos.attachment.url(data.piece.fileUpload) %}

<a href="{{ fileUrl }}">Download</a>
```
  <template v-slot:caption>
    modules/article-page/views/show.html
  </template>
</AposCodeBlock>


For image attachments, doing the same thing will return the URL for the `full` image size by default. You can pass an options object as a second argument with its `size` property set to another image size to get a different URL back.

<AposCodeBlock>
```django
{% set imgUrl = apos.attachment.url(data.piece.photoUpload, {
  size: 'one-third'
}) %}

<img src="{{ imgUrl }}" alt="" />
```
  <template v-slot:caption>
    modules/article-page/views/show.html
  </template>
</AposCodeBlock>


[Responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images) are very important for cross-device support these days. Getting each image size to populate the `srcset` attribute for an image would get repetitive very quickly even using the `apos.attachment.url()` method. For that, there is a dedicated `apos.image.srcset()` method. Pass in the attachment object as an argument and it will return a `srcset` value with all sizes included.

<AposCodeBlock>
```django
{% set srcset = apos.attachment.srcset(data.piece.photoUpload) %}

<img srcset="{{ srcset }}" src="{{ apos.attachment.url(data.piece.photoUpload) }}" alt="" />
```
  <template v-slot:caption>
    modules/article-page/views/show.html
  </template>
</AposCodeBlock>

Notice that in the examples above **the alt text is not included when using an attachment field**. If inserting images with the attachment field we would need to provide alt text with another field. The other two options will usually be better for images since they support metadata such as the alt text.

## The relationship field option

If the image or file should be reusable and in the image or file library, but we *aren't using the image widget template* and don't care about showing the full image in the editor interface, choosing a file with the relationship field is a great option. It uses less code abstraction than an area with an image widget and subsequently has a clearer data structure when retrieved from the database.

<AposCodeBlock>
```javascript
module.exports = {
  // ...
  fields: {
    add: {
      _image: {
        label: 'Image',
        type: 'relationship',
        // Use `@apostrophecms/file` for non-image files
        withType: '@apostrophecms/image'
        max: 1
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/article/index.js
  </template>
</AposCodeBlock>

### Using a file or image relationship field value in templates

Much of the same steps from [using attachment field values](#the-attachment-field-option) also apply to rendering media relationship fields. There is first an additional step of getting the attachment object. Relationship field values include information in addition to the attachment data, but there are some helper methods to quickly get to that usable data.

Since relationship fields can accept multiple values (e.g., connecting multiple files to a single piece), the `apos.attachment.all()` and `apos.image.all()` methods will return an array of all attachments or all *image* attachments, respectively. This is helpful for looping over several files.

<AposCodeBlock>
```django
{% set filesObject = apos.attachment.all(data.piece._files) %}

{% for file in filesObject %}
  <a src="{{ apos.attachment.url(file) }}">Download file</a>
{% endfor %}
```
  <template v-slot:caption>
    modules/article-page/views/show.html
  </template>
</AposCodeBlock>


When the relationship field has the `max: 1` limit, or when we only want the first connected file, we instead use `apos.attachment.first()` or `apos.image.first()`. These return the first (or only) attachment object from the field passed in.

<AposCodeBlock>
```django
{% set imageObject = apos.attachment.first(data.piece._image) %}

<img src="{{ apos.attachment.url(imageObject) }}" alt="{{ imageObject._alt }}" />
```
  <template v-slot:caption>
    modules/article-page/views/show.html
  </template>
</AposCodeBlock>

As mentioned above, once we have the attachment object, all of the helper methods from [the attachment field option](#the-attachment-field-option) examples can help finish the job. Additionally, since an image from a relationship field may have alt text, that can be found on the image attachment object `_alt` property as shown above.

::: tip TLDR;
It would be reasonable to be saying, "simply tell me which option to use!" It does depend on the case and how each developer and their clients prefer to work. That said, there are some clear cases where one option is best:

- **The file should only be associated with a single page or piece:** use an attachment field.
- **The file should be added to the file library or media library**: use a relationship field *or* an area with the image widget.
- **An image will be displayed using the image widget template from Apostrophe core**: use an area field with the image widget.
- **The editors definitely want a full-size view of the image in the content editor UI**: use an area field with the image widget.

If none of those cases apply, personal preference will come into play. For what it's worth, **the core Apostrophe team generally prefers using relationship fields to select images or files** when possible. Put simply, once familiar with the helper methods, using the individual file properties in templates provides ultimate control over presentation to match the context.
:::
