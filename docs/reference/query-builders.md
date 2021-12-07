---
sidebarDepth: 2
---

# Query builders

Database query builders in Apostrophe help developer refine database document queries or refine the query results in some way. All official query builders are written to either work as intended or to have no effect, at worst. The sections below organize core query builders by the relevant document types.

**See the [database querying guide](#TODO) for general information about using query builders.**

## `All doc types`

The following query builders apply to all Apostrophe [doc types](/reference/glossary.md#doc).

### `addLateCriteria()`

```
query.addLateCriteria({
  geo: {
    $near: [ 43.019590, -87.909290 ],
    $maxDistance: 10
  }
 })
```

The `addLateCriteria` builder is an opportunity to add query criteria to merge directly into the final criteria object that will go to MongoDB. This is meant to be used only in cases where MongoDB forbids the use of an operator inside an `$and` array, such as the `$near` operator.

### `addUrls()`

```
query.addUrls(false)
```

The `addUrls` builder controls whether to invoke the `addUrls` method for doc types included in the query results. The builder defaults to `true`. If set to false, `addUrls` methods are not invoked.

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

The `areas` builder controls whether to call the `load` methods of widget type managers for widgets in areas. `load` methods are used to do things such as populating relationships in widgets and other asynchronous actions when areas are loaded.

The default value is `true`. Pass `false` to prevent the extra processing for a particular query. This is helpful to make queries faster when detailed area data is not needed.

The value can also be an array containing strings representing area field names or dot paths to nested area fields. For example, with `.areas([ 'thumbnail' ])` you could load only the `'thumbnail'` area for all pages matching the query.

### `attachments()`

```
query.attachments(true)
```

Passing `true` to the `attachments` builder will annotate all attachment fields in the returned documents with URLs and other metadata (primarily for images). This uses the the `apos.attachment.all` method with the `annotate: true` option. The builder defaults to `false`.


<!-- Start from here. -->


### `autocomplete()`

`.autocomplete('sta')` limits results to docs which are a good match for
a partial string beginning with `sta`, for instance `station`. Appropriate words
must exist in the title or other text schema fields of
the doc (autocomplete is not full text body search). Those words
are then fed back into the `search` query builder to prioritize the results.

### `children()`

def: false

If `.children(true)` is called, return all children of a given page
as a `._children` array property of the page. If the argument is an
object, it may have a `depth` property to fetch nested children. Any
other properties are passed on to the query builder when making the query
for the children, which you may use to filter them.

### `choices()`

def: false

### `counts()`

def: false

Alternative to `choices` that also returns a count property for each choice,
has a higher impact on the db

### `criteria()`

def: `{}`

`.criteria({...})` Sets the MongoDB criteria, discarding
criteria previously added using this
method or the `and` method. For this reason,
`and` is a more common choice. You can also
pass a criteria object as the second argument
to any `find` method.

### `defaultSort()`

`.defaultSort({ title: 1 })` changes the default value for the `sort` query builder.
The argument is the same as for the `sort` query builder: an
object like `{ title: 1 }`. `false` can be passed to clear
a default.

This query builder is called by @apostrophecms/piece-type based on its
`sort` configuration option.

It is distinct from the `sort` feature so that we can
distinguish between cases where a default sort should be ignored
(for instance, the `search` query builder is present) and cases
where a sort is explicitly demanded by the user.

### `distinctCounts()`

def: false
`.distinctCounts(true)` makes it possible to obtain
counts for each distinct value after a call to
`toCount()` is resolved by calling `query.get('distinctCounts')`.
These are returned as an object in which the keys are
the distinct values of the field, and the values
are the number of occurrences for each value.

This has a performance impact.

### `_ids()`

`._ids([ id1, id2... ])` causes the query to return only those
documents, and to return them in that order, assuming the documents
with the specified ids exist. All documents are fetched in the
same locale regardless of the locale suffix of the _ids. If
no locale can be determined via query parameters, the locale is
inferred from the first _id in the set.
        //
Can also be called with a string, which is treated as a single `_id`.

### `limit()`

`.limit(10)` limits the result to the first 10 matching
documents, after skip is taken into account. Affects `toArray` only.

### `locale()`

### `log()`

def: false

If `.log(true)` is invoked, the query criteria are logged to the console.

### `next()`

`.next({ doc object goes here })`. If set to a doc object, this query builder will limit
results to the docs that follow it in the current sort order.
        //
In addition to the current sort, the `_id` is used as a tiebreaker sort to avoid loops.

### `page()`

`.page(5)` sets the current page number to the 5th page
overall (there is no page 0). You must also
use `perPage`.

Used by `@apostrophecms/piece-type` and `@apostrophecms/piece-page-type`.

### `pageUrl()`

def: true
All docs that are part of the page tree (they have a slug
beginning with a `/`) receive a `._url` property, which takes the
sitewide prefix into account if necessary. Always use this property.
Never use the slug as a URL.
        //
This feature is turned on by default, but you may chain
`.pageUrl(false)` to disable it for a particular query.
        //
Note that many type-specific queries, such as those for `pieces`,
also add a `._url` property appropriate to their type if a suitable
pieces page is available.

### `permission()`

`.permission('admin')` would limit the returned docs to those for which the
user associated with the query's `req` has the named permission.
By default, `view` is checked for. You might want to specify
`edit`.

USE WITH CARE: If you pass `false`, permissions checks are disabled
for this particular query.

If this method is never called, or you pass
`undefined` or `null`, `view` is still checked for.

In all cases, all of the returned docs are marked
with `_edit: true` properties
if the user associated with the request is allowed to
do that. This is useful if you are fetching
docs for viewing but also want to know which ones
can be edited.

### `perPage()`

`.perPage(10)` allows you to paginate docs rather than using
skip and limit directly.

Sets the number of docs per page and enables the
use of the `page` query builder to indicate the current page number.

Used by `@apostrophecms/piece-type` and `@apostrophecms/piece-page-type`.

### `previous()`

`.previous({ doc object goes here })`. If set to a doc object, this query builder will limit
results to the docs that precede it in the current sort order.
        //
In addition to the current sort, the `_id` is used as a tiebreaker sort to avoid loops.

### `project()`

        `.project({...})` sets the MongoDB projection. You can also
        set the projection as the third argument to any
        `find` method. The name was changed in 3.x to match
        MongoDB's name for this chainable method of their
        cursors.

### `relationships()`

def: true

`.relationships(true)`. Fetches relationships by default, for all types retrieved,
based on the schema for each type. If `relationships(false)` is
explicitly called no relationships are fetched. If
`relationships([ ... ])` is invoked with an array of relationship names
only those relationships and those intermediate to them
are fetched (dot notation). See `@apostrophecms/schema`
for more information.

### `sort()`

`.sort({ title: 1 }` determines the sort order, similar to how
MongoDB does it, with some extra features.

If `false` is explicitly passed, there is
*no sort at all* (helpful with `$near`).

If this method is never called or the argument is
undefined, a case-insensitive sort on the title
is the default, unless `search()` has been
called, in which case a sort by search result
quality is the default.

If you sort on a field that is defined in the
schema for the specific doc type you are finding,
and that field has the `sortify: true` option in
its schema field definition, then this query builder will
automatically substitute a "sortified" version of
the field that is case-insensitive, ignores
extra whitespace and punctuation, etc. for a
more natural sort than MongoDB normally provides.

For instance, `title` has `sortify: true` for all
doc types, so you always get the more natural sort.

### `skip()`
`.skip(10)` skips the first 10 matching documents. Affects
`toArray` and `toObject`. Does not affect
`toDistinct` or `toMongo`.

### `search()`
`.search('tree')` limits results to those matching that text search.
Search is implemented using MongoDB's `$text` operator and a full
text index.
        //
If this query builder is set, the `sort` query builder will default to sorting
by search quality. This is important because the worst of the
full-text search matches will be of very poor quality.

### `type()`

`.type('product')` causes the query to only retrieve documents of the
specified type. Filters out everything else.
        //
Generally you don't want to call this method directly.
Call the `find()` method of the doc type manager
for the type you are interested in. This will also
give you a query of the right subclass.

### `withPublished()`

If set to true, attach a `_publishedDoc` property to each draft document,
containing the related published document.

## `any-page-type`

### `isPage()`

Added by `any-page-type`. `.isPage(true)` filters to only documents that are pages. Defaults to `true`

### `ancestors()`

def: `false`

`.ancestors(true)` retrieves the ancestors of each returned page and assigns them to the `._ancestors` property. The home page is `._ancestors[0]`. The page itself is not included in its own `._ancestors` array.

If the argument is an object, do all of the above, and also call the query builders present in the object on the query that fetches the ancestors. For example, you can pass `{ children: true }` to fetch the children of each ancestor as the `._children` property of each ancestor, or pass `{ children: { depth: 2 } }` to get really fancy.

`ancestors` also has its own `depth` option, but it doesn't do what you think. If the `depth` option is present as a top-level property of the object passed to `ancestors`, then only that many ancestors are retrieved, counting backwards from the immediate parent of each page.

### `orphan()`

If `.orphan(null)` or `undefined` is called or this method
is never called, return docs regardless of
orphan status. if flag is `true`, return only
orphan docs. If flag is `false`, return only
docs that are not orphans. Orphans are pages that
are not returned by the default behavior of the
`children` query builder implemented by `@apostrophecms/any-page-type`
and thus are left out of standard navigation.

### `reorganize()`

def: null

Use .reorganize(true) to return only pages that
are suitable for display in the reorganize view.
The only pages excluded are those with a `reorganize`
property explicitly set to `false`.

## `image`

### `minSize()`

## `submitted-draft`

### `_type`

def: null

