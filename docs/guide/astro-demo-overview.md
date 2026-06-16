# Astro Public Demo Starter Architecture Guide

This guide explains the key patterns and conventions in the ApostropheCMS + Astro [Public Demo starter](https://github.com/apostrophecms/combined-astro-starter-kit). It pairs with the in-repo `ARCHITECTURE.md` quick reference and is aimed at developers who are new to ApostropheCMS and want to understand how the two halves of the architecture fit together before extending the starter.

The sections below cover the patterns you encounter in the first hour of working in the codebase: the bridge package, the component registry, area fields, link resolution, and image rendering.

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
// For piece-type show pages (e.g. an article), they receive aposData.piece.
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

There is no filename-based auto-discovery in the Astro starter — you register every page template and widget explicitly. Two index files contain the registries:

- `frontend/src/templates/index.js` — maps page type names to Astro components
- `frontend/src/widgets/index.js` — maps widget names to Astro components

**The key-matching rule is strict: the key must match the widget's `type` as stored in the database — not necessarily the backend module name.** A missing or wrong key logs a `console.error` on the server and renders a blank area in the browser — no crash, but the widget simply disappears. Two common mistakes: omitting the `@apostrophecms/` scope prefix on built-in modules (e.g. `'rich-text'` instead of `'@apostrophecms/rich-text'`), and including the `-widget` suffix that ApostropheCMS strips from module names (e.g. `'button-widget'` instead of `'button'`).

The same rule applies in `frontend/src/templates/index.js` for page types. Scoped module names like `'@apostrophecms/home-page'` and index/show variants like `'article-page:index'` must be written exactly as they appear in the backend.

## Area Fields and `<AposArea>`

An area field is an ordered list of widgets that an editor can add to, remove from, and reorder without developer involvement. Because the backend controls the content schema, the area's definition — including which widgets editors are allowed to place — lives entirely in the backend module. The Astro component's only job is to hand the populated area data to `<AposArea>` and let it handle the rest.

**Backend schema:**

```js
// backend/modules/default-page/index.js
import { fullConfigExpandedGroups } from '../../lib/area.js';

export default {
  extend: '@apostrophecms/page-type',
  fields: {
    add: {
      main: {
        type: 'area',
        options: {
          expanded: true,
          groups: fullConfigExpandedGroups  // which widgets editors can add here
        }
      }
    }
  }
};
```

**Astro counterpart:**

```astro
---
// frontend/src/templates/DefaultPage.astro
// AposArea renders a CMS-editable widget sequence. The matching field is defined in the backend schema.
import AposArea from '@apostrophecms/apostrophe-astro/components/AposArea.astro';
const { page } = Astro.props;
---
<main>
  <AposArea area={page.main} />
</main>
```

`AposArea` iterates over the widgets in the area, looks each one up in the widget registry, and renders the matching component. In editing mode it also wraps each widget with the controls that let editors add, remove, and reorder.

## Link Utilities

The starter uses a three-way link type (internal page, uploaded file, or custom URL). Rather than handling all three cases inline in every component, two functions in `frontend/src/utils/link.js` centralize the logic:

- **`getLinkPath(link)`** — accepts any object with `linkType`, `_linkPage`, `_linkFile`, and `linkUrl` fields and returns the resolved URL string. Use this everywhere instead of navigating `_linkPage[0]._url` by hand.
- **`opensInNewTab(linkTarget)`** — returns `true` if `linkTarget` is `['_blank']`.

```js
import { getLinkPath, opensInNewTab } from '../../utils/link.js';

const href = getLinkPath(widget);                   // works for page, file, and custom URL
const target = opensInNewTab(widget.linkTarget) ? '_blank' : null;
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

**i18n.** Schema labels use the `project:` namespace by default (`label: 'project:myField'`). Translation files live in `backend/modules/@apostrophecms/i18n/i18n/project/`. Add new keys there or introduce your own namespace with a matching folder.

**Styling.** Global Styles control site-wide design tokens (colors, spacing, typography) through the admin UI. Widget Styles provide per-instance CSS controls declared in a widget's `styles` property — they let editors change the look of individual widget placements without touching code. The two systems are complementary, not alternatives.

For deeper coverage of any of these topics, see the [ApostropheCMS documentation](https://docs.apostrophecms.org).

## Demo Content

If you elected to include demo content when setting up the starter, the project ships with a fully built-out site under the "Waypoint" brand — a fictional SaaS company. The live version is at [astro-public-demo.apos.dev](https://astro-public-demo.apos.dev). Browsing it alongside the codebase is the fastest way to connect each Astro component to what it renders on screen.

Five pages are pre-built:

- **Home** — the most widget-dense page, demonstrating hero, card grid, image/text split, stats row, a custom GitHub open PRs widget, article preview, and CTA callout.
- **Pricing** — a pricing table and feature comparison.
- **About Us** — cards, rich text, and an image with caption.
- **Product Stories** — the index page for the `article` piece type, with category filter tabs for Insights, Behind the Scenes, Product Updates, and a custom category.
- **Case Studies** — the index page for the `case-study` piece type.

Individual article and case study pages demonstrate the piece show template, where `aposData.piece` is populated instead of `aposData.page`.

The Waypoint content lives in the database, not in the code. Replace it by logging in to the admin UI and editing or archiving pieces and pages through the normal editorial workflow. For site-wide fields like the logo and footer links, update the Global Settings document from the admin bar.

ApostropheCMS localization works at two levels that are worth distinguishing. **Content localization** means each page and piece can have a separate version for each locale. Editors switch between locales using the locale picker in the admin bar and translate fields independently.

The three configured locales are English (no URL prefix), French (`/fr`), and German (`/de`), set in `backend/modules/@apostrophecms/i18n/index.js`. When a page is available in multiple locales, ApostropheCMS automatically populates `aposData.localizations` with a `_url`, `label`, and `flag` for each one. The `LocaleSwitcher.astro` component in the site header reads that array directly to render the flag dropdown — no custom API calls or routing logic required.

**String localization** is a separate concern: it covers schema field labels, help text, and UI strings inside the admin. These live in `backend/modules/@apostrophecms/i18n/i18n/project/` as `en.json`, `fr.json`, and `de.json`. Any schema label prefixed with `project:` (e.g. `label: 'project:articleBlurb'`) is looked up in the file matching the current admin locale. The `adminLocales` option in the same `index.js` controls which languages editors can choose for the admin UI itself, independently of the site's content locales.
