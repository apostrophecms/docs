# Coming from Apostrophe 2.x

The 3.x major version of Apostrophe has many things to offer developers familiar with Apostrophe 2. It has a totally new UI, clearer module configuration, and many quality of life improvements, large and small. There are also some breaking changes, including in the general directory structure, so be sure to review the information below before upgrading codebases.

## New features

Apostrophe 3 introduces a number of new features for developers and content-editors. Its been re-engineered from the ground-up to provide a best-in-class experience for organizations of all sizes.

### 100% RESTful API coverage

In the previous version, developers who wanted REST API access to their data needed to install the `apostrophe-headless` module. [This is now built into A3](/reference/api/) and are the foundation of the user interface.

### Totally rebuilt content editing interface

The UI has been completely rebuilt with [Vue.js](https://vuejs.org/). It is much faster, more accessible, and easier to configure. It will also stay out of your way, so you can build with React, vanilla JavaScript, a different Vue.js version, or any other framework without any issue.

### Clearer and easier module building

There were several things about building advanced modules in A2 that often tripped up developers. A3 helps avoid the confusion around where to put things by doing away with `beforeConstruct`, `construct`, and `afterConstruct`. [They are replaced by a single `init` function and special sections](/reference/module-api/module-overview.md#initialization-function) to do things like extend API routes, add template helper methods, and add columns to the piece manager UI. The `addFields` array also became a `fields` object with an `add` subproperty to prevent problems with common inheritance patterns.

### New Rich Text Editor

A3 uses the [tiptap](https://tiptap.dev/) rich text editor, a modern, open source editor powered by [ProseMirror](https://prosemirror.net/) and built by überdosis. Besides being a great editor, it is built with JavaScript, which should make it easier to customize for developers using a Node.js CMS.

### Async template components

[Async components](/guide/async-components.md) allow developers to write template code that uses data from custom database requests. In A2, the pattern to make those requests before rendering templates was unclear and fairly advanced. Async components should make this a clearer process and improve rendering performance.

### Other notable improvements

- Callback-driven code has been completely eliminated from the core of Apostrophe, and all of the JavaScript APIs return promises, so you can `await` them in async functions.
- A3 completely removes the jQuery, lodash, and Moment.js libraries that were pushed to browsers by default. There is now only [a small set of helper methods](/guide/front-end-helpers.md).
- In addition to the classic template macros, there are now [fragments](/guide/fragments.md). These are compatible with the new async components, unlike macros.
- [Content localization](localization/dynamic.md), which was a feature of Apostrophe Workflow for A2, is now fully available in A3 core.

There are additional features planned for Apostrophe 3. Keep an eye on the [product roadmap](https://apostrophecms.productboard.com/portal/1-product-portal/tabs/1690f4df-bbbe-4d8d-aad0-42e4f1ff7643) for more on those.

## Breaking changes

### Codebase structure and module naming

- The modules directory moved from `/lib/modules` to `/modules` since there was little need for the additional nesting.
- All core modules have been namespaced with `@apostrophecms`. For example, the `apostrophe-pages` module is now `@apostrophecms/page`. You can configure this in projects in `/modules/@apostrophecms/page/index.js`.

::: note
Your project specific modules should not use the `@apostrophecms` namespace to avoid future collisions.
:::

- Official doc type modules are now singular as well.
- Due to core module name changes, the `name` option is no longer necessary (or functional). The module names now exactly match the document `type` property (e.g., `@apostrophecms/user`, `@apostrophecms/image`).

### Updated UI and module architecture

- Most any user interface customizations based on the A2 jQuery code will no longer work.
- [As noted above](#other-notable-improvements), Apostrophe no longer provides jQuery, lodash, or Moment.js to browsers by default. If you need any of those libraries in the client you will need to provide them.
- Due to the module architecture changes, all modules in an A2 project would need to be refactored when migrating to A3. Most configurations and methods will be reusable, but they will need to be rearranged. See the [module reference](/reference/module-api/module-overview.md) for details. Here are some highlights:
  - Module field schemas now use an object structure on the `fields` property. It has `add`, `remove`, and `group` subproperties to replace A2's `addFields`, `removeFields`, and `arrangeFields`.
  - `columns` (for piece manager UI columns) is structured similarly to `fields` with `add`, `remove`, and `order` subproperties. This replaces A2's `addColumns` property.
  - `columns` (for piece manager UI columns) is structured similarly to `fields` with `add`, and `remove` subproperties. This replaces A2's `addFilters` property.
  - Many module options that were top level properties in A2 (e.g., `label`, `alias`, `sort`) are now subproperties of `options`. These include all settings that are *not* covered in the [module properties overview reference](/reference/module-api/module-overview.md). See the [module options reference](/reference/module-api/module-options.md) for more on that.
  <!-- TODO: Update once options are all moved into individual module reference pages -->
  - The A2 `self.addHelper()` method used to add Nunjucks helper functions is replaced by the `helpers` section in module configuration.
  - The A2 `self.apiRoute()` method used to add a custom API route is replaced by the `apiRoutes` section in module configuration.
  - The A2 `self.renderRoute()` method used to add a custom template rendering route is replaced by the `renderRoutes` section in module configuration.
  - The A2 `self.route()` method used to add a custom Express route is replaced by the `routes` section in module configuration.
  - The A2 `self.on()` method that watched for Apostrophe server-side promise events is replaced by the `handlers` section in module configuration.
  - The A2 `self.addFilter()` method used to add MongoDB cursor filters is replaced by the `queries` section and its `builders` subsection in module configuration.
  - Custom `lib/cursor.js` files for modules are no longer loaded. Migrate this code to the new `queries` section as well.
  - The A2 `self.expressMiddleware` system for adding Express middleware functions is replaced by the `middleware` section in module configuration.
  - The A2 `self.addTask()` method for adding CLI tasks is replaced by the `tasks` section in module configuration.

### Areas and pages

- Every page type will need a corresponding module (in A2 this was only necessary if the page had custom fields or functionality). Page templates live in the page type module rather than in the base page module.
- Areas must be declared as fields in the [content field schema](/guide/content-schema.md). They will no longer work if simply added to template files without being registered.
- The area template tag format is now `{% area data.page, 'areaName' %}`. Note that this no longer includes the object of widget configuration since that is now done in module configuration.
- Area "singletons" are no longer a separate field type or template helper. They were always simply areas that only allowed one widget. With the other area changes, there is not much benefit to having that feature over adding the `max: 1` option to an area field.

### Other module configuration changes

- In A2, relationships between two piece or page types were referred to as "joins." In A3 they are called "relationships." [The `relationship` field type](/reference/field-types/relationship.md) is fundamentally the same as the previous `joinByArray` and `joinByOne` fields (using a `max: 1` option to replicate the latter). [See the guide](relationships.md#using-a-relationship-in-templates) regarding for changes in template use.
- The `array` field type uses [a new syntax for adding its field schema](/reference/field-types/array.md#module-field-definition), matching the new module field schema syntax.
- The `tags` field from A2 no longer exists. In most cases we recommend replacing that by adding a piece type for categorization. The core `@apostrophecms/image-tag` and `@apostrophecms/file-tag` modules are examples of this.
