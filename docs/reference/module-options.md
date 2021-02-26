# Module configuration options

Most Apostrophe modules, both core and project-level, can be configured with settings that influence functionality without having to write custom Javascript. The sections below describe the options available in all modules as well as those specific to certain module types.

All the settings described here are placed in a module's `options` configuration object. This often added in the respective `index.js` file, but can also be added where the module is instantiated in the `app.js` file.

`index.js` example:
```javascript
// In `modules/article/index.js`
module.exports = {
  extend: '@apostrophecms/piece-type',
  // 👇 Module configuration options
  options: {
    alias: 'article',
    label: 'Article',
    pluralLabel: 'Articles',
    quickCreate: true
  },
  // Other settings, such as `fields`
}
```

`app.js` example:
```javascript
// In `app.js`
require('apostrophe')({
  shortName: 'bowling-league-site', // Unique to your project
  modules: {
    article: {
      extend: '@apostrophecms/piece-type',
      // 👇 Module configuration options
      options: {
        alias: 'article',
        label: 'Article',
        pluralLabel: 'Articles',
        quickCreate: true
      },
      // Other settings, such as `fields`
    }
  }
});
```

## Options for any module

- [`alias`](#alias)
- [`components`](#components)
- [`name`](#name)
- [`templateData`](#templatedata)

### `alias`

Set to a string, the `alias` value will be applied to the `apos` object (accessible in many places) as a quick reference to the module.
set an alias to easily reference the module from other modules. There is no default value.

#### Example

```javascript
// In `modules/news-article/index.js`
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    alias: 'article'
  },
  // ...
}
```

This `article` module can then be referenced anywhere the `apos` object is present as `apos.article`. Otherwise it would be available via `apos.modules['news-article']`.


### `components`

The `components` options is an object identifying Vue components to use for the module's related user interface. The keys of this object, and thus the UI being overridden, will vary based on the module type. For example, piece module use `managerModal` and `editorModal` components.

This is an advanced option since it can easily break the user interface.

#### Example

```javascript
// modules/@apostrophecms/piece-type/index.js
module.exports = {
  options: {
    components: {
      managerModal: 'MyCustomPiecesManager'
    }
  },
  // ...
}
```

### `name`

Modules `name` properties are based on the `module` object keys in `app.js` by default. Setting the the `name` option in a module can override this original value for the sake of referencing the module elsewhere.

#### Example

```javascript
// In `modules/article-module/index.js`
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    name: 'article'
  },
  // ...
}
```

### `templateData`

Similar to [`browser`](#browser), the `templateData` module option can be set to an object whose properties will be made available in templates of that module. Properties are attached directly to the `data` object in templates.

#### Example

```javascript
// In `modules/heading-widget/index.js`
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    templateData: {
      defaultColor: '#55ff93'
    }
  },
  // ...
}
```

You might use that value as a fallback for user-editable fields.

```django
{# In `modules/heading-widget/index.js` #}
{% set bgColor = data.widget.color or data.defaultColor %}
<h2 style="background-color: {{ bgColor }}">
  Title Here
</h2>
```

## Accessing module options