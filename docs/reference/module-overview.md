# Anatomy of a module

Module configuration objects may use the following configuration properties.

## Configuration settings

| Setting name | Value type | [Cascades](#cascading-settings) | Description | Module types |
| ------- | ------- | ------- | ------- | :-----: |
| [`extend`](#extend) | String | No | Name a base class module | All |
| [`improve`](#improve) | String | No | Name a module to update its functionality | All |
| [`options`](#options) | Object | No | Configure module options | All |
| [`fields`](#fields) | Object | Yes | Configure doc type fields | Doc, Widget |
| [`filters`](#filters) | Object | Yes | Configure piece type filters | Piece |
| [`columns`](#columns) | Object | Yes | Configure piece type manager columns | Piece |
| [`instantiate`](#instantiate) | Boolean | No | Prevent a module from being fully instantiated | All |

### `extend`

Name a module to use as a base class for your custom module. "Extending" a module this way makes all of the functionality and configuration of the base class available in the new module, other than its `name` property.

The most common base class modules include:

- `@apostrophecms/piece-type` to add a new custom piece type
- `@apostrophecms/page-type` to add a custom page type
- `@apostrophecms/piece-page-type` to add an index page and show pages for a piece type
- `@apostrophecms/widget-type` to add a custom widget type

```javascript
// modules/custom-piece/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  // ...
}
```

You can use any existing module as a base class for a custom module, including another custom module. To do so, make sure the extending module is instantiated _after_ its base class in `app.js`.

In this example, the "Landing page" module uses the "Default page" as its base class. Both are custom module to this hypothetical website.

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

You should not use both `improve` and `extend` in a single module.

### `improve`

Similarly to `extend`, `improve` is used to name another existing module. Instead of _adopting_ the existing module's configuration, using `improve` _changes_ the named module's configuration.

**This is only valid in modules that are built independently and then installed into Apostrophe apps**, either on their own or as a part of a bundle. It is most often used to improve core Apostrophe modules.
<!-- TODO: link to a definition of a bundle when available. -->

You might include this in a stand-alone module that adds functionality to the `@apostrophecms/image` core module:

```javascript
// index.js
modules.export = {
  improve: '@apostrophecms/image'
  // Additional functionality ...
};
```

You should not use both `improve` and `extend` in a single module.


### `options`

An object used to add additional, often optional, settings to a module. There are many options available depending on the module type. See the [module configuration options page](/reference/module-options.md) for more information.

### `fields`

[Doc type](/reference/glossary.md#doc) modules have some fields configured by default, such as the `title` and `slug` fields. The `fields` setting is used for additional field management.

The `fields` object is configured with subsections: `add`, `remove`, and `group`.

#### `add`

An object of fields to add to the doc type's schema. See the [field type reference](/reference/field-types/README.md) for more on field type configuration.

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

An array of field names from the base class module to remove. Some core doc type fields cannot be removed since they required by core functionality.

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

An object of field groups. The groupings are used by editing interface. It _does not apply to widget modules_, which do not have a tabbed interface.

Groups are added as an object with their name as the object key and the following properties:
- `label`: The visible label (a string) on the interface tab
- `fields`: An array of field names to include in the group

The `@apostrophecms/doc-type` module groups the default fields in a `basics` group, which you can override. If overriding the `basics` group, you will need to add those core fields to a group in the module. Any fields not added to a group will be placed in an "Ungrouped" section in the editing interface.

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

In piece type modules, the `filters` setting configures the pieces manager modal, adding and removing filtering interface (to view only certain pieces). `trash` and `visibility` filters are included by default.

The `filters` object is configured with subsections: `add` and `remove`. Filters must correspond to an existing fields name or custom [query builder](#queries-self) on the piece type.

#### `add`

An object of filters to add to the piece type. Each filter is an object with its own configuration. Filter properties include:

| Property | Description |
| ------- | ------- |
| `label` | Recommended, but not required, to customize the human-readable label. |
| `inputType` | Choose an input field type for the filter from the following: `radio`, `checkbox`, or `select`. Defaults to `select`. |
| `choices` | Manually set an array of choices instead of letting Apostrophe find the valid choices from the database. Choices include `label` and `value` properties. |
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

In piece type modules, the `columns` setting configures the pieces manager modal, adding and removing the piece listing columns. Default columns include `title`, `updatedAt`, and `visibility`.

#### `add`

An object of columns to add to the piece type manager. Each column is an object with its own configuration. Column properties include:

| Property | Description |
| ------- | ------- |
| `label` | Recommended, but not required, to show a column header label. |
| `component` | An advanced option to use a custom Vue component for table cells in this column. See core components `AposCellBasic` (default) and `AposCellDate` for examples. |

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

### `instantiate`

Set to `false` to prevent the module from being fully instantiated in the application. The primary purpose of this option is to create a base class module that others will [extend](#extend) but that will not be used directly.

## Customization functions

### `async init(self)`
### `beforeSuperClass(self)`
### `methods(self)`
#### `extendMethods(self)`
### `components(self)`
#### `extendComponents(self)`
### `helpers(self)`
#### `extendHelpers(self)`
### `apiRoutes(self)`
#### `extendApiRoutes(self)`
### `restApiRoutes(self)`
#### `extendRestApiRoutes(self)`
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