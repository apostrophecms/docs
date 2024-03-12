---
extends: '@apostrophecms/doc-type'
---

# `@apostrophecms/piece-page-type`

<AposRefExtends :module="$frontmatter.extends" />

This module adds two specialized views to those exposed by the `page-type` module, which `piece-page-type` extends. The [index page](https://docs.apostrophecms.org/reference/glossary.html#index-page) displays all pieces of a particular `piece-type` in a paginated, filterable manner. The [show page](https://docs.apostrophecms.org/reference/glossary.html#show-page) is for presenting individual pieces. These features are added to those exposed by the [`@apostrophecms/page`](/reference/modules/page.md) module.

Once an editor adds a page of this type to the site via the user interface, it becomes possible to view a listing of pieces by visiting that page's URL. Individual pieces of the relevant type can be viewed by adding the piece slug to the page's URL, like this: `/slug-of-index-page/slug-of-piece`.

It is possible to add more than one index page for a particular piece-type and add custom logic to decide which pieces should be associated with each. For example, you could have an `article` piece type with index pages for different topics, like sports, finance, and tech. This can be accomplished by overriding the [`filterByIndexPage()`](#filterbyindexpage-query-page) method to fetch the pieces you think most appropriate given the settings of each index page. Conversely, override [`chooseParentPage()`](#chooseparentpage-pages-piece) to associate the individual review show pages with the correct index.

Any index page is searchable using the `search` query parameter. This parameter takes advantage of MongoDB indexes automatically created by the `@apostrophecms/doc` module. This query is limited to the piece data being delivered to the page, so any [`piecesFilters`](#piecesfilters) will limit the results that are returned.

<AposCodeBlock>

```nunjucks
<form action="" method="GET">
  <input type="text" name="search" placeholder="Search here..." value="{{ data.query.search | safe }}" />
  <button type="submit">Search</button>
  {% if data.query.search %}
    <button type="button" onclick="window.location.href='{{ data.url | build({search: null}) }}'">Clear Search</button>
  {% endif %}
</form>
```
  <template v-slot:caption>
    modules/article-page/views/index.html
  </template>

</AposCodeBlock>

This example implements a search box that can be integrated into an `index.html` file. This box utilizes the `search` parameter to refine the page's content, showing only the items that correspond to the search term entered by the user. As written, this will clear all of the existing query parameters that have been added to the URL. You would have to further parse the `data.query` object to retain existing parameters. The empty `action` attribute of the form element will, by default, direct the form submission to the current URL. The button to clear the search query takes advantage of the Apostrophe-supplied Nunjucks [`build()` filter](https://docs.apostrophecms.org/guide/template-filters.html#build-url-path-data) to manipulate the query parameters.

Most schema fields of a piece can also be used to filter content using query parameters. For instance, you could filter by an `_author` relationship schema field to retrieve a list of all articles authored by Bob Smith using `https://my-website.com/article-page?author=bob+smith`. This example and the previous one demonstrate how to filter the pieces delivered to an `index.html` page by manipulating the URL, but you can also use the schema fields or other custom queries within the `piecesFilters` option, as described below, to create structured filtering options.

## Options

|  Property | Type | Description |
|---|---|---|
| [`next`](#next) | Boolean \|\| Object | If set to `true`, `data.next` is the next piece based on the sort. |
| [`perPage`](#perpage) | Integer | The number of pieces to include in a set of `GET` request results. |
| [`piecesFilters`](#piecesfilters) | Array | Takes an array of objects where each contains a `name` key and a value of a field in the piece to filter on. |
| [`pieceModuleName`](#piecemodulename) | String | Optionally sets the `piece-type` to a specific name other than the default inferred from the module name. |
| [`previous`](#previous) | Boolean \|\| Object | If set to `true`, `data.previous` is the previous piece based on the sort. |

### `next`
If this option is set to true, it exposes the next piece in the current [sort order](https://docs.apostrophecms.org/reference/module-api/module-options.html#sort) as `req.data.next` (`data.next` in the template) when serving a [show page](https://docs.apostrophecms.org/reference/glossary.html#general-terms). This can be used to provide a link to the next item in a series (e.g., the next oldest blog post).

This option can also be set to an object whose keys are [query builders](https://docs.apostrophecms.org/reference/query-builders.html#query-builders), such as `project`, and whose values are the parameters passed to each query builder.

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    next: true
  },
  // …
}

// OR

module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    // The next article piece would be returned with only the `title, `_url`
    // and `lastPublishedAt` properties.
    next: {
      project: {
        title: 1,
        _url: 1,
        lastPublishedAt: 1
      }
    }
  },
  // …
}
```
<template v-slot:caption>
  modules/article-page/index.js
</template>
</AposCodeBlock>

### `perPage`
The `perPage` option should be set to an integer and specifies the number of pieces displayed per page for the `index.html` page before pagination is offered. It is set to 10 items per page by default.

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    perPage: 20
  },
// …
}
```
  <template v-slot:caption>
    modules/article-page/index.js
  </template>
</AposCodeBlock>

### `piecesFilters`
The `piecesFilters` takes an array of objects to assist in filtering on the index page. Each object must have a `name` property associated with a valid [query builder](https://docs.apostrophecms.org/reference/module-api/module-overview.html#queries-self-query).

These include:
* Custom query builders configured in an app that include a `launder` method
* Field names whose field types automatically get builders:
    - boolean
    - checkboxes
    - date
    - float
    - integer
    - relationship
    - select
    - slug
    - string
    - url

When the index page is served, filter data will be returned in the `req.data.piecesFilters` object (`data.piecesFilters` in the template). This object consists of an array for each configured filter. That array contains objects with `value` and `label` properties for every `piece-type` that matches the filter. Passing filter values back to the index page as query string parameters will filter the results accordingly. If `counts: true` is included for the filter query, each object in the array will also have a `count` property with the number of matching pieces.

A simplified schema for a 'book' `piece-type`:
<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Book',
    pluralLabel: 'Books'
  },
  fields: {
    add: {
      _author: {
        label: 'Author',
        type: 'relationship'
      },
      genre: {
        label: 'Genre',
        type: 'select',
        choices: [
          // category choices here
        ]
      }
    }
    // …
  }
};
```
  <template v-slot:caption>
    modules/book/index.js
  </template>
</AposCodeBlock>

A partial schema, including a `piecesFilters` option, for the 'book-page' `piece-page-type`:
<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    piecesFilters: [
      { name: 'author' },
      {
        name: 'genre',
        counts: true
      }
    ]
  }
  // ...
};
```
  <template v-slot:caption>
    modules/book-page/index.js
  </template>
</AposCodeBlock>

An example of the `data.piecesFilters` object delivered to the 'book-page' `index.html` template:
<AposCodeBlock>

```
{
  author: [
    {
      _id: 'cloqajh0v0007selseq2c2np6:en:published',
      type: 'author',
      metaType: 'doc',
      _edit: true,
      _publish: true,
      label: 'Gibson',
      value: 'gibson'
    },
    {
      _id: 'cloqak2rl000jsels2a20anjt:en:published',
      type: 'author',
      metaType: 'doc',
      _edit: true,
      _publish: true,
      label: 'Herbert',
      value: 'herbert'
    },
    {
      _id: 'cloqajsju000dsels8o2e3dgb:en:published',
      type: 'author',
      metaType: 'doc',
      _edit: true,
      _publish: true,
      label: 'Le Guin',
      value: 'le-guin'
    }
  ],
  genre: [
    { value: 'cyberpunk', label: 'Cyberpunk', count: 6 },
    { value: 'dystopian', label: 'Dystopian', count: 3 },
    { value: 'fantasy', label: 'Fantasy', count: 9 }
  ]
}
```
<template v-slot:caption>
data.piecesFilters
</template>

</AposCodeBlock>

Example usage of the `data.piecesFilter`:

<AposCodeBlock>

```nunjucks
{% extends "layout.html" %}

{%- macro here(url, changes) -%}
  {{ url | build({
    author: data.query.author,
    genre: data.query.genre
  }, changes) }}
{%- endmacro -%}

{% set authors = data.piecesFilters.author %}
{% set genres = data.piecesFilters.genre %}

{% block main%}
<h3>Authors</h3>
<ul>
  {% for author in authors %}
    <li><a style="{{ 'font-style: italic' if data.query.author == author.value }}" href="{{ here(data.url, {author: author.value}) }}">{{ author.label }}</a></li>
  {% endfor %}
</ul>
<h3>Genres</h3>
<ul>
  {% for genre in genres %}
    <li><a style="{{ 'font-style: italic' if data.query.genre == genre.value }}" href="{{ here(data.url, {genre: genre.value}) }}">{{ genre.label }} has {{ genre.count }} entries</a></li>
  {% endfor %}
</ul>
{% for piece in data.pieces %}
  <p><strong>{{ piece.title }}</strong> ({{ piece.genre }}) by {{ piece._author[0].name }} </p>
{% endfor %}
{% endblock %}
```
  <template v-slot:caption>
    modules/book-page/views/index.html
  </template>

</AposCodeBlock>

### `pieceModuleName`
Piece page types are associated with a single piece type. If named with the pattern `[piece name]-page`, the associated piece type will be identified automatically. You can override this pattern by explicitly setting `pieceModuleName` to an active piece type. This is useful if there is more than one piece page type for a single piece type (e.g., to support different functionality in each).

<AposCodeBlock>

```javascript
// 👆 This module name would look for a piece type
// named `fiction` if not for `pieceModuleName`
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    pieceModuleName: 'book'
  }
  // Code to select and group only fiction books
  // …
};
```
<template v-slot:caption>
modules/fiction-page/index.js
</template>
</AposCodeBlock>

### `previous`
If this option is set to true, it exposes the previous piece in the current [sort order](https://docs.apostrophecms.org/reference/module-api/module-options.html#localized) as `req.data.previous` (`data.previous` in the template) when serving a [show page](https://docs.apostrophecms.org/reference/glossary.html#general-terms). This can be used to provide a link to the previous item in a series (e.g., the next newest blog post).

This option can also be set to an object whose keys are [query builders](https://docs.apostrophecms.org/reference/query-builders.html#query-builders), such as `project`, and whose values are the parameters passed to each query builder.

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    previous: true
  },
  // …
}

// OR

module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    // The previous article piece would be returned with only the `title`, `_url`
    // and `lastPublishedAt` properties.
    next: {
      project: {
        title: 1,
        _url: 1,
        lastPublishedAt: 1
      }
    }
  },
  // …
}
```
<template v-slot:caption>
  modules/article-page/index.js
</template>
</AposCodeBlock>

## Related Documentation

* [Piece index and show pages](https://docs.apostrophecms.org/guide/piece-pages.html)
* [Piece page type options](https://docs.apostrophecms.org/reference/module-api/module-options.html#options-for-piece-page-types)

## Featured methods
The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/piece-page-type/index.js) for all the modules that belong to this module.

### `indexQuery(req)`
This method should be overridden for a piece-type to call additional [query builders](https://docs.apostrophecms.org/reference/query-builders.html#query-builders) when generating the index page.

### `showQuery(req)`
This method should be overridden for a piece-type to call additional [query builders](https://docs.apostrophecms.org/reference/query-builders.html#query-builders) when generating the show page.

### `async beforeIndex(req)`
This method is called before `indexPage`. Within the core module it does nothing, so it can be easily overridden by supplying a new method in the `methods` section of the custom module. It is a convenient method for manipulating the `req` being supplied to that page.

### `async beforeShow(req)`
This method is called before `showPage`. Within the core module it does nothing, so it can be easily overridden by supplying a new method in the `methods` section of the custom module. It is a convenient method to extend for manipulating the `req` being supplied to that page.

### `dispatchAll()`
This method can be extended to override the default behavior of invoking `showPage` if the URL has an additional path after the base, e.g. `/blog/good-article`. As example, you could override to use `/:year/:month/:day/:slug` to invoke `self.showPage`. This should be used in conjunction with the [`buildUrl()`](#buildurl-req-page-piece)) method of this module. See [@apostrophecms/page-type](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/page-type/index.js) for more about what you can do with dispatch routes.

### `buildUrl(req, page, piece)`
This method can be overridden to change the URLs that are generated as the `_url` property for individual pieces. Note that the [`dispatchAll`](#dispatchall) method often must also be overridden to ensure those URLs actually reach those pieces.

### `filterByIndexPage(query, page)`
This method invokes query builders on the supplied query argument to ensure it only fetches results appropriate to the given page. This is typically done when there is more than one pieces-page per page type. Within the core module it does nothing, so it can be easily overridden by supplying a new method in the `methods` section of the custom module. This should be used in conjunction with the [`chooseParentPage`](#chooseparentpage-pages-piece) method of this module.

### `chooseParentPage(pages, piece)`
The `pages` parameter of this method takes an array of all of the index pages for a particular piece-type, and the `piece` parameter is an individual piece-type name. The default version of this method will give a warning if it sees more than one page in the array, as it is up to the developer to override this method to provide a sensible way of deciding which page is the best 'parent' for each piece.