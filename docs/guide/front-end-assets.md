---
title: "Front-end Assets"
---

# Front-end Assets

In A3 we don't impose any decisions on developers about the front end. Instead, A3 automatically imports any `.js` files in the `ui/public` folder of any module into the Apostrophe asset bundle, **without any compilation or changes.** This is tailor-made for pushing the output of your own build tool's pipeline to A3 as a final step.

## Boilerplate

The [A3 boilerplate](https://github.com/apostrophecms/a3-boilerplate/) follows our recomended strategy: 1) use webpack to build your assets, and 2) push the end result to A3's asset pipeline. However, you can follow whatever organizing pattern that works best for you or your orgnization.

**Here is how it works in our boilerplate project**:

-  The `dev` npm script in `package.json` runs project-level `webpack`, which compiles `src/index.js` according to the rules in `webpack.config.js`. If you don't like these rules you can change them.
-  `src/index.scss` (written in [Sass](https://sass-lang.com/)) is imported by `src/index.js`, allowing the browser to load just one file for both.
-  At the end of the build, the bundled assets are written to `modules/asset/ui/public/sites.js`.
-  Then the `dev` script runs A3's `@apostrophecms/asset:build` task, which compiles Apostrophe's own assets. In addition, **any `.js` files in the `ui/public` folder of any module are automatically included in the frontend build.**
- Whenever code changes are made, `nodemon` is used to automatically restart this cycle and refresh the browser after a successful restart.

::: tip Note:
While this is very flexible and particularly useful when developing Apostrophe itself or modules that add more admin UI to it, we know it's a bit slow for typical site projects. We plan to update our boilerplate to use a different strategy in which Apostrophe's own build process is not repeated each time.
:::

## Libraries

A3 includes a very small library of front-end utility code for easy implementation of widget players and communication with the Apostrophe server. As an example of the library's use, check out the official A3 video widget player [source code](https://github.com/apostrophecms/apostrophe/blob/3.0/modules/%40apostrophecms/video-widget/ui/public/video.js).

::: tip Note:
Since that player has to be compatible with any frontend build, it uses only IE11-compatible JavaScript, and passes callbacks. If your build, like the one in our boilerplate, uses `babel` or doesn't support IE11 then you may `await` the `apos.http.get` method instead.
:::
