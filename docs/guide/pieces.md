# Pieces

"Pieces" in Apostrophe are standalone, structured content that has an assigned piece type. That type is what defines how the piece is structured, how end users interact with it, and how it might interact with other content. Blog posts, events, and people profiles are all common examples of piece types.

General use cases for pieces include:
- Content that will be listed using pagination, such as **articles in a blog**
- Content of a particular type that will help to organize other content, such as **teams that connect to people pieces**
- Content that will be selectively displayed based on end user input, such as **products on a store's website**

Pieces are distinct from "pages" in Apostrophe in that they do not inherently have an internal hierarchy: generally speaking, one piece is not the "parent" of another of the same type. Pieces also do not necessarily have dedicated web pages for each one. In the "teams" and "people" example, there may be a web page for each team, but the people are only displayed within those team pages -- not on their own pages.

## Creating a piece type

Each piece type has its own module in the codebase. At the most basic level, the only critical configuration for a piece type module is to extend the `@apostrophecms/piece-type` module. Adding only that configuration, and instantiating the module in `app.js`, you will get a piece type that you can use to create new pieces.

```js
// modules/product/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
};
```

```js
// app.js
require('apostrophe')({
  shortName: 'my-store',
  modules: {
    product: {}
  }
});
```

If you did nothing more than that, this product content would only have the fields that all pieces get by default: **title**, **slug**, and **visibility** (whether public or requiring login). There are cases where that is enough, but more often you will add additional configuration.

A more realistic product piece module might also include [schema fields](/reference/field-types/) for the product price, description, and photo, as well as explicit labels for the UI.

```js
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
          max: 1
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
      }
    }
  }
};
```

::: tip
There is a full REST API for pieces that you can use in headless contexts, custom interfaces, and more. For more information, see [the REST API section](/reference/api/pieces.md).
:::

