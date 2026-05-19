# Standalone Starter Architecture Guide

This guide explains the key patterns and conventions in the ApostropheCMS standalone starter. It pairs with the in-repo `ARCHITECTURE.md` quick reference and is aimed at developers who are new to ApostropheCMS and want to understand how the framework works before extending the starter.

Templates in this starter can be written in **Nunjucks** (`.html`) or **JSX** (`.jsx`). The guide covers both. Nunjucks is the default — the core layout and most existing templates use it. JSX is a fully supported alternative for developers who prefer JavaScript syntax; see [JSX Templates](#jsx-templates) for the pattern equivalents.

---

## Template and Widget Discovery

ApostropheCMS discovers templates by filename — there is no registry to update. When you create a widget module named `my-widget`, Apostrophe automatically looks for its template at `modules/my-widget/views/widget.html` (or `widget.jsx`). Page type templates follow the same convention: `modules/my-page/views/page.html` (or `.jsx`) is the page template. For piece-page types, `index.html` (or `.jsx`) renders the paginated list of all pieces of that type, and `show.html` (or `.jsx`) renders the detail view for an individual piece.

When both a `.jsx` and `.html` file exist for the same template, the `.jsx` version takes precedence. Adding a new widget requires only a module directory with an `index.js` and a `views/widget.html` or `views/widget.jsx` — the template is picked up automatically on next startup.

---

## Template Inheritance

Templates use a layered inheritance chain built on `{% extends %}` — this is not a directory structure. From outermost to innermost:

1. **`data.outerLayout`** — Apostrophe's built-in HTML shell. It writes the `<html>`, `<head>`, and `<body>` tags and handles switching between full page renders and AJAX fragment responses. Typically not edited.

2. **`views/layout.html`** — The project layout. It extends `data.outerLayout` and defines the site header, navigation, footer, and the `{% block main %}` that page templates fill in. Edit this file for changes that appear on every page.

3. **`modules/{page-type}/views/page.html` (or `.jsx`)** — The page-type template. It extends `layout.html` and overrides `{% block main %}` to render the page's specific content.

For **piece-page types**, `index.html` and `show.html` each extend `views/layout.html` directly — they are not nested under `page.html`:

- **`modules/{piece-page}/views/index.html` (or `.jsx`)** — The paginated list of all pieces of this type. Uses `data.pieces` and `data.page`.
- **`modules/{piece-page}/views/show.html` (or `.jsx`)** — The detail view for an individual piece. Uses `data.piece` as its primary data source.

**Rule of thumb:** if you are changing something for one page type, edit that page type's template. If you are changing something that appears on every page, edit `views/layout.html`.

---

## The `data` Object: What's Available in Templates

Every template receives a `data` object with five properties you will use most:

- **`data.page`** — The current page document. Available on all page templates.
- **`data.piece`** — The current piece when on a show page (e.g., a single article). `null` on regular pages.
- **`data.global`** — The site-wide Global Settings document, always available. Use it for things that appear on every page: `{{ data.global.siteTitle }}` in Nunjucks, `{global.siteTitle}` in JSX.
- **`data.home`** — The home page document. Includes `data.home._children`, an array of top-level pages used to build the navigation.
- **`data.widget`** — The current widget's data. Available only inside widget templates.

In Nunjucks, these are accessed as `data.page`, `data.global`, etc. In JSX, the `data` object is the first argument to your template function — destructure the properties you need at the top and reference them directly:

```jsx
export default function({ page, global, home }, { Area }) { … }
// Then use `page.title`, `global.siteTitle`, `home._children` directly
```

---

## The `_` Prefix: Relationship Fields

Schema fields whose names begin with `_` are **relationship fields**. They are not stored directly in the document — Apostrophe resolves them at request time and attaches the related documents as arrays.

```javascript
// In a module's schema (index.js):
_image: {
  type: 'relationship',
  withType: '@apostrophecms/image',
  max: 1
}
```

Because Apostrophe always returns relationships as **arrays** (even when `max: 1`), access the first result with `[0]`, or use `apos.image.first()` for image fields:

```nunjucks
{# Nunjucks — _author is always an array; use [0] #}
{% if article._author.length %}
  Written by {{ article._author[0].title }}
{% endif %}
```

```jsx
// JSX equivalent
{article._author.length > 0 && <span>Written by {article._author[0].title}</span>}
```

The `_` prefix is a visual signal in any template: you are looking at a joined document, not a plain stored value.

---

## The Area Tag

The area tag renders a CMS-editable widget sequence. It takes the document the area belongs to and the field name from that document's schema.

**Schema definition (same for both template languages):**

```javascript
import { fullConfig } from '../../lib/area.js';

fields: {
  add: {
    main: {
      type: 'area',
      options: { widgets: fullConfig }
    }
  }
}
```

**Nunjucks:**
```nunjucks
{# Renders the 'main' area on the current page #}
{% area data.page, 'main' %}

{# Inside a widget template #}
{% area data.widget, 'content' %}
```

**JSX:**
```jsx
{/* Renders the 'main' area on the current page */}
<Area doc={page} name="main" />

{/* Inside a widget template — widget data is on the `widget` prop */}
<Area doc={widget} name="content" />
```

`lib/area.js` exports three pre-built widget configurations (`basicConfig`, `fullConfig`, `fullConfigExpandedGroups`) so you can pick the right set without listing widgets by hand in every module.

---

## The Helper Module

Server-side template helpers live in `modules/helper/index.js` and are registered with `self.addHelpers()`. Once registered, they are callable in all templates.

```javascript
// modules/helper/index.js
export default {
  options: { alias: 'helper' },
  init(self) {
    self.addHelpers({
      linkPath: (link) => {
        if (link.linkType === 'page')   return link._linkPage?.[0]?._url;
        if (link.linkType === 'file')   return link._linkFile?.[0]?._url;
        if (link.linkType === 'custom') return link.linkUrl;
      },
      formatDate: (date) => dayjs(date).format('MMMM D, YYYY')
    });
  }
};
```

**Nunjucks:** `apos.helper.linkPath(item)`, `{{ apos.helper.formatDate(article.publishedAt) }}`

**JSX:** helpers are available on the `helpers` object in the second argument, but because JSX templates have access to the full `apos` object, you can also call the module methods directly:

```jsx
export default function({ page }, { apos, Area }) {
  // Via helpers object (thin wrappers, same as Nunjucks behavior):
  // helpers.linkPath(item)

  // Or call apos directly — JSX templates can await:
  // await apos.doc.find(req, { type: 'article' }).toArray()
}
```

To add a new helper, add a function to the `self.addHelpers({})` call. This is the correct place for shared server-side template logic — do not inline complex data-shaping in templates.

---

## Reusable Template Fragments

**In Nunjucks**, reusable fragments are defined as macros in `views/link.html` and imported with `{% import %}`:

```nunjucks
{% import 'link.html' as link %}

{{ link.render({
  label:  item.linkText,
  path:   apos.helper.linkPath(item),
  target: item.linkTarget,
  class:  'button button--primary'
}) }}
```

**In JSX**, there is no `{% import %}` — use a real JavaScript `import` instead. You can define helper components inline in the same file or import them from a shared module:

```jsx
import { linkPath } from '../../lib/helpers.js';

function LinkButton({ item, className }) {
  return (
    <a
      href={linkPath(item)}
      className={`link ${className}`}
      target={item.linkTarget?.[0]}
    >
      {item.linkText}
    </a>
  );
}

export default function({ widget }) {
  return widget.links.map(item =>
    <LinkButton item={item} className="button button--primary" />
  );
}
```

You can also use `<Template name="link" />` to render a Nunjucks `.html` partial from a JSX template, which is useful during gradual migration.

---

## Image Resolution: The Two-Step `apos.attachment.url()` Pattern

Rendering an image requires two steps because `_image` is a relationship (an array of image documents), and each image document contains an attachment object, not a URL.

**Nunjucks:**
```nunjucks
{# Step 1: extract the attachment from the relationship array #}
{% set attachment = apos.image.first(article._image) %}

{# Step 2: resolve to a URL with an optional size variant #}
{% set url = attachment and apos.attachment.url(attachment, { size: 'full' }) %}

{% if url %}
  <img
    src="{{ url }}"
    alt="{{ article.title }}"
    width="{{ apos.attachment.getWidth(attachment) }}"
    height="{{ apos.attachment.getHeight(attachment) }}"
    srcset="{{ apos.image.srcset(attachment) }}"
    loading="lazy"
  >
{% endif %}
```

**JSX:**
```jsx
export default function({ piece: article }, { apos }) {
  const attachment = apos.image.first(article._image);
  const url = attachment && apos.attachment.url(attachment, { size: 'full' });

  return url ? (
    <img
      src={url}
      alt={article.title}
      width={apos.attachment.getWidth(attachment)}
      height={apos.attachment.getHeight(attachment)}
      srcSet={apos.image.srcset(attachment)}
      loading="lazy"
    />
  ) : null;
}
```

`apos.image.first()` handles empty arrays safely — it returns `null` if the relationship is unset. Default size variants: `'max'`, `'full'`, `'two-thirds'`, `'one-half'`, `'one-third'`, `'one-sixth'`. These can be overridden or extended via the `imageSizes` option in `modules/@apostrophecms/attachment/index.js` at project level.

---

## `lib/` Shared Utilities

The `lib/` directory contains configurations imported by multiple modules:

- **`lib/link.js`** — The canonical link field set (link text, link type, `_linkPage`, `_linkFile`, custom URL, new-tab toggle). Spread into any widget schema that needs a link — do not copy these fields manually.
- **`lib/area.js`** — Pre-built area widget configurations (`basicConfig`, `fullConfig`, `fullConfigExpandedGroups`). Import the appropriate one for each area.
- **`lib/iconChoices.js`** — Shared icon choice arrays for schema fields that offer icon selection.
- **`lib/options.js`** — Shared module option sets.

---

## i18n: The `project:` Key Convention

The starter uses the `project:` namespace by default — for example, `label: 'project:siteTitle'`. Translation files live in `modules/@apostrophecms/i18n/i18n/project/`. You can continue adding keys there, or introduce your own namespace by adding a matching folder and translation files under `i18n/`. Either approach works equally in Nunjucks and JSX modules.

---

## Styling

There are two distinct styling systems in this starter.

**Global Styles** are configured in `modules/@apostrophecms/styles/index.js` using the same `styles` cascade pattern as schema fields. Developers define which CSS properties editors can control — colors, spacing, typography, and more — and editors adjust them through a dedicated admin UI. The module generates and injects the resulting stylesheet automatically, with no template changes required. See the [Global Styles guide](./global-styles.md) for the full field type and configuration reference.

**Widget Styles** are declared via a `styles` property directly in a widget's `index.js`. They use the same field types as global styles but are scoped to each widget instance and are edited through the widget editor modal rather than a separate admin UI. This is the right place for per-instance visual controls — background color, padding, border radius — that editors should be able to adjust independently on each placed widget. See the [Widget Styles guide](./widget-styles.md) for details.

---

## JSX Templates

JSX is a fully supported alternative to Nunjucks for page, widget, and component templates. It provides JavaScript control flow, real `import` statements, and source-mapped error reporting. It is **server-side only** — there is no virtual DOM, no client runtime, and no React dependency.

### The one-direction rule

JSX can consume Nunjucks (a `.jsx` template can extend `layout.html`), but Nunjucks cannot consume JSX. This means the recommended approach is to keep `views/layout.html` in Nunjucks and convert individual page or widget templates to `.jsx` one at a time, using `<Extend>` to bridge the inheritance:

```jsx
// modules/default-page/views/page.jsx
export default function({ page }, { Area, Extend }) {
  return (
    <Extend templateName="layout"
      main={
        <div className="general-content">
          <Area doc={page} name="main" />
        </div>
      }
    />
  );
}
```

Each prop to `<Extend>` maps to a `{% block <name> %}` override in the Nunjucks layout. The `main` prop overrides `{% block main %}`.

### Widget templates in JSX

Widget data arrives on `widget` in the destructured first argument (not `data.widget`):

```jsx
// modules/hero-widget/views/widget.jsx
export default function({ widget }, { Area }) {
  return (
    <div className="widget hero-widget">
      <div className="hero-widget__content">
        <Area doc={widget} name="content" />
      </div>
    </div>
  );
}
```

### Nunjucks → JSX quick reference

| Pattern | Nunjucks | JSX |
|---------|----------|-----|
| Interpolation | `{{ data.page.title }}` | `{page.title}` |
| Area | `{% area data.page, 'main' %}` | `<Area doc={page} name="main" />` |
| Conditional | `{% if x %}…{% endif %}` | `{x && <…/>}` |
| Loop | `{% for i in items %}` | `{items.map(i => …)}` |
| Extend Nunjucks layout | `{% extends "layout.html" %}` | `<Extend templateName="layout" main={…} />` |
| Include | `{% include "footer.html" %}` | `<Template name="footer" />` |
| Raw HTML | `{{ content \| safe }}` | `<div dangerouslySetInnerHTML={{ __html: content }} />` |
| Shared fragment | `{% import 'link.html' as link %}` | `import LinkButton from './LinkButton.jsx'` |
