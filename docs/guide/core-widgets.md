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
| `'styles'` | A list of text styles, allowing different HTML tags and CSS classes (see ["Configuring text styles"](#configuring-text-styles) below) |
| `'bold'` | Bold text |
| `'italic'` | Italicize text |
| `'strike'` | Strikethrough text |
| `'superscript'` | Superscript text |
| `'subscript'` | Subscript text |
| `'link'` | Add a link |
| `'anchor'` | Add an anchor id |
| `'horizontalRule'` | Add a visual horizontal rule |
| `'bulletList'` | Bulleted list |
| `'orderedList'` | Numbered list |
| `'blockquote'` | Block quote |
| `'codeBlock'` | Code block |
| `'alignLeft'` | Text Align Left |
| `'alignCenter'` | Text Align Center |
| `'alignRight'` | Text Align Right |
| `'alignJustify'` | Text Align Justify |
| `'table'` | Insert and edit tables |
| `'image'` | Insert and edit images (beta) |
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

### Default rich text configuration

```javascript
{
  toolbar: [
    'styles',
    'bold',
    'italic',
    'strike',
    'link',
    'bulletList',
    'orderedList',
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

If you prefer, you can configure only one of the two sections (`toolbar` or `styles`), and keep the default configuration for the other.

**You can also set your own default** rich text options. Avoid adding the same options repeatedly by configuring these options on the `@apostrophecms/rich-text-widget` module.

```javascript
// modules/@apostrophecms/rich-text-widget/index.js
module.exports = {
  options: {
    defaultOptions: {
      toolbar: [
        // Your default formatting tools
      ],
      styles: [
        // Your own default styles
      ]
    }
  }
}
```

### Configuring the `image` toolbar option

If you choose to enable the `image` toolbar option, which is currently in beta and allows images to
appear inline in text, you will usually want to also configure the `imageStyles` option
to the `@apostrophecms/rich-text-widget` module in order to specify CSS classes the user is allowed to select
for the image:

<AposCodeBlock>
```javascript
// modules/@apostrophecms/rich-text-widget/index.js
module.exports = {
  options: {
    imageStyles: [
      {
        value: 'image-float-left',
        label: 'Float Left'
      },
      {
        value: 'image-float-right',
        label: 'Float Right'
      },
      {
        value: 'image-float-center',
        label: 'Center'
      }
    ]
  }
}
```
<template v-slot:caption>
/modules/@apostrophecms/rich-text-widget/index.js
</template>
</AposCodeBlock>

Apostrophe will apply the specified classes to a `figure` element that will contain an `img` element and a `figcaption` element.
Note that writing styles for those classes to suit your needs is up to you. `image-float-left` does not ship with Apostrophe,
it is just an example.

### Allowing links to specific piece-types

By default, the rich text widget allows you to add links to URLs or internal pages. The `linkWithType` option allows you to add links to any `piece-type` show page. Simply pass an array with the name of each desired `piece-type`. If you want to maintain linking to internal pages, also add `@apostrophecms/any-page-type` to your array. Note that you don't need to change this setting if you just want to link to the main index page for a piece type.

<AposCodeBlock>

``` javascript
module.exports = {
  options: {
    linkWithType: [ '@apostrophecms/any-page-type', 'article' ]
  }
};
```

<template v-slot:caption>
/modules/@apostrophecms/rich-text-widget/index.js
</template>
</AposCodeBlock>

### Adding placeholder content

By default, the rich text widget displays placeholder content. To block this behavior, set the `placeholder` option to a value of `false`. To change the content, pass either a simple string or a string containing a namespaced i18n key, to the `placeholderText` option.

<AposCodeBlock>

```js
module.exports = {
  options: {
    placeholderText: 'myNamespace:placeholder'
  }
};

```

<template v-slot:caption>
/modules/@apostrophecms/rich-text-widget/index.js
</template>
</AposCodeBlock>

<AposCodeBlock>

```json
{
  "placeholder": "Add text here..."
}

```

<template v-slot:caption>
/modules/@apostrophecms/rich-text-widget/i18n/myNamespace/en.json
</template>
</AposCodeBlock>


## Image widget

The image widget supports displaying a single image, including its alt text. It also uses the image variants that Apostrophe generates to responsively load image files based on the active viewport width.


<!-- TODO: Link to info about uploading media regarding multiple image versions, instead of explaining here, when available. -->

```js
// modules/@apostrophecms/home-page/index.js
// In area field configuration options
widgets: {
  '@apostrophecms/image': {}
}
```


### Specifying a minimum size

You can specify a minimum size for any image widget:

```js
// modules/@apostrophecms/home-page/index.js
// In area field configuration options
widgets: {
  '@apostrophecms/image': {
    minSize: [ 1000, 600 ]
  }
}
```

This widget won't allow the editor to select any image under 1000 pixels wide, or under 600 pixels tall. In addition, editors won't be able to crop the image smaller than that after selecting it for that particular widget.

### Specifying an aspect ratio

You can specify an aspect ratio for any image widget:

```js
// modules/@apostrophecms/home-page/index.js
// In area field configuration options
widgets: {
  '@apostrophecms/image': {
    aspectRatio: [ 3, 2 ]
  }
}
```

In some designs, especially slideshow experiences involving multiple images, allowing images with different aspect ratios just doesn't look good. For these cases, you can set an appropriate aspect ratio.

When you set an aspect ratio, editors can still select differently shaped images. However, if they save that selection without manually cropping it, the image is automatically cropped to match the ratio you set. If the editor does choose to manually crop it, the cropping interface ensures the aspect ratio you chose remains in effect.

### Taking advantage of the "focal point" feature

A fixed ratio for all devices doesn't work for all designs. If your responsive design features custom CSS with different ratios at different breakpoints, consider encouraging editors to use the focal point feature as an alternative to setting `minSize`. The image widget emits CSS that biases the browser toward ensuring that the editor's chosen focal point remains visible, regardless of device.

### Customizing responsive image sizes {#srcset}

<!-- TODO: link to attachment module srcset method when reference is available. -->
The image widget's default `srcset` attribute for responsive behavior assumes the image is roughly the same width as the viewport. This will help reduce download times even if the display size is smaller, but you can make responsive loading more accurate by providing [the `sizes` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-sizes) value.

This configuration is applied as a template option. In the template's `area` tag, include a `sizes` [context option](/guide/areas-and-widgets.md#passing-context-options) for the image widget. The option value should be the actual HTML attribute value.

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

You can also elect to change the default size for all image widgets by passing a named size to the `size` option in a project-level image widget configuration. This size will be overridden by a `size` set in the area widget configuration.

<AposCodeBlock>

```js
module.exports = {
  options: {
    size: 'one-half'
  }
}
```
<template v-slot:caption>
modules/@apostrophecms/image-widget/index.js
</template>
</AposCodeBlock>

### Adding a `loading` attribute
You can elect to add a `loading` attribute to your image markup by passing the `loadingType` option to either the project-level image widget configuration or within the area widget configuration. This [attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-loading) can take values of `lazy` or `eager` to alter when the image is loaded onto the page. As with the `size` option, setting this option in the area widget configuration will override the value added to project-level options.

<AposCodeBlock>

```js
module.exports = {
  options: {
    loadingType: 'lazy'
  }
}
```
<template v-slot:caption>
modules/@apostrophecms/image-widget/index.js
</template>
</AposCodeBlock>

### Adding a placeholder image

The image widget displays a placeholder image by default. To block this behavior, set the `placeholder` option to a value of `false`.

Alternatively, the preview image can be changed for your project. For the image widget, the `placeholderImage` option takes **just the file extension,** like `png` (note no `.`). You must also copy a matching file to the `public` subdirectory of your project-level configuration of the module, e.g. copy that image to `/modules/@apostrophecms/image-widget/public/placeholder.png` (the name must be `placeholder` and the extension must match `placeholderImage`).

<AposCodeBlock>

```js
module.exports = {
  options: {
    // for a file named 'placeholder.png' in the module's project-level public folder
    placeholderImage: 'png'
  }
};
```

<template v-slot:caption>
/modules/@apostrophecms/image-widget/index.js
</template>
</AposCodeBlock>

::: note
A legacy `placeholderUrl` option also exists, but we do not recommend it. Use `placeholderImage` and let Apostrophe do the hard work of determing the asset URL for you.
:::

## Video widget

The core video widget accepts a video URL and fetches the embed code to display it. Most major video hosts are supported by default.

<!-- TODO: Link to the `allowList` option on the oembed module once module references are available. -->

### Adding a placeholder video

By default, the video widget displays a placeholder video. To block this behavior, set the `placeholder` option to a value of `false`. The default video can be changed by adding a hosted video URL string as the value of the `placeholderUrl` option. The video URL must be compatible with the video widget, e.g., a YouTube video page URL, Vimeo video page URL, etc.

<AposCodeBlock>

```js
module.exports = {
  options: {
    placeholderUrl: 'https://vimeo.com/375468729'
  }
};

```

<template v-slot:caption>
/modules/@apostrophecms/video-widget/index.js
</template>
</AposCodeBlock>

## HTML widget

**Or: How to get access to the editing interface when embedded HTML breaks it.**

The HTML widget allows content editors to embed raw HTML directly into a template. This can be helpful if they may need to add third-party features (e.g., sign-up forms). This can also be very dangerous since there are no limits to what they can add. Bad JavaScript in embedded HTML can break the user interface, making it impossible to remove the bad code.

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
