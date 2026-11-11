---
extends: '@apostrophecms/module'
---

# `@apostrophecms/widget-type`

<AposRefExtends :module="$frontmatter.extends" />

This module is the foundation for all widget types in Apostrophe, including the [core widgets](../../guide/core-widgets.md) as well as [custom widgets](../../guide/custom-widgets.md). It is not typically configured or referenced in project code directly since each widget type should be managed independently in most cases. For example, the options documented below would be configured on a custom widget type, e.g., `article-widget`, rather this widget type base module.

The only reason to configure this module directly would be to apply the changes to *every* widget type, including those in Apostrophe core (e.g., `@apostrophecms/image-widget`).

### `widgetOperations`

This configuration cascade adds operations to the controls editors see when they select a widget on the page. An operation opens a modal or emits an action. It can appear in the widget toolbar, in the breadcrumb above the widget, or in both, and it can depend on the widget's data and the user's permissions.

The `widgetOperations` cascade is a function that takes `self` and `options` as parameters and returns an object. Add operations with the `add` key:

```javascript
widgetOperations(self, options) {
  return {
    add: {
      operationName: {
        label: 'Label text or i18n key',     // Text for the operation
        icon: 'icon-name',                   // A registered icon
        modal: 'ComponentName',              // Modal to open, or use `action`
        tooltip: 'Tooltip text or i18n key', // Text shown on hover

        // Also offer it when several widgets are selected
        multiple: true,

        // Conditional display based on widget state
        if: {
          // MongoDB-style query conditions against the widget
          'fieldName': value,              // Simple equality check
          'nestedField.0': { $exists: true }, // Check if field exists
          'someField': { $ne: 'value' },   // Not equal check
          '$or': [                         // Logical OR
            { condition1: value1 },
            { condition2: value2 }
          ],
          '$and': [                        // Logical AND
            { condition1: value1 },
            { condition2: value2 }
          ]
        },

        // Conditional display based on user permissions
        permission: {
          action: 'edit|delete|publish|view', // Required permission action
          type: 'article|page|etc'            // Document type the permission applies to
        }
      }
    }
  };
}
```

#### Operation properties

| Property | Type | Description |
|---|---|---|
| `label` | String | The operation's text or i18n key. Also used as the tooltip when `tooltip` is not set. Required with `secondaryLevel: true`. |
| `icon` | String | The name of a registered icon. Required, except with `secondaryLevel: true` or a breadcrumb `type`. |
| `modal` | String | The name of a modal component to open. See [Modal operations](#modal-operations). |
| `action` | String | An event to emit on `apos.bus` when the operation has no `modal`. See [Action operations](#action-operations). |
| `tooltip` | String | Text or i18n key shown on hover. |
| `if` | Object | Conditions on the widget's data, using the same syntax as a schema field's `if`. The operation appears only when they match. |
| `permission` | Object | An object with `action` and `type` properties, such as `{ action: 'edit', type: 'article' }`. The operation appears only for users with that permission. |
| `placement` | String | Where the operation appears: `'standard'` (the widget toolbar, the default), `'breadcrumb'`, or `'all'` (both). |
| `type` | String | `'info'` shows a non-interactive item in the breadcrumb. `'switch'` shows a two-choice toggle in the breadcrumb. `'menu'` shows a button that opens `modal` inline. |
| `choices` | Array | For `type: 'switch'`, exactly two `{ label, value }` objects. The selected `value` is set on the widget. |
| `secondaryLevel` | Boolean | If `true`, the operation appears in the toolbar's "more" menu instead of as a button. Standard placement only. |
| `rawEvents` | Array | DOM event names, such as `'mouseover'`, that are forwarded as the operation's `action`. Breadcrumb placement only, with `action` and no `type`. See `@apostrophecms/layout-widget` for an example. |
| `ignoreResult` | Boolean | If `true`, the modal's result does not replace the widget. |
| `multiple` | Boolean | If `true`, the operation is also offered when several widgets are selected. See [Operations on several widgets](#operations-on-several-widgets). |

Each toolbar operation needs either `modal` or `action`.

Apostrophe validates operations at startup and throws an error if:

- `type: 'switch'`, `type: 'info'` or `rawEvents` is used without `placement: 'breadcrumb'`.
- A `switch` operation does not have exactly two `choices`.
- An `info` operation has a `modal`.
- A `menu` operation has no `modal`.
- `multiple` is not a boolean.
- `multiple: true` is combined with `placement: 'breadcrumb'` or `type: 'menu'`.

#### Modal operations

When an editor clicks an operation that has a `modal` for one widget, the modal receives these props:

```javascript
{
  widget,        // The current widget
  widgetSchema,  // The schema for the widget
  widgetOptions, // The area's options for this widget type
  widgets        // Only with `multiple: true`: [ { widget, widgetSchema, widgetOptions } ]
}
```

Operations in the breadcrumb receive only `widget` and `widgetSchema`.

To update the widget from your modal, emit a `modal-result` event before closing:

```javascript
// Inside your modal component, emit the updated widget
this.$emit('modal-result', widgetData);
```

Note the following important considerations:

  - The widget's `type` and `_id` properties must not be changed.
  - If the modal closes without emitting a `modal-result` event, the original widget remains unchanged.
  - If the operation sets `ignoreResult: true`, the result does not replace the widget.

#### Action operations

An operation with an `action` and no `modal` emits that action on `apos.bus`. For one widget, the payload is `{ widgetId, index }`. With `multiple: true`, the payload also includes `widgetIds: [ widgetId ]`. Breadcrumb operations also include a `data` property, which holds the switch value or the raw DOM event.

```javascript
apos.bus.$on('my-widget-action', ({ widgetId, index }) => {
  // Act on the widget
});
```

#### Operations on several widgets

Editors can select several widgets in the same area. Selected widgets are always siblings in one area. While several widgets are selected, the toolbar offers an operation only if it sets `multiple: true`, every selected widget's type defines it, and every selected widget passes its `if`.

The built-in up, down, remove, cut, copy and duplicate operations set `multiple: true`. Edit and Styles act on one widget at a time.

When the operation runs on several widgets:

- **Modal operations** receive only `widgets`, an array of `{ widget, widgetSchema, widgetOptions }` in document order. There is no `widget` prop. To update the widgets, the result must be an array of widgets. Each one replaces the selected widget with the same `_id`. All of the replacements form one undo step. `ignoreResult` works the same way as for one widget.
- **Action operations** are emitted once with only `{ widgetIds }`, in document order. There is no `widgetId` or `index`.

Since an operation with `multiple: true` receives `widgets` or `widgetIds` for one widget too, a single modal or listener can handle both cases. Return a widget when the modal received one, and an array when it received several:

```javascript
// Inside a modal for an operation with `multiple: true`
const updated = this.widgets.map(({ widget }) => ({
  ...widget,
  highlighted: true
}));
this.$emit('modal-result', this.widget ? updated[0] : updated);
```

```javascript
apos.bus.$on('my-widget-action', ({ widgetIds }) => {
  // Same code for one widget or several
});
```

::: info Browser code and multiple selection
- Keyboard shortcuts registered with [`requireWidgetFocus: true`](../../guide/command-menu.md#registering-shortcut-commands) still run while several widgets are selected, but `focusedWidget` is only the last-clicked widget. To act on every selected widget, read the selection from the widget store.
- The widget store, imported with `import { useWidgetStore } from 'Modules/@apostrophecms/ui/stores/widget.js'`, has `selectedWidgetIds` with the ids of the selected widgets. `focusedWidget` is the primary, last-clicked widget. `setWidgetSelection({ selectedWidgetIds }, { primaryId, areaId })` replaces the selection.
- The widget clipboard can hold several widgets. Use `apos.area.widgetClipboard.getMany()` and `apos.area.widgetClipboard.setMany(widgets)` to read and write all of them. `get()` returns only the first widget, and `set(widget)` stores one widget.
:::

**Example:**

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Image'
  },
  widgetOperations(self, options) {
    const {
      relationshipEditor = 'AposImageRelationshipEditor',
      relationshipEditorLabel = 'apostrophe:editImageAdjustments',
      relationshipEditorIcon = 'image-edit-outline'
    } = options.apos.image.options || {};

    return {
      add: {
        adjustImage: {
          label: relationshipEditorLabel,
          icon: relationshipEditorIcon,
          modal: relationshipEditor,
          tooltip: relationshipEditorLabel,
          if: {
            '_image.0': {
              $exists: true
            }
          }
        }
      }
    };
  }
}
```
  <template v-slot:caption>
    modules/@apostrophecms/image-widget/index.js
  </template>
</AposCodeBlock>

This example adds an "Adjust Image" operation to the image widget's context menu that appears only when an image has been selected, and opens a modal for editing image adjustments when clicked.

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
| [`preview`](#preview) | Boolean | Allow for in-context preview during widget edit. |
| [`scene`](#scene) | String | **Deprecated.** Can specify that this widget type requires logged-in assets. |
| [`template`](#template) | String | The template name to render. |
| [`titleField`](#titlefield) | String | The field whose text names a widget of this type in the Document Versions change list. |
| [`versionsRender`](#versionsrender) | Boolean | Pass the previous version of a changed widget to its template in the Document Versions modal. |
| [`versionsRenderDeleted`](#versionsrenderdeleted) | Boolean | Set to `false` so a deleted widget of this type is not shown in place in the Document Versions modal. |
| [`width`](#width) | String | Define the size of the widget modal. Defaults to `window`. Can also accept `one-third`, `two-thirds`, `half`, and `full` |
| [`origin`](#origin) | String | Define the position of the widget modal (left or right). |
| `hideSingleTab` | Boolean | If `true` and an editing modal only has a single tab, that tab will be hidden. |

### `className`

All of the core widget type modules of Apostrophe, such as `@apostrophecms/image`, will apply the class name set by this option to their outer wrapper element if configured for that widget type module and not overridden when the widget is configured as part of an area. Since Apostrophe is unopinionated on the front end, there is no default value.

Custom widgets have no default template, but may choose to support the same pattern:

```jsx
/* in a custom widget.jsx file */
export default function({ options, manager }) {
  const className = options.className || manager.options.className;

  return (
    <div className={className}>
      ...
    </div>
  );
}
```

There is no need to guard the attribute the way the Nunjucks version did. A prop whose value is `null` or `undefined` is omitted from the rendered element entirely, so an unset `className` produces a bare `<div>`.

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

This option specifies an array of widget types that should never be loaded recursively by this widget type. While documents that contain those widget types might be loaded by relationships, additional relationships within those widget types will not be loaded. This can be a helpful guard against runaway recursion and the associated performance hit. There is no default because the default setting of [`neverLoadSelf`](#neverloadself) solves the runaway recursion problem for most widgets. However this option can further improve performance if certain widget types have relationships of their own, might be present via relationships specified for this widget, and are not necessary to present this widget.

### `neverLoadSelf`

If this option is set to `true`, and the widget has relationships with documents that contain more widgets of the **same** type, those widgets will **not** load their own relationships. This option defaults to `true`, which is an effective guard against runaway recursion and performance problems. Disabling this option should be done with care to ensure infinite loops do not become possible when loading the page.

### `preview`

Defaults to true. When set to true, widgets update in real time as edits are made, helping editors immediately see their impact. Note that new widgets will not appear until all required fields are completed. The editing modal will attempt to open without overlapping the widget, automatically positioning itself to the left or right as needed.

Setting this option globally enables the behavior for all widgets. To enable or disable it for specific widgets only, set the option in the individual widget module at project level.

### `scene`

**Deprecated.** If this option is set to `user`, Apostrophe will load all of the JavaScript associated with the logged-in editing experience when this widget type is present. Since the admin UI is primarily designed for editors and not for the fast page load time, we do not recommend this approach and may remove this option in a future release of ApostropheCMS. By default this option is not set.

### `template`

The name of the template in the `views` folder of the module that should be rendered to display the widget. This option defaults to `widget`, and it is generally not necessary to change it.

### `titleField`

The name of a field of this widget type, such as `'heading'`, whose text identifies a widget in the Document Versions change list. Dot notation is accepted for fields inside an `object` field. Without it, widgets of the same type are told apart only by position. There is no default.

See [Showing version changes in widgets](/guide/showing-version-changes.md#titlefield-name-your-widgets).

### `versionsRender`

When `true`, a widget of this type that changed in the version being viewed in the Document Versions modal receives the widget as it was in the previous version, as `widget._olderVersion`. The template can use it to show what changed. Without this option, a changed widget renders as usual, framed as Modified. Defaults to `false`, except for `@apostrophecms/rich-text-widget`, which sets it and marks changed words in its content automatically.

See [Showing version changes in widgets](/guide/showing-version-changes.md#versionsrender-show-what-changed-in-your-template).

### `versionsRenderDeleted`

Defaults to `true`: when a version deleted a widget of this type, the Document Versions modal shows it in its old position, marked as deleted. Set it to `false` for a widget type that positions itself within its parent's layout, where a deleted widget shown in place would overlap the others. The widget that contained it is then marked as modified instead, or, if there is none, the document field. `@apostrophecms/layout-column-widget` sets it to `false`.

See [Widgets that are not shown when deleted](/guide/showing-version-changes.md#widgets-that-are-not-shown-when-deleted).

### `width`

The size of the widget modal can be configured via this option:
- `"window"` (default): the widget modal will be a floating window that be moved and resized.
- `"one-third"`: the widget modal width is set to 540px.
- `"half"`: the widget modal takes 50% of the screen.
- `"two-thirds"`: the widget modal takes 66% of the screen.
- `"full"`: the widget modal takes 100% of the screen.

Any other value will not impact the width of the modal, resulting in keeping the default width.

No matter what, the widget modal width will take 100% of the screen for screens with a width below 800px.

### `origin`

Choose the side from where the widget modal will open. If left unset (default) Apostrophe will make a best guess based on the position of the widget on the page. If the widget appears in the left half of the screen, the widget modal is positioned on the right, and vice-versa. Also accepts `left` or `right`.

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

Apostrophe invokes this method to render the widget. In most cases it is best to provide a `widget.jsx` template and rely on the default implementation of this method. However it is possible to override this method to render a widget in an entirely different way. The method must return a string of markup already marked as safe. If a custom implementation builds its markup without a template then it may be returned as safe with the following code:

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

As an alternative, consider invoking [async components](../../guide/async-components.md) from `widget.jsx`. Async components are easier to understand and will run only if the template elects to call them in a particular case, which can sometimes be more efficient.

## Module tasks

### `list`

Full command: `node app [widget-type-module-name]:list`

This task generates a list of documents that contain the widget type in question, along with a "dot path" to the widget within the document. It is intended as a debugging tool. For instance:

```bash
node app @apostrophecms/rich-text-widget:list
```

Will list all of the rich text widgets on the site.

