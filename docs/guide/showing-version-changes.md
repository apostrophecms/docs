# Widget developers: showing what changed

When an editor opens a document's version history, the [`@apostrophecms/document-versions`](/reference/modules/document-versions.md) module frames every changed widget and labels it **Modified** by default, and the change list names each field that differs. Two widget options improve on that default. Neither is required.

## `titleField`: name your widgets in the change list

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Hero',
    titleField: 'heading'
  },
  fields: {
    add: {
      heading: { type: 'string', label: 'Heading' }
    }
  }
};
```
<template v-slot:caption>
  modules/hero-widget/index.js
</template>
</AposCodeBlock>

`titleField` names a schema field of the widget — dot notation is allowed for fields inside objects. Its text labels the widget in breadcrumbs ("Hero · Autumn sale") and is what an Added or Deleted widget row shows, the same way the `titleField` of an array field labels its items. Without it, a page with five Hero widgets has five rows that read alike, told apart only by position. A choice field reads as the label of the stored choice.

## `renderVersions`: let the template compare

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    renderVersions: true
  }
};
```
<template v-slot:caption>
  modules/price-widget/index.js
</template>
</AposCodeBlock>

When set, a widget of this type that changed in the version being viewed receives the widget as it was in the version before, as `data.widget._olderVersion` — sanitized and loaded like the widget itself, with relationships populated. The template decides what to make of it:

<AposCodeBlock>

```nunjucks
{% set older = data.widget._olderVersion %}
<p class="price{% if older and older.price != data.widget.price %} price--changed{% endif %}">
  {{ data.widget.price }}
  {% if older and older.price != data.widget.price %}
    <s>{{ older.price }}</s>
  {% endif %}
</p>
```
<template v-slot:caption>
  modules/price-widget/views/widget.html
</template>
</AposCodeBlock>

A few things to keep in mind:

- An unchanged widget never receives `_olderVersion`, and neither does any widget outside the versions modal, so the template needs the guard above and nothing else.
- An added widget has no older version. A deleted widget renders from its old data, in place, dimmed.
- A widget whose only changes are inside widgets nested in it gets no marker and no `_olderVersion` of its own — the nested widgets get theirs.
- The frame and the Modified badge are drawn around the widget either way, whether or not `renderVersions` is set.

## The markers on an annotated document

`GET :versionId?annotate=1` and the `getAnnotatedDoc` server method (see the [module reference](/reference/modules/document-versions.md#featured-methods)) return a copy of the document with these properties on its widgets. They exist only in that copy — never on a widget loaded any other way.

| Marker | Meaning |
| -- | -- |
| `_inserted: true` | A widget the older version does not have. |
| `_deleted: true` | A widget the newer version does not have, put back into its area's `items` at its old position. |
| `_olderVersion: { ... }` | A widget with changes of its own, on a type that sets `renderVersions`. |
| `_modified: true` | The same, for a type that does not set `renderVersions`. |
| `_moved: true` | A widget that changed places, alongside any of the markers above. Set on the fewest widgets that account for the new order. |
| `_changedWithAi`, `_movedWithAi` | Set alongside `_modified`/`_olderVersion` or `_moved`, when AI was involved (relevant for consolidated versions). |

A change outside any widget sets the `@apostrophecms/schema:highlight` meta property of its top-level field (`aposMeta.<field>`), and `@apostrophecms/document-versions:ai` alongside it when AI was involved.

## Rich text marks

`@apostrophecms/rich-text-widget` sets `renderVersions` by default, and core handles the comparison for it: in an annotated document, the `content` of a changed rich text widget is the newer markup with the changed text marked in place. The same is done for `richText` schema fields outside widgets. A rich text widget type of your own gets this behavior automatically when it defines `getRichText` and sets `renderVersions`.

```html
<p>Our <del data-apos-version-change="removed"><span class="apos-sr-only">Removed </span>old</del>
<ins data-apos-version-change="added"><span class="apos-sr-only">Added </span>new</ins> mission</p>
```

- The marks are semantic `del` and `ins`, so a front end with no styles of its own still shows strikethrough and underline. This holds for any template engine, and for an external front end, since the marks are in the same stored-shape `content` every renderer already outputs.
- `data-apos-version-change` (`removed` or `added`) is the one styling hook, and what distinguishes these marks from an editor's own strikethrough formatting.
- The hidden `span` is real text for screen readers, in the language of the admin UI. A front end that renders annotated content needs a visually-hidden rule for `.apos-sr-only`.
- The newer markup is never restructured to produce these marks. A removed element comes back only whole, and only into the parent it had.
- Marks cover words only. Formatting, attributes, images, and structure are not marked in the text itself — the change list names those changes instead, in `formatChanges` (see the [REST API reference](/reference/api/document-versions.md#the-change-row)).
- When a change cannot be shown this way, `content` is left untouched and the widget is marked Modified as a whole instead. This happens when no text changed (a formatting-only change), when removed text has no place to go (a rebuilt table, a list that became paragraphs), or when the two sides differ by more than about 2000 tokens (roughly a thousand words).
- `richText` fields inside a widget's own schema are not marked this way; such a widget reads as Modified as a whole, or compares itself through `_olderVersion` if `renderVersions` is set.

## Project field types

A field type your project registers with `apos.schema.addFieldType` works in version history without any extra code, as long as it says what it extends:

- A type with `extend: 'string'` (or any other single-value type) is compared and read as that type.
- A type extending `area`, `array`, `object`, `relationship`, or `richText` is walked as one: its items and widgets get their own change rows, changes of order are detected, and rich text gets marks.
- The type's own `isEqual(req, field, one, two)` decides whether a value changed, when the type defines one (`one` and `two` are the objects holding the field, as everywhere else in core). Without it, values are compared deeply, treating `null` and `undefined` as equal.
- The type's own `isEmpty(field, value)` decides between an Added/Deleted row and a Modified row, when the type defines one. Without it, `null`, `undefined`, `''`, and `[]` count as empty.

In a change row, `fieldType` is your project's type name and `kind` is what it resolves to structurally. Code that reads rows should test `kind`, not `fieldType`.

::: info
A project field type extending `array` or `object` is read by version history the same as any other, but core's schema composition does not accept `fields: { add }` for such a type — it must provide a ready `schema`. This is a general limit of custom field types, not something specific to versions; see [Custom schema field types](/guide/custom-schema-field-types.md).
:::

## Related documentation

- [`@apostrophecms/document-versions` module reference](/reference/modules/document-versions.md)
- [Document Versions REST API](/reference/api/document-versions.md)
- [Custom Widgets](/guide/custom-widgets.md)
