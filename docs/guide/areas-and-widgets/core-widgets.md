# Core widgets

Apostrophe comes with some content widgets you can use in areas right away. See below for their descriptions and options.

| Common name/label | Widget reference | What is it? |
| ------ | ------ | ------ |
| [Rich text](#rich-text-widget) | `@apostrophecms/rich-text` | A space to enter text and allow formatting (e.g., bolding, links) |
| [Image](#image-widget) | `@apostrophecms/image` | A single image supporting alt text and responsive behavior |
| [Video](#video-widget) | `@apostrophecms/video` | Embed a video from most video hosts by entering its URL |
| [Raw HTML](#html-widget) | `@apostrophecms/html` | Allow entering HTML directly (see security notes below) |

## Rich text widget

The rich text widget provides a space for entering and editing formatted text. Editors can update its content directly in-context.

There are many text formatting features that you can configure for rich text widgets. These editor options are configured in two widget options: [`toolbar`](#configuring-the-toolbar) and [`styles`](#configuring-text-styles). Add these to the widget configuration object when adding an area field.

```js
// modules/@apostrophecms/home-page/index.js
// In area field configuration options
widgets: {
  '@apostrophecms/rich-text': {
    // 👇 Toolbar configuration
    toolbar: ['styles', 'bold', 'italic'],
    // 👇 Styles configuration
    styles: [
      {
        tag: 'p',
        label: 'Paragraph (P)'
      },
      {
        tag: 'h2',
        label: 'Heading 2 (H2)'
      }
    ]
  }
}
```

### Configuring the toolbar

To add formatting tools to the rich text toolbar, add their names to the `toolbar` array. The available formatting options include:

| Tool name | What is it? |
| --------- | ----------- |
| 'styles' | A list of text styles, allowing different HTML tags and CSS classes (see ["Configuring text styles"](#configuring-text-styles) below) |
| `'bold'` | Bold text |
| `'italic'` | Italicize text |
| `'strike'` | Strikethrough text |
| `'link'` | Add a link |
| `'horizontal_rule'` | Add a visual horizontal rule |
| `'bullet_list'` | Bulleted list |
| `'ordered_list'` | Numbered list |
| `'blockquote'` | Block quote |
| `'code_block'` | Code block |
| `'undo'` | Undo the last change |
| `'redo'` | Redo the last undone change |
| `'|'` | Add a visual separator to the toolbar (not a formatting action) |

<!-- TODO: Add a link to the how-to on adding your own tools when available. -->

### Configuring text styles

When you add the `'styles'` formatting tool, you can configure an array of text styles. These must include an HTML tag and a label for the menu interface. They may also include a CSS class.

A single style including class might look like:

```javascript
{
  label: 'Centered heading',
  tag: 'h2',
  class: 'centered'
}
```

You can use the same tag in several styles with various CSS classes.

::: note
Including a class with a style will not automatically apply any styles. You still need to [write your own CSS](/guide/front-end-assets.md) for the class.
:::

<!-- TODO: Link to how-to about configuring sanitize-html for pasting in rich text -->

### Default rich text configuration

```javascript
{
  toolbar: [
    'styles',
    'bold',
    'italic',
    'strike',
    'link',
    'bullet_list',
    'ordered_list',
    'blockquote'
  ],
  styles: [
    {
      tag: 'p',
      label: 'Paragraph (P)'
    },
    {
      tag: 'h2',
      label: 'Heading 2 (H2)'
    },
    {
      tag: 'h3',
      label: 'Heading 3 (H3)'
    },
    {
      tag: 'h4',
      label: 'Heading 4 (H4)'
    }
  ]
},
```

You can configure only one of the two sections (`toolbar` or `styles`), and use the default configuration for the other.

**You can also set your own default** rich text options. Avoid adding the same options repeatedly by configuring configure these options on the `@apostrophecms/rich-text-widget` module.

```javascript
// modules/@apostrophecms/rich-text-widget
module.exports = {
  options: {
    toolbar: [
      // Your default formatting tools
    ],
    styles: [
      // Your own default styles
    ]
  }
}
```

## Image widget

The image widget supports displaying a single image including its alt text. It also uses the image variants that Apostrophe generates to responsively load image files based on the active viewport width.

<!-- TODO: Link to info about uploading media regarding multiple image versions, instead of explaining here, when available. -->

```js
// modules/@apostrophecms/home-page/index.js
// In area field configuration options
widgets: {
  '@apostrophecms/image': {}
}
```

### Customizing responsive image sizes

<!-- TODO: link to attachment module srcset method when reference is available. -->
The image widget's default `srcset` attribute for responsive behavior assumes the image is roughly the same width as the viewport. This will help reduce download times even if the display size is smaller, but you can make responsive loading more accurate by providing [the `sizes` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-sizes) value.

This configuration is applied as a template option. In the template's `area` tag, include a `sizes` [context option](/guide/areas-and-widgets/#passing-context-options) for the image widget. The option value should be the actual HTML attribute value.

```django
{% area data.page, 'main' with {
  '@apostrophecms/image': {
    sizes: '(min-width: 600px) 45vw, (min-width: 1140px) 530px'
  }
} %}
```

See below for the image variant sizes that Apostrophe generates by default.

### Specifying the fallback size

Most browsers will use the responsive `srcset` attribute to find the right image file to display. Older browsers may need the static `src` attribute value. By default Apostrophe uses the `full` image variant, no larger than 1140px
by 1140px, for the `src` value.

You can change this in the area field widget options, using another image size name.

```js
// modules/@apostrophecms/home-page/index.js
// In area field configuration options
widgets: {
  '@apostrophecms/image': {
    size: 'one-half'
  }
}
```

The sizes available by default are:

| Name | Maximum width | Maximum height |
| ------ | ------ | ------ |
| `max` | 1600px | 1600px |
| `full` | 1140px | 1140px |
| `two-thirds` | 760px | 760px |
| `one-half` | 570px | 700px |
| `one-third` | 380px | 700px |
| `one-sixth` | 190px | 350px |

The final image size name is `original`, which delivers the original image file. This should be used carefully since it could be very large and slow to download.

## Video widget

The core video widget accepts a video URL and fetches the embed code to display it. Most major video hosts are supported by default. The widget uses the oEmbed data format, so you can find a full list of supported services [on the oEmbed website](https://oembed.com/#section7).

## HTML widget

**Or: How to get access to the editing interface when embedded HTML breaks it.**

The HTML widget allows content editors to embed raw HTML directly into a template. This can be helpful if they may need to add third-party features (e.g., sign-up forms). This can also be very dangerous since there are no limits to what they can add. Bad Javascript in embedded HTML can break the user interface, making it impossible to remove the bad code.

**Think carefully before providing this widget option to editors and make them aware of the risks.**

There is a safety mechanism in case things do go wrong. If embedded HTML breaks the Apostrophe interface, append the query parameter `safemode=1` to the end of the URL. The HTML widget will not render its contents and editors will be able to edit it to remove or fix the embed.

```
https://example.net/broken-page?safemode=1
```


To do that, access the page with `?safemode=1` at the end of the URL. Then you will be able to edit the widget and remove the offending content.

## Setting a CSS class on core widgets

There are two options to set classes on core widgets. You can add a `className` option to **either the widget module or the widget options in an area field**. That value will be added to the outer-most HTML element in core widget templates. If both are set, the `className` property on the area configuration will be used.

Configuring on the module widget level:

```js
// app.js
require('apostrophe') {
  modules: {
    '@apostrophecms/video-widget': {
      options: {
        className: 'project-video-class'
      }
    }
  }
};
```

Configuring on the area field widget options:

```js
// modules/@apostrophecms/home-page/index.js
module.exports = {
  fields: {
    add: {
      main: {
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/video': {
              className: 'area-video-class'
            }
          }
        }
      }
    },
    // ...
  }
};
```
