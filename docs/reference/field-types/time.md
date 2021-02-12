# `time`

`time` fields are text field with UI support, and limitation, for saving time values. Times are stored in 24 hour `HH:MM:SS` format.

## Module field definition

```javascript
// Configuring the `eventTime` field in a module's `fields.add` subsection:
eventTime: {
  label: 'What time is the event?',
  type: 'time'
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
|`def` | String | n/a | The default value for the field |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`required` | Boolean | `false` | If `true`, the field is mandatory |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |readOnly | Boolean | false | If `true`, prevents the user from editing the field value | -->

::: warning NOTE
If you do not set `def: null` or `required: true`, the time defaults to the current time.
:::

## Use in templates

Times are stored, and will print, in the `HH:MM:SS` format.

```django
{{ data.piece.eventTime }}
```