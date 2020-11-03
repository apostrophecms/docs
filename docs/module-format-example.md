---
title: "Module Format Example"
---

# Module Format Example

The new A3 module format is best understood by reviewing a complete example with all of the sections.

```js
// modules/product/index.js
module.exports = {

  // Let us write `apos.product` instead of `apos.modules.product`
  alias: 'product',

  // Inherit from this "base class" module
  extend: '@apostrophecms/piece-type',

  // Options that formerly went at top level go here
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
    },
    // Replaces `removeFields`. Can remove inherited fields here if desired
    remove: [],
    // Replaces `arrangeFields`. Groups fields into tabs
    group: {
      pricing: {
        label: 'Pricing',
        fields: [ 'price', 'tax' ]
      }
    }
  },

  // This is only run when Apostrophe first
  // starts up. Formerly known as `afterConstruct`.
  // Can use "await".

  async init(self, options) {},

  methods(self, options) {
    return {
      // Can be called as `self.applyDiscount` inside the module,
      // or as `self.apos.product.applyDiscount` outside of it
      applyDiscount(piece, percentage) {
        piece.price = piece.price * (1.0 - percentage / 100);
      }
    };
  },

  extendMethods(self, options) {
    return {
      // Extend a method we inherited from `@apostrophecms/piece-type`.
      // The arguments are the same, plus `_super` is always the
      // first argument. Calling `_super` calls the original method.
      // If you don't need that, just declare the method again in `methods`.
      generate(_super, i) {
        const piece = _super(i.md);
        piece.price = Math.random() * 100;
        return piece;
      };
    };
  }
  // TODO continue here
}
```

TODO continue writing this example.
