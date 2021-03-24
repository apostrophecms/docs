# Introduction

## What is ApostropheCMS?

ApostropheCMS is a modern, open source, content management system. It's Javascript from front to back, with a Vue.js user interface and Node.js on the server. Importantly, it has everything you might want from a modern CMS, including:

- a headless API built-in
- a content schema API to easily create any kind of content types you need
- extensibility through a module ecosystem
- a great UI for creating content, including in-context editing
- robust localization to support any number of language or locale content variations

For developers, it offers a site building API that gives you the power to fully customize the website experience without needing to be a Node.js expert. For content editors, the _true_ WYSIWYG experience supports improved editorial flow. In short, it recognizes pain points on both sides of the CMS experience and relieves them.

We can start getting to know that system with two foundational concepts: modules and content schemas.

## The module system

- Interdependent, feature-focused modules are the building blocks of Apostrophe and Apostrophe projects.
- Some modules may contain much more complex business logic, but since all modules share the same structure it makes working with them more predictable.
  - For example, the code that connects to your database and creates the database API has the same general structure as the code that defines a website's blog post content type.
    - They use the same [module API](/reference/module-api/)
  - You may not ever touch the database code, but this means that any feature you build has a rich API available to achieve your goals, and it's well built for developers in part since the core team develops the CMS itself with the same API.
- The glue of the module system is the use of inheritance, or subclassing, modules. Every module, other than `@apostrophecms/module` (the root module), extends another one.
  - This means that your article module, which extends the "pieces" module, can take advantage of a huge amount of functionality you will never have to write.
  - More than that, it means that you have the option to make adjustments to a parent class in project code and not only see those changes in project modules that extend it, but in all core modules that extend it as well.
- The rest of the documentation will include many specific, practical examples of these features. The main takeaways here are:
  - The module system and API in Apostrophe creates a consistent code structure regardless of the module's functionality
  - It is easy to extend another module to avoid code duplication and focus on what is new

### The foundational modules

There might be a root module, `@apostrophecms/module`, but Apostrophe developers rarely extend that directly. Below is a preview of the more common parent modules. Each is discussed in depth elsewhere in the guide:

- `@apostrophecms/piece-type` supports defining new content types
- `@apostrophecms/page-type` supports defining new page types
- Typical module types in project code: piece types, page types, widgets, helpers
- Initializing modules for your app
- Altering options and behavior of installed and core modules (create an index.js in project)

::: tip
Breaking up modules into multiple files
:::

## Content schemas

Nulla vitae elit libero, a pharetra augue. Nullam quis risus eget urna mollis ornare vel eu leo. Maecenas sed diam eget risus varius blandit sit amet non magna. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
