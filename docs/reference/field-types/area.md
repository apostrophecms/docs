# `area`

An `area` field allows editors to add, edit, and arrange a series of [widgets](/reference/glossary.md#widget). The properties configured in `options` specify the allowed widget types and the configuration for those widgets.

## Module field definition

```javascript
// Configuring the `main` area field in a module's `fields.add` subsection:
main: {
  label: 'Main column',
  type: 'area',
  options: {
    widgets: {
      '@apostrophecms/rich-text': {}
    }
  }
}
```

## Settings

### Required

|  Property | Type | Default | Description |
|---|---|---|---|
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`area` for this type) |
|`options` | Object | n/a | An object containing widget configuration. See below. |

### Optional

|  Property | Type | Default | Description |
|---|---|---|---|
|`required` | Boolean | `false` | If true, the field is mandatory. |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup | universal |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | `boolean` | false | If true, it will prevent the field from appearing in a dialog box | -->
<!-- |readOnly | `boolean` | false | If true, prevents the user from editing the field | | -->

## `options`

Area inputs have additional settings configured in an `options` object:

### `max`
- **Type:** integer

The maximum number of widgets allowed in the area.

```javascript
add: {
  main: {
    label: 'Main column',
    type: 'area',
    options: {
      max: 1, // 👈 Limits the area to a single image widget.
      widgets: {
        '@apostrophecms/image': {}
      }
    }
  }
}
```

### `widgets`
- **Type:** object

Widgets names are added as keys to the `widgets` object, with their individual configurations (if needed) as the key value objects.
**Note:** widget keys in area configuration are their associated module names minus the `-widget` suffix (e.g., `'callout-widget'` is configured as simply `'callout'`). Since all widget module names end with that suffix, it is not required for less repetition.

Configuring a widget type in an area field applies that configuration to the widget type _only in this area's context_. So a rich text widget with configured toolbar and styles in the area field would not automatically apply to a rich text widget in a different area field. (Though some widgets, including the core rich text widget, may support default configurations.)

```javascript
add: {
  main: {
    label: 'Main column',
    type: 'area',
    options: {
      // Configuring four widget types as options in this area,
      // one of which has its own configuration when used in this
      // specific area. ⬇
      widgets: {
        '@apostrophecms/image': {},
        '@apostrophecms/rich-text': {
          toolbar: [ 'bold', 'italic' ]
        },
        '@apostrophecms/video': {},
        '@apostrophecms/html': {}
      }
    }
  }
}
```

## Use in templates

Use the `area` template tag with arguments for the context and the name of the area field in that context:

```
{% area context, area-name %}
```

The "context" may be a page, piece, widget, or [array field](/reference/field-types/array.md) item, as referenced in the template. All configuration from the field definition is applied automatically from the relevant schema configuration.

```django
<!-- Inserting the `main` area field for a page. -->
<section>
  {% area data.page, 'main' %}
</section>
<!-- Inserting the `photo` area field for array items. -->
<div>
  {% for item in data.page.photos %}
    {% area item, 'photo' %}
  {% endfor %}
</div>
```

## More information

[Changes from 2.x](/guide/major-changes.md#areas-and-pages)
