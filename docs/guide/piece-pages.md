---
title: "Piece Pages"
---

# Piece Pages

The most intuitive example is a blog: if the individual [piece](pieces.md) is one blog post, then the piece page is the blog's home page, where all of the posts can be discovered, paginated, filtered and explored. In addition,  "piece pages" are responsible for serving the individual webpage for each piece.

If the project has a piece module called `product`, then that module provides a way to create, edit, manage and query pieces. If the project has a piece page module called `product-page`, then that module provides a way to browse and view the pieces.

In general piece modules are concerned with *editing and APIs*, while piece page modules are concerned with *browsing as part of a website*. For developers familiar with the "model / view / controller" pattern: **piece modules are the model layer for your content type, while piece page modules are the view layer.**

Some projects just need a widget module for each piece, but most will want to let users view a page for each one, or at least browse and paginate through a complete list. That's where piece pages shine.

## Piece Pages by Example

In A3, piece pages work much like 2.x, with a few important changes. Most of those changes are described by the the [new module format](module-format-example.md).

Just like in A2, piece page modules and piece modules come in pairs. And the name of the piece page module automatically determines which piece module it works together with. So we don't need very much code in our actual module in order to get started.

Here's an example of a piece page module that works with the product piece described in the [pieces section](pieces.md):

```js
// app.js
require('apostrophe')({
  modules: {
    // ... other modules ...
    // piece module
    product: {},
    // piece page module
    'product-page': {}
  }
});
```

```js
// modules/page/index.js
// Add the new page type to the "Type" dropdown for new pages

module.exports = {
  options: {
    types: [
      {
        name: 'default-page',
        label: 'Default'
      },
      {
        name: 'product-page',
        label: 'Product Index'
      },
      {
        name: '@apostrophecms/home-page',
        label: 'Home'
      }
    ]
  }
};
```

```js
// modules/product-page/index.js
// Configure our new piece page type
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    label: 'Product Index Page'
  }
};
```

```django
{# modules/product-page/views/index.html #}

{% import '@apostrophecms/pager:macros.html' as pager with context %}
{% extends "layout.html" %}

{% block main %}
  {% for product in data.pieces %}
    <h2>
      <a href="{{ product._url }}">{{ product.title }}: {{ product.price }}</a>
    </h2>
    <section>{% area product, 'description' %}</section>
  {% endfor %}

  {# The pager macro now takes a `class` option to set `class` attributes. #}
  {{ pager.render({
    page: data.currentPage,
    total: data.totalPages,
    class: 'my-pager-class'
  }, data.url) }}
{% endblock %}
```

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

### Major changes from A2

* In A3, we extend `@apostrophecms/piece-page-type`.

* In A3, there are no tags, so there is no "with these tags" feature to limit what is displayed on a particular piece page. However, you can do this yourself as described later.

* Infinite scroll and refresh-free filtering don't currently exist in A3. Since A3 is much less opinionated on the front end, they probably won't be part of the core, but they may come back at some point as an optional module.

## Filtering pieces on the Piece Page

Just like in A2, we can configure `piecesFilters` to offer filtering to our website visitors. Let's start by adding a field to our `product` pieces that's good to filter on:

```js
// modules/product/index.js
module.exports = {
  // ...
  fields: {
    add: {
      // ... add this as one more field
      color: {
        type: 'select',
        label: 'Color',
        choices: [
          {
            value: 'red',
            label: 'Red'
          },
          {
            value: 'green',
            label: 'Green'
          },
          {
            value: 'blue',
            label: 'Blue'
          }
        ]
      }
    }
  }
};
```

```js
// modules/product-page/index.js
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    label: 'Product Index Page',
    piecesFilters: [
      {
        name: 'color',
        label: 'Color'
      }
    ]
  }
};
```

```django
{# modules/product-page/views/index.html #}

{# ... add this before the list of products #}
<nav>
  {% for choice in data.piecesFilters.color %}
    {% if data.query.color == choice.value %}
      {# Click to remove the filter #}
      {{ choice.label }}
      <a
        href="{{ data.url | build({ color: null }) }}"
      >
        ⓧ
      </a>
    {% else %}
      {# Click to select the filter #}
      <a
        href="{{ data.url | build({ color: choice.value }) }}"
      >
        {{ choice.label }}
      </a>
    {% endif %}
  {% endfor %}
</nav>
```

:::  tip Note:
You won't see any choices for the filter unless you actually have products that have been assigned a color via the color field we just added. Similarly, if you add more than one filter, you will never see filter combinations that produce zero results.

The syntax for `piecesFilters` may change before the final 3.x release.
:::

## Multiple Piece Pages for the Same Piece Type

Rather than filtering them all on the same page, you might prefer to create separate galleries of red products, green products, and blue products — or split them up into separate piece pages in some other way. It's up to you. The important thing is that you let Apostrophe know how to identify the pieces you want for this particular page. This is different from A2, where this was handled via tags by default.

We'll solve it by adding a `color` field to our piece pages as well, along with logic to browse only matching pieces and assign the right URL to each piece:

```js
// modules/product-page/index.js
// modules/product-page/index.js
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    label: 'Product Index Page'
  },
  fields: {
    add: {
      color: {
        type: 'select',
        label: 'Color',
        choices: [
          {
            value: 'red',
            label: 'Red'
          },
          {
            value: 'green',
            label: 'Green'
          },
          {
            value: 'blue',
            label: 'Blue'
          }
        ]
      }
    }
  },
  methods(self, options) {
    return {
      filterByIndexPage(query, page) {
        if (page.color) {
          query.color(page.color);
        }
      },
      chooseParentPage(pages, piece) {
        return pages.find(page => page.color === piece.color);
      }
    };
  }
};
```

Here we've done three things:

* We've added a `color` field to the piece page itself.
* We've overridden the `filterByIndexPage` method in order to restrict the `product` pieces to those that match the `color` of this piece page. Notice that we didn't have to write a query builder for `query.color`. All `select` fields automatically have one.
* We've overridden `chooseParentPage` to pick the first piece page with a `color` setting that matches the `piece`. This helps Apostrophe assign the right `_url` to the piece.

Now we can add three separate product pages via the Page Tree button. Be sure to assign a value to the "Color" field. When you visit that page, you will see only products of the appropriate color. In addition, when you display those products anywhere on the site via a widget, the link for more information will be a virtual subpage of the matching piece page.
