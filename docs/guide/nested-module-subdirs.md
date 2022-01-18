# Nested module folders

Apostrophe has optional support for nested subdirectories of modules, tucked
inside `modules`.

You must set the `nestedModuleSubdirs` option to `true` in `app.js`, like this:


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
// modules/products/modules.js
module.exports = {
  'product': {},
  'product-page': {},
  'product-widget': {}
};
```
  <template v-slot:caption>
    modules/products/modules.js
  </template>
</AposCodeBlock>

And then you can implement those modules in their own sub-subdirectories:

<AposCodeBlock>
```javascript
// modules/products/product/index.js
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
// modules/products/product-page/index.js
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
// modules/products/product-widget/index.js
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
/modules/products (modules.js lives here, activates three modules)
/modules/products/product (index.js for the product piece type lives here)
/modules/products/product-page-type (index.js, views/show.html, etc.)
/modules/products/product-widget (index.js, views/widget.html, etc.)
```

Just remember: **the names of the parent folders do not matter, and the names of the actual
module folders at the bottom MUST still match the name of each module.**

By following through with this approach you can make `app.js` much shorter and better organize your project.

