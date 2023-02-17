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

## Options

|  Property | Type | Description |
|---|---|---|
`perPage` | Integer | Search results per page. Defaults to 10. |
[`types`](#types) | Array | An array of page and piece type names to be searched. |
[`filters`](#filters) | Array | An array of filters offered to the user to refine results. |

### Types

The `types` option takes an array of page-type and piece-type document names that will be included within the search results. By default, all page and piece docs are searched unless they have an option of `seachable: false`. Adding an array will restrict any search to just those types of pages and pieces, even if a module has an option of `searchable: true`.

<AposCodeBlock>

```js
module.exports = {
  options: {
    // search only the product piece-type or any blog page-type
    types: [ 'product', 'blog-page' ]
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