---
title: "Inline editing in ApostropheCMS"
---

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

For a `string` field, a JSX or Nunjucks project needs no schema change. `headline` is an ordinary field, still present in the editor modal, still available to the REST API. The template has simply chosen to put it on the page in a form the editor can type into.

Formatted text like `blurb` is usually kept in an area that holds a single rich text widget. To edit it in place, change that area into a `richText` field first: see [Converting a rich text area to a `richText` field](#converting-a-rich-text-area-to-a-richtext-field).

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

"By default" because the tag is the field type's suggestion, not a rule. `tag` is optional for every type and only overrides that default: pass it to render a headline as an `h1` or a blurb as a `p`. See [controlling the markup](#controlling-the-markup). An area is the exception: it has no tag of its own to override, and its `with` object is passed to the area as [context options](/guide/areas-and-widgets.md#passing-context-options), exactly as it would be with `<Area>`.

Any other field type raises an exception naming the field and its type, rather than rendering something the editor cannot click on. Output those with an ordinary template expression.

In JSX and Nunjucks, `Field` and `Area` are interchangeable: naming an area with `Field` does exactly what `<Area>` does, `with` clause and all, so a template that iterates a schema does not have to special-case it. In Astro they are separate components — use `<AposArea>` for areas.

Custom field types can opt in — see [Adding inline editing to a custom field type](#adding-inline-editing-to-a-custom-field-type).

## Converting a rich text area to a `richText` field

Many projects keep a block of formatted text in an area that allows only the rich text widget, and only one of it. That text is already editable on the page, but as a widget: the editor gets an area's controls for something that can never hold a second widget, and inside another widget has to select the right widget in the breadcrumb before typing.

The [`richText`](/reference/field-types/richText.md) field type stores the same rich text, edited with the same editor, as an HTML string directly on the document. Converting the area into a `richText` field lets the template render it with `Field`, so the editor types straight into it.

Convert when the area allows only `@apostrophecms/rich-text` and holds exactly one. If editors should be able to add images, videos or other widgets alongside the text, or more than one block of it, keep the area. The [`richText` reference](/reference/field-types/richText.md#when-to-use-it-instead-of-an-area) explains the choice in more detail.

Converting takes four steps: change the schema, change the template, migrate the stored content, and check your styles.

### 1. Change the schema

Here is an area that holds one rich text widget:

<AposCodeBlock>

```javascript
introduction: {
  label: 'Introduction',
  type: 'area',
  options: {
    max: 1,
    widgets: {
      '@apostrophecms/rich-text': {
        toolbar: [ 'styles', 'bold', 'italic', 'link' ],
        styles: [
          { tag: 'p', label: 'Paragraph' },
          { tag: 'h3', label: 'Heading 3' }
        ]
      }
    }
  }
}
```
<template v-slot:caption>
Before
</template>

</AposCodeBlock>

And here is the same field as `richText`:

<AposCodeBlock>

```javascript
introduction: {
  label: 'Introduction',
  type: 'richText',
  // 👇 Astro only
  wysiwyg: true,
  options: {
    toolbar: [ 'styles', 'bold', 'italic', 'link' ],
    styles: [
      { tag: 'p', label: 'Paragraph' },
      { tag: 'h3', label: 'Heading 3' }
    ]
  }
}
```
<template v-slot:caption>
After
</template>

</AposCodeBlock>

The rich text options (`toolbar`, `styles`, `insert` and the rest) move out of `options.widgets['@apostrophecms/rich-text']` and sit directly in the field's `options`. Keep them inside `options`: placed at the top level of the field, next to `type` and `label`, they are ignored, and Apostrophe only logs a warning at startup. `max` and `widgets` go away, because a `richText` field always holds exactly one value. Anything you did not set still comes from the `defaultOptions` of the `@apostrophecms/rich-text-widget` module, as it did for the widget.

`wysiwyg: true` is needed only in Astro projects, which must [tell Apostrophe which fields they render](#telling-apostrophe-which-fields-you-render). Leave it out in JSX and Nunjucks projects.

### 2. Change the template

Render the field with `Field` instead of `Area`:

```jsx
// Before
<Area doc={page} name="introduction" />

// After
<Field doc={page} name="introduction" />
```

``` nunjucks
{# Before #}
{% area data.page, 'introduction' %}

{# After #}
{% field data.page, 'introduction' %}
```

```astro
<!-- Before -->
<AposArea area={page.introduction} />

<!-- After -->
<AposField doc={page} name="introduction" />
```

### 3. Migrate the stored content

Documents already in the database still hold the field in its old shape. An area is stored as an object whose `items` array holds the widgets, with each rich text widget's HTML in its `content` property. A `richText` field is stored as the HTML string itself. Without a [migration](/guide/writing-migrations.md) to convert one into the other, existing content renders empty.

For a field of a page or piece type, use `eachDoc`:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/piece-type',
  // fields, as in step 1
  init(self) {
    self.apos.migration.add('article-introduction-to-rich-text', async () => {
      await self.apos.migration.eachDoc({ type: 'article' }, async (doc) => {
        // Already converted
        if (typeof doc.introduction === 'string') {
          return;
        }
        await self.apos.doc.db.updateOne(
          { _id: doc._id },
          { $set: { introduction: areaToHtml(doc.introduction) } }
        );
      });
    });
  }
};

// Join the HTML of every rich text widget in the area
function areaToHtml(area) {
  return (area?.items || [])
    .filter(item => item.type === '@apostrophecms/rich-text')
    .map(item => item.content || '')
    .join('');
}
```
<template v-slot:caption>
modules/article/index.js
</template>

</AposCodeBlock>

For a field of a widget, use `eachWidget`. It visits every widget in every area of every document, however deeply nested: in a page's area, in an `array` or `object` field, or in an area of another widget. Check the widget's type, then use the `dotPath` it receives to update that one widget:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/widget-type',
  // fields, as in step 1, with the field named `content`
  init(self) {
    self.apos.migration.add('hero-content-to-rich-text', async () => {
      await self.apos.migration.eachWidget({}, async (doc, widget, dotPath) => {
        if ((widget.type !== 'hero') || (typeof widget.content === 'string')) {
          return;
        }
        await self.apos.doc.db.updateOne(
          { _id: doc._id },
          { $set: { [`${dotPath}.content`]: areaToHtml(widget.content) } }
        );
      });
    });
  }
};

// areaToHtml as in the previous example
```
<template v-slot:caption>
modules/hero-widget/index.js
</template>

</AposCodeBlock>

A few things about these migrations:

- Both helpers work on the database directly, so they convert drafts and published documents in every locale.
- `areaToHtml` joins every rich text widget rather than keeping only the first. An area can hold more than one even when the schema meant to allow one, for instance when `max` was placed beside `options` instead of inside it, where it has no effect.
- Skipping values that are already strings leaves converted content alone, so the migration is safe to run against a database where some documents already use the new shape.

The same applies to any change of a field's type, not only this one: whenever the stored shape changes, write a migration that converts it.

### 4. Check your styles

The widget took its wrapper markup with it. A rich text widget renders its HTML inside a `div` with a `data-rich-text` attribute and the class set by the `className` option of the `@apostrophecms/rich-text-widget` module, inside the area's own markup. The field renders its HTML inside a single tag, `div` by default, with only the `apos-wysiwyg-field` classes and whatever `class` you pass.

So CSS that selects on the widget's `className`, on `[data-rich-text]` or on the area wrapper no longer matches. The simplest fix is usually to give the field the same class:

```jsx
<Field doc={page} name="introduction" with={{ class: 'rich-text' }} />
```

``` nunjucks
{% field data.page, 'introduction' with { class: 'rich-text' } %}
```

```astro
<AposField doc={page} name="introduction" class="rich-text" />
```

## What the editor sees

Outside of edit mode, the field is exactly the tag your template asked for, carrying the classes, styles and attributes you gave it, and holding the value. There is no wrapper around it, and nothing an anonymous visitor cannot use: no editor to mount, no icon, no second copy of the value. Rich text renders exactly as it does in a widget, permalinks and all; a string is escaped as text, with the line breaks of a `textarea: true` string preserved.

In edit mode:

- The editor is mounted **in place**, inheriting the page's own typography, and taking up no more room than the markup it replaced. Nothing on the page moves when editing begins.
- Approaching a field outlines it and raises the same breadcrumb trail a widget has, opening with an icon for the field type. A field inside a widget is preceded in the trail by that widget, and by whatever contains it. Clicking the crumb that names the field puts the cursor in it.
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

## Inline editing, Document Versions, and See Changes

Editors review changes in two places. The [Document Versions](/guide/document-versions.md) modal shows what each saved version changed. [See Changes](/guide/document-versions.md#see-changes) shows the page with everything its draft changes since the last publication. Both render the document with your templates, read-only, and both mark changes on it.

A field rendered with `Field`, `{% field %}` or `AposField` shows its own change **in place**, inside the field on the page:

- **A `string` field** shows its removed and added words, marked with `<del>` and `<ins>`.
- **A `richText` field** shows its removed and added words inside its markup, the same way a [rich text widget](/guide/showing-version-changes.md#rich-text-marks) does.

This works wherever the field lives: on the document, in an array item or object, or in a widget at any depth. In-place marks need nothing beyond the template code that makes the field editable.

A field gets no in-place mark when the template prints its value with an ordinary expression, such as <span v-pre>`{{ data.page.subhead }}`</span> or `{page.subhead}`. Apostrophe cannot tell which part of the page that value is. The same goes for a field that is [displayed but not edited](#when-a-field-is-displayed-but-not-edited), for example one rendered with `edit: false`. A field that is not marked in place is still listed with its old and new values, and a widget that holds it is framed as Modified.

In an Astro project, a field must also be [opted in](#telling-apostrophe-which-fields-you-render) with `wysiwyg: true` or `wysiwygFields`. Without that, `AposField` displays the value but has nothing to mark.

Every changed field, however it is displayed, has its own row in the change list. Selecting a frame or marked text reveals the matching row.

This makes `Field` worth using for any `string` or `richText` value an editor may want to review, even one that is mostly edited in a modal.

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
