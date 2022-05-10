# `dateAndTime`

`dateAndTime` fields are text field with UI support, and limitation, for saving date and time values. Date and times are stored in ISO 8601 format. `YYYY-MM-DDTHH:MM:SSZ` format.

## Module field definition

```javascript
// Configuring the `eventTime` field in a module's `fields.add` subsection:
eventTime: {
  label: 'What is the date and time of the event?',
  type: 'dateAndTime'
}
```

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`string` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |

## Use in templates

Times are stored, and will print, in the ISO 8601 format `YYYY-MM-DDTHH:MM:SSZ`.

```django
{{ data.piece.eventTime }}
```