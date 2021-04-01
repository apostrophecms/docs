---
title: "Code organization"
---

# Code organization with modules

Apostrophe code is organized in a system of modules. Modules are the building blocks we use to build Apostrophe projects — as well as the CMS itself.

Each module defines a specific set of functionality, from configuring blog post fields to governing internationalization. Common Apostrophe project modules will define custom content types, page types, or editable widget types.

All modules use [the same API](/reference/module-api/). That shared foundation means that all have access to powerful features, such as custom command line tasks and API routes. It's the same API the core team uses to build the CMS, so it is well tested and designed to be as intuitive as possible.

## Setting up a module

Modules are organized in a folder at the root of a project named `modules`. Each module has a dedicated directory with an `index.js` file that contains its configurations. For example, you would define a blog post module in the file:

```
modules/blog-post/index.js
```

The module configuration is in an object, assigned to `module.exports`. This may look familiar if you know [CommonJS](https://nodejs.org/api/modules.html#modules_modules_commonjs_modules) patterns.

```javascript
// modules/blog-post/index.js
module.exports = {
  // ...
}
```

The final step to use this blog post module is to tell Apostrophe that it should be turned on, or instantiated. That is done in the main application file, `app.js` in its `modules` object.

```js
// app.js
require('apostrophe')({
  modules: {
    'blog-post': {}
  }
});
```

The module API supports many different configuration options. See the [module API reference](/reference/module-api/module-overview.md) for more detail.

## Module inheritance

Inheritance is the glue of the module system. Every module, other than the root module, extends another module. This means that your blog post module, which extends the ["piece type"](/reference/glossary.md#piece) module, comes with a huge set of features you never have to write.

```javascript
// modules/blog-post/index.js
module.exports = {
  extend: '@apostrophecms/piece-type'
};
```

More than that, it means you can customize that core piece type module (`@apostrophecms/piece-type`) in your project. Configuring the piece type module will apply changes to every piece type in Apostrophe core as well as piece types you've created yourself.

Configuring a core or installed module is as simple as creating an `index.js` file for the module in your project. For example, we might want to log the title of every piece when it is published. We would then create the file:

```
modules/@apostrophecms/piece-type/index.js
```

Then add the event handler:

```javascript
// modules/@apostrophecms/piece-type/index.js
module.exports = {
  handlers(self) {
    return {
      afterPublish: {
        logPublished (req, data) {
          console.log(`Published ${data.published.title}`);
        }
      }
    };
  }
};
```

Since every piece type extends that module, they all get the benefits of changes to it. And in the project code we only need to include our changes. All the rest of the module's code is untouched.

The rest of the documentation will include many specific, practical examples of these ideas. For now, the main takeaways are:
  - The module API supports a consistent code structure regardless of the module's functionality
  - It is easy to extend another module to use built-in features
  - Core and installed modules can also be configured in a project without disrupting inheritance
