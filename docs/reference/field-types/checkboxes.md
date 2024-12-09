# `checkboxes`

A `checkboxes` field allows a list of options where a user can select one or more items. Checkbox items can also be deselected, unlike [radio fields](radio.md).

## Module field definition

``` javascript
// Configuring the `genres` field in a module's `fields.add` subsection:
genres: {
  label: 'Select the genres that apply to this book',
  type: 'checkboxes',
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
|`choices` | Array/String |  n/a | An array of options that the editor can select from, or a method name that returns them. See below. |
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`checkboxes` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`def` | Array | n/a | The default value for the field. Values must be from the defined choices' values. |
|[`following`](#following) | String/Array | n/a | The name of a field or an array of field names that can be used to generate dynamic `choices` for this field. |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`requiredIf` | Object | `{}` | Conditions to meet before the field is required. [See the guide for details.](/guide/conditional-fields) |
|`hidden` | Boolean | `false` | If `true`, the field is hidden |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |
| `style` | String | n/a | If 'combo', adds a selection choices box and dropdown list of choices |
| `all` | Object | n/a | If `style: 'combo'`, adds a choice to select every option with a label set by the `label` property |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->

### `following`
The `following` option is used when adding field choices that depend on the value of another field in the schema by passing a string representing a method name to the [`choices`](#choices) option. It should be set to the name of a field or an array of field names that will be used to dynamically create choices based on the value of those named field(s).

If this field is nested in an `array` or `object` field and is following a field in the parent object, then the name of the field should be prefixed with a `<`, e.g. `following: '<title'`. This hoisting also works if the field is following a field in the parent object from a grand-child `array` or `object` that is nested within a child `array` or `object` using `<<`. This pattern can be extended for additional levels of nesting.

The value(s) of the followed field(s) will be used to create an object with properties composed of the followed schema name for each key, and the current value of that field as value. This object will be passed to the dynamic `choices` method [(see below)](#choices). Note that the property key in the object is the same as the value passed to the `following` field, including any prepended `<`.

## `choices` configuration

The `choices` setting in `checkboxes`, `radio`, or `select` fields configures the options that a user will see in the interface and the values that the server will allow in validation. The `choices` value is an array of objects with `label` and `value` properties, or a string ending with `()` representing a [`method(self)`](../module-api/module-overview#methods) in your module. See below for more [details](#choices).

- `value` is used in the field's database value
- `label` is the more human-readable version used in interfaces

## Populating `choices` dynamically {#choices}

What if the choices aren't known in advance or are dependent on the value of another schema field? Then you can fetch them dynamically.

First, set the `choices` option to the name of a [method in your module](../module-api/module-overview.md#methods-self). Pass the name of the method you'll implement on the server side as a string ending in `()`. e.g. `choices: 'getChoices()'` — **do not** pass a function.

Second, implement that method in your module so that it takes `(req, data, following)` arguments and return an array of choices in the usual format. You may use an async function, or return a promise that will resolve to the array. That means you can reach out to APIs using modules like `axios` or `node-fetch`, or make Apostrophe database queries.

The `data` argument is an object containing the parent's `docId` for further inspection by your function and is falsey if the document hasn't been published.

The `following` argument is an object containing the schema fields being followed as keys and the value of those fields as values. Note that the key will match the field name(s) in the `following` field array exactly. So if you are passing a parental schema field value in an `object` or `array` schema field, you need to include the prefixing `<` along with the name. See the [`following`](#following) property description.

When your `choices` method is async, while calls to the method are debounced to keep the rate of calls reasonable, is usually a good idea to perform at least short-term caching in order to limit the impact on performance when editing.

<AposCodeBlock>

``` javascript
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Example'
  },
  fields: {
    add: {
      // other schema fields
      region: {
        type: 'select',
        label: 'Region',
        choices: [
          { label: 'North America', value: 'na' },
          { label: 'Europe', value: 'eu' }
        ]
      },
      cities: {
        type: 'checkboxes',
        label: 'Favorite Cities',
        following: [ 'region' ],
        choices: 'getCities()'
      }
    }
  },
  methods(self) {
    return {
      // this method can be async
      getCities(req, { docId }, { region }) {
        // Define city choices based on the selected region
        const cityChoices = {
          na: [
            { label: 'New York', value: 'newYork' },
            { label: 'Los Angeles', value: 'losAngeles' },
            { label: 'Chicago', value: 'chicago' }
          ],
          eu: [
            { label: 'Paris', value: 'paris' },
            { label: 'Berlin', value: 'berlin' },
            { label: 'London', value: 'london' }
          ]
        };
        // Return the array of choices for the selected region
        return cityChoices[region] || [];
      }
    };
  }
};
```
<template v-slot:caption>
</template>
</AposCodeBlock>

## Use in templates

The checkboxes field data value is stored in an array of the selected options' value. Nunjucks provides the [`{% for %}` template tag](https://mozilla.github.io/nunjucks/templating.html#for) that you can use to loop over the array.

```nunjucks
<ul>
  {% for genre in data.piece.genres %}
    <li>{{ genre }}</li>
  {% endfor %}
</ul>
```
