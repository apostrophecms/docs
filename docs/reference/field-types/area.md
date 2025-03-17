# `area`

An `area` field allows editors to add, edit, and arrange a series of [widgets](/reference/glossary.md#widget). There are two ways to configure an `area`. The first adds widgets to a pop-up list menu for the editor selection. For this configuration, widgets are added through a `widgets` property in the `options`. Alternatively, the expanded preview menu provides a fly-in menu that allows grouping and a visual preview of widgets. This is configured through a `groups` option in which each individual group takes a `widgets` property. 

## Module field definition

### Configuring an area for the pop-up list menu

```javascript
// Configuring a `main` area field in a `fields.add` subsection of a module:
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
### Configuring an area for the expanded preview menu

```javascript
// Configuring the `main` area field in a `fields.add` subsection of a module:
main: {
  label: 'Main column',
  type: 'area',
  options: {
    expanded: true,
    groups: {
      basics: {
        label: 'Basic Content',
        widgets: {
          '@apostrophecms/rich-text': {},
          '@apostrophecms/image': {}
        },
        columns: 2
      }
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
|`options` | Object | n/a | An object containing widget configuration. Contained within the individual groups for the expanded preview method. |

### Optional

|  Property | Type | Default | Description |
|---|---|---|---|
|`required` | Boolean | `false` | If true, the field is mandatory. |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`requiredIf` | Object | `{}` | Conditions to meet before the field is required. [See the guide for details.](/guide/conditional-fields) |
|`hidden` | Boolean | `false` | If `true`, the field is hidden |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | `boolean` | false | If true, it will prevent the field from appearing in a dialog box | -->
<!-- |readOnly | `boolean` | false | If true, prevents the user from editing the field | | -->

## `options`

Area inputs have additional settings configured in an `options` object.

|  Property | Type | Expanded menu only? | Description |
|---|---|---|---|
|`max`| Integer | No | Sets the maximum number of widgets allowed in the area. |
|`widgets`| Object | No | Takes widget names as keys and associated widget options as values. |
|`expanded`| Boolean | Yes | Activates the expanded widget preview menu. |
|`groups`| Object | Yes | Accepts an object composed of named group objects. |

### `max`

The maximum number of widgets allowed in the area.

**Example using the simple menu**

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

**Example using the expanded preview menu**

```javascript
add: {
  main: {
    label: 'Main column',
    type: 'area',
    options: {
      max: 1, // 👈 Limits the area to a single widget.
      expanded: true,
      groups: {
        basics: {
          label: 'Basic Content',
          widgets: {
            '@apostrophecms/rich-text': {},
            '@apostrophecms/image': {}
          },
          columns: 2
        }
      }
    }
  }
}
```

### `widgets`

Widgets names are added as keys to the `widgets` object, with their individual configurations (if needed) as the key value objects. This `widgets` object is added directly to the `options` for the pop-up list menu or within the named group objects in the [`groups` option](#groups) for the expanded preview menu.
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

### `groups`

The `groups` option takes an object and is used to organize widgets in the expanded preview menu. Each group of widgets is passed as a named object in the `groups` object. Each of the groups have three configuration settings - `label`, `widgets` and `columns`.

The `label` property takes a string that is displayed for the widget group in the menu.

The `widgets` property is configured just like the one for the simple pop-up menu. It takes an object containing the widget names as properties and any options as values.

The `columns` property takes an integer from 1-4 and defaults to 3. This determines how many widgets previews will be displayed per line.

**Example**

```javascript
add: {
  main: {
    label: 'Main column',
    type: 'area',
    options: {
      max: 3, // 👈 Limits the area to three total widgets.
      expanded: true,
      groups: {
        // Adding two groups of widgets to the menu
        basics: {
          label: 'Basic Content',
          // Configuring five widget types as options in this group,
          // one of which has its own configuration when used in this
          // specific area. ⬇
          widgets: {
            '@apostrophecms/image': {},
            '@apostrophecms/rich-text': {
              toolbar: [ 'bold', 'italic' ]
            },
            '@apostrophecms/video': {},
            '@apostrophecms/html': {},
            '@apostrophecms/svg-sprite': {}
          },
          // Configuring for 2 columns of widgets
          // This will result in 3 rows since there are 5 widgets
          columns: 2
        },
        layout: {
          lable: 'Layout Options',
          widgets: {
            'two-column': {},
            'three-column': {},
            'four-column': {}
          },
          // We don't have to add a column property if we want 3 columns
        }
      }
    }
  }
}
```

::: info
If you configure an area to use the expanded preview menu you can further customize how the widget is displayed through options in the individual [widget's configuration](/guide/areas-and-widgets.html). 
:::


## Use in templates

Use the `area` template tag with arguments for the context and the name of the area field in that context:

```
{% area context, area-name %}
```

The "context" may be a page, piece, widget, or [array field](/reference/field-types/array.md) item, as referenced in the template. All configuration from the field definition is applied automatically from the relevant schema configuration.

```nunjucks
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

::: info
For more information on how areas changed from Apostrophe 2, see the [Coming from 2.x](/guide/migration/upgrading.md#areas-and-pages) guide section on areas.
:::
