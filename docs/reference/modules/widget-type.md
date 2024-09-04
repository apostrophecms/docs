---
extends: '@apostrophecms/module'
---

# `@apostrophecms/widget-type`

<AposRefExtends :module="$frontmatter.extends" />

This module is the foundation for all widget types in Apostrophe, including the [core widgets](../../guide/core-widgets.md) as well as [custom widgets](../../guide/custom-widgets.md). It is not typically configured or referenced in project code directly since each widget type should be managed independently in most cases. For example, the options documented below would be configured on a custom widget type, e.g., `article-widget`, rather this widget type base module.

The only reason to configure this module directly would be to apply the changes to *every* widget type, including those in Apostrophe core (e.g., `@apostrophecms/image-widget`).

## Options

::: info
These are options to *the module itself*, so they apply to *every* instance of the widget. They are separate from the options that can be passed when adding the widget to an area field, and from the template options that be passed via the `with` keyword when inserting an area in a template.
:::

|  Property | Type | Description |
|---|---|---|
| [`className`](#classname) | String | Core widgets apply it to themselves if set. |
| [`components`](#components) | Object | Vue components to be used when editing. |
| [`contextual`](#contextual) | Boolean | The widget is edited directly on the page, not in a modal. |
| [`defaultData`](#defaultdata) | Any | Default value of a contextual widget. |
| [`deferred`](#deferred) | Boolean | This widget type should load last. |
| [`icon`](#icon) | String | Icon name. |
| [`initialModal`](#initialmodal) | Boolean | Determine whether to display modal when added to page. |
| [`label`](#label) | String | Identifies this widget in a list of widget types. |
| [`neverLoad`](#neverload) | Array | Widget types never loaded recursively by this widget. |
| [`neverLoadSelf`](#neverloadself) | Boolean | The widget should never recursively load itself. |
| [`scene`](#scene) | String | **Deprecated.** Can specify that this widget type requires logged-in assets. |
| [`template`](#template) | String | The Nunjucks template name to render. |
| [`width`](#width) | String | Define the size of the widget modal. |
| [`origin`](#origin) | String | Define the position of the widget modal (left or right). |

### `className`

All of the core widget type modules of Apostrophe, such as `@apostrophecms/image`, will apply the class name set by this option to their outer wrapper element if configured for that widget type module and not overridden when the widget is configured as part of an area. Since Apostrophe is unopinionated on the front end, there is no default value.

Custom widgets have no default template, but may choose to support the same pattern:

``` nunjucks
{# in a custom widget.html file #}

{% if data.options.className %}
  {% set className = data.options.className %}
{% elif data.manager.options.className %}
  {% set className = data.manager.options.className %}
{% endif %}
<div {% if className %} class="{{ className }}"{% endif %}>
  ...
</div>
```

### `components`

If present, the `components` option must be an object and is consulted to determine the name of the Vue component to be used for editing, via its `widgetEditor` subproperty. If the `contextual` option is set to `true`, then the component must implement the [contextual editing pattern](../../guide/editing-custom-widgets-in-context.md). Otherwise it must implement a modal dialog box implementing the same pattern as the standard widget editor dialog box (the `AposWidgetEditor` Vue component), which is usually not necessary as it is simpler to add existing and custom schema fields to be displayed by the existing dialog box.

### `contextual`

When the `contextual` option is set to `true`, an edit button is not displayed for the widget, and the widget is not edited in a dialog box according to a schema of fields. Instead, the widget is edited directly on the page.

To support this, the widget must implement the [contextual editing pattern](../../guide/editing-custom-widgets-in-context.md).

Defaults to `false`.

### `defaultData`

The `defaultData` option may contain an object providing defaults for contextually edited widgets. This is required for contextually edited widgets because they do not always use the `fields` section. Normal widgets that use the usual dialog box to edit schema fields may rely on the `def` property of each field instead. There is no default value.

### `deferred`

Widget types may contain `relationship` and `relationshipReverse` fields that load other documents. By default this is done in the order the widgets are encountered when loading the page, with requests relating to the same type of widget grouped together for performance. This is a recursive process. Widget types that specify `deferred: true` will resolve their "loaders" at the very end of the process, after all other widget types and their relationships have been recursively loaded. This is beneficial for widget type modules like `@apostrophecms/image-widget` because they can be efficiently grouped together in a single database call. Defaults to `false`.

### `icon`

The name of the icon to be displayed for this widget type in a menu of widget types. This icon name must correspond to an icon loaded via [the `icons` module section](/reference/module-api/module-overview.md#icons). If not configured the widget type is listed without an icon.

### `initialModal`

The `initialModal` option is set to `true` by default. If set to `false`, it will prevent the initial modal from opening when a widget is added to the area.

### `label`

The label to be displayed for the icon in a menu of widget types and in certain other contexts in the UI. This should be brief but informative and should be capitalized, like `Slideshow`. By default it is derived from the module name, but we recommend configuring an explicit label.

### `neverLoad`

This option specifies an array of widget types that should never be loaded recursively by this widget type. While documents that contain those widget types might be loaded by relationships, additional relationships within those widget types will not be loaded. This can be a helpful guard against runaway recursion and the associated performance hit. There is no default because the default setting of [`neverLoadSelf`](#never-load-self) solves the runaway recursion problem for most widgets. However this option can further improve performance if certain widget types have relationships of their own, might be present via relationships specified for this widget, and are not necessary to present this widget.

### `neverLoadSelf`

If this option is set to `true`, and the widget has relationships with documents that contain more widgets of the **same** type, those widgets will **not** load their own relationships. This option defaults to `true`, which is an effective guard against runaway recursion and performance problems. Disabling this option should be done with care to ensure infinite loops do not become possible when loading the page.

### `scene`

**Deprecated.** If this option is set to `user`, Apostrophe will load all of the JavaScript associated with the logged-in editing experience when this widget type is present. Since the admin UI is primarily designed for editors and not for the fast page load time, we do not recommend this approach and may remove this option in a future release of ApostropheCMS. By default this option is not set.

### `template`

The name of the template in the `views` folder of the module that should be rendered to display the widget. This option defaults to `widget`, and it is generally not necessary to change it.

### `width`

The size of the widget modal can be configured via this option:
- `undefined` (default): the widget modal width is set to 540px.
- `"half"`: the widget modal takes 50% of the screen.
- `"two-thirds"`: the widget modal takes 66% of the screen.
- `"full"`: the widget modal takes 100% of the screen.

Any other value will not impact the width of the modal, resulting in keeping the default width.

No matter what, the widget modal width will take 100% of the screen for screens with a width below 800px.

### `origin`

Choose the side from where the widget modal will open:
`left` or `right` (default).

## Related documentation

- [Core widgets](/guide/core-widgets.md)
- [Custom widgets](/guide/custom-widgets.md)

## Featured methods

### `getBrowserData(req)`

This method returns an object of properties to be exposed on the browser side. If the module name is `hero-widget`, then this data is exposed as `window.apos.modules['hero-widget']`.

Since the default implementation exposes essential information, always use `extendMethods` to extend it, like this:

``` js
extendMethods(self) {
  return {
    getBrowserData(_super, req) {
      return {
        ..._super(req),
        newProperty: value
      };
    }
  };
}
```

### `async output(req, widget, options, _with)`

Apostrophe invokes this method to render the widget. In most cases it is best to provide a `widget.html` template and rely on the default implementation of this method. However it is possible to override this method to render a widget in an entirely different way. The method must return a string of markup already marked as safe. If a custom implementation does not use Nunjucks then it may be returned as safe with the following code:

``` js
return self.apos.template.safe(string);
```

The `widget` argument contains the widget object with its schema fields, the `options` argument contains any options configured for this widget in the relevant `area` field, and the `_with` argument contains any template-level options passed via the `with` keyword.

### `addSearchTexts(widget, texts)`

This method is called to make the text of the widget available to Apostrophe's built-in search features. If the widget relies on schema fields for its content then it should not be necessary to override this method. However widget type modules like `@apostrophecms/rich-text-widget` that do not use fields will need to provide their own implementation, like this:

``` js
methods(self) {
  return {
    addSearchTexts(item, texts) {
      texts.push({
        weight: 10,
        text: self.apos.util.htmlToPlaintext(item.content),
        silent: false
      });
    }
  };
}
```

Currently texts with weights greater than `10` are available as part of `autocomplete` search, which affects the "Manage Pieces" dialog box. Texts marked `silent` impact search results but are not included in the `searchSummary` property of the overall document.

### `sanitize(req, input, options)`

When the user edits a widget and the browser attempts to save that change, Apostrophe invokes this method to sanitize the user input. If the widget relies on schema fields, it is usually not necessary to override this method. It is most often overridden in modules like `@apostrophecms/rich-text-widget` that have special needs like sanitizing HTML markup. This method receives the Express request (`req`), an object representing a new value for the widget which contains untrusted data from the user (`input`), and the options configured for this widget type in the relevant `area` field (`options`). The return value must be an object and is stored as the new value of the widget, along with certain automatically-supplied properties like `type` and `_id` that this method does not need to concern itself with.

### `load(req, widgets)`

::: tip
**The standard version of this method always automatically loads any `relationship` fields defined in your widget's schema.** You **do not** need to implement a custom `load` method to load relationship fields. Overriding this method is to be considered only when you want something unusual to happen, beyond loading ordinary relationships. If you don't see the data you are expecting for nested relationships, you may need to configure the [`withRelationships`](../field-types/relationship.md#populating-nested-relationships-using-withrelationships) property of your widget's `relationship` fields.
:::

Apostrophe invokes the `load` method to load or compute any additional, dynamic properties of the widget on the fly. To create an opportunity for optimizations, the method is passed an array which may contain any number of widgets of this module's type.

Those choosing to override the method to perform additional loading of another kind should use `extendMethods` to invoke the original version as well, unless `relationship` and `reverseRelationship` fields are guaranteed to be absent.

A useful extension of the `load` method might look like:

```javascript
fields: {
  add: {
    zip: {
      type: 'string',
      label: 'Zip Code',
      required: true
    },
    // Other fields may appear here, including relationship fields
  }
},
extendMethods(self) {
  return {
    load(_super, req, widgets) {
      // Call the original, otherwise we get no relationship fields
      await _super(req, widgets);
      for (const widget of widgets) {
        widget._weather = await self.fetchWeather(req, widget);
      }
    }
  }
},
methods(self) {
  return {
    async fetchWeather(req, widget) {
      const result = await fetch('https://query-a-weather-api-somewhere.com?' + new URLSearchParams({
        zip: widget.zip
      });
      return result.json();
    }
  }
}
```

Custom reimplementations that do not have any special optimizations for more than one widget in the array must still take care to loop over `widgets` and load appropriate data for all of them.

There is no return value. The related documents are attached to the widget objects via temporary properties (properties whose names start with `_`, which tells Apostrophe that they should not be stored back to the database at save time).

As an alternative, consider invoking [async components](../../guide/async-components.md) from `widget.html`. Async components are easier to understand and will run only if the template elects to call them in a particular case, which can sometimes be more efficient.

## Module tasks

### `list`

Full command: `node app [widget-type-module-name]:list`

This task generates a list of documents that contain the widget type in question, along with a "dot path" to the widget within the document. It is intended as a debugging tool. For instance:

```bash
node app @apostrophecms/rich-text-widget:list
```

Will list all of the rich text widgets on the site.
