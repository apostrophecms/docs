---
extends: '@apostrophecms/module'
---

# `@apostrophecms/pager`

**Alias:** `apos.pager`

<AposRefExtends :module="$frontmatter.extends" />

This module provides helper methods for standard pagination on piece index pages. See the [index page guide](/guide/piece-pages.md#pagination) for a worked example.

## Helpers

All three helpers are synchronous and return plain data rather than markup, so they compose normally in JSX. Reach them through **`helpers.pager`** on the second argument of a template function — not through `apos.pager`, which is the module instance and does not expose them directly.

Each takes a single options object:

```javascript
{
  page: 3,   // The current page number
  total: 10, // The total number of pages
  shown: 5   // Maximum number of interior page numbers
}
```

| Helper | Returns |
| --- | --- |
| `pageRange(options)` | An array of integer page numbers to display, drawn from between `2` and `total - 1`. The first and last pages are rendered separately. |
| `showHeadGap(options)` | `true` if an ellipsis belongs between page 1 and the start of the range. |
| `showTailGap(options)` | `true` if an ellipsis belongs between the end of the range and the last page. |

```javascript
helpers.pager.pageRange({ page: 5, total: 10, shown: 5 });
// [ 3, 4, 5, 6, 7 ]
```

::: warning
None of the three helpers supplies a default for `shown`. If you omit it, `pageRange()` still returns a range but both gap helpers return `false`, so the ellipses silently disappear. Normalize `shown` once and pass the same object to all three.
:::

## Related documentation

- [Piece index page pagination](/guide/piece-pages.md#pagination)
