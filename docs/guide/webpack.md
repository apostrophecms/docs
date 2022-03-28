# Webpack

## Extending Webpack config

If you need webpack to do things that Apostrophe don't by default, but you don't want to write your own config from scratch. You can simply extend the Apostrophe one that is used to transpile code from `ui/src` folder of your modules.
For example if you want to add a new loader for a specific file type, or simply add some aliases for conveniences.

It's possible to override the webpack config from any module. You can just add a `webpack` property at module root, like so:

```javascript
module.exports = {
  // ...
  webpack: {
    extensions: {
      foo: {
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

`extensions` is an object that can take multiple extensions, why ? First, this way you can simply know what is the purpose of this extension by looking at its name. It also makes possible to override easily a previously set extension.

Imagine your module extend another that has a webpack extension, but you can't access it directly and you want to modify this extension. You will be able to do that in your module by adding an extension with the same name.

Note that, if you want to override an extension from another module, the last declared in `app.js` will take the advantage.

Example:

```javascript
{
  modules: {
    // ...
    test: {},
    'test-widget': {}
  }
}
```

In my  `test` module:

```javascript
module.exports = {
  webpack: {
    extensions: {
      addAlias: {
        resolve: {
          alias: {
            Foo: path.join(process.cwd(), 'lib/foo/')
          }
        }
      }
    }
  }
}
```

In my  `test-widget` module:

```javascript
module.exports = {
  webpack: {
    extensions: {
      addAlias: {
        resolve: {
          alias: {
            Foobar: path.join(process.cwd(), 'lib/foobar/')
          }
        }
      }
    }
  }
}
```

In this case only the alias Foobar will be available.
Of course you can add multiple extensions using different names from different modules.
They will be merged in the main webpack config using [webpack-merge](https://github.com/survivejs/webpack-merge).

:warning: It will override the main config for the whole project, not only for a specific module.

## Generating and loading extra bundles

You can also generate extra bundles that you don't want to be loaded on all pages.
For example, if a widget needs a lot of front-end javascript but is used only on one page.

It will be done in the same webpack object than for extensions.
In my `test-widget` module:

```javascript
module.exports = {
  // ...
  webpack: {
    bundles: {
      'test-bundle': {}
    }
  }
};
```

At start time, Apostrophe will look in `modules/test-widget/ui/src/test-bundle.js` and `modules/test-widget/ui/src/test-bundle.scss`. For each one, it will generate a specific bundle and load it only on pages that use this test widget.
If a file does not exist it just bundles nothing here, but will load these bundles if existing where this widget is used.

You can also use this bundle in another module if you want. Let's say we have another module `test-page`,
and we want to load this bundle only on `index` pages:


```javascript
module.export = {
  extend: '@apostrophecms/piece-page-type',
  bundles: {
    'test-bundle': {
      templates: ['index']
    }
  }
}
```

Here, the `test-bundle` will be loaded on test pages, but only on the `index` pages and not the `show` ones.
If you don't add the `templates` property, the bundle will be loaded on `index` and `show` pages.

About shared dependencies, if a bundle use the same packages than the `main` one (which is loaded everywhere), webpack won't duplicate them and they will be imported only in the `main` bundle.
