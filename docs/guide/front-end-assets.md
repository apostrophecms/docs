# Front end CSS and JavaScript

ApostropheCMS approaches CSS and client-side JavaScript by trying to taking care of as much of the hard parts as possible. To that end, the developers main job is to **put their CSS and client-side JavaScript into `ui/public` directories**. Apostrophe will then:
  - Concatenate all CSS and JS in `ui/public` directories
  - Deliver the code to browsers in one CSS and one JavaScript file, either:
    - with the editing UI if the browser is logged in, or
    - without the editing UI if logged out

## Placing client-side code

CSS and JavaScript files need to be placed in **any module's `ui/public` directory**. You can put client-side code in a single module directory (e.g., after running your own build process) or across many modules.

For example, if we had a global CSS file, `site.css`, we might create an `assets` module for this purpose and place it at:

```
modules/assets/ui/public/site.css
```

You could instead add code for an individual widget type as shown in the [custom widget guide](/guide/custom-widgets.md#client-side-javascript-for-widgets). That example's JavaScript code was placed at:

```
modules/collapse-widget/ui/public/collapser.js
```

Regardless of the file's name, it will be included in the complete file. Apostrophe will concatenate CSS together in one file and JavaScript together in another file.

::: tip
If you have your own build process using something like webpack or Gulp you will likely end up with a single JavaScript file and and single CSS file. For the sake of code organization, it can help to output those files into a generic module such as `modules/assets` rather than one of the piece type or page type directories.

In this case, the `assets` module may not have any additional code and even may not have an `index.js` file (though it certainly could). As long as it is instantiated in `apps.js`, the client-side assets will be found.
:::

Client side code will be recompiled **when the app starts up** or if **the build task runs**. Tools like [nodemon](https://www.npmjs.com/package/nodemon) are helpful to watch for code changes and restart the app for automatic recompiling. The CLI command to run the build task manually is `node app @apostrophecms/asset:build`.

## Ordering the output files

If you spread the client-side code across modules it will be concatenated in the order they are instantiated in `app.js`. For example, let's say you have JavaScript files in `modules/sing-widget/ui/public` and `modules/dance-widget/ui/public`.

The `sing-widget` sings:

```javascript
// `modules/sing-widget/ui/public/singing.js
console.log('🧑‍🎤🎶');
```

And the `dance-widget` dances:

```javascript
// `modules/dance-widget/ui/public/dancing.js
console.log('🕺🏻💃🏽');
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

::: note The Boilerplate
The [Apostrophe 3 boilerplate](https://github.com/apostrophecms/a3-boilerplate/) follows our recommended strategy:
1. use webpack to build your assets
2. push the end result to A3's asset pipeline

**Here is how development works using our boilerplate project**:

-  The `dev` npm script in `package.json` runs a project-level webpack build, which compiles `src/index.js` according to the rules in `webpack.config.js`.
-  `src/index.scss` (written in [Sass](https://sass-lang.com/)) is imported by `src/index.js`, allowing the browser to load one file for both CSS and JS.
-  At the end of the build, the bundled assets are written to `modules/asset/ui/public/sites.js`.
- Any `.js` files in the `ui/public` folder of any module are automatically included in the frontend build.
- Whenever code changes are made, `nodemon` automatically restarts this cycle and refresh the browser after a successful restart.

None of those specifics are required for Apostrophe. You can follow whatever organizing pattern works best for you or your organization.
:::
