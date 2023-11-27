--
extends: '@apostrophecms/doc-type'
---

# `@apostrophecms/page-type`

<AposRefExtends :module="$frontmatter.extends" />

This module serves as the cornerstone for creating page types in Apostrophe. It allows developers to define multiple page types, each with its own configuration methods, schema fields, and template(s), including fragments. It adds the `type` field and `orphan` field, which controls the visibility of the page in the navigation, to the schema fields already exposed by the `@apostrophecms/doc-type` module. Any newly created page type needs to be added to both the `app.js` file, but also to the `types` array in the options of the `@apostrophecms/page` module. The object for each page type should have a `name` property that takes the module name and a `label` property that is used to populate the choices of page types presented to the content manager when they create a new page.

## Featured Methods:
dispatch
dispatchAll