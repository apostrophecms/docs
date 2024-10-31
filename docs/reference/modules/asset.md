---
extends: '@apostrophecms/module'
---

# `@apostrophecms/asset`

**Alias:** `apos.asset`

<AposRefExtends :module="$frontmatter.extends" />

The `asset` module serves to organize, process, and output all project JavaScript and CSS assets during the build process. It also passes options for display of different breakpoints during development, accomplished by converting CSS assets to container queries. In addition, it provides access to modify the project webpack configuration and exposes two CLI tasks for project building and webpack cache clearing. Options are passed through the creation of a `modules/@apostrophecms/asset/index.js` file.

## Options

|  Property | Type | Description | Configuration Location |
|---|---|---|---|
| [`refreshOnRestart`](#refreshonrestart) | Boolean | If set to `true`, the browser will refresh on Apostrophe app restart. | Both `app.js` and module `index.js` |
| [`watch`](#watch) | Boolean | If set to `false`, none of the UI assets will be watched to trigger a restart. | Both `app.js` and module `index.js` |
| `watchDebounceMs` | Integer | Time in milliseconds to wait before re-triggering a restart on asset change. | Both `app.js` and module index |
| [`uploadfs`](#uploadfs) | Object | Can be used to configure an `uploadfs` instance. | Both `app.js` and module `index.js` |
| [devSourceMap](#devsourcemap) | String or false | Overrides the devtool setting of webpack for the admin UI build. | Both `app.js` and module `index.js` |
| [`rebundleModules`](#rebundlemodules) | Object | Used to direct project wide asset files into new bundles. | Both `app.js` and module `index.js` |
| [`breakpointPreviewMode`](#breakpointPreviewMode) | object | Enables and sets screen sizes for mobile preview. | Both `app.js` and module `index.js` |
| [`hmr`](#hmr) | String or Boolean | Controls Hot Module Replacement mode. Values: `'public'` (default), `'apos'`, or `false` | `app.js` only |
| [`hmrPort`](#hmrport) | Number | Sets custom WebSocket server port for HMR. Defaults to ApostropheCMS server port. | `app.js` only |
| [`productionSourceMaps`](#productionsourcemaps) | Boolean | If `true`, includes source maps in production builds. | `app.js` only |

### `refreshOnRestart`

By default, `refreshOnRestart` is set to `false`. If this option has a falsy value, the browser will not automatically refresh following app restart.  If this option is truthy and `process.env.NODE_ENV` is not set to `production`, then restart of the Apostrophe app will trigger a browser refresh. This is very useful in combination with `nodemon` to deliver file changes to the browser.

### `watch`

By default, `watch` is set to `true`. A truthy value will cause the application to monitor for changes in any of the asset bundles in the `modules` and `node_modules` folders and trigger a webpack rebuild and browser refresh. A value of `false` will disable this behavior. Note that this option is disabled and has no impact if `process.env.NODE_ENV` is set to `production`.

### `uploadfs`

When the `APOS_UPLOADFS_ASSETS` environment variable is present, this optional property can be used to configure an `uploadfs` instance that differs from the one configured by the `attachment` module, allowing changes in where assets from the webpack build process are stored and how they are served. Full documentation for uploadfs can be found [here](https://www.npmjs.com/package/uploadfs).

### `devSourceMap`

::: warning Deprecated
This option only applies when using webpack as your bundler. Source maps in development are automatically handled by Vite and cannot be configured. However, when using Vite you can elect to use the `productionSourceMaps` option to turn on the creation of production sourcemaps.
:::

For those who are familiar with webpack's `devtool` setting. This option can be used to override that setting when in a development environment. The default is to use `eval-source-map`, unless `@apostrophecms/security-headers` is active, in which case `false` is used to avoid a Content Security Policy error.

In our experience, settings other than `eval-source-map` result in associating errors with the wrong source file, but webpack experts are welcome to experiment.

A source map is not produced at all in a production or production-like environment.

This option currently applies only to the admin UI build, not the `ui/src` build.

### `rebundleModules`

The `rebundleModules` option allows for overridding the `bundles` properties passed into webpack at the individual module level, including modules added through npm. This option takes an object with module names, or module names with a suffix made up of a `:` and bundle name, as properties. This property designates rebundling of either all the code in the former case, or a single named bundle in the later.

Each property takes a string value, indicating the name of the new bundle for the assets. This allows rebundling of code that used to go to a specific bundle from a particular module. Or, you can rebundle all the code from that module. Bundles from multiple modules can be rebundled into the same new end bundle.

#### Example

<AposCodeBlock>

``` js
module.exports = {
  options: {
    rebundleModules: {
      // Everything from the fancy-form module should go in the regular "main" bundle
      'fancy-form': 'main',
      // Everything from the basic-product module should go in the "secondary" bundle
      'basic-product': 'secondary',
      // Code originally designated as part of the `form` bundle from 
      // the @dcad/form module should be retargeted to the"secondary" bundle
      // but only that code, leave ui/src/index.js in the main bundle
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

Bundles in Vite can be controlled through the configuration options.

### hmr
Hot Module Replacement (HMR) automatically updates your browser when you make changes to your code, without requiring a full page refresh. The `hmr` option controls which parts of your application use this feature:

```javascript
// in app.js
modules: {
  '@apostrophecms/asset': {
    options: {
      hmr: 'public'
    }
  }
}
```

- `'public'` (default): Enables HMR for your project's UI code, including any custom components, stylesheets, and client-side JavaScript in your project's modules.
- `'apos'`: Enables HMR for the ApostropheCMS admin UI, useful when developing admin UI modifications or custom admin components.
- `false`: Disables HMR completely, requiring manual page refreshes to see changes.

### hmrPort
Sets a custom port for the WebSocket server that handles HMR communications. By default, it uses your ApostropheCMS server port:

```javascript
modules: {
  '@apostrophecms/asset': {
    options: {
      hmrPort: 3001
    }
  }
}
```

You typically only need to set this if you're running behind a proxy or have port conflicts.

### `productionSourceMaps`

Controls source map generation in production builds. This option replaces the previous webpack-specific devSourceMap option. You cannot use both devSourceMap and productionSourceMaps as they belong to different bundling systems. With the move from webpack to Vite, source map handling has been simplified:

- In development, Vite automatically provides high-quality source maps that work well with browser dev tools. Unlike webpack's `devtool` setting, this behavior is optimized by default and cannot be configured.

- For production, source maps are disabled by default to minimize build size. Setting `productionSourceMaps: true` will include them in the production build:

```javascript
modules: {
  '@apostrophecms/asset': {
    options: {
      productionSourceMaps: true
    }
  }
}
```

This option applies to both admin UI and project UI builds, providing better debugging capabilities across your entire application compared to webpack's admin-UI-only source maps.

::: tip
Source maps in production will increase your build size but can be invaluable for debugging production issues. Consider your specific needs and deployment constraints when enabling this option.
:::

### `breakpointPreviewMode`
The `breakpointPreviewMode` is enabled by default and adds shortcut icons plus a dropdown menu to the admin-bar for each of the breakpoints specified in the `screens` object. If only breakpoints with `shortcut: true` are present then the dropdown menu will not be added, only the icons. Clicking on an icon or making a selection from the dropdown menu will cause the markup to display as a CSS container of the specified dimensions. Any styling assets handled by the apostrophe build process added through a [`ui/src/index.scss` file of any module](/guide/front-end-assets.html#placing-client-side-code) will be transpiled and applied as container queries in this display. This is for preview purposes only, the project styling assets will not be directly altered. Any CSS breakpoint styling added through `<style>` blocks in the template will not change in response to the altered display size. There are also some standard CSS breakpoint declarations that cannot be directly converted into container queries, particularly those targeting the viewport height or those relying on global viewport conditions. You will receive console notifications when declarations that can't be converted are encountered if the `debug` property is set to `true`. These exceptions can potentially be handled using the [`transform` property](#transform) as detailed.

#### `breakpointPreviewMode` properties

| Property | Type | Description |
|---|---|---|
| `enabled` | boolean | Set to `true` by default, set to `false` to remove breakpoints to the admin-bar |
| `debug` | boolean | Set to `false` by default, set to `true` to get notifications about CSS declarations that can't be converted to container queries. |
| `resizeable` | boolean | Set to `false` by default, set to true to allow breakpoint displays to be resized by dragging the lower right corner. |
| [`screens`](#screens) | object | Takes an object with properties for each breakpoint to be enabled. |
| [`transform`](#transform) | null \|\| function | Alters the default conversion of CSS queries to container queries for compatibility. |

Below are the default settings for the `breakpointPreviewMode` option:

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    breakpointPreviewMode: {
      // Enable breakpoint preview mode
      enable: true,
      // Warn during build about unsupported media queries.
      debug: false,
      // Screens with icons
      // For adding icons, please refer to the icons documentation
      // https://docs.apostrophecms.org/reference/module-api/module-overview.html#icons
      screens: {
        desktop: {
          label: 'apostrophe:breakpointPreviewDesktop',
          width: '1440px',
          height: '900px',
          icon: 'monitor-icon',
          shortcut: true
        },
        tablet: {
          label: 'apostrophe:breakpointPreviewTablet',
          width: '1024px',
          height: '768px',
          icon: 'tablet-icon',
          shortcut: true
        },
        mobile: {
          label: 'apostrophe:breakpointPreviewMobile',
          width: '414px',
          height: '896px',
          icon: 'cellphone-icon',
          shortcut: true
        }
      },
      // Transform method used on media feature
      // Can be either:
      // - (mediaFeature) => { return mediaFeature.replaceAll('xx', 'yy'); }
      // - null
      transform: null
    }
  }
};
```
<template v-slot:caption>
modules/@apostrophecms/asset/index.js
</template>
</AposCodeBlock>

::: warning
Adding a `breakpointPreviewMode` option at project level to add additional breakpoint sizes, for example, will replace *all* default values. This means that you must pass `enable: true` in the project level `@apostrophecms/asset/index.js` file to have breakpoints displayed if you want to change screen sizes.
:::

##### `screens`
The `screens` object takes a property for each desired breakpoint. Those properties take an object composed of two required and three optional properties. Adding this property at project-level will override the default `screens` object. The `label` property is optional, but highly recommended, and takes a string that is displayed to the user when they hover over the icon for the breakpoint and as a label in the dropdown menu. The `shortcut` property takes a boolean and will add the breakpoint to the set of icons displayed to the left of the dropdown. The `icon` property is optional for non-shortcut breakpoints. It takes the name of a [registered icon](/reference/module-api/module-overview.md#icons) that is displayed in the admin-bar for toggling the breakpoint display. The final two properties, `width` and `height`, are required. These should be set to the `px` dimensions of the emulated device. Note that the mobile preview feature doesn't support device pixel-ratios or resolution. You can switch between preview modes by clicking other breakpoint shortcut icons or making a selection from the dropdown menu. Clicking on any active icon or the `X` to the right of the dropdown will exit out of preview mode.

##### `transform`
By default, the `transform` property will be set to `null` and accept the built-in transpiling of standard CSS queries into container queries. However, in cases where the standard queries can't be transpiled or the standard method needs adjustment you can pass the existing standard query to a function to provide a customized return.

For example, your media query might use widths based on `em` and the final layout is better reflected by converting those to `px` values:

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    breakpointPreviewMode: {
      enable: true,
      screens: {
        ...
      },
      transform: (mediaFeature) => {
        // Convert `min-width` and `max-width` from `em` to `px`, assuming 1em = 16px
        return mediaFeature.replace(/(\d+)em/g, (match, emValue) => {
          const pxValue = parseInt(emValue) * 16; // Convert em to px assuming a 16px base font size
          return `${pxValue}px`;
        });
      }
    }
  }
};
```
<template v-slot:caption>
modules/@apostrophecms/asset/index.js
</template>

</AposCodeBlock>

This will take a media query like:
```css
@media (min-width: 30em) and (max-width: 50em) {
  /*...*/
}
```
and convert it to:
```css
@media (min-width: 480px) and (max-width: 800px) {
  /*...*/
}
```

## Command Line Tasks

### `build`
The build command triggers the compilation, processing, and output of files within the `ui/apos`  and `ui/src` folders of each module. Logged-in users will receive assets from both folders, while logged-out users will only receive the later. You don't need this task in a development environment, it runs automatically when you start your app. It is necessary in a production environment.

Assets within the `ui/apos` folder modify the admin UI. Code to be passed to the build process should be organized into three subfolders, a `components` folder that contains any new Vue components, an `apps` folder that takes any additional admin-facing JavaScript, and a `tiptap-extensions` folder that contains any tiptap-extensions used within the admin UI.

During the build process, code located in the `ui/apos` subdirectory of any module is automatically detected and incorporated. Assets in the `components` folder are registered automatically by name as Vue components and do not need to be imported.

Unlike assets in the `ui/src` folder where only the `index.js` file is an entry point, all files in the `ui/apos/apps` folder are entry points. If this behavior is undesirable any files that should not be entry points can be placed into a sub-directory and imported into the main entry point file. See the [`@apostrophecms/login` module](https://github.com/apostrophecms/apostrophe/tree/main/modules/%40apostrophecms/login) for an example, including import of the Vue library within the [`AposLogin.js` file](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/login/ui/apos/apps/AposLogin.js). Customizing the admin UI is covered in-depth in the [guide documentation](https://docs.apostrophecms.org/guide/custom-ui.html#customizing-the-user-interface).

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

### `reset`
The `reset` task provides a more comprehensive cleanup than `clear-cache` by removing build artifacts, clearing the `public/apos-frontend` directory (without affecting releases), and emptying the cache. This is useful when you need a complete reset of your asset build system or when troubleshooting build-related issues.

#### Example

<AposCodeBlock>

```sh
node app @apostrophecms/asset:reset
```
</AposCodeBlock>

The key differences between `reset` and `clear-cache` are:
- `reset` removes all build artifacts in addition to clearing the cache - located by default at `data/temp/webpack-cache`
- `reset` empties the `public/apos-frontend` folder (excluding releases)
- `reset` provides a more thorough cleanup of the asset build system

You might need to use this task when:
- Making significant changes to your webpack of Vite configuration
- Troubleshooting persistent build issues
- Wanting to ensure a completely clean state for your asset build system

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


