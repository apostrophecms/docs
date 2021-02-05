# `area`

An `area` field allowed editors to add, edit, and arrange a series of [widgets](/reference/glossary.md#widget). The properties configured in `options` specify the allowed widget types and the configuration for those widgets.

## Example

```javascript
// In a module's `field` option:
add: {
  main: {
    label: 'Main column',
    type: 'area',
    options: {
      widgets: {
        '@apostrophecms/rich-text': {}
      }
    }
  }
}
```
## Settings
|  Property | Type | Default | Description |
|---|---|---|---|
|label | string | | Sets the visible label for the field in the UI. |
|required | boolean | `false` | If true, the field is mandatory. |
|type | string | | Specifies the field type |
|help | string | | Help text for the content editor |
|htmlHelp | string | | Help text with support for HTML markup | universal |
|options | object | | An object containing widget configuration. See below. |

<!-- The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | `boolean` | false | If true, it will prevent the field from appearing in a dialog box | -->
<!-- |readOnly | `boolean` | false | If true, prevents the user from editing the field | | -->

## Area options

Area inputs have additional settings configured in an `options` object:

### `max`
- **Type:** integer

The maxiumum number of widgets allowed in the area.

```javascript
add: {
  main: {
    label: 'Main column',
    type: 'area',
    options: {
      max: 1, // ⬅ Limits the area to a single image widget.
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
          toolbar: [ 'styles', 'bold', 'italic' ],
          styles: [
            { tag: 'p', label: 'Paragraph (P)' },
            { tag: 'h2', label: 'Section heading' },
            { tag: 'h3', label: 'Sub-section heading' }
          ]
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

All configuration from the field definition is applied automatically.

```django
<!-- Inserting the `main` area field for a page. -->
<section>
  {% area data.page, 'main' %}
</section>
```

## More information

[Changes from 2.x](/guide/major-changes.md#areas-and-pages)