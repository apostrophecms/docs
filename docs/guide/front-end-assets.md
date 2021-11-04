# Adding front end CSS, JavaScript and other assets

ApostropheCMS approaches CSS and client-side JavaScript by trying to taking care of as much of the hard parts as possible. To that end, the developers main job is to **put their SCSS and client-side JavaScript into `ui/src/index.scss` and `ui/src/index.js` files in the relevant module**. Apostrophe will then:
  - Compile [SCSS](https://sass-lang.com/guide) from `*.scss` files to CSS
  - Optionally use Babel to automatically compile modern JavaScript into an Internet Explorer 11-compatible form
  - Interpret all `import` statements and deliver the code to browsers in one CSS and one JavaScript file, either:
    - with the editing UI if the browser is logged in, or
    - without the editing UI if logged out

## Placing client-side code

SCSS and JavaScript files need to be placed in **any module's `ui/src/index.scss` and `ui/src/index.js` files**, or files imported from them. You can put client-side code in a single module directory (e.g., using `import` statements) or spread it across many modules.

For example, if we had a global SCSS file, `site.scss`, we might create an `asset` module for this purpose and place the SCSS file at:

```
modules/asset/ui/src/index.scss
```

We would also need to activate the module in `app.js` like any other.

We could instead add code for an individual widget type as shown in the [custom widget guide](/guide/custom-widgets.md#client-side-javascript-for-widgets). That example's JavaScript code was placed at:

```
modules/collapse-widget/ui/src/index.js
```

::: tip
If you have your own build process using something like webpack or Gulp, you will want to [push the output of your process to a `ui/public` folder instead](#using-your-own-build-process).

In this case, the `assets` module may not have any additional code and even may not have an `index.js` file (though it certainly could). As long as it is instantiated in `apps.js`, the client-side assets will be found.
:::

Client side code will be recompiled **when the app starts up** or if **the build task runs**. Tools like [nodemon](https://www.npmjs.com/package/nodemon) are helpful to watch for code changes and restart the app for automatic recompiling. The CLI command to run the build task manually is `node app @apostrophecms/asset:build`.

## Executing your JavaScript code in the right order

If you spread the client-side code across modules, it will be imported in the order they are instantiated in `app.js`. For example, let's say you have JavaScript files in `modules/sing-widget/ui/src/index.js` and `modules/dance-widget/ui/src/index.js`.

The `sing-widget` sings:

```javascript
export default () => {
  // `modules/sing-widget/ui/public/singing.js
  console.log('🧑‍🎤🎶');
}
```

And the `dance-widget` dances:

```javascript
export default () => {
  // `modules/dance-widget/ui/public/dancing.js
  console.log('🕺🏻💃🏽');
}
```

If your module's configuration in `app.js` includes this:

```javascript
// app.js
'sing-widget': {},
'dance-widget': {},
```

The output will **sing** before it **dances**. If the modules are instantiated in the opposite order:

```javascript
// app.js
'dance-widget': {},
'sing-widget': {},
```

the output will **dance** before it **sings**.

::: note Why do I have to export a function?
A funny thing about JavaScript `import` statements: they don't guarantee any order in which the files are loaded. To fix that, Apostrophe requires you to export a function from each `ui/src/index.js` file so that it can call them in the order the modules are initialized.
:::

## Ordering the SCSS files

Rules found in or imported by `ui/src/index.scss` files are compiled in the order the modules are activated in `app.js`.

::: note The Boilerplate
The [Apostrophe 3 boilerplate](https://github.com/apostrophecms/a3-boilerplate/) takes advantage of `ui/src` in exactly the same way. The `asset` module contains `ui/src/index.js` and `ui/src/index.scss` files, which Apostrophe automatically discovers.
:::

## Supporting Internet Explorer 11

Internet Explorer 11 is [going away soon](https://blogs.windows.com/windowsexperience/2021/05/19/the-future-of-internet-explorer-on-windows-10-is-in-microsoft-edge/#:~:text=With%20Microsoft%20Edge%20capable%20of,certain%20versions%20of%20Windows%2010.), but for now at least some projects still require support for it.

By default, Apostrophe does *not* guarantee that code written in modern JavaScript in `ui/src/index.js` files will run in Internet Explorer 11. However, you can turn on support by setting the `es5: true` option of the `@apostrophecms/asset` module:

```js
// modules/@apostrophecms/asset/index.js
module.exports = {
  options: {
    es5: true
  }
};
```

This configures Apostrophe to compile two JavaScript bundles: one for Internet Explorer 11 users, and one for everyone else. The Internet Explorer 11 bundle contains code compiled with `babel` in order to add support for missing features, as well as polyfills for missing functions.

That makes the bundle larger, but Apostrophe serves a separate, small and fast bundle to non-IE11 users, so there is **no performance penalty** for them.

::: note Internet Explorer 11 limitations
Apostrophe uses babel's `@babel/preset-env` module to provide as much support as possible for JavaScript language features, including promises, `async/await` and more. However, Apostrophe does not provide polyfills for all browser API features, and some, such as `Observable`, cannot be implemented for Internet Explorer 11. Apostrophe also does not attempt to fix the limitations of CSS in Internet Explorer 11. And the most important limitation is that **Apostrophe's editing interface is not available in Internet Explorer 11.** You should test your sites thoroughly in all browsers you intend to support.
:::

## Using your own build process

Apostrophe's built-in `ui/src` feature is very handy, and sufficient for most sites. But if you wish to create your own build process, such as a custom webpack build that supports `jsx` files for React or `.vue` files for Vue, then you'll want to take a different path.

The basic idea is that your build process should produce just one output `.js` file, and possibly a `.css` file too. Then you can feed those into Apostrophe by creating a generic module, like `asset`, and configuring your own build process to write its output to `modules/asset/ui/public/index.js` and `modules/asset/ui/public/index.css`.

### The `ui/public` folder

`ui/public` is similar to `ui/src`, with one important difference: Apostrophe imports the code exactly "as-is." Similar like `ui/src`, a `ui/public` folder can exist in any number of modules. However unlike `ui/src` its contents are concatenated into the asset bundle that Apostrophe creates, with no compilation or interpretation of any kind. This makes it perfect for the output of your own build process.

Here's how it works in a typical project with its own build process:

- The project's JavaScript and styles are in a `src` folder at the root of the project, which always contains at least `index.js` and often `index.scss` as starting points, assuming that SCSS files are part of your build process.
- The `dev` npm script in `package.json` runs your build process. If you're using webpack, that script might compile `src/index.js` and `src/index.scss` according to the rules in `webpack.config.js`.
- At the end of the build, the bundled assets are written to `modules/asset/ui/public/sites.js`.
- Any `.js` files Apostrophe finds in the `ui/public` folder of any module are automatically included in the asset bundle served to the visitor.
- Whenever code changes are made, `nodemon` automatically restarts this cycle and refreshes the browser after a successful restart.

But you don't have to use SCSS, webpack or any other specifics mentioned here, except for pushing the output into a `ui/public` folder so that Apostrophe can find it. You can follow whatever process works best for you or your organization.

### The `public` folder

The `public` folder of each module solves a different problem from `ui/public`. While `ui/public` is for JavaScript and CSS files that should be appended as-is to Apostrophe's JavaScript and CSS bundles, usually to accommodate a custom webpack build, `public` is for files that should be **available separately.** A common example is a `.png` file to be used as a background image in CSS.

While you can place asset files in the `public` folder of the project itself, and reference them with URLs like `/images/bg.png`, this has two problems when used in stylesheets:

1. If a file is changed and the site is redeployed, users may still see the old file via their browser cache.
2. If Apostrophe has been configured to deploy CSS and JS assets to Amazon S3, Azure Cloud Storage or another CDN, `/images/bg.png` in your CSS code will not be found at all because it refers to a different host.

Files you place in the `public` subdirectory of any module are always deployed such that you can write URLs like this in your CSS or `.scss` files:

`/modules/mymodulename/images/bg.png`

Apostrophe will automatically fix these "asset paths" so they refer to the final URL of the asset, no matter what your production environment looks like.

In addition, in production deployments, the URL will always contain a "release identifier" so that any static assets in the browser cache from a previous release are not reused.

#### Asset paths in Nunjucks templates

You can also convert asset paths to URLs in a Nunjucks template by calling the `apos.asset.url` helper function, like this:

```django
{{ apos.asset.url('/modules/mymodulename/images/bg.png') }}
```

#### Asset paths in frontend JavaScript

You can obtain the URL corresponding to an asset path in frontend JavaScript using `apos.util.assetUrl`:

```javascript
apos.util.assetUrl('/modules/mymodulename/images/bg.png')
```

#### What about `extend` and `improve`?

Sometimes modules extend or improve other modules, inheriting or contributing
functionality. If both a base class module `a` and a module `b` that extends it contain
`public` folders, containing files with different names, all of them will be available via paths starting with `/modules/b`. An exception: if files provided by `a` and `b` have the same name, the version in module `b` will win. However the base class version is still available in `/modules/a`. The same logic applies when `improve` is used.


