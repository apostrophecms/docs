---
title: "Page Tree Navigation"
---

# Page Tree Navigation

Building a page tree in Apostrophe 3 is largely the same as in Apostrophe 2. For a quick refresh, in template files:

- `data.home` is the home page.
- `data.home._children` is an array of the home page's top-level children.
- `data.page` is the current page.
- `data.page._children` contains the children of the current page.
- `data.page._ancestors` contains the ancestors of `data.page`.
- `data.page._ancestors[data.page._ancestors.length - 1]._children` is a pattern to get the peers of the current page, including itself.
- By default, one level of `_children` are available on each ancestor, including the home page, and on `data.page` itself. If you want more for dropdown menus, you can configure the `@apostrophecms/page` module to give you more:

```js
// in modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    ancestors: {
      // Children of ancestors of `data.page`
      children: {
        depth: 2
      }
    },
    // Children of `data.page`
    children: {
      depth: 2
    }
  }
}
```

Bear in mind that there are tradeoffs between what you choose to load and the performance of the site. `depth: 2` usually does not have a significant performance impact.
