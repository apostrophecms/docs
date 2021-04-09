# Piece index and show pages

When pieces need their own web pages, adding a **piece index page** is how we do it. These index pages are added similarly to other [pages](/guide/pages.md) with a few important differences. In brief, these page modules have two separate template files and additional data available in templates.

Piece page modules extend `@apostrophecms/piece-page-type`.

A common use for these is a **blog**. The related piece type in that case might come from the `article` piece module (refer to [the pieces guide](/guide/pieces.md#creating-a-piece-type) for more on that). **The piece page would then be a module named `article-page`.**

```javascript
// modules/article-page/index.js
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    label: 'Articles Page'
  }
};
```

You would **add this to the `app.js` configuration** [like any other module](/guide/modules.html#setting-up-a-module). You could also add a field schema or other features as on page type modules.

::: tip
Piece page modules are not required to be named using the piece name plus `-page` suffix. If they are named like that the associated piece type will be found automatically. If you want to name it different, or if you need more than one piece page type for a single piece type, use the [`piecesModuleName` option](/reference/module-api/module-options.md#piecemodulename) to identify the correct piece type.
:::

Instead of a single `page.html` template, this module gets two templates.

| Template file name | What is it? |
| ------------------ | ----------- |
| `index.html` | Template for listing pieces using `data.pieces` (the **"index page**) |
| `show.html` | Template to display individual piece information using `data.piece` (a **"show page"**) |

Before we go any further, make sure you have reviewed the [page type guide](/guide/pages.md). Everything there also applies to index pages and templating is mostly the same for show pages as well.

## The index page template

Index page templates look very similar to other page templates. Look for the new features in this example blog index page.

```django
{# modules/article-page/views/index.html #}

{% extends "layout.html" %}
{% import '@apostrophecms/pager:macros.html' as pager with context %}

{% block main %}
  {% for article in data.pieces %}
    <article>
      <h2>
        <a href="{{ article._url }}">{{ article.title }}</a>
      </h2>
    </article>
  {% endfor %}

  {{ pager.render({
    page: data.currentPage,
    total: data.totalPages,
    class: 'blog-pager'
  }, data.url) }}
{% endblock %}
```

### `data.pieces` and other unique `data` properties

The first new thing there is the `import` statement, but we'll get back to that. Let's talk about the **loop over `data.pieces`**.

```django
{% for article in data.pieces %}
  <article>
    <h2>
      <a href="{{ article._url }}">{{ article.title }}</a>
    </h2>
  </article>
{% endfor %}
```

In addition to standard information, index page templates have access to `data.pieces`, which is an array of piece document objects. They will contain the title and URL as shown here, but also contain other piece data. This lets you do things like adding thumbnail images to listed items.

Since it's an array, we use the [Nunjucks `for` tag](https://mozilla.github.io/nunjucks/templating.html#for) to loop over the pieces.

The `data` object properties unique to index pages are:

| Property | What is it? |
| -------- | ----------- |
| `pieces` | An array of piece data objects for the current set of results |
| `currentPage` | A number representing what page of results is shown, starting with `1` |
| `totalPages` | The total number of results pages there are |
| `totalPieces` | The total number of pieces across all result pages |

### Pagination

```django
{% import '@apostrophecms/pager:macros.html' as pager with context %}

{{ pager.render({
  page: data.currentPage,
  total: data.totalPages,
  class: 'blog-pager'
}, data.url) }}
```

Index pages do not list every single piece in a single view. That could quickly become a problem. Instead, they include *ten* pieces on `data.pieces` at a time (by default).

The pager macro is a special template using the [Nunjucks macro](https://mozilla.github.io/nunjucks/templating.html#macro) feature. This particular macro accepts two arguments:

- an object with the `currentPage` and `totalPages` values, described above, as well as an optional CSS class for the pager wrapper
- the page URL, using `data.url`

Other than the class, the pager macro code above will rarely change.

**You can change the number of pieces in each page of results** by setting [the `perPage` option](/reference/module-api/module-options.md#perpage-2) on the module. The data passed to templates will all update, so you don't need to make any other adjustments.

## The show page template

```django
{# modules/product-page/views/show.html #}
{% extends "layout.html" %}
{% set product = data.piece %}

{% block main %}
  {# The layout already output the title for us #}
  <h4>Price: {{ product.price }}</h4>
  <section>{% area product, 'description' %}</section>
{% endblock %}
```

That's all we need to create a basic paginated index page for all of our products, with "virtual" subpages for the individual products, based on the `slug` field of each piece.

So to finish the job, just go to the home page, click "Page Tree," then click "New Page." Choose the "Product Page" type for your page and save, then click the link button in the page tree to jump to the new piece page.

