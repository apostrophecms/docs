# `boolean`

A `boolean` field is a simple "True/False" choice. The value stored in the database will be either `true` or `false`.

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
|`choices` | `array` |  n/a | An array of options that the editor can select from. See below. |
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

## Customizing boolean field labels

We can change labels for the boolean `true` and `false` values using a `choices` array. The choices are configured similar to [select field choices](/reference/field-types/select.md#choices-configuration), but with values limited to `true` and `false`.

```javascript
showRelatedArticles: {
  label: 'Should the page display related articles?',
  type: 'boolean',
  choices: [
    {
      label: 'Show related articles',
      value: true
    },
    {
      label: 'Hide related articles',
      value: false
    }
  ]
}
```

## Use in templates

```django
<!-- To print the value: -->
{{ data.piece.isSpecial }}
<!-- or use it in a conditional: -->
<button class="{% if data.piece.isSpecial %}is-special{% endif %}">
  Engage
</button>
```