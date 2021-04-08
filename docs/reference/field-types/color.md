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

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`def` | String | n/a | The default value for the field |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`required` | Boolean | `false` | If `true`, the field is mandatory |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |readOnly | Boolean | false | If `true`, prevents the user from editing the field value | -->


## Use in templates

```django
<button style="background-color: {{ data.piece.themeColor or '#639' }}">
  Enhance
</button>
```