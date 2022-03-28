---
sidebarDepth: 2
---

# Migration from Apostrophe 2

While many foundational patterns from Apostrophe 2 (A2) were maintained in Apostrophe 3 (A3), there are significant breaking changes to both the database document structure and site-building APIs. This guide will summarize those and cover how to begin upgrading website and standalone module projects from A2 to A3. Importantly, it will also introduce [tools for developers to automate most of the necessary migration work](#migration-tools-and-process).

## Breaking changes

The updates described below are the majority of significant breaking changes, but are not completely comprehensive.

### Code syntax, APIs, and module configuration

#### Codebase structure and module naming

- The modules directory moved from `/lib/modules` to `/modules` since there was little need for the additional nesting.
- All core modules have been namespaced with `@apostrophecms`. For example, the `apostrophe-pages` module is now `@apostrophecms/page`. At project level you can configure this module in `/modules/@apostrophecms/page/index.js`.

::: note
Project-specific modules should not use the `@apostrophecms` namespace to avoid future collisions.
:::

- Official doc type modules are now singular as well, e.g., `@apostrophecms/file`.
- Due to core module name changes, the `name` option is no longer necessary (or functional) in page and piece type modules. Module names now exactly match the document `type` property (e.g., `@apostrophecms/user`, `@apostrophecms/image`).

#### Updated UI and module architecture

- Most any user interface customizations based on the A2 jQuery code will no longer work.
- [As noted on the migration overview page](/guide/migration/overview.md#other-notable-improvements), Apostrophe no longer provides jQuery, lodash, or Moment.js to browsers by default. If you need any of those libraries in the client you will need to provide them.
- Due to the module architecture changes, all modules in an A2 project would need to be refactored when migrating to A3. Most configurations and methods will be reusable, but they will need to be rearranged. See the [module reference](/reference/module-api/module-overview.md) for details. Here are some highlights:
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
- The new area template tag renders asynchronously, which the standard [Nunjucks macro](https://mozilla.github.io/nunjucks/templating.html#macro) doesn't not support. Macros containing area tags must be converted to ["fragments"](/guide/fragments.md), the comparable feature in A3.
  - As a rule we encourage developers to use fragments instead of macros in most every case. See the fragments guide for information on exceptions.
- Area "singletons" are no longer a separate field type or template helper. They were always simply areas that only allowed one widget. With the other area changes, there is not much benefit to having that feature over adding the `max: 1` option to an area field.

#### Client-side assets

- A2 widget player formats are deprecated. The "lean" widget player structure can be more easily converted to the [A3 widget player](/guide/custom-widgets.md#client-side-javascript-for-widgets) due to a similar structure.
- The `pushAsset` method for delivering CSS and client-side JS is replaced by [placing files in the correct location](/guide/front-end-assets.md).

#### Other changes

- Every page type will need a corresponding module (in A2 this was only necessary if the page had custom fields or functionality). Page templates live in the page type module rather than in the base page module.
- In A2, relationships between two piece or page types were referred to as "joins." In A3 they are called "relationships." [The `relationship` field type](/reference/field-types/relationship.md) is fundamentally the same as the previous `joinByArray` and `joinByOne` fields (using a `max: 1` option to replicate the latter). [See the guide](relationships.md#using-a-relationship-in-templates) regarding for changes in template use.
- The `array` and `object` field types use [a new syntax for adding their field schemas](/reference/field-types/array.md#module-field-definition), matching the new module field schema syntax.
- The `tags` field from A2 no longer exists. In most cases we recommend replacing that by adding a piece type for categorization. The core `@apostrophecms/image-tag` and `@apostrophecms/file-tag` modules are examples of this.
- Template helper methods need to be adjusted to use the singular form of their module aliases, e.g., `apos.attachments.url` to `apos.attachment.url`.

### Data Structure

The following changes apply to database documents in A2 databases' primary content collection, `aposDocs`, unless otherwise specified.

- Apostrophe core *doc type* names (the `type` property) change to reflect the comparable A3 module names (e.g., `apostrophe-image`, `@apostrophecms/image`).
- Apostrophe core *widget type* names (the `type` property) change to reflect the comparable A3 module names (e.g., `apostrophe-video` to `@apostrophecms/video`). This is equal to the widget module name without its `-widget` suffix.
- There are always at least two database documents for each published document: one representing the published document and another representing the draft, potentially with unpublished changes. Once changes are saved after initial publication, another for the "previous" state is added. The "previous" document is not required for initial operation, however.
  - The exception to this is when a module has the [`localized: false` option](/reference/module-api/module-options.md#localized). The `@apostrophecms/user` module is the only such case in Apostrophe core.
- Unique ID and document state properties evolved to support the document version system.
  - The `_id` property is now a combination of a unique string, a locale identifier (defaults to `en`), and the document mode (e.g., `ckokisysc00048d4l5zdo9l0c:en:published`).
  - A new property, `aposLocale` stores the full locale, e.g., `en:published`.
  - A new property `aposMode` stores the document mode, e.g., `published`.
  - A new property `aposDocId` stores the unique document ID (shared between each variation), e.g., `ckokisysc00048d4l5zdo9l0c`.
- `metaType` properties identify particular sections of document structure. These help Apostrophe property operate on similar content object structures.
  - All `aposDocs` documents have a top level `metaType: 'doc'` property.
  - Area field objects within documents have a `metaType: 'area'` property.
  - Widget objects within areas have a `metaType: 'widget'` property.
  - Individual array field items include a `metaType: 'arrayItem'` property.
- A2 join field properties, now "relationships" in A3, have a new name structure.
- `singleton` fields are no longer supported. They are `area` fields in A3.
- The `trash` property is `archived` in A3.
- Attachment documents in the `aposAttachments` DB collection change the `trashDocIds` property to `archivedDocIds`.

## Migration tools and process

Migrating an Apostrophe 2 codebase and data should be done with care, but there are two official tools that can help speed the process along. Both tools are still somewhat early in development, so it is important to use them locally (not in production) and make sure to back up code and data before using them.

**The Apostrophe team is very interested in feedback on these upgrader tools.** With each of their limitations in mind, please provide any comments, bug reports, code contributions, or feature requests as issues on the respective Github repositories.

### Content Upgrader

While completely manual code migration is possible, the *Content* Upgrader tool is basically essential for data conversion. Writing custom data migrations would not be able to do many things differently from the official tool and there is very little to gain by doing so.

The Content Upgrader tool does not change anything in the original Apostrophe 2 database. Instead, it reads that original database and creates a *new database* using a name the developer provides. That new database will contain the original data, converted for use in Apostrophe 3.

Developers will install the Content Upgrader as a module **within the A2 project**. This allows it to access schemas and other important project information. **See the [Content Upgrader README](https://www.npmjs.com/package/@apostrophecms/content-upgrader) for full instructions.**

::: note
The Content Upgrader tool is currently published as an **alpha** release. It is essentially feature complete, but will require additional testing before it is released as fully stable. We encourage developers to begin trying it on A2 projects and [provide feedback](https://github.com/apostrophecms/content-upgrader/issues/new) as we prepare for a stable release.
:::

#### Limitations

There are a few limitations in the Content Upgrader to understand before using it.

- Users and groups are not migrated. This is because the user roles of A3 differ in design from the permissions groups of A2. Copying users directly could create security issues. Create new accounts on the A3 project or arrive at your own migration strategy.
- A2 has a built-in `apostrophe-images` widget type that acts as a slideshow when multiple images are selected. A3 only has a built-in single-image `@apostrophecms/image` widget type. By default `apostrophe-images` will be upgraded to `@apostrophecms/image`, with only the first image present in each. However you can use the `mapWidgetTypes` option (see the README) to override this mapping during the upgrade.
- Since A3 does not have a built-in cropping feature yet, there is currently no accommodation for it in A3's `@apostrophecms/image` widget type. The tool attempts to carry over the cropping data in the format which is expected to work in A3 in the near future.

### Code Upgrader

The *Code* Upgrader tool supports upgrading codebases for **full Apostrophe projects** (websites) and **installable modules**. It has two major roles in converting an A2 codebase to use Apostrophe 3:

1. It will lint an Apostrophe codebase for A2 syntax and structure that must change. This is its `lint` command.
2. It will *make* many of those code changes for you. This is its `upgrade` command.

Additionally, there is a `reset` command that can undo all uncommitted changes. Always use a new git branch during this process as well to have an additional way to roll back changes.

One reason we recommend using this tool to execute changes on a full project is that it will make minimal code adjustments for A3 use. This is important because additional changes (such as field name changes), could unnecessarily break compatibility with the [upgraded database](#content-upgrader). After running the automatic code upgrade, take care in the final code changes to avoid affecting data compatibility.

The Code Upgrader is installed globally in a Node environment (including developer environments) and run as a command line tool. **See the [Code Upgrader README](https://www.npmjs.com/package/@apostrophecms/code-upgrader) for full instructions.**

::: note
The Code Upgrader tool is currently published as an **alpha** release. It will lint most A2 feature that need updating, but there are several features that it cannot automatically upgrade yet. The tool will never do 100% of necessary code conversion, but we will continue adding feature support before it can be published as a full 1.0 release.

We encourage developers to begin trying it on A2 projects and [provide feedback](https://github.com/apostrophecms/code-upgrader/issues/new) as we prepare for a stable release.
:::

#### Limitations

Just as with the content tool, the Code Upgrader has some limitations to understand. While database structure is very predictable, code styles and patterns are not. Some A2 APIs and syntax are intentionally not touched to avoid making incorrect assumptions.

- The tool is designed to operation on the majority of standard Apostrophe 2 codebases. Projects that generally follow patterns in official documentation and sample projects will have the best results. The tool will help on very custom projects (especially the linting mode), but more manual work will be always be needed to finish the work.
- [Widget player code](/guide/custom-widgets.md#client-side-javascript-for-widgets) (client-side JavaScript) is not changed. The original widget player syntax relies on jQuery, which A3 does not include. A2 "lean" players may be supported in the future.
- [Areas](/reference/glossary.md#area) (and A2's "singletons") that are only defined in A2 template files, "anonymous areas," are not changed. In A3 all areas must be registered in a module's field schema, however the complexity of area configuration (and limitations of template parsers) make them better converted manually.
- [As mentioned above](#limitations) the image widget only supports a single image in A3. As in the content tool, these are converted to the equivalent A3 version, but full slideshow conversion will need to be done manually.
- As the tool is still in development, some features will eventually be supported in the automatic upgrade, but are not yet. We appreciate your patience during development.

In many of these limitation cases the **`lint`** command will still alert you to the outdated code so you can find it and make changes manually.