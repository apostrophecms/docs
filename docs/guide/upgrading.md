# Upgrading from Apostrophe 2.x

The 3.x major version of Apostrophe has many things to offer developers familiar with Apostrophe 2. It has a totally new UI, clearer module configuration, and many quality of life improvements, large and small. There are also some breaking changes, including in the general directory structure, so be sure to review the information below before upgrading codebases.

## New features

Apostrophe 3 introduces a number of new features for developers and content-editors. Its been re-engineered from the ground-up to provide a best-in-class experience for organizations of all sizes.

### 100% RESTful API coverage

In the previous version, developers who wanted REST API access to their data needed to install the `apostrophe-headless` module. [These are now built into A3](/reference/api/) and are the foundation of the user interface.

### Totally rebuilt content editing interface

The UI has been completely rebuilt with [Vue.js](https://vuejs.org/). It is much faster, more accessible, and easier to configure. It will also stay out of your way, so you can build with React, vanilla JavaScript, a different Vue.js version, or any other framework without any issue.

### Clearer and easier module building

There were several things about building advanced modules in A2 that often tripped up developers. A3 helps avoid the confusion around where to put things by doing away with `beforeConstruct`, `construct`, and `afterConstruct`. [They are replaced by a single `init` function and special sections](/docs/reference/module-api/module-overview.md) to do things like extend API routes, add template helper methods, and add columns to the piece manager UI.

### New Rich Text Editor

A3 uses the [tiptap](https://tiptap.dev/) rich text editor, a modern, open source editor powered by [ProseMirror](https://prosemirror.net/) and built by überdosis. Besides being a great editor, it is built with JavaScript, which should make it easier to customize for developers using a Node.js CMS.

### Async template components

[Async components](/guide/async-components.md) allow developers to write template partials designed to use data from custom database requests. In A2, those requests would need to happen through an unclear pattern before any rendering could happen. Async components should make this a clearer process and improve rendering performance.

### Other notable improvements

- Callback-driven code has been completely eliminated from the core of Apostrophe, and all of the JavaScript APIs return promises, so you can `await` them in async functions.
- A3 completely removes the jQuery, lodash, and Moment.js libraries that were pushed to browsers by default. There is now only [a small set of helper methods](/guide/front-end-helpers.md).
- In addition to the classic template macros, there are now [fragments](/guide/fragments.md). These are compatible with the new async components, unlike macros.

## Breaking changes

A3 introduces several major changes to the development experience. If you're familiar with A2, we strongly recommend you read through this section before [getting started](starting-your-project).

### Directory Structure & Module Naming

#### Modules have moved

The `./lib/modules` folder is now simply `./modules`.

#### Core modules are namespaced

All core modules have been namespaced with `@apostrophecms`. For example, the `apostrophe-pages` module is now `@apostrophecms/page`. You can configure this for your own projects in `./modules/@apostrophecms/page/index.js`. This convention is borrowed from NPM namespaces.

::: tip Note:
Your project specific modules should not use the `@apostrophecms` namespace. However if you publish a module to npm we do recommend using a namespace. NPM namespaces always start with `@`.
:::

#### Core modules are lowercase and singular

All of the A3 core modules now have lowercase names. This means the `name` option is no longer necessary for piece and widget types. `@apostrophecms/user` is both the name of the module and the `type` property of a user doc in the database. For widget types, the module name now ends in `-widget`, but `-widget` should still be omitted for brevity when adding it to an area.

Command line tasks also use the new module names. For example, **the `apostrophe-users:add` task is now `@apostrophecms/user:add`**.

### Tags

In A2, every document has a `tags` field. In A3, this field no longer exists.

Your pieces that benefit from the idea of "tagging" should have a relationship (formerly known as a join) to a piece type that you add to your project for that purpose. For instance, A3 ships with "image-tag" and "file-tag" piece types. Image and file pieces specifically have a relationship with these types. Other documents do not.

### Areas and Pages

#### Page types are always modules

In A3 every page type has a corresponding module. Page templates live in the page type module rather than in the base page module.

The home page, which always exists, is powered by the `@apostrophecms/home-page` module. This is already configured in the [A3 Boilerplate](https://github.com/apostrophecms/a3-boilerplate/).

#### Areas are always fields

In A3 areas are always declared as fields of a page type, widget type or array field. They are not declared "on the fly" in page templates. See [standard widgets](/guide/areas-and-widgets/core-widgets.md) for examples.

#### Area template syntax has changed

Since areas are now declared as fields, templates now just pull them in with:

```js
{% area data.page, 'areaName' %}
```

Notice that `apos.area` has been replaced with a custom Nunjucks tag.

#### Singletons are gone

The old `singleton` field type and `apos.singleton` helper are gone in A3. You can simply pass the `max: 1` option and declare a single widget type when configuring an area field. Apostrophe still provides an appropriate UI for content-editors.

### "Joins" are now "relationships"

In A2, relationships between two piece or page types were referred to as "joins." In A3 they are simply called "relationships." Here is an example of a relationship field in A3:

```javascript
_products: {
  label: 'Products',
  type: 'relationship',
  withType: 'product'
}
```

Notice we do not write `joinByArray`. In A3, all relationships are "one to many," although you may specify `max: 1` if you wish.

However, `relationshipReverse` fields are still available and work just like `joinByArrayReverse` in A2.

### `array` fields have changed

The `array` schema field type is still available, but the syntax has been updated to match the new syntax for modules:

```js
features: {
  label: 'Features',
  type: 'array',
  fields: {
    add: {
      title: {
        label: 'Title',
        type: 'string'
      }
    }
  }
}
```

### Front End Assets

While A2 pushed `jQuery`, `lodash`, `momentjs`, `async` and more to the browser by default, A3 is very unopinionated on the front end. The only JavaScript we push for logged-out site visitors is a tiny vanilla JavaScript library (under 10k gzipped) that provides conveniences for writing widget players and tools for communication with the Apostrophe server. For more information, see [front end assets](front-end-assets.md).

### Module Format

A3 has a new module format designed to help developers understand how to structure their code and eliminate common hassles in development.

We'll briefly describe the new sections here, but be sure to take a closer look by following the example on the [module format example](/module-format-example.md) page.

#### `fields`

For the modules that power piece, page and widget types, "schema fields" have moved to a new `fields` property with `add`, `remove` and `group` sub-properties, using object rather than array syntax. `fields` sections cascade through subclasses, so you can just add more when you extend another module.

#### `columns` and `filters`

For piece-types, `columns` and `filters` work much like `fields`. These features are called "cascades" and it is possible to add more.

#### `options`

Ordinary options like `label` have moved to a top-level `options` property.

#### `methods` and `extendMethods`

Methods are now declared in the `methods` section. Using the "super pattern" to extend methods gets easier with the new `extendMethods` section. Methods are a useful way to structure code that is called by more than one route, event handler, async component or even the `init` function.

#### `components` and `extendComponents`

The new [async components](/guide/async-components) feature lets you fetch content on the fly from inside your page templates. Async components are a recommended replacement for most common uses of the old `apostrophe-pages:beforeSend` promise event handler. Async components are async functions whose return values are passed to a Nunjucks template of the same name. The result is rendered at the point in the page where `{% component "module-name:componentName" with { data... } %}` was called. The async function receives `(req, data)` so it can work with information passed by the template.

#### `helpers` and `extendHelpers`

As in A2, A3 supports Nunjucks helper functions. These are configured in
the `helpers` section.

Note that **helper functions are still synchronous.
They still may not use await or do any asynchronous work.** For those use
cases, use `components` instead.

#### `apiRoutes` and `extendApiRoutes`

The `apiRoutes` section allows Express routes to be written as simple async functions that return a value.

If the value is an object or array, it is sent as JSON, otherwise it is sent as-is which is useful for HTML fragments. This pattern produces less buggy, more reliable code.

Just like with methods, you can extend a route you inherited with `extendApiRoutes`.

#### `renderRoutes` and `extendRenderRoutes`

Like `apiRoutes`, but the returned object is passed to a Nunjucks template of the same name in your module, and the resulting markup is sent to the browser. This is great for HTML fragments, but also check out the new [async components](/guide/async-components) feature which is more SEO-friendly.

#### `restApiRoutes` and `extendRestApiRoutes`

Handy for those creating new RESTful APIs. Allows you to declare `GET` (for all), `GET` (for one), `POST`, `PUT`, `PATCH` and `DELETE`f routes in an intuitive way. These return a value or throw an exception just like `apiRoutes`. However, note that pieces and pages automatically have REST APIs in 3.x.

#### `routes`

You can create ordinary Express routes with `(req, res)` arguments too. There is no "extendRoutes" since Express routes do not lend themselves to that pattern.

#### `handlers` and `extendHandlers`

The `handlers` section provides a home for promise event handlers. These are grouped together by event name and given individual names so that you can use `extendHandlers` to tweak what happens in a handler you inherited from a base class.

In 3.x, promise events support inheritance: if the piece-type module `product` emits an `beforeInsert` event, you can listen for that specifically as `product:beforeInsert`, or as `@apostrophecms/piece-type:beforeInsert`, or even `@apostrophecms/doc-type:beforeInsert` which will catch `beforeInsert` events on all pages and pieces in Apostrophe.

This provides a flexible replacement for the empty piece-type methods like `beforeInsert` designed just for overriding that A2 provided.

On the other hand, `@apostrophecms/page:beforeSend` will not be listened for as often as its A2 equivalent because [async components](/guide/async-components) are usually a better answer.

#### Queries

In modules for piece and page types, the `queries` section replaces the Apostrophe 2.x "cursors" feature. When making a database query with Apostrophe, you can chain together the query "builders" declared in the `builders` subsection, then finish the job with the query "methods" declared in the `methods` subsection. Most of the time you'll just need those you inherit from `@apostrophecms/doc-type`, such as `and`, `project`, and `toArray`.

#### Middleware

The new `middleware` section replaces the old `expressMiddleware` property. You can configure any number of named Express middleware functions, which are called on **all** requests, in the order modules are initialized. You can also schedule your middleware to run `before` that of another module.

In A3, most route-specific custom middleware is better written as an async method `await`ed at the start of the route. Existing third-party middleware can be used on a route-specific basis by passing an array consisting of the middleware and the route function when adding a `route`, `apiRoute`, etc.

There is no "extendMiddleware" since Express middleware does not lend itself to that pattern.

#### Tasks

In A3, command line tasks have moved to the new `tasks` module format section. This removes the need to call the `addTask` method, provides clearer code organization and allows for a new `afterModuleInit` flag to optionally run the task and exit immediately after its module is initialized, without waiting for others.

## Upgrading from 3.0.0-alpha.1

Following version `3.0.0-alpha.1` we will use simply the npm tag for versions in the boilerplate for versions prior to the full release, e.g., `alpha`, `beta`. If you downloaded the boilerplate before the `3.0.0-alpha.2` release:

* Open `package.json`
* Change `"apostrophe": "3.0.0-alpha.1"` to `"apostrophe": "alpha"`
* Run `npm install`

This can be updated to `beta` when a beta release is available.

After the final release you'll be able to set your dependency to just `^3.0.0`, and then you will be able to use `npm update` normally.

## Upgrading from 2.x

Upgrading from 2.x will be possible in the final, stable release of A3. We will provide content migration tools, and eventually code migration tools as well. Certainly some effort will be required from developers to complete a migration from A2 to A3, however we are committed to making this process as smooth as possible. In the meantime, A2 is a long term support (LTS) release we are standing behind through 2023.

## Coming soon...

The core team is continually adding and tweaking features in Apostrophe 3. Check in on [the product roadmap](https://apostrophecms.productboard.com/portal/1-product-portal/tabs/1690f4df-bbbe-4d8d-aad0-42e4f1ff7643) to learn about some of the big features and the estimated timeline.