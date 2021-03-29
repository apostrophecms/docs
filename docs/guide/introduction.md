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

More than that, it means you can easily customize that core ["piece type"](/reference/glossary.md#piece) module (`@apostrophecms/piece-type`) in your project. That will not only apply changes to the project's blog post content type, but also every piece type in Apostrophe core.

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

The rest of the documentation will include many specific, practical examples of these ideas. For now a couple of main takeaways are:
  - The module API supports a consistent code structure regardless of the module's functionality
  - It is easy to extend another module to use built-in features
  - Core and installed modules can also be configured in a project without disrupting inheritance

## Content schemas

The content field schema is another key concept that most Apostrophe development will use. The "schema" here simply refers to definition of fields allowed in a particular context (e.g., a page, piece, or widget type). This is important so that the user interface knows what fields to show editors. It also tells both the UI and server how to validate data for that context.

Our blog post module might look something like this with its field schema:

```javascript
// modules/blog-post/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  fields: {
    add: {
      authorName: {
        label: 'Author name',
        type: 'string'
      },
      body: {
        label: 'Blog post body',
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {}
          }
        }
      }
    },
    group: {
      blogFields: [ 'authorName', 'body' ]
    }
  }
};
```

The `fields` setting is the parent property for the schema configuration. In this case, it has two subsections: `add`, where fields are added to the schema, and `group`, which organizes the fields for the user interface.

Each property in the `add` object is a field you are including in the schema. Each property in `group` is a section of the interface, set to an array of fields to include in that section. In both cases, there are default fields, such as `title`, that are added and grouped for you already.

See the reference documentation on [the `fields` setting](/reference/module-api/module-overview.md#fields) and [individual field types](/reference/field-types/) for additional information.

### Using existing field groups

Fields that a piece type inherits will likely already be in field groups. This is certainly true for the default fields, `title`, `slug`, and `visibility`. You can add new fields into these groups and rearrange them if needed. There are a few things to keep in mind as you do.

**It's fairly simple to see what the existing groups are.** Working with inherited fields and field groups is harder when you don't know what they are. You can log them in your terminal easily from the new module's [initialization function](/reference/module-api/module-overview.md#initialization-function).

```javascript
// modules/product/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  init (self) {
    console.log(self.fieldsGroups);

    // Output:
    // {
    //   basics: { label: 'Basics', fields: [ 'title' ] },
    //   utility: { fields: [ 'slug' ] },
    //   permissions: { label: 'Permissions', fields: [ 'visibility' ], last: true }
    // }
  }
};
```

The `init` function runs once on start up and has access to the module as an argument. By the time it runs, the field groups have been compiled into an object named `fieldsGroups`. If you haven't added any fields yet you can log this to see what you are working with.

::: note
You will see a `trash` field in the log output. The interface does not show this as a normal field, but
:::

**If you name an existing field group in your configuration, the fields in that group will be ungrouped.** For example, `title` is in the default "Basics" group. If you add a `basics` group in your field configuration and do not include `title` in its `fields` array, it will no longer be in any group. Fields that are not part of any group will appear in an "Ungrouped" tab in the interface.

As in the example above, you could include `title` with the "Basics" group along with new fields.

```js
// modules/product/index.js
module.exports = {
  // ...
  fields: {
    add: {
      // ...
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [ 'title', 'price', 'description', 'image' ]
      }
    }
  }
};
```

**You don't need a `basics` group.** There is nothing special about "Basics." It is a default group name, but if you place all of the fields from that group (or any inherited group) in a new one the group will no longer appear in the UI.

`utility` _is_ a special group. It places fields in the right column of the content editor interface. You are allowed to add fields to that group and move existing fields.

![The utility field group](/images/fields-utility-highlight.jpg)
