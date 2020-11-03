## Front End Assets

We know that most Apostrophe developers choose to use their own webpack pipeline for frontend assets. So in Apostrophe 3 we don't impose any decisions on you about the front end. Instead, Apostrophe automatically imports **any .js files in the `ui/public` folder of any module** into its own asset bundle, **without any compilation or changes.** This is tailor-made for pushing the output of your own webpack pipeline to Apostrophe as a final step.

So the boilerplate project discussed in this document follows our recomended strategy: **use webpack to build your assets, and push the end result to Apostrophe's own asset pipeline.** However, you can follow whatever organizing pattern that works best for you or your team. You could, for instance, override the `extraHead` nunjucks block to push your own `script` and `link` tags in development.

Here is how it works in our boilerplate project:

-  The `dev` task in `package.json` runs `webpack`, which compiles `src/index.js` according to the rules in `webpack.config.js`. If you don't like these rules you can change them.
-  `src/index.scss` (written in [SASS](https://sass-lang.com/)) is imported by `src/index.js`, allowing the browser to load just one file for both.
-  At the end of the build, the bundled assets are written to `modules/asset/ui/public/sites.js`.
-  Then the `dev` task runs the `@apostrophecms/asset:build` task, which compiles Apostrophe's own assets. In addition, **any `.js` files in the `ui/public` folder of any module are automatically included in the frontend build.**
- Whenever code changes are made, `nodemon` is used to automatically restart this cycle and load the page after a successful restart.

::: tip Note:
While this is very flexible and particularly useful when developing Apostrophe itself or modules that add more admin UI to it, we know it's a bit slow for typical site projects. We plan to update our boilerplate to use a different strategy in which Apostrophe's own build process is not repeated each time.
:::

## Front End Library

A3 includes a very small library of front end utility code for easy implementation of widget players and communication with the Apostrophe server. As an example of the library's use, check out the official [A3 video widget player source code](https://github.com/apostrophecms/apostrophe/blob/3.0/modules/%40apostrophecms/util/ui/public/video.js).

> Since that player has to be compatible with any frontend build, it uses only IE11-compatible JavaScript, and passes callbacks. If your build, like the one in our boilerplate, uses `babel` or doesn't support IE11 then you may `await` the `apos.http.get` method instead.