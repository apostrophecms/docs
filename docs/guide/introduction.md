# Introduction

## What is ApostropheCMS?

ApostropheCMS is a modern, open source, content management system. It's Javascript from front to back, with a Vue.js user interface and Node.js on the server. Importantly, it has everything you might want from a modern CMS, including:

- a headless API built-in
- a content schema API to easily create any kind of content types you need
- extensibility through a module ecosystem
- a great UI for creating content, including in-context editing
- robust localization to support any number of language or locale content variations

For developers, it offers a site building API that gives you the power to fully customize the website experience without needing to be a Node.js expert. For content editors, the _true_ WYSIWYG experience supports improved editorial flow.

In short, it recognizes pain points on both sides of the CMS experience and relieves them.

## The module system

As you learn to use ApostropheCMS, you'll quickly see how all server-side code is organized in a system of "modules." Modules are the building blocks we use to build Apostrophe projects — as well as the CMS itself.

Each module defines a specific set of functionality, from governing the database connection to setting the fields in a blog post. Common Apostrophe project modules will define custom content types, page types, or editable widget types.

All modules use [the same API](/reference/module-api/). That shared foundation means that you can give your blog post module powerful features, such as custom command line tasks and API routes. It's the same foundation the core team uses to build the CMS, so it is well tested and designed to be as intuitive as possible.

### Setting up a module

Modules are organized in a folder at the root of a project appropriately named `modules`. Each module gets its own directory inside that with an `index.js` file that contains its configurations. So the blog post code would being in the file:

```
modules/blog-post/index.js
```

The module code itself would then be defined in an object, assigned to `module.exports`. This may look familiar if you know [CommonJS](https://nodejs.org/api/modules.html#modules_modules_commonjs_modules) patterns.

```javascript
// modules/blog-post/index.js
module.exports = {
  // ...
}
```

The final step to this minimalist module example is to tell Apostrophe that it should be turned on, or instantiated. That is done in the main application file, `app.js` in its own `modules` property.

```js
// app.js
require('apostrophe')({
  modules: {
    'blog-post': {}
  }
});
```

There is more to do to make modules useful, but that is all it takes to get them running.

### Module inheritance

Inheritance is the glue of the module system. Every module, other than the root module, extends another one. This means that your blog post module, which extends the "piece type" module, has a huge set of features you never have to write.

```javascript
// modules/blog-post/index.js
module.exports = {
  extend: '@apostrophecms/piece-type'
};
```

More than that, it means you can easily customize that "piece type" module in your project. You will see those changes not only in your blog post content type, but also in every other module that shares the same parent.

The rest of the documentation will include many specific, practical examples of these ideas. For now a couple of main takeaways are:
  - The module API supports a consistent code structure regardless of the module's functionality
  - It is easy to extend another module to use a variety of built-in features

## MOAR
- Altering options and behavior of installed and core modules (create an index.js in project)

::: tip
Breaking up modules into multiple files
:::

## Content schemas

Nulla vitae elit libero, a pharetra augue. Nullam quis risus eget urna mollis ornare vel eu leo. Maecenas sed diam eget risus varius blandit sit amet non magna. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
