# `relationship`

A `relationship` field expresses a one-to-many connection between an Apostrophe document, a piece or page, and another.

The `_id` values for the related docs are stored in an array. When ready to be used, Apostrophe fetches the full related documents, filtering properties as configured, and attaching them on a property matching the `relationship` field name.

For instance, a website may have `pizza` pieces with a `relationship` field named `_toppings` that relates them to `topping` pieces. The topping `_id` values will be stored on `toppingsIds` in the database. In the template and in API responses, the related topping piece data will be available as the `pizza._toppings` array property of each product.

## Module field definition

The field name must begin with an underscore (`_`). This indicates that the ultimate value is not stored in the database, but is populated when needed.

```javascript
// Configuring the `_toppings` field in a module's `fields.add` subsection:
_toppings: {
  label: 'Toppings',
  type: 'relationship',
  withType: 'topping',
  builders: {
    // Include only the information you need with a projection
    project: {
      title: 1,
      _url: 1
    }
  }
}
```

::: tip
**For better performance, it is strongly recommended that you set a projection filter** via the `builders` option, limiting the amount of information fetched about each related doc. You may also call other query builders by setting subproperties of the `builders` property. This is a useful way to limit the acceptable choices for the join.
:::
<!-- TODO: Link "query builders" to more docs on that feature -->

## Settings

### Required

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`relationship` for this type) |

### Optional

|  Property | Type   | Default | Description |
|-----------|-----------|-----------|-----------|
|`builders` | Object | n/a | Query builders to limit acceptable options for the join. [See below](#filtering-related-document-properties) for more.|
|`fields` | Object | n/a | A field schema object, allowing editors to [add additional information to relationships](/guide/relationships.md#providing-context-with-fields). |
|`help` | String | n/a | Help text for the content editor |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|`idsStorage` | String | n/a | The name of the property in which to store related document IDs. If not set, the IDs property will be based on the field name. |
|`ifOnlyOne` | Boolean | `false` | If `true`, the related doc data will only be populated if the original document was the only one requested. [See below](#limiting-returned-data-with-ifonlyone) for more. |
|`min` | Integer |  n/a | The minimum number of related docs required |
|`max` | Integer |  n/a | The maximum number of related docs allowed |
|`required` | Boolean | `false` | If `true`, the field is mandatory |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |
|`withRelationships` | Array |  n/a | An array of field names representing `relationship` fields you wish to populate with the connected docs. [See below](#populating-nested-relationships-using-withrelationship) for more. |
|`withType` | String | Uses the field name, minus its leading `_` and possible trailing `s` | The name of the related type. |
|`browse` | Boolean | `true` | If `false`, hide the browse button. |
|`suggestionLabel` | String | `apostrophe:relationshipSuggestionLabel` | The label at the top of the autocomplete suggestions |
|`suggestionHelp` | String | `apostrophe:relationshipSuggestionHelp` | The text to display next to the autocomplete suggestion label |
|`suggestionLimit` | Number | 25 | How many suggestions should be displayed when you focus the search field |
|`suggestionSort` | Object | `{ updatedAt: -1 }` | How to sort the autocomplete results |
|`suggestionIcon` | String | `text-box-icon` | The icon to display before the autocomplete item. Please refer to the [`icons` module setting](/reference/module-api/module-overview.md#icons) |
|`suggestionFields` | Array | `[ 'slug' ]` | The document properties to display next to the autocomplete label |


::: tip
To create relationships with pages, use `withType: '@apostrophecms/any-page-type'`.

If `withType` is not set the name of the field must match the name of the related type, with a leading `_` (underscore), and *optional* trailing `s` added (e.g., `_article` or `_articles` to connect to the `article` piece type).
:::

## Filtering related document properties

Often when two Apostrophe documents are connected by a `relationship` field, the original doc only needs one or two properties from the connected doc. For example, an `article` piece may connect to an `author` piece, but only need the author's name and portrait photo. That `author` piece may also contain rich text for a biography, an additional set of photos for a slideshow, and a string field with their home town, but we don't want to send all of that to the `article` piece as it is unnecessary and adds to work done by the server.

A `project` query builder limits the properties of the connected doc that are populated on the original doc. The following configuration would limit the author data to only what we need:

```javascript
_author: {
  label: 'Author',
  type: 'relationship',
  max: 1, // There's only one author
  // Limiting our data here 👇
  builders: {
    project: {
      title: 1, // The author's name is entered as its `title`
      photo: 1
    }
  }
}
```

By doing that, we don't get any slideshow, biography, home town, or other data that isn't needed. The projection filter format comes from the similar MongoDB projection operator.

## Limiting returned data with `ifOnlyOne`

The `ifOnlyOne` option was designed to lighten document data in situations where many of that type of document are being displayed. The primary example of this are the index, or listing, pages.

For example, if a `team` piece type has a relationship field that connects it to many `players` (as in baseball "players"), you may want to display all of the players' information on the individual team page (the [show page](/reference/glossary.md#show-page)). However, on the [index page](/reference/glossary.md#index-page) for all teams, you are not displaying all players for every team, so it lightens the server load to ignore the relationship field in that context. So you might configure the field as such:

```javascript
// `_players` will only be populated when only one team document is being fetched
_players: {
  label: 'Players',
  type: 'relationship',
  withType: 'player',
  ifOnlyOne: true
}
```

## Populating nested relationships using `withRelationships`

It is not unusual for one piece type to have situations with "nested relationships" across piece types. For example, `team` may have a relationship field connecting to `player` pieces, then `player` pieces connect to `specialty` pieces. Imagine that the players had multiple relationship fields, and suddenly the data populated two levels up on teams could get very large.

By default, these "nested relationships" are excluded. So on the `team` show page, `data.piece._players` would include only `specialtiesIds` by default. With the following configuration, that same piece data would *also* include `_specialties`, an array of populated specialty objects.

```javascript
// With this configuration, `_players` will include the populated `_specialties` documents rather than only the specialty `_id` values.
_players: {
  label: 'Players',
  type: 'relationship',
  withType: 'player',
  withRelationships: [ '_specialties' ]
}
```

In the case of double nesting e.g., `_specialties` piece has a `_photo` relationship field with another piece `@apostrophecms/image`, then `_photo` can be accessed as `_specialties._photo`.

```javascript
// With this configuration, `_players` will include the populated `_specialties` and `_photo` documents rather than only the specialty and photo `_id` values.
_players: {
  label: 'Players',
  type: 'relationship',
  withType: 'player',
  withRelationships: [ '_specialties._photo' ]
}
```
