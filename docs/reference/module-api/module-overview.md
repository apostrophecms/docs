# Module configuration

Module configuration objects may use the following configuration properties. The overall categories are broadly defined:
- [Configuration settings](#configuration-settings): Static module settings. Once the module is initialized these settings are fixed and can't access the module itself or any other module's settings.
- [Configuration cascades](#configuration-cascades): Settings that merge as a module initializes, first adding properties from parent classes like piece-type and then properties from subclasses like your project-level content type.
- [Initialization function](#initialization-function): A function that runs once during application startup.
- [Customization functions](#customization-functions): Settings via functions that have access to the module itself as an argument and can access other settings.

## Configuration settings

|Setting name | Value type | Description | Module types |
|-------|-------|-------|-------|
| [`extend`](#extend) | String | Identify the base class module | All |
| [`improve`](#improve) | String | Identify a module to enhance | All |
| [`options`](#options) | Object | Configure module options | All |
| [`instantiate`](#instantiate) | Boolean | Prevent a module from being fully instantiated | All |
| [`bundle`](#bundle) | Object | Identify multiple modules to load | All |
| [`icons`](#icons) | Object | Register a Material Design icon for the UI | All |

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
module.exports = {
  extend: 'default-page'
};
```

### `improve`

Similarly to `extend`, `improve` is used to name another existing module. Instead of _inheriting_ the existing module's code and configuration in a new module, using `improve` _enhances_ the existing module's code and configuration.

**This is only valid in modules that are installed into an Apostrophe app**, either on their own or as a part of a bundle, and not in those that are built into the app directly. It is most often used to add functionality to core Apostrophe modules.
<!-- TODO: link to a definition of a bundle when available. -->

::: info
Within an application, you can alter installed or core module behavior by adding an `index.js` file for it in the `module` directory as if it is a new module. Installed modules cannot share their name with an existing module, so they `improve` those existing modules instead.
:::

 You might include this in a stand-alone module that adds functionality to the `@apostrophecms/image` core module:

```javascript
// index.js
module.exports = {
  improve: '@apostrophecms/image'
  // Additional functionality ...
};
```

You should not use both `improve` and `extend` in a single module. If "improving" an existing module, that existing module has already taken care of the "extending."

### `options`

An object used to add additional, often optional, settings to a module. There are many options available depending on the module type. See the [module configuration options page](/reference/module-api/module-options.md) for more information.

### `instantiate`

Set to `false` to prevent the module from being fully instantiated in the application. The primary purpose of this option is to create a base class module that others will [extend](#extend) but that will not be used directly.

### `bundle`

Used to add multiple modules from a single npm module. Takes an object with two properties. The `directory` property takes a relative path to the directory of the modules to be loaded. The `modules` property takes an array of module names. THe original module and bundled modules loaded in this way still need to be added to the `app.js` file, unless they use [`improve`](#improve). Any modules that are to be used only as a base class for other modules should be added to `app.js`, but have their [`instantiate`](#instantiate) property set to `false`.

### `icons`

The icons in Apostrophe come from the `vue-material-design-icons` npm package, version 4.12.1. We have pinned to this version because the names of Material Design icons are not always consistent from version to version. A number of these icons are registered by the [`@apostrophecms/asset/lib/globalicons.js` file](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/asset/lib/globalIcons.js) and can be used directly in your project, for example in the `icon` option of your [widget module](https://docs.apostrophecms.org/reference/module-api/module-options.html#options-for-widget-modules) or as a `previewIcon` in your [widget preview](https://docs.apostrophecms.org/guide/areas-and-widgets.html#widget-preview-options).

Any of the additional almost 6,000 icons from this package can easily be registered for use through the `icons` setting object. While we have a [list](https://gist.github.com/BoDonkey/a28419ed8954b57931f80061e5e6a3dd) of the currently available icons, this list may grow in the future,  but it won't shrink and no names will change, absent force majeure. To easily confirm that the desired icon is on the list:

``` bash
// in your project, already npm installed

cd node_modules/vue-material-design-icons
ls *.vue
```
Each property key in the `icons` setting object will be the name used to reference the icon in an Apostrophe project. The value will be the Material Design name for the icon, written in PascalCase without the `.vue` ending. The Apostrophe reference name for the icon *does not need to match* the Material Design name.

```javascript
// index.js
module.exports = {
  // ...
  icons: {
    airhorn: 'AirHorn',
    expander: 'ArrowUpDownBoldOutline'
  }
};
```

To use an icon that is not included in the `vue-material-design-icons` list, add your icon Vue file to either a relative path in the project or via an `npm` package. Then register the icon with a property name that will be used to reference the icon in the project, and a value that points to the file.

```javascript
icons: {
  // For an icon at ./icons in your project
  'my-icon': '~./icons/MyIconName.vue',
  // For an icon in the their-icon-bundle-package npm module
  'their-icon': '~their-icon-bundle-package/TheirIconName.vue'
}
```
Everything following the `~` becomes part of an `import` statement during the build process.

If you need to convert your icon(s) to Vue components, you can use any of the icons in the `vue-material-design-icons` as a template for constructing a simple wrapper.

At the present time, the same icon cannot be registered under two names (that is, it can't be registered as `my-icon` and as `core-icon` if they both refer to the same icon). Since this can be inconvenient and requires checking the `globalicons.js` file to make sure you are not registering a duplicate, we plan to correct it in an upcoming release.

## Configuration cascades

| Setting name | Value type | Description | Module types |
| ------- | ------- | ------- | ------- |
| [`fields`](#fields) | Object/Function | Configure doc type fields | Doc, Widget |
| [`filters`](#filters) | Object/Function | Configure piece type filters | Piece |
| [`columns`](#columns) | Object/Function | Configure piece type manager columns | Piece |
| [`batchOperations`](#batchoperations) | Object/Function | Configure manager batch operations | Piece |

### "Cascading" settings
These settings can either be configured as a static object or through a function that takes `self` and `options` and returns a configuration object.

As detailed for each setting, the configuration objects have `add`, `remove`, `group`, and `order` properties. This pattern allows these settings to "cascade" from the base classes to project-level classes without requiring those settings be declared again.

Use `add` to add additional settings and `remove` to remove existing base class settings. Use `group` to organize user-facing settings in the editing interface. The `order` option allows for the arrangement of added fields in a particular order for `filters`, `columns`, and `batchOperations`.

### `fields`

[Doc type](/reference/glossary.md#doc) modules have some fields configured by default, such as the `title` and `slug` fields. The `fields` setting is used for additional field management.

 The `fields` setting object contains properties of `add`, `remove`, and `group`, which is either provided directly, or via a function that takes `self` and `options` and returns the object.

#### `add`

An object of fields to add to the schema. See the [field type reference](/reference/field-types/index.md) for more on field type configuration.

Adding a field using an object:

```javascript
// modules/article/index.js
module.exports = {
  fields: {
    add: {
      title: {
        label: 'Title',
        type: 'string'
      },
      subtitle: {
        label: 'Subtitle',
        type: 'string'
      }
    }
  }
};
```

Adding a field using a function:

```javascript
// modules/article/index.js
module.exports = {
  fields(self, options) {
    let fields = {
      add: {
        title: {
          label: 'Title',
          type: 'string'
        }
      }
    };

    if (options.subtitle) {
      fields.add.subtitle = {
        label: 'Subtitle',
        type: 'string'
      };
    }

    return fields;
  }
}
```


#### `remove`

An array of field names from the base class module to remove. Some default fields cannot be removed since they are required by core functionality (e.g., `title`, `slug`, `visibility`).

Removing a field using an object:

```javascript
// modules/spotlight-article/index.js
module.exports = {
  extend: 'article',
  fields: {
    remove: [ 'subtitle' ]
  }
};
```
Removing a field using a function:

```javascript
// modules/spoghtlight-article/index.js
module.exports = {
  extend: 'article',
  fields(self, options) {
    return {
      remove: !self.options.subtitle ? [ 'subtitle' ] : []
    }
  }
}
```

#### `group`

An object of field groups. Groupings are used by the editing interface. Note that `group` _does not apply to widget modules_.

`groups` accepts an object composed of named sub-objects. Each sub-object corresponds to a tab in the editing modal, displaying the fields specified within that sub-object. Every sub-object has the following properties:
- `label`: A string used to label the tab for the group.
- `fields`: An array of field names to be included in the group.

The `@apostrophecms/doc-type` module arranges the default fields in two groups: `basics` and `utility`. You can override these groups, but those default fields will become ungrouped unless you arrange them again. Any fields not added to a group will be placed in an "Ungrouped" section in the editing interface.

Grouping fields using an object:

```javascript
// modules/article/index.js
module.exports = {
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
Grouping fields using a function:

```javascript
// modules/article/index.js
module.exports = {
  fields(self, options) {
    let groupFields = [ 'author', '_category' ];
    if (options.subtitle) {
      groupFields.push('subtitle');
    }
    return {
      add: {
        // ... 
      },
      group: {
        meta: { // 👈 The group's identifying name is the object key.
          label: 'Article metadata',
          fields: groupFields
        }
      }
    }
  }
}
```

### `filters`

In piece-type modules, the `filters` setting configures the pieces manager interface by adding and removing filtering fields (to view only certain pieces). `archived` and `visibility` filters are included by default. These settings "cascade" from the base classes to project-level classes without requiring those settings be declared again.

The `filters` object is configured with subsections: `add` and `remove` and can either be added as a static object or a function that takes `self` and `options` and returns an object. Filters must correspond to an existing fields name or custom [query builder](#queries-self-query) on the piece type.

#### `add`

An object of filters or a function that returns an object of filters to add to the piece type. Each filter is an object with its own configuration. If the filter choices are not configured directly, Apostrophe will find and set valid options automatically.

Filter properties include:

| Property | Description |
| ------- | ------- |
| `label` | Recommended, but not required, to customize the human-readable label. |
| `inputType` | Set the an input field type for the filter. Options include `radio`, `checkbox`, or `select`. Defaults to `select`. |
| `choices` | Manually set an array of choices. Choices require `label` and `value` properties. |
| `def` | The default value for the manager filter. |

Add `filters` with object:
```javascript
// modules/article/index.js
module.exports = {
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
Add `filters` with function:
```javascript
// modules/article/index.js
module.exports = {
  filters(self, options) {
    // Check self or options to dynamically add schema fields
    return {
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
  }
};
```

#### `remove`

An array of filter names from the base class module to remove.

```javascript
// modules/spotlight-article/index.js
module.exports = {
  extend: 'article',
  filters: {
    remove: [ 'featured' ]
  }
};
```

#### `order`

An array of field names to sort them in a particular order.

```javascript
// modules/article/index.js
module.exports = {
  filters(self, options) {
    // Check self or options to dynamically add schema fields
    return {
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
      },
      order: [ 'featured', '_category' ]
    }
  }
};
```


### `columns`

For piece types, the `columns` setting configures the pieces manager, adding and removing the piece data in the interface. Default columns include `title`, `updatedAt`, and `visibility`. Like the `fields` and `filters` settings, the `add`, `remove`, and `order` properties "cascade" from the base class.

#### `add`

An object of columns or a function that returns an object of columns to add to the piece type manager. Each column is an object with its own configuration. Column properties include:

| Property | Description |
| ------- | ------- |
| `label` | Recommended, but not required, to show a column header label. |
| `component` | An advanced option to use a custom Vue component for table cells in this column. See core components `AposCellBasic` (default) and `AposCellDate` for examples. |
<!-- TODO: Link to a guide on custom cell components when available. -->

```javascript
// modules/article/index.js
module.exports = {
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
module.exports = {
  extend: '@apostrophecms/piece-type',
  columns: {
    // 👇 Hides the column showing when the article was last updated.
    remove: [ 'updatedAt' ]
  }
};
```

#### `order`

An array of column names to sort the columns in a particular order. This will often include default columns.

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  columns: {
    add: {
      _topic: {
        label: 'Topic',
        component: 'MyCustomRelationshipCell' // (See components info below)
      }
    }
    // 👇 Orders the new `_topic` column among default piece columns.
    order: [ 'title', 'labels', '_topic', 'updatedAt' ]
  }
};
```

### `batchOperations`

Piece types can offer batch operations (actions editors can take on many selected pieces at once) via the `batchOperations` cascade object property. Apostrophe has `archive` and `restore` (from the archive) batch operations by default, for example. New batch operations are added to a series of buttons in the piece type manager modal.

#### `add`

The `add` property is an object or function returning an object containing batch operation configurations. Each operation is a configuration object. **The operation's key must match an API route defined in `apiRoutes`.** For example, the core `archive` batch operation uses the piece type module's `archive` API route.

Each batch operation configuration should include the following properties:

| Property | Description |
| ------- | ------- |
| `label` | A text label used for the batch operation button's readable label. |
| `messages` | An object of notification message strings on `progress` and `completed` sub-properties. These may include `type` and `count` interpolation tags to be replaced by the piece type label and number of affected pieces, respectively. See example below. |
| `icon` | The [name of an icon](#icons) to use for the operation button. |
| `if` | Optionally include a conditional object, similar to [conditional fields](/guide/conditional-fields.md), to hide the operation button based on active [filter values](#filters). |
| `modalOptions` | Options for the confirmation modal. [See below.](#modal-options)  |

The following example uses a hypothetical batch operation that might reset piece fields to default values.

```javascript
// modules/article/index.js
module.exports = {
  batchOperations: {
    add: {
      // This uses a hypothetical `reset` route added in `apiRoutes`
      reset: {
        label: 'Reset',
        messages: {
          progress: 'Resetting {{ type }}...',
          completed: 'Reset {{ count }} {{ type }}.'
        },
        // This assumes that the module added this in the `icons` configuration.
        icon: 'recycle-icon',
        // Only display this for non-archived pieces.
        if: {
          archived: false
        },
        modalOptions: {
          title: 'Reset {{ type }}',
          description: 'Are you sure you want to reset {{ count }} {{ type }}?',
          confirmationButton: 'Yes, reset the selected content'
        }
      },
    }
  }
};
```

##### Modal options

Batch operation modal options include:

| Option | Description |
| ------- | ------- |
| `title` | The modal heading. |
| `description` | Descriptive text for the confirmation modal. |
| `confirmationButton` | The affirmative confirmation button label (to continue the operation). |

#### `order`

An array of batch operation names to sort them in a particular order within the menu.

```javascript
// modules/article/index.js
module.exports = {
  batchOperations: {
    add: {
      // This uses a hypothetical `reset` route added in `apiRoutes`
      reset: {
        // ... reset operation configuration object
      },
      rollback: {
        // ...rollback operation configuration object
      },
      update: {
        // ... update operation configuration object
      }
    },
    order: [ 'update', 'reset', 'rollback' ]
  }
};
```

## Initialization function

### `async init(self)`

This function runs once when the Apostrophe app first starts up. It takes the module, as `self`, as an argument. To run code on every request, or in other situations when the app is running, see the [event handlers documentation](/guide/server-events.md).

While [customization functions](#customization-functions) add functionality for the module in specific ways, `init` provides a space for more open code execution. It is useful for setting properties on the module that could not be set in other sections.

<AposCodeBlock>

```javascript
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

  <template v-slot:caption>
    modules/product/index.js
  </template>

</AposCodeBlock>

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
| [`restApiRoutes`](#restapiroutes-self) | Add custom REST API routes or completely override base class REST API routes |
| [`extendRestApiRoutes`](#extendrestapiroutes-self) | Extend base class REST API routes |
| [`apiRoutes`](#apiroutes-self) | Add custom API routes or completely override base class API routes |
| [`extendApiRoutes`](#extendapiroutes-self) | Extend base class API routes |
| [`renderRoutes`](#renderroutes-self) | Add API routes to return a rendered template |
| [`routes`](#routes-self) | Add standard Express routes |
| [`handlers`](#handlers-self) | Add server-side event handlers |
| [`extendHandlers`](#extendhandlers-self) | Extend base class server-side event handlers |
| [`queries`](#queries-self-query) | Add database query methods |
| [`extendQueries`](#extendqueries-self) | Extend base class database query methods |
| [`middleware`](#middleware-self) | Add standard Express middleware to be called on *every* request. |
| [`tasks`](#tasks-self) | Add task functions that can be run from the CLI. |

### The extension pattern

Several of these sections use an extension pattern. The sections prefixed with `extend` add functionality to base class sections without the prefix. For example:

- functions in `extendMethods` enhance identically named functions in the base class' `methods` section, and
- `extendApiRoutes` enhances API routes from the base class' `apiRoutes`

Each function included in an extension section takes the function it is extending as the first argument (`_super`, below) in addition to the original arguments.

The following example updates the `generate` method in the `extendMethods` section to add a placeholder `price` upon creation.

```javascript
// modules/product/index.js
module.exports = {
  // ...
  extendMethods(self) {
    return {
      // The original `generate` function only takes `index` as an argument.
      generate(_super, index) {
        // Using _super with the original argument to generate a sample piece.
        const product = _super(index);
        // Adding additional functionality.
        product.price = Math.random() * 100;
        // Returning the generated product piece, exactly as the original
        // `generate` method does.
        return product;
      }
    };
  }
};
```

This example shows another example, extending a [REST API function](#restapiroutes-self):

```javascript
// modules/product/index.js
module.exports = {
  // ...
  extendRestApiRoutes(self) {
    return {
      // The original function only takes a `req` argument.
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

::: warning
Extension functions should *always* use the `_super` argument to call the original function. If you want to *completely* overwrite the inherited function, add a matching function in the section without the "extend" prefix instead. For example, we could completely overwrite the `insert` method in our piece type by including our own `insert` function in the `methods` section.
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

### `components(self)`

`components` returns an object containing functions that power asynchronous template components. Asynchronous template components allow for async data requests in normally synchronous template rendering.

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
  components(self) {
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

### `helpers(self)`

`helpers` takes the module as an argument and returns an object of functions that add template utility methods. The individual helper methods may take any arguments that you plan to pass them in templates. Helper functions must run synchronously.

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

```nunjucks
{# modules/product-page/views/show.html #}
{{ apos.product.formatPrice(data.piece) }}
```

#### `extendHelpers(self)`

Add to the functionality of a template helper inherited from the base class. This must return an object of functions, similar to [`helpers`](#helpers-self).

Extended helpers should take a `_super` argument, followed by the normal arguments of the helper being extended. If the original helper took only a `price` argument, the extending function should take the arguments `_super, price`.

To maintain the same application, they should return the same type of response as the original helper. If the original returned a string, the extension should return a string.

### `restApiRoutes(self)`

Add a custom REST API for a module. The `restApiRoutes` function takes the module as an argument and returns an object of properties that map to the standard REST API request types.

Each route can be defined as a function or an object. If not using any route options, use a function that accepts a request as its argument. The function should return some value (usually a data object). You should not use Express response methods here.

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

REST API routes that affect a single, existing document also take the document `_id` property as an argument. These include `getOne`, `patch`, `put`, and `delete`.
```javascript
async getOne(req, _id) {
  // ...
}
```

If specifying any extra options for your route, set the route name to an object. See the [route options](#route-options) section for more.

If you simply wish to add to the existing behavior of the REST API routes, see [`extendRestApiRoutes`](#extendrestapiroutes-self).

::: warning
Apostrophe includes a full REST API for [pieces](/reference/api/pieces.md) and [pages](/reference/api/pages.md). These routes are used by the Apostrophe user interface, so **any change in REST API route handlers for piece types or the `@apostrophecms/page` module could break the UI**. `restApiRoutes` should more likely be used in a project to provide a custom REST API to a database or service not already built into Apostrophe.

`restApiRoutes` is also not for custom route URLs that don't map to one of the standard REST URLs. If you need to add a custom route in addition to the standard REST API for pieces or pages, [you should do that with `apiRoutes`](#apiroutes-self).
:::

Valid names for functions returned by `restApiRoutes` include:
- `getAll`
- `getOne`
- `post`
- `patch`
- `put`
- `delete`

#### `extendRestApiRoutes(self)`

Extend the behavior of existing REST API routes in `extendRestApiRoutes`. This function must return an object of functions. See [`restApiRoutes`](#restapiroutes-self) for the valid function names.

Each extended REST API route function should accept the original function as `_super` and the `req` request object. They should return data in a similar format to the existing [piece](/reference/api/pieces.md) and [page](/reference/api/pages.md) REST API (e.g., single doc `GET` requests should return a single document object and general `GET` requests should return an object including a `result` array of document objects).

### `apiRoutes(self)`

Add custom API routes. The `apiRoutes` function takes takes the module as an argument and must return an object with properties for the relevant [HTTP request method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods), including `get`, `post`, `patch`, and `delete`. Each of those HTTP verb properties should be set to an object of routes.

Each route can be defined as a function or an object. If not using any route options, use a function that accepts a request as its argument. The function should return some value (usually a data object). You should not use Express response methods here.

```javascript
// modules/product/index.js
module.exports = {
  // ...
  apiRoutes(self) {
    return {
      get: {
        // GET /api/v1/product/newest
        async newest(req) {
          const product = await self.find(req).sort({
            createdAt: -1
          }).toObject();
          if (!product) {
            // Browser receives a 404 error
            throw self.apos.error('notfound', 'No products were found.');
          }
          // Response is a JSON object with a `product` property
          return {
            product
          };
        }
      }
    };
  }
};
```

If specifying any extra options for your route, use an object. See the [route options](#route-options) section for more.

#### Naming routes

If route properties do *not* begin with a forward slash, they can be reached via the pattern: `/api/v1/` followed by the module name, a forward slash, and the API route handler's property name, e.g., `/api/v1/product/newest` for the `newest` route on the `product` module.

Camel-case names will be converted to kebab case names for the URL: `newestThing` becomes `newest-thing` in the route URL.

Beginning the name of a route with a forward slash (`/`) will allow you to create a completely custom URL path. Custom URL paths will not be prefixed or converted to kebab case.

```javascript
// modules/product/index.js
module.exports = {
  // ...
  apiRoutes(self) {
    return {
      get: {
        // GET /api/v1/product/newest-thing
        async newestThing(req) {
          // ...
        },
        // GET /my-api/newest
        '/my-api/newest': async function (req) {
          // ...
        }
      }
    };
  }
};
```

#### Returning error codes

You can `throw` the `self.apos.error()` method in any route function to return specific error codes and log additional information for developers. Pass in one of several strings to set a specific error response code:

| Error name | HTTP response code |
| ---- | ---- |
| `'invalid'` | 400 |
| `'forbidden'` | 403 |
| `'notfound'` | 404 |
| `'required'` | 422 |
| `'conflict'` | 409 |
| `'locked'` | 409 |
| `'unprocessable'` | 422 |
| `'unimplemented'` | 501 |

Passing a different value as the first argument in `self.apos.error()` will set the response code to 500.
<!-- TODO: Link to the method's own documentation page when available for more. -->

#### `extendApiRoutes(self)`

Extend the behavior of existing API routes (set in `apiRoutes`) in `extendApiRoutes`. This function must return an object as described in [`apiRoutes`](#apiroutes-self).

Each extended API route function should accept the original function as `_super` and the `req` request object. Your extended API route function should return data in a similar format to the existing API route.

### `renderRoutes(self)`

Add custom API routes to return rendered templates. The `renderRoutes` function takes takes the module as an argument and must return an object with properties for the relevant [HTTP request method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods), including `get`, `post`, `patch`, and `delete`. Each of those HTTP verb properties should be set to an object of routes.

The name of the route dictates the template file that will be rendered. For example the `latest` route in the `product` module's `renderRoutes` section will return the template at `/modules/product/views/latest.html`.

**Information returned by the route function will be used in the associated template as `data`.** Each route can be defined as a function or an object. If not using any route options, use a function that accepts a request as its argument. The function should return a data object. You should not use Express response methods here.

```javascript
// modules/product/index.js
module.exports = {
  // ...
  renderRoutes(self) {
    return {
      get: {
        // GET /api/v1/product/latest
        // The route rendered HTML for /modules/product/views/latest.html
        async latest(req) {
          const products = await self.find(req)
            .sort({ createdAt: -1 })
            .limit(req.query.max || 5)
            .toArray();

          return {
            products
          };
        }
      }
    };
  }
};
```

If specifying any extra options for your route, use an object. See the [route options](#route-options) section for more.

### `routes(self)`

Add standard Express routes. The `routes` function takes takes the module as an argument and must return an object with properties for the relevant [HTTP request method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods), including `get`, `post`, `patch`, and `delete`. Each of those HTTP verb properties should be set to an object of routes.

Each route can be defined as a function or an object. If not using any route options, use a function that accepts a request as its argument:

```javascript
// modules/product/index.js
module.exports = {
  // ...
  routes(self) {
    return {
      get: {
        // GET /api/v1/product/redirect
        async redirect(req, res) {
          const product = await self.find(req).toObject();

          return res.redirect(product._url);
        }
      }
    };
  }
};
```

If specifying any extra options for your route, use an object. See the [route options](#route-options) section for more.

Each route function takes the Express arguments `req` (the [request object](https://expressjs.com/en/api.html#req)) and `res` (the [response object](https://expressjs.com/en/api.html#res)). The functions must generate a response via `res` to avoid leaking resources, typically using the `res.redirect` or `res.send` methods.

See [Naming routes](#naming-routes) for more on function names and their route URLs.

::: tip
We recommend using `apiRoutes` or `restApiRoutes` whenever possible before using `routes` as they handle the potential pitfalls of Express routes. There are situations where writing Express routes may be necessary, such as when you need to use `res.redirect` or pipe a stream.
:::

### Route options

A route in the `apiRoutes`, `restApiRoutes`, `renderRoutes`, and `routes` sections (as well as their `extend` variations) may include options to govern particular behavior. If so, it should be configured as an object rather than a function. That object should include a `route` property in addition to the options:

| Property | What is it? |
| -------- | ----------- |
| `route` | A route function that accepts a request as its argument |
| `before` | Identify another module's middleware or routes. Used if the route function should be registered before a particular module's middleware or routes. Format as `middleware:nameOfModule` for middleware or `nameOfModule` for routes. |

### `handlers(self)`

The `handlers` function takes the module as an argument and must return an object. The object keys should be names of existing [server-side events](/reference/server-events.md). The value of those event keys should be an object of functions to execute when those events fire. Event handlers may be asynchronous (async) functions.

Events belonging to the same module where the handlers are defined, or from its base class, can be referenced by name, e.g., `beforeInsert` for any piece type. You may also add handlers in one module that respond to events in other modules. Those event names should be prefixed with the name of the module that emits the event followed by a colon, e.g., `@apostrophecms/page:beforeSend`.

Arguments passed to the event handlers will vary depending on the arguments passed when the event is emitted. See the [events reference](/reference/server-events.md) for details.

```javascript
// modules/product/index.js
module.exports = {
  // ...
  handlers(self) {
    return {
      // Responds to `beforeInsert` when emitted by the `product` module
      beforeInsert: {
        async applyTax(req, piece) {
          piece.totalPrice = piece.price * (1.0 + (piece.tax / 100));
        }
      },
      // Response to `beforeInsert` when emitted by *any* piece type
      '@apostrophecms/piece-type:beforeInsert': {
        async beforeAnyPieceIsInserted(req, piece) {
          console.log('Something is being inserted. 📬');
        }
      }
    }
  }
};
```

#### `extendHandlers(self)`

Extend the behavior of existing event handlers (set in `handlers`) in the `extendHandlers` section. This function must return an object as described in [`handlers`](#handlers-self).

Each extended event handler should accept the original function as `_super` followed by its original arguments. Extended handlers will be matched with base class handlers using the same server-side event *and* the same handler name.

### `queries(self, query)`

The `queries` function registers custom query builders and methods. It takes two arguments: the module (`self`) and the query that is being constructed (`query`). It must return an object. That object can have two properties:

| `queries` properties | Description |
| ---- | ---- |
| [`builders`](#builders) | An object of "builders," or chainable methods, that refine the query or otherwise change its behavior prior to execution. |
| [`methods`](#methods) | An object of method functions that execute some action on the query. |

#### `builders`

Query builders are defined as objects with a set of properties available to them. Builders often take an argument or use a default value. Be sure to get to know the [existing query builders](/reference/query-builders.md) before creating new ones.

| Builder properties | Description |
| ---- | ---- |
| `def` | The default value for the builder. |
| `launder` | A function used to validate values passed as arguments when `applyBuildersSafely` is called on the query. Returns `true` if valid.<br />This is required to use the builder in a REST API query string. |
| `choices` | A function returning an array of "choice" objects with `value` and `label` properties. This is returned from the `toChoices` query method if set. |
| `set` | A function called when the builder is invoked instead of the default `query.set` method. The `set` function should include running the `query.set` after other work. |
| `prefinalize` | A function to run before any builder `finalize` steps. Used to alter the query with other builders. |
| `finalize` | A function to run at the end of the query building phase, prior to being processed by the database. Used to alter the query with other builders. |
| `after` | A function run to mutate an array of queried items passed in as an argument. The `after` function should use `query.get` to confirm that the builder was used on the query. |

```javascript
// modules/product/index.js
module.exports = {
  // ...
  queries(self, query) {
    return {
      builders: {
        // This builder can be used to filter products in a query like this one:
        // await self.apos.product.find(req, {}).belowAverage(true).toArray();
        belowAverage: {
          def: false,
          async finalize() {
            // Make sure this filter was actually invoked first
            if (query.get('belowAverage')) {
              const average = await self.averagePrice(query.req);

              query.and({
                price: { $lt: average }
              });
            }
          },
          // The builder can also be invoked via the module's REST API as a
          // query string parameter, e.g. `?belowAverage=1`. Use the launder
          // utility to ensure the proper data format for the database request.
          launder(value) {
            return self.apos.launder.boolean(value);
          },
          // Always provides these two choices when requested, even if no docs
          // match either value.
          choices() {
            return [
              { value: '0', label: 'No' },
              { value: '1', label: 'Yes' }
            ];
          }
        }
      }
    };
  }
};
```

#### `methods`

An object of methods that execute queries after any builders have been applied. These functions should use existing [query methods](/guide/database-queries.md#finishing-with-query-methods) or [MongoDB cursor methods](https://docs.mongodb.com/manual/reference/method/js-cursor/) to return documents.

```javascript
// modules/product/index.js
module.exports = {
  // ...
  queries(self, query) {
    return {
      methods: {
        // Adds a query method to deliver a random doc that meets the query
        // criteria.
        async toRandomObject() {
          await query.finalize();

          const pipeline = [
            { $match: query.get('criteria') },
            { $sample: { size: 1 } }
          ];
          const result = await self.apos.doc.db.aggregate(pipeline)
            .toArray();

          return result[0];
        }
      }
    };
  }
};
```

#### `extendQueries(self)`

Extend the behavior of existing event handlers (set in `queries`) in the `extendQueries` section. This function must return an object as described in `queries`.

Each extended query builder or method should accept the original function as `_super` followed by its original arguments. Extended query builders and methods should be nested in the `builders` or `methods` object, as in [`queries`](#queries-self-query), and are matched with the base class builder or method using the same name. Methods should return data in a similar format to the existing API route.

### `middleware(self)`

Add standard Express middleware to be called on *every* request. The `middleware` function takes the module as an argument and must return an object of [middleware functions](https://expressjs.com/en/guide/using-middleware.html). This is a good place to import third-party middleware if it should be called on every request.

Note that if you are considering authoring your own middleware, it is often better to add an event handler or `await` a method in the appropriate API route instead.

```javascript
// modules/limiter/index.js
module.exports = {
  // ...
  middleware(self, options) {
    return {
      checkIp(req, res, next) {
        // Restrict access by IP address, in a crude way.
        const allowlist = [ '127.0.0.1', '::1' ];

        if (!allowlist.includes(req.connection.remoteAddress)) {
          return res.status(403).send('forbidden');
        }
        return next();
      }
    };
  }
};
```

#### Middleware options

 If including options, set the middleware name to an object with the property `middleware` set to the function. Each option will be a property on the object.

| Option | What is it? |
| -------- | ----------- |
| `before` | The name of another module if *this* middleware must run *before* the named module's middleware. |
| `url` | The URL path that should use this middleware. If none is provided, the middleware applies to all paths. This may be a string, RegEx, or array of paths. [See ExpressJS docs for examples.](https://expressjs.com/en/4x/api.html#path-examples)  |

Example using the `before` option:

```javascript
// modules/limiter/index.js
module.exports = {
  // ...
  middleware(self, options) {
    return {
      checkIp: {
        // 👇 Same as above, but with `before` and `middleware` properties.
        before: '@apostrophecms/login',
        middleware: function (req, res, next) {
          // Restrict access by IP address, in a crude way.
          const allowlist = [ '127.0.0.1', '::1' ];

          if (!allowlist.includes(req.connection.remoteAddress)) {
            return res.status(403).send('forbidden');
          }
          return next();
        }
      }
    };
  }
};
```

### `tasks(self)`

`tasks` takes the module as an argument and returns an object of command line task definitions. Task properties include:

| Property | Description |
| ------- | ------- |
| `usage` | A string describing the task and how to use it. It is printed on the command line. |
| `task` | The task function. Can be asynchronous. |
| `afterModuleInit` | Set to `true` to run the task after modules are initiated but *before* they are fully active.
| `exitAfter` | Only relevant if `afterModuleInit` is `true`. Set to `false` to *avoid* exiting the Apostrophe process on completion. Uncommon. |

Task functions takes the object `argv` as an argument, which includes the arguments passed after the task command. As documented by the [Boring](https://www.npmjs.com/package/boring) utility:

> Input:
>
> ```
> node app custom-module:run-it taskOption --foo --bar=baz --use-color=green
> ```
>
> Response:
>
> ```
> {
>   _: [ "custom-module:run-it", "taskOption"],
>   foo: true,
>   bar: "baz",
>   "use-color": "green"
> }
> ```

```javascript
// modules/product/index.js
module.exports = {
  // ...
  tasks(self, options) {
    return {
      // Since the module is named product, you can run this command line
      // task by typing: `node app product:list` in the CLI.
      list: {
        usage: 'List the titles of each product.',
        async task(argv) {
          // Get an req object with admin privileges. You can also use getAnonReq.
          const req = self.apos.task.getReq();
          const pieces = await self.find(req).toArray();

          for (const piece of pieces) {
            console.log(piece.title);
          }
        }
      }
    }
  }
};
```
