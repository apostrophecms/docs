---
next: 
  text: 'Upgrading from A2 to A4'
  link: '/guide/migration/upgrading.html'
---

# Migration from Apostrophe 3 to Apostrophe 4

## Introduction

Apostrophe’s admin UI is built on the Vue UI framework. Until the 4.x release of Apostrophe, it was built on Vue 2.x, which has reached its official end of life. That means there will be no more free upstream support for Vue 2.x from the Vue development team. So, we have migrated ApostropheCMS to the fully supported Vue 3.x release. This ensures ongoing support and also allows admin UI developers to follow new and improved practices when coding with Vue.

Of course, we recognize that our customers’ code needs to be safe and secure and reliable in the meantime. Therefore we have committed to provide fixes or workarounds for any critical security issues with Vue 2.x until April 2025. However in practice Vue security issues have been very rare because security is primarily the responsibility of the server (Apostrophe) and not the client (Vue).

As part of releasing Vue 3 support, we updated the major version number of Apostrophe from 3.x to 4.x.
While the differences are minor for most projects, we updated the major version number to ensure we follow
[semantic versioning](https://semver.org/) best practices, avoiding any inconvenience for customers who
have written custom admin UI code that requires modification. However, **most projects will not require
any modification to work with 4.x** other than changing versions in `package.json`.

There are **no changes in Apostrophe 4.x** other than the use of Vue 3 for the admin interfaces.

We will support Apostrophe 3.x (which is based on Vue 2.x) until **April 2025.** But since the migration
to 4.x is straightforward and our new efforts will be focused there, 3.x support will increasingly be
a matter of security fixes only. Therefore it is recommended that all developers migrate to 4.x.

## How to upgrade your project

After upgrading Apostrophe will work exactly the same, except as explicitly noted below. You’ll want to make these changes **together,** and follow them with a single `npm update` command.

- In `package.json`, change your dependency on `apostrophe` to `^4.0.0`.
- Make similar changes for the following modules, **if you use them.**
    - `@apostrophecms-pro/data-set`: change to `^2.0.0`.
    - `@apostrophecms-pro/document-versions`: change to `^2.0.0`.
    - `@apostrophecms-pro/doc-template-library`: change to `^2.0.0`.
    - `@apostrophecms-pro/palette`: change to `^4.0.0`.
    - `@apostrophecms-pro/signup`: change to `^2.0.0`.
    - `@apostrophecms-pro/advanced-permission`: change to `^3.0.0`. Note this is based on the `^2.0.0`
    series, so if you were used to the `^1.0.0` series review the [documentation](https://apostrophecms.com/extensions/advanced-permission)
    for more information about what will change with this upgrade.

- **Run the `npm update` command.** This is necessary to ensure other modules receive required minor
or patchlevel version updates.

## For those who have not customized our admin UI

If you have not created custom admin UI field types, overridden various admin UI Vue components, or **otherwise created any code in ui/apos subdirectories of your modules,** then **you are done.** Your project has been upgraded and will work exactly as before. As with any upgrade, we recommend QA in your staging environment before a production release.

Just to be clear… *front end code in `ui/src` folders does not have to change at all.* And of course server side code is entirely unaffected by this change.

::: info
No custom admin UI code? You’re done! 🎉 You can stop here and start testing the results.
:::

## For those who have customized our admin UI

The changes to be made in `ui/apos` are surprisingly few in all. Most existing admin UI code can run without modification. Familiar Vue 2 features like single-file components, traditional component structure and mix-ins are still 100% supported by Vue 3.

But, often some smaller changes are necessary. Here are the most frequently encountered concerns:

### Vue components: stylesheets

::: info
In Apostrophe, admin UI components are found in `ui/apos/components` subdirectories. Check for such subdirectories in your own project-level code before continuing. If you don’t have any, you can move on.
:::

**Deep selectors have changed**

In the `style` elements of your Vue components (look for `ui/apos/components` subdirectories in your own code), you will need to modernize any `v-deep` selectors:

```css
// OLD
v-deep .apos-button {...}

// NEW
:deep(.apos-button) {...}
```

*You do not need to touch your `ui/src/index.scss` or other stylesheets outside of `ui/apos` and its Vue components at all.*

### Vue components: JavaScript

::: info
In Apostrophe, admin UI components are found in `ui/apos/components` subdirectories. Check for such subdirectories in your own project-level code before continuing. If you don’t have any, you can move on.
:::

#### `v-model` props and events have changed

The names of the props and events automatically used by the `v-model` feature have changed. If you have implemented the `v-model` pattern yourself, you will need to update your code:

```nunjucks
<!-- These are the props passed by Vue when using v-model.
  In some cases we may want to pass them manually 
  to have more power over what's happening -->

<!-- OLD -->
<AposSchema
  :value="docFields"
  @input="updateDocFields"
/>

<!-- NEW -->
<AposSchema
  :model-value="docFields"
  @update:model-value="updateDocFields"
/>
```

Note that in JavaScript code you would therefore access `this.modelValue`  instead of `this.value`.

::: warning
An exception: field input components like `AposInputRadio` still use the `input` event handler.
:::

#### Life cycle events have changed

`beforeDestroy` becomes `beforeUnmount`  and `destroyed` becomes `unmounted`.

#### `Vue.set` has been removed and is not necessary

The global `Vue` methods `set` and `delete`, and the instance methods `$set` and `$delete`, no longer exist. They are no longer required with Vue 3's proxy-based change detection.

```javascript
// OLD
this.$set(this.personObject, 'bio', bio)

// NEW
this.personObject['bio'] = bio
```

### Vue apps

::: info
 In Apostrophe, admin UI “apps” are found in `ui/apos/apps` subdirectories. Check for such subdirectories in your own project-level code before continuing. If you don’t have any, you can move on.
:::

Most projects don’t involve custom Apostrophe Vue “apps,” just custom and overridden Vue components. But, some projects do.

The syntax for instantiating Vue apps has changed in Vue 3. Here’s an example, taken from Apostrophe’s built-in “busy indicator” Vue app:

```javascript
// OLD
import Vue from 'Modules/@apostrophecms/ui/lib/vue';

export default function() {
  return new Vue({
    el: '#apos-busy',
    render: function (h) {
      return h('TheAposBusy');
    }
  });
};

// NEW
import createApp from 'Modules/@apostrophecms/ui/lib/vue';

export default function() {
  const component = apos.vueComponents.TheAposBusy;
  const el = document.querySelector('#apos-busy');
  if (!el) {
    return;
  }
  const app = createApp(component);
  app.mount(el);
};
```

Important things to note:

- As always, you should import Vue via our official wrapper as shown above.
- Although Vue 3 doesn’t natively support registering components globally by name, the `createApp` function, which is new in Vue 3, has been enhanced to automatically register components the same way we did in Vue 2.
- However, we still need a way to pass a “root” component when creating an app. In your project-level work, you have two options: you can `import` it in the usual way, or you can do what we’ve done here, accessing it by name on the `apos.vueComponents` object, which contains all components discovered in the `ui/apos/components` subdirectories of any module.

### Notes on popular Vue libraries used in Apostrophe

Although you normally don’t need to worry about the internal choices we made in our own components, it is worth noting that we replaced certain obsolete packages with new ones that support Vue 3:

- `@apostrophecms/vue-color`  was replaced by `@ckpack/vue-color`
- `vuedraggable` was replaced by `sortablejs-vue3`
- `v-tooltip`  was removed in favor of an internal implementation using `@floating-ui/dom`  (`AposContextMenu.vue`  and the directive `v-apos-tooltip`  were updated, so they work exactly the same as before).
- `vue-material-design-icons` has been migrated to `@apostrophecms/vue-material-design-icons` and packaged for Vue 3, but otherwise left **exactly the same** so that your icon names will still work without modification.

### Additional resources

Thanks to the Vue team’s foresight in maintaining such a large degree of backwards compatibility, these notes cover everything most developers will have to do. However, depending on your implementation other changes could be needed. We recommend that you read the [Vue 3 official migration guide](https://v3-migration.vuejs.org/breaking-changes/). Note that we did not use Vue 3’s “compatibility mode” for this migration, as the changes to support Vue 3 fully turned out to be straightforward.