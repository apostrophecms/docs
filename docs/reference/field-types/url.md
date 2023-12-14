# `url`

`url` adds an editable URL field to the schema.

Apostrophe will detect common mistakes, including leaving off `https://`. Common XSS attack vectors are laundered and discarded. Only "safe" URL schemes, e.g., `http`, `https`, `ftp` and `mailto`, are permitted.

## Module field definition

```javascript
// Configuring the `portfolio` field in a module's `fields.add` subsection:
portfolio: {
  label: 'Portfolio URL',
  type: 'url'
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
|`help` | String | n/a | Help text for the content editor |
|`hidden` | Boolean | `false` | If `true`, the field is hidden |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`pattern` | String | n/a | Accepts a regular expression string to validate the input. Only values matching the pattern are allowed. |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`requiredIf` | Object | `{}` | Conditions to meet before the field is required. [See the guide for details.](/guide/conditional-fields) |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->

## Use in templates

```nunjucks
<href="{{ data.piece.portfolio }}">My website</a>
```
