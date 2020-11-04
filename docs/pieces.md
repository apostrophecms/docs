---
title: "Pieces"
---

# Pieces
What is a Piece?

As experienced A2 developers know, a piece type module defines structure and behavior for a single type of content, such as blog posts, products, or events. If you have hundreds of documents of the same type, that's a piece. If you want to let the user view them in a certain sorting order, that's a piece. If the same item might be appropriate to display on many different pages, that's a piece. Blog posts, events and products are all excellent examples. Less obvious examples include "category" or "tag" content types that serve to create a taxonomy for other pieces.

Apostrophe provides both pieces and "[piece pages](piece-pages.md)," which afford your users a way to browse, filter, paginate and discover pieces of a particular kind. For more information about using piece pages, see the [piece pages section](piece-pages.md).

## Pieces By Example

In A3, pieces work similarly to in 2.x, with a few important changes. Most of them are demonstrated in the [new module format example](module-format-example.md). Here's a shorter version focused specifically on features that make sense for pieces:

```js
// modules/product/index.js
module.exports = {

  extend: '@apostrophecms/piece-type',

  options: {
    label: 'Product',
    pluralLabel: 'Products'
  },

  fields: {
    // Replaces `addFields`
    add: {
      price: {
        type: 'float',
        label: 'Price'
      },
      tax: {
        type: 'float',
        label: 'Tax'
      },
      description: {
        type: 'area',
        label: 'Description',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {
              toolbar: [
                'bold',
                'italic',
                'link'
              ],
            }
          }
        }
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [ 'title', 'description' ]
      },
      pricing: {
        label: 'Pricing',
        fields: [ 'price', 'tax' ]
      }
    }
  },

  columns: {
    add: {
      price: {
        label: 'Price'
      }
    }
  },

  filters: {
    add: {
      belowAverage: {
        title: 'Price Below Average'
      }
    }
  },

  methods(self, options) {
    return {
      async averagePrice(req) {
        let sum = 0;
        const products = await self.find(req).toArray();
        if (!products.length) {
          return 0;
        }
        for (const product of products) {
          sum += product.price;
        }
        return sum / products.length;
      }
    };
  },

  extendMethods(self, options) {
    return {
      generate(_super, i) {
        const piece = _super(i.md);
        piece.price = Math.random() * 100;
        return piece;
      };
    };
  },

  handlers(self, options) {
    return {
      'beforeInsert': {
        async applyTax(req, piece) {
          piece.totalPrice = piece.price * (1.0 + (piece.tax / 100));
        }
      },
    };
  },

  queries(self, query) {
    return {
      builders: {
        belowAverage: {
          finalize() {
            if (query.get('belowAverage')) {
              const average = await self.averagePrice(query.req);
              query.and({
                price: {
                  $lt: average
                }
              });
            }
          },
          launder(value) {
            return self.apos.launder.boolean(value);
          },
          choices() {
            return [
              {
                value: '0',
                label: 'No'
              },
              {
                value: '1',
                label: 'Yes'
              }
            ];
          }
        }
      }
    };
  }
}
```

## Major Changes From A2

### Piece types extend `@apostrophecms/piece-type`

Modules that provide a piece type should extend `@apostrophecms/piece-type` in A3, or extend an existing piece type.

### Options go in their own section

Simple options like `label` now belong in the `options` section, not at the top level.

### "Schema fields" have moved to the `fields` section

The `fields` section is more readable and concise than the old `addFields` option, and it automatically "cascades," so if another module extends yours you don't have to write any special code to accommodate merging the fields.

### `arrangeFields` has moved to the `group` subsection

The old `arrangeFields` option has been replaced by the `group` subsection of `fields`. These cascade and merge too.

### Fields can be edited in the `utility` rail

In A2, fields that were not in any group appeared at the top of the dialog box when editing the piece, outside of any tab.

In A3, there is a similar section for fields that are always visible. But in A3, all fields must be grouped. So to place a field in the "utility rail," add it to the `utility` group.

### Columns are configured like fields

The new `columns` section refers to the columns displayed in the "manage pieces" dialog box. The `add` and `remove` subsections work just like they do for fields. You must specify `label`. There are no other subproperties at this time.

The data for a column automatically comes from the corresponding property of the piece.

### Filters are also configured like fields

The `filters` section configures filters to be included in the "Filters" dropdown of the "manage pieces" dialog box. Currently `label` is the only subproperty to be specified here.

Each filter must correspond to a field name, or to a custom "query builder" that you have defined, as shown below.

::: tip Note:
As in A2, filters display a drop-down list of all of the possible choices, so if there are thousands of choices a filter for that field might not be a good idea. Bear in mind the user can always use the search field.
:::

### Methods

In A2, methods were added in `construct`, which no longer exists. In A3, your custom methods always go in the `methods` section.

#### Extending methods: generating example pieces

Sometimes we want to extend an existing method we inherited from our base class. In A2 we did that by saving the old method in a variable. This was not intuitive for new developers.

A3 modules replace this process with the `extendMethods` section, providing a clear pattern. In the example above, the `generate` method is extended to generate a random `price`. Notice that `_super` is always the first argument. Invoking it calls the old version of the method, as part of our implementation of the new one.

This allows us to run:

```bash
node app product:generate
```

To generate test products with prices as well as titles.

### Handlers

In A2, pieces had empty methods, such as `beforeInsert` and `afterUpdate`, that were invoked as part of respective operations for devs to use as hooks. This was useful, but could be bug-prone when piece types extended each other.

Later in the A2 era, "promise events" were added to Apostrophe. These provided a way to listen for any insert or update operation on any type of document. But, each promise event handler had to specifically check `doc.type` to make sure it was relevant.

In A3, **promise events are emitted directly by the appropriate piece type module,** so you can listen to them without checking `doc.type`. This removes the need for the `beforeInsert` method.

Instead, we just write a handler:

```js
  handlers(self, options) {
    return {
      'beforeInsert': {
        async applyTax(req, piece) {
          piece.totalPrice = piece.price * (1.0 + (piece.tax / 100));
        }
      },
    };
  },
```

#### Handlers and inheritance

Since this handler is for our own piece type, we don't have to specify the module name. So if we are just interested in our own `beforeInsert` events, we should not specify it.

On the other hand, if we were interested in `beforeInsert` events emitted by *all* piece type modules in Apostrophe, we could listen to `@apostrophecms/piece-type:beforeInsert`. This takes advantage of a new A3 feature: inheritance for events. If an event is emitted by the `product` module, it can also be caught by listening for it on the module it extends (`@apostrophecms/piece-type`), or the module *that* extends (`@apostrophecms/doc-type`).

### Query builders

#### Standard query builders

First, some good news: in both A2 and A3, you usually don't have to write any custom code to filter a database query, filter a REST API query or even filter pieces right in the query string while browsing a [piece-page](piece-page.md). That's because Apostrophe automatically provides a "query builder" (formerly known as a "cursor filter") for most field types.

So if you want to look for an exact match on the `title` field in server-side JavaScript, you can try this:

```js
const product = await self.find(req).title('This exact title').toObject();
```

As a REST API query, you can write:

```
GET /api/v1/product?title=This%20exact%20title
```

And if you're browsing a product pieces page, you can add it to the query string there as well:

```
/product?title=This%20exact%20title
```

::: tip Note:
In addition to standard query builders for most fields you add, you can also use the `search` and `autocomplete` query builders. Search performs a full-text search, while `autocomplete` finds fewer matches but is suitable for prefix matches on partial words.
:::

#### Custom query builders

Sometimes you might want to add another query builder on your own. Here's an example query builder that filters our products to *return only those whose price is below average:*

```js
  queries(self, query) {
    return {
      builders: {
        belowAverage: {
          def: false,
          async finalize() {
            if (query.get('belowAverage')) {
              const average = await self.averagePrice(query.req);
              query.and({
                price: {
                  $lt: average
                }
              });
            }
          },
          launder(value) {
            return self.apos.launder.boolean(value);
          },
          choices() {
            return [
              {
                value: false,
                label: 'No'
              },
              {
                value: true,
                label: 'Yes'
              }
            ];
          }
        }
      }
    };
  }
```

::: tip Note
Notice that `builders` is nested in the `queries` section. There is also a `methods` section, which is added to less often. It is primarily used to define new final endpoints for queries, like the `toArray` and `toObject` methods.
:::

**These are the important sub-sections of a query builder:**

* `def` sets the default value for the query builder. `query.get('belowAverage')` will return this if the query builder is not called by the developer or included in the query string.

* `finalize` is the function called at the end of the query to actually change the MongoDB criteria. It may be an `async` function, and here we take advantage of that to determine the average price. `finalize` typically calls the `and` query builder, adding one more condition that must be met without accidentally eliminating others. Notice that we must call `query.get('belowAverage')` to make sure the query builder was actually called with a truthy value. Otherwise we would filter the results all the time.

* `launder` is required if we want our query builder to be permitted in query strings. It must assume that the content could be malicious and ensure it is turned into a safe value for `finalize` to look at. Here we use the [launder](https://www.npmjs.com/package/launder) module, always available as `self.apos.launder`, to convert the value to a boolean.

* `choices` should be provided if we want our query builder to work in the `filters` section and appear in the "Manage Pieces" dialog box in the "Filters" dropdown. It may be an `async` function, if needed. If your query builder has the same name as a field and you do not implement `choices`, Apostrophe will offer all of the distinct values of that field as the choices.

## REST APIs for Pieces

REST APIs are automatically made available for piece types. For more information, see [REST APIs](rest-apis.md).

## Pieces and Widgets

Of course, it's helpful to be able to display pieces anywhere in your project. Sometimes you won't want a browseable piece page at all, or you may want to "tease" that piece as the "featured product" on the home page, and so on.

In A2, a "pieces widget" was provided as a standard feature, with several filtering options for the user. However, users didn't use most of these options and found the presentation to be confusing. In many projects, developers just created their own widget with a simple "relationship" field (formerly known as a "join"). In A3 this is the approach we are recommending.

Here is a simple example:

```js
// in ./app.js
modules: {
  // ...
  product: {},
  'product-widget': {}
}
```

```js
// in ./modules/product-widget/index.js
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    projection: {
      title: 1,
      _url: 1
    }
  },
  fields: {
    add: {
      _products: {
        label: 'Products',
        type: 'relationship',
      }
    }
  }
};
```

```django
{# in ./modules/product-widget/views/widget.html #}
{% for product in data.widget._products %}
  <h4><a href="{{ product._url }}">{{ product.title }}</a></h4>
{% endfor %}
```

## Async Components

Pieces often implement async components as an easy way to display them on the page in a variety of contexts, including both widgets and fixed placements in the page template. This is particularly useful when a simple relationship field does not meet the need. For more information, see [async components](async-components.md).

## Piece Pages

As referred to above, while they are not needed in every case, piece pages are a crucial companion to pieces for any website that allows the user to browse an index of pieces. See the [piece pages](piece-pages.md) section to get started.
