# `radio`

A `radio` field allows a list of options where a user can select one value.

## Module field definition

```javascript
// Configuring the `animalType` field in a module's `fields.add` subsection:
animalType: {
  label: 'Type of animal',
  type: 'radio',
  choices: [
    {
      label: 'Mammals 🦧',
      value: 'mammals'
    },
    {
      label: 'Fish 🐠',
      value: 'fish'
    },
    {
      label: 'Birds 🦜',
      value: 'birds'
    },
    {
      label: 'Reptiles 🦎',
      value: 'reptiles'
    },
    {
      label: 'Amphibians 🐸',
      value: 'amphibians'
    }
 ]
}
```

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`choices` | `array` |  n/a | An array of options that the editor can select from, or a method name that returns them. See below. |
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`radio` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`def` | Varies | n/a | The default value for the field. Must be from the defined choices' values. |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`hidden` | Boolean | `false` | If `true`, the field is hidden |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |widgetControls | Boolean | false | If `true`, `select` fields can be edited in line on the page if the field is in a widget | | -->

## `choices` configuration

<!-- Importing choices description -->
<Content :page-key="$site.pages.find(p => p.relativePath === 'reference/field-types/_choices-setting.md').key"/>

## Populating `choices` dynamically

What if the choices aren't known in advance? Then you can fetch them dynamically.

First, set the `choices` option to the name of a [method in your module](../module-api/module-overview.md#methods-self). Pass a string, the name of the method you'll implement on the server side — **do not** pass a function.

Second, implement that method in your module so that it takes `(req, data)` arguments and return an array of choices in the usual format. You may use an async function, or return a promise that will resolve to the array. That means you can reach out to APIs using modules like `axios` or `node-fetch`, or make Apostrophe database queries.

The `data` argument is an object containing the parent's `docId` for further inspection by your function.

It is usually a good idea to perform at least short-term caching in your choices method, in order to limit the impact on performance when editing.

## Use in templates

Radio field data is stored as the string `value` property of the selected choice.

```django
{{ data.piece.animalType }}
```
