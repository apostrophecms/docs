---
extends: '@apostrophecms/module'
---

# `@apostrophecms/area`

**Alias:** `apos.area`

<AposRefExtends :module="$frontmatter.extends" />

This module manages [areas](../../guide/areas-and-widgets.md) and the widgets inside them. It renders areas, loads their widgets, and provides the editing interface for adding, selecting and changing widgets on the page.

## Featured methods

### `addCreateWidgetOperation(operation)`

Adds an entry to the "add content" menus of areas. When an editor chooses it, Apostrophe opens a modal, and the widget or widgets the modal returns are inserted into the area. Use it for ways of creating content that a single widget type can't express, such as inserting a group of widgets from a template.

Call it while your module initializes:

<AposCodeBlock>

```javascript
export default {
  init(self) {
    self.apos.area.addCreateWidgetOperation({
      label: 'Insert section template',
      description: 'Add a heading, text and image as one group',
      modal: 'SectionTemplateModal',
      props: {
        templates: [ 'intro', 'feature' ]
      },
      ifTypesIntersect: [ '@apostrophecms/rich-text', '@apostrophecms/image' ]
    });
  }
};
```
<template v-slot:caption>
modules/section-template/index.js
</template>
</AposCodeBlock>

The `operation` object takes these properties:

| Property | Type | Description |
|---|---|---|
| `label` | String | The menu entry's text or i18n key. |
| `description` | String | Help text or i18n key shown under the label in the expanded "add content" menu. |
| `modal` | String | The name of the modal component to open. |
| `props` | Object | Props passed to the modal. |
| `ifTypesIntersect` | Array | Widget type names. The entry appears only in areas that allow at least one of these types. Without it, the entry appears in every area. |

The modal receives `props`, plus the area's `options` and `fieldId`. To insert content, it emits `modal-result` with either:

- **A widget**, which is inserted at the position the editor chose.
- **An array of widgets**, which are inserted in that order as one undo step and left selected. If the area's `max` leaves too little room for all of them, none are inserted.

Apostrophe inserts the widgets exactly as the modal returns them. If they are copies of existing widgets, give them new ids with `cloneWidget`, which also regenerates the ids of nested areas, arrays and objects:

```javascript
import cloneWidget from 'Modules/@apostrophecms/area/lib/clone-widget.js';

// Inside the modal component
this.$emit('modal-result', sourceWidgets.map(cloneWidget));
```

## Related documentation

- [Areas and widgets](../../guide/areas-and-widgets.md)
- [`@apostrophecms/widget-type`](widget-type.md), including [widget operations](widget-type.md#widgetoperations)
