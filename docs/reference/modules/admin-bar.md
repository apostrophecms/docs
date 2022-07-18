---
extends: '@apostrophecms/module'
---

# `@apostrophecms/admin-bar`

**Alias:** `apos.adminBar`

<AposRefExtends :module="$frontmatter.extends" />

This module implements Apostrophe's admin bar at the top of the page. Any module can register a button (or more than one) for the bar by calling the `add` method of this module. Buttons can also be grouped into dropdown menus and restricted to those with particular permissions. The [apostrophe-pieces](/reference/modules/piece-type.md) takes advantage of this module automatically.

## Options

Options are passed into the admin-bar module by "extending" it through an `index.js` file typically located in the project modules folder, nested inside a `admin-bar` subfolder, inside a `@apostrophecms` folder.
For example
```
deployment
lib
modules
┗ @apostrophecms
┆              ┗ admin-bar
┆                        ┗ i18n
┆                        ┆    ┗ en.json
┆                        ┆      fr.json
┆                          index.js
@node_modules
app.js
```
The options passed in through this manner will configure the existing `node_modules->apostrophe/lib/modules/admin-bar` module options through implicit subclassing. This same type of configuration takes place when you create a `modules->@apostrophecms->pages->index.js` file in the project to add configuration to the main `page` module. 

|  Property | Type | Description |
|---|---|---|
|`groups` | Array | Adds one or more menu item group objects to be displayed in dropdown menus |

### `groups`

The `groups` option takes an array of one or more objects that group several menu items together in the admin bar as a dropdown menu. Each of the `groups` objects requires a `label` and an array of menu `items`. The `label` will be used as the label displayed in the menu. The `items` array contains the names of the individual menu items you want to appear in the dropdown, entered in the order you want them to appear. Note: Menu names for `piece-type` items are the name of the piece-type, not the lable. For core items, like 'Images', the name is prefixed - '@apostrophecms/image'.

**Example**
```javascript
// modules/@apostrophecms/admin-bar/index.js
module.exports = {
  options: {
    groups: [
      {
        name: 'media',
        label: 'Media',
        items: [
          '@apostrophecms/image',
          '@apostrophecms/file',
          '@apostrophecms/image-tag',
          '@apostrophecms/file-tag'
        ]
      }
    ]
  }
};
```
Will result in grouping those four core modules into a single dropdown menu displayed as 'Media' on the menu bar.
![ApostropheCMS admin bar with open dropdown menu titled 'Media'](/images/group-menu.png)

## Featured methods

The following method belongs to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/admin-bar/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

Because this module has an alias, you can call these from another module from the alias path. For example, `self.apos.adminBar.add()`.

### `add(name, label, permission, options)`

Add an item to the menu bar.

The `name` for the item must be unique within the menu bar to avoid conflicts. When the menu item is clicked, the `name` argument will be emitted on `apos.bus` as the value of an `admin-menu-click` event. If this item is controlling a specific modal, this will be caught by `TheAposModals` to display the correct modal. So, `name` should be the module name with a `:editor` or `:manager` suffix. For example, `@apostrophecms/global:editor`.

**Example**
```javascript
apos.bus.$on('admin-menu-click', async (item) => {
  // Make sure it is the button we care about, leave others to their own handlers
  if (item !== 'myCustomWidget:editor') {
    return;
  }
  // Custom code for button action
});
```
The `label` will be displayed on the menu bar.

`permission` is optional and takes an object with `action` and `type` properties. If no permissions are present then anyone can perform the action represented by the button. The `action` property dictates what type of action the button will perform. These include `view`, `view-draft`, `edit`, `publish`, `upload-attachment`, and `delete`. The `type` property matches the name of the module the button is managing. This type must have a registered manager.

`options` can take several properties that control positioning and display of the new menu item.

|  Property | Type | Description |
|---|---|---|
|`groups` | Array | Adds one or more objects that group menu items into dropdown menus |
|`after` | Object | Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. |
|`last` | Object | Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. |
|`contextUtility` | Object | Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. |
|`toggle` | Object | Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. |
|`tooltip` | Object | Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. |
