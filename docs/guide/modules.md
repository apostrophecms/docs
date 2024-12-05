---
title: "Code organization"
prev: false
---

# Code organization with modules

Apostrophe code is organized in a system of modules. Modules are the building blocks we use to build Apostrophe projects — as well as the CMS itself.

Each module defines a specific set of functionality, from configuring blog post fields to governing internationalization. Common Apostrophe project modules will define custom content types, page types, or editable widget types.

All modules use [the same API](/reference/module-api/module-overview). That shared foundation means that all have access to powerful features, such as custom command line tasks and API routes. It's the same API the core team uses to build the CMS, so it is well tested and designed to be as intuitive as possible.

To find both official and community-supported Apostrophe modules to install, see [the Extensions and Integrations index](https://apostrophecms.com/extensions).

## Setting up a module

Modules are organized in a folder at the root of a project named `modules`. Each module has a dedicated directory with an `index.js` file that contains its configurations. For example, you would define a blog post module in the file:

```
modules/blog-post/index.js
```

ApostropheCMS supports both ECMAScript Modules (ESM) and CommonJS (CJS) formats. While we recommend using ESM for all new projects due to its alignment with modern JavaScript standards, CJS remains supported for legacy projects.

However, it’s important to note that at the project-level, you must fully commit to either ESM or CJS—mixing the two within the same project is not compatible. That said, ApostropheCMS supports npm packages in both ESM and CJS formats, so you can freely use a combination of package formats in your dependencies.

As we continue to evolve ApostropheCMS, ESM may become mandatory in the future. We encourage developers to transition to ESM to stay ahead of this shift and take full advantage of modern JavaScript features.

### Using CommonJS

If you’re working with a legacy project or prefer CommonJS, the module configuration is assigned to `module.exports`. This is a familiar pattern if you’ve worked with Node.js before.

```javascript
// modules/blog-post/index.js
module.exports = {
  // ...
};
```

To enable this blog post module, configure it in your main application file (`app.js`) within the `modules` object:

```javascript
// app.js
require('apostrophe')({
  modules: {
    'blog-post': {}
  }
});
```

### Using ESM

For newer projects, we recommend using ECMAScript Modules. The module configuration is exported using `export default`. This approach takes advantage of the latest JavaScript module syntax.

```javascript
// modules/blog-post/index.js
export default {
  // ...
};
```

To enable this module in your main application file (`app.mjs`), you’ll use an `import` statement:

```javascript
// app.mjs
import apostrophe from 'apostrophe';

apostrophe({
  modules: {
    'blog-post': {}
  }
});
```

The module API supports many different configuration options. See the [module API reference](/reference/module-api/module-overview.md) for more detail.

::: info
Module names may not include periods (`.`).

- Bad: `blog.post` ❌
- Good: `blog-post` ✅
:::

## Module inheritance

Inheritance is the glue of the module system. Every module extends another module, inheriting functionality and structure. This means that your blog post module, which extends the ["piece type"](/reference/glossary.md#piece) module, comes with a huge set of features you never have to write.

<AposCodeBlock>

  ```javascript
  module.exports = {
    extend: '@apostrophecms/piece-type'
  };
  ```
  <template v-slot:caption>
    modules/blog-post/index.js
  </template>

</AposCodeBlock>

::: tip
Since this is a piece type, you could add this file from your project root with starting code using the CLI with the command:

```bash
apos add piece blog-post
```
:::

Even if a module does not include an `extend` setting, it will extend `@apostrophecms/module`, which provides useful features such as template rendering and API routes support.

Additionally, the inheritance system allows us to customize a core piece type module (e.g., `@apostrophecms/piece-type`) in a project and see those changes in all modules that extend it. That includes every module that extends it in Apostrophe core as well.

## Configuring core and installed modules

Configuring a core or installed module is as simple as creating an `index.js` file for the module in your project. For example, we might want to log the title of every piece when it is published. We would then create the file:

```
modules/@apostrophecms/piece-type/index.js
```

Then add the event handler:

<AposCodeBlock>

  ```javascript
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
  <template v-slot:caption>
    modules/@apostrophecms/piece-type/index.js
  </template>

</AposCodeBlock>

Since every piece type extends that module, they all get the benefits of changes to it. And in the project code we only need to include our changes. All the rest of the module's code is untouched.

The rest of the documentation will include many specific, practical examples of these ideas. For now, the main takeaways are:
  - The module API supports a consistent code structure regardless of the module's functionality
  - It is easy to extend another module to use built-in features
  - Core and installed modules can also be configured in a project without disrupting inheritance
