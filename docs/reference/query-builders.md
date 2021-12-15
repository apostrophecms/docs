---
sidebarDepth: 2
---

# Query builders

Server-side database query builders in Apostrophe help developer refine database document queries or refine the query results in some way. The sections below organize core query builders by the relevant document types.

**See the [database querying guide](#TODO) for general information about using query builders.**

## Builders for all doc types

The following query builders apply to all Apostrophe [doc types](/reference/glossary.md#doc).

### `addUrls()`

```
query.addUrls(false)
```

**Default value:** `true`

The `addUrls` builder controls whether to invoke the `addUrls` method for doc types included in the query results. If set to `false`, `addUrls` methods are not invoked.

This effectively controls whether the query results should include a `_url` property on individual documents, when available. `_url` is a dynamic property (not stored in the database) containing the document's unique URL. Not all documents have a unique URL.

Only piece type modules have an `addUrls` method in Apostrophe core. By default, page documents always include the `_url` property.

### `and()`

```
query.and({ price: { $gte: 0 } })
```

The `and` builder adds additional required criteria to the query. The value should be a MongoDB criteria object (as you would use in the [`find()` operation](https://docs.mongodb.com/v4.4/reference/method/db.collection.find/)). This is the main way to add criteria to a database query. It can be used multiple times to continue adding criteria.

Since this is the main way additional criteria get merged, this method performs a few transformations of the query to make it more readable when `APOS_LOG_ALL_QUERIES=1` is in the environment.

### `archived()`

```
query.archived(false)
```

The `archived` builder tells the query whether or not to include archived documents in the results. It takes boolean value, `undefined`, or `null` (empty).

If the builder value is `false`, `undefined` or this method is never called, the query only returns docs that are *not* in the archive. This is the default behavior for document queries.

If the value is `true` the query returns *only* docs in the archive. Note that permissions would still prevent a typical site visitor from obtaining any results, but an editor might.

If the value is `null` (not `undefined`), the query returns docs regardless of archived status.

### `areas()`

```
query.areas(false)

query.areas([ 'thumbnail' ])
```

**Default value:** `true`

The `areas` builder controls whether to call the `load` methods of widget type managers for widgets in areas. `load` methods are used to do things such as populating relationships in widgets and other asynchronous actions when areas are loaded.

The default value is `true`. Pass `false` to prevent the extra processing for a particular query. This is helpful to make queries faster when detailed area data is not needed.

The value can also be an array containing strings representing area field names or dot paths to nested area fields. For example, with `.areas([ 'thumbnail' ])` you could load only the `'thumbnail'` area for all pages matching the query.

### `attachments()`

```
query.attachments(true)
```

**Default value:** `false`

Passing `true` to the `attachments` builder will annotate all attachment fields in the returned documents with URLs and other metadata (primarily for images). This uses the the `apos.attachment.all` method with the `annotate: true` option.

### `autocomplete()`

```
query.autocomplete('tree')
```

The `autocomplete` builder operates as a sort of fuzzy search for documents. It accepts a string and uses document search text properties to find matches. The string can contain multiple words, but only the final word may be a partial string to find non-exact results. So "tree" will find results with "treehouse," but "treehouses" will not find "treehouse" (it is not meant as an advanced search tool, but can help find similar results).

This will only find partial matches in high-priority properties such as the `title`, or any string, select or checkbox field in the schema of the document.

### `criteria()`

```
query.criteria({ category: { $in: ['animals', 'vegetables'] } })
```

**Default value:** `{}`

The `criteria` builder sets the base MongoDB query criteria, **discarding criteria previously added** using this method or the [`and` builder](#and). The `and` builder is usually better for most cases since it is not destructive. The default value of this builder is an empty object. As with the `and` builder, the criteria format would match that used in the [MongoDB `find` operation]((https://docs.mongodb.com/v4.4/reference/method/db.collection.find/)).

### `defaultSort()`

```
query.defaultSort({ updatedAt: 1 })
```

The `defaultSort` changes the default value for the [`sort` query builder](#sort).  The argument is the same as for the `sort` query builder: an object like `{ updatedAt: 1 }`, including a field name and `1` for ascending or `-1` for descending. See the [MongoDB `sort` method documentation](https://docs.mongodb.com/manual/reference/method/cursor.sort/) for other options. `false` can be passed as an option as well to clear the default sort.

It is distinct from the `sort` builder to distinguish between cases where a default sort should be ignored (for instance, the `search` query builder is present) and cases where a sort is explicitly requested by the user.

In most custom uses the `sort` builder will likely be a more common option.

### `distinctCounts()`

```
const names = query.toDistinct('firstName')
const counts = query.get('distinctCounts')
```

**Default value:** `false`

`.distinctCounts(true)` makes it possible to obtain counts for each distinct value after a call to `toCount()` is resolved by calling `query.get('distinctCounts')`. These are returned as an object in which the keys are the distinct values of the field, and the values are the number of occurrences for each value.

This has a performance impact.

### `_ids()`

```
query._ids([
  'ckwxzxdtr000t4v3rivysoari:en:published',
  'ckwxzxdvc001b4v3rhxvxqgg1:en:published'
])
```

The `_ids` builder causes the query to return only the document with matching `_id` properties and to return them in that order, assuming the documents with the specified IDs exist. All documents are fetched in the locale and mode of the request regardless of the locale suffix of the values. If no locale can be determined via query parameters, the locale is inferred from the first _id in the set.

The query builder can also be called with a string, which is treated as a single document ID.

### `limit()`

```
query.limit(10)
```

The `limit` query builder accepts an integer and limits the number of document results. It returns the first matching documents up to the set limit after taking the [`skip` builder](#skip) into account.

### `locale()`

```
query.locale('es:published')
```

**Default value:** `false`

A valid locale identifier passed to the `locale` builder will tell the query to return results only belonging to that locale, including the mode (`draft` or `published`) after a `:` character. Documents that match the query and have *no locale* (because their doc type is not localized) are also included in the results. Specifically passing `false` (the default value) will use the locale and mode on the `req` request object.

### `log()`

```
query.log(true)
```

**Default value:** `false`

Setting the builder `.log(true)` on a query will log the the query criteria on the server (or the terminal when working on a local machine).

### `next()`

```
query.next({
  _id: 'cgwxzcdvc501b4v3ghxvxqgg1:en:published',
  ...
})
```

**Default value:** `false`

Passing a document object to the `next` builder returns the document that follows it in the current sort order. The document object argument needs to at least include the properties used by the current sort as well as the `_id`. The `_id` is used as a tiebreaker to avoid loops.

### `page()`

```
query.page(5)
```

**Default value:** `1`

The `page` builder is used to request a particular "page," or set, of results when the [`perPage` builder](#perpage) is also used. Page numbers start with `1` (there is no page zero).

### `pageUrl()`

```
query.pageUrl(false)
```

**Default value:** `true`

The `pageUrl` query builder is set to `true` by default and controls whether to add the `._url` property to page documents in the query results. The builder can be set to `false` to disable the `._url` property on a particular query.

The `._url` property will include a site prefix if applicable and is always better to use than the document's `slug` for a URL.

### `permission()`

```
query.permission('edit')
```

The `permission` builder is used to restrict returned documents based on the action name passed as an argument. Only documents on which the `req` object can take the named action are returned. For example, using `.permission('edit')` on the query will only return documents that the requesting user (via `req`) can edit.

Valid action arguments include:
- `'view'`: The `req` has permission to view the documents. This is the default.
- `'edit'`: The `req` has permission to edit the documents.
- `'publish'`: The `req` has permission to publish the documents.
- `false`: Bypass any permission checks. This returns everything regardless of permission level. *Use this with caution.*

In all cases, all of the returned docs are marked with `_edit: true` properties if the user associated with the request is allowed to edit the document and `_published: true` if the user is allowed to publish it. This is useful if you are fetching docs for viewing but also want to know which ones can be edited.

### `perPage()`

```
query.perPage(20)
```

**Default value:** `undefined`

Using the `perPage` builder returns documents in sets of the number passed as an argument. This helps return documents in managable numbers and paginate the results, using the [`page` query builder](#page) to get a specific set of results. This is usually easier than using `skip` and `limit` directly.

After the query completes, with `await query.toArray()` for instance, `query.get('totalPages')` will return the total number of pages.

### `previous()`

```
query.previous({
  _id: 'cgwxzcdvc501b4v3ghxvxqgg1:en:published',
  ...
})
```

**Default value:** `false`

Passing a document object to the `previous` builder returns the document that precedes it in the current sort order. The document object argument needs to at least include the properties used by the current sort as well as the `_id`. The `_id` is used as a tiebreaker to avoid loops.

### `project()`

```
query.project({
  title: 1,
  category: 1,
  updatedAt: 1
})
```

The `project` builders sets the [MongoDB projection](https://docs.mongodb.com/manual/tutorial/project-fields-from-query-results/), specifying the document properties to included in the returned documents. The argument should be an object with properties of desired field names set to `1` to include those fields. Negative projections (`category: 0`) are currently not supported.

In addition to database properties, Apostrophe provides two dynamic properties that can be included in the `project` builder object:
- `_url: 1` will include all properties required to generate an accurate `_url` property for each returned document.
- `_relationshipName: 1` will add the properties required to permit a field of type `relationship` to be loaded, even though the related documents are not stored redundantly in the database. In this example, the name of the field is `_relationshipName`. `_articles: 1` could do the same for a relationship to `article` pieces.

### `relationships()`

```
query.relationships(false)

query.relationships(['_author'])
```

**Default value:** `true`

By default, [relationship](/guide/relationships.md) data are fetched for queried documents. The `relationships` builder can prevent or limit this.

Pass `false` to the builder to not retrieve any relationship data. You may also pass an array of relationship names, which will fetch only those relationships and those intermediate to them (using dot notation).

### `sort()`

```
query.sort({ updatedAt: -1, title: 1 })
```

The `sort` builder sets the sorting order for returned documents. If not set, the default is used, from the [`defaultSort` builder](#defaultsort) or module configuration. The sort argument is an object like `{ updatedAt: 1 }`, including a field name and `1` for ascending or `-1` for descending.  See the [MongoDB `sort` method documentation](https://docs.mongodb.com/manual/reference/method/cursor.sort/) for other options.

`false` can be passed as an option to use *no sort definition at all*. This can be helpful when using MongoDB operators like `$near`, which already sort.

If this method is never called or the argument is `undefined`, a case-insensitive sort on the title is normally the default. If `search()` has been called, then a sort by search result quality is the default.

If the query sorts on a field that is defined in a doc type's schema with the `sortify: true` option, then this query builder will automatically substitute a "sortified" version of the field: case-insensitive and ignoring extra whitespace and punctuation. This provides a more natural sort than MongoDB normally does.

### `skip()`

```
query.skip(10)
```

The `skip` builder accepts a number as an argument, then skips that number of documents in a query's results. This affects `toArray` and `toObject`. It does not affect `toDistinct` or `toMongo`.

### `search()`

```
query.search('tree')
```

The `search` builder limits results to those matching the string passed as an argument. Search is implemented using MongoDB's `$text` operator and a full text index. The `search` builder does not support partial matches. For that, see the [`autocomplete` builder](#autocomplete).

If this query builder is set, the `sort` query builder will default to sorting by search quality. This is important because the worst of the full-text search matches will be of very poor quality.

### `type()`

```
query.type('product')
```

The `type` builder can be used to limit a query to only one particular doc type. Pass the doc type name (string) as an argument.

Generally you don't want to call this method directly. It will be better to use a doc type module's `find` method, which limits to that type automatically. You can also include the doc type name as the `type` criteria in a generic `find()` method's arguments.

### `withPublished()`

```
query.withPublished(true)
```

If the `withPublished` builder is set to `true`, then each document in the results will include a `_publishedDoc` property. That property will be set to the published version of that document. This is really only useful when querying for draft documents.

## Page document query builders

The following query builders are only available on query created with the page module's `apos.page.find` method and [page REST API routes](/reference/api/pages.md).

### `ancestors()`

```
query.ancestors(true)

query.ancestors({ children: true })
```

**Default value:** `false`

Setting the `ancestors` builder to `true` retrieves the array of "ancestors" for each returned page and assigns them to the `_ancestors` property. Page ancestors are those that precede a given page in the page tree hierarchy. The home page is `_ancestors[0]`. A returned page is not included in its own `_ancestors` array.

If the builder's argument is an object, the builder does all of the above, and also calls the query builders present in the object *on the query that fetches the ancestors*. For example, you can pass `{ children: true }` to fetch the children of each ancestor as the `_children` property of each ancestor, or pass `{ children: { depth: 2 } }` to get two layers of child pages.

`ancestors` also has its own `depth` option, but it might not do what you think. If the `depth` option is present as a top-level property of the `ancestors` builder argument, then only that number of ancestors are retrieved, counting backwards from the immediate parent of each page. So `{ depth: 2 }` retrieves only the two closest ancestors.

### `children()`

```
query.children(true)

query.children({ depth: 1 })
```

**Default value:** `false`

The `children` builder is used to include the "children" of returned pages in an array on a `_children` property. If `children(true)` is called, it will return all children of a given page. If the argument is an object, it may have a `depth` property to fetch a specific number of child layers. Any
other properties are passed on *as builders for the query that fetches the children*.

### `isPage()`

```
query.isPage(true)
```

**Default value:** `true`

Passing `true` to the `isPage` builder ensures that results will only include documents that are pages.

### `orphan()`

```
query.orphan(true)
```

The `orphan` builder is used to return documents based on their "orphan" status. Orphans are pages that are not returned by the default behavior of the `children` query builder and thus are left out of standard navigation.

If flag is `true`, return only orphan docs. If flag is `false`, return only docs that are not orphans. If `.orphan(null)` or `undefined` is called, or this method is never called, return docs regardless of orphan status.

## Image document query builders

The following query builders are only available on query created with the image module's `apos.image.find` method and [piece REST API routes](/reference/api/piece.md) when dealing with the `@apostrophecms/image` piece type.


### `minSize()`

```
query.minSize([ 600, 800 ])
```

The `minSize` query builder can be used to set a minimum size for returned image documents. The argument should be an array with two values: the image width and the image height, in that order. The sizes are measured in pixels.
