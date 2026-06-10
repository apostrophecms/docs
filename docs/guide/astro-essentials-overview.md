# Astro Essentials Starter Architecture Guide

This guide explains the key patterns and conventions in the ApostropheCMS + Astro Essentials starter. It pairs with the in-repo `ARCHITECTURE.md` quick reference and is aimed at developers who are new to ApostropheCMS and want to understand how the two halves of the architecture fit together before extending the starter.

The sections below cover the patterns you encounter in the first hour of working in the codebase: the bridge package, the component registry, area fields, and image rendering.

---

## How ApostropheCMS and Astro Divide Responsibility

This starter pairs two systems that each do what they do best. ApostropheCMS is the backend: it owns every content schema, widget definition, page type, piece type, and the admin editing UI. When a developer adds a new field or widget, it happens in the backend. Astro is the frontend: it receives structured content objects from ApostropheCMS via REST and turns them into HTML. It never defines data shapes, stores content, or validates input.

The clean division means a frontend developer can build and iterate on components without touching the CMS configuration, and a content architect can add new fields without breaking any templates. The `@apostrophecms/apostrophe-astro` bridge package makes the two halves feel like one application — it provides the fetch helper, the `AposArea` component, and the in-context editing overlay that lets editors click directly on the page to make changes.

## The Bridge Package and `aposPageFetch`

The single catch-all route in `frontend/src/pages/[...slug].astro` handles every URL on the site. At the top of that file, `aposPageFetch` does the heavy lifting:

```astro
---
// aposPageFetch fetches all page data from the ApostropheCMS backend.
// For regular pages, downstream templates receive aposData.page.
// For piece-type show pages (e.g. a blog post), they receive aposData.piece.
import aposPageFetch from '@apostrophecms/apostrophe-astro/lib/aposPageFetch.js';
import AposLayout from '@apostrophecms/apostrophe-astro/components/layouts/AposLayout.astro';
import AposTemplate from '@apostrophecms/apostrophe-astro/components/AposTemplate.astro';

const aposData = await aposPageFetch(Astro.request);
if (aposData.redirect) {
  return Astro.redirect(aposData.url, aposData.status);
}
---
<AposLayout {aposData}>
  <AposTemplate {aposData} slot="main" />
</AposLayout>
```

`aposPageFetch` authenticates with the backend using `APOS_EXTERNAL_FRONT_KEY`, fetches the page document and all its widget data in a single request, and returns an `aposData` object.

`AposLayout` provides the page shell and editing support. `AposTemplate` looks up the correct Astro component from the template registry and renders it, passing the content down as props.

## The Component Registry

There is no filename-based auto-discovery in the Astro Essentials starter — you register every page template and widget explicitly. Two index files contain the registries:

- `frontend/src/templates/index.js` — maps page type names to Astro components
- `frontend/src/widgets/index.js` — maps widget names to Astro components

**The key-matching rule is strict: the key must match the widget's `type` as stored in the database — not necessarily the backend module name.** A missing or wrong key logs a `console.error` on the server and renders a blank area in the browser — no crash, but the widget simply disappears. Two common mistakes: omitting the `@apostrophecms/` scope prefix on built-in modules (e.g. `'rich-text'` instead of `'@apostrophecms/rich-text'` in the widget registry, or `'home-page'` instead of `'@apostrophecms/home-page'` in the template registry), and including the `-widget` suffix that ApostropheCMS strips from module names (e.g. `'button-widget'` instead of `'button'`).

The starter includes one piece type — the built-in `@apostrophecms/blog` module. Its index and show pages use a scoped key format with a colon suffix:

```js
// frontend/src/templates/index.js
const templateComponents = {
  '@apostrophecms/home-page': HomePage,
  'default-page': DefaultPage,
  '@apostrophecms/blog-page:index': BlogIndexPage, // piece index page
  '@apostrophecms/blog-page:show': BlogShowPage,   // individual post
  '@apostrophecms/page:notFound': NotFoundPage,
};
```

The `:index` and `:show` suffixes are how ApostropheCMS distinguishes between the listing page and the detail page for any piece type. If you add your own piece type later, its keys will follow the same pattern: `'my-piece-page:index'` and `'my-piece-page:show'`. Scoped module names like `'@apostrophecms/rich-text'` must be written exactly as they appear in the backend.

## Widgets

The widget registry includes the core ApostropheCMS content and layout widgets:

```js
// frontend/src/widgets/index.js
const widgetComponents = {
  '@apostrophecms/rich-text': RichTextWidget,
  '@apostrophecms/image': ImageWidget,
  '@apostrophecms/video': VideoWidget,
  '@apostrophecms/file': FileWidget,
  '@apostrophecms/layout': LayoutWidget,
  '@apostrophecms/layout-column': LayoutColumnWidget,
  'nested-layout-widget': NestedLayoutWidget,
  'nested-column-widget': NestedLayoutColumnWidget,
};
```

Layout and layout-column are core ApostropheCMS widgets, delivered via the bridge package (`@apostrophecms/apostrophe-astro/widgets/`). They enable editors to create multi-column layouts directly in the admin UI without any custom widget code. The `nested-layout-widget` and `nested-column-widget` entries map to the same bridge components and allow layouts to be nested inside one another.

## Area Fields and `<AposArea>`

An area field is an ordered list of widgets that an editor can add to, remove from, and reorder without developer involvement. Because the backend controls the content schema, the area's definition — including which widgets editors are allowed to place — lives entirely in the backend module. The Astro component's only job is to hand the populated area data to `<AposArea>` and let it handle the rest.

**Backend schema** (`backend/modules/default-page/index.js`):

```js
export default {
  extend: '@apostrophecms/page-type',
  fields: {
    add: {
      main: {
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/layout': {},  // which widgets editors can add here
            '@apostrophecms/rich-text': {},
            '@apostrophecms/image': {},
            '@apostrophecms/video': {}
          }
        }
      }
    }
  }
};
```

**Astro counterpart** (`frontend/src/templates/DefaultPage.astro`):

```astro
---
// AposArea renders a CMS-editable widget sequence. The matching field is defined in the backend schema.
import AposArea from '@apostrophecms/apostrophe-astro/components/AposArea.astro';
const { page } = Astro.props;
---
<main>
  <AposArea area={page.main} />
</main>
```

`AposArea` iterates over the widgets in the area, looks each one up in the widget registry, and renders the matching component. In editing mode it also wraps each widget with the controls that let editors add, remove, and reorder.

`backend/lib/area.js` exports a reusable configuration object for areas that do not need layout widgets:

```js
export default {
  '@apostrophecms/image': {},
  '@apostrophecms/video': {},
  '@apostrophecms/rich-text': {}
};
```

## Image Helpers

Rendering an image requires one extra step: `_image` is a relationship to image *documents*, not a URL. Each image document contains an attachment object with size variants, crop dimensions, and focal point data. Navigating that structure manually is fragile — it will break if internal field names change, and it won't handle cropped images correctly.

The `@apostrophecms/apostrophe-astro` package solves this by exporting five utility functions from `lib/attachment.js` that read the image object correctly in every case. **Never navigate `widget._image[0].attachment` manually — always use these helpers.** All five accept `null` safely, so they will not throw if an editor has not yet selected an image.

| Function | Returns |
|---|---|
| `getAttachmentUrl(imageObj)` | The full image URL |
| `getAttachmentSrcset(imageObj)` | A `srcset` string for responsive rendering |
| `getFocalPoint(imageObj)` | An `object-position` CSS value (e.g. `"40% 60%"`) |
| `getWidth(imageObj)` | The intrinsic width (crop-aware) |
| `getHeight(imageObj)` | The intrinsic height (crop-aware) |

`ImageWidget.astro` is the canonical reference for how to use these together:

```astro
---
// Image helpers from the integration package — use these instead of navigating widget._image[0].attachment manually.
import {
  getAttachmentUrl,
  getAttachmentSrcset,
  getFocalPoint,
  getWidth,
  getHeight,
} from '@apostrophecms/apostrophe-astro/lib/attachment.js';

const { widget } = Astro.props;

// Relationship fields are populated at request time and returned as arrays; [0] gets the first result.
const imageObj = widget._image?.[0];

const src = getAttachmentUrl(imageObj);
const srcset = getAttachmentSrcset(imageObj);
const objectPosition = getFocalPoint(imageObj);         // use as CSS object-position
const width = getWidth(imageObj);
const height = getHeight(imageObj);
---

{src && (
  <img
    {src}
    {srcset}
    {width}
    {height}
    style={`object-position: ${objectPosition}`}
    alt={imageObj?.alt || ''}
  />
)}
```

Pass `imageObj` (the first element of the `_image` array) to all five helpers — not the raw `widget` object and not the nested `attachment` property.

## Conventions

**The `_` prefix.** Any field whose name starts with `_` is a relationship field that Apostrophe resolves at request time. These always come back as arrays, even when the schema says `max: 1`. Use optional chaining and `[0]` consistently: `widget._image?.[0]`, `post._author?.[0]?.title`.

**`backend/lib/` utilities.** `lib/area.js` exports the widget configuration for area fields — import it rather than defining widget lists inline in each schema.

**i18n.** The Essentials starter uses plain string labels by default. If you add project-level localization later, schema labels can use a namespace such as `project:` with matching translation files under an i18n module.

**Styling.** Global Styles control site-wide design tokens (colors, spacing, typography) through the admin UI. Widget Styles provide per-instance CSS controls declared in a widget's `styles` property — they let editors change the look of individual widget placements without touching code. The two systems are complementary, not alternatives.

For deeper coverage of any of these topics, see the [ApostropheCMS documentation](https://docs.apostrophecms.org).
