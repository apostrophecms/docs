# Webpack

Apostrophe automatically provides a [webpack](https://webpack.js.org/)-powered build process for our frontend JavaScript and SCSS. Most of the time we don't have to think about this. As long as we [follow the documentation](front-end-assets.md) Apostrophe will take care of it for us.

However, sometimes we want to extend the way webpack processes our frontend code, specifically in two ways:

* By changing webpack's rules (the webpack configuration) via "extensions," or
* By breaking up the bundle into two or more files, to be loaded only on pages that really require them ("extra bundles").

This guide covers how to address both situations.

## Extending Webpack configuration

If you need webpack to do things that Apostrophe doesn't do by default, you can extend Apostrophe's webpack configuration to change the way code in `ui/src` is compiled.

Why might you want to do this? perhaps you want to add a new loader for a specific file type, such as `.jsx`. Or perhaps you want to add aliases to load imported modules from a nonstandard location.

It's possible to extend the webpack config from any module. To do so add a `webpack` property at module root, like so:

<AposCodeBlock>
  ```javascript
    module.exports = {
      // ...
      webpack: {
        extensions: {
          utilsAlias: {
            resolve: {
              alias: {
                'Utils': path.join(process.cwd(), 'lib/utils/')
              }
            }
          }
        }
      }
    };
  ```
  <template v-slot:caption>
    modules/my-module/index.js
  </template>
</AposCodeBlock>

Note that `extensions` is an object with named sub-properties. Each one is separately merged with the webpack configuration.

::: note
Everything inside `utilsAlias` in the above example is merged with the webpack configuration. It is not specific to Apostrophe. If you are not familiar with webpack configuration, see the [webpack configuration documentation](https://webpack.js.org/configuration/).
:::

::: warning
Any extensions you make to webpack apply to all files compiled as part of Apostrophe's public build (anything coming from `ui/src` folders). Take care not to break reasonable assumptions made by other developers. For example, adding custom aliases and loaders for new file extensions is OK. Changing `.js` files to only compile if they are valid TypeScript would not be OK and you can expect it to break other modules in your project.

The Apostrophe admin UI, on the other hand, is not affected by what you do here. That webpack build is separate.
:::

### Overriding other extensions

Why do the extensions have names? First, this way you can know the purpose of the extension at a glance. Second, this permits another module to override a previous extension by using the same name. In such a case, the last configured module wins.

Imagine your project contains a module you cannot modify which extends webpack in a way that doesn't work for your needs. You can override it in your own module by adding an extension with the same name.

Example:

<AposCodeBlock>
  ```javascript
  {
    modules: {
      // ...
      'test-1': {},
      'test-2': {}
    }
  }
  ```
  <template v-slot:caption>
    app.js
  </template>
</AposCodeBlock>

<AposCodeBlock>
  ```javascript
  module.exports = {
    webpack: {
      extensions: {
        addAlias: {
          resolve: {
            alias: {
              Special: path.join(process.cwd(), 'lib/original/')
            }
          }
        }
      }
    }
  }
  ```
  <template v-slot:caption>
    modules/test-1/index.js
  </template>
</AposCodeBlock>

<AposCodeBlock>
  ```javascript
  module.exports = {
    webpack: {
      extensions: {
        addAlias: {
          resolve: {
            alias: {
              Special: path.join(process.cwd(), 'lib/different/')
            }
          }
        }
      }
    }
  }
  ```
  <template v-slot:caption>
    modules/test-2/index.js
  </template>
</AposCodeBlock>

Because the two extensions have the same name (`addAlias`) and the `test-2` module is configured last, import paths starting with `Special/` will point to `lib/different/` and not to `lib/original/`.

By contrast, if you use different extension names, two separate modules can contribute their own aliases. This works because they are automatically merged together with the main webpack configuration using [webpack-merge](https://github.com/survivejs/webpack-merge).

## Extra bundles

If you have large amounts of frontend JavaScript that are specific to just one page or widget, you can generate "extra bundles" to be loaded only when those pages or widgets are present. For example, a widget that doesn't appear on most pages might require a large and complicated [player function](custom-widgets.md#client-side-javascript-for-widgets) with many imports of its own.

::: warning
While extra bundles are a great feature, when used incorrectly they make sites slower, not faster.

Always ask yourself this question: **will a typical site visitor eventually load this code?** If so, you should **leave it in the main bundle** (import it from `ui/src/index.js`). This way the frequently needed code is always loaded up front and reused by every page without an extra request to the server.

Extra bundles should **only be used if the user probably won't need them on most visits.**
:::

### Extra bundles for widgets

We can contribute code to a new, named bundle by adding a `bundles` sub-section to `webpack` in any module. In this case we'll look at a module that implements a widget type called `test`:

<AposCodeBlock>
```javascript
  module.exports = {
    extend: '@apostrophecms/widget-type',
    webpack: {
      bundles: {
        'test': {}
      }
    }
  };
  ```
  <template v-slot:caption>
    modules/test-widget/index.js
  </template>
</AposCodeBlock>

Because we did this in a module that extends `@apostrophecms/widget-type`, Apostrophe  loads the bundle automatically on all pages that contain this particular widget.

### Where do I put my frontend code for the bundle?

Just like the main bundle, code for extra bundles lives in the `ui/src` subdirectory of your module. However rather than placing it in `ui/src/index.js` you will place it in `ui/src/bundlename.js`, where `bundlename` matches the name of your bundle. In the example above, it would be `ui/src/test.js`. That file might look like:

<AposCodeBlock>
```javascript
import { bigThing } from 'big-package';

export default () => {
  apos.util.widgetPlayers.test = {
    selector: '[data-test]',
    player: function (el) {
      // ... use bigThing here
    }
  };
};
```
  <template v-slot:caption>
    modules/test-widget/ui/src/test.js
  </template>
</AposCodeBlock>

For completeness, we can also deliver stylesheets specific to this bundle in a `ui/src/test.scss` file. However it is usually more efficient to combine all styles in the main bundle.

::: note
Just like `ui/src/index.js`, `ui/src/test.js` must export a function. The exported functions are called in the order the modules that contribute to that bundle are configured in the project.
:::

### Extra bundles for page types

Let's say we have another bundle, `about-page`, and we want to load an extra bundle just on that particular page type. We can do it like this:

<AposCodeBlock>
  ```javascript
    module.exports = {
      extend: '@apostrophecms/page-type',
      bundles: {
        'about': {}
      }
    }
  ```
  <template v-slot:caption>
    modules/about-page/index.js
  </template>
</AposCodeBlock>

Since we named the bundle `about`, we should place our frontend code in the `ui/src/about.js` file of the `about-page` module.

### Extra bundles for piece page types

Now let's say we have a piece page type, `product-page`. this module extends `@apostrophecms/piece-page-type`, which has separate `index` and `show` templates (see [piece pages](piece-pages.md)). In this case, we want the `product` bundle to be loaded on the `index` pages but not on the `show` pages for individual pieces.

We can accomplish that with the `templates` sub-property:

<AposCodeBlock>
  ```javascript
    module.exports = {
      extend: '@apostrophecms/piece-page-type',
      bundles: {
        'product': {
          templates: [ 'index' ]
        }
      }
    }
  ```
  <template v-slot:caption>
    modules/product-page/index.js
  </template>
</AposCodeBlock>

Configuring `templates` is not mandatory. If we don't add the `templates` property, the bundle will be loaded on both `index` and `show` pages, which is often useful.

### Bundles can receive contributions from many modules

Note that since bundles have their own names, **any module can contribute to any bundle.** This includes support for multiple contributions to the same bundle from unrelated modules, and from "base class" modules like `@apostrophecms/piece-type`. This is deliberate because it helps us create a small number of bundles for more efficient page loading. Functionality that is usually found on the same page should be part of the same bundle.

### Shared dependencies

If a custom bundle imports packages that are also imported by the "main" bundle (the one created by `ui/src/index.js` files), those packages are only loaded once but are available to both bundles. This saves time loading the page. Dependencies that are imported by two separate *extra** bundles might be included twice, which should not impact functionality but can add to page load time.

### Deployment

Apostrophe will take care of deploying the output files of custom bundles alongside those generated by the main bundle. Apostrophe will also generate the needed `script` and `link` tags automatically.
