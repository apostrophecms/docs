# Module configuration settings

## All

- alias ~ set an alias to easily reference the module from other modules.
- browser ~ Initial data object to make available for the module in the client (on `window.modules['browser-name']`). Only for modules that don't overwrite `getBrowserData`
- components ~ set specific Vue components to be used for this module. (Don't doc?)
- name (optional): the module's computer name. set from the module directory if none is provided
- templateData ~ data to make available in templates on the `data` object

## Doc types

- adminOnly: `null` ~ only admins are allowed to edit this type
- autopublish: `null` ~ any saved changes on this doc type will be published immediately (there are no drafts)
- contextBar: `true` ~ allows the admin bar context bar row to appear
- label
- localized: `true` ~ docs of this type will get different versions if multiple locales are used
- slugPrefix: `null` ~ a prefix for slugs on documents of this type

## Pieces

- createControls (don't doc)
- editControls (don't doc)
- pluralLabel
- perPage ~ API per page
- publicApiProjection
- quickCreate ~ add to the quick create menu
- searchable: `null`
- sort ~ `{ updatedAt: -1 }`

## Page core module

- home ~ Set to `{ children: false }` to... does this work??
- minimumPark ~ overwrite default parked pages (home and trash)
- park ~ parked pages
- permissions?
- quickCreate: `true`
- types ~ allowed page types
- typeChoices ~ allowed page types?

## Pages
<!-- Is it for all doc types if for pieces AND pages? -->
- publicApiProjection
- scene ~ set the scene for the page?

## Pieces pages

- perPage ~ index page per page
- next ~ populate req.data.next
- piecesFilters
- piecesModuleName ~ associated piece module
- previous ~ populate req.data.previous

## Widgets
- className ~ pass in a class name
- contextual ~ only edit it in context
- label
- scene ~ set the scene for the page?