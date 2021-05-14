# `string`

A `string` field is a editable text field with configurable options, including a textarea interface.

## Module field definition

```javascript
// Configuring the `dogName`and `biography` fields in a module's
// `fields.add` subsection:
dogName: {
  label: 'What is your dog\'s name?',
  type: 'string'
},
// Textarea
biography: {
  label: 'Write a short biography for your dog',
  type: 'string',
  textarea: true,
  max: 800
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
|`following` | String/Array | n/a | The name of a field or an array of field names that will be used to automatically generate this field's value. If this field is edited to no longer match the fields it is following, it will stop responding to edits in those fields. |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`min` | Integer | n/a | Sets the minimum number of characters allowed |
|`max` | Integer | n/a | Sets the maximum number of characters allowed |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`sortify` |	Boolean |	`false` |	If true, creates "sortified" fields. See below. |
|`textarea` | Boolean | `false` | If `true`, use a textarea interface with multiple lines, which allows line breaks |

<!-- TODO: 2.x options not yet available -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |pattern | String | | Regular expression to validate entries |
|patternErrorMessage | String | | Error message to display if `pattern` does not match | -->
<!-- |searchable | Boolean | true | If false, content from the area will not appear in search results. | -->
<!-- |readOnly | Boolean | false | If `true`, prevents the user from editing the field value | -->

## `sortify`

Setting `sortify: true` creates a parallel version of the field that is more intuitive for sorting purposes. This new, additional property's key will be the string field's name, appended with `Sortified`. Its value will be fully lowercase and have all punctuation removed. Apostrophe will automatically use it if a request is made to sort on the original field.

For instance, if your field's `name` is `lastName` and you set `sortify: true`, `lastNameSortified` will automatically be created and used when sorting on the `lastName` field. This provides case-insensitive sorting that also ignores punctuation differences.

::: tip NOTE
If you add `sortify: true` to an existing field, existing objects will get the sortified version of the field:
- on the next deployment via the `apostrophe-migrations:migrate` command line task,
- when the individual Apostrophe documents are saved, or
- at the next startup when in development.

Migrations like this only need to be run once because on future updates or inserts of a document the sortified property is automatically set.
:::

## Use in templates

The Nunjucks [nl2br](https://mozilla.github.io/nunjucks/templating.html#nl2br) tag can help print textarea strings with line breaks.

```django
<h2>{{ data.piece.dogName }}</h2>
<p>
  {{ data.piece.biography | striptags(true) | escape | nl2br }}
</p>
```