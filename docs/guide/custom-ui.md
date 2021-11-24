# Customizing the Apostrophe user interface

This guide focuses on how to customize Apostrophe's administrative user interface, or "admin UI." The built-in functionality covers most situations, but sometimes you'll want to add or change functionality.

## Registering custom field types

Apostrophe's [schema field types](content-schema.md) cover many situations, but you might wish to add a new one.

## Creating custom Vue components

Apostrophe's admin UI is implemented in Vue. You'll find various Vue components implemented in `.vue` files in different Apostrophe modules, including a number of modules that are packaged inside the core `apostrophe` npm module.

To add your own custom Vue components to Apostrophe's admin UI bundle, add your `.vue` files to the `ui/apos/components` subdirectory of any Apostrophe module.

Apostrophe will automatically recognize these when building assets for your project.

Note that the default `nodemon` configuration of projects created with our CLI does not watch `.vue` files for changes. You can adjust that in `package.json`.

## Overriding standard Vue components by name

Most of the time you won't need to override Vue components that ship with Apostrophe. But if you have a need, you can do by **placing a file with the same name in the `ui/apos/components` subdirectory of your own module.**

Apostrophe will use only the last version of a component that is configured. For isntance, if the last module in your project's `app.js` modules list contains a `ui/apos/components/AposLogPadless.vue` file, that logo will be used in the admin bar, in place of the version that is normally loaded from Apostrophe core.

However, **please note that only one version of a given component can be live in the project.** In particular, if you were to replace `AposDocsManager` in this way, that replacement would apply to **every piece type, not just the module in which you placed the file.**

For this reason, it is sometimes preferable to override standard Vue components through configuration, as explained below.

## Overriding standard Vue components through configuration

There can be only one `AposDocsManager` Vue component definition in a project, but sometimes we need different behavior for a specific piece type only. We could work around this by adding conditional logic to the component, but this results in code that is hard to maintain, and also means we are stuck maintaining a copy of a complex component and missing out on bug fixes and improvements. It would be better if we could **specify a different component name to be used** to manage a particular piece type.

Here is an example of how to do that:

```javascript
// in our modules/announcement/index.js file
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    components: {
      managerModal: 'AnnouncementManager'
    }
  }
}
```

With this configuration, Apostrophe will look for a Vue component called `AnnouncementManager` when the user selects "Announcements" from the admin bar, bypassing `AposDocManager`.

Of course there are other components that can be overridden in this way, and the list is growing over time. Here are the components that can currently be overridden through configuration:

| Module                    | Option             | Default          |
| --------------------------| ------------------ | ---------------- |
| @apostrophecms/piece-type | components.managerModal | AposDocsManager  |
| @apostrophecms/piece-type | components.editorModal  | AposDocEditor    |
| @apostrophecms/page       | components.managerModal | AposPagesManager |
| @apostrophecms/page       | components.editorModal  | AposDocEditor    |

For readability's sake, a `.` is used in the table above to separate sub-properties of options. If an option exists for `@apostrophecms/piece-type` it can be used for any module that extends it.

::: note
You will need to read the source of the existing component you are overriding for more information about the patterns used, props provided and APIs you may need to access.
:::