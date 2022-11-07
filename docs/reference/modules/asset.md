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
| [`watch`](#watch) | Boolean | If set to `false`, none of the UI assets will be watched to trigger a restart. |
| `watchDebounceMs` | Integer | Time in milliseconds to wait before re-triggering a restart on asset change. |
| [`uploadfs`](#uploadfs) | Object | Can be used to configure an `uploadfs` instance. |
| [`rebundleModules`](#rebundlemodules) | Object | Used to direct project wide asset files into new bundles. |

### `refreshOnRestart`

By default, `refreshOnRestart` is set to `false`. If this option has a falsy value, the browser will not automatically refresh following app restart.  If this option is truthy and `process.env.NODE_ENV` is not set to `production`, then restart of the Apostrophe app will trigger a browser refresh. This is very useful in combination with `nodemon` to deliver file changes to the browser.

### `watch`

By default, `watch` is set to `true`. A truthy value will cause the application to monitor for changes in any of the asset bundles in the `modules` and `node_modules` folders and trigger a webpack rebuild and browser refresh. A value of `false` will disable this behavior. Note that this option is disabled and has no impact if `process.env.NODE_ENV` is set to `production`.

### `uploadfs`

When the `APOS_UPLOADFS_ASSETS` environment variable is present, this optional property can be used to configure an `uploadfs` instance that differs from the one configured by the `attachment` module, allowing changes in where assets from the webpack build process are stored and how they are served. Full documentation for uploadfs can be found [here](https://www.npmjs.com/package/uploadfs).

### `rebundleModules`

The `rebundleModules` option allows for overridding the `bundles` properties passed into `webpack` at the individual module level, including modules add through npm. This option takes an object with module names, or module names with a suffix made up of a `:` and individual file name from the module `ui/src` folder, as properties. Each property takes the name of the bundle where the file should be added as a string.

#### Example

<AposCodeBlock>

```js
module.exports = {
  options: {
    rebundleModules: {
      // Everything from the fancy-form module should go in the regular "main" bundle
      'fancy-form': 'main',
      // Everything from the basic-product module should go in the "secondary" bundle
      'basic-product': 'secondary',
      // The ui/src/form.js code from the @dcad/form module should be retargeted to the
      // "secondary" bundle — but only that code, leave ui/src/index.js in the main bundle
      '@dcad/form:form': 'secondary'
    }
  }
};
```

<template v-slot:caption>
modules/@apostrophecms/asset/index.js
</template>
</AposCodeBlock>

To split files within a single `ui/src` folder into multiple bundles, assign each file separately with a property:value pair for each file.


## Command Line Tasks

### `build`
The build command triggers the compilation, processing, and output of files within the `ui/apos`  and `ui/src` folders of each module. Logged-in users will receive assets from both folders, while logged-out users will only receive the later. You don't need this task in a development environment, it runs automatically when you start your app. It is necessary in a production environment.

Assets within the `ui/apos` folder modify the admin UI. Code to be passed to the build process should be organized into three subfolders, a `components` folder that contains any new Vue components, an `apps` folder that takes any additional admin-facing JavaScript, and a `tiptap-extensions` folder that contains any tiptap-extensions used within the admin UI.

During the build process, code located in the `ui/apos` subdirectory of any module is automatically detected and incorporated. Assets in the `components` folder are registered automatically by name as Vue components and do not need to be imported.

Unlike assets in the `ui/src` folder where only the `index.js` file is an entry point, all files in the `ui/apos/apps` folder are entry points. If this behavior is undesirable any files that should not be entry points can be placed into a sub-directory and imported into the main entry point file. See the [`@apostrophecms/login` module](https://github.com/apostrophecms/apostrophe/tree/main/modules/%40apostrophecms/login) for an example, including import of the Vue library within the [`AposLogin.js` file](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/login/ui/apos/apps/AposLogin.js). Customizing the admin UI is covered in-depth in the [guide documentation](https://v3.docs.apostrophecms.org/guide/custom-ui.html#customizing-the-user-interface).

Every file in the tiptap-extensions folder must be a [tiptap](https://tiptap.dev/) WYSIWYG rich text editor [extension](https://tiptap.dev/extensions), written in that format. Every such extension will be loaded and made available for potential activation by the developer in the rich text widget's editing toolbar.

Frontend JavaScript and SASS CSS for ordinary website visitors is located in the `ui/src` folders of each module. If a module has a `ui/src/index.js` file, that is automatically incorporated as a JavaScript entry point. If a module has a `ui/src/index.scss` file, that is automatically incorporated as a CSS entry point. `ui/src/index.js` files must export a function, and the browser will invoke these in the order the modules were configured.

In addition, files in `ui/public` are automatically concatenated into the `ui/src` JavaScript bundle "as-is."

In addition to the `ui/src/index.js` and `ui/src/index.scss` entry points, additional entry points can be defined by declaring [bundles via the `webpack` section](#bundles) of any module's main `index.js` file. These create separately compiled frontend bundles loaded only if a widget type or page type module declares a need for them.

If `NODE_ENV=production`, all of the final deployment files will be written out to a sub-folder located within either the `public/apos-frontend/releases` folder, or the `public/uploads/apos-frontend/releases/` folder if the `APOS_UPLOADFS_ASSETS` variable is also present. The name of the subfolder is derived from the release id. The `build` script will try to automatically set the release id using the hash if the project is a simple git checkout, environment variables for Heroku or platform.sh, or via the timestamp part of the project's deployment folder name for Stagecoach. When building for other environments, the release id must be set via the `APOS_RELEASE_ID` environment variable or with a root directory file named 'release-id' with the value of the id inside. The value should be a short, unique string identifier.

#### Example

<AposCodeBlock>

```sh
NODE_ENV=production APOS_RELEASE_ID='2022-01-01' node app @apostrophecms/asset:build
```
</AposCodeBlock>

### `clear-cache`
Some changes to the webpack configuration will not be detected automatically resulting in a failure to automatically rebuild the assets after those changes are first made. While this is rare, the caches for webpack can be emptied from the command line using the `clear-cache` task.

#### Example

<AposCodeBlock>

```sh
node app @apostrophecms/asset:clear-cache
```
</AposCodeBlock>

## Webpack configuration

The webpack configuration for building the front-facing page assets can be extended from any module. The `asset` module exposes three different properties for accomplishing this.

## Webpack options
|  Property | Type | Description |
|---|---|---|
| [`extensions`](#extensions) | Object | Adds extra processing functionality to webpack. |
| [`extensionOptions`](#extensionoptions) | Object | Adds functionality to any extensions added through the `extensions` option. |
| [`bundles`](#bundles) | Object | Allows delivery of additional assets when specific pages or pieces are displayed. |

### `extensions`
The `extensions` option allows the addition of custom webpack configuration methods for processing the Javascript and SCSS in the `ui/src` and `ui/apos` folders. The schema used within the option conforms to that used for configuring webpack, which you can learn more about [here](https://webpack.js.org/configuration/). Subproperties of extensions can be simple objects whose properties merge with the webpack configuration, or functions that accept an object of options and return such an object.

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

This example will expose a shortcut to the `lib/utils` folder that we can use in our frontend files. For example, to import a custom method from our `methods.js` library in this folder.

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

Adding a unique name for the extension within the apostrophe `extensions` property is important. This is because you can elect to override a module `extensions` object by passing an extension of the same name from another module that is loaded later.

#### `extensions` function

#### Example

Functions in the `extensions` property can take an `options` parameter to allow several modules to pass options to an extension through the [`extensionOptions`](#extensionoptions) property.

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
Any module can pass options to an existing webpack `extension` as long as it was defined as a function accepting an `options` object. The `extensionOptions` property is an object that contains sub-properties matching each extension to be modified - in the preceding example, `addAlias()`. The values for each sub-property can be simple objects, in which case they merge into the options object to be passed to that extension. They can also be functions, in which case they take an `options` object containing the options so far and must return a new object with any desired changes made.

#### Example

Extending the previous example with an additional alias using a simple object:

<AposCodeBlock>

```javascript
module.exports = {
// ...
webpack: {
 extensionOptions: {
   addAlias: {
       alias: {
         Data: path.resolve(process.cwd(), './lib/data')
       }
     }
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
The `bundles` option allows delivery of frontend assets to a specific page or if a widget is on a page page. The `bundles` subproperty can be present in any type of module, not just widget type and page type modules. However, configuring a bundle in a widget type or page type module is the only way to cause it to actually be loaded. If a bundle is present in another type of module, that module can contribute code to it, but it will only get loaded when also configured for at least one widget type or page type. This option takes an object containing either the JavaScript or stylesheet file names without extension as properties. These files should be located in the module's `ui/src` folder. Each property takes either an empty object or a sub-property of `templates`. The `templates` sub-property accepts an array of page template names where the content should be loaded. The `templates` feature is most often relevant for piece-page-type modules; if it is not used, it is assumed both `index` and `show` templates should load the bundle.

Multiple modules can contribute to a single bundle by using the same bundle name, and webpack will merge these files in the final build. In addition, any shared dependencies between the extra bundles and the "main" bundle built from the code found in the `ui/src/index.js` files will be resolved so that only one instance is loaded.

::: warning
While extra bundles are a great feature, when used incorrectly they make sites slower, not faster.

Always ask yourself this question: **will a typical site visitor eventually load this code?** If so, you should **leave it in the main bundle** (import it from `ui/src/index.js`). This way the frequently needed code is always loaded up front and reused by every page without an extra request to the server.

Extra bundles should **only be used if the user probably won't need them on most visits.**
:::


## Related documentation

- [Extending webpack configuration](../../guide/webpack.md)


