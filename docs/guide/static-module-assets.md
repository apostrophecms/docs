# Using static module assets

While developers can place static files in the top-level `/public` folder of the project, which allows a file like `/public/images/bg.png` to be accessed via the URL `https://example.com/images/bg.png`, this isn't a good solution for some situations. One issue is that the URL does not change with each new deployment, so if `bg.png` has been changed a stale version may be served by the browser's cache.

Another issue is that those who configure Apostrophe to copy CSS and JS assets to Amazon S3 and other CDNs will discover that code like `url("/images/bg.png")` no longer works, because the static asset files are not on the same host with the CSS code. This can be worked around with absolute URLs, but this gives up some of the benefit of using a CDN.

Apostrophe offers a solution to this problem: each module folder can have its own `public` subdirectory (e.g., `/modules/article/public`). Any static assets in a module's public subdirectory are *copied to the same release location* where the CSS and JS bundles are deployed, regardless of whether that is on the server's hard drive, in S3, or some third location.

::: info
The `public` folder of each module solves a different problem from [`ui/public`](/guide/front-end-assets.md#the-ui-public-folder). While `ui/public` is for JavaScript and CSS files that should be appended as-is to Apostrophe's JavaScript and CSS bundles, usually to accommodate a custom webpack build, `public` is for files that should be **available separately.** A common example is a `.png` file to be used as a background image in CSS.
:::

## Automatic asset path correction in stylesheets

Files we place in the `public` subdirectory of any module are always deployed such that we can write URLs like this in our CSS or SCSS files:

`/modules/custom-module/images/bg.png`

Apostrophe will automatically fix these "asset paths" so they refer to the final URL of the asset, *no matter what our production environment looks like.* In addition, in production deployments, the final URL will always contain a "release identifier" so that any static assets in the browser cache from a previous release are not reused.

::: warning
If you are configuring an Apostrophe core module or other module installed via npm, and you choose to add a `public` subdirectory for that module at project level, you will need to prefix the module name with `my-` when creating asset URLs to those assets.

Note that the `my-` prefix goes in the module name part, not the organization name part. For example, if you have a `modules/@apostrophecms/asset/public/example.svg` file, you can access that via CSS or via the methods given below as `/modules/@apostrophecms/my-asset/example.svg`.

This distinguishes your `public` folder from any assets that might be provided by the original npm module.

It's usually simpler to just put your public assets in a module specific to your project, rather than a project-level configuration of a core one.
:::

## Asset paths in Nunjucks templates

In Nunjucks templates we can convert asset paths to URs by calling the `apos.asset.url` helper function. Again, the rendered template will include the complete asset URL:

``` njk
{{ apos.asset.url('/modules/custom-module/images/bg.png') }}
```

## Asset paths in front end JavaScript

Finally, we can obtain the URL corresponding to an asset path in front end JavaScript using `apos.util.assetUrl`:

```javascript
apos.util.assetUrl('/modules/custom-module/images/bg.png')
```

## What about `extend` and `improve`?

Sometimes modules extend or improve other modules, inheriting or contributing functionality. If both a base class module `a` and a module `b` that extends it contain `public` folders, all files with unique file names will be available via paths starting with `/modules/b`. If files provided by `a` and `b` have the same name, the version in module `b` will take precedence in `/modules/b`. However the base class version is still available in `/modules/a`. The same logic applies when `improve` is used.

