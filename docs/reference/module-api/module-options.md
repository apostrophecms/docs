# Module configuration options

Apostrophe modules can be configured with settings that influence functionality without having to write custom JavaScript. The sections below describe the options available in all modules as well as those specific to certain module types.

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

## Using module options

Most module options in Apostrophe core and official extension modules are used automatically for specific purposes. No additional work is needed to use them for their original purposes other than configuring them.

Module options can also be referenced directly in custom module code. Module configuration function sections take a `self` argument, which is the module itself. You can then get the options as `self.options`.

For example, if you had a custom piece type, it might look like this:

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    alias: 'article'
  },
  init (self) {
    const moduleOptions = self.options;
    // ...
  },
  methods (self) {
    return {
      logOptions () {
        console.log('The module alias is ', self.options.alias);
      }
    }
  }
}
```

## Options for any module

Option settings in this section apply to every module in Apostrophe.

| Option | Value type | Description |
|---------|---------|---------|
| [`alias`](#alias) | String | Configure an alias to more easily reference the module elsewhere. |
| [`components`](#components) | Object | Configure custom UI Vue components to be used for the module. |
| [`i18n`](#i18n) | Boolean/Object | Indicate that the module will include localization strings for the i18n module (with optional configuration). |
| [`templateData`](#templatedata) | Object | Set data to be included on `req.data` for requests to this module.  |

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

:::tip NOTE
With the exception of modules present in Apostrophe core at the time of the 3.x stable release, modules distributed via npm should never set `alias` for themselves or assume that it has been set. This is to avoid conflict when multiple modules attempt to use the same alias.
:::

### `components`

The `components` options is an object identifying Vue components to use for the module's related user interface. The keys of this object, and thus the UI being overridden, will vary based on the module type. For example, piece modules use `managerModal` and `editorModal` components.

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

### `i18n`

If set to a truthy value, Apostrophe will look for an `i18n` subdirectory *in that module* with one or more JSON files with localization string definitions (e.g., `modules/project-languages/es.json`). The JSON file names should match configured locale names. [See the static i18n guide](/guide/localization/static.md) for more information.

If set to an object, there may be `ns` and `browser` properties.

| `i18n` setting | Value type | Description |
|---------|---------|---------|
| `ns` | String | A namespace for localization string keys in this module. If undefined, Apostrophe will use the `'default'` namespace. That namespace is intended for project-level localization. |
| `browser` | Boolean | Set to `true` to make the JSON key/string pairs available on the browser window (e.g., `apos.i18n.i18n.en.default`) *when logged in*. Necessary when localizing strings in the UI, including doc type labels. |

::: note
The namespace `'apostrophe'` is reserved for Apostrophe's UI. You may intentionally set `ns` to `'apostrophe'` if your goal is to localize the Apostrophe user interface.
:::

[See the static i18n guide](/guide/localization/static.md) for more information on both settings.

#### Example

```javascript
// modules/project-languages/index.js
module.exports = {
  extend: '@apostrophecms/module',
  options: {
    i18n: {
      namespace: 'projectName',
      browser: true
    }
  }
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

Option settings in this section apply to all modules that extend `@apostrophecms/doc-type` ([doc type](/reference/glossary.md#doc) modules). These include all piece and page types.

| Option | Value type | Description |
|---------|---------|---------|
| [`adminOnly`](#adminonly) | Boolean | Set to `true` to only allow admins to manage the doc type. |
| [`autopublish`](#autopublish) | Boolean | Set to `true` to publish all saved edits immediately. |
| [`label`](#label-for-doc-types) | String | The human-readable label for the doc type. |
| [`localized`](#localized) | Boolean | Set to `false` to exclude the doc type in the locale system. |
| [`sort`](#sort) | Object | Configure sort order for docs of this type. |
| [`slugPrefix`](#slugprefix) | String | Add a prefix to all slugs for this doc type. |
<!-- - [`contextBar`](#contextbar) -->

### `adminOnly`

<!-- TODO: link to permissions docs when available. -->
If `true`, only users with the sitewide admin permission can read or write docs of this type. The `@apostrophecms/user` module uses this setting due to its impact on user access. There is no default value.

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

Set `autopublish` to `true` to automatically publish any changes saved to docs of this type. There is then effectively no draft mode for this doc type.

The core image and file modules use this option, for example. It eliminates the need for users to think about the distinction between draft and published content while preserving the possibility of translation for different locales.

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

### `label` (for doc types)

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

### `sort`

The `sort` option for a doc type defines a sorting order for requests to the database for that type. The option is set to an object containing field name keys with `1` as a property value for ascending order and `-1` for descending order.

The default sort for all doc types is `{ updatedAt: -1 }`, meaning it returns documents based on the `updatedAt` property (the date and time of the last update) in descending order. The `sort` object can have multiple keys for more specific sorting.

#### Example

This `sort` setting will return articles first based on a custom `priority` field in ascending order, then by the core `updatedAt` property in descending order.

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    sort: {
      priority: 1,
      updatedAt: -1
    }
  },
  fields: {
    add: {
      priority: {
        type: 'integer',
        min: 1,
        max: 5
      },
      // ...
    }
  }
  // ...
}
```

### `slugPrefix`

Set `slugPrefix` to a string to prepend all [slugs](/reference/glossary.md#slug) for docs of this type. This can prevent slugs, which must be unique to each doc, from being reserved in some cases. For example, Apostrophe image docs have the `slugPrefix` value of `'image-'` so images, which do not typically have public pages, do not accidentally reserve a more reader-friendly slug.

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

## Options for all piece modules

Option settings in this section apply to all piece modules (those that extend `@apostrophecms/piece-type`).

| Option | Value type | Description |
|---------|---------|---------|
| [`pluralLabel`](#plurallabel) | String | The plural readable label for the piece type. |
| [`perPage`](#perpage) | Integer | The number of pieces to include on `req.data.pieces` in each page. |
| [`publicApiProjection`](#publicapiprojection-for-pieces) | Object | Piece fields to make available via a public REST API route. |
| [`quickCreate`](#quickcreate-for-pieces) | Boolean | Set to `true` to add the piece type to the quick create menu. |
| [`searchable`](#searchable) | Boolean | Set to `false` to remove the piece type from search results. |

### `pluralLabel`

Similar to `label` for all doc types, the `pluraLabel` option sets the string the user interface will use to describe a piece type in plural contexts. All page types are referred to as "Pages" in these contexts, but pieces should have unique labels (e.g., "Articles," or "Teams").

If no `pluralLabel` value is provided, Apostrophe will append the `label` (whether set manually or generated [as described](#label)), with "s", as is typical for English words. **Even in English this is often not correct, so `pluralLabel` should usually be defined explicitly.**

#### Example

```javascript
// modules/goose/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Goose',
    pluralLabel: 'Geese'
  },
  // ...
}
```

### `perPage`

In piece types, the `perPage` option, expressed as an integer, sets the number of pieces that will be returned in each "page" [during `GET` requests](/reference/api/pieces.md#get-api-v1-piece-name) that don't specify an `_id`. This value defaults to 10.

#### Example

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    perPage: 20 // REST `GET` requests will return 20 pieces per page.
  },
  // ...
}
```

### `publicApiProjection` (for pieces)

By default the built-in Apostrophe REST APIs are not accessible without proper [authentication](/reference/api/authentication.md). You can set an exception to this for `GET` requests to return specific document properties with the `publicApiProjection` option.

This should be set to an object containing individual field name keys set to `1` for their values. Those fields names included in the `publicApiProjection` object will be returned when the `GET` API requests are made without authentication.

#### Example

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    publicApiProjection: {
      title: 1,
      authorName: 1,
      _url: 1 // 👈 Dynamic properties are allowed
    }
  },
  // ...
}
```

Unauthenticated [`GET /api/v1/article`](/reference/api/pieces.md#get-api-v1-piece-name) requests would return each piece with only the `title`, `authorName`, and `_url` properties.

### `quickCreate` (for pieces)

Setting `quickCreate: true` on a piece adds that piece type to the admin bar "quick create" menu. The Apostrophe admin bar user interface includes the quick create menu button to add new pieces without first opening their respective manager modals.

#### Example

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    quickCreate: true
  },
  // ...
}
```

### `searchable`

<!-- TODO: link to documentation of Apostrophe search when available. -->
Setting `searchable: false` on a piece type will exclude that piece type from the results in Apostrophe's built-in search.

#### Example

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    searchable: false
  },
  // ...
}
```

## Options for the core page module

Option settings in this section apply to the core page module (`@apostrophecms/page`).

| Option | Value type | Description |
|---------|---------|---------|
| [`builders`](#builders) | Object | Set query builder values to be used when pages are served. |
| [`home`](#home) | Boolean/Object | Change how the home page is added to `req.data` when pages are served. |
| [`minimumPark`](#minimumpark) | Array | Override default parked pages, including the home page. |
| [`park`](#park) | Array | Set pages to be created on site start with configuration. |
| [`publicApiProjection`](#publicapiprojection-for-pages) | Object | Set query builder values to be used when pages are served. |
| [`quickCreate`](#quickcreate-for-pages) | Boolean | Set to `false` to remove pages from the quick create menu. |
| [`types`](#types) | Array | Set the page types available for new pages. |

### `builders`

<!-- TODO: Update builders with link to a more detailed explanation of builders when available. -->
The `builders` option can be used to apply any existing query builders when a page is served by its URL. This affects the data available on the page object, `req.data.page` (`data.page` in templates).

The default value is:
```javascript
{
  children: true,
  ancestors: { children: true }
}
```

In this example, page objects are fetched with one level of page tree "children" as `_children` and their "ancestor" pages, each with one level of their child pages, on `_ancestors`.


#### Example

```javascript
// modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    builders: {
      children: { depth: 2 }
    }
  },
  // ...
}
```

In this example, we are not including ancestor pages and are requesting two levels of child pages (direct children and their direct children).

### `home`

The home page document is added to all page requests on `req.data.home` so it can be referenced in all page templates. That home page object also includes a `_children` property containing an array of top level page objects. The `home` option offers minor performance improvements for large sites by setting one of the following values:

| Setting | Description |
|---------|-------------|
| `false` | Disables adding the home page document to the requests. |
| `{ children: false }` | Includes the home page document, but without the child pages array. If the [`builders` option](#builders) has an `ancestors` property, that will take precedence. |

#### Example

```javascript
// modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    home: { children: false }
  },
  // ...
}
```

### `minimumPark`

The `minimumPark` option sets the initial defaults for the home page and archive "page" (the page archive). This should normally be left as it is. A possible use case for changing this might be when building an installable module meant to change the defaults for all websites that use it.

::: warning
Configuring this poorly, especially by leaving out one of the two required pages, will break page functionality. In almost every situation it is better to use the [`park`](#park) option instead, including for updating home page properties.
:::

The default is:
```javascript
[
  {
    slug: '/',
    parkedId: 'home',
    _defaults: {
      title: 'Home',
      type: '@apostrophecms/home-page'
    }
  },
  {
    slug: '/archive',
    parkedId: 'archive',
    type: '@apostrophecms/archive-page',
    archived: true,
    orphan: true,
    title: 'Archive'
  }
]
```

#### Example

```javascript
// modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    minimumPark: [
      {
        slug: '/',
        parkedId: 'home',
        _defaults: {
          title: 'Welcome',  // 👈
          type: 'welcome-page' // 👈
        }
      },
      {
        slug: '/archive',
        parkedId: 'archive',
        type: '@apostrophecms/archive-page',
        archived: true,
        orphan: true,
        title: 'Archive'
      }
    ]
  },
  // ...
}
```

### `park`

Use the `park` option to add an array of pages that should be created when the app starts up if they do not already exist. Each page is added as an object with initial properties, including the required `parkedId`.

Required and recommended parked page properties include:

| Setting | Requirement | Description |
|---------|-------------|-------------|
| `parkedId` | Required | A unique ID value used to identify it among parked pages. |
| `slug` | Required | The page [slug](/reference/glossary.md#slug). |
| `type` | Required | The page type to be used for the parked page. |
| `title` | Recommended | The page title. If not set, it will be "New Page." |

If added on the top level of the page object, these properties will not be editable through the user interface. Properties other than `parkedId` may be included in a `_defaults` property instead, which will allow them to be edited in the UI.

#### Example

```javascript
// modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    park: [
      // The blog page has a permanent slug, title, and type.
      {
        parkedId: 'blogParkedId',
        slug: '/blog',
        title: 'Blog',
        type: 'blog-page'
      },
      // The team page has a permanent type, but editable slug and title.
      {
        parkedId: 'teamParkedId',
        type: 'staff-page',
        _defaults: {
          slug: '/team',
          title: 'Our Team',
        }
      }
    ]
  },
  // ...
}
```

### `publicApiProjection` (for pages)

By default the built-in Apostrophe REST APIs are not accessible without proper [authentication](/reference/api/authentication.md). You can set an exception to this for `GET` requests to return specific document properties with the `publicApiProjection` option.

This should be set to an object containing individual field name keys set to `1` for their values. Those fields names included in the `publicApiProjection` object will be returned when the `GET` API requests are made without authentication.

#### Example

```javascript
// modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    publicApiProjection: {
      title: 1,
      _url: 1 // 👈 Dynamic properties are allowed
    }
  },
  // ...
}
```

Unauthenticated [`GET /api/v1/@apostrophecms/page`](/reference/api/pages.md#get-api-v1-apostrophecms-page) requests would return each piece with only the `title` and `_url` properties.

### `quickCreate` (for pages)

Pages are included in the admin bar "quick create" menu by default. Setting `quickCreate: false` on the page module will disable this.

#### Example

```javascript
// modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    quickCreate: false
  },
  // ...
}
```

### `types`

The `types` array defines the page types available to users when creating or editing pages. Each item in the array should have a `label` property and a `name` property, which matches an active page type. If no `types` array is set, only the core "Home" page type will be available.

[Parked pages](#park) may use page types that are not in the `types` option array. This allows developers to do things such as parking a single search page but not allowing users to create additional search pages.

#### Example

```javascript
// modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    types: [
      {
        name: 'default-page',
        label: 'Default'
      },
      {
        name: 'article-page',
        label: 'Article Index'
      }
      {
        name: '@apostrophecms/home-page',
        label: 'Home'
      }
    ]
  },
  // ...
}
```

## Options for page type modules

Option settings in this section apply to all page types (modules that extend `@apostrophecms/page-type`).

| Option | Value type | Description |
|---------|---------|---------|
| [`scene`](#scene) | String | Change the "scene" for this page type from the default `'public'`. |

### `scene`

Scenes are contexts in which certain sets of front end assets are delivered. Normally, anonymous site visitors receive only the stylesheets and scripts included in the `'public'` asset scene (those that are placed in the module's `ui/public` directory). If your page will use assets, such as Apostrophe's modals, that are normally reserved for logged-in users you can set `scene: 'apos'` in order to load them with pages of this type.

#### Example

```javascript
// modules/fancy-form-page/index.js
module.exports = {
  extend: '@apostrophecms/page-type',
  options: {
    scene: 'apos'
  },
  // ...
}
```

## Options for piece page types

Option settings in this section apply to all piece page types (modules that extend `@apostrophecms/piece-page-type`).

| Option | Value type | Description |
|---------|---------|---------|
| [`perPage`](#perpage) | Integer | Set the number of pieces to be |
| [`next`](#next) | Boolean/Object | Enable and optionally configure the `req.data.next` object. |
| [`piecesFilters`](#piecesfilters) | Array | Configure pieces filters for index pages. |
| [`pieceModuleName`](#piecemodulename) | String | Specify the associated piece type if it doesn't match the module name. |
| [`previous`](#previous) | Boolean/Object | Enable and optionally configure the `req.data.previous` object. |

### `perPage`

For piece pages, the `perPage` option, expressed as an integer, defines the number of pieces that will be added to the `req.data.pieces` array when the page is served. The specific pieces in the set will be based on the total number of pieces and the `page` query parameter in the request.

This is, more simply, the number of pieces that will normally be displayed on each page of a [paginated index page](/reference/glossary.md#index-page). This value defaults to 10.
<!-- TODO: Change index page link to a guide on index pages when available. -->

#### Example

```javascript
// modules/article-page/index.js
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    perPage: 12
  },
  // ...
}
```

### `next`

If set to `true`, Apostrophe will include the next piece, based on the [sort option](#sort), on `req.data.next` when serving a [show page](/reference/glossary.md#show-page). This is useful to add links to a show page directing visitors to the next item in a series (e.g., the next oldest blog post). If not set, `req.data.next` will not be available.

`next` can also be set to an object, which will be used as a query builder for retrieving that next piece document.

#### Example

```javascript
// modules/article-page/index.js
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    next: true
  },
  // ...
}

// OR

module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    // The next article piece would be returned with only the `title`, `_url`,
    // and `publishedAt` properties.
    next: {
      project: {
        title: 1,
        _url: 1,
        publishedAt: 1
      }
    }
  },
  // ...
}
```

### `piecesFilters`

<!-- TODO: Link to a guide on using piece filters when available. -->
<!-- TODO: Link to a better query builder guide when available. -->
`piecesFilters`, configured as an array of objects, supports filtering pieces on an [index page](/reference/glossary.md#index-page). Each object must have a `name` property associated with a valid [query builder](/reference/module-api/module-overview.md#queries-self-query). These include:

- Custom query builders configured in an app that include a `launder` method
- Field names whose field types automatically get builders:
  - `boolean`
  - `checkboxes`
  - `date`
  - `float`
  - `integer`
  - `relationship`
  - `select`
  - `slug`
  - `string`
  - `url`

When the index page is served, configured filters will be represented on a `req.data.piecesFilters` object (`data.piecesFilters` in the template). If you include `counts: true` in a filter object, the number of pieces matching that filter are included on `req.data.piecesFilters` properties.

#### Example

```javascript
// modules/article-page/index.js
// 👆
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    piecesFilters: [
      { name: '_author' },
      {
        name: 'category',
        counts: true
      }
    ]
  },
  fields: {
    _author: {
      type: 'relationship',
      label: 'Author'
    },
    category: {
      type: 'select',
      label: 'Category',
      choices: [
        // Category choices here
      ]
    }
    // Other fields...
  },
  // ...
}
```

### `pieceModuleName`

Piece page types are each associated with a single piece type. If named with the pattern `[piece name]-page`, the associated piece type will be detected automatically. For example, if the `article-page` module extends `@apostrophecms/piece-page-type`, it will automatically be associated with an `article` piece type.

You can override this pattern by explicitly setting `pieceModuleName` to an active piece type name. Ths can be useful if there is more than one piece page type for a single piece type (e.g., to support different functionality in each).

#### Example

```javascript
// modules/team-page/index.js
// 👆 This module name would look for a piece type named `team` if not for
// `pieceModuleName`
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    pieceModuleName: 'person'
  },
  // Maybe there's code here to group people by team.
  // ...
}
```

### `previous`

If set to `true`, Apostrophe will include the previous piece, based on the [sort option](#sort), on `req.data.previous` when serving a [show page](/reference/glossary.md#show-page). This is useful to add links to a show page directing visitors to the previous item in a series (e.g., the next newest blog post). If not set, `req.data.previous` will not be available.

`previous` can also be set to an object, which will be used as a query builder for retrieving that next piece document.

#### Example

```javascript
// modules/article-page/index.js
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    previous: true
  },
  // ...
}

// OR

module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    // The previous article piece would be returned with only the `title`,
    // `_url`, and `publishedAt` properties.
    previous: {
      project: {
        title: 1,
        _url: 1,
        publishedAt: 1
      }
    }
  },
  // ...
}
```


## Options for widget modules

Option settings in this section apply to all widgets (modules that extend `@apostrophecms/widget-type`).


| Option | Value type | Description |
|---------|---------|---------|
| [`className`](#classname) | String | Applies a class to core widget templates. |
| [`icon`](#icon) | String | Select an available icon to include with the label in area menus. |
| [`label`](#label-for-widgets) | String | The human-readable label for the widget type. |

<!-- | [`scene`](#scene) | null | description | -->
<!-- | [`contextual`](#contextual) | Boolean | description | -->

### `className`

Official Apostrophe widget templates support adding an html class from the `className` module option. The class is applied to the outer, wrapping HTML element in the widget template for easy styling.

#### Example

```javascript
// modules/@apostrophecms/image-widget/index.js
module.exports = {
  options: {
    className: 'c-image-widget'
  },
  // ...
}
```

<!-- NOTE: Not ready to document yet. There are elements to this that need to be worked out. -->
<!--
### `contextual`

Some widgets, including the core rich text widget, should not be edited in a modal. Setting `contextual: true` on a widget module will tell the user interface, when in edit mode, to load the widget immediately using its associated editor component. `@apostrophecms/rich-text-widget` is the best example of this in core. Widgets that only serve to provide layout for nested areas are another possible use case.

**It is important that the widget type has a [configured `widgetEditor` component](#components) that is built for this purpose.** If there is no such component, the widget editor modal will open immediately on load.

#### Example

```javascript
// modules/@apostrophecms/layout-widget/index.js
module.exports = {
  options: {
    contextual: true,
    components: {
      // 👇 This refers to a project-level `MyCustomLayoutWidgetEditor.vue`
      // component file.
      widgetEditor: 'MyCustomLayoutWidgetEditor',
      widget: 'AposWidget'
    }
  },
  // ...
}
```
-->

### `icon`

Identify an icon to be used with a widget label in the area menu with the `icon` option. That icon must be included in the [list of globally available UI icons](https://github.com/apostrophecms/apostrophe/blob/3.0/modules/@apostrophecms/asset/lib/globalIcons.js) or configured on the module in its `icons` section. See the [module settings reference](/reference/module-api/module-overview.md#icons) for how to make new icons available.

#### Example

```javascript
// modules/two-column-widget/index.js
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    icon: 'pillar'
  },
  icons: {
    pillar: 'Pillar'
  },
  // ...
};

```

!['Area menu with icons next to widget labels'](/images/area-menu-with-icons.png)

### `label` (for widgets)

`label` should be set to a text string to be used in the area menu. If not set, Apostrophe will convert the module `name` meta property to a readable label by removing `-widget` from the end, splitting the `name` on dashes and underscores, and capitalizing the first letter of each word.

#### Example

```javascript
// modules/two-column-widget/index.js
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Two Column Layout'
  },
  // ...
};

```

<!-- TODO: Flesh out once questions around scenes are resolve, or delete. -->
<!-- ### `scene` -->

## Options for the core rich text widget

Option settings in this section apply to the core rich text widget module (`@apostrophecms/rich-text-widget`).

| Option | Value type | Description |
|---------|---------|---------|
| [`defaultData`](#defaultdata) | Object | Define initial default data for rich text content. |
| [`defaultOptions`](#defaultoptions) | Object | Configure the rich text toolbar and styles for rich text widgets. |
| [`editorTools`](#editortools) | Object | Configure rich text tools and their Vue components. |

### `defaultData`

Rich text widgets can start with default content by setting `defaultData` to an object with a `content` property. That value would be a string of text or HTML that all rich text widgets would include when added.

#### Example

```javascript
// modules/@apostrophecms/rich-text-widget/index.js
module.exports = {
  options: {
    defaultData: {
      content: '<p>Replace me</p>'
    }
  },
  // ...
}
```

### `defaultOptions`

The rich text widget is configured by default with useful [rich text toolbar settings and styles](https://github.com/apostrophecms/apostrophe/blob/3.0/modules/@apostrophecms/rich-text-widget/index.js#L15-L45). These can be overridden by setting `defaultOptions`. This configuration object can include one or both of the `toolbar` and `styles` sub-options. If only one of those is included, the other will fall back to the core defaults.

`defaultOptions` can also be overridden in schema configuration where an area configures its rich text widgets. So a project can have site-wide defaults, but a specific area can have its own separate configuration.

#### Example

```javascript
// modules/@apostrophecms/rich-text-widget/index.js
module.exports = {
  options: {
    defaultOptions: {
      toolbar: [
        'bold',
        'italic',
        'link'
      ],
      styles: []
    }
  },
  // ...
}
```

<!-- TODO: Link to a guide page about configuring the RTE when available. -->

### `editorTools`

The rich text editor toolbar tools (e.g., "bold," "link," and "underline" buttons) can be reconfigured to have different labels (seen by assistive technologies), different icons, or even new Vue components altogether. `editorTools` can be completely overridden to do this if desired.

::: warning
Using this option takes full responsibility for the configuration of the rich text editor tools. Use this with caution. If overriding, be sure to include _all_ rich text tools that you will use.

If introducing an editor tool that is not included in core, you will need to create both the Vue component and, often, a [tiptap extension](https://tiptap.dev/docs/guide/extensions.html#installation).
:::
<!-- TODO: link to an RTE extension guide when available. -->


```javascript
// modules/@apostrophecms/rich-text-widget/index.js
module.exports = {
  options: {
    editorTools: {
      styles: {
        component: 'MyTiptapStyles',
        label: 'Styles'
      },
      '|': { component: 'MyTiptapDivider' },
      bold: {
        component: 'MyTiptapButton',
        label: 'Bold',
        icon: 'format-bold-icon'
      },
      italic: {
        component: 'MyTiptapButton',
        label: 'Italic',
        icon: 'format-italic-icon'
      },
      // Many more tools...
    }
  },
  // ...
}
```
