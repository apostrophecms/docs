# Anatomy of a module

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

::: tip NOTE
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