# Essentials Starter Architecture Guide

This guide explains the key patterns and conventions in the ApostropheCMS [Essentials starter](https://github.com/apostrophecms/starter-kit-essentials). It pairs with the in-repo `ARCHITECTURE.md` quick reference and is aimed at developers who are new to ApostropheCMS and want to understand how the framework works before extending the starter.

The sections below cover the patterns you encounter in the first hour of working in the codebase: template discovery, the inheritance chain, the data object, area fields, and image rendering.

---

## How ApostropheCMS Standalone Works

This starter is a single unified application: ApostropheCMS handles content modeling, the admin editing UI, server-side rendering, and asset serving in one Node.js/Express process. There is no separate frontend server. When a request arrives, ApostropheCMS selects the matching template, populates it with content data, and returns the rendered HTML directly.

This starter's templates are [JSX](/guide/jsx-templates.md) (`.jsx`), all the way down: `modules/@apostrophecms/template/index.js` sets `nunjucks: false`, so Apostrophe renders its own templates from their JSX versions and never loads Nunjucks. Nunjucks (`.html`) remains fully supported by Apostrophe, and the two can coexist in a project that allows it; see [JSX all the way down](/guide/jsx-templates.md#jsx-all-the-way-down). Apostrophe walks the module's view-folder override chain, preferring `.jsx` then `.njk` then `.html` **within each folder** — so a template in a nearer override folder wins regardless of its extension. See [`render()`](/reference/modules/module.md#async-render-req-template-data).

## Template Discovery

Templates are discovered automatically by filename — there is no registry to update. ApostropheCMS looks for templates at predictable paths relative to each module:

| Template | Path |
|---|---|
| Widget | `modules/{module-name}/views/widget.jsx` |
| Regular page | `modules/{module-name}/views/page.jsx` |
| Piece index | `modules/{module-name}/views/index.jsx` |
| Piece show | `modules/{module-name}/views/show.jsx` |

> **Note:** With `nunjucks: false`, rendering a Nunjucks template throws an error naming it. If an extension you install renders a `.html` template of its own, override it with a `.jsx` template of the same name in `modules/{module-name}/views/` in your project.

## Template Inheritance

Every page and piece template slots its content into a shared outer shell via `<Extend>`. The chain has four levels:

```
data.outerLayout  (Apostrophe's JSX HTML shell — do not edit)
  └── views/layout.jsx  (site header, nav, footer — edit here for site-wide changes)
        ├── modules/{page-type}/views/page.jsx  (regular page content)
        └── modules/{piece-page}/views/
              ├── index.jsx  (paginated piece index)
              └── show.jsx   (individual piece detail)
```

`views/layout.jsx` is where most structural customization lives: the header, nav, and footer all live there. It extends `data.outerLayout`, core's JSX outer layout, passing `title` and a `main` that wraps the page content in the header and footer. See [Layout templates](/guide/layout-template.md) for the other props it can pass. Piece `index.jsx` and `show.jsx` templates each extend `views/layout.jsx` independently — they are siblings, not children, of `page.jsx`.

A regular page template extends the layout and supplies its content as the `main` prop:

```jsx
/* modules/default-page/views/page.jsx */
export default function({ page }, { Area, Extend }) {
  return (
    <Extend
      templateName="layout"
      main={
        <section className="bp-content">
          <h1>{page.title}</h1>
          <Area doc={page} name="main" />
        </section>
      }
    />
  );
}
```

In a Nunjucks project, the same page overrides `{% block main %}` and uses `{% extends "layout.html" %}`. In JSX, each block becomes a prop on `<Extend>`.

The starter also ships `modules/@apostrophecms/page/views/notFound.jsx`, so the 404 page uses the site's own layout and wording. Core's JSX 404 template would also work with `layout.jsx` if you deleted it.

## Template Data

ApostropheCMS passes the same content data to every template. In a JSX template it arrives as the **first argument** to the exported function — destructure the properties you need. In Nunjucks the same values hang off `data`:

| Variable | JSX | Nunjucks | Contents |
|---|---|---|---|
| Page | `page` | `data.page` | The current page document |
| Piece | `piece` | `data.piece` | The current piece on show pages; `null` elsewhere |
| Global | `global` | `data.global` | Site-wide Global Settings — always available |
| Home | `home` | `data.home` | The home page; `_children` = top-level nav pages |
| Widget | `widget` | `data.widget` | The current widget document (widget templates only) |

## Area Fields and `<Area>`

An area field is an ordered list of widgets that an editor can add to, remove from, and reorder without developer involvement. Because the backend controls the content schema, the area's definition — including which widgets editors are allowed to place — lives entirely in the backend module. The template's only job is to output an `<Area>` pointing to that field.

**Backend schema:**

```js
// modules/default-page/index.js
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

**JSX template:**

```jsx
/* modules/default-page/views/page.jsx */
<Extend
  templateName="layout"
  main={
    /* <Area doc={} name="" /> renders a CMS-editable widget sequence stored in
       that field. In edit mode, editors see the widget picker here; in view
       mode, widgets render normally. */
    <Area doc={page} name="main" />
  }
/>
```

ApostropheCMS wraps the area in editing controls in edit mode; in view mode it renders the widget templates directly. In Nunjucks, the same area is `{% area data.page, 'main' %}`.

`lib/area.js` exports a default reusable configuration object for areas that need the core content widgets but not layout widgets. Import it to keep additional area definitions consistent rather than repeating widget lists inline.

> **Note:** `lib/area.js` is a convenience file, not core ApostropheCMS magic. Feel free to modify it, add more configurations, or ignore it entirely and define widget lists inline — whatever fits your project.

## Image Helpers

Rendering an image requires one extra step: `_image` is a relationship to image *documents*, not a URL. Each image document contains an attachment object with size variants, crop dimensions, and focal point data. Navigating that structure manually is fragile — it will break if internal field names change, and it won't handle cropped images correctly.

ApostropheCMS solves this with a two-step helper pattern. **Never access `_image[0].attachment` directly — always use `apos.image.first()` followed by `apos.attachment.url()`:**

```jsx
// modules/my-image-widget/views/widget.jsx
export default function MyImageWidget({ widget }, { apos }) {
  const attachment = apos.image.first(widget._image);
  const url = attachment && apos.attachment.url(attachment, { size: 'full' });

  if (!url) return null;

  return (
    <img
      src={url}
      width={apos.attachment.getWidth(attachment)}
      height={apos.attachment.getHeight(attachment)}
      srcset={apos.image.srcset(attachment)}
      alt={widget.imageAlt || ''}
    />
  );
}
```

Default size strings: `'max'`, `'full'`, `'two-thirds'`, `'one-half'`, `'one-third'`, `'one-sixth'`.

The equivalent in Nunjucks:

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

## Conventions

**The `_` prefix.** Any field whose name starts with `_` is a relationship field that Apostrophe resolves at request time. These always come back as arrays, even when the schema says `max: 1`. Always check `.length` before accessing `[0]`, or use `apos.image.first()` for image relationships:

```jsx
{article._author.length > 0 && article._author[0].title}
```

Compare against `> 0` rather than relying on the length itself — `{article._author.length && …}` renders a literal `0` when the array is empty. The same in Nunjucks:

```nunjucks
{% if article._author.length %}{{ article._author[0].title }}{% endif %}
```

**`lib/` utilities.** `lib/area.js` exports a reusable widget configuration for area fields that use the core content widgets. Import it when that shared widget list fits the editorial context.

**i18n.** The Essentials starter uses plain string labels by default. If you add project-level localization later, schema labels can use a namespace such as `project:` with matching translation files under an i18n module.

**Styling.** Global Styles control site-wide design tokens (colors, spacing, typography) through the admin UI. Widget Styles provide per-instance CSS controls declared in a widget's `styles` property — they let editors change the look of individual widget placements without touching code. The two systems are complementary, not alternatives.

For deeper coverage of any of these topics, see the [ApostropheCMS documentation](https://docs.apostrophecms.org).

## Next Steps

Start the development server with:

```sh
npm run dev
```

This launches both the ApostropheCMS backend and the asset build watcher. The admin UI is available at `/login`. From there, log in and start editing pages, adding widgets, and exploring the schema-driven content model described above.
