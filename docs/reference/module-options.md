# Module configuration options

Apostrophe modules can be configured with settings that influence functionality without having to write custom Javascript. The sections below describe the options available in all modules as well as those specific to certain module types.

All settings described here are placed in a module's `options` configuration object. The `options` object can be added in the module's `index.js` file, as well as where the module is instantiated in the `app.js` file.

`index.js` example:
```javascript
// modules/article/index.js
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
// app.js
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

Option settings in this section apply to every module in Apostrophe.

- [`alias`](#alias)
- [`components`](#components)
- [`name`](#name)
- [`templateData`](#templatedata)

### `alias`

<!-- TODO: Link to information about the apos object when available. -->
Set to a string, the `alias` value will be applied to the `apos` object (accessible in many places) as a quick reference to the module.
set an alias to easily reference the module from other modules. There is no default value.

#### Example

```javascript
// modules/news-article/index.js
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

Modules' `name` properties are based on the `module` object keys in `app.js` by default. Setting the the `name` option in a module can override this original value for the sake of referencing the module elsewhere.

#### Example

```javascript
// modules/article-module/index.js
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
// modules/heading-widget/index.js
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

## Options for all doc type modules

Option settings in this section apply to all modules that extend `@apostrophecms/doc-type` ([doc type](glossary.md#doc) modules). These include all piece and page types.

- [`adminOnly`](#adminonly)
- [`autopublish`](#autopublish)
- [`label`](#label)
- [`localized`](#localized)
- [`slugPrefix`](#slugprefix)
<!-- - [`contextBar`](#contextbar) -->

### `adminOnly`

<!-- TODO: link to permissions docs when available. -->
If `true`, only users with admin-level permissions may edit this doc type. There is no default value.

#### Example

```javascript
// modules/official-memo/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    adminOnly: true
  },
  // ...
}
```

### `autopublish`

Set `autopublish` to `true` to automatically publish any changes saved to docs of this type. There is then effectively no draft mode for this doc type. The core image and file modules use this option, for example, and it can be useful for such "utility" piece types that need to have a single, predictable state.

#### Example

```javascript
// modules/article-category/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    autopublish: true
  },
  // ...
}
```

<!-- ### `contextBar` -->

<!-- NOTE: Should we keep this on the secrete menu? (not document) -->
<!-- If `true`, the second row of the admin bar, the "context bar," will be disabled.
`true` ~ allows the admin bar context bar row to appear -->

### `label`

`label` should be set to a text string to be used in user interface elements related to this doc type. This includes buttons to open piece manager modals and the page type select field.

If not set, Apostrophe will convert the module `name` meta property to a readable label by splitting the `name` on dashes and underscores, then capitalizing the first letter of each word.

#### Example

```javascript
// modules/feature/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Featured Article'
  },
  // ...
}
```

### `localized`

Defaults to `true`. If set to `false`, this doc type will _not_ be included in the locale system. This means there will be only one version of each doc, regardless of whether multiple locales (e.g., for languages or regions) are active. The "users" piece disables localization in this way.

#### Example

```javascript
// modules/administrative-category/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    localized: false
  },
  // ...
}
```

### `slugPrefix`

Set `slugPrefix` to a string to prepend all [slugs](glossary.md#slug) for docs of this type. This can be useful to help prevent slugs, which must be unique for each doc in the database, from being reserved in some cases. For example, Apostrophe image docs have the `slugPrefix` value of `'image-'` so images, which do not typically have public pages, do not accidentally reserve a more reader-friendly slug.

#### Example

```javascript
// modules/article-category/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    slugPrefix: 'category-'
  },
  // ...
}
```
