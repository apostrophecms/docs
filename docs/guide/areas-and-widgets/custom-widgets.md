# Custom widgets

Creating new widget options in addition to the [core widgets](/guide/areas-and-widgets/core-widgets.md) is crucial to getting the most from Apostrophe. Doing so allows developers to build the content *structure* a design requires while giving editors flexibility in how content will evolve over time.

## Creating a widget type

Adding a new widget type involves create a new module that extends the `@apostrophecms/widget-type` module. It also needs to have a template to render the editor input. The module configuration file will include a [field schema](/guide/content-schemas.md) with the appropriate fields.

We will use the example of a two column **"layout widget."** It is a fairly common and relatively simple use case that allows editors to visually align content in a row. This version of a layout widget consists of two areas next to one another. Each will allow either rich text and image widgets nested inside.

First create the module configuration file, extend the core widget type module, and add a widget label for editors. If you do not add a label, Apostrophe will attempt to generate one for the UI based on the module's name.

**The module's name must end in `-widget`.** It is a convention that supports core business logic around widgets and can help keep project code organized. This two-column widget is named `two-column-widget`.

```js
// modules/two-column-widget/index.js
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Two column'
  },
  // 👇 The widget type's field schema
  fields: {
    add: {
      // 👇 The first column area
      columnOne: {
        type: 'area',
        label: 'Column One',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {},
            '@apostrophecms/image': {}
          }
        }
      },
      // 👇 The second column area
      columnTwo: {
        type: 'area',
        label: 'Column Two',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {},
            '@apostrophecms/image': {}
          }
        }
      }
    }
  }
};

```

You may notice there is no `group` property to the field schema. The widget editing interface does not have field groups, so it is not necessary here.

You can then add this module to the `app.js` file to instantiate it.

```js
// app.js
require('apostrophe')({
  shortName: 'my-website',
  modules: {
    'two-column-widget': {}
  }
});
```

## Widget templates

Before using the new widget type, it needs a template file, `widget.html`, in the module's `views` directory. A simple template for the two column widget might look like:

```django
{# modules/two-column-widget/views/widget.html #}
<section class="two-col">
  <div class="two-col__column">
    {% area data.widget, 'columnOne' %}
  </div>
  <div class="two-col__column">
    {% area data.widget, 'columnTwo' %}
  </div>
</section>
```

**Widget field values are available on `data.widget` in templates.** [Context options](/guide/areas-and-widgets/#passing-context-options) passed in are available on `data.contextOptions`.

::: note
Here are some two-column styles for people following along.

```scss
// src/index.scss or a file imported by it
.two-col {
  display: flex;
  flex-flow: row wrap;
  width: 100%;
}

.two-col__column {
  display: flex;
  flex-direction: column;
  flex: 1;
}
```
:::

