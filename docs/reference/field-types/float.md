# `float`

`float` fields support number input with decimals (floating point numbers). You may set minimum and maximum values using the `min` and `max` options.

## Module field definition

```javascript
// Configuring the `gpa` field in a module's `fields.add` subsection:
gpa: {
  label: 'What was your grade point average (GPA)?',
  type: 'float',
  min: 1.0,
  max: 4.5
}
```

## Settings
### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`float` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`def` | Number | n/a | The default value for the field |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`max` | Number | n/a | The maximum allowed value for the field |
|`min` | Number | n/a | The minimum allowed value for the field |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->

## Use in templates

```django
GPA: {{ data.piece.gpa }}
```