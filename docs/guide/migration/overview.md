---
next:
  text: 'Upgrading from A2'
  link: '/guide/migration/upgrading.html'
prev: false
---

# Changes from Apostrophe 3 to Apostrophe 4

Apostrophe 4.x (A4) differs from Apostrophe 3 in just one major area: the admin UI has been updated to use Vue 3,
the current major supported version of the Vue frontend framework.

As a result, most projects require no changes at all to work with Apostrophe 4.x, beyond changing certain dependencies
in `package.json`. However projects that customize the admin UI with their own Vue code will often require
some minor changes.

For more information, see the [3 to 4 upgrading guide](/guide/migration/upgrading-3-to-4.md).

# Changes from Apostrophe 2 to Apostrophe 4

**While upgrading from 2.x to 3.x is possible, there is no benefit in not going directly to 4.x because 
differences between 3.x and 4.x are very minor, 3 will reach its end of life for security updates in 2025,
and only 4.x receives new features going forward.**

Apostrophe 4.x has many things to offer developers familiar with Apostrophe 2 (A2). It has a totally new UI, clearer module configuration, and many quality-of-life improvements, large and small. It has been re-engineered from the ground up to provide a best-in-class experience for organizations of all sizes.

There are also some breaking changes, including in the general directory structure, so be sure to review the [upgrading guide](/guide/migration/upgrading.md) before upgrading codebases.

## Features

### 100% RESTful API coverage

In the previous version, developers who wanted REST API access to their data needed to install the `apostrophe-headless` module. [This is now built into A4](/reference/api/README) and is the foundation of the user interface.

### Totally rebuilt content editing interface

The UI has been completely rebuilt with [Vue.js](https://vuejs.org/). As of apostrophe 4.x this is using Vue.js version 3.x. It is much faster, more accessible, and easier to configure. It will also stay out of your way, so you can build with React, vanilla JavaScript, a different Vue.js version, or any other framework without any issue.

### Clearer and easier module building

There were several things about building advanced modules in A2 that often tripped up developers. A4 helps avoid the confusion around where to put things by doing away with `beforeConstruct`, `construct`, and `afterConstruct`. [They are replaced by a single `init` function and special sections](/reference/module-api/module-overview.md#initialization-function) to do things like extend API routes, add template helper methods, and add columns to the piece manager UI. The `addFields` array also became a `fields` object with an `add` sub-property to prevent problems with common inheritance patterns.

### New Rich Text Editor

A4 uses the [tiptap](https://tiptap.dev/) rich text editor, a modern, open-source editor powered by [ProseMirror](https://prosemirror.net/) and built by überdosis. Besides being a great editor, it is built with JavaScript, which should make it easier to customize for developers using a Node.js CMS.

### Async template components

[Async components](/guide/async-components.md) allow developers to write template code that uses data from custom database requests. In A2, the pattern to make those requests before rendering templates was unclear and fairly advanced. Async components should make this a clearer process and improve rendering performance.

## Other improvements

- Callback-driven code has been completely eliminated from the core of Apostrophe, and all of the JavaScript APIs return promises, so you can `await` them in async functions.
- A4 completely removes the jQuery, lodash, and Moment.js libraries that were pushed to browsers by default. There is now only [a small set of helper methods](/guide/front-end-helpers.md).
- In addition to the classic template macros, there are now [fragments](/guide/fragments.md). These are compatible with the new async components, unlike macros.
- [Content localization](../localization/dynamic.md), which was a feature of Apostrophe Workflow for A2, is now fully available in A4 core.

There are additional features planned for Apostrophe 4. Keep an eye on the [product roadmap](https://portal.productboard.com/apostrophecms/1-product-roadmap/tabs/2-planned) for more on those.
