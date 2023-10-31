# `password`

`password` fields are identical to `string` fields except that the user's input is visually obscured, they do not support the `textarea` option, and they are not indexed for search.
<!-- TODO: Confirm if they are kept from search indexing automatically. -->

## Module field definition

```javascript
// Configuring the `secret` field in a module's `fields.add` subsection:
secret: {
  label: 'Your secret code',
  type: 'password'
}
```

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|------------|
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`password` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|------------|
|`def` | String | n/a | The default value for the field |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`min` | Integer | n/a | Sets the minimum number of characters allowed |
|`max` | Integer | n/a | Sets the maximum number of characters allowed |
|`required` | Boolean | false | If `true`, the field is mandatory |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`requiredIf` | Object | `{}` | Conditions to meet before the field is required. [See the guide for details.](/guide/conditional-fields) |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->

## Use in templates

You probably do not want to print values from this field in templates, but they can be printed the same way as [string fields](string.md).