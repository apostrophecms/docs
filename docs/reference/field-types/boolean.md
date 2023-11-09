# `boolean`

A `boolean` field is a simple "True/False" choice. The value stored in the database will be either `true` or `false`.

## Module field definition

```javascript
// Configuring a `isSpecial` field in a module's `fields.add` subsection:
isSpecial: {
  label: 'Is this a special item?',
  type: 'boolean'
}
```

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`boolean` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`def` | Boolean | n/a | The default value for the field |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) | universal |
|`hidden` | Boolean | `false` | If `true`, the field is hidden |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |
|`toggle` | Boolean/Object | n/a | If set to `true` or a configuration object, the field will use an alternate "toggle" interface. See below. |

<!-- TODO: The following settings are likely to return, but are not yet implemented. -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |mandatory | String |  | If set, the string is displayed if the user does not set the field to the `true` choice. This can be used for required confirmation fields. | | -->

## Customizing boolean field labels

We can change labels for the boolean input using a `toggle` object. The user interface will use the values of `true` and `false` properties on the object as labels.

```javascript
showRelatedArticles: {
  label: 'Should the page display related articles?',
  type: 'boolean',
  toggle:{
    true: 'Show related articles',
    false: 'Hide related articles'
  }
}
```

## Use in templates

```nunjucks
<!-- To print the value: -->
{{ data.piece.isSpecial }}
<!-- or use it in a conditional: -->
<button class="{% if data.piece.isSpecial %}is-special{% endif %}">
  Engage
</button>
```
