---
extends: '@apostrophecms/piece-type'
---

# `@apostrophecms/global`

**Alias:** `apos.global`

<AposRefExtends :module="$frontmatter.extends" />

This module populates the `req.data.global` object with content or settings that are utilized site-wide. Like any core module, it comes with some built-in features, and we can add additional configuration by creating a `modules/@apostrophecms/global/index.js` file in our project. Our project-specific configuration will merge gracefully with the defaults that come with the module. New fields are added and grouped identically to any widget or pieces module. The data from these fields is available to templates as `data.global`.

::: note
`@apostrophe/global` is a piece type that only ever has one piece.
:::

## Options
|  Property | Type | Description |
|---|---|---|
|`deferWidgetLoading` | Boolean | If set to `true`, any widget module with the option [`deferred: true`](https://v3.docs.apostrophecms.org/reference/modules/widget-type.html#deferred) will not be loaded until the end of loading the global doc. |

### `deferWidgetLoading`

If set to `true`, the `deferWidgetLoading` option reduces the number of queries required when loading the global doc. Any widget with the option `deferred: true` used on the page will not be loaded until the entire global doc is loaded.

#### Example

<AposCodeBlock>

```javascript
module.exports = {
 options: {
   deferWidgetLoading: true
 },
 fields: {
   add: {
     githubUrl: {
       type: 'url',
       label: 'Organization GitHub url'
     },
     footerMissionStatement: {
       type: 'area',
       label: 'Footer mission statement',
       options: {
         widgets: {
           '@apostrophecms/rich-text': {}
         }
       }
     }
   }
 },
 group: {
   basics: {
     label: 'Basics',
     fields: ['githubUrl', 'footerMissionStatement']
   }
 }
};
```
<template v-slot:caption>
  modules/@apostrophecms/global/index.js
</template>
</AposCodeBlock>

## Related documentation

- [Global settings guide](/guide/global.md)

