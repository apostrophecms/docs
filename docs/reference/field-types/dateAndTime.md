# `dateAndTime`

`dateAndTime` fields provide subfields for entering date and time values in a user-friendly way. Dates and times are stored in ISO 8601 format, for example: `2022-01-01T03:00:00Z`.

Note that while dates and times are edited in the individual editor's time zone, they are always saved in UTC (Universal Coordinated Time).

## Module field definition

```javascript
// Configuring the `eventDateAndTime` field in a module's `fields.add` subsection:
eventDateAndTime: {
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
|`hidden` | Boolean | `false` | If `true`, the field is hidden |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |

## Use in templates

Times are stored, and will print, in the ISO 8601 format `YYYY-MM-DDTHH:MM:SSZ`.

To print them in the format of your choice pass a [momentjs/datejs compliant format string](https://momentjs.com/docs/#/displaying/) to the date Nunjucks filter, like this:

```nunjucks
{{ data.piece.eventDateAndTime | date("dddd, MMMM Do YYYY, h:mm:ss a") }}
```
