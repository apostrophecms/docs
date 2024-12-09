# Custom widgets

Creating new widget options in addition to the [core widgets](/guide/core-widgets.md) is crucial to getting the most from Apostrophe. Doing so allows developers to build the content *structure* a design requires while giving editors flexibility in how content will evolve over time.

## Creating a widget type

Adding a new widget type involves creating a new module that extends the `@apostrophecms/widget-type` module. It also requires a template to render the editor input. The module configuration file will include a [field schema](/guide/content-schema.md) with the appropriate fields.

We will use the example of a two column **"layout widget."** It is a fairly common and relatively simple use case that allows editors to visually align content in a row. This version of a layout widget consists of two areas next to one another. Each will allow either rich text and image widgets nested inside.

First create the module configuration file, extend the core widget type module, and add a widget label for editors. If you do not add a label, Apostrophe will attempt to generate one for the UI based on the module's name.

**The module's name must end in `-widget`.** It is a convention that supports core business logic around widgets and can help keep project code organized. This two-column widget is named `two-column-widget`.

::: tip
Generate the starter code using the [official CLI](/guide/setting-up.md#the-apostrophe-cli-tool) with the command:

```bash
apos add widget two-column
```
:::

<AposCodeBlock>

``` js
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
<template v-slot:caption>
modules/two-column-widget/index.js
</template>

</AposCodeBlock>

You can then add this module to the `app.js` file to instantiate it.

<AposCodeBlock>

``` js
require('apostrophe')({
  shortName: 'my-website',
  modules: {
    'two-column-widget': {}
  }
});
```
<template v-slot:caption>
app.js
</template>

</AposCodeBlock>

In this example, we only have a limited number of schema fields, so we haven't added a `group` property. Much like with pieces or pages, the `group` property will allow you to organize your schema fields into groups. Like the other document types, the widget `group` property takes a named object for each tab, consisting of a label for the tab and `fields` property with an array of schema field names.

```js
fields: {
  add: {
    subtitle: {
      label: 'Subtitle',
      type: 'string'
    },
    author: {
    label: 'Author',
      type: 'string'
    },
    _article: {
      label: 'Article',
      type: 'relationship',
      withType: 'Article',
      builders: {
        project: {
          title: 1,
          _url: 1
        }
      }
    }
  },
  group: {
    content: {
      lable: 'Content',
      fields: [ '_article' ]
    },
    metadata: {
      label: 'Metadata',
      fields: [ 'subtitle', 'author' ]
    }
  }
}
```

Unlike the other document types, not adding a `group` property will not add an `ungrouped` tab. Instead, no tabs will be displayed. However, if you only add part of the fields to a group object, the ungrouped fields will be displayed on an `ungrouped` tab. If the number of tabs exceeds the width of the widget edit modal, additional tabs will be found in a context menu to the right of the displayed tabs and can be selected from there.

### Adding schema field placeholder content

Much like the core widgets, you can add placeholder content for many of the fields in your custom widgets. Within the widget options add `placeholder: true`. Then within individual fields add a `placeholder` property with a value appropriate to the type of schema field.

<AposCodeBlock>

``` js
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Custom Widget',
    icon: 'text-subject',
    placeholder: true,
    placeholderClass: 'my-custom-widget-placeholder'
  },
  fields: {
    add: {
      email: {
        type: 'email',
        placeholder: 'bob@email.com'
      },
      float: {
        type: 'float',
        placeholder: 0.05
      },
      integer: {
        type: 'integer',
        placeholder: 2
      },
      string: {
        type: 'string',
        placeholder: 'widget-with-placeholder placeholder'
      },
      url: {
        type: 'url',
        placeholder: 'https://example.com'
      }
    }
  }
};

```

<template v-slot:caption>
/modules/my-custom-widget/index.js
</template>
</AposCodeBlock>

This placeholder content will be present on the page when the widget is added. This content will never appear in the page preview. It will *only* appear on-page until you click Edit for that widget and save some real content. This data will also show up in the fields within the editor modal. The `placeholder` option can also be used to fill the editor modal fields with suggested content without also adding it to the page by setting it to `false`, but still adding placeholder content to each field.

::: info
If you set `placeholder: true` in the options and have either a `date` or `time` schema field, it will be populated with the current date/time on the page - not in the editor modal. Like the other fields, this content will not appear on the live page or in preview until you edit the widget and add actual content. It isn't possible to pass placeholder content into either of these fields.
:::

The `placeholderClass` option can be used to add a class to the wrapper around the rendered display of the widget until it is edited for the first time.

### Disabling the initial editor modal
Even when placeholder content is not needed, for some types of custom widgets, it may be useful to disable the automatic opening of the editor modal when it is first added to the page. This is similar to the behavior when adding placeholder content. The content is added to the page, but the Editor has to open the modal manually. For example, a widget to display a variable number of products set by default to five items. The Editor would only open the modal if they wanted to change this amount. The `initialModal` option is set to `true` by default, so to prevent initial modal opening, set the value to `false`.

::: info
Adding `placeholder: true` in the options for a widget automatically sets `initialModal` to `false`. This can **not** be overridden by passing a `true` value.
:::

## Widget templates

Before using the new widget type, it needs a template file, `widget.html`, in the module's `views` directory. A simple template for the two column widget might look like:

<AposCodeBlock>

``` nunjucks
<section class="two-col">
  <div class="two-col__column">
    {% area data.widget, 'columnOne' %}
  </div>
  <div class="two-col__column">
    {% area data.widget, 'columnTwo' %}
  </div>
</section>
```
<template v-slot:caption>
modules/two-column-widget/views/widget.html
</template>
</AposCodeBlock>

**Widget field values are available on `data.widget` in templates.** [Context options](/guide/areas-and-widgets.md#passing-context-options) passed in are available on `data.contextOptions`.

::: info
Here are some two-column styles for people following along.

<AposCodeBlock>

```css
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
<template v-slot:caption>
modules/two-column-widget/ui/src/index.scss
</template>
</AposCodeBlock>

:::

## Client-side JavaScript for widgets

When adding client-side JavaScript for widget interaction, add a widget "player" to contain that code. The player will run only when the widget is used. It will also run when the editable area of the page is refreshed during editing.

We can use the example of a basic collapsible section widget, `collapse-widget` (also known as an "accordion" or "disclosure" widget). It will hide detail text until a user clicks the header/button.

::: tip
When using the [official CLI](/guide/setting-up.md#the-apostrophe-cli-tool) to create a widget type, include widget player starter code with the `--player` option.

```bash
apos add widget collapse --player
```
:::

::: details Example collapsible widget code
**Module configuration**

<AposCodeBlock>

```javascript
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
<template v-slot:caption>
modules/collapse-widget/index.js
</template>
</AposCodeBlock>

**Module template**
<AposCodeBlock>

``` nunjucks
<section data-collapser class="collapser">
  <h2>
    <button data-collapser-button aria-expanded="false">
      {{ data.widget.heading }}
    </button>
  </h2>
  <div hidden data-collapser-detail>
    {# `nlbr` and `safe` are core Nunjucks tag filters #}
    {{ data.widget.detail | nlbr | safe }}
  </div>
</section>
```
<template v-slot:caption>
modules/collapse-widget/views/widget.html
</template>
</AposCodeBlock>

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

Widget player code can be added in any module's `ui/src/index.js` file, or a file imported by it. In this example it would be in `modules/collapse-widget/ui/src/index.js`.

The player code is added to an object of widget players, `apos.util.widgetPlayers` using the widget's name, excluding the `-widget` suffix. It is an object with two properties:

| Property | Description |
| -------- | ----------- |
| `selector` | A string selector for the player to find the widget as you would use in [`document.querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector). |
| `player` | A function that takes the matching widget DOM element as an argument. |

<AposCodeBlock>

```javascript
export default () => {
  apos.util.widgetPlayers.collapser = {
    selector: '[data-collapser]',
    player: function (el) {
      // ...
    }
  };
};
```
<template v-slot:caption>
modules/collapse-widget/ui/src/index.js
</template>
</AposCodeBlock>

With some code to manage showing and hiding the detail, it would look like:
<AposCodeBlock>

```javascript
export default () => {
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
};
```
<template v-slot:caption>
modules/collapse-widget/ui/src/index.js
</template>
</AposCodeBlock>

[Credit goes to Heydon Pickering](https://inclusive-components.design/collapsible-sections/) for the accessible collapsible example.

### Using widget data in players

Widget players do not have direct access to any *widget data*. If we want to use widget data in the player, we need to pass it in.

Template files on the other hand, *do* have access to widget data (they are rendered on the server). One good way to use data in a widget player is to insert it as a data attribute value in the template. The player can then look for that data attribute.

For example, we could change our collapse widget to include a `color` field value:

<AposCodeBlock>

``` nunjucks
<section data-collapser data-color="{{ data.widget.color }}" class="collapser">
  {# The rest of the code is the same... #}
</section>
```
<template v-slot:caption>
modules/collapse-widget/views/widget.html
</template>
</AposCodeBlock>

We've added the `data-color` attribute to the widget wrapper with our color data. Then in the player code we could get the value with the wrapper element's `dataset` property.

<AposCodeBlock>

```javascript
export default () => {
  apos.util.widgetPlayers.accordion = {
    selector: '[data-collapser]',
    player: function (el) {
      const color = el.dataset.color || 'purple'
      // The rest of the code is the same...
    }
  };
};
```
<template v-slot:caption>
modules/collapse-widget/views/widget.html
</template>
</AposCodeBlock>

The player *does* have access to the widget's wrapping element, so we use `el.dataset.color` to access the color data we stored on `data-color`.

::: tip
We can pass a string, number, or boolean value with a data attribute using the method shown above. If the value we need to use in the widget player is an array or object, it will need to become a properly escaped string first. Use the `jsonAttribute` template filter to do this.

``` nunjucks
<div data-config="{{ data.piece.someObjectOrArray | jsonAttribute }}"></div>
```

The value will be converted to a JSON string and escaped. The original value can be retrieved in the player with `JSON.parse`.
:::
