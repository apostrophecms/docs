---
sidebarDepth: 2
---

# Migration from Apostrophe 2

While many foundational patterns from Apostrophe 2 (A2) were maintained in Apostrophe 3 (A3), there are significant breaking changes to both the database document structure and site-building APIs. This guide will summarize those and cover how to begin upgrading website and standalone module projects from A2 to A3. Importantly, we will introduce [tools for developers to automate most of the necessary migration work](#migration-process).

## Breaking changes

The updates described below are the majority of significant breaking changes, but are not completely comprehensive.

### Code syntax, APIs, and module configuration

#### Codebase structure and module naming

- The modules directory moved from `/lib/modules` to `/modules` since there was little need for the additional nesting.
- All core modules have been namespaced with `@apostrophecms`. For example, the `apostrophe-pages` module is now `@apostrophecms/page`. You can configure this in projects in `/modules/@apostrophecms/page/index.js`.

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

#### Areas and pages

- Every page type will need a corresponding module (in A2 this was only necessary if the page had custom fields or functionality). Page templates live in the page type module rather than in the base page module.
- Areas must be declared as fields in the [content field schema](/guide/content-schema.md). They will no longer work if simply added to template files without being registered.
- The area template tag format is now `{% area data.page, 'areaName' %}`. Note that this no longer includes the configuration of widgets since that is now done in module configuration.
- Area "singletons" are no longer a separate field type or template helper. They were always simply areas that only allowed one widget. With the other area changes, there is not much benefit to having that feature over adding the `max: 1` option to an area field.

#### Client-side assets

- A2 widget player formats are deprecated. The "lean" widget player structure can be more easily converted to the [A3 widget player](/guide/custom-widgets.md#client-side-javascript-for-widgets) due to a similar structure.
- The `pushAsset` method for delivering CSS and client-side JS is replaced by [placing files in the correct location](/guide/front-end-assets.md).
- The `/public` directory *within modules* is [moved to `/ui/public`](/guide/static-module-assets.md).

#### Other changes

- In A2, relationships between two piece or page types were referred to as "joins." In A3 they are called "relationships." [The `relationship` field type](/reference/field-types/relationship.md) is fundamentally the same as the previous `joinByArray` and `joinByOne` fields (using a `max: 1` option to replicate the latter). [See the guide](relationships.md#using-a-relationship-in-templates) regarding for changes in template use.
- The `array` field type uses [a new syntax for adding its field schema](/reference/field-types/array.md#module-field-definition), matching the new module field schema syntax.
- The `tags` field from A2 no longer exists. In most cases we recommend replacing that by adding a piece type for categorization. The core `@apostrophecms/image-tag` and `@apostrophecms/file-tag` modules are examples of this.
- Template helper methods need to be adjusted to use the singular form of their module aliases, e.g., `apos.attachments.url` to `apos.attachment.url`.

### Data Structure

The following changes apply to database documents in A2 databases' primary content collection, `aposDocs`, unless otherwise specified.

- Apostrophe core *document* type names (the `type` property) change to reflect the A3 version names (e.g., `apostrophe-image`, `@apostrophecms/image`).
- Apostrophe core *widget* type names (the `type` property) change to reflect the A3 version names (e.g., `apostrophe-video` to `@apostrophecms/video`).
- There are always at least two database documents for each published document: one representing the published document and another representing the draft, potentially with unpublished changes. Once changes are saved after initial publication, another for the "previous" state is added. The "previous" document is not required for initial operation, however.
- Unique ID and document state properties evolved to support the document version system.
  - The `_id` property is now a combination of a unique string, a locale identifier (defaults to `en`), and the document mode (e.g., `ckokisysc00048d4l5zdo9l0c:en:published`).
  - A new property, `aposLocale` stores the full locale, e.g., `en:published`.
  - A new property `aposMode` stores the document mode, e.g., `published`.
  - A new property `aposId` stores the unique document ID (shared between each variation), e.g., `ckokisysc00048d4l5zdo9l0c`.
- `metaType` properties identify particular sections of document structure. These help Apostrophe property operate on similar content object structures.
  - All `aposDocs` documents have a top level `metaType: 'doc'` property.
  - Area field objects within documents have a `metaType: 'area'` property.
  - Widget objects within areas have a `metaType: 'widget'` property.
  - Individual array field items include a `metaType: 'arrayItem'` property.
- A2 join field properties, now "relationships" in A3, have a new name structure.
- `singleton` fields are no longer supported. They are `area` fields in A3.
- The `trash` property is `archived` in A3.
- Attachment documents in the `aposAttachments` DB collection change the `trashDocIds` property to `archivedDocIds`.

## Migration process

- Introduce tools
	- Content upgrader
		- Pretty much essential to avoid essentially reproducing it
		- Doesn't actually touch the old database (reads it)
		- Limitations:
			- doesn't migrate users due to permission complication
				- recommendation for this
			- No groups in A3, so groups not migrated
			- Core image widget doesn't support multiple images, so only grabs first image
		- Retains all original data in the new db just in case(?)
		- What you'll need to do manually
			- users, groups, image slideshows
	- Code upgrader
		- Pairs well with content upgrader to ensure a matching structure
			- Recommended istead of 100% manual migration for this reason
		- Also handles module upgrading
		- Designed to take care of the majority of a standard Apostrophe 2 code base
		- Limitations (What you'll need to do manually)
			- Deprecated properties
			- Original style widget players
			- The scanner will highlight things for you.
		-  Not meant to convert a codebase 100%, but 80%+ to let you focus on more custom pieces
	- Please tell us where these don't work!
