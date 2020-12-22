---
title: "Major Changes"
---

# Major Changes

A3 introduces several major changes to the development experience. If you're familiar with A2, we strongly recommend you read through this section before [getting started](starting-your-project).

## Directory Structure & Module Naming

### Modules have moved

The `./lib/modules` folder is now simply `./modules`.

### Core modules are namespaced

All core modules have been namespaced with `@apostrophecms`. For example, the `apostrophe-pages` module is now `@apostrophecms/page`. You can configure this for your own projects in `./modules/@apostrophecms/page/index.js`. This convention is borrowed from NPM namespaces.

::: tip Note:
Your project specific modules should not use the `@apostrophecms` namespace. However if you publish a module to npm we do recommend using a namespace. NPM namespaces always start with `@`.
:::

### Core modules are lowercase and singular

All of the A3 core modules now have lowercase names. This means the `name` option is no longer necessary for piece and widget types. `@apostrophecms/user` is both the name of the module and the `type` property of a user doc in the database. For widget types, the module name now ends in `-widget`, but `-widget` should still be omitted for brevity when adding it to an area.

Command line tasks also use the new module names. For example, **the `apostrophe-users:add` task is now `@apostrophecms/user:add`**.

## Tags

In A2, every document has a `tags` field. In A3, this field no longer exists.

Your pieces that benefit from the idea of "tagging" should have a relationship (formerly known as a join) to a piece type that you add to your project for that purpose. For instance, A3 ships with "image-tag" and "file-tag" piece types. Image and file pieces specifically have a relationship with these types. Other documents do not.

## Areas and Pages

### Page types are always modules

In A3 every page type has a corresponding module. The home page, which always exists, is powered by the `@apostrophecms/home-page` module. This is already configured in the [A3 Boilerplate](https://github.com/apostrophecms/a3-boilerplate/).

### Areas are always fields

In A3 areas are always declared as fields of a page type, widget type or array field. They are not declared "on the fly" in page templates. See [standard widgets](widgets-and-templates.md) for examples.

### Area template syntax has changed

Since areas are now declared as fields, templates now just pull them in with:

```js
{% area data.page, 'areaName' %}
```

Notice that `apos.area` has been replaced with a custom Nunjucks tag.

### Singletons are gone

The old `singleton` field type and `apos.singleton` helper are gone in A3. You can simply pass the `max: 1` option and declare a single widget type when configuring an area field. Apostrophe still provides an appropriate UI for content-editors.

## "Joins" are now "relationships"

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

## `array` fields have changed

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

## Front End Assets

While A2 pushed `jQuery`, `lodash`, `momentjs`, `async` and more to the browser by default, A3 is very unopinionated on the front end. The only JavaScript we push for logged-out site visitors is a tiny vanilla JavaScript library (under 10k gzipped) that provides conveniences for writing widget players and tools for communication with the Apostrophe server. For more information, see [front end assets](front-end-assets.md).

## Module Format

A3 has a new module format designed to help developers understand how to structure their code and eliminate common hassles in development.

We'll briefly describe the new sections here, but be sure to take a closer look by following the example on the [module format example](/module-format-example.md) page.

### `fields`

For the modules that power piece, page and widget types, "schema fields" have moved to a new `fields` property with `add`, `remove` and `group` sub-properties, using object rather than array syntax. `fields` sections cascade through subclasses, so you can just add more when you extend another module.

### `columns` and `filters`

For piece-types, `columns` and `filters` work much like `fields`. These features are called "cascades" and it is possible to add more.

### `options`

Ordinary options like `label` have moved to a top-level `options` property.

### `methods` and `extendMethods`

Methods are now declared in the `methods` section. Using the "super pattern" to extend methods gets easier with the new `extendMethods` section. Methods are a useful way to structure code that is called by more than one route, event handler, async component or even the `init` function.

### `components` and `extendComponents`

The new [async components](async-components.md) feature lets you fetch content on the fly from inside your page templates. Async components are a recommended replacement for most common uses of the old `apostrophe-pages:beforeSend` promise event handler. Async components are async functions whose return values are passed to a Nunjucks template of the same name. The result is rendered at the point in the page where `{% component "module-name:componentName" with { data... } %}` was called. The async function receives `(req, data)` so it can work with information passed by the template.

### `helpers` and `extendHelpers`

As in A2, A3 supports Nunjucks helper functions. These are configured in
the `helpers` section.

Note that **helper functions are still synchronous.
They still may not use await or do any asynchronous work.** For those use
cases, use `components` instead.

### `apiRoutes` and `extendApiRoutes`

The `apiRoutes` section allows Express routes to be written as simple async functions that return a value.

If the value is an object or array, it is sent as JSON, otherwise it is sent as-is which is useful for HTML fragments. This pattern produces less buggy, more reliable code.

Just like with methods, you can extend a route you inherited with `extendApiRoutes`.

### `renderRoutes` and `extendRenderRoutes`

Like `apiRoutes`, but the returned object is passed to a Nunjucks template of the same name in your module, and the resulting markup is sent to the browser. This is great for HTML fragments, but also check out the new [async-components](async-components.md) feature which is more SEO-friendly.

### `restApiRoutes` and `extendRestApiRoutes`

Handy for those creating new RESTful APIs. Allows you to declare `GET` (for all), `GET` (for one), `POST`, `PUT`, `PATCH` and `DELETE`f routes in an intuitive way. These return a value or throw an exception just like `apiRoutes`. However, note that pieces and pages automatically have REST APIs in 3.x.

### `routes`

You can create ordinary Express routes with `(req, res)` arguments too. There is no "extendRoutes" since Express routes do not lend themselves to that pattern.

### `handlers` and `extendHandlers`

The `handlers` section provides a home for promise event handlers. These are grouped together by event name and given individual names so that you can use `extendHandlers` to tweak what happens in a handler you inherited from a base class.

In 3.x, promise events support inheritance: if the piece-type module `product` emits an `beforeInsert` event, you can listen for that specifically as `product:beforeInsert`, or as `@apostrophecms/piece-type:beforeInsert`, or even `@apostrophecms/doc-type:beforeInsert` which will catch `beforeInsert` events on all pages and pieces in Apostrophe.

This provides a flexible replacement for the empty piece-type methods like `beforeInsert` designed just for overriding that A2 provided.

On the other hand, `@apostrophecms/page:beforeSend` will not be listened for as often as its A2 equivalent because [async components](async-components.md) are usually a better answer.

### Queries

In modules for piece and page types, the `queries` section replaces the Apostrophe 2.x "cursors" feature. When making a database query with Apostrophe, you can chain together the query "builders" declared in the `builders` sub-section, then finish the job with the query "methods" declared in the `builders` sub-section. Most of the time you'll just need those you inherit from `@apostrophecms/doc-type`, such as `and`, `project`, and `toArray`.

### Middleware

The new `middleware` section replaces the old `expressMiddleware` property. You can configure any number of named Express middleware functions, which are called on **all** requests, in the order modules are initialized. You can also schedule your middleware to run `before` that of another module.

In A3, most route-specific custom middleware is better written as an async method `await`ed at the start of the route. Existing third-party middleware can be used on a route-specific basis by passing an array consisting of the middleware and the route function when adding a `route`, `apiRoute`, etc.

There is no "extendMiddleware" since Express middleware does not lend itself to that pattern.
