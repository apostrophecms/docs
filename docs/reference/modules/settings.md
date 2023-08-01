---
extends: '@apostrophecms/module'
---

# `@apostrophecms/settings`

**Alias:** `apos.settings`

<AposRefExtends :module="$frontmatter.extends" />

This module governs the Personal Settings menu that allows users to change their preferences. Apostrophe projects can configure this menu through `@apostrophecms/settings`. As such, these settings are personal to the user. If you're looking for sitewide settings that govern overall site behavior, check out `@apostrophecms/global`.

## Options

|  Property | Type | Description |
|---|---|---|
| [`subforms`](#subforms) | Object | Each object defines a set of input field in the Personal Settings dialog box, with its own Update button. |
| [`groups`](#groups) | Object | This option allows for the organization of subforms on tabs in the Personal Settings menu. |

<AposCodeBlock>

``` javascript
module.exports = {
  options: {
    subforms: {
      displayName: {
        fields: [ 'displayName' ],
        previewComponent: 'SettingsDisplayNamePreview',
        protection: true,
        reload: true
      },
      name: {
        label: 'Name',
        fields: [ 'firstName', 'lastName' ]
        // This preview will be automatically generated.
        // preview: '{{ firstName }} {{ lastName }}'
      },
      adminLocale: {
        fields: [ 'adminLocale' ]
      },
      changePassword: {
        // This will have `protection: true` automatically.
        fields: [ 'password' ]
      }
    },

    groups: {
      account: {
        label: 'Account',
        subforms: [ 'name', 'displayName', 'changePassword' ]
      },
      preferences: {
        label: 'Preferences',
        subforms: [ 'adminLocale' ]
      }
    }
  }
};

```

<template v-slot:cation>
  /modules/@apostrophecms/settings/index.js
</template>
</AposCodeBlock>

### `subforms`

The `subforms` option takes an object of named objects.  Each individual object has a required `fields` property that takes an array of strings that are the names of existing schema fields in the `@apostrophecms/user` settings. By default, the `password` and `adminLocale` fields are available for addition. Note that the `adminLocale` field needs to be enabled by [setting the `adminLocales` option](/reference/modules/i18n.html) of the `@apostrophecms/i18n` module.

In addition to the required `fields` property, each object can take six additional optional properties.

The `label` property takes a string to display to the user in both preview, when not editing that subform, and edit mode. If not supplied, Apostrophe will use the label for the first schema passed to the `fields` property. 

The `previewComponent` property takes the name of a Vue component that has been added to your project through any `modules/my-custom-module/ui/apos/components` folder. The string passed to this property should not contain the file extension. This component is rendered and displayed to the right of the subform label in the preview mode and has access to the values provided in the subform by the user. [See below](#previewcomponent) for further information about the component structure.

If the `previewComponent` property is not set, the `help` property will be used instead. It takes a string (or i18n key) to display to the user. If this property is not present then the `preview` property will be used. This field receives a string that can include subform schema field names, like `{{ firstName }} {{ lastName}}`, leveraging i18next as a built-in templating system and allowing different locales to put them in different orders as appropriate. Finally, if none of these three properties are present, Apostrophe will create a preview by combining the values of any schema fields within the individual `subforms` object as a space-separated string. For example, if the object has two schema fields, `firstName` and `lastName`, the resulting preview would be equivalent to a `preview` template with `{{ firstName }} {{ lastName }}`. While this would work well for an object with a small number of fields, this might not be optimal for an object with a larger number.

The `protection` property can take a value of either `true` or `"password"`. These values are equivalent and will require that the user enters their password when attempting to change the value(s) of this `fields` object. Additional fields that are added by default can be added through the `addProtectedField()` method of the module.

Finally, the `reload` property defaults to false, but can take a value of `true` if the the page should update after the user makes a change, clarifying to the user that the setting change took effect.

### groups

The `groups` property takes an object of named objects. Each of the individual objects takes two properties, `label` and `subforms`. The label is displayed as the left hand tab name in the Personal Settings menu. The `subforms` property takes an array of `subforms` object names as strings. These subforms will be added to the tab in the order that they appear in the array. If no groups property is added to the settings, the `subforms` objects will be added to a tab named "Ungrouped" in the order that they were created. Similarly, any `subforms` objects not explicitly added to a `groups` object will be added to the "Ungrouped" tab.

### `previewComponent`

<AposCodeBlock>

``` javascript
<template>
  <span>{{ myComputedValue }}</span>
</template>
<script>
export default {
  name: 'SettingsDisplayNamePreview',
  props: {
    subform: {
      type: Object,
      required: true
    },
    values: {
      type: Object,
      required: true
    }
  },
  computed: {
    myComputedValue() {
      // this.subform is the config, this.values is the current field values
      return this.values.displayName || 'n/a';
    }
  }
};
</script>
```

<template v-slot:caption>
  /modules/@apostrophecms/settings/ui/apos/components/ExampleSettingsPreview.vue
</template>
</AposCodeBlock>

::: note
In this example, we are adding the preview component into the `@apostrophecms/settings` folder at the project level. However, you could also elect to create a single module for all of the Vue components you are adding to your project, as long as the component files are being added to the `/ui/apos/components/` folder of the module.
:::

The preview Vue component takes two props, `subform` and `values`. The values prop can be used to retrieve the values the user adds to the schema fields and then manipulate and output those values. In this example, we are simply retreiving and displaying the value of the `displayName` field from the associated subform.