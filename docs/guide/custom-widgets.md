# Custom widgets

Creating new widget options in addition to the [core widgets](/guide/areas-and-widgets/core-widgets.md) is crucial to getting the most from Apostrophe. Doing so allows developers to build the content *structure* a design requires while giving editors flexibility in how content will evolve over time.

## Creating a widget type

Adding a new widget type involves creating a new module that extends the `@apostrophecms/widget-type` module. It also requires a template to render the editor input. The module configuration file will include a [field schema](/guide/content-schemas.md) with the appropriate fields.

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

```css
/* modules/two-column-widget/ui/public/styles.css */
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

## Client-side JavaScript for widgets

When adding client-side JavaScript for widget interaction, add a widget "player" to contain that code. The player will run only when the widget is used. It will also run when the editable area of the page is refreshed during editing.

We can use the example of a basic collapsible section widget, `collapse-widget` (also known as an "accordion" or "disclosure" widget). It will hide detail text until a user clicks the header/button.

::: details Example collapsible widget code
**Module configuration**
```javascript
// modules/collapse-widget/index.js
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Collapsible section'
  },
  fields: {
    add: {
      heading: {
        type: 'string',
        required: true
      },
      detail: {
        type: 'string',
        required: true,
        textarea: true
      }
    }
  }
};
```

**Module template**

```django
{# modules/collapse-widget/views/widget.html #}
<section data-collapser class="collapser">
  <h2>
    <button data-collapser-button aria-expanded="false">
      {{ data.widget.heading }}
    </button>
  </h2>
  <div hidden data-collapser-detail>
    {# `nlbr` and `safe` are core Nunjucks tag filters #}
    {{ data.widget.description | nlbr | safe }}
  </div>
</section>
```

**Module styles** (see [front end assets guide](/guide/front-end-assets.md))

```css
.collapser__detail {
  display: none;

  &.is-active {
    display: block;
  }
}
```
:::

Widget player code can be added in any client-side JavaScript file in a module's `ui/public/` directory. In this example it would be in `modules/collapse-widget/ui/public/collapser.js` (the file name does not matter, as long as it is a `.js` file).

The player code is added to an object of widget players, `apos.util.widgetPlayers` using the widgets name, excluding the `-widget` suffix. It is an object with two properties:

| Property | Description |
| -------- | ----------- |
| `selector` | A string selector for the player to find the widget as you would use in [`document.querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector). |
| `player` | A function that takes the matching widget DOM element as an argument. |

```javascript
// modules/collapse-widget/ui/public/collapser.js
apos.util.widgetPlayers.collapser = {
  selector: '[data-collapser]',
  player: function (el) {
    // ...
  }
};
```

With some code to manage showing and hiding the detail, it would look like:

```javascript
apos.util.widgetPlayers.accordion = {
  selector: '[data-collapser]',
  player: function (el) {
    // Find our button
    const btn = el.querySelector('[data-collapser-button]');
    // Find our hidden text
    const target = el.querySelector('[data-collapser-detail]');

    btn.onclick = () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      // Update the button's aria attribute
      btn.setAttribute('aria-expanded', !expanded);
      // Update the `hidden` attribute on the detail
      target.hidden = expanded;
    };
  }
};
```

[Credit goes to Heydon Pickering](https://inclusive-components.design/collapsible-sections/) for the accessible collapsible example.

### Using widget data in players

Widget players do not have direct access to any *widget data*. If we want to use widget data in the player, we need to pass it in.

Template files on the other hand, *do* have access to widget data (they are rendered on the server). One good way to use data in a widget player is to insert it as a data attribute value in the template. The player can then look for that data attribute.

For example, we could change our collapse widget to include a `color` field value:

```django
{# modules/collapse-widget/views/widget.html #}
<section data-collapser data-color="{{ data.widget.color }}" class="collapser">
  {# The rest of the code is the same... #}
</section>
```

We've added the `data-color` attribute to the widget wrapper with our color data. Then in the player code we could get the value with the wrapper element's `dataset` property.

```javascript
apos.util.widgetPlayers.accordion = {
  selector: '[data-collapser]',
  player: function (el) {
    const color = el.dataset.color || 'purple'
    // The rest of the code is the same...
  }
};
```

The player *does* have access to the widget's wrapping element, so we use `el.dataset.color` to access the color data we stored on `data-color`.

::: tip
We can pass a string, number, or boolean value with a data attribute using the method shown above. If the value we need to use in the widget player is an array or object, it will need to become a string first. Use the `jsonAttribute` template filter to do this.

```django
<div data-config="{{ data.piece.someObjectOrArray | jsonAttribute }}"></div>
```

The value will be converted to a string and escaped. The original value can retrieved in the player with `JSON.parse`.
:::
