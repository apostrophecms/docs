# `color`

`color` fields provides the end user with a color picker interface. They also validate submitted values using [the TinyColor utility](https://github.com/bgrins/TinyColor?tab=readme-ov-file#isvalid). Colors are saved as strings in [8 digit hex code](https://drafts.csswg.org/css-color/#hex-notation), or `#rrggbbaa`, format.

<!-- TODO: Add vue-color options config documentation once supported. -->

## Module field definition

```javascript
// Configuring the `themeColor` field in a module's `fields.add` subsection:
themeColor: {
  type: 'color',
  label: 'Theme color'
}
```

## Color Field UI
You have the ability to control and customize several parts of the color field's UI, as detailed in the `options` section below.
![Screenshot of the Apostrophe color field UI](/images/apostrophe-color-picker-ui.png)

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
|`requiredIf` | Object | `{}` | Conditions to meet before the field is required. [See the guide for details.](/guide/conditional-fields) |
|`hidden` | Boolean | `false` | If `true`, the field is hidden |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |
|`options` | Object | n/a | An object containing color picker configuration. See below. |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->

### `options`

Color fields have additional settings configured in an `options` object:

#### `format`

**Type:** String

The color string format saved to the database. Possible options are:

- `rgb`
- `prgb`
- `hex6`
- `hex3`
- `hex8`
- `hsl`
- `hsv`

The default value is [`hex8`](https://www.npmjs.com/package/tinycolor2#hex-8-digit-rgba-hex).

```javascript
backgroundColor: {
  type: 'color',
  label: 'Background color',
  options: {
    format: 'rgb'
  }
}
```
<br/>

#### `presetColors`

An array of color values, used as swatches.

**Type:** Array, Boolean

::: tip
Passing `false` will disable the preset colors UI
:::


**Default Value:**

```javascript
[
  '#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321',
  '#417505', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2',
  '#B8E986', '#000000', '#4A4A4A', '#9B9B9B', '#FFFFFF'
]
```

**Valid Color Strings:**
<br/>Mix and match as you like.

| Format | Example |
|----------|------|
|hex3 | `#f00` |
|hex6 | `#00ff00` |
|hex8 | `#00ff0055` |
|rgb | `rgb(201, 76, 76)` |
|rgba | `rgba(0, 0, 255, 1)` |
|hsl | `hsl(89, 43%, 51%)` |
|hsla | `hsla(89, 43%, 51%, 0.6)` |
|CSS Variable | `--my-primary-color` |

::: warning
When using CSS Variables as presets, Apostrophe will save the CSS Variable **name** as a string, regardless of the `format` option (for example `'--my-primary-color'`).
:::


**Usage**

```javascript
backgroundColor: {
  type: 'color',
  label: 'Background color',
  options: {
    presetColors: ['#ea433a', '#cc9300', '#b327bf', '#66f', '#00bf9a']
  }
}
```
<br/>

##### `disableAlpha`
**Type:** Boolean

Control alpha transparency with a range input.

*Default value*

```javascript
false
```
<br/>

##### `disableFields`
**Type:** Boolean

Disable the inputs for editing the hex & RGBA value of a color. Good for limiting the user's choices.

*Default value*

```javascript
false
```
<br/>

##### `disableSpectrum`
**Type:** Boolean

Disable the full color spectrum UI. Good for limiting the user's choices.

*Default value*

```javascript
false
```

## Use in templates

```nunjucks
<button style="background-color: {{ data.piece.themeColor or '#639' }}">
  Enhance
</button>
```
