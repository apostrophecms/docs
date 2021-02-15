# `relationshipReverse`

<!-- TODO: This whole page needs to be revisited following successful testing of the `relationshipReverse` field type. -->
A `relationshipReverse` field allows us to access the "other side" of a doc [relationship](/reference/field-types/relationship.md). There is no editing interface for this field type as the relationship is defined in the paired `relationship` field. `relationshipReverse` fields are a convenience allowing developers to identify Apostrophe documents that have established relationships with a given document.

## Module field definition
```javascript
// Configuring the `_pizzas` field in a module's `fields.add` subsection:
_pizzas: {
  type: 'relationshipReverse',
  withType: 'pizza',
  reverseOf: '_fabrics'
}
```

We can now see `_pizzas` as a property of each `topping` object that is related to a product.

If desired, we can specify `schema` and `relationshipsField` just as we would for `joinByArray`. Currently these are not automatic in a reverse join and must be fully specified if relationship properties are to be accessed. Most array joins do not have relationship properties and thus do not require reverse access to them.

## Settings

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`name` | String | n/a | Sets the name of the field in the database |
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`type` | String | n/a | Specifies the field type (`relationshipReverse` for this type) |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`withType` | String | n/a | The name of the related type, if it differs from the name of the join. If you do not set `withType`, then the name of the join must match the name of the related type, with a leading `_` added.  |
|`reverseOf` | String | n/a | Set to the name of the join you are reversing (optional) |
|`ifOnlyOne` | Boolean | `false` | If `true`, it will only carry out the join if the query that returned the original document returned only one document. This is useful if the joined information is only to be displayed on the `show.html` page of a piece, for instance, and you don't want the performance impact of loading it on the `index.html` page. |

::: tip
In documents with many joins in play, the `ifOnlyOne` option will avoid running through all the possible joins, and can be used to avoid a heavy performance impact in complex documents.
:::
