# `checkboxes`

A `checkboxes` field allows a list of options where a user can select one or more items. Checkbox items can also be deselected, unlike [radio fields](radio.md).

## Module field definition

```javascript
// Configuring the `genres` field in a module's `fields.add` subsection:
genres: {
  label: 'Select the genres that apply to this book',
  type: 'checkbox',
  choices: [
    {
      label: 'Romance 🥰',
      value: 'romance'
    },
    {
      label: 'Comedy 🤣',
      value: 'comedy'
    },
    {
      label: 'Crime 😰',
      value: 'crime'
    }
  ]
}
```

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`choices` | `array` |  n/a | An array of options that the editor can select from. See below. |
|`label` | String | n/a | Sets the visible label for the field in the UI. |
|`type` | String | n/a | Specifies the field type (`checkbox` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|------------|
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`required` | Boolean | `false` | If `true`, the field is mandatory |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |readOnly | Boolean | false | If `true`, prevents the user from editing the field value | -->

## `choices` configuration

<!-- Importing choices description -->
<Content :page-key="$site.pages.find(p => p.relativePath === 'reference/field-types/choices-setting.md').key"/>

## Use in templates

The checkbox field data value is stored in an array of the selected options' value. Nujucks provides the [`{% for %}` template tag](https://mozilla.github.io/nunjucks/templating.html#for) that you can use to loop over the array.

```django
<ul>
  {% for genre in data.piece.genres %}
    <li>{{ genre }}</li>
  {% endfor %}
</ul>
```