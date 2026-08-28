# Nunjucks templates

Apostrophe page, widget, and component templates can be written in **Nunjucks** (`.html`) or [JSX](/guide/jsx-templates.md) (`.jsx`). Both are fully supported and coexist in the same project.

The documentation's code examples use JSX, which is the recommended choice for new projects. This page is the reference for Nunjucks: the syntax, the Apostrophe-specific tags, and how templates compose. Nunjucks is a supported feature, not deprecated — existing projects can stay on it indefinitely.

::: tip Migrating an existing project?
See [JSX templates](/guide/jsx-templates.md) for the equivalents of everything below, and [Migrating templates with an AI assistant](/guide/jsx-migration-assistant.md) for instructions you can hand to a coding assistant.
:::

## File location and naming

Templates live in `views` directories, either in module subdirectories or at the project root.

The root `views` directory usually holds [the layout template](/guide/layout-template.md) and shared partials. Module `views` directories hold templates used by that module — [widget](/guide/custom-widgets.md#widget-templates), [page](/guide/pages.md#page-template-essentials), and [piece page](/guide/piece-pages.md#the-index-page-template) templates being the main cases.

Apostrophe finds templates by filename, with no registry to update:

| Template | Path |
|---|---|
| Widget | `modules/{module-name}/views/widget.html` |
| Regular page | `modules/{module-name}/views/page.html` |
| Piece index | `modules/{module-name}/views/index.html` |
| Piece show | `modules/{module-name}/views/show.html` |

When both `page.html` and `page.jsx` exist in the *same* views folder, the `.jsx` version wins. Across folders it is the override chain that decides — a nearer folder's `.html` beats a parent module's `.jsx`. See [`render()`](/reference/modules/module.md#async-render-req-template-data).

## Template data

Apostrophe populates a `data` object available in every Nunjucks template:

| Variable | Contents |
|---|---|
| `data.page` | The current page document |
| `data.piece` | The current piece on show pages; `null` elsewhere |
| `data.global` | Site-wide Global Settings — always available |
| `data.home` | The home page; `_children` holds top-level nav pages |
| `data.widget` | The current widget document (widget templates only) |
| `data.user` | The logged-in user, if any |

Output a value with `{{ }}`:

``` nunjucks
<h1>{{ data.page.title }}</h1>
```

Values are HTML-escaped by default. To render trusted markup unescaped, use the `safe` filter:

``` nunjucks
{{ data.widget.content | safe }}
```

## Core syntax

Nunjucks statements use `{% %}`, output uses `{{ }}`, and comments use `{# #}`.

``` nunjucks
{# A comment — not rendered #}

{% if data.user %}
  <a href="/logout">Log out</a>
{% else %}
  <a href="/login">Log in</a>
{% endif %}

{% for product in data.products %}
  <li><a href="{{ product._url }}">{{ product.title }}</a></li>
{% else %}
  <li>No products yet.</li>
{% endfor %}

{% set attachment = apos.image.first(data.widget._image) %}
```

The [official Nunjucks documentation](https://mozilla.github.io/nunjucks/templating.html) covers the full language — conditionals, loops, variables, comparison and math operators, and more.

## Apostrophe template tags

Beyond the Nunjucks language, Apostrophe adds tags of its own. The most common:

``` nunjucks
{# Render an editable area #}
{% area data.page, 'main' %}

{# Render an async component #}
{% component 'blog:recent' with { max: 5 } %}
```

`{% area %}` takes the document the field belongs to and the field name. In edit mode Apostrophe wraps it in editing controls; in view mode it renders the widget templates directly.

Context options can be passed to specific widget types with the `with` keyword:

``` nunjucks
{% area data.page, 'main' with {
  '@apostrophecms/image': {
    sizes: '(min-width: 600px) 45vw, (min-width: 1140px) 530px'
  }
} %}
```

See the [template tag reference](/reference/template-tags.md) for the complete list, including `fragment`, `render`, and `rendercall`.

## Filters

Filters transform a value before output, applied with the pipe operator and applied left to right:

``` nunjucks
<h1>{{ data.page.headline | replace("foo", "bar") | upper }}</h1>
```

Nunjucks supplies a set of [built-in filters](https://mozilla.github.io/nunjucks/templating.html#filters), and Apostrophe adds its own — `build`, `date`, `nlbr`, `striptags`, `json`, and others. You can register project-specific filters with `self.apos.template.addFilter()`.

See [template filters](/guide/template-filters.md) for the full reference and for how to write your own.

::: info
Filters are a Nunjucks feature. They are not available in JSX templates, which use ordinary JavaScript function calls instead. If you are planning a migration, note that project-specific filters registered with `addFilter()` are most portable if the underlying function is also exposed as a helper via `addHelpers()`.
:::

## How templates work together

No template is an island. Templates compose through the `extends`, `include`, and [`import`](/guide/fragments.md) tags.

### Extending templates

`{% extends %}` inherits all the markup and blocks of the template it extends. Blocks defined in the extending template replace matching blocks in the extended one.

A layout template is typically structured like this:

``` nunjucks
{# views/layout.html #}
{% extends data.outerLayout %}

{% block beforeMain %}
  {# Page header markup and the main content area opening tag... #}
{% endblock %}

{% block main %}{% endblock %}

{% block afterMain %}
  {# The main content area closing tag and page footer... #}
{% endblock %}
```

Page type templates extend that layout:

<AposCodeBlock>

``` nunjucks
{% extends "layout.html" %}

{% block main %}
  {% area data.page, 'mainContent' %}
{% endblock %}
```
<template v-slot:caption>
modules/default-page/views/page.html
</template>
</AposCodeBlock>

`page.html` inherits everything from `layout.html`, and its `main` block replaces only the matching block.

::: info
`data.outerLayout` is a core, base-level template. See the [layout template](/guide/layout-template.md) guide for more.
:::

### The `super()` tag

You can *add to* a block's inherited content rather than replacing it, by calling `super()` inside the block. It renders the contents of the block being overridden.

Given this in the layout:

``` nunjucks
{% block main %}
  <h1>{{ data.piece.title or data.page.title }}</h1>
{% endblock main %}
```

a home page template can extend the layout and keep that `h1`:

<AposCodeBlock>

``` nunjucks
{% block main %}
  {{ super() }} {# 👈 renders the <h1> above #}
  <div>
    {# ... additional home page content #}
  </div>
{% endblock %}
```
<template v-slot:caption>
modules/@apostrophecms/home-page/views/page.html
</template>
</AposCodeBlock>

::: warning
`super()` has no JSX equivalent. A template relying on it is usually best left in Nunjucks — JSX templates can extend a Nunjucks layout, so this does not block migrating the rest of a project.
:::

### Including templates

`{% include %}` pulls one template into another, which is useful for breaking large files into pieces. A site footer in `views/footer.html` can be included from the layout:

<AposCodeBlock>

``` nunjucks
{% block afterMain %}
  </main> {# Closing tag for the main block #}
  {% include "footer.html" %}
{% endblock %}
```
<template v-slot:caption>
views/layout.html
</template>
</AposCodeBlock>

### Macros

`{% macro %}` defines a reusable markup function, imported where needed. Each template that uses a macro must import it — macros are not inherited through `extends`.

``` nunjucks
{% import 'link.html' as link %}

{{ link.render({
  label: item.linkText,
  path: apos.helper.linkPath(item),
  class: 'button'
}) }}
```

See [fragments](/guide/fragments.md) for Apostrophe's related construct, which can perform async operations that macros cannot.

### Referencing templates across modules

The examples above name templates in the root `views` directory, so a bare filename is enough. The same applies between templates in the same module directory.

To extend or include a template belonging to a *different* module, prefix it with the module name:

``` nunjucks
{% extends "default-page:page.html" %}

{% block content %}
  <h1>Contact info</h1>
{% endblock %}
```

That tells Apostrophe to use the `page.html` file belonging to the `default-page` module. The same pattern works with `include`.

## Working alongside JSX

The two template languages interoperate in **one direction**:

> A `.jsx` template can extend, include, or import a `.html` template. A `.html` template **cannot** extend, include, or import a `.jsx` template.

Nunjucks has no way to invoke the JSX renderer. In practice this means a project migrates from the leaves up: individual page and widget templates become JSX while `layout.html` and the core Nunjucks templates stay in place. Apostrophe's core `outerLayoutBase.html` remains Nunjucks for the foreseeable future.

If you are not migrating, none of this affects you — a wholly Nunjucks project continues to work exactly as before.

## Further reading

- [Template tag reference](/reference/template-tags.md) — every Apostrophe tag in detail
- [Template filters](/guide/template-filters.md) — built-in and custom filters
- [Fragments](/guide/fragments.md) — Apostrophe's async-capable alternative to macros
- [Layout template](/guide/layout-template.md) — the root layout and `data.outerLayout`
- [Nunjucks documentation](https://mozilla.github.io/nunjucks/templating.html) — the language itself
- [JSX templates](/guide/jsx-templates.md) — the alternative, and what migration involves
