# `slug`

`slug` adds a text field to the schema that is restricted to producing strings strings acceptable as Apostrophe document slugs. All [docs](/reference/glossary.md#doc) already have a slug with with the name "slug," as required by Apostrophe. It is therefore rare that developers have need to create additional fields of this type, but it is allowed.

Text entered in a `slug` field is immediately lower-cased and all spaces and punctuation are replaced by dashes (`-`).

## Module field definition

```javascript
// Configuring the `secondSlug` field in a module's `fields.add` subsection:
projectSlug: {
  label: 'Enter a unique identifier for the project',
  type: 'slug'
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
|[`autocomplete`](#autocomplete) | String | n/a | Sets the value of the `autocomplete` attribute on the field. |
|`def` | String | n/a | The default value for the field |
|[`following`](#following) | String/Array | n/a | The name of a field or an array of field names that will be used to automatically generate this field's value. If this field is edited to no longer match the fields it is following, it will stop responding to edits in those fields.|
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`requiredIf` | Object | `{}` | Conditions to meet before the field is required. [See the guide for details.](/guide/conditional-fields) |
|`hidden` | Boolean | `false` | If `true`, the field is hidden |
|`page` | Boolean | `false` | If `true`, then slashes are allowed since the slug field is describing a page doc |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |

<!-- TODO: 2.x options not yet available -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |pattern | String | | Regular expression to validate entries |
|patternErrorMessage | String | | Error message to display if `pattern` does not match | -->

### autocomplete
The string supplied to the `autocomplete` option is used as the value of the `autocomplete` attribute for the field, as specified in the HTML standards. This feature suggests possible values based on user inputs and previously entered data, streamlining data entry and improving form usability. This also takes a string of `off` to disable autocomplete for sensitive fields. For detailed information on how the `autocomplete` attribute works and the values it accepts, refer to the [MDN documentation on autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete).

### following
This option should be set to the name of a field or an array of field names that will be used to automatically generate this field's value. If this field is edited to no longer match the fields it is following, it will stop responding to edits in those fields.

If an array of fields is passed, the value of each will be concatenated in the order they are passed in the array.

If this field is nested in an `array` or `object` field and is following a field in the parent object, then the name of the field should be prefixed with a `<`, e.g. `following: '<title'`. This hoisting also works if the field is following a field in the parent object from a grand-child `array` or `object` that is nested within a child `array` or `object` using `<<`. This pattern can be extended for additional levels of nesting.

::: tip
If you are overriding a piece type or page type's `slug` field and that doc type uses a [slug prefix](/reference/module-api/module-options.md#slugprefix), the `slug` field should include `'archived'` in the `following` option. It is used by the slug field type to manage prefixes, though its value is not included in the slug name.

```
slug: {
  type: 'slug',
  label: 'Slug',
  following: [ 'title', 'archived' ],
  required: true
}
```

Overriding the `slug` field is typically only necessary if you want to change the `following` string fields.
:::

## Use in templates

If adding a new field with the `slug` type, it is most likely not going to be used in templates, but it is allowed as a string value.

```nunjucks
{{ data.piece.projectSlug }}
```
