# `relationshipReverse`

Adding a `relationshipReverse` field to a doc type schema reveals Apostrophe docs that have established relationships with a given doc. It is a developer convenience, showing the receiving side of a [`relationship` field](/reference/field-types/relationship.md). There is no editing interface for this field type as the relationship is defined in the paired `relationship` field.

Take the example of a website that has a `pizza` piece type with a `relationship` field connecting to its `topping` piece type. Each pizza piece chooses the registered toppings that it has (the relationship is _pizza-to-topping_). The website might also want to list all available toppings on a page and show all pizzas that use each topping (the _topping-to-pizza_ direction). A `relationshipReverse` field could make it easy to find and display that information.

## Module field definition

The field name must begin with an underscore (`_`). This indicates that the ultimate value is not stored in the database, but is populated when needed.

```javascript
// Configuring the `_pizzas` field in a module's `fields.add` subsection:
_pizzas: {
  type: 'relationshipReverse',
  withType: 'pizza',
  reverseOf: '_toppings'
}
```

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`type` | String | n/a | Specifies the field type (`relationshipReverse` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`reverseOf` | String | n/a | Set to the name of the related `relationship` field. |
|`ifOnlyOne` | Boolean | `false` | If `true`, it will only reveal the relationship data if the doc query returned only one document. [See below](#ifonlyone) for more. |
|`withType` | String | Uses the field name, minus its leading `_` and possible trailing `s` | The name of the related type. |

::: tip
For relationships with pages, use `withType: '@apostrophecms/any-page-type'`.

If `withType` is not set the name of the field must match the name of the related type, with a leading `_` (underscore), and *optional* trailing `s` added (e.g., `_article` or `_articles` to connect to the `article` piece type).
:::

## `ifOnlyOne`

The `ifOnlyOne` option can provide a performance improvement if the reverse relationship data is only needed when one piece is queried. For example, in the example above, the pizza relationship data may be only needed on a topping [show page](/reference/glossary.md#show-page), where only one topping is displayed; not on the [index page](/reference/glossary.md#index-page), where many toppings are listed.

Setting `ifOnlyOne: true` tells Apostrophe not to look for the extra relationship data in those contexts, such as index pages, where many pieces are queried.