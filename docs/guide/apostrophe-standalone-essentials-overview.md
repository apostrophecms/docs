# Essentials Starter Architecture Guide

This guide explains the key patterns and conventions in the ApostropheCMS [Essentials starter](https://github.com/apostrophecms/starter-kit-essentials). It pairs with the in-repo `ARCHITECTURE.md` quick reference and is aimed at developers who are new to ApostropheCMS and want to understand how the framework works before extending the starter.

The sections below cover the patterns you encounter in the first hour of working in the codebase: template discovery, the inheritance chain, the data object, area fields, and image rendering.

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
  <section class="bp-content">
    <h1>{{ data.page.title }}</h1>
    {% area data.page, 'main' %}
  </section>
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

**Nunjucks template:**

```nunjucks
{# modules/default-page/views/page.html #}
{% block main %}
  {# {% area doc, 'fieldName' %} renders a CMS-editable widget sequence stored in that field.
     In edit mode, editors see the widget picker here; in view mode, widgets render normally. #}
  {% area data.page, 'main' %}
{% endblock %}
```

ApostropheCMS wraps the area in editing controls in edit mode; in view mode it renders the widget templates directly.

`lib/area.js` exports a default reusable configuration object for areas that need the core content widgets but not layout widgets. Import it to keep additional area definitions consistent rather than repeating widget lists inline.

> **Note:** `lib/area.js` is a convenience file, not core ApostropheCMS magic. Feel free to modify it, add more configurations, or ignore it entirely and define widget lists inline — whatever fits your project.

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

The equivalent in JSX:

```jsx
// modules/my-image-widget/views/widget.jsx
export default function MyImageWidget({ widget, apos }) {
  const attachment = apos.image.first(widget._image);
  const url = attachment && apos.attachment.url(attachment, { size: 'full' });

  if (!url) return null;

  return (
    <img
      src={url}
      width={apos.attachment.getWidth(attachment)}
      height={apos.attachment.getHeight(attachment)}
      srcSet={apos.image.srcset(attachment)}
      alt={widget.imageAlt || ''}
    />
  );
}
```

## Conventions

**The `_` prefix.** Any field whose name starts with `_` is a relationship field that Apostrophe resolves at request time. These always come back as arrays, even when the schema says `max: 1`. Always check `.length` before accessing `[0]`, or use `apos.image.first()` for image relationships:

```nunjucks
{% if article._author.length %}{{ article._author[0].title }}{% endif %}
{% set attachment = apos.image.first(data.widget._image) %}
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
