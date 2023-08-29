---
next:
  text: 'Static assets'
  link: 'guide/static-module-assets.md'
prev:
  text: 'Front end helper methods'
  link: 'guide/front-end-helpers.md'
---
# Nested module folders

When projects have dozens of modules, the `modules/` folder can begin to appear cluttered. It can be difficult to locate a particular module in such a long list. Similarly, since every module must at least be activated in `app.js`, that file can begin to feel cluttered as well. In this situation, developers often wish for a way to group their modules into subdirectories, as well as a way to break up `app.js` into multiple files for readability. Apostrophe offers the `nestedModuleSubdirs` option as a solution to both problems.

When the top-level `nestedModuleSubdirs` option is set to `true`, Apostrophe will:

* Recognize modules when nested in subdirectories within `modules/`. This reduces clutter in the `modules/` folder.
* Load any `modules.js` files discovered in parent directories within `modules/`, and merge them with the `modules` section of `app.js`. This reduces clutter in `app.js`.

We can set the `nestedModuleSubdirs` option to `true` in `app.js`, like this:

<AposCodeBlock>

```javascript
require('apostrophe')({
  shortName: 'my-project',
  nestedModuleSubdirs: true
  // etc., you may have additional options here as always
  modules: {
    // You can still enable all modules here, or move some or all to modules.js
    // files in subdirectories, as seen below
  }
});
```
  <template v-slot:caption>
    app.js
  </template>
</AposCodeBlock>

Now you can nest modules in subdirectories, like the example `modules/products` folder explored below. Start with a `modules.js` file in the parent `modules/products` folder. Here you can activate all of the modules that relate to products, making `app.js` shorter:

<AposCodeBlock>

```javascript
module.exports = {
  // This code merges with the `modules` section of `app.js`
  'product': {},
  'product-page': {},
  'product-widget': {}
};
```
  <template v-slot:caption>
    modules/products/modules.js
  </template>
</AposCodeBlock>

::: info
You do not have to use `modules.js` files if you don't want to. You can still activate your modules in `app.js` if you prefer. It usually makes sense to reduce clutter in both places: the `modules/` folder and `app.js`. But, it's up to you. This feature is entirely for your convenience.
:::

Now we'll implement those modules in their own sub-subdirectories:

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Products'
  }
};
```
  <template v-slot:caption>
    modules/products/product/index.js
  </template>
</AposCodeBlock>

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    label: 'Products Page'
  }
};
```
  <template v-slot:caption>
    modules/products/product-page/index.js
  </template>
</AposCodeBlock>

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Products'
  },
  fields: {
    add: {
      _products: {
        label: 'Products',
        type: 'relationship',
        withType: 'product'
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/products/product-widget/index.js
  </template>
</AposCodeBlock>

The resulting directory tree looks like this:

```
/app.js
/modules
/modules/products
/modules/products/module.js (activates the three modules below)
/modules/products/product (index.js for the product piece type lives here)
/modules/products/product-page-type (index.js, views/show.html, etc.)
/modules/products/product-widget (index.js, views/widget.html, etc.)
```

::: warning
It is important to understand that **the names of the subdirectories do not matter.** The The subdirectories are purely there for your convenience in organizing your code and they are **not part of the name of the modules within them.** The names of the actual
module folders within them must still match the full name of each module.
:::

By following through with this approach you can make `app.js` much shorter and better organize your project's files for easier maintenance.
