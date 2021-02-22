# `select`

A `select` field allows a list of options where a user can select one value.

## Module field definition

```javascript
// Configuring the `theme` field in a module's `fields.add` subsection:
theme: {
  label: 'Select a color scheme for this page',
  type: 'select',
  choices: [
    {
      label: 'Dark 🌚',
      value: 'dark'
    },
    {
      label: 'Light 💡',
      value: 'light'
    },
    {
      label: 'Dusk 🌆',
      value: 'dusk'
    }
  ]
}
```

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`choices` | `array` |  n/a | An array of options that the editor can select from. See below. |
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`select` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`def` | Varies | n/a | The default value for the field. Must be from the defined choices' values. |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`required` | Boolean | `false` | If `true`, the field is mandatory |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |readOnly | Boolean | false | If `true`, prevents the user from editing the field value | -->
<!-- |widgetControls | Boolean | false | If `true`, `select` fields can be edited in line on the page if the field is in a widget | | -->

## `choices` configuration

<!-- Importing choices description -->
<Content :page-key="$site.pages.find(p => p.relativePath === 'reference/field-types/_choices-setting.md').key"/>

## Use in templates

Select field data is stored as the string `value` property of the selected choice.

```django
{{ data.page.theme }}
```