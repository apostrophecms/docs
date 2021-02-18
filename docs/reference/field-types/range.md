# `range`

A `range` field provides [range input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range) interface for selecting a numeric value, typically represented in the browser as a slider. The `step` option may be used along with `min` and `max`, if desired, to effectively limit the results to integers.

## Module field definition

```javascript
// Configuring the `fontSize` field in a module's `fields.add` subsection:
fontSize: {
  type: 'range',
  label: 'Font size',
  min: 14,
  max: 32,
  step: 2
}
```

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`range` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`def` | Number | n/a | The default value for the field |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`max` | Number | n/a | The maximum allowed value for the field |
|`min` | Number | n/a | The minimum allowed value for the field |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`step` | Number | 1 | The interval between numbers (it may be a floating point number) |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |readOnly | Boolean | false | If `true`, prevents the user from editing the field value | -->

## Use in templates

```django
{{ data.widget.fontSize }}

{# data.widget.fontSize is a number #}
<h2 style="font-size: {{ data.widget.fontSize }}px;">
  Hello, world
</h2>
```