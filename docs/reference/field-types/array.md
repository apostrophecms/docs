# `array`

An `array` field has its own [field schema](/reference/glossary.md#schema) and allows the user to add one or more entries that use the fields in that schema. The overall field is stored in the database as an array of an object for each entry.

This is useful for collections of structured data that clearly belong to a parent document but won't have relationships to other documents, such as multiple sets of contact information for business locations or tabs in a widget.

See the [relationship](relationship.md) field if you exclusively, or primarily, need to identify a series of other pieces or pages.

## Module field definition

```javascript
// Configuring the `contactInfo` array field in a module's `fields.add` subsection:
contactInfo: {
  label: 'Contact information',
  type: 'array',
  titleField: 'city',
  fields: {
    add: {
      city: {
        type: 'string',
        label: 'City'
      },
      email: {
        type: 'email',
        label: 'Email address'
      }
    }
  }
}
```

## Settings

### Required

|  Property | Type | Default | Description |
|-----------|-----------|-----------|-----------|
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`array` for this type) |
|`fields` | Object | n/a | The field schema for the array items. See below. |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`def` | Array | n/a | The default value for the field. It must comply with the array fields schema. |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`requiredIf` | Object | `{}` | Conditions to meet before the field is required. [See the guide for details.](/guide/conditional-fields) |
|`hidden` | Boolean | `false` | If `true`, the field is hidden |
| [`inline`](#inline) | Boolean | false | If `true`, array fields are edited inline with others, not in a separate dialog box. |
|`duplicate` | Boolean |  `true` | Only applied to inline arrays. If `true`, array element's context menu has a Duplicate action |
|`style` | String |  n/a | Only if `inline` is true. If set to `table`, the schema will be displayed as an HTML table |
|`min` | Integer |  n/a | The minimum number of entries required in the array |
|`max` | Integer |  n/a | The maximum number of entries allowed in the array |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value
|`titleField` | String |  n/a | The name of one of the array schema fields. If provided, the user interface will use the value of that field as a label for the array tabs. |
|`draggable` | Boolean | true | If `false`, array items cannot be reordered using drag and drop feature. |
|[`whenEmpty`](#whenempty) | Object | Yes | Provide a custom `label` and `icon` to be displayed if an array is empty. |

::: tip NOTE
- If there is no `titleField` value, the items are numbered.
- Setting `titleField` is recommended to improve clarity for content editors.
- `titleField` can access `relationship` sub-field documents by using dot notation (e.g., `_team[0].mascot`).
:::

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | `false` | If `true`, it will prevent the field from appearing in the editor modal | -->

### `inline`

Set `inline: true` on an array field to edit the array inline with the rest of the fields, rather than in a separate dialog box. This works best with a small number of fields in the array.

Care should be taken when using `style: table` along with conditional fields. In general, conditional fields should "switch" between two fields that have the same label in order to maintain the table structure. For example:

<AposCodeBlock>

```javascript
...
  inlineArrayTableField: {
    label: 'Dessert Table',
    itemLabel: 'Dessert Item',
    type: 'array',
    inline: true,
    style: 'table',
    fields: {
    add: {
      brand: {
        type: 'string',
        label: 'Brand',
        required: true
      },
      dessertType: {
        type: 'select',
        label: 'Dessert Type',
        choices: [
          {
            label: 'Ice Cream',
            value: 'iceCream'
          },
          {
            label: 'Sorbet',
            value: 'sorbet'
          }
        ],
        def: 'iceCream'
      },
      iceCream: {
        type: 'select',
        label: 'Flavor',
        choices: [
          {
            label: 'Cherry',
            value: 'cherry'
          },
          {
            label: 'Raspberry',
            value: 'raspberry'
          }
        ],
        if: {
          dessertType: 'iceCream'
        },
        def: 'cherry',
        required: true
      },
      sorbet: {
        type: 'select',
        label: 'Flavor',
        choices: [
          {
            label: 'Orange',
            value: 'orange'
          },
          {
            label: 'Ginger',
            value: 'ginger'
          }
        ],
        if: {
          dessertType: 'sorbet'
        },
        def: 'orange',
        required: true
      }
    }
  }
}
...
```
</AposCodeBlock>

In this example, the third field will "switch" between the ice cream flavors and the sorbet flavors. Not that the label, `Flavor`, is the same for both fields. This means that the label at the top of the table will not change if one item in the array selects ice cream and another selects sorbet.

### `whenEmpty`

If no array items have been added and the array has `inline: true`, the `whenEmpty` setting supplies an object consisting of a `label` and `icon` that are displayed to the editor until items are added. The `label` property takes a localizable string, while the `icon` property takes an icon that has already been [registered](https://github.com/apostrophecms/apostrophe/blob/main/modules/@apostrophecms/asset/lib/globalIcons.js) or is registered through a module [`icons` property](https://docs.apostrophecms.org/reference/module-api/module-overview.html#icons).
 
```javascript
{
  whenEmpty: {
    label: 'apostrophe:whemEmpty',
    icon: 'file-document-icon'
  }
}
```

- `label` is the label to display when the inline array is empty.
- `icon` is [configured in the `icons` module setting](/reference/module-api/module-overview.md#icons) in the example.

## Configuring the array field schema

Array field schemas are generally configured the same way as the module's overall field schema is configured. The module's schema is configured in its `fields` section's `add` subsection. Similarly, array field schema are configured in a `fields` property, using its `add` subproperty to configure the actual fields. Both use the field names as keys in the `add` object. Both can contain all field types, including nested `array` fields.

Array schema configuration differs from module schema configuration in that _array schemas_ do not use `group` or `remove` settings.

## Use in templates

Nunjucks provides the [`{% for %}` template tag](https://mozilla.github.io/nunjucks/templating.html#for) to loop over arrays. This is the most common way to traverse the `array` field data and sub-fields.

```nunjucks
<ul>
{% for contact in data.piece.contactInfo %}
  <li>{{ contact.city }}: {{ contact.email }}</li>
{% endfor %}
</ul>
```
