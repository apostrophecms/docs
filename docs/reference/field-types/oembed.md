# `oembed`

A `oembed` field supports the user in embedding media hosted by any [oembed—compatible hosting site](https://oembed.com/#section7), or any site for which you have provided an [oembetter](https://github.com/apostrophecms/oembetter) filter via the `@apostrophecms/oembed` module. <!-- TODO: document oembetter config for 3.x -->

The field will immediately preview the media embed after entering a valid URL.

The database value of the field will have `url`, `title` and `thumbnail` properties. `title` and `thumbnail` are snapshots from the oembed response at the time the field was saved. `thumbnail` is the URL of a thumbnail image as provided by the oembed response. Developers should retrieve the full embed code in client-side code to get the latest version available.

<!-- TODO: Update following module reference addition. -->
<!-- [apostrophe-oembed](/reference/modules/apostrophe-oembed/README.md) provides browser-side methods to display the video. See the [apostrophe-video-widgets](/reference/modules/apostrophe-video-widgets/README.md) source code for an example of using these methods to play a video in a `div` element. -->

## Module field definition

```javascript
// Configuring the `video` field in a module's `fields.add` subsection:
video: {
  type: 'oembed',
  label: 'Featured video'
}
```

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`float` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`requiredIf` | Object | `{}` | Conditions to meet before the field is required. [See the guide for details.](/guide/conditional-fields) |
|`hidden` | Boolean | `false` | If `true`, the field is hidden |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->

## Use in templates

Simplest usage could involve simply printing the thumbnail image (if available) and linking to the media:

```nunjucks
{% if data.piece.video and data.piece.video.thumbnail %}
  {% set video = data.piece.video %}
  <a href="{{ video.url }}">
    <img src="{{ video.thumbnail }}" alt="{{ video.title }}">
  </a>
{% endif %}
```

More likely, you will want to add the full embed code from the media source. This should be done in client-side JavaScript. Apostrophe provides an API route to get that.

<!-- TODO: link to the oembed module's API route reference when available. -->
Submit a `GET` request to `/api/v1/@apostrophecms/oembed/query` with the media URL as the `url` query parameter. A successful response will be an object with several properties to help place and style the embed, including an `html` property with the actual HTML markup to embed.

The `@apostrophecms/video-widget` widget provides a full-featured implementation. It includes [a widget player](https://github.com/apostrophecms/apostrophe/blob/main/packages/apostrophe/modules/%40apostrophecms/video-widget/index.js) that uses that API route to retrieve the full embed code and then replaces a placeholder HTML element with that code. See that widget for a suggested implementation.
<!-- TODO: Update with a link to the main branch once stable -->
