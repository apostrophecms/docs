# Glossary

First, check out the [tutorials](/README.md) if you haven't already. They explain all of these concepts in greater depth.

## Module

Apostrophe sites are powered by Apostrophe modules. Each module is responsible for providing one feature, such as a type of widget, a type of customized page, or a service like pushing assets to the browser. Apostrophe has many standard modules which provide its core features.

A module can extend, or "subclass", another module, and most of the modules you create at "project level" will. All modules implicitly extend `@apostrophecms/mdoule`, which provides a rich set of core conveniences, like rendering templates or pushing assets relative to your module's folder.

Modules created at "project level" live in subdirectories of `/modules`. Code and configuration for a module lives in `/modules/MODULE-NAME/index.js` and can be overridden in `app.js` via the `modules` property of the main Apostrophe configuration object. It is also common to override a few settings on a per-server basis via `data/local.js`, which is merged with that object if it exists.

<!-- TODO: Update bundle information -->
<!-- Apostrophe modules can also be distributed as npm modules, whether by themselves or as bundles. Bundling allows you to distribute several related Apostrophe modules as one npm module. The `apostrophe` npm module itself is a bundle. -->

Each module may have its own `views` folder and easily render templates from it or push CSS and JS assets from the `ui/public` folder.

## Doc

A document in Apostrophe's database. Each doc is a MongoDB document in the `aposDocs` collection.

Docs may contain [areas](#area), and may also contain other properties, often as described by a schema configured by a doc type manager, such as a module that extends `@apostrophecms/piece-type`, `@apostrophecms/page-type` or `@apostrophecms/piece-page-type`.

At a minimum, a doc has unique `_id` and `slug` properties. The `type` property determines what other behaviors it might have. The `@apostrophecms/doc` module provides methods for working with docs, including the `apos.docs.getManager(doc.type)` method, which returns a reference to the module suited to working with that type of document.

## Piece

A doc which does not have a permanent home of its own in the page tree. Pieces are managed by modules that extend `@apostrophecms/piece-type`. The `@apostrophecms/piece-type` module is an "abstract base class" -- you never use it directly, you always extend it, creating a module that defines a new type of piece.

See also `@apostrophecms/piece-page-type`, which provides a way to create an "index page" that acts as a public view of pieces. These index pages can be locked down to display only certain pieces based on tags, et cetera.

Think of it this way: the index page is the "calendar," the individual piece is the "event." It may be appropriate to display that event on one or more calendars around the site.

The schema of each piece can be easily customized with extra fields, and even with "joins" to other types of docs.

## Page

A doc which is part of the page tree. It may potentially have child pages. The `slug` begins with `/`, which is only true for pages. A page also has `path`, `rank` and `depth` properties that help make its relationship to other pages in the tree clear.

`path` differs from `slug` in that it always reflects the true parent-child relationships between pages in the tree, while `slug` can be edited and shortened if desired so that URLs don't have to contain a lot of slashes to reach a deep page.

All page types that are allowed on the site must be listed as part of the `types` option of the [apostrophe-pages](/reference/modules/apostrophe-pages/README.md) module.

Often page types are given extra behavior via the [apostrophe-custom-pages](/reference/modules/apostrophe-custom-pages/README.md) module, which allows the developer to handle the rest of the URL if a page matches just the beginning of a URL. This module is extended by [apostrophe-pieces-pages](/reference/modules/apostrophe-pieces-pages/README.md), used to power blogs and other index views of [apostrophe-pieces](/reference/modules/apostrophe-pieces/README.md).

## Global doc

There is a doc with the slug `global` which is always loaded and available to your page templates as `data.global`. This is useful for shared, site-wide headers and footers that are editable, etc. It is managed by the [apostrophe-global](/reference/modules/apostrophe-global/README.md) module. There is no rule against creating other specialized docs if pieces, pages and `global` don't cover your use cases.

## Widget

A widget is a single item of content that can be edited, such as a block of rich text, a slideshow, or an RSS feed widget. You can create entirely new types of widgets by extending the `@apostrophecms/widget-type` module.

## Area

An area is a space in which you can add as many widgets as you like. Each individual widget might be a rich text block, a Twitter feed, a slideshow, etc. Users can add, edit, move and remove widgets from the area freely. Usually they are stacked vertically but nothing prevents you from using CSS to float the widgets, etc.

Areas are inserted into your templates using the `apos.area` nunjucks helper function.

Areas are implemented by the `@apostrophecms/area` module.

## Block

In Nunjucks templates, [a block is a portion of a template that can be overridden in a template that extends it](https://mozilla.github.io/nunjucks/templating.html#block). This is a useful technique in page templates and when overriding just part of a modal's template.

## Template

Apostrophe uses the [Nunjucks template language](https://mozilla.github.io/nunjucks/) to render webpages and smaller pieces of pages, such as widgets and blocks. Nunjucks shares a syntax with the Jinja and Twig languages which are popular in the Python and PHP worlds, respectively.

## Schema

A schema allows you to specify the fields that are part of a particular type of ["doc"](#doc). Schemas can also be used to specify the fields for widgets and other kinds of objects.

Apostrophe's schemas are used both to automatically create an editing interface and to sanitize and save data on the server side. Commonly used field types include strings, integers, floats, select elements and "joins," which allow relationships with other doc types to be defined.

Schemas are built by using the `add`, `remove`, and `group` options when configuring any module that extends `@apostrophecms/piece-ype`, `@apostrophecms/page-type`, or `@apostrophecms/widget-type`.

Here is a simple example in which we add a required "author" string field to the schema for "stories," a custom piece type:

```javascript
// modules/stories/index.js in our project
module.exports = {
  extend: 'apostrophe-pieces',
  name: 'story',
  fields: {
    add: {
      author: {
        type: 'string',
        required: true
      }
    }
  }
}
```

<!-- TODO: Return when module reference is available. -->
<!-- See the [apostrophe-schemas](/reference/modules/apostrophe-schemas/README.md) module documentation for more information. -->

## Relationship

In [Apostrophe schemas](#schema), a "relationship" describes a relationship with another type of doc. Here is an example of a "by array" join, also known as a "one to many" relationship.

Let's say we're implementing a module for a creative agency called "services," a subclass of `@apostrophecms/piece-type` in which each piece represents a service that the agency offers.

But not every service is offered in every office. So we define a join from services to offices via the `fields.add` option:

```javascript
fields: {
  add: {
    _offices: {
      label: 'Offices',
      type: 'relationship',
      withType: 'office'
    }
  }
}
```

The editing interface for this join allows the user to pick offices to associate with this service.

When writing templates, the developer is then able to access a `._offices` array as a property of each service.

<!-- TODO: Return when module reference is available. -->
<!-- See the [apostrophe-schemas](/reference/modules/apostrophe-schemas/README.md) module documentation for more information about joins. -->

## Document set

The database documents that exist as mode and locale versions of one another. For example, in a project with an English and a French locale, the home page would be managed in the database by six documents: 1) the draft English, 2) published English, 3) previous English, 4) draft French, 5) published French, and 6) previously published French. These six database documents make up the document set.