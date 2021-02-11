# Custom widgets

Let's add a two-column layout widget to the site.

:::tip
"Layout widgets" are normal Apostrophe widgets. It is a term of art in Apostrophe development for widget types created solely to visually structure nested content.
:::


```javascript
// in app.js, after the other modules, configure a new one
    'two-column-widget': {}
```

```js
// in modules/@apostrophecms/home-page/index.js
//
// Add our new widget to the "widgets" property for
// the "main" area
  fields: {
    add: {
      main: {
        ...
        options: {
          widgets: {
            ...
            'two-column': {}
          }
        }
      }
    }
  }
```

```js
// in modules/two-column-widget/index.js
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Two Column'
  },
  fields: {
    add: {
      columnOne: {
        type: 'area',
        label: 'Column One',
        options: {
          // You can copy the `widgets` option from the `main` area in
          // home-page/index.js
        }
      },
      columnTwo: {
        type: 'area',
        label: 'Column Two',
        options: {
          // You can copy the `widgets` option from the `main` area in
          // home-page/index.js
        }
      }
    }
  }
};
```

```django
{# in modules/two-column-widget/views/widget.html #}
<div class="two-column-layout-container">
  <div class="two-column-layout column-one">
    {% area data.widget, 'columnOne' %}
  </div>
  <div class="two-column-layout column-two">
    {% area data.widget, 'columnTwo' %}
  </div>
</div>
```

```scss
// in src/index.scss or a file imported by it
.two-column-layout-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
}

.two-column-layout {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 1;
}

.column-one {
  order: 1;
}

.column-two {
  order: 2;
}
```

## Editing improvements

When working with a nested layout widget like this, you'll sometimes want to add another widget inside the left or right column. At other times, you'll want to add another widget at the top level, such as another two-column or one-column widget, like this one. In A2 this could be challenging.

To help you resolve this, A3 displays a "breadcrumb trail" indicating the nesting of the widgets. If you are looking at the controls for the lower, nested level, you can click on "Two Column" to see the controls at the higher level instead.

## Major changes from A2

* Our custom widget modules extend `@apostrophecms/widget-type`.
* Simple options like `label` go inside `options` rather than at the top level.
* Just like with pages, we use `fields` to configure our fields. However, `group` is not used for widgets.
* Just like with pages, any areas in a widget must be defined in `index.js`.
* Apostrophe is not supplying CSS classes, so we supply our own in the template if desired.
* We can nest widgets even more deeply than this if we wish and contextual editing on the page remains available. In A3 there is no technical limit on nesting, apart from common sense.
