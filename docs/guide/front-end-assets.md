---
title: "Front end code"
---

# Front end code: CSS and Javascript

Apostrophe's main goals regarding CSS and client-side Javascript are:

1. Make it easy for developers to get code into the browser
2. Support whatever process a developer may use



## Delivering CSS and Javascript to the browser

There are two steps to delivering client-side CSS and Javascript in Apostrophe:

1. **Place files in the proper directories**
2. **Run the build task before starting up**

By doing these two things, Apostrophe will:

- Concatenate CSS files together and Javascript files together, delivering each to the client
- Include code for the editing UI *only for logged in users*
- *NOT* alter the project-level CSS or Javascript (e.g., processing SCSS, compiling with Babel)

### Placing client-side code

CSS and Javascript files need to be placed in **any module's `ui/public` directory** so Apostrophe's build process can find them. You can put client-side code in a single module directory (e.g., after running your own build process) or across many modules.

For example, if we had a global CSS file, `site.css`, we could place it at:

```
modules/assets/ui/public/site.css
```

Similarly, you could add Javascript for an individual widget type as shown in the [custom widget guide](/guide/areas-and-widgets/custom-widgets.md#client-side-javascript-for-widgets). That example's code was placed at:

```
modules/collapse-widget/ui/public/collapser.js
```

Regardless of the file's name, it will be included in the complete file.

::: tip
If you have your own build process using something like webpack or Gulp you will likely end up with a single Javascript file and and single CSS file. For the sake of code organization, it can help to output those files into a generic module such as `modules/assets` rather than one of the piece type or page type directories.

In this case, the `assets` module may not have any additional code and even may not have an `index.js` file (though it certainly could). As long as it is instantiated in `apps.js` the client-side assets will be found.
:::

### Running the build task

Once the Javascript and CSS files are place in the `ui/public` directories, you will need to run the command line build task to concatenate the code. From the project root, run:

```
node app @apostrophecms/asset:build
```

It can be helpful to alias this in a `package.json` script for easy use.

```json
  "scripts": {
    "build": "node app @apostrophecms/asset:build",
    "start": "node app"
  },
```

See the official project boilerplate for [an example of combining the build task with a webpack build](https://github.com/apostrophecms/a3-boilerplate/blob/main/package.json) as well as [Nodemon](https://nodemon.io/).

### Ordering the output file

If you spread the client-side code across modules it will be concatenated in the order they are instantiated in `app.js`. For example, let's say you have Javascripts files in `modules/sing-widget/ui/public` and `modules/dance-widget/ui/public`.

The `sing-widget` sings:

```javascript
// `modules/sing-widget/ui/public/singing.js
console.log('🧑‍🎤🎶');
```

And the `dance-widget` dances:

```javascript
// `modules/dance-widget/ui/public/dancing.js
console.log('🕺🏻💃🏾');
```

If your modules configuration in `app.js` includes this:

```javascript
  'sing-widget': {},
  'dance-widget': {},
```

The output will **sing** before it **dances**. If the modules are instantiated in the opposite order:

```javascript
  'dance-widget': {},
  'sing-widget': {},
```

the output will **dance** before it **sings**.

## Boilerplate

The [A3 boilerplate](https://github.com/apostrophecms/a3-boilerplate/) follows our recommended strategy: 1) use webpack to build your assets, and 2) push the end result to A3's asset pipeline. However, you can follow whatever organizing pattern that works best for you or your organization.

**Here is how it works in our boilerplate project**:

-  The `dev` npm script in `package.json` runs project-level `webpack`, which compiles `src/index.js` according to the rules in `webpack.config.js`. If you don't like these rules you can change them.
-  `src/index.scss` (written in [Sass](https://sass-lang.com/)) is imported by `src/index.js`, allowing the browser to load just one file for both.
-  At the end of the build, the bundled assets are written to `modules/asset/ui/public/sites.js`.
-  Then the `dev` script runs A3's `@apostrophecms/asset:build` task, which compiles Apostrophe's own assets. In addition, **any `.js` files in the `ui/public` folder of any module are automatically included in the frontend build.**
- Whenever code changes are made, `nodemon` is used to automatically restart this cycle and refresh the browser after a successful restart.

::: tip Note:
While this is very flexible and particularly useful when developing Apostrophe itself or modules that add more admin UI to it, we know it's a bit slow for typical site projects. We plan to update our boilerplate to use a different strategy in which Apostrophe's own build process is not repeated each time.
:::

## Front end helpers

A3 includes a very small library of front-end utility code for easy implementation of widget players and communication with the Apostrophe server. As an example of the library's use, check out the official A3 video widget player [source code](https://github.com/apostrophecms/apostrophe/blob/3.0/modules/%40apostrophecms/video-widget/ui/public/video.js).

::: tip Note:
Since that player has to be compatible with any frontend build, it uses only IE11-compatible JavaScript, and passes callbacks. If your build, like the one in our boilerplate, uses `babel` or doesn't support IE11 then you may `await` the `apos.http.get` method instead.
:::
