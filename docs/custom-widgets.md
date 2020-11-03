---
title: "Custom Widgets"
---

# Custom Widgets

Let's add a two-column layout widget to the site:

```bash
mkdir -p modules/two-column-widget/views
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
    label: 'Two Column',
  },
  fields: {
    add: {
      left: {
        type: 'area',
        label: 'Column One',
        options: {
          // You can copy from the "main" area in home-page/index.js
        }
      },
      right: {
        type: 'area',
        label: 'Column Two',
        options: {
          // You can copy from the "main" area in home-page/index.js
        }
      },
    }
  }
}
```

```js
{# in modules/two-column-widgets/views/widget.html #}
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
// in src/index.scss
.two-column-container {
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

## Differences from A2

* Our custom widget modules extend `@apostrophecms/widget-type`.
* Simple options like `label` go inside `options` rather than at the top level.
* Just like with pages, we use `fields` to configure our fields. However, `group` is not used for widgets.
* Just like with pages, any sub-areas must be specified in `index.js`.
* Apostrophe is not supplying CSS classes, so we supply our own in the template if desired.
* We can nest widgets even more deeply than this if we wish. In A3 there is no technical limit on nesting, apart from common sense.
