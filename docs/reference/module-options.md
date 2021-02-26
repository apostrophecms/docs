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
- [`browser`](#browser)
<!-- - [`components`](#components) -->
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


### `browser`

An object with data to make available for the module in the client (e.g., on `window.modules['browser-name']`).

Any module that completely overwrites the `getBrowserData` method, rather than extending it from `@apostrophecms/module`, will not have access to the `browser` option properties (e.g., `@apostrophecms/login`, `@apostrophecms/modal`). The same is true for any custom modules that extend such modules.

#### Example

```javascript
// In `modules/popup-widget/index.js`
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    browser: {
      defaultPopupDelay: 4000
    }
  },
  // ...
}
```

In client-side Javascript you could then reference `window.apos.modules['popup-widget'].defaultPopupDelay` to get `4000`.

<!-- ### `components`

  The `components` option is used to identify Vue components

  ~ set specific Vue components to be used for this module. (Don't doc?) -->

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