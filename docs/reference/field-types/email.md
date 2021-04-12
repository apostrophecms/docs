# `email`

`email` fields operate similarly to a normal `string` field, but will only accept a valid email address.

## Module field definition

```javascript
// Configuring the `workEmail` field in a module's `fields.add` subsection:
workEmail: {
  label: 'Work email address',
  type: 'email'
}
```

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|------------|
|`label` | String | | Sets the visible label for the field in the UI |
|`type` | String | | Specifies the field type (`email` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|------------|
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`required` | Boolean | false | If `true`, the field is mandatory |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |readOnly | Boolean | false | If `true`, prevents the user from editing the field value | -->

## Use in templates

```django
Email: {{ data.piece.workEmail }}
```