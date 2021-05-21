# `color`

`color` fields provides the end user with a color picker interface. They also validate submitted values using [the TinyColor utility](https://github.com/bgrins/TinyColor#isvalid). Colors are saved as strings in [8 digit hex code](https://drafts.csswg.org/css-color/#hex-notation), or `#rrggbbaa`, format.

<!-- TODO: Add vue-color options config documentation once supported. -->

## Module field definition

```javascript
// Configuring the `themeColor` field in a module's `fields.add` subsection:
themeColor: {
  type: 'color',
  label: 'Theme color'
}
```

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`color` for this type) |

### Optional

| Property | Type | Default | Description |
|----------|------|---------|-------------|
|`def` | String | n/a | The default value for the field |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`options` | Object | n/a | An object containing color picker configuration. See below. |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |readOnly | Boolean | false | If `true`, prevents the user from editing the field value | -->

### Color picker options

The color picker interface can be configured to present editors with different selection options. The configuration should go in the `options` property as `pickerOptions`. The picker options are below.

| Picker option | Type | Default | Description |
|---------------|------|---------|-------------|
| `presetColors` | Array | See note | An array of color values (strings) |
| `disableAlpha` | Boolean | `false` | Set to `true` to disable the alpha range input |
| `disableFields` | Boolean | `false` | Set to `true` to disable the color value fields |

::: note
The default `presetColors` are:

```javascript
[
  '#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321',
  '#417505', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2',
  '#B8E986', '#000000', '#4A4A4A', '#9B9B9B', '#FFFFFF'
]
```
:::

```javascript
backgroundColor: {
  type: 'color',
  label: 'Background color',
  options: {
    pickerOptions: {
      presetColors: ['#ea433a', '#cc9300', '#b327bf', '#66f', '#00bf9a']
    }
  }
}
```

## Use in templates

```django
<button style="background-color: {{ data.piece.themeColor or '#639' }}">
  Enhance
</button>
```