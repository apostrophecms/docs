# Introduction

## What is ApostropheCMS?

ApostropheCMS is a modern, open source, content management system. It's Javascript from front to back, with a Vue.js user interface and Node.js on the server. Importantly, it has everything you might want from a modern CMS, including:

- a headless API built-in
- a content schema API to create any kind of content types you need
- extensibility through a module ecosystem
- a great UI for creating content, including in-context editing
- robust localization to support any number of language or locale content variations

For developers, it offers a site building API that gives you the power to fully customize the website experience without needing to be a Node.js expert. For content editors, the _true_ WYSIWYG experience supports improved editorial flow.

In short, it recognizes pain points on both sides of the CMS experience and relieves them.

## The module system

Apostrophe code is organized in a system of modules. Modules are the building blocks we use to build Apostrophe projects — as well as the CMS itself.

Each module defines a specific set of functionality, from configuring blog post fields to governing internationalization. Common Apostrophe project modules will define custom content types, page types, or editable widget types.

All modules use [the same API](/reference/module-api/). That shared foundation means that all have access to powerful features, such as custom command line tasks and API routes. It's the same API the core team uses to build the CMS, so it is well tested and designed to be as intuitive as possible.

### Setting up a module

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

### Module inheritance

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

## Content schemas

The content field schema is another key concept in Apostrophe. The "schema" simply refers to the content fields for a particular page, piece, or widget type. In addition to setting fields for the user interface, it supports data validation.

Our blog post module's schema might look something like this:

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

Content schemas are configured in the `fields` setting. In this case, `fields` has two subsections: `add`, where fields are added to the schema, and `group`, which organizes the fields for the user interface.

Each property in the `add` object is a field you are including in the schema. Each property in `group` is a section of the interface, set to an array of fields to include in that section.

See the reference documentation on [the `fields` setting](/reference/module-api/module-overview.md#fields) and [individual field types](/reference/field-types/) for more information.

### Using existing field groups

Fields that a piece type inherits will likely already be in field groups. This includes the default fields `title`, `slug`, and `visibility`. You can add new fields into these groups and rearrange them if needed. There are a few things to keep in mind as you do.

#### It's fairly simple to see what the existing groups are

 Working with inherited fields and field groups can be difficult when you don't know what they are. You can make it easier by logging them in your terminal from the module's [initialization function](/reference/module-api/module-overview.md#initialization-function).

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
You will see a `trash` field in the log output. The interface does not show this as a normal field, but it is registered as one to support editing via the REST API.
:::

#### Reusing an inherited group's name will ungroup its original fields

For example, `title` is in the default "Basics" group. If you add a `basics` group in your field configuration and do not include `title` in its `fields` array, it will no longer be in any group. Fields that are not part of any group will appear in an "Ungrouped" tab in the interface.

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

#### You don't need a `basics` group

There is nothing special about "Basics." It is a default group name, but if you place all of the fields from that group (or any inherited group) in a new one the group will no longer appear in the UI.

`utility` _is_ a special group. It places fields in the right column of the content editor interface. You are allowed to add fields to that group and move existing fields.

![The utility field group](/images/fields-utility-highlight.jpg)
