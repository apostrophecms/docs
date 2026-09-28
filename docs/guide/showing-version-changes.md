# Showing version changes in widgets

When an editor selects a version in the **Document Versions** modal, they see two things side by side:

- **The change list:** one text row per change, such as a changed heading with its old and new text.
- **The document:** the version's content, displayed the way the site displays it. Each widget is rendered with its normal template, the same one visitors see. Every changed widget is framed and badged as Added, Modified, Deleted, or Moved.

(See the [Document versions guide](/guide/document-versions.md) for how versions are recorded.)

All of this works for every widget, with no extra code. Two optional widget type settings improve it:

- [`titleField`](#titlefield-name-your-widgets) gives each widget a readable name in the change list.
- [`versionsRender`](#versionsrender-show-what-changed-in-your-template) lets your widget's template show, inside the frame, exactly what changed.

## `titleField`: name your widgets

`titleField` names one of the widget's own fields. The change list uses that field's value to identify each widget, so editors can tell apart several widgets of the same type.

Without it, a widget is identified only by the `label` of its widget type, in the breadcrumb that shows where each change is. That's enough when a page has one widget of each type, but not when it has several of the same type.

For example, take a hero widget type whose `label` is "Hero," used three times on a page, each with its own heading. If an editor changes the subheading of two of them, the change list shows two rows with identical breadcrumbs:

- Content › Hero › Subheading
- Content › Hero › Subheading

Each hero has a different heading, so the heading is a good identifier. Set `titleField: 'heading'`:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Hero',
    titleField: 'heading'
  },
  fields: {
    add: {
      heading: {
        type: 'string',
        label: 'Heading'
      },
      subheading: {
        type: 'string',
        label: 'Subheading'
      }
    }
  }
};
```
<template v-slot:caption>
  modules/hero-widget/index.js
</template>
</AposCodeBlock>

Now each widget's heading appears after the type label, and the same two rows read:

- Content › Hero · Autumn sale › Subheading
- Content › Hero · Spring launch › Subheading

The title is the field's value in the version being viewed, or, for a deleted widget, its value before it was deleted. It also labels the row for an added or deleted widget, which otherwise shows only "Hero." This works the same way as the `titleField` of an array field.

`titleField` accepts dot notation for fields inside an `object` field, such as `'content.heading'`. A select, radio, or checkboxes field reads as the label of the chosen value.

Rich text widgets need no `titleField`; they are identified by their text.

## `versionsRender`: show what changed in your template

In the document view of the modal, a changed widget is rendered by its normal template, exactly as it appears on the site, with a Modified frame around it. The editor can see *that* the widget changed, but has to read the change list to see *what* changed.

`versionsRender` lets the widget's template show the change itself. You don't write a separate template for versions. When the option is set, your normal template receives one extra piece of data in the modal: the widget as it was in the previous version. The template can compare the two and highlight what changed.

The option is not needed for a widget to display in the modal; every widget does. Of the core widgets, only the rich text widget sets it, to [mark changed words](#rich-text-marks). The others display as usual inside a Modified frame.

To use it, set the option on the widget type:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Price',
    versionsRender: true
  },
  fields: {
    add: {
      price: {
        type: 'string',
        label: 'Price'
      }
    }
  }
};
```
<template v-slot:caption>
  modules/price-widget/index.js
</template>
</AposCodeBlock>

When a widget of this type changed in the version being viewed, its template receives the previous version of the widget as `widget._olderVersion`. The older widget is sanitized and loaded like the current one, so its relationships are populated.

This is the price widget's normal template, used on the site and in the modal alike. On the site, and for any widget that did not change, `_olderVersion` is absent, so the template shows just the price. In the modal, when the price changed, it also shows the old price struck through:

<AposCodeBlock>

```jsx
export default function({ widget }) {
  const older = widget._olderVersion;
  const changed = older && older.price !== widget.price;

  return (
    <p className={changed ? 'price price--changed' : 'price'}>
      {widget.price}
      {changed && <s>{older.price}</s>}
    </p>
  );
}
```
<template v-slot:caption>
  modules/price-widget/views/widget.jsx
</template>
</AposCodeBlock>

Nunjucks templates remain fully supported and receive the same data:

<AposCodeBlock>

```nunjucks
{% set older = data.widget._olderVersion %}
{% set changed = older and older.price != data.widget.price %}
<p class="price{% if changed %} price--changed{% endif %}">
  {{ data.widget.price }}
  {% if changed %}<s>{{ older.price }}</s>{% endif %}
</p>
```
<template v-slot:caption>
  modules/price-widget/views/widget.html
</template>
</AposCodeBlock>

In an Astro project, the widget component receives `_olderVersion` on its `widget` prop:

<AposCodeBlock>

```astro
---
const { widget } = Astro.props;
const older = widget._olderVersion;
const changed = older && older.price !== widget.price;
---
<p class:list={[ 'price', { 'price--changed': changed } ]}>
  {widget.price}
  {changed && <s>{older.price}</s>}
</p>
```
<template v-slot:caption>
  src/widgets/PriceWidget.astro
</template>
</AposCodeBlock>

### When `_olderVersion` is present

Your template only needs to check whether `_olderVersion` exists. It is present only when all of these are true:

- The widget is being displayed in the Document Versions modal. It is never present on the live site or in the page editor.
- The widget changed in the version being viewed.
- The widget existed in the previous version. An added widget has no older version.

A few related cases:

- A **deleted** widget renders in its old position, from its old data, dimmed, unless its type sets [`versionsRenderDeleted: false`](#widgets-that-are-not-shown-when-deleted).
- A widget whose only changes are inside **nested widgets** gets no `_olderVersion` of its own. The nested widgets get theirs.
- The Modified frame and badge are drawn around the widget whether or not its type sets `versionsRender`.

## Rich text marks

The core rich text widget sets `versionsRender` by default, and Apostrophe compares its text for you. When a rich text widget changed, its `content` in the versions modal is the newer markup with added and removed words marked:

```html
<p>Our <del data-apos-version-change="removed"><span class="apos-sr-only">Removed </span>old</del>
<ins data-apos-version-change="added"><span class="apos-sr-only">Added </span>new</ins> mission</p>
```

Because the marks are in `content` itself, they appear with any front end that outputs rich text content, including JSX, Nunjucks, and Astro templates, with no template changes.

- **The marks are standard `<del>` and `<ins>` elements.** Browsers show them as strikethrough and underline by default, even if your styles never mention them.
- **`data-apos-version-change` is the styling hook.** Its value is `removed` or `added`. It also distinguishes these marks from strikethrough that an editor applied as formatting.
- **Each mark includes hidden text for screen readers**, "Removed" or "Added", in the language of the admin UI. It is wrapped in `.apos-sr-only`. If your front end renders annotated content with its own stylesheet, include a visually hidden rule for that class.
- **Words are marked, including some formatting.** Bold, italic, and a change of block kind, such as a split or merged paragraph or a paragraph turned into a heading, are marked as the words removed and added again in their new form. Other formatting, attributes, and images are not marked in the text. The change list names them instead, in the row's [`formatChanges`](/reference/api/document-versions.md#formatting-changes).
- **The newer markup is never restructured.** A removed element comes back only whole, and only inside the parent it had.

For example, to style the marks to match your site:

<AposCodeBlock>

```css
[data-apos-version-change="added"] {
  background: #e6f4ea;
  text-decoration: none;
}

[data-apos-version-change="removed"] {
  background: #fce8e6;
}
```
<template v-slot:caption>
  Optional styles for rich text marks
</template>
</AposCodeBlock>

### When text is not marked

Sometimes the change cannot be shown as marked words. Then `content` is left as it is, and the whole widget is framed as Modified instead. This happens when:

- Only formatting changed, and not bold, italic, or a block's kind.
- Removed text has no place to go, as in a rebuilt table.
- The two versions differ by more than 2000 tokens, roughly a thousand words.

The same marks are applied to `richText` fields of the document itself, so an [inline editable](/guide/inline-editing.md#inline-editing-and-document-versions) rich text field shows them in place. They are **not** applied to `richText` fields inside a widget's own schema. A widget with such a field is framed as Modified, unless its type sets `versionsRender` and compares the field itself in its template.

A custom rich text widget type gets the same marks when it defines `getRichText` and sets `versionsRender: true`.

## The annotated document

The versions modal displays an **annotated document**: a copy of the version's document with markers added to show what changed. You can get the same copy yourself, with `GET /api/v1/@apostrophecms/document-versions/:versionId?annotate=1` or the server-side [`getAnnotatedDoc`](/reference/modules/document-versions.md#getannotateddoc-req-older-newer-options) method.

The annotated document is for display only. Never save it.

Changed widgets carry these properties:

| Property | Set on |
| -- | -- |
| `_inserted: true` | A widget that the previous version did not have. |
| `_deleted: true` | A widget that this version removed. It is put back into its area's `items`, at its old position, so it can be displayed, unless its type sets [`versionsRenderDeleted: false`](#widgets-that-are-not-shown-when-deleted). |
| `_olderVersion: { ... }` | A changed widget whose type sets `versionsRender`. The value is the widget as it was in the previous version. |
| `_modified: true` | A changed widget whose type does not set `versionsRender`. |
| `_moved: true` | A widget that changed position in its area, alongside any of the above. Only the fewest widgets that explain the new order are marked: dragging one widget to the top marks that widget, not every widget it passed. |
| `_changedWithAi`, `_movedWithAi` | Alongside the other properties, when AI was involved in the change or move. The value is `'changed'` or `'assisted'`, with the same meaning as a change row's [`ai`](/reference/api/document-versions.md#ai-involvement). |

### Widgets that are not shown when deleted

A deleted widget is normally put back in its old position so editors can see what was removed. That doesn't work for a widget that positions itself within its parent's layout, such as a layout column: shown in place, the deleted widget would overlap the others.

A widget type like that sets the `versionsRenderDeleted: false` option. A deleted widget of that type is not put back. Instead, the widget that contained it is marked as modified, or, if there is no containing widget, the document field is. The core `@apostrophecms/layout-column-widget` sets this option, so layout columns and widget types that extend them are never put back.

## Related documentation

- [Document versions guide](/guide/document-versions.md)
- [Widget type module reference](/reference/modules/widget-type.md)
- [Document versions REST API](/reference/api/document-versions.md)
- [Custom widgets](/guide/custom-widgets.md)
