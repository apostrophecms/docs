# Module properties

Module configuration objects may use the following configuration properties.

## Configuration settings

| Setting name | Value type | [Cascades](#cascading-settings) | Description | Module types |
| ------- | ------- | ------- | ------- | :-----: |
| [`extend`](#extend) | String | No | Identify the base class module | All |
| [`improve`](#improve) | String | No | Identify a module to enhance | All |
| [`options`](#options) | Object | No | Configure module options | All |
| [`instantiate`](#instantiate) | Boolean | No | Prevent a module from being fully instantiated | All |
| [`fields`](#fields) | Object | Yes | Configure doc type fields | Doc, Widget |
| [`filters`](#filters) | Object | Yes | Configure piece type filters | Piece |
| [`columns`](#columns) | Object | Yes | Configure piece type manager columns | Piece |

### `extend`

Identify a module to use as a base class for your custom module. "Extending" a module this way makes all of the functionality and configuration of the base class available in the new module, other than its `name` property.

The most common base class modules include:

- `@apostrophecms/piece-type` to add a new piece type
- `@apostrophecms/page-type` to add a page type
- `@apostrophecms/piece-page-type` to add an index page and show pages for a piece type
- `@apostrophecms/widget-type` to add a widget type

If this property is not set, the module will implicitly extend the base module, `@apostrophecms/module`.

```javascript
// modules/custom-piece/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  // ...
}
```

You can use any existing module as a base class, whether a core module or one built for your project. To do so, make sure the extending module is instantiated _after_ its base class in `app.js`.

In this example, a "Landing page" module uses a "Default page" as its base class.

```javascript
// app.js
require('apostrophe')({
  modules: {
    'default-page': {},
    'landing-page': {}
  }
});
```

```javascript
// modules/landing-page/index.js
modules.export = {
  extend: 'default-page'
};
```

### `improve`

Similarly to `extend`, `improve` is used to name another existing module. Instead of _inheriting_ the existing module's code and configuration in a new module, using `improve` _enhances_ the existing module's code and configuration.

**This is only valid in modules that are installed into an Apostrophe app**, either on their own or as a part of a bundle, and not in those that are built into the app directly. It is most often used to add functionality to core Apostrophe modules.
<!-- TODO: link to a definition of a bundle when available. -->

::: note
Within an application, you can alter installed or core module behavior by adding an `index.js` file for it in the `module` directory as if it is a new module. Installed modules cannot share their name with an existing module, so they `improve` those existing modules instead.
:::

 You might include this in a stand-alone module that adds functionality to the `@apostrophecms/image` core module:

```javascript
// index.js
modules.export = {
  improve: '@apostrophecms/image'
  // Additional functionality ...
};
```

You should not use both `improve` and `extend` in a single module. If "improving" an existing module, that existing module has already taken care of the "extending."


### `options`

An object used to add additional, often optional, settings to a module. There are many options available depending on the module type. See the [module configuration options page](/reference/module-options.md) for more information.

### `instantiate`

Set to `false` to prevent the module from being fully instantiated in the application. The primary purpose of this option is to create a base class module that others will [extend](#extend) but that will not be used directly.

### `fields`

[Doc type](/reference/glossary.md#doc) modules have some fields configured by default, such as the `title` and `slug` fields. The `fields` setting is used for additional field management.

The `fields` object is configured with subsections: `add`, `remove`, and `group`.

#### `add`

An object of fields to add to the schema. See the [field type reference](/reference/field-types/README.md) for more on field type configuration.

```javascript
// modules/article/index.js
modules.export = {
  fields: {
    add: {
      subtitle: {
        label: 'Subtitle',
        type: 'string'
      }
    }
  }
};
```

#### `remove`

An array of field names from the base class module to remove. Some default fields cannot be removed since they required by core functionality (e.g., `title`, `slug`, `trash`, `visibility`).

```javascript
// modules/spotlight-article/index.js
modules.export = {
  extend: 'article',
  fields: {
    remove: [ 'subtitle' ]
  }
};
```

#### `group`

An object of field groups. Groupings are used by the editing interface. Note that `group` _does not apply to widget modules_.

Groups are added as an object with their name as the object key and the following properties:
- `label`: The visible label (a string) for the group
- `fields`: An array of field names to include in the group

The `@apostrophecms/doc-type` module arranges the default fields in two groups: `basics` and `utility`. You can override these groups, but those default fields will become ungrouped unless you arrange them again. Any fields not added to a group will be placed in an "Ungrouped" section in the editing interface.

```javascript
// modules/article/index.js
modules.export = {
  fields: {
    add: {
      // ...
    },
    group: {
      meta: { // 👈 The group's identifying name is the object key.
        label: 'Article metadata',
        fields: [
          'subtitle',
          'author',
          '_category'
        ]
      }
    }
  }
};
```

### `filters`

In piece type modules, the `filters` setting configures the pieces manager interface by adding and removing filtering fields (to view only certain pieces). `trash` and `visibility` filters are included by default.

The `filters` object is configured with subsections: `add` and `remove`. Filters must correspond to an existing fields name or custom [query builder](#queries-self) on the piece type.

#### `add`

An object of filters to add to the piece type. Each filter is an object with its own configuration. If the filter choices are not configured directly, Apostrophe will find and set valid options automatically.

Filter properties include:

| Property | Description |
| ------- | ------- |
| `label` | Recommended, but not required, to customize the human-readable label. |
| `inputType` | Set the an input field type for the filter. Options include `radio`, `checkbox`, or `select`. Defaults to `select`. |
| `choices` | Manually set an array of choices. Choices require `label` and `value` properties. |
| `def` | The default value for the manager filter. |

```javascript
// modules/article/index.js
modules.export = {
  filters: {
    add: {
      _category: { // 👈 Referencing a relationship field named `_category`
        label: 'Article category'
      },
      featured: { // 👈 Referencing a boolean field name `featured`
        labeled: 'Featured',
        inputType: 'checkbox',
        def: true,
        choices: [
          { value: true, label: 'Show featured' },
          { value: false, label: 'Hide featured' }
        ]
      }
    }
  }
};
```

#### `remove`

An array of filter names from the base class module to remove.

```javascript
// modules/spotlight-article/index.js
modules.export = {
  extend: 'article',
  filters: {
    remove: [ 'featured' ]
  }
};
```

### `columns`

For piece types, the `columns` setting configures the pieces manager, adding and removing the piece data in the interface. Default columns include `title`, `updatedAt`, and `visibility`.

#### `add`

An object of columns to add to the piece type manager. Each column is an object with its own configuration. Column properties include:

| Property | Description |
| ------- | ------- |
| `label` | Recommended, but not required, to show a column header label. |
| `component` | An advanced option to use a custom Vue component for table cells in this column. See core components `AposCellBasic` (default) and `AposCellDate` for examples. |
<!-- TODO: Link to a guide on custom cell components when available. -->

```javascript
// modules/article/index.js
modules.export = {
  extend: '@apostrophecms/piece-type',
  columns: {
    // 👇 Adds a column showing when the article was published.
    add: {
      lastPublishedAt: {
        label: 'Published',
        component: 'AposCellDate'
      }
    }
  }
};
```

#### `remove`

An array of column names from the base class module to remove.

```javascript
// modules/article/index.js
modules.export = {
  extend: '@apostrophecms/piece-type',
  columns: {
    // 👇 Hides the column showing when the article was last updated.
    remove: [ 'updatedAt' ]
  }
};
```

## Initialization function

### `async init(self)`

This function runs once when the Apostrophe app first starts up. It takes the module, as `self`, as an argument. To run code on every request, or in other situations when the app is running, see the event handlers documentation.
<!-- TODO: Link to event handlers guide documentation when available. -->

While [customization functions](#customization-functions) add functionality for the module in specific ways, `init` provides a space for more open code execution. It is useful for setting properties on the module that could not be set in other sections.

```javascript
// modules/product/index.js
module.exports = {
  // ...
  options: {
    alias: 'product',
    themeColor: 'blue'
  },
  init(self) {
    // 👇 Making `self.options.themeColor` available on `apos.product.theme`.
    self.theme = self.options.themeColor;

    // 👇 Adding a data migration related to this module using a method from a
    // separate module.
    self.apos.migration.add('blurb', async () => {
      await self.apos.migration.eachDoc({
        type: 'product'
      }, async (doc) => {
        if ((doc.category) === 'old-category') {
          return self.apos.doc.db.updateOne({
            _id: doc._id
          }, {
            $set: { category: 'new-category' }
          });
        }
      });
    });
  }
};
```

## Customization functions

Customization function sections all return an object with properties that add functionality related to the module. They may add methods that can be called within the module and elsewhere, event handlers, template helpers, or other features as covered here.

Each of these function sections takes the module, as `self`, as an argument. This provides access to its methods, options, and other properties, as well as those inherited from its base class.

| Function name | Description |
| ------- | ------- |
| [`methods`](#methods-self) | Add new methods and override base class methods |
| [`extendMethods`](#extendmethods-self) | Extend the functionality of base class methods |
| [`components`](#components-self) | Configure asynchronous template components |
| [`extendComponents`](#extendcomponents-self) | Extend base class template components |
| [`helpers`](#helpers-self) | Add template helper methods |
| [`extendHelpers`](#extendhelpers-self) | Extend base class helper methods |
| [`restApiRoutes`](#restapiroutes-self) | Add custom REST API routes |
| [`extendRestApiRoutes`](#extendrestapiroutes-self) | Extend base class REST API routes |
| [`apiRoutes`](#apiRoutes-self) | REPLACE-ME |
| [`extendApiRoutes`](#extendapiroutes-self) | REPLACE-ME |
| [`renderRoutes`](#renderroutes-self) | REPLACE-ME |
| [`routes`](#routes-self) | REPLACE-ME |
| [`handlers`](#handlers-self) | REPLACE-ME |
| [`extendHandlers`](#extendhandlers-self) | REPLACE-ME |
| [`queries`](#queries-self) | REPLACE-ME |
| [`extendQueries`](#extendqueries-self) | REPLACE-ME |
| [`middleware`](#middleware-self) | REPLACE-ME |
| [`tasks`](#tasks-self) | REPLACE-ME |

### The extension pattern

Several of these sections use an extention pattern (the sections prefixed with "extend"). These sections are used to add functionality to matching features of the module's base class. Functions in `extendMethods` enhance identically named functions in the base class' `methods` section, `extendApiRoutes` enhances API routes from the base class' `apiRoutes`, and so on.

Each individual function included in the extension section takes a `_super` argument in addition to the same arguments as the original function. `_super` is the original function, which should be called within the new extension.

If a piece type included the `insert` in its `extendMethods` section to alter the piece titles, it might look like this:

```javascript
  extendMethods(self) {
    return {
      insert(_super, req, piece, options) {
        piece.title = `🆕 ${piece.title}`;

        _super(req, piece, options);
      }
    }
  }
```

::: warning
Extension functions should *always* use the `_super` argument to call the original function. If you want to *completely* overwrite the inherited function, instead add a matching function in the section without the "extend" prefix. For example, we could completely overwrite the `insert` method in our piece type by including our own `insert` function in the `methods` section.
:::

### `methods(self)`

Add methods that can be invoked on `self` or from another module on `self.apos.modules['module-name']` or the designated module alias. Returns an object of functions.

```javascript
// modules/product/index.js
module.exports = {
  // ...
  methods(self) {
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
  }
};
```

#### `extendMethods(self)`

<!-- TODO: Link to module reference section to find existing methods. -->
Add to the functionality of a method inherited from the base class. This must return an object of functions, similar to [`methods`](#methods-self).

Methods included should take a `_super` argument, followed by the normal arguments of the method being extended. If the original method took only a `req` argument, the extending method should take the arguments `_super, req`.

To maintain the same application, they should return the same type of response as the original method. If the original returned an array of docs, the extension method should return an array of docs.

```javascript
// modules/product/index.js
module.exports = {
  // ...
  extendMethods(self) {
    return {
      generate(_super, index) {
        // Using _super with the original argument to generate a sample piece.
        const piece = _super(index);
        // Adding additional functionality.
        piece.price = Math.random() * 100;
        // Returning the generated piece, exactly as the original `generate`
        // method does.
        return piece;
      }
    };
  }
};
```

### `components(self)`

This function section returns an object containing functions that power asynchronous template components. These template components allow for asynchronous data requests in normally synchronous template rendering.

Each template component function should take the arguments:

| Argument | Description |
| ------- | ------- |
| `req` | The request object from the originating template context. |
| `data` | Data passed into the component where the component is used. |

Information returned by the component function will be available in the associated component template as `data`.

See the [async component guide](/guide/async-components.md) for more usage information.


```javascript
// modules/product/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  // ...
  components(self, options) {
    return {
      // Returning the five most recently created products.
      async latest(req, data) {
        const products = await self.find(req)
          .sort({ createdAt: -1 })
          .limit(data.max || 5)
          .toArray();

        return {
          products
        };
      }
    };
  }
};

```

#### `extendComponents(self)`

Add functionality to base class async component functions. This must return an object of functions, similar to [`components`](#components-self).

Extension functions should take the following arguments:

| Argument | Description |
| ------- | ------- |
| `_super` | The original component function. See the [extension pattern](#the-extension-pattern). |
| `req` | The request object from the originating template context. |
| `data` | Data passed into the component where the component is used. |

Each should return data in the same form as the original component function.

```javascript
// modules/featured-product/index.js
module.exports = {
  extend: 'product',
  // ...
  extendComponents(self, options) {
    return {
      // Returning the five most recently created products.
      async latest(_super, req, data) {
        data.max = (data.max && data.max <= 3) ? data.max : 3;

        const result = _super(req, data);

        return {
          products: result.products
        };
      }
    };
  }
};
```

### `helpers(self)`

The `helpers` section returns an object of functions that add template utility methods. The individual helper methods may take any arguments that you plan to pass them in templates.

Helpers are called in templates from their module on the `apos` object. See the [`alias`](/reference/module-api/module-options.md#alias) option to make this less verbose.

```javascript
// modules/product/index.js
module.exports = {
  // ...
  options: {
    alias: 'product'
  },
  helpers(self) {
    return {
      formatPrice(product) {
        const price = product.price;
        return `$${floatPrice.toFixed(2)}`;
      }
    };
  }
};
```

Using in a template:

```django
{# modules/product-page/views/show.html #}
{{ apos.product.discountPrice(data.piece) }}
```

#### `extendHelpers(self)`

Add to the functionality of a template helper inherited from the base class. This must return an object of functions, similar to [`helpers`](#helpers-self).

Extended helpers should take a `_super` argument, followed by the normal arguments of the helper being extended. If the original helper took only a `price` argument, the extending function should take the arguments `_super, price`.

To maintain the same application, they should return the same type of response as the original helper. If the original returned a string, the extension should return a string.

```javascript
// modules/featured-product/index.js
module.exports = {
  extend: 'product',
  // ...
  extendHelpers(self) {
    return {
      formatPrice(_super, product) {
        const price = _super(product);
        // 👇 Adds some extra flash to the featured product prices.
        return `${price} 🤑`;
      }
    };
  }
};
```

### `restApiRoutes(self)`

Apostrophe includes a full REST API for [pieces](/reference/api/pieces.md) and [pages](/reference/api/pages.md). Those route handlers can be totally overridden by adding identically named functions to object returned by the `restApiRoutes` function. If you simply wish to add to the existing behavior of the REST API routes, see [`extendRestApiRoutes`](#extendrestapiroutes-self).

REST API functions take the route request as an argument (`req`, below);
Valid names for functions returned by `restApiRoutes` include:
- `getAll`
- `getOne`
- `post`
- `patch`
- `put`
- `delete`

```javascript
// modules/product/index.js
module.exports = {
  // ...
  restApiRoutes(self) {
    return {
      // GET /api/v1/product
      async getAll(req) {
        const results = [];
        // ... populate `results` with product data.

        return {
          results
        };
      }
    };
  }
};
```

#### `extendRestApiRoutes(self)`

Extend the behavior of existing REST API routes in the `extendRestApiRoutes` section. This function must return an object of functions. See [`restApiRoutes`](#restapiroutes-self) for the valid function names.

Each extended REST API route function should accept the original function as `_super` and the `req` request object. They should return data in a similar format to the existing [piece](/reference/api/pieces.md) and [page](/reference/api/pages.md) REST API (e.g., single doc `GET` requests should return a single document object and general `GET` requests should return an object including a `result` array of document objects).

```javascript
// modules/product/index.js
module.exports = {
  // ...
  extendRestApiRoutes(self) {
    return {
      // GET /api/v1/product
      async getAll(_super, req) {
        // Get the original function's response (making sure to `await`).
        const response = await _super(req);

        if (Array.isArray(response.results)) {
          // Adds a `resultLength` property on the response object.
          response.resultLength = response.results.length;
        }

        return response;
      }
    };
  }
};
```

### `apiRoutes(self)`
#### `extendApiRoutes(self)`

### `renderRoutes(self)`
### `routes(self)`
### `handlers(self)`
#### `extendHandlers(self)`
### `queries(self)`
#### `extendQueries(self)`
### `middleware(self)`
### `tasks(self)`

## Core properties, not documented
- cascades
- batchOperations
- beforeSuperClass
- afterAllSections

## "Cascading" settings

What does cascading mean?