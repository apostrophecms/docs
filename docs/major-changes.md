---
title: "Major Changes from A2 to A3"
---

# Major Changes from A2 to A3

Here are the big changes from A2 to A3. We strongly recommend reading this section.

## Project layout and naming conventions

### Modules have moved

The `./lib/modules` folder is now simply `./modules`.

### Core modules are namespaced

The `apostrophe-pages` module is now `@apostrophecms/page`. So when you configure it at project level, you now do that in `./modules/@apostrophecms/page/index.js`. The same applies to other core modules. This convention comes from NPM namespaces.

Your project specific modules **do not** need a namespace. However if you publish a module to npm we do recommend using a namespace. NPM namespaces always start with `@`.

### Core modules are lowercase

All of the A3 core modules now have lowercase names. This means the `name` option is no longer necessary for piece and widget types. `@apostrophecms/user` is both the name of the module and the `type` property of a user doc in the database. For widget types, the module name now ends in `-widget`, but `-widget` should still be omitted for brevity when adding it to an area.

### Command line tasks use the new module names

The `apostrophe-users:add` task is now `@apostrophecms/user:add`.

## Areas and pages

### Page types are always modules

In A3 every page type has a corresponding module. The home page, which always exists, is powered by the `@apostrophecms/home-page` module. You'll see that module configured in your boilerplate project.

### Areas are always fields

In A3 areas are always declared as fields of a page type, widget type or array field. They are not declared "on the fly" in page templates. See [standard widgets](standard-widgets) for examples.

### Area template syntax has changed

Since areas are now declared as fields, templates now just pull them in with:

```nunjucks
{% area data.page, 'areaName' %}
```

Notice that `apos.area` has been replaced with a custom Nunjucks tag.

### Singletons are "gone"

The old `singleton` field type and `apos.singleton` helper are "gone" in A3. We're putting that in quotes because you can simply pass the `max: 1` option and set up only one widget type when configuring an area field. Apostrophe still provides an appropriate UI.

## Frontend code

While A2 pushed `jQuery`, `lodash`, `momentjs`, `async` and more to the browser by default, A3 is very unopinionated on the front end. The only JavaScript we push for logged-out site visitors is a tiny vanilla JavaScript library (under 10k gzipped) that provides conveniences for writing widget players and tools for communication with the Apostrophe server. For more information, see [front end assets](front-end-assets).

## `app.js` format

You won't notice too many changes here, except for the new module names, and the need to nest module options in an `options` property as described below.

## Module format (`index.js` changes)

A3 has a new module format designed to help developers understand where to put their code and eliminate common hassles in development.

We'll describe the new sections here, but the right way to understand it is by example, so [definitely check out the module format example page](/module-format-example).

### `fields`

For the modules that power piece, page and widget types, "schema fields" have moved to a new `fields` property with `add`, `remove` and `group` sub-properties, using object rather than array syntax. `fields` sections cascade through subclasses, so you can just add more when you extend another module.

### `columns` and `filters`

For piece types, `columns` and `filters` work much like `fields`. These features are called "cascades" and it is possible to add more.

### `options`

Ordinary options like `label` have moved to a top-level `options` property.

### `methods` and `extendMethods`

Methods are now declared in the `methods` section. Using the "super pattern" to extend methods gets easier with the new `extendMethods` section. Methods are a useful way to structure code that is called by more than one route, event handler, async component or even the `init` function.

### `components` and `extendComponents`

The new [async components](async-components) feature lets you fetch content on the fly from inside your page templates. Async components are a recommended replacement for most common uses of the old `apostrophe-pages:beforeSend` promise event handler. Async components are async functions whose return values are passed to a Nunjucks template of the same name. The result is rendered at the point in the page where `{% component "module-name:componentName" with { data... } %}` was called. The async function receives `(req, data)` so it can work with information passed by the template.

### `apiRoutes` and `extendApiRoutes`

The `apiRoutes` section allows Express routes to be written as simple async functions that return a value, which is sent for you as JSON. You can send HTTP errors by throwing exceptions. This produces less buggy, more reliable code. Just like with methods, you can extend a route you inherited with `extendApiRoutes`.

### `renderRoutes` and `extendRenderRoutes`

Like `apiRoutes`, but the returned object is passed to a Nunjucks template of the same name in your module, and the resulting markup is sent to the browser. This is great for HTML fragments, but also check out the new [async-components](async-components) feature which is more SEO-friendly. 

### `htmlRoutes` and `extendHtmlRoutes`

If you like the idea of `renderRoutes` but don't want to render a Nunjucks template, you can return your own HTML string with these.

### `restApiRoutes` and `extendRestApiRoutes`

Handy for those creating new RESTful APIs. Allows you to declare `getAll`, `getOne`, `post`, `delete` and `patch` routes in an intuitive way. These return a value or throw an exception just like `apiRoutes`. However, note that pieces and pages automatically have REST APIs in 3.x.

### `routes`

You can create ordinary Express routes with `(req, req)` arguments too. There is no "extendRoutes" since Express routes do not lend themselves to that pattern.

### `handlers` and `extendHandlers`

The `handlers` section provides a home for promise event handlers. These are grouped together by event name and given individual names so that you can use `extendHandlers` to tweak what happens in a handler you inherited from a base class.

In 3.x, promise events support inheritance: if the piece type module `product` emits an `beforeInsert` event, you can listen for that specifically as `product:beforeInsert`, or as `@apostrophecms/piece-type:beforeInsert`, or even `@apostrophecms/doc-type:beforeInsert` which will catch `beforeInsert` events on all pages and pieces in Apostrophe.

This provides a flexible replacement for the empty piece type methods like `beforeInsert` designed just for overriding that A2 provided.

On the other hand, `@apostrophecms/page:beforeSend` will not be listened for as often as its A2 equivalent because [async components](async-components) are usually a better answer.

### Middleware

The new `middleware` section replaces the old `expressMiddleware` property. You can configure any number of named Express middleware functions, which are called on **all** requests, in the order modules are initialized. You can also schedule your middleware to run `before` that of another module.

In A3, most route-specific custom middleware is better written as an async method `await`ed at the start of the route. Existing third-party middleware can be used on a route-specific basis by passing an array consisting of the middleware and the route function when adding a `route`, `apiRoute`, etc.

There is no "extendMiddleware" since Express middleware does not lend itself to that pattern.
