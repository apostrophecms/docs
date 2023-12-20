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
|[`autocomplete`](#autocomplete) | String | n/a | Sets the value of the `autocomplete` attribute on the field. |
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

### autocomplete
The string supplied to the `autocomplete` option is used as the value of the `autocomplete` attribute for the field, as specified in the HTML standards. This feature suggests possible values based on user inputs and previously entered data, streamlining data entry and improving form usability. This also takes a string of `off` to disable autocomplete for sensitive fields. However, most modern browsers ignore this for password fields. In situations where you are implementing a user management page and an administrator will be adding a password for another user pass a string of `new-password` to truly disable auto-complete. For detailed information on how the `autocomplete` attribute works and the values it accepts, refer to the [MDN documentation on autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete).

## Use in templates

You probably do not want to print values from this field in templates, but they can be printed the same way as [string fields](string.md).