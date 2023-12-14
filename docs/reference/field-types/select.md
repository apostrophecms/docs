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
|`choices` | Array or String |  n/a | An array of options that the editor can select from, or a method name that returns them. See below. |
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`select` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|[`autocomplete`](#autocomplete) | String | 'off' | Sets the value of the `autocomplete` attribute on the field. |
|`def` | Varies | n/a | The default value for the field. Must be from the defined choices' values. |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`requiredIf` | Object | `{}` | Conditions to meet before the field is required. [See the guide for details.](/guide/conditional-fields) |
|`hidden` | Boolean | `false` | If `true`, the field is hidden |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |widgetControls | Boolean | false | If `true`, `select` fields can be edited in line on the page if the field is in a widget | | -->

## `choices` configuration

The `choices` setting in `checkboxes`, `radio`, or `select` fields configures the options that a user will see in the interface and the values that the server will allow in validation. The `choices` value is an array of objects with `label` and `value` properties.

- `value` is used in the field's database value
- `label` is the more human-readable version used in interfaces

## Populating `choices` dynamically

What if the choices aren't known in advance? Then you can fetch them dynamically.

First, set the `choices` option to the name of a [method in your module](../module-api/module-overview.md#methods-self). Pass a string, the name of the method you'll implement on the server side — **do not** pass a function.

Second, implement that method in your module so that it takes `(req, data)` arguments and return an array of choices in the usual format. You may use an async function, or return a promise that will resolve to the array. That means you can reach out to APIs using modules like `axios` or `node-fetch`, or make Apostrophe database queries.

The `data` argument is an object containing the parent's `docId` for further inspection by your function.

It is usually a good idea to perform at least short-term caching in your choices method, in order to limit the impact on performance when editing.

### autocomplete
The string supplied to the `autocomplete` option is used as the value of the `autocomplete` attribute for the field, as specified in the HTML standards. This feature suggests possible values based on user inputs and previously entered data, streamlining data entry and improving form usability. This also takes a string of `off` to disable autocomplete for sensitive fields. For detailed information on how the `autocomplete` attribute works and the values it accepts, refer to the [MDN documentation on autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete).

## Use in templates

Select field data is stored as the string `value` property of the selected choice.

```nunjucks
{{ data.page.theme }}
```
