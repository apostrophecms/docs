# Areas and widgets

**Areas** are core to Apostrophe's in-context editing experience. They are special fields where editors can add one or more content widgets. A **widget** is a section of structured content, such as a block of rich text, an image slideshow, or a grid of featured products. Together, these two features let editors add custom and advanced content to a website, move it around, and edit it &ndash; all within a model that maintains the content design.

## Basic area configuration

Like other fields, area fields are configured as part of the [field schema](/guide/content-schema.md) for a page or piece type. The following example shows a landing page type with one area field named `main`. Every area requires a `widgets` option to configure the allowed widget types. This example includes three core widget types.

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

![The landing page main area with the menu open, showing available widgets](/images/area-in-context.jpg)

### Leave `-widget` out of area configuration

If you dig into the Apostrophe code, or read the guide to custom widget types, you may already know that widget module names end with `-widget`, such as `@apostrophecms/rich-text-widget`. This suffix is left off when configuring areas. The area knows these are widgets already and it does not seem necessary to require developers don't need to write it over and over.

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

## Adding areas to templates

Areas have a special template tag to add them in template markup. It requires passing two arguments: the area's context and the area name.

```django
{% area context, name %}
```

The **context** refers to the data object that the area field belongs to. This could be the a page, a piece, or a widget. In the landing page example above, the `main` area belongs to a landing page. In that case, the context would be that page's data object in the template: `data.page`.

```django
{% area data.page, main %}
```

The template tag knows to use the area data on `data.page.main`, check for the widgets allowed in that area, and render the area using the correct widget templates.

### Passing context options

Most widget options must be included in the area field configuration. For example, you can configure the rich text widget to use particular formatting controls. The server uses these options to properly validate user input.

```javascript
main: {
  type: 'area',
  options: {
    widgets: {
      '@apostrophecms/rich-text': {
        toolbar: [
          'bold',
          'italic',
          'strike',
          'link'
        ]
      }
    }
  }
}
```

::: note
Learn more about rich text options in [the section on core widgets](/guide/areas-and-widgets/core-widgets.md).
:::

In other situations, you may need to **pass the widget *template* options that only apply to a specific context**. One example of this is the [`sizes` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-sizes) for the core image widget's `img` tag. Since that attribute tells browsers which file versions to use in a responsive image, it may be different when the image is a small thumbnail as opposed to when it is a larger featured photo.

These can be added in an object after the area tag arguments using the `with` keyword.

```django
{% area data.page, 'main' with {
  '@apostrophecms/image': {
    sizes: '(min-width: 600px) 45vw, (min-width: 1140px) 530px'
  }
} %}
```

The object following `with` should include keys matching widget type names, without the `-widget` suffix (e.g., the `@apostrophecms/image`). The context template will pass those options into the proper widget template as `data.contextOptions`. In the example above, the core image widget template, *and only that template*, would be able to use the data as:

```django
{{ data.contextOptions.sizes }}
```

Any context options for widget types not allowed in the area are ignored.
