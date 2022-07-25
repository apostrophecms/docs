---
extends: '@apostrophecms/doc-type'
---

# `@apostrophecms/piece-page-type`

<AposRefExtends :module="$frontmatter.extends" />

This module cooperates with the 'piece-type' module to expose two specialized views. The [index page](https://v3.docs.apostrophecms.org/reference/glossary.html#index-page) displays all pieces of a particular `piece-type` in a paginated, filterable manner. The [show page](https://v3.docs.apostrophecms.org/reference/glossary.html#show-page) is for presenting individual pieces. These features are added to those exposed by the  ['@apostrophecms/page'](/reference/modules/page.md) module.

## Options

|  Property | Type | Description |
|---|---|---|
| [`next`](#next) | Boolean \|\| Object | If set to `true`, `data.next` is the next piece based on the sort. |
| [`perPage`](#perpage) | Integer | The number of pieces to include in a set of `GET` request results. |
| [`piecesFilters`](#piecesFilter) | Array | Takes an array of objects where each contains a `name` key and a value of a field in the piece to filter on. |
| [`pieceModuleName`](#pieceModuleName) | String | Optionally sets the `piece-type` to a specific name other than the default set by the module name. |
| [`previous`](#previous) | Boolean \|\| Object | If set to `true`, `data.previous` is the previous piece based on the sort. |

### `next`
If this option is set to true, it exposes the next piece in the current [sort order](https://v3.docs.apostrophecms.org/reference/module-api/module-options.html#sort) as `req.data.next` (`data.next` in the template) when serving a [show page](https://v3.docs.apostrophecms.org/reference/glossary.html#general-terms). This can be used to provide a link to the next item in a series (e.g., the next oldest blog post).

This option can also be set to an object containing an object with a key of `project` and values which will be used as a query builder for retrieving the next piece document.

<AposCodeBlock>

```javascript
module.exports = {
  extend: ‘@apostrophecms/piece-page-type’,
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
The `perPage` option receives an integer as value and sets the number of pieces that will be displayed per page for the `index.html` page. It is set to 10 items per page by default.

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    perPage: 20 // REST `GET` requests will return 20 pieces per page
  },
// …
}
```
  <template v-slot:caption>
    modules/article-page/index.js
  </template>
</AposCodeBlock>

### `piecesFilter`
The `piecesFilter` takes an array of objects to assist in filtering on the index page. Each object must have a `name` property associated with a valid [query builder](https://v3.docs.apostrophecms.org/reference/module-api/module-overview.html#queries-self-query). 

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

When the index page is served, configured filters will be represented on a `req.data.piecesFilter` object (`data.piecesFilter` in the template). If you include `counts: true` in a filter object the number of pieces matching that filter are included in the `req.data.piecesFilter` properties.

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

This option can also be set to an object containing an object with a key of `project` and values which will be used as a query builder for retrieving the previous piece document.

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
This method should be overridden for a piece-type to call additional [query builders](https://v3.docs.apostrophecms.org/reference/query-builders.html#query-builders) by default.

### `beforeIndex(req)`
This method is called before `indexPage`. It is a convenient method to extend for manipulating the `req` being supplied to that page.

### `beforeShow(req)`
This method is called before `showPage`. It is a convenient method to extend for manipulating the `req` being supplied to that page.

### `dispatchAll()`
This method can be extended to override the default behavior of invoking `showPage` if the URL has an additional path after the base, e.g. `/blog/good-article`. As example, you could override to use `/:year/:month/:day/:slug` to invoke `self.showPage`. This should be used in conjunction with the [`buildUrl()`](#buildurl-req-page-piece)) method of this module. See [@apostrophecms/page-type](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/page-type/index.js) for more about what you can do with dispatch routes.

### `buildUrl(req, page, piece)`
This method should be extended to build custom URL for use in the [`dispatchAll`](#dispatchall) method.

### `filterByIndexPage(query, page)`
This method invokes query builders on the supplied query argument to ensure it only fetches results appropriate to the given page. This is typically done when there is more than one pieces-page per page type. This should be used in conjunction with the [`chooseParentPage`](#chooseparentpage-pages-piece) method of this module.

### `chooseParentPage(pages, piece)`
This `pages` parameter of this method takes an array of all of the index pages for a particular piece-type, and the `piece` parameter is an individual piece-type name. By default, it will return the first item in the `pages` array, but the developer should map pieces to pages in a way that makes sense for their design. This method will give a warning if the [`filterByIndexPage`](#filterbyindexpage-query-page) method has not been overridden.