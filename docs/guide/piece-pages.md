# Piece index and show pages

**Index pages** list pieces of a particular type. Once one is created, each individual piece automatically has its own web page, known in Apostrophe as a **show page**. If you're familiar with blogs, you know this model all too well.

This feature set is powered by the `@apostrophecms/piece-page-type` module (because you're creating a *page type* that displays *pieces*, get it?).

Index pages support all features from [pages](/guide/pages.md), then add on some special features. In short, those are:

- Two template files: one for index pages and one for show pages
- Additional piece data available in templates

## Creating a piece page type

There are two critical steps to adding a new module for a piece page type:

1. [Extend](/guide/module-configuration-patterns.html) `@apostrophecms/piece-page-type`
2. Specify what piece type should be shown on the page

Extending the right module is simple enough. These modules use the property:

```javascript
extend: '@apostrophecms/piece-page-type',
```

Identifying the piece type can be done two ways: **using a module naming convention** or **using the `pieceModuleName` setting**. We can look at both options using a blog as our example.

### Matching a piece type using naming

In this example, the piece type is `article`, since "articles" are the individual entries that make up a blog. If you name the piece page type `article-page`, Apostrophe will automatically know that the two modules go together. (In case you missed the trick there, the piece page name is: piece type + `-page`.)

The piece page module then looks like:

<AposCodeBlock>

  ```javascript
  module.exports = {
    extend: '@apostrophecms/piece-page-type',
    options: {
      label: 'Blog page'
    }
  };
  ```
  <template v-slot:caption>
    modules/article-page/index.js
  </template>

</AposCodeBlock>

One benefit of this approach is that the codebase folders for the piece type and piece page type will be next to one another alphabetically. This tends to be the choice of the Apostrophe core team.

![Screenshot of code directories "article" and "article-page"](/images/piece-page-modules.png)

### Specifying the piece type with `pieceModuleName`

This method allows you to name the module whatever you want since you are specifically identifying a piece type. Set the [`pieceModuleName` option](/reference/module-api/module-options.md#piecemodulename) to the piece type name and Apostrophe makes the right connection.

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    label: 'Blog page',
    pieceModuleName: 'article'
  }
};
```
<template v-slot:caption>
  modules/blog-page/index.js
</template>

</AposCodeBlock>

Either method works well and you may find both options useful depending on the situation.

### Add template files and instantiate

Piece page types use two templates, both added in the module's `views` directory (e.g., `modules/article-page/views/`).

::: tip
When using the [official CLI](/guide/development-setup.md#installing-the-apostrophe-cli) to create a piece page type, include the `--page` option when creating the piece type. It will not only generate the piece type for you, but also the piece page code including blank template files.

```bash
apos add piece article --page
```
:::

| Template file name | What is it? |
| ------------------ | ----------- |
| `index.html` | Template for listing pieces (the **"index page**) |
| `show.html` | Template to display an individual piece (a **"show page"**) |

We'll review each template's features next.

Once those template files exist, you would **add this to the `app.js` configuration** [like any other module](/guide/modules.html#setting-up-a-module). Additionally, in order for your pages to show up in the page selection dropdown, you also need to add your module to the `module/@apostrophecms/page/index.js` file. As with other pages, you add an object with the name of the module and a label into the `types` option array.

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    types: [
      // 👇 Adding our new page type
      {
        name: 'article-page',
        label: 'Article page'
      },
      // 👇 Optionally including the core "Home page" type
      {
        name: '@apostrophecms/home-page',
        label: 'Home page'
      }
    ]
  }
}
```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>

</AposCodeBlock>

::: warning 🛑 Hold up. ✋

You've reviewed the [page type guide](/guide/pages.md), right? The sections below will highlight the special features of index and show page templates. For general page template syntax, see that page type guide.
:::

## The index page template

Index page templates look very similar to other page templates.

``` nunjucks
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

The first new thing here is the `import` statement, but we'll get back to that. Let's talk about the **loop over `data.pieces`**.

``` nunjucks
{% for article in data.pieces %}
  <article>
    <h2>
      <a href="{{ article._url }}">{{ article.title }}</a>
    </h2>
  </article>
{% endfor %}
```

Index page templates have access to `data.pieces`, which is an array of piece docs. Since it's an array, we use the [Nunjucks `for` tag](https://mozilla.github.io/nunjucks/templating.html#for) to loop over the pieces.

The `data` object properties unique to index pages are:

| Property | What is it? |
| -------- | ----------- |
| `pieces` | An array of piece docs for the current set of results |
| `currentPage` | A number representing what page of results is shown, starting with `1` |
| `totalPages` | The total number of results pages there are |
| `totalPieces` | The total number of pieces across all result pages |

### Pagination

``` nunjucks
{% import '@apostrophecms/pager:macros.html' as pager with context %}

{{ pager.render({
  page: data.currentPage,
  total: data.totalPages,
  class: 'blog-pager'
}, data.url) }}
```

By default, index pages will include up to *ten* pieces on `data.pieces` at a time. **You can change the number of pieces in each page of results** by setting [the `perPage` option](/reference/module-api/module-options.md#perpage-2) on the module. The data passed to templates will update, so you don't need to make any other adjustments.

Apostrophe's pager macro adds basic, unstyled pagination to view more. The pager macro is a special template using the [Nunjucks macro](https://mozilla.github.io/nunjucks/templating.html#macro) feature. This particular macro accepts two arguments:

1. an object with the `currentPage` and `totalPages` values, described above, as well as an optional CSS class for the pager wrapper
```javascript
{
  page: data.currentPage,
  total: data.totalPages,
  class: 'my-pager-class' // Optional
}
```
2. the page URL, `data.url`

## The show page template

Show pages are the web pages for individual pieces, rendered from `show.html` templates. Instead of `data.page`, the template uses `data.piece` to access the piece data.

Assuming our `article` piece type example has a single `body` area, it could look like this:

<AposCodeBlock>

  ```javascript
  module.exports = {
    extend: '@apostrophecms/piece-type',
    options: {
      label: 'Article'
      // Additionally add a `pluralLabel` option if needed.
    },
    fields: {
      add: {
        body: {
          label: 'Article text',
          type: 'area',
          options: {
            max: 1,
            widgets: {
              '@apostrophecms/rich-text': {}
            }
          }
        }
      },
      group: {
        basics: {
          label: 'Basics',
          fields: [ 'title', 'body' ]
        }
      }
    }
  }
  ```
  <template v-slot:caption>
    modules/article/index.js
  </template>

</AposCodeBlock>

``` nunjucks
{# modules/article-page/views/show.html #}
{% extends "layout.html" %}

{% block main %}
  <h1>{{ data.piece.title }}</h1>
  <section>
    {% area data.piece, 'body' %}
  </section>
{% endblock %}
```

There are some other special data available in show page templates:

| Property | What is it? |
| -------- | ----------- |
| `piece` | The document object for the featured piece. In a blog, this would be a single article. |
| `page` | In show page templates, `data.page` refers to the index page |
| `previous` | If using the [`previous: true` option](/reference/module-api/module-options.md#previous), `data.previous` is the previous piece based on the [sort](/reference/module-api/module-options.md#sort) |
| `next` | If using the [`next: true` option](/reference/module-api/module-options.md#next), `data.next` is the next piece based on the [sort](/reference/module-api/module-options.md#sort) |

## Index and show page URL basics

Index page URLs, like other page URLs, generally are constructed from the base domain/URL (the home page URL) plus their slug. Page slugs include forward slashes and, by default, the path of their parent page, if they have one.

If the home page URL was `https://example.rocks` and the "Articles" index page had the slug `/articles`, the "Articles" page URL would be **`https://example.rocks/articles`**.

Show pages are extensions of their index page. To that end, their URLs are the index page url plus the piece slug. Piece slugs do not have slashes or look like a URL path on their own since pieces can be used in many ways.

Consider an article "How to write JavaScript." Apostrophe would generate the slug `how-to-write-javascript` based on the title. With the index page url `https://example.rocks/articles` and that slug, the show page URL would be **`https://example.rocks/articles/how-to-write-javascript`**.

The structure of index and show page URLs is one of the most clear ways to understand how show pages depend on index pages. Even if this does not seem terribly complex, it is important to understand that relationship.

::: info
You may create multiple index pages of a particular type. If you do, the related piece show pages can be accessed at URLs based on any of the index pages. For example, if you create one articles index page with the slug `/articles` and another with `/news`, both of these URLs will go to the same article:

- `https://example.rocks/articles/how-to-write-javascript`
- `https://example.rocks/news/how-to-write-javascript`

This can be used to create index pages that are filtered to list different pieces (e.g., articles on different topics).

Even if any of the index page URL paths can be used to reach a particular show page, the piece will have a primary `_url` property when requested (e.g., in a `GET` API request). That primary URL is generated using the index page identified using the `chooseParentPage` method on `@apostrophecms/piece-page-type` (and modules that extend it). By default it simply returns the first index page created, but you can override that method to choose a matching index page another way.

<!-- TODO: Link to the piece page module reference page `chooseParentPage` method when available. -->
:::
