# Piece index and show pages

**Piece index pages** allow editors to add pages listing pieces of a particular type. They also allow pieces to have their own web pages -- known as **show pages** in Apostrophe. Show pages are automatically available once an index page and pieces of the matching piece type are created.

Index pages are added similarly to other [pages](/guide/pages.md) with a few important differences. Basically, these page modules have **1)** two separate template files and **2)** additional piece data available in templates. Piece page modules extend `@apostrophecms/piece-page-type`.

## Creating a piece page module

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
  <h1>{{ data.page.title }}</h1>

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

As a reminder, show pages are the web pages for individual pieces, rendered from `show.html` templates. This template uses a very standard page template structure. Assuming our `article` piece type example has a single `main` area, it could look like this:

```django
{# modules/article-page/views/show.html #}
{% extends "layout.html" %}

{% block main %}
  <h1>{{ data.piece.title }}
  <section>
    {% area data.piece, 'main' %}
{% endblock %}
```

Instead of `data.page`, this template is using `data.piece` to access the piece data. In most other ways they work the same way as any other page template. There are some other special data available in show page templates:

| Property | What is it? |
| -------- | ----------- |
| `piece` | The document object for the featured piece. In a blog, this would be a single article. |
| `page` | In show page templates, `data.page` still exists, but refers to the index page |
| `previous` | If using the [`previous: true` option](/reference/module-api/module-options.md#previous), `data.previous` is the previous piece based on the [sort](/reference/module-api/module-options.md#sort) |
| `next` | If using the [`next: true` option](/reference/module-api/module-options.md#next), `data.next` is the next piece based on the [sort](/reference/module-api/module-options.md#sort) |

## Index and show page URL basics

Index page URLs, like other page URLs, generally are constructed from the base domain/URL (the home page URL) plus their slug. Page slugs include forward slashes and, by default, the path of their parent page, if they have one.

If the home page URL was `https://example.rocks` and the "Articles" index page had the slug `/articles`, the "Articles" page URL would be **`https://example.rocks/articles`**. This is the way all Apostrophe pages work.

Show pages are extensions of their index page. To that end, their URLs are the index page url plus the piece slug. Piece slugs do not have slashes or look like a URL path on their own since pieces can be used in many ways.

Consider an article "How to write Javascript." Apostrophe would generate the slug `how-to-write-javascript` based on the title. With the index page url `https://example.rocks/articles` and that slug, the show page URL would be **`https://example.rocks/articles/how-to-write-javascript`**.

The structure of index and show page URLs is one of the most clear ways to understand how show pages depend on index pages. Even if this does not seem terribly complex, it is important to understand that relationship.

::: note
You may create multiple index pages of a particular type. If you do, the related piece show pages can be accessed at URLs based on any of the index pages. So if you create one articles index page with the slug `/articles` and another with `/news`, both of these URLs will go to the same article:

- `https://example.rocks/articles/how-to-write-javascript`
- `https://example.rocks/news/how-to-write-javascript`

This can be used to create index pages that are filtered to list different pieces (e.g., articles on different topics).

Even if any of the index page URL paths can be used to reach a particular show page, the piece will have a primary `_url` property when requested (e.g., in a `GET` API request). That primary URL is generated using the index page identified using the `chooseParentPage` method on `@apostrophecms/piece-page-type`. By default it simply returns the first index page created, but you can override that method to choose a matching index page another way.

<!-- TODO: Link to the piece page module reference page `chooseParentPage` method when available. -->
:::
