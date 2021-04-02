# Core widgets

Apostrophe comes with some content widgets you can use in areas right away. See below for their descriptions and options.

| Common name/label | Widget reference | What is it? |
| ------ | ------ | ------ |
| Rich text | `@apostrophecms/rich-text` | A space to enter text and allow formatting (e.g., bolding, links) |
| Image | `@apostrophecms/image` | A single image supporting alt text and responsive behavior |
| Video | `@apostrophecms/video` | Embed a video from most video hosts by entering its URL |
| Raw HTML | `@apostrophecms/html` | Allow entering HTML directly (see security notes below) |

## General core widget options

These options apply to all core Apostrophe widgets. They will not automatically have any effect on custom widget types and may not for installed widgets either.

| Option | Value type | Description |
|---------|---------|---------|
| `className` | String | A CSS class to add to the widget's outer wrapper |

## Rich text widget

There are many text formatting features that you can configure for rich text widgets. These editor options are configured in two widget options: [`toolbar`](#configuring-the-toolbar) and [`styles`](#configuring-text-styles). Add these to the widget configuration object when adding an area field.

```js
// modules/@apostrophecms/home-page/index.js
module.exports = {
  fields: {
    add: {
      main: {
        type: 'area',
        options: {
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
        }
      }
    },
    // ...
  }
};
```

### Configuring the toolbar

To add formatting tools to the rich text toolbar, add their names to the `toolbar` array. The available tools include:

| Tool name | What is it? |
| --------- | ----------- |
| 'styles' | A drop down list of text styles, allowing different HTML tags and CSS classes (see ["Configuring text styles"](#configuring-text-styles) below) |
| `'bold'` | Bold text |
| `'italic'` | Italicize text |
| `'strike'` | Strikethrough |
| `'link'` | Add a link |
| `'horizontal_rule'` | Add a visual horizontal rule |
| `'bullet_list'` | Convert text to a bulleted list |
| `'ordered_list'` | Convert text to a numbered list |
| `'blockquote'` | Convert text to a block quote |
| `'code_block'` | Convert text to a code quote |
| `'undo'` | Undo the last change |
| `'redo'` | Redo the last undone change |
| `'|'` | Add a visual separator to the toolbar (not a formatting action) |

<!-- TODO: Add a link to the how-to on adding your own tools when available. -->

### Configuring text styles

When you add the `'styles'` formatting tool, you can configure an array of text styles for editors to apply. These must include an HTML tag and a label for the menu. They may also include a CSS class.

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

### Default configuration

There is default configuration for rich text widgets so you do not necessarily need to configure yours. That configuration is:

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

If your rich text settings only include one of the two sections (`toolbar` and `styles`), the default for the other will be used. In other words, if your configuration only changes `styles`, the `toolbar` option from the defaults will apply.

**You can also set your own defaults.** If you use the same rich text options in all or most of your areas, you can configure these option on the `@apostrophecms/rich-text-widget` module as opposed to on individual areas.

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

The image widget does work right out of the box, but notice that images can push beyond the page. A3 does not impose any front-end opinions regarding widgets, and thus it's necessary to configure them properly with CSS classes for styling. In this example, we'll configure the image-widget to have a class.

Start by creating a directory for project-level configuration of the `@apostrophecms/image-widget` module. Using your terminal:

```bash
mkdir modules/@apostrophecms/image-widget
```

Then, you can configure it by creating an `index.js` file in that directory:

```js
// modules/@apostrophecms/image-widget/index.js
module.exports = {
  options: {
    className: 'full-width-image'
  }
};
```

Now, you can add CSS so images don't run off the page. Add this to `./src/index.scss`:

```scss
// ./src/index.scss
.full-width-image {
  max-width: 100%;
}
```

A3 doesn't impose its own asset pipeline on you. The [A3 boilerplate]() utilizes a simple webpack configuration, which we cover in the [front end assets](front-end-assets.md) section.

::: tip Note:
The image widget now only accepts one image. A3 comes with a still image widget, but because we are [less opinionated on the front end](front-end-assets.md), it doesn't come with a slideshow widget like in A2.
:::

### Sizing the image to suit the placement

Unlike in A2, we don't have to specify the `size` option when using the image widget. That's because in A3, our image widget uses the [srcset](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images) feature of HTML5. A regular `src` attribute is still provided as a fallback for IE11 users. The fallback default size is `full` (1140 pixels wide), but images up to 1600 pixels wide will be served automatically if appropriate. To avoid slowing the page down, the original is not served.

For fine-grained control in legacy browsers, `size` option can still be set to `one-sixth`, `one-third`, `one-half`, `two-thirds`, `full` or `max` (1600 pixels wide) when adding the widget to an area.

## Video widget

While the video widget looks better out of the box, you can configure a `className` option for that as well if you wish.

## HTML widget

There's nothing to configure! But, note that if you paste a bad embed code that breaks the tag balancing of the markup or otherwise damages the page, you will need a way to get control back.

To do that, access the page with `?safemode=1` at the end of the URL. Then you will be able to edit the widget and remove the offending content.
