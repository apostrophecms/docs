# Anatomy of a module

Module configuration objects may use the following configuration properties.

## Configuration settings

| Setting name | Value type | [Cascades](#cascading-settings) | Description | Module types |
| ------- | ------- | ------- | ------- | :-----: |
| [`extend`](#extend) | String | No | Name a base class module | All |
| [`improve`](#improve) | String | No | Name a module to update its functionality | All |
| [`options`](#options) | Object | No | Configure module options | All |
| [`fields`](#fields) | Object | Yes | Configure doc type fields | Doc |
| [`filters`](#filters) | Object | Yes | Configure piece type filters | Piece |
| [`columns`](#filters) | Object | Yes | Configure piece type manager columns | Piece |

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
### `filters`
### `columns` (only for piece types)
### `instantiate`

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