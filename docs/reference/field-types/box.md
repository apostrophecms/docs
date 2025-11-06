# `box`

The `box` field is a unique field that provides a tailored UX for defining values associated with the CSS box-model, such as margin, padding, and border-width.

## Module field definition

```javascript
padding: {
  label: 'Container padding',
  type: 'box',
  min: -3,
  max: 50,
  step: 2,
  def: {
    top: 20,
    right: -2,
    bottom: 0
    left: 30
  }
}
```

## Box Field UI
The UI of the box field allows you to edit all values uniformly or each individually.
![Screenshot of the Apostrophe box field UI](/images/apostrophe-box-field-ui.png)

## Value
The value of a box field is always an object with `top`, `right`, `bottom`, `left` properties. All property values are stored as numbers, any omitted values are made  `null`.

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`label` | String | n/a | Sets the visible label for the field in the UI |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`help` | String | n/a | Help text for the content editor |
|`def` | Object | <pre style='width: 170px; border-radius: 4px; padding: 3px 6px; background-color: var(--vp-code-bg);font-size: var(--vp-code-font-size); color: var(--vp-code-color);'><code>{<br/>&nbsp;top: null,<br />&nbsp;right: null,<br />&nbsp;bottom: null,<br />&nbsp;left: null<br />}</code></pre> | The default value. Must be an object with keys `top`, `right`, `bottom`, `left`. Each value must be a number |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`requiredIf` | Object | `{}` | Conditions to meet before the field is required. [See the guide for details.](/guide/conditional-fields) |
|`hidden` | Boolean | `false` | If `true`, the field is hidden |
|`max` | Number | n/a | The maximum allowable value for any box property |
|`min` | Number | n/a | The minimum allowable value for any box property |
|`step` | Number | n/a | The default increment when using the input's arrow buttons or keyboard |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |
