---
extends: '@apostrophecms/module'
---

# `@apostrophecms/widget-type`

<AposRefExtends :module="$frontmatter.extends" />

This module is the foundation for all widget types in Apostrophe, including the [core widgets](../../guide/core-widgets.md) as well as [custom widgets](../../guide/custom-widgets.md). It is not typically configured or referenced in project code directly since each widget type should be managed independently in most cases. For example, the options documented below would be configured on a custom widget type, e.g., `article-widget`, rather this widget type base module.

The only reason to configure this module directly would be to apply the changes to *every* widget type, including those in Apostrophe core (e.g., `@apostrophecms/image-widget`).

## Options

::: note
These are options to *the module itself*, so they apply to *every* instance of the widget. They are separate from the options that can be passed when adding the widget to an area field, and from the template options that be passed via the `with` keyword when inserting an area in a template.

|  Property | Type | Description |
|---|---|---|
| [`className`](#class-name) | String | Core widgets apply it to themselves if set. |
| [`components`](#components) | Object | Vue components to be used when editing. |
| [`contextual`](#contextual) | Boolean | The widget is edited directly on the page, not in a modal. |
| [`defaultData`](#default-data) | Any | Default value of a contextual widget. |
| [`deferred`](#deferred) | Boolean | This widget type should load last. |
| [`icon`](#icon) | String | Icon name. |
| [`label`](#label) | String | Identifies this widget in a list of widget types. |
| [`neverLoad`](#never-load) | Array | Widget types never loaded recursively by this widget. |
| [`NeverLoadSelf`](#never-load-self) | Boolean | The widget should never recursively load itself. |
| [`scene`](#scene) | String | Can specify that this widget type requires logged-in assets. |
| [`template`](#template) | String | The Nunjucks template name to render. |

### `className`

All of the core widget type modules of Apostrophe, such as `@apostrophecms/image`, will apply the class name set by this option to their outer wrapper element if configured for that widget type module and not overridden when the widget is configured as part of an area. Since Apostrophe is unopinionated on the front end, there is no default value.

Custom widgets have no default template, but may choose to support the same pattern:

```django
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

### `contextual`

When the `contextual` option is set to `true`, an edit button is not displayed for the widget, and the widget is not edited in a dialog box according to a schema of fields. Instead, the widget is edited directly on the page.

To support this, the widget must implement the [contextual editing pattern](../../guide/editing-custom-widgets-in-context.md).
