# Configuring the standard widgets

We're continuing to offer a few standard widgets. The provided `index.js` in our boilerplate project includes all four:

```js
// modules/@apostrophecms/home-page/index.js

...
widgets: {
  '@apostrophecms/rich-text': { ... },
  '@apostrophecms/video': {},
  '@apostrophecms/html': {},
  '@apostrophecms/image': {}
...
```

## Configuring the rich text widget

The rich text widget does have a standard configuration, but in most cases you'll want to decide what HTML tags and styles to allow, just as we've done in the boilerplate project.

For your reference, here is a configuration that includes all of the currently supported features.

::: tip Note:
We don't recommend throwing in every possible setting. Most users know the keyboard shortcuts for "undo" and "redo" which are always available.
:::

```js
widgets: {
  '@apostrophecms/rich-text': {
    toolbar: [
      'styles',
      // Visual separator between groups
      '|',
      'bold',
      'italic',
      'strike',
      '|',
      'link',
      'horizontal_rule',
      'bullet_list',
      'ordered_list',
      '|',
      'blockquote',
      'code_block',
      '|',
      'undo',
      'redo'
    ],
    styles: [
      {
        tag: 'p',
        label: 'Paragraph (P)'
      },
      {
        tag: 'h3',
        label: 'Heading 3 (H3)'
      },
      {
        tag: 'h4',
        label: 'Heading 4 (H4)'
      }
      {
        tag: 'h4',
        class: 'centered',
        label: 'Heading 4 Centered (H4)'
      }
    ]
  }
}
```

Notice that the `styles` section can be used to set both tags and CSS classes. The same tag can appear several times in `styles`, with various CSS classes.

::: tip Note:
Adding the class `centered` won't actually center your text by itself. You would need to write appropriate CSS. In the boilerplate project you can do that in `./src/index.scss`, or a file imported by it.
:::

## Configuring the image widget

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

## Configuring the video widget

While the video widget looks better out of the box, you can configure a `className` option for that as well if you wish.

## Configuring the HTML widget

There's nothing to configure! But, note that if you paste a bad embed code that breaks the tag balancing of the markup or otherwise damages the page, you will need a way to get control back.

To do that, access the page with `?safemode=1` at the end of the URL. Then you will be able to edit the widget and remove the offending content.
