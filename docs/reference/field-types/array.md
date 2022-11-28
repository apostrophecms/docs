# `array`

An `array` field has its own [field schema](/reference/glossary.md#schema) and allows the user to add one or more entries that use the fields in that schema. The overall field is stored in the database as an array of an object for each entry.

This is useful for collections of structured data that clearly belong to a parent document but won't have relationships to other documents, such as multiple sets of contact information for business locations or tabs in a widget.

See the [relationship](relationship.md) field if you exclusively, or primarily, need to indentify a series of other pieces or pages.

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
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) | universal |
| [`inline`](#inline) | Boolean | false | If `true`, array field are edited inline with others, not in a separate dialog box. |
|`min` | Integer |  n/a | The minimum number of entries required in the array |
|`max` | Integer |  n/a | The maximum number of entries allowed in the array |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value
|`titleField` | String |  n/a | The name of one of the array schema fields. If provided, the user interface will use the value of that field as a label for the array tabs. |

::: tip NOTE
- If there is no `titleField` value, the items are numbered.
- Setting `titleField` is recommended to improve clarity for content editors.
- `titleField` can access `relationship` sub-field documents by using dot notation (e.g., `_team[0].mascot`).
:::

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | `false` | If `true`, it will prevent the field from appearing in the editor modal | -->

### `inline`

Set `inline: true` on an array field to edit the array inline with the rest of the fields, rather than in a separate dialog box. This works best with a small number of fields in the array.

You can also control whether each item has a toggle to expand it, or is always displayed in fully expanded form.

By default, if `inline: true` is set and there are fewer than three fields, each item is fully expanded. You can change this by explicitly setting the inline option to `inline: { alwaysExpand: false }` or `inline: { alwaysExpand: true }`.

## Configuring the array field schema

Array field schemas are generally configured the same way as the module's overall field schema is configured. The module's schema is configured in its `fields` section's `add` subsection. Similarly, array field schema are configured in a `fields` property, using its `add` subproperty to configure the actual fields. Both use the field names as keys in the `add` object. Both can contain all field types, including nested `array` fields.

Array schema configuration differs from module schema configuration in that _array schemas_ do not use `group` or `remove` settings.

## Use in templates

Nunjucks provides the [`{% for %}` template tag](https://mozilla.github.io/nunjucks/templating.html#for) to loop over arrays. This is the most common way to traverse the `array` field data and sub-fields.

```django
<ul>
{% for contact in data.piece.contactInfo %}
  <li>{{ contact.city }}: {{ contact.email }}</li>
{% endfor %}
</ul>
```