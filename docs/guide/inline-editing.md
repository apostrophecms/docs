# Inline editing

[Areas](/guide/areas-and-widgets.md) have always been editable right where they appear on the page. Ordinary schema fields were not: to change a headline, an editor had to open the document's editor modal, find the field, type into a form control, and save.

Inline editing closes that gap. A template can render any [`string`](/reference/field-types/string.md) or [`richText`](/reference/field-types/richText.md) field *in place*, so the editor clicks the headline on the page and types over it:

<AposCodeBlock>

```jsx
export default function({ page }, { Field, Area }) {
  return (
    <article>
      <Field doc={page} name="headline" with={{ tag: 'h1', class: 'article__headline' }} />
      <Field doc={page} name="blurb" />
      <Area doc={page} name="main" />
    </article>
  );
}
```
<template v-slot:caption>
modules/article-page/views/page.jsx
</template>

</AposCodeBlock>

No schema change is required in a Nunjucks or JSX project. `headline` and `blurb` are ordinary fields, still present in the editor modal, still available to the REST API. The template has simply chosen to put them on the page in a form the editor can type into.

::: info
Astro and other [external fronts](/guide/headless-cms.md) do need one line of schema configuration per field. See [Astro](#astro) below for why.
:::

## Which fields can be edited in place

| Field type | Renders as, by default | Editing |
|---|---|---|
| [`string`](/reference/field-types/string.md) | A `span`, inline on the line the template put it on | One line, no line breaks; pasted breaks are collapsed |
| [`string`](/reference/field-types/string.md) with `textarea: true` | A `div` | Multiple lines; the box grows as the editor types |
| [`richText`](/reference/field-types/richText.md) | A `div` | The full rich text editor, with whatever `toolbar` and `styles` the field configures |
| [`area`](/reference/field-types/area.md) | Whatever its widgets render | Exactly as `<Area>` — see below |

"By default" because the tag is the field type's suggestion, not a rule: pass `tag` to render a headline as an `h1` or a blurb as a `p`. See [controlling the markup](#controlling-the-markup).

Any other field type raises an exception naming the field and its type, rather than rendering something the editor cannot click on. Output those with an ordinary template expression.

In JSX and Nunjucks, `Field` and `Area` are interchangeable: naming an area with `Field` does exactly what `<Area>` does, `with` clause and all, so a template that iterates a schema does not have to special-case it. In Astro they are separate components — use `<AposArea>` for areas.

Custom field types can opt in — see [Adding inline editing to a custom field type](#adding-inline-editing-to-a-custom-field-type).

## What the editor sees

Outside of edit mode, the field is exactly the tag your template asked for, carrying the classes, styles and attributes you gave it, and holding the value. There is no wrapper around it, and nothing an anonymous visitor cannot use: no editor to mount, no icon, no second copy of the value. Rich text renders exactly as it does in a widget, permalinks and all; a string is escaped as text, with the line breaks of a `textarea: true` string preserved.

In edit mode:

- The editor is mounted **in place**, inheriting the page's own typography, and taking up no more room than the markup it replaced. Nothing on the page moves when editing begins.
- Approaching a field outlines it and raises the same breadcrumb trail a widget has, opening with an icon for the field type. A field inside a widget is preceded in the trail by that widget, and by whatever contains it.
- An empty field shows its `placeholder`, or its `label` if it has no placeholder.
- Changes are saved the way an area on the page is saved: patched on the fly, one field at a time, debounced and serialized.

Exactly one breadcrumb trail is ever on screen. A field inside a widget takes the trail from that widget, since its own trail already names it.

## JSX templates

JSX templates get a `Field` helper alongside `Area`, as part of the second argument to the template function:

<AposCodeBlock>

```jsx
export default function({ page }, { Field }) {
  return (
    <article>
      <Field doc={page} name="headline" with={{ tag: 'h1', class: 'article__headline' }} />
      <Field doc={page} name="standfirst" with={{ tag: 'p' }} />
      <Field doc={page} name="blurb" />
    </article>
  );
}
```
<template v-slot:caption>
modules/article-page/views/page.jsx
</template>

</AposCodeBlock>

`Field` takes exactly three props — `doc`, `name`, and the optional `with` object — mirroring the [`{% field %}` tag](/reference/template-tags.md#field). Presentation goes inside `with`, not alongside it:

```jsx
// Right
<Field doc={page} name="headline" with={{ tag: 'h1', class: 'headline' }} />

// Wrong: tag and class are ignored out here
<Field doc={page} name="headline" tag="h1" class="headline" />
```

A single line string is rendered inline and edited inline, so it keeps its place in a sentence:

```jsx
<p>Name: <Field doc={person} name="name" />.</p>
```

The full stop stays put when the editor arrives. Nothing is printed after the closing tag, not even a newline.

See [JSX templates](/guide/jsx-templates.md) for the rest of the JSX API.

## Nunjucks templates

The `{% field %}` tag is the Nunjucks equivalent, with the same `with` clause as `{% area %}`:

<AposCodeBlock>

``` nunjucks
{% extends "layout.html" %}

{% block main %}
  <article>
    {% field data.page, 'headline' with { tag: 'h1', class: 'article__headline' } %}
    {% field data.page, 'standfirst' with { tag: 'p' } %}
    {% field data.page, 'blurb' %}
    <p>Name: {% field data.page, 'name' %}.</p>
  </article>
{% endblock %}
```
<template v-slot:caption>
modules/article-page/views/page.html
</template>

</AposCodeBlock>

See the [`field` tag reference](/reference/template-tags.md#field) for the complete argument list.

## Astro

The `@apostrophecms/apostrophe-astro` bridge package provides an `AposField` component, which does for one schema field what `AposArea` does for an area:

<AposCodeBlock>

```astro
---
import AposArea from '@apostrophecms/apostrophe-astro/components/AposArea.astro';
import AposField from '@apostrophecms/apostrophe-astro/components/AposField.astro';
const { page } = Astro.props.aposData;
---
<article>
  <AposField doc={page} name="headline" tag="h1" class="article__headline" />
  <AposField doc={page} name="blurb" />
  <AposArea area={page.main} />
</article>
```
<template v-slot:caption>
frontend/src/templates/ArticlePage.astro
</template>

</AposCodeBlock>

Astro's props are flat rather than gathered into a `with` object, which is the convention in an `.astro` template. `doc` is the document, widget, array item or object the field belongs to, and `name` is the field's name in that object's schema. Both are required.

Unlike `Field` in JSX, `AposField` does not accept an area. Use `AposArea` for those.

### Telling Apostrophe which fields you render

Apostrophe sends an external front its data *before* the templates run, so it cannot tell which fields a template will render in place. You have to say so in the backend schema, or the field will be displayed but not editable. There are two ways, and they do the same thing:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/piece-type',
  options: {
    // 👇 For fields you did not declare here, such as the inherited `title`
    wysiwygFields: [ 'title' ]
  },
  fields: {
    add: {
      subhead: {
        type: 'string',
        label: 'Subhead',
        // 👇 For fields you did declare
        wysiwyg: true
      },
      blurb: {
        type: 'richText',
        label: 'Blurb',
        wysiwyg: true
      }
    }
  }
};
```
<template v-slot:caption>
backend/modules/article/index.js
</template>

</AposCodeBlock>

Use the `wysiwygFields` option for fields that come from a base type, such as `title`. Adding `title` again just to set `wysiwyg: true` on it would replace the whole inherited definition, `required` and all. A name in `wysiwygFields` that is not in the schema throws at startup, so a typo says so rather than leaving a field mysteriously uneditable.

Fields inside `array` and `object` fields work the same way: put `wysiwyg: true` on the subfield.

While developing, `AposField` writes a note to the terminal when it displays a field Apostrophe sent no editing information for, naming the field and the option to set. The field still displays — a missing opt-in never breaks a page.

::: info
**Why the opt in?** Everything needed to edit one field costs a few hundred bytes of the page's JSON, and a real page carries dozens of fields no template renders in place: every SEO field, every Open Graph field, every slug, on the page, its ancestors, its children, and any pieces alongside them. On a demo site, annotating all of them added 70% to the response. Opting in keeps the cost to the fields you actually use.

Nunjucks and JSX need no such flag because they run inside Apostrophe and can work everything out at the moment the template reaches the field.
:::

### How it arrives

The information travels on the document itself, under `_wysiwygFields`, keyed by field name:

```json
"_wysiwygFields": {
  "headline": {
    "rendered": "Apostrophe 4.16 is out",
    "tag": "span",
    "classes": "apos-wysiwyg-field apos-wysiwyg-field--string apos-wysiwyg-field--input",
    "canEdit": true,
    "component": "AposWysiwygInputString",
    "icon": "format-text-icon",
    "fieldId": "…",
    "docId": "…",
    "patchKey": "headline"
  }
}
```

`AposField` reads all of this for you; you only need to know it is there if you are writing a front end of your own. `rendered` is the part a front end cannot work out for itself — only Apostrophe can resolve the permalinks in rich text, or knows what a field type contributed by a module makes of its value. `tag` and `classes` are what the field type asked for, which your props override or add to. The rest is what the editor needs in order to mount and patch the right field of the right document, so an anonymous visitor is sent only the first three: no editor to mount, no icon, and no patch key.

Documents your templates fetch straight from the REST API rather than receiving as page data carry `_wysiwygFields` only when the request asks for `render-areas`. Without it their fields are displayed but never editable.

## Controlling the markup

The same five settings are available in all three template languages. In JSX and Nunjucks they go inside the `with` clause; in Astro they are props.

| Setting | Effect |
|---|---|
| `tag` | Overrides the tag the field type chose. Any valid HTML tag name. |
| `class` | **Added to** the classes the field type asks for, never replacing them. |
| `style` | An inline style string, passed through to the tag. |
| `attrs` | An object of additional attributes, passed through to the tag. |
| `edit: false` | Render the value and never offer editing, even to a user who could. The field type still renders it properly — see [when a field is displayed but not edited](#when-a-field-is-displayed-but-not-edited). |

```jsx
<Field
  doc={page}
  name="headline"
  with={{
    tag: 'h1',
    class: 'article__headline',
    attrs: { 'data-analytics': 'headline' }
  }}
/>
```

``` nunjucks
{% field data.page, 'headline' with {
  tag: 'h1',
  class: 'article__headline',
  attrs: { 'data-analytics': 'headline' }
} %}
```

```astro
<AposField
  doc={page}
  name="headline"
  tag="h1"
  class="article__headline"
  attrs={{ 'data-analytics': 'headline' }}
/>
```

Anything else you pass reaches the editor component as its options.

Apostrophe always adds `apos-wysiwyg-field` and `apos-wysiwyg-field--{type}` classes, plus modifiers a field type asks for — `apos-wysiwyg-field--input` or `apos-wysiwyg-field--textarea` for a `string`, for instance. Your own `class` is appended to those, so styling the element is the same job it would be if you had written the tag yourself.

::: info
The editor asks the browser what your CSS made of the tag rather than reading the tag name, so a `span` your stylesheet turned into a block is treated as a block. A value too long for the room left on a line does begin on the next line, as any wide inline object would: text cannot flow around a box you are typing in.
:::

## Fields of widgets, array items and objects

`doc` does not have to be a page or a piece. Any object with a schema will do, which means a widget, an item of an `array` field, or the value of an `object` field:

```jsx
export default function({ page }, { Field }) {
  return (
    <article>
      {page.sections.map(section => (
        <section>
          <Field doc={section} name="caption" with={{ tag: 'h2' }} />
          <Field doc={section} name="detail" />
        </section>
      ))}
    </article>
  );
}
```

``` nunjucks
{% for section in data.page.sections %}
  <section>
    {% field section, 'caption' with { tag: 'h2' } %}
    {% field section, 'detail' %}
  </section>
{% endfor %}
```

```astro
{page.sections.map(section => (
  <section>
    <AposField doc={section} name="caption" tag="h2" />
    <AposField doc={section} name="detail" />
  </section>
))}
```

Each of these is patched by its own key, so editing one caption leaves the rest of the document alone — exactly as editing one field of a widget does.

Widget templates work the same way, with `widget` in place of `page`:

<AposCodeBlock>

```jsx
export default function({ widget }, { Field }) {
  return (
    <section className="hero">
      <Field doc={widget} name="heading" with={{ tag: 'h2' }} />
      <Field doc={widget} name="blurb" />
    </section>
  );
}
```
<template v-slot:caption>
modules/hero-widget/views/widget.jsx
</template>

</AposCodeBlock>

::: tip
This is often a simpler answer than [in-context editing for custom widgets](/guide/editing-custom-widgets-in-context.md), which requires a custom Vue component. If all you want is for the heading of your widget to be typed on the page, an inline-editable field gets you there with a line of template code and no admin UI work.
:::

## When a field is displayed but not edited

A field renders as plain markup, with no editor, when any of these is true:

- The visitor is not editing, or cannot edit the document.
- The field is `readOnly`.
- The template passed `edit: false` (`with { edit: false }`, or `edit={false}` in Astro).
- The field belongs to a **document other than the one the page is about** — the piece of a show page, otherwise the page itself. The fifty pieces of an index page, the home page, the ancestors and children behind your navigation, and the `global` doc are all there to be read; edit them on their own pages. This is exactly how areas have always behaved.
- The field is held back from this user by [`allowedSchema`](/reference/module-api/module-overview.md), in which case it is not in the schema the browser received at all.

In every one of these cases the value still displays, rendered the way its field type says it should be. A field is never hidden because it cannot be edited.

::: tip `Field` is worth using even when nothing will be edited
A `richText` field is the clearest case. Its stored markup holds [permalink](/reference/field-types/richText.md#displaying-the-value) placeholders rather than real URLs, so printing the property gives you internal links that go nowhere. `Field` resolves them. `edit: false` gets you that rendering and no editor at all, which is less work than calling `renderRichText` yourself and impossible to forget. In Astro, keep `wysiwyg: true` on such a field anyway: it is what sends the rendered markup, not just the editor.
:::

## Inline editing and Document Versions

Document Versions records each saved version of a document and lets editors compare and roll back.

Inline editable fields are the best-supported case for **WYSIWYG display of changes**: because the template already says where each field appears on the page and what markup it renders as, a version comparison can show the change where the content actually lives, rather than as a row in a field-by-field list. Support for this is currently being implemented.

This is worth weighing when you are deciding between an inline editable `string` or `richText` field and an equivalent that is only edited in a modal.

## Adding inline editing to a custom field type

[Custom field types](/guide/custom-schema-field-types.md) opt in with a `wysiwyg` property and can customize the rest:

| Property | Purpose |
|---|---|
| `wysiwyg: true` | This type can be edited in place. Required; without it the field throws when a template names it. |
| `wysiwygComponent` | The Vue component that edits it. Defaults to `AposWysiwygInput` plus the capitalized type name. |
| `wysiwygRender(req, field, value)` | The markup a visitor sees. Defaults to the value escaped as text. |
| `wysiwygTag(field)` | The tag the value is rendered as when the template does not say. Defaults to `div`. Given the whole field, so one type can answer differently depending on configuration, as `string` does for `textarea: true`. |
| `wysiwygModifiers(field)` | Extra `apos-wysiwyg-field--*` classes, so one type can be styled differently depending on configuration. |
| `wysiwygIcon` | The icon that opens the breadcrumb trail. Defaults to `pencil-icon`. An individual field can override it with a `wysiwygIcon` property of its own. |

The editor component should mix in `AposWysiwygInputMixin` from the `@apostrophecms/schema` module, which supplies the props, the save semantics and the `update:modelValue` and `changed` events.

For a complete working example, server and browser side, see the recipe: [adding inline editing to a custom field type](/cookbook/inline-editable-field-type.md).

## Further reading

- [JSX templates](/guide/jsx-templates.md#fields) — `Field` alongside the rest of the JSX API
- [`field` tag reference](/reference/template-tags.md#field) — every argument, in JSX and Nunjucks terms
- [`string` field type](/reference/field-types/string.md) — one line or many
- [`richText` field type](/reference/field-types/richText.md) — rich text without an area
- [Areas and widgets](/guide/areas-and-widgets.md) — the other half of in-context editing
- [Adding inline editing to a custom field type](/cookbook/inline-editable-field-type.md) — a worked example
- [Editing custom widgets in context](/guide/editing-custom-widgets-in-context.md) — when a whole widget, rather than one field, needs a custom on-page editor
