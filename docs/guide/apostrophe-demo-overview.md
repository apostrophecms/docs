# Public Demo Starter Architecture Guide

This guide explains the key patterns and conventions in the ApostropheCMS [Public Demo starter](https://github.com/apostrophecms/public-demo). It pairs with the in-repo `ARCHITECTURE.md` quick reference and is aimed at developers who are new to ApostropheCMS and want to understand how the framework works before extending the starter.

The sections below cover the patterns you encounter in the first hour of working in the codebase: template discovery, the inheritance chain, the data object, area fields, link resolution, image rendering, and helper functions.

---

## How ApostropheCMS Standalone Works

This starter is a single unified application: ApostropheCMS handles content modeling, the admin editing UI, server-side rendering, and asset serving in one Node.js/Express process. There is no separate frontend server. When a request arrives, ApostropheCMS selects the matching template, populates it with content data, and returns the rendered HTML directly.

Templates can be written in Nunjucks (`.html`) or JSX (`.jsx`); both are fully supported and can coexist in the same project. If both exist for the same template, `.jsx` wins.

## Template Discovery

Templates are discovered automatically by filename — there is no registry to update. ApostropheCMS looks for templates at predictable paths relative to each module:

| Template | Path |
|---|---|
| Widget | `modules/{module-name}/views/widget.html` or `.jsx` |
| Regular page | `modules/{module-name}/views/page.html` or `.jsx` |
| Piece index | `modules/{module-name}/views/index.html` or `.jsx` |
| Piece show | `modules/{module-name}/views/show.html` or `.jsx` |

> **Note:** A `.jsx` template can extend or include a `.html` layout using `<Extend>` or `<Template>`. A `.html` template cannot extend or include a `.jsx` template — convert from the leaves up when migrating.

## Template Inheritance

Every page and piece template slots its content into a shared outer shell via `{% extends %}`. The chain has four levels:

```
data.outerLayout  (Apostrophe's HTML shell — do not edit)
  └── views/layout.html  (site header, nav, footer — edit here for site-wide changes)
        ├── modules/{page-type}/views/page.html  (regular page content)
        └── modules/{piece-page}/views/
              ├── index.html  (paginated piece index)
              └── show.html   (individual piece detail)
```

`views/layout.html` is where most structural customization lives: the nav, header, and footer all live there. `index.html` and `show.html` each extend `views/layout.html` independently — they are siblings, not children, of `page.html`.

A regular page template overrides the `main` block and extends the layout:

```nunjucks
{# modules/default-page/views/page.html #}
{% extends "layout.html" %}

{% block main %}
  <div class="general-content">
    {% area data.page, 'main' %}
  </div>
{% endblock %}
```

## Template Data

ApostropheCMS populates a `data` object available in every Nunjucks template. In JSX templates, these are passed as destructured arguments:

| Variable | Nunjucks | JSX | Contents |
|---|---|---|---|
| Page | `data.page` | `page` | The current page document |
| Piece | `data.piece` | `piece` | The current piece on show pages; `null` elsewhere |
| Global | `data.global` | `global` | Site-wide Global Settings — always available |
| Home | `data.home` | `home` | The home page; `_children` = top-level nav pages |
| Widget | `data.widget` | `widget` | The current widget document (widget templates only) |

## Area Fields and `{% area %}`

An area field is an ordered list of widgets that an editor can add to, remove from, and reorder without developer involvement. Because the backend controls the content schema, the area's definition — including which widgets editors are allowed to place — lives entirely in the backend module. The template's only job is to output the `{% area %}` tag pointing to that field.

**Backend schema:**

```js
// modules/default-page/index.js
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

**Nunjucks template:**

```nunjucks
{# modules/default-page/views/page.html #}
{% block main %}
  {# {% area doc, 'fieldName' %} renders a CMS-editable widget sequence stored in that field.
     In edit mode, editors see the widget picker here; in view mode, widgets render normally. #}
  {% area data.page, 'main' %}
{% endblock %}
```

`ApostropheCMS` wraps the area in editing controls in edit mode; in view mode it renders the widget templates directly.

## Link Utilities

The starter uses a three-way link type (internal page, uploaded file, or custom URL). `lib/link.js` exports the canonical field set — spread it into any schema that needs a link rather than copying the fields manually:

```js
import linkConfig from '../../lib/link.js';

fields: {
  add: {
    ...linkConfig.link  // adds linkType, _linkPage, _linkFile, linkUrl, linkTarget
  }
}
```

The `modules/helper/index.js` module centralizes resolution so templates never navigate `_linkPage[0]._url` by hand. `apos.helper.linkPath()` is a convenience method — call it from any Nunjucks template:

```nunjucks
{# apos.helper.linkPath() resolves any link object to a URL string —
   whether it points to a page, file, or custom URL. #}
<a href="{{ apos.helper.linkPath(widget) }}">{{ widget.linkText }}</a>
```

## Nunjucks Macros

Reusable HTML fragments that accept arguments are written as [Nunjucks macros](https://mozilla.github.io/nunjucks/templating.html#macro) and imported where needed. The `views/link.html` macro is the canonical example — it renders an `<a>` tag with the correct class, `href`, and `target` from any link object:

```nunjucks
{% import 'link.html' as link %}

{{ link.render({
  label: item.linkText,
  path: apos.helper.linkPath(item),
  target: item.linkTarget,
  class: 'button'
}) }}
```

A macro imported in `views/layout.html` is not automatically available in templates that extend it — each template that uses a macro must import it at the top of that file.

## Image Helpers

Rendering an image requires one extra step: `_image` is a relationship to image *documents*, not a URL. Each image document contains an attachment object with size variants, crop dimensions, and focal point data. Navigating that structure manually is fragile — it will break if internal field names change, and it won't handle cropped images correctly.

ApostropheCMS solves this with a two-step helper pattern. **Never access `_image[0].attachment` directly — always use `apos.image.first()` followed by `apos.attachment.url()`:**

```nunjucks
{# _image is a relationship field — always an array, even when max: 1.
   apos.image.first() safely extracts the first attachment object. #}
{% set attachment = apos.image.first(data.widget._image) %}
{% set url = attachment and apos.attachment.url(attachment, { size: 'full' }) %}

{% if url %}
  <img
    src="{{ url }}"
    width="{{ apos.attachment.getWidth(attachment) }}"
    height="{{ apos.attachment.getHeight(attachment) }}"
    srcset="{{ apos.image.srcset(attachment) }}"
    alt="{{ data.widget.imageAlt or '' }}"
  >
{% endif %}
```

Default size strings: `'max'`, `'full'`, `'two-thirds'`, `'one-half'`, `'one-third'`, `'one-sixth'`.


## Conventions

**The `_` prefix.** Any field whose name starts with `_` is a relationship field that Apostrophe resolves at request time. These always come back as arrays, even when the schema says `max: 1`. Always check `.length` before accessing `[0]`, or use `apos.image.first()` for image relationships:

```nunjucks
{% if article._author.length %}{{ article._author[0].title }}{% endif %}
{% set attachment = apos.image.first(data.widget._image) %}
```

**`lib/` utilities.** `lib/link.js` exports the canonical link field set; spread it into any schema that needs a link rather than copying the fields. `lib/area.js` exports three area configurations for different editorial contexts — `basicConfig`, `fullConfig`, and `fullConfigExpandedGroups` — import the right one rather than defining widget lists inline.

**i18n.** Schema labels use the `project:` namespace by default (`label: 'project:myField'`). Translation files live in `modules/@apostrophecms/i18n/i18n/project/`. Add new keys there or introduce your own namespace with a matching folder.

**Styling.** Global Styles control site-wide design tokens (colors, spacing, typography) through the admin UI. Widget Styles provide per-instance CSS controls declared in a widget's `styles` property — they let editors change the look of individual widget placements without touching code. The two systems are complementary, not alternatives.

For deeper coverage of any of these topics, see the [ApostropheCMS documentation](https://docs.apostrophecms.org).

## Demo Content

If you elected to include demo content when setting up the starter, the project ships with a fully built-out site under the "Waypoint" brand — a fictional SaaS company. The live version is at [astro-public-demo.apos.dev](https://astro-public-demo.apos.dev). Browsing it alongside the codebase is the fastest way to connect each template to what it renders on screen.

Five pages are pre-built:

- **Home** — the most widget-dense page, demonstrating hero, card grid, image/text split, stats row, custom GitHub open PRs display, article preview, and CTA callout.
- **Pricing** — a pricing table and feature comparison.
- **About Us** — cards, rich text, and an image with caption.
- **Product Stories** — the index page for the `article` piece type, with category filter tabs for Insights, Behind the Scenes, Product Updates, and a custom category.
- **Case Studies** — the index page for the `case-study` piece type.

Individual article and case study pages demonstrate the piece show template, where `data.piece` is populated instead of `data.page`.

The Waypoint content lives in the database, not in the code. Replace it by logging in to the admin UI and editing or archiving pieces and pages through the normal editorial workflow. For site-wide fields like the logo and footer links, update the Global Settings document from the admin bar.

ApostropheCMS localization works at two levels that are worth distinguishing. **Content localization** means each page and piece can have a separate version for each locale. Editors switch between locales using the locale picker in the admin bar and translate fields independently.

The three configured locales are English (no URL prefix), French (`/fr`), and German (`/de`), set in `modules/@apostrophecms/i18n/index.js`. When a page is available in multiple locales, ApostropheCMS automatically populates `data.localizations` with a `_url`, `label`, and `flag` for each one. The `views/locales.html` Nunjucks template reads that array directly to render the flag dropdown in the site header — no custom routing logic required.

**String localization** is a separate concern: it covers schema field labels, help text, and UI strings inside the admin. These live in `modules/@apostrophecms/i18n/i18n/project/` as `en.json`, `fr.json`, and `de.json`. Any schema label prefixed with `project:` (e.g. `label: 'project:articleBlurb'`) is looked up in the file matching the current admin locale. The `adminLocales` option in the same `index.js` controls which languages editors can choose for the admin UI itself, independently of the site's content locales.
