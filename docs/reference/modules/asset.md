---
extends: '@apostrophecms/module'
---

# `@apostrophecms/asset`

**Alias:** `apos.asset`

<AposRefExtends :module="$frontmatter.extends" />

The `asset` module serves to organize, process, and output all project JavaScript and CSS assets during the build process. In addition, it provides access to modify the project webpack configuration and exposes two CLI tasks for project building and webpack cache clearing. Options are passed through the creation of a `modules/@apostrophecms/asset/index.js` file.

## Options

|  Property | Type | Description |
|---|---|---|
| [`refreshOnRestart`](#refreshonrestart) | Boolean | If set to `true`, the browser will refresh on Apostrophe app restart. |
| [`watch`](#watch) | Boolean | If set to `false`, none of the UI assets will be watched for triggering a restart. |
| `watchDebounceMs` | Integer | Time in milliseconds to wait before re-triggering a restart on asset change. |

### `refreshOnRestart`

By default, `refreshOnRestart` is set to `false`. If this option is truthy and `process.env.NODE_ENV` is not set to `production`, then restart of the Apostrophe app will trigger a browser refresh. This is very useful in combination with `nodemon`.

### `watch`

If `watch` is falsy, then changes to any of the assets in the `modules` and `node_modules` will not trigger a restart. Note that this option is disabled and has no impact if `process.env.NODE_ENV` is set to `production`.

## Command Line Tasks

### `build`
The build command triggers the compilation, processing, and output of the project assets. The main code from each module, code placed in the `<module-name>/ui/src` folders, and scripts included in [bundles](#bundles) are combined separately. Any SCSS files are combined and translated to CSS. If `NODE_ENV=production`, all of the final deployment files will be written out to a sub-folder located within either the `public/apos-frontend\releases` folder, or the `public/uploads/apos-frontend/releases/` folder if the `APOS_UPLOADFS_ASSETS` variable is also present. The name of the subfolder is derived from the release id. The `build` script will try to automatically set the release id using the hash if the project is a simple git checkout, environment variables for Heroku or platform.sh, orthe root directory name for Stagecoach. When building for other environments, the release id can be set from an `APOS_RELEASE_ID` environment variable or with a root directory file named 'release-id' with the value of the id inside. The value should be a short, unique string identifier.

#### Example

<AposCodeBlock>

```sh
APOS_RELEASE_ID='2022-01-01' node app @apostrophecms/asset:build
```
</AposCodeBlock>

### `clear-cache`
Some changes to the webpack configuration will not be detected automatically and will cause incorrect output. While this is rare, the caches for webpack can be emptied from the command line using the `clear-cache` task.

#### Example

<AposCodeBlock>

```sh
node app @apostrophecms/asset:clear-cache
```
</AposCodeBlock>

## Webpack configuration

The webpack configuration can be extended from any module. The `asset` module exposes three different properties for accomplishing this.

## Webpack options
|  Property | Type | Description |
|---|---|---|
| [`extensions`](#extensions) | Object | Adds extra processing functionality to webpack. |
| [`extensionOptions`](#extensionoptions) | Object | Adds functionality to any extensions added through the `extensions` option. |
| [`bundles`](#bundles) | Object | |

### `extensions`
The `extensions` option allows the addition of custom methods for processing the Javascript and SCSS in the `ui/src` folder. The schema used within the option conforms to that used for configuring webpack, which you can learn more about [here](https://webpack.js.org/configuration/). This property can take either a simple object with a name property or a function that returns an object.

#### `extensions` simple object

#### Example

Modification of the `resolve` property of the webpack configuration using a simple object. New values will be merged with existing values:

<AposCodeBlock>

```javascript
const path = require("path");

module.exports = {
// ...
webpack: {
  extensions: {
    modifyResolve: {
      resolve: {
        extensions: [ '.jsx' ],
        alias: {
          'Utilities': path.join(process.cwd(), 'lib/utils')
        }
      }
    }
  }
},
// ...
};

```
<template v-slot:caption>
modules/my-module/index.js
</template>
</AposCodeBlock>

::: note
Make sure the new values are of the same type as the existing values, or they will replace the existing values, e.g., the webpack configuration `extensions` property takes an array, whereas `alias` takes an object.
:::

This will add both processing for files with an extension of `.jsx` and expose a shortcut to the `lib/utils` folder that we can use in our frontend files. For example, to import a custom method from our `methods.js` library in this folder.

<AposCodeBlock>

```javascript
import  { customMethod } from ('Utilities/methods.js');

export default () => {
// Code utilizing customMethod
};
```
<template v-slot:caption>
modules/my-module/ui/src/index.js
</template>
</AposCodeBlock>

Adding a unique name for the object within the apostrophe `extensions` property is important. Passing an object with the same name to an `extensions` property of another module will cause a conflict. The configuration file will be set to the `extensions` object in the last loaded module.

#### `extensions` function

Functions in the `extensions` property take an `option` parameter to allow multiple modules to modify the same extension through the [`extensionOptions`](#extensionoptions) property. Each property to be altered across multiple modules must be present in the option that was originally returned.

<AposCodeBlock>

```javascript
const path = require("path");

module.exports = {
// ...
 webpack: {
  extensions: {
    addAlias(options) {
      return {
        resolve: {
          extensions: [ ...(options.extensions || []), '.jsx' ],
          alias: {
            ...(options.alias || {}),
            Utilities: path.resolve(process.cwd(), './lib/utils')
          }
        }
      };
    }
  }
},
// ...
};

```
<template v-slot:caption>
modules/my-module/index.js
</template>
</AposCodeBlock>

### `extensionOptions`
Any module can add additional functionality to an existing webpack `extension` that was created through a function using the `extensionOptions` property. This property takes a function with an `options` parameter and returns an object with additional options for any configuration options present in the original function.

#### Example

Extending the previous example with an additional extension and alias:

<AposCodeBlock>

```javascript
module.exports = {
// ...
 webpack: {
  extensionOptions: {
    addAlias(options) {
      return {
        extensions: [ '.jsm' ],
        alias: {
          Data: path.resolve(process.cwd(), './lib/data')
        }
      };
    }
  }
},
// …
};
```
<template v-slot:caption>
module/my-new-widget/index.js
</template>
</AposCodeBlock>

### `bundles`
The `bundles` option allows delivery of frontend assets to a specific page or if a widget is on a page page. This option takes an object containing either the JavaScript or stylesheet file names without extension as properties. These files should be located in the module's `ui/src` folder. Each property takes either an empty object or a sub-property of `templates`. The `templates` sub-property accepts an array of page template names where the content should be loaded. So, for example, a bundle added to a `piece-page-type` could specify `templates: [ 'index' ]` to load the bundle on the `index` page, but not the `show` page.

Multiple modules can contribute to a single bundle by using the same bundle name, and webpack will merge these files in the final build. In addition, any shared dependencies between the extra bundles and the "main" bundle built from the code found in the `ui/src/index.js` files will be resolved so that only one instance is loaded.

::: warning
Bundles should be used cautiously as they can contribute to slower page load times.
:::

## Related documentation

- [Extending webpack configuration](/guide/webpack.md)