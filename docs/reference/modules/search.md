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

If no `types` option is set, the `@apostrophecms/search` module emits the `determineTypes` server side event with the array of registered types that can be modified in a [`handlers(self)` function](reference/module-api/module-overview.html#handlers-self). This can be used to pass a custom set of searchable page and piece type document names. This is primarily used by each of the page and piece type documents to self register for being searchable if they don't have an explicit option of `searchable: false`. **Note:** this event is emitted after recieving the `modulesRegistered` event, so it only happens once during initial startup - use with care!

<AposCodeBlock>

```js
module.exports = {
  // remainder of code
  handlers(self) {
    return {
      '@apostrophecms/search:determineTypes': {
        async modifyTheSearch(types) {
          // this limits searches to only the 'friendList' piece-type
          self.types = [
            'friendList'
          ]
        }
      }
    }
  }
};

```
<template v-slot:caption>
modules/friendList/index.js
</template>
</AposCodeBlock>

### Filters

The `filters` option takes an array of objects that each have a `name` and `label` property.



