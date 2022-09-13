# Areas and widgets

**Areas** are core to Apostrophe's in-context editing experience. They are special fields where editors can add one or more content widgets. A **widget** is a section of structured content, such as a block of rich text, an image slideshow, or a grid of featured products. Together, these two features let editors add custom and advanced content to a website, move it around, and edit it &ndash; all within a model that maintains the content design. Areas can be configured for editors to add content through a basic menu or through an expanded preview menu.

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

If you dig into the Apostrophe code, or read the guide to custom widget types, you may already know that widget module names end with `-widget`, such as `@apostrophecms/rich-text-widget`. This suffix is left off when configuring areas. The area knows these are widgets already and it does not seem necessary to require developers to write it over and over.

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

## Expanded widget menu configuration
 To enhance the editor experience, an expanded widget menu can be added instead of the basic configuration. This menu expands out from the left side and provides a visual indication of what each widget type is like, as well as support for organization of widgets into groups. This type of area is added to a page in a manner similar to the basic menu as part of the [field schema](/guide/content-schema.md) for a page or piece type. The following example shows a landing page type with one area field named `main`.

<AposCodeBlock>

```javascript
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
          expanded: true,
          groups: {
            basic: {
              label: 'Basic',
              widgets: {
                '@apostrophecms/rich-text': {},
                '@apostrophecms/image': {}
              },
              columns: 2
            },
            layout: {
              label: 'Layout',
              widgets: {
                'two-column': {},
                'three-column': {},
                'four-column': {}
              },
              columns: 3
            }
          }
        }
      }
    }
  }
};

```

<template>
  modules/landing-page/index.js
</template>

</AposCodeBlock>

 For the expanded widget preview menu, widgets are added in `groups`, rather than being added and then arranged as in the basic configuration. Fields with an `area` type take two new options. The first new option is `expanded` and takes a boolean to activate the expanded preview. The `groups` option takes multiple groupings of widgets assigned through named objects. In the example code, there are two such `groups`. The first is named `basic` and the second is named `layout`. Each has a `label` key that provides the display name. Each also has a `widgets` key that contains the names and options for all of the widgets to be included in that group. Like with the basic configuration, the widget names do not need the '-widget' suffix. Finally, each group has a `columns` key that take an integer from 1-4. This determines how many columns this group will use and how many widgets will be displayed per line. The default value is 3.

 ### Widget preview options
 If a widget is being used within an expanded widget preview area, it can take additional options that determine how it will be displayed. The widgets `label` will be displayed, but an additional `description` option can be used to provide descriptive text that will be displayed below the widget in the menu.
 
 By default, the widget will be displayed as a placeholder rectangle. However, there are three options for adding a preview image.
 
 The `previewComponent` option takes the name of a custom Vue component
 MORE DESCRIPTION NEEDS TO BE ADDED HERE

The `previewImage` option takes the extension, without `.`, of the image to be used. For example, `'png'` or `'gif'`. The actual image should be added into the `/public` folder of the widget and named `preview.EXTENSION`, where `EXTENSION` matches the string passed to the option.

The third option is `previewIcon`. This option takes any icon that has been registered
## Adding areas to templates

Areas have a special template tag to add them in template markup. It requires passing two arguments: the area's context and the area name.

```django
{% area context, 'name' %}
```

The **context** refers to the data object that the area field belongs to. This could be a page, a piece, or a widget. In the landing page example above, the `main` area belongs to a landing page. In that case, the context would be that page's data object in the template: `data.page`.

```django
{% area data.page, 'main' %}
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
Learn more about rich text options in [the section on core widgets](/guide/core-widgets.md).
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
