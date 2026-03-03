---
next: false
---
# Migration from Apostrophe 2 to Apostrophe 4 with AI

While many foundational patterns from Apostrophe 2 (A2) were maintained in Apostrophe 3 and now in the latest versions of Apostrophe, there are significant breaking changes to both the database document structure and site-building APIs. This guide will summarize those and cover how to begin upgrading website and standalone module projects from A2 to the newest Apostrophe. Importantly, it will also introduce [tools for developers to automate most of the necessary migration work with AI](#migration-tools-and-process).

## Breaking changes

The updates described below are the majority of significant breaking changes but are not completely comprehensive.

### Code syntax, APIs, and module configuration

#### Codebase structure and module naming

- The modules directory moved from `/lib/modules` to `/modules` since there was little need for the additional nesting.
- All core modules have been namespaced with `@apostrophecms`. For example, the `apostrophe-pages` module is now `@apostrophecms/page`. At project level, you can configure this module in `/modules/@apostrophecms/page/index.js`.

::: info
Project-specific modules should not use the `@apostrophecms` namespace to avoid future collisions.
:::

- Official doc-type modules are now singular as well, e.g., `@apostrophecms/file`.
- Due to core module name changes, the `name` option is no longer necessary (or functional) in page and piece-type modules. Module names now exactly match the document `type` property (e.g., `@apostrophecms/user`, `@apostrophecms/image`).

#### Updated UI and module architecture

- Most any user interface customizations based on the A2 jQuery code will no longer work.
- [As noted on the migration overview page](/guide/migration/overview.md#other-improvements), Apostrophe no longer provides jQuery, lodash, or Moment.js to browsers by default. If you need any of those libraries in the client you will need to provide them.
- Due to the module architecture changes, all modules in an A2 project would need to be refactored when migrating to a newer version. Most configurations and methods will be reusable, but they will need to be rearranged. See the [module reference](/reference/module-api/module-overview.md) for details. Here are some highlights:
  - Module field schemas now use an object structure on the `fields` property. It has `add`, `remove`, and `group` subproperties to replace A2's `addFields`, `removeFields`, and `arrangeFields`.
  - `columns` (for piece manager UI columns) is structured similarly to `fields` with `add`, `remove`, and `order` subproperties. This replaces A2's `addColumns` property.
  - `filters` (for piece manager filters) is structured similarly to `fields` with `add`, and `remove` subproperties. This replaces A2's `addFilters` property.
  - Many module settings that were top level properties in A2 (e.g., `label`, `alias`, `sort`) are now subproperties of `options`. These include all settings that are *not* covered in the [module properties overview reference](/reference/module-api/module-overview.md). See the [module options reference](/reference/module-api/module-options.md) for more on that.
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

#### Areas, singletons, and template macros

- Areas must be declared as fields in the [content field schema](/guide/content-schema.md). They will no longer work if simply added to template files without being registered.
- The area template tag format is now `{% area data.page, 'areaName' %}`. Note that this no longer includes the configuration of widgets since that is now done in module configuration.
- The new area template tag renders asynchronously, which the standard [Nunjucks macro](https://mozilla.github.io/nunjucks/templating.html#macro) doesn't not support. Macros containing area tags must be converted to ["fragments"](/guide/fragments.md), the comparable feature in newer versions of Apostrophe.
  - As a rule, we encourage developers to use fragments instead of macros in almost every case. See the fragments guide for information on exceptions.
- Area "singletons" are no longer a separate field type or template helper. They were always simply areas that only allowed one widget. With the other area changes, there is not much benefit to having that feature over adding the `max: 1` option to an area field.

#### Client-side assets

- A2 widget player formats are deprecated. The "lean" widget player structure can be more easily converted to the [new widget player](/guide/custom-widgets.md#client-side-javascript-for-widgets) due to a similar structure.
- The `pushAsset` method for delivering CSS and client-side JS is replaced by [placing files in the correct location](/guide/front-end-assets.md).

#### Other changes

- Every page type will need a corresponding module (in A2 this was only necessary if the page had custom fields or functionality). Page templates live in the page type module rather than in the base page module.
- In A2, relationships between two piece or page types were referred to as "joins." Now they are called "relationships." [The `relationship` field type](/reference/field-types/relationship.md) is fundamentally the same as the previous `joinByArray` and `joinByOne` fields (using a `max: 1` option to replicate the latter). [See the guide](/reference/field-types/relationship.md).
- The `array` and `object` field types use [a new syntax for adding their field schemas](/reference/field-types/array.md#module-field-definition), matching the new module field schema syntax.
- The `tags` field from A2 no longer exists. In most cases, we recommend replacing that by adding a piece type for categorization. The core `@apostrophecms/image-tag` and `@apostrophecms/file-tag` modules are examples of this.
- Template helper methods need to be adjusted to use the singular form of their module aliases, e.g., `apos.attachments.url` to `apos.attachment.url`.

### Data Structure

The following changes apply to database documents in A2 databases' primary content collection, `aposDocs`, unless otherwise specified.

- Apostrophe core *doc type* names (the `type` property) change to reflect the comparable apostrophe module names (e.g., `apostrophe-image`, `@apostrophecms/image`).
- Apostrophe core *widget type* names (the `type` property) change to reflect the comparable apostrophe module names (e.g., `apostrophe-video` to `@apostrophecms/video`). This is equal to the widget module name without its `-widget` suffix.
- There are always at least two database documents for each published document: one representing the published document and another representing the draft, potentially with unpublished changes. Once changes are saved after initial publication, another for the "previous" state is added. The "previous" document is not required for initial operation, however.
  - The exception to this is when a module has the [`localized: false` option](/reference/module-api/module-options.md#localized). The `@apostrophecms/user` module is the only such case in Apostrophe core.
- Unique ID and document state properties evolved to support the document version system.
  - The `_id` property is now a combination of a unique string, a locale identifier (defaults to `en`), and the document mode (e.g., `ckokisysc00048d4l5zdo9l0c:en:published`).
  - A new property, `aposLocale` stores the full locale, e.g., `en:published`.
  - A new property `aposMode` stores the document mode, e.g., `published`.
  - A new property `aposDocId` stores the unique document ID (shared between each variation), e.g., `ckokisysc00048d4l5zdo9l0c`.
- `metaType` properties identify particular sections of document structure. These help Apostrophe property operate on similar content object structures.
  - All `aposDocs` documents have a top-level `metaType: 'doc'` property.
  - Area field objects within documents have a `metaType: 'area'` property.
  - Widget objects within areas have a `metaType: 'widget'` property.
  - Individual array field items include a `metaType: 'arrayItem'` property.
- A2 join field properties, now "relationships" in newer versions, have a new name structure.
- `singleton` fields are no longer supported. They are `area` fields in newer versions.
- The `trash` property is `archived` in newer versions.
- Attachment documents in the `aposAttachments` DB collection change the `trashDocIds` property to `archivedDocIds`.

## Migration tools and process

Migrating an Apostrophe 2 codebase and data should be done with care, but there are two official tools that can help speed the process along. Both tools are still somewhat early in development, so it is important to use them locally (not in production) and make sure to back up code and data before using them.

**The Apostrophe team is very interested in feedback on these upgrader tools.** With each of their limitations in mind, please provide any comments, bug reports, code contributions, or feature requests as issues on the respective Github repositories.

### Content Upgrader

While completely manual code migration is possible, the *Content* Upgrader tool is basically essential for data conversion. Writing custom data migrations would not be able to do many things differently from the official tool and there is very little to gain by doing so.

The Content Upgrader tool does not change anything in the original Apostrophe 2 database. Instead, it reads that original database and creates a *new database* using a name the developer provides. That new database will contain the original data, converted for use in the newest versions of Apostrophe.

Developers will install the Content Upgrader as a module **within the A2 project**. This allows it to access schemas and other important project information. **See the [Content Upgrader README](https://www.npmjs.com/package/@apostrophecms/content-upgrader) for full instructions.**

::: info
The Content Upgrader tool is currently published as an initial stable release. It is essentially feature-complete but may miss some edge cases. We encourage developers to begin trying it on A2 projects and [provide feedback](https://github.com/apostrophecms/content-upgrader/issues/new) as we prepare for a stable release.
:::

#### Limitations

There are a few limitations in the Content Upgrader to understand before using it.

- Users and groups are not migrated. This is because the user roles of newer versions differ in design from the permissions groups of A2. Copying users directly could create security issues. Create new accounts in your updated project or arrive at your own migration strategy.
- A2 has a built-in `apostrophe-images` widget type that acts as a slideshow when multiple images are selected. The newer Apostrophe versions only has a built-in single-image `@apostrophecms/image` widget type. By default, `apostrophe-images` will be upgraded to `@apostrophecms/image`, with only the first image present in each. However, you can use the `mapWidgetTypes` option (see the README) to override this mapping during the upgrade.


### Code Upgrader

The *Code* Upgrader extension supports upgrading codebases for **full Apostrophe projects** (websites) and **installable modules**.

This extension includes an AI Agent Skill (Claude Skill). The Agent Skill is now the recommended way to carry out the upgrade, as this is exactly where AI excels most. Developers using Claude Code and similar tools can complete over 90% of the migration work quickly, and we have also been successful in resolving remaining issues by directing Claude Code. The last 5% of the work usually involves attention to what is rendering on the page.

The Code Upgrader extension also includes legacy tools for those who prefer not to use the Agent Skill. These tools have much more limited support for automatic upgrades, however the linting feature can be useful.

**See the [Code Upgrader README](https://www.apostrophecms.com/extensions/code-upgrader) for full instructions,** including how to install and use the Agent Skill.
