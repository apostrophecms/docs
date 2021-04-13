# `date`

The `date` field supports saving dates in `YYYY-MM-DD` format. The interface is a [standard date input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date).

## Module field definition

```javascript
// Configuring the `birthday` field in a module's `fields.add` subsection:
birthday: {
  label: 'What is your birthday?',
  type: 'date'
}
```

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`date` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`def` | String | n/a | The default value for the field. Must be in `YYYY-MM-DD` format. |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`max` | String | n/a | The maximum allowed date value for the field. Must be a date format (e.g., `YYYY-MM-DD`) |
|`min` | String | n/a | The minimum allowed date value for the field. Must be a date format (e.g., `YYYY-MM-DD`) |
|`required` | Boolean | `false` | If `true`, the field is mandatory |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |readOnly | Boolean | false | If `true`, prevents the user from editing the field value | -->

## Use in templates

<!-- TODO: Link to the date filter documentation -->
A date value will often be paired with the date template filter.

```django
Their birthday is {{ data.piece.birthday | date('MMMM D, YYYY') }}.
```