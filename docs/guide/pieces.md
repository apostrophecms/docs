# Pieces

"Piece types" are classifications for standalone, structured content. Individual entries created with a piece type are known as "pieces". Products, events, and authors are all common examples of piece types. The piece type defines how pieces are structured, how end users interact with them, and how they might interact with other content.

Use cases for pieces include:
- Articles in a blog
- Authors to associate with multiple articles
- Individual products in a store

Unlike Apostrophe ["pages"](/guide/pages.md), pieces do not always have a dedicated web page. In the "articles" and "authors" example, there would be a web page for each article, but there may not be a page for each author.

## Creating a piece type

You can create a new piece type by adding a module that extends the `@apostrophecms/piece-type` module. After instantiating in `app.js`, a piece type that had no other configuration would have the default fields **title**, **slug**, and **visibility**.

::: tip
Generate the starter code for a piece type using the [official CLI](/guide/setting-up.md#the-apostrophe-cli-tool) with the command:

```bash
apos add piece product
```
:::

``` js
// modules/product/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
};
```

``` js
// app.js
require('apostrophe')({
  shortName: 'my-store',
  modules: {
    product: {}
  }
});
```

A more realistic product piece might also include [fields](/reference/field-types/index.md) for the product price, description, and photo, as well as explicit labels for the UI.

``` js
// modules/product/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Product',
    pluralLabel: 'Products'
  },
  fields: {
    add: {
      price: {
        type: 'float',
        label: 'Price',
        required: true
      },
      description: {
        type: 'string',
        label: 'Description',
        textarea: true,
        required: true
      },
      image: {
        label: 'Product photo',
        type: 'area',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/image': {}
          }
        }
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [ 'title', 'price', 'description', 'image' ]
        // 👆 'title' is included here because it is in the default `basics`
        // group for all piece types. Since we are replacing that group, we
        // include it ourselves.
      }
    }
  }
};
```

::: tip
There is a full REST API for pieces that you can use in headless contexts, custom interfaces, and more. For more information, see [the REST API section](/reference/api/pieces.md).
:::

