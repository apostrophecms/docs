---
title: "Page tree Navigation"
---

# Page Tree Navigation

Building a page tree in Apostrophe 3 is largely the same as in Apostrophe 2. For a quick refresh:

- `data.home` is the home page.
- `data.home._children` contains its top-level children (tabs).
- `data.page` is the current page.
- `data.page._children` contains the children of the current page.
- `data.page._ancestors[data.page._ancestors.length - 1]._children` contains the peers of the current page, including itself.
- `data.page._ancestors` contains the ancestors of `data.page`.
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
