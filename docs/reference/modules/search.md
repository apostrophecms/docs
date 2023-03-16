---
extends: '@apostrophecms/module'
---

# `@apostrophecms/search`

**Alias:** `apos.search`

The `@apostrophecms/search` module implements a sitewide search powered by the full-text search features of MongoDB. The module also provides the `@apostrophecms/search` page type to be used as a [parked page](/reference/modules/page.html#park). Like other page types, the module must be added to your `app.js` and project level `@apostrophecms/page/index.js` files.

<AposCodeBlock>

```js
module.exports = {
  options: {
    park: [
      {
        slug: '/search',
        parkedId: 'search',
        title: 'Search',
        type: '@apostrophecms/search'
      }
    ]
  }
};

```
<template v-slot:caption>
modules/@apostrophecms/page/index.js
</template>
</AposCodeBlock>

## Customizing the search template

The `@apostrophe/search` module template can be customized through adding files to the project-level `modules/@apostrophecms/search/views` folder. The default template is `index.html`. This file can be copied to your project-level folder for modification or used as an example to build a page from scratch. The main block of this template contains a form for adding any filters to the search if the `filters` option has been populated, as well as the query terms. Below the form is a section to output the search results returned to the page in the `data.doc` object. Finally, the page includes the [standard pagination section](/guide/piece-pages.md#pagination). In this case, it is added using `{% include "pager.html" %}` to load it in from another file in the `views` folder so that it can be easily reused. You can elect to add the pager directly to your project template or keep it as a separate file.

## Options

|  Property | Type | Description |
|---|---|---|
`perPage` | Integer | Search results per page. Defaults to 10. |
[`types`](#types) | Array | An array of page and piece type names to be searched. |
[`filters`](#filters) | Array | An array of filters offered to the user to refine results. |

### Types

The `types` option takes an array of page-type and piece-type document names that will be included within the search results. By default, all page and piece docs are searchable. Piece types can opt out of searching by adding an option of `seachable: false`. Adding an array to the `types` option will provide search results from just those types of pages and pieces, regardless of the value of the `searchable` option of any piece type. Excluding a page type from the `types` array is the only way to exclude search results from a particular page type.

<AposCodeBlock>

```js
module.exports = {
  options: {
    // search only the product piece-type, blog piece-types, and blog page-types
    // not adding 'product-page' will exclude results from product `index.html` page
    // including '@apostrophecms/blog-page' will include the 'index.html' blog page,
    // including `@apostrophecms/blog` will include results from individual 'show.html'pages
    types: [ 'product', '@apostrophecms/blog', '@apostrophecms/blog-page' ]
  }
};

```
<template v-slot:caption>
modules/@apostrophecms/search/index.js
</template>
</AposCodeBlock>

### Filters

The `filters` option takes an array of objects that each have `name` and `label` properties. The `name` key takes a piece or page type document name as value. The `label` key takes a l10n-localizable string that is presented to the user. On the search page, the user will be presented with a list of filters by label, along with a checkbox to toggle the filter on and off. In addition to the filters derived from this array, users will also be presented with an `Everything else` filter that will allow the user to filter any other piece or page documents that are not included in the named filters.

<AposCodeBlock>

```js
module.exports = {
  options: {
    filters: [
      {
        name: 'product',
        label: 'Product'
      },
      {
        name: 'default-page',
        label: 'Default Page'
      }
    ]
  }
};

```

<template v-slot:caption>
modules/@apostrophecms/search/index.js
</template>
</AposCodeBlock>

## Module tasks

### `index`

Full command: `node app @apostrophecms/search:index`

Rebuild the search index. Normally this happens automatically. This should only be needed if you have changed the "searchable" property for various fields or types.