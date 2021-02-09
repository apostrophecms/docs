# `password`

`password` fields are identical to `string` fields except that the user's input is visually obscured and they do not support the `textarea` option and they are not indexed for search.
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
|`label` | String | | Sets the visible label for the field in the UI |
|`type` | String | | Specifies the field type (`password` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|------------|
|`help` | String | | Help text for the content editor |
|`htmlHelp` | String | | Help text with support for HTML markup |
|`required` | Boolean | false | If `true`, the field is mandatory |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |readOnly | Boolean | false | If `true`, prevents the user from editing the field value | -->

## Use in templates

You probably do not want to print values from this field in templates, but they can be printed the same way as [string fields](string.md).