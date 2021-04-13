# `boolean`

A `boolean` field is a simple "True/False" choice. The value stored in the database will be either `true` or `false`. To customize the _displayed_ values, use the `label` property of [`choices`](/reference/field-types/field-properties/choices.md). The `value` for each choice must always be "true" or "false".

## Module field definition

```javascript
// Configuring a `isSpecial` field in a module's `fields.add` subsection:
isSpecial: {
  label: 'Is this a special item?',
  type: 'boolean'
}
```

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`boolean` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`def` | Boolean | n/a | The default value for the field |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) | universal |
|`required` | Boolean | `false` | If `true`, the field is mandatory |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |[choices](/reference/field-types/field-properties/choices.md) | `array` |  | An array of choices the user can select from. Each must be an object with value and label properties. |  [**showFields**](/reference/field-types/field-properties/choices.md#showfields) | -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |mandatory | String |  | If set, the string is displayed if the user does not set the field to the `true` choice. This can be used for required confirmation fields. | | -->
<!-- |readOnly | Boolean | false | If `true`, prevents the user from editing the field value | -->

## Use in templates

```django
<!-- To print the value: -->
{{ data.piece.isSpecial }}
<!-- or use it in a conditional: -->
<button class="{% if data.piece.isSpecial %}is-special{% endif %}">
  Engage
</button>
```