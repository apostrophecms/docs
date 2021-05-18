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
|`def` | String | n/a | The default value for the field |
|`following` | String/Array | n/a | The name of a field or an array of field names that will be used to automatically generate this field's value. If this field is edited to no longer match the fields it is following, it will stop responding to edits in those fields. |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`page` | Boolean | `false` | If `true`, then slashes are allowed since the slug field is describing a page doc |
|`required` | Boolean | `false` | If `true`, the field is mandatory |

<!-- TODO: 2.x options not yet available -->
<!-- |contextual | Boolean | false | If `true`, it will prevent the field from appearing in the editor modal | -->
<!-- |pattern | String | | Regular expression to validate entries |
|patternErrorMessage | String | | Error message to display if `pattern` does not match | -->
<!-- |readOnly | Boolean | false | If `true`, prevents the user from editing the field value | -->

## Use in templates

If adding a new field with the `slug` type, it is most likely not going to be used in templates, but it is allowed as a string value.

```django
{{ data.piece.projectSlug }}
```