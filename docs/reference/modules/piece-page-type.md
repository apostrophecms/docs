---
extends: '@apostrophecms/doc-type'
---

# `@apostrophecms/piece-page-type`

<AposRefExtends :module="$frontmatter.extends" />

This module cooperates with the 'piece-type' module to expose two specialized views. The [index page](https://v3.docs.apostrophecms.org/reference/glossary.html#index-page) displays all pieces of a particular `piece-type` in a paginated, filterable manner. The [show page](https://v3.docs.apostrophecms.org/reference/glossary.html#show-page) is for presenting individual pieces. These features are added to those exposed by the  ['@apostrophecms/page'](/reference/modules/page.md) module.

Once an editor adds a page of this type to the site via user interface, it becomes possible to view a listing of pieces by visiting that page's URL, and to view individual pieces of the relevant type by adding the slug of any piece to the page's URL, like this: `/slug/of/page/slug-of-piece`

This default behavior can be customized as described below.

It is possible to add more than one such page to the site for the same type, and to add custom logic to decide which pieces should be associated with each such page.

## Options

|  Property | Type | Description |
|---|---|---|
| [`next`](#next) | Boolean \|\| Object | If set to `true`, `data.next` is the next piece based on the sort. |
| [`perPage`](#perpage) | Integer | The number of pieces to include in a set of `GET` request results. |
| [`piecesFilters`](#piecesfilters) | Array | Takes an array of objects where each contains a `name` key and a value of a field in the piece to filter on. |
| [`pieceModuleName`](#piecemodulename) | String | Optionally sets the `piece-type` to a specific name other than the default inferred from the module name. |
| [`previous`](#previous) | Boolean \|\| Object | If set to `true`, `data.previous` is the previous piece based on the sort. |

### `next`
If this option is set to true, it exposes the next piece in the current [sort order](https://v3.docs.apostrophecms.org/reference/module-api/module-options.html#sort) as `req.data.next` (`data.next` in the template) when serving a [show page](https://v3.docs.apostrophecms.org/reference/glossary.html#general-terms). This can be used to provide a link to the next item in a series (e.g., the next oldest blog post).

This option can also be set to an object whose keys are [query builders](https://v3.docs.apostrophecms.org/reference/query-builders.html#query-builders), such as `project`, and whose values are the parameters passed to each query builder.

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    next: true
  },
  // …
}

// OR

module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    // The next article piece would be returned with only the `title, `_url`
    // and `lastPublishedAt` properties.
    next: {
      project: {
        title: 1,
        _url: 1,
        lastPublishedAt: 1
      }
    }
  },
  // …
}
```
<template v-slot:caption>
  modules/article-page/index.js
</template>
</AposCodeBlock>

### `perPage`
The `perPage` option should be set to an integer as a value and specifies the number of pieces displayed per page for the `index.html` page. It is set to 10 items per page by default.

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    perPage: 20
  },
// …
}
```
  <template v-slot:caption>
    modules/article-page/index.js
  </template>
</AposCodeBlock>

### `piecesFilters`
The `piecesFilters` takes an array of objects to assist in filtering on the index page. Each object must have a `name` property associated with a valid [query builder](https://v3.docs.apostrophecms.org/reference/module-api/module-overview.html#queries-self-query). 

These include:
* Custom query builders configured in an app that include a `launder` method
* Field names whose field types automatically get builders:
    - boolean
    - checkboxes
    - date
    - float
    - integer
    - relationship
    - select
    - slug
    - string
    - url

When the index page is served, filter data will be returned in the `req.data.piecesFilters` object (`data.piecesFilters` in the template). This object consists of an array for each configured filter. That array contains objects with `value` and `label` properties for every `piece-type` that matches the filter. If `counts: true` is included for the filter query, each object in the array will also have a `count` property with the number of matching pieces.

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Book',
    pluralLabel: 'Books'
  },
  fields: {
    add: {
      _author: {
        label: 'Author',
        type: 'relationship'
      },
      category: {
        label: 'Category',
        type: 'select',
        choices: [
          // category choices here
        ]
      }
    }
    // …
  }
};
```
  <template v-slot:caption>
    modules/book/index.js
  </template>
</AposCodeBlock>

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    piecesFilters: [
      { name: '_author' },
      {
        name: 'category',
        counts: true
      }
    ]
  }
};
```
  <template v-slot:caption>
    modules/book-page/index.js
  </template>
</AposCodeBlock>

<AposCodeBlock>

```
{
  _author: [
    { value: 'Gibson', label: 'Gibson' },
    { value: 'Herbert', label: 'Herbert' },
    { value: 'Le Guin', label: 'Le Guin' }
  ],
  category: [
    { value: 'cyberpunk', label: 'cyberpunk', count: 4 },
    { value: 'dystopian', label: 'dystopian', count: 9 },
    { value: 'fantasy', label: 'fantasy', count: 7 }
  ] 
}
```
<template v-slot:caption>
data.piecesFilters
</template>
</AposCodeBlock>

### `pieceModuleName`
Piece page types are associated with a single piece type. If named with the pattern `[piece name]-page`, the associated piece type will be identified automatically. You can override this pattern by explicitly setting `pieceModuleName` to an active piece type. This is useful if there is more than one piece page type for a single piece type (e.g., to support different functionality in each).

<AposCodeBlock>

```javascript
// 👆 This module name would look for a piece type
// named `fiction` if not for `pieceModuleName`
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    pieceModuleName: 'book'
  }
  // Code to select and group only fiction books
  // …
};
```
<template v-slot:caption>
modules/fiction-page/index.js
</template>
</AposCodeBlock>

### `previous`
If this option is set to true, it exposes the previous piece in the current [sort order](https://v3.docs.apostrophecms.org/reference/module-api/module-options.html#localized) as `req.data.previous` (`data.previous` in the template) when serving a [show page](https://v3.docs.apostrophecms.org/reference/glossary.html#general-terms). This can be used to provide a link to the previous item in a series (e.g., the next newest blog post).

This option can also be set to an object whose keys are [query builders](https://v3.docs.apostrophecms.org/reference/query-builders.html#query-builders), such as `project`, and whose values are the parameters passed to each query builder.

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    previous: true
  },
  // …
}

// OR

module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    // The previous article piece would be returned with only the `title`, `_url`
    // and `lastPublishedAt` properties.
    next: {
      project: {
        title: 1,
        _url: 1,
        lastPublishedAt: 1
      }
    }
  },
  // …
}
```
<template v-slot:caption>
  modules/article-page/index.js
</template>
</AposCodeBlock>

## Related Documentation

* [Piece index and show pages](https://v3.docs.apostrophecms.org/guide/piece-pages.html)
* [Piece page type options](https://v3.docs.apostrophecms.org/reference/module-api/module-options.html#options-for-piece-page-types)

## Featured methods
The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/piece-page-type/index.js) for all the modules that belong to this module.

### `indexQuery(req)`
This method should be overridden for a piece-type to call additional [query builders](https://v3.docs.apostrophecms.org/reference/query-builders.html#query-builders) when generating the index page.

### `async beforeIndex(req)`
This method is called before `indexPage`. Within the core module it does nothing, so it can be easily overridden by supplying a new method in the `methods` section of the custom module. It is a convenient method for manipulating the `req` being supplied to that page.

### `async beforeShow(req)`
This method is called before `showPage`. Within the core module it does nothing, so it can be easily overridden by supplying a new method in the `methods` section of the custom module. It is a convenient method to extend for manipulating the `req` being supplied to that page.

### `dispatchAll()`
This method can be extended to override the default behavior of invoking `showPage` if the URL has an additional path after the base, e.g. `/blog/good-article`. As example, you could override to use `/:year/:month/:day/:slug` to invoke `self.showPage`. This should be used in conjunction with the [`buildUrl()`](#buildurl-req-page-piece)) method of this module. See [@apostrophecms/page-type](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/page-type/index.js) for more about what you can do with dispatch routes.

### `buildUrl(req, page, piece)`
This method can be overridden to change the URLs that are generated as the `_url` property for individual pieces. Note that the [`dispatchAll`](#dispatchall) method often must also be overridden to ensure those URLs actually reach those pieces.

### `filterByIndexPage(query, page)`
This method invokes query builders on the supplied query argument to ensure it only fetches results appropriate to the given page. This is typically done when there is more than one pieces-page per page type. Within the core module it does nothing, so it can be easily overridden by supplying a new method in the `methods` section of the custom module. This should be used in conjunction with the [`chooseParentPage`](#chooseparentpage-pages-piece) method of this module.

### `chooseParentPage(pages, piece)`
The `pages` parameter of this method takes an array of all of the index pages for a particular piece-type, and the `piece` parameter is an individual piece-type name. The default version of this method will give a warning if it sees more than one page in the array, as it is up to the developer to override this method to provide a sensible way of deciding which page is the best 'parent' for each piece.