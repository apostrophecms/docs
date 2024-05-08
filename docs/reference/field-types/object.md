# `object`

An `object` field has its own [field schema](/reference/glossary.md#schema) and allows the user to populate a sub-object containing the fields in that schema. The overall field is stored in the database as a sub-object. If you want support for *one or more* sub-objects, use an [array](/reference/field-types/array.md) field instead.

`object` fields provide a sense of visual hierarchy to distinguish their subfields from other fields when editing, as well as a sub-object to provide clear structure for developers. If you find yourself creating fields named `addressStreet`, `addressCity`, etc. it is usually a better idea to create an `address` field of type `object` with sub-fields named `street`, `city` and so on.

## Module field definition

```javascript
// Configuring the `contactInfo` object field in a module's `fields.add` subsection:
contactInfo: {
  label: 'Address',
  type: 'object',
  fields: {
    add: {
      street: {
        type: 'string',
        label: 'Street'
      },
      city: {
        type: 'string',
        label: 'City'
      },
      state: {
        type: 'string',
        label: 'State'
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
|`type` | String | n/a | Specifies the field type (`object` for this type) |
|`fields` | Object | n/a | The field schema for the array items. See below. |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`def` | Object | n/a | The default value for the field. It must comply with the fields schema. |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`requiredIf` | Object | `{}` | Conditions to meet before the field is required. [See the guide for details.](/guide/conditional-fields) |
|`hidden` | Boolean | `false` | If `true`, the field is hidden |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | `false` | If `true`, it will prevent the field from appearing in the editor modal | -->

## Configuring the array field schema

`object` field schemas are generally configured the same way as the module's overall field schema is configured. The module's schema is configured in its `fields` section's `add` subsection. Similarly, array field schema are configured in a `fields` property, using its `add` subproperty to configure the actual fields. Both use the field names as keys in the `add` object. Both can contain all field types, including nested `object` fields.

Object schema configuration differs from module schema configuration in that _object schemas_ do not use `group` or `remove` settings.

## Use in templates

You can access the fields of the object as sub-properties.

```nunjucks
<p>
{% set address = data.piece.address %}
{{ address.street }}<br />
{{ address.city }}, {{ address.state }}
</p>
```
