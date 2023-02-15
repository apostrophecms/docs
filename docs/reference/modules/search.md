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
[`suggestions`](#suggestions) | Boolean/Object | Provides possible matches based on the URL if no results are found. |
[`types`](#types) | Array | An array of page and piece type names to be searched. |
[`filters`](#filters) | Array | An array of filters offered to the user to refine results. |

### Suggestions

