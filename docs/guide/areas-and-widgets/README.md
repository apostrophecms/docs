# Areas and widgets

**Areas** are core to Apostrophe's in-context editing experience. They are special fields where editors can add one or more content widgets. A **widget** is a section of structured content, such as a block of rich text, an image slideshow, or a grid of featured products. Together, these two features let editors add custom and advanced content to a website, move it around, and edit it &ndash; all within a defined modal that maintains the content design.

## Basic area configuration

Like other fields, you will configure an area as part of the [field schema](/guide/content-schema.md) for a page or piece type. Apostrophe comes with several widgets that you can use right away, including ones for adding rich text, inserting an image, and embedding a video.

```js
// modules/landing-page/index.js
module.exports = {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'Landing Page'
  },
  fields: {
    add: {
      main: {
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {},
            '@apostrophecms/image': {},
            '@apostrophecms/video': {}
          }
        }
      }
    },
    group: {
      mainArea: {
        label: 'Main page content'
        fields: ['main']
      }
    }
  }
};
```

The configuration above shows a landing page type with one area field named `main`. Every area needs a `widgets` option that identifies the widget types allowed there. This example includes three widget of the core widget types, which would then be available to editors to add and arrange.

![The landing page main area with the menu open, showing available widgets](/images/area-in-context.jpg)

### Limiting the number of widgets in an area

To limit the number of widgets allowed in a specific area, include a `max` option.

```javascript
main: {
  type: 'area',
  options: {
    widgets: {
      '@apostrophecms/rich-text': {},
      '@apostrophecms/image': {},
      '@apostrophecms/video': {}
    },
    max: 3
  }
}
```

This can be especially useful when you want to allow only one widget of a particular type in an area. This can be a good way to add a special page introduction that should only include a single rich text area.

```javascript
introduction: {
  type: 'area',
  options: {
    widgets: {
      '@apostrophecms/rich-text': {}
    },
    max: 1
  }
}
```
