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
|[`autocomplete`](#autocomplete) | String | n/a | Sets the value of the `autocomplete` attribute on the field. |
|`def` | String | n/a | The default value for the field |
|[`following`](#following) | String/Array | n/a | The name of a field or an array of field names that will be used to automatically generate this field's value. If this field is edited to no longer match the fields it is following, it will stop responding to edits in those fields.|
|`help` | String | n/a | Help text for the content editor |
|`hidden` | Boolean | `false` | If `true`, the field is hidden |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`min` | Integer | n/a | Sets the minimum number of characters allowed |
|`max` | Integer | n/a | Sets the maximum number of characters allowed |
|`pattern` | String | n/a | Accepts a regular expression string to validate the input. Only values matching the pattern are allowed. |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`requiredIf` | Object | `{}` | Conditions to meet before the field is required. [See the guide for details.](/guide/conditional-fields) |
|`sortify` |	Boolean |	`false` |	If true, creates "sortified" fields. See below. |
|`textarea` | Boolean | `false` | If `true`, use a textarea interface with multiple lines, which allows line breaks |

<!-- TODO: 2.x options not yet available -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |pattern | String | | Regular expression to validate entries |
|patternErrorMessage | String | | Error message to display if `pattern` does not match | -->
<!-- |searchable | Boolean | true | If false, content from the area will not appear in search results. | -->

### autocomplete
The string supplied to the `autocomplete` option is used as the value of the `autocomplete` attribute for the field, as specified in the HTML standards. This feature suggests possible values based on user inputs and previously entered data, streamlining data entry and improving form usability. This also takes a string of `off` to disable autocomplete for sensitive fields. For detailed information on how the `autocomplete` attribute works and the values it accepts, refer to the [MDN documentation on autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete).

### following
This option should be set to the name of a field or an array of field names that will be used to automatically generate this field's value. If this field is edited to no longer match the fields it is following, it will stop responding to edits in those fields.

If an array of fields is passed, the value of each will be concatenated in the order they are passed in the array.

If this field is nested in an `array` or `object` field and is following a field in the parent object, then the name of the field should be prefixed with a `<`, e.g. `following: '<title'`. This hoisting also works if the field is following a field in the parent object from a grand-child `array` or `object` that is nested within a child `array` or `object` using `<<`. This pattern can be extended for additional levels of nesting.

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

```nunjucks
<h2>{{ data.piece.dogName }}</h2>
<p>
  {{ data.piece.biography | striptags(true) | escape | nl2br }}
</p>
```
