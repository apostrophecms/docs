---
extends: '@apostrophecms/module'
---

# `@apostrophecms/module-name`

**Alias:** `apos.i18n`

*General description paragraph.* Cras mattis consectetur purus sit amet fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

**Extends:** `{{ $frontmatter.extends }}`

## Options

|  Property | Type | Description |
|---|---|---|
|`defaultLocale` | String | Nulla vitae elit libero, a pharetra augue. |
|`locales` | Object | Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. |

### `locales`

*Description of a more complex option.* Id ligula porta felis euismod semper. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Sed posuere consectetur est at lobortis. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Nullam quis risus eget urna mollis ornare vel eu leo. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.

## Related documentation

- [Static localization guide](/guide/localization/static.md)
- [Dynamic content localization guide](/guide/localization/dynamic.md)

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/i18n/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

Because this module has an alias, you can call these from another module from the alias path. For example, `self.apos.[the alias].inferIdLocaleAndMode()`.

### `async inferIdLocaleAndMode(req, _id)`

Curabitur blandit tempus porttitor. Nullam quis risus eget urna mollis ornare vel eu leo. Nullam id dolor id nibh ultricies vehicula ut id elit.

### `isValidLocale(locale)`

Etiam porta sem malesuada magna mollis euismod. Maecenas faucibus mollis interdum. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.

## Template helpers

Template helpers are methods available for use in template files. Because this module has an alias, you can call these in templates using the alias path. For example, `apos.util.log()`.

#### `slugify(string, options)`

Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Sed posuere consectetur est at lobortis. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

## Module tasks

### `reset`

Full command: `node app @apostrophecms/db:reset`

Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed posuere consectetur est at lobortis.
