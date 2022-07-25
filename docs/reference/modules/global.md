---
extends: '@apostrophecms/piece-type'
---

# `@apostrophecms/global`

**Alias:** `apos.global`

<AposRefExtends :module="$frontmatter.extends" />

This module populates the `req.data.global` with content or settings that are utilized site-wide. It is configured through "implicit sub-classing" of the schema fields present in the parent module. New fields are added and grouped identically to any widget or pieces module. The data from these fields is available to templates as `data.global`.

::: note
There can only be *one* global doc.
:::

## Options
|  Property | Type | Description |
|---|---|---|
|`deferWidgetLoading` | Boolean | If set to `true`, any widget with the option `defer: true` will not be loaded until the end of loading the global doc. |

### `deferWidgetLoading`

If set to `true`, the `deferWidgetLoading` option reduces the number of queries required when loading the global doc. Any widget with the option `defer: true` used on the page will not be loaded until the entire global doc is loaded.

#### Example

<AposCodeBlock>

```javascript
module.exports = {
 options: {
   deferWidgetLoad: true
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
         // Other fields with multiple widget types
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

