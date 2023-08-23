---
extends: '@apostrophecms/module'
---

# `@apostrophecms/settings`

**Alias:** `apos.settings`

<AposRefExtends :module="$frontmatter.extends" />

This module governs the Personal Settings menu that allows users to change their preferences. Apostrophe projects can configure this menu through `@apostrophecms/settings`. As such, these settings are personal to the user. If you're looking for sitewide settings that govern overall site behavior, check out [`@apostrophecms/global`](https://v3.docs.apostrophecms.org/guide/global.html).

## Options

|  Property | Type | Description |
|---|---|---|
| [`subforms`](#subforms) | Object | Each object defines a set of input fields in the Personal Settings dialog box, with its own Update button. |
| [`groups`](#groups) | Object | This option allows for the organization of subforms on tabs in the Personal Settings menu. |

### Requirements

All fields added to the subforms except `adminLocale` must already exist as default schema fields of the core `@apostrophecms/user` module or be added at project level. 
If the `adminLocales` option is set in the `@apostrophecms/i18n` module, this field will be automatically added to the available subform schema fields and will add a select input for Admin language to the User management modal.

<AposCodeBlock>

``` javascript
module.exports = {
  options: {
    subforms: {
      // The `adminLocales` option **must** be configured in the `@apostrophecms/i18n` module for this to be allowed
      // adminLocale: {
      //   fields: [ 'adminLocale' ]
      // },
      changePassword: {
        // This will have `protection: true` automatically.
        fields: [ 'password' ]
      },
      displayName: {
        // The default `title` field is labeled 'Display Name' in the `@apostrophecms/user` module.
        // Changing this field will **not** change the Username or Slug of the user.
        fields: [ 'title' ]
      },
      fullName: {
        // Passing in a label so that it doesn't use the label for `lastName`
        label: 'Full Name',
        // Schema fields added at project level
        fields: [ 'lastName', 'firstName' ]
      }
    },
    groups: {
      account: {
        label: 'Account',
        subforms: [ 'displayName', 'fullName', 'changePassword' ]
      },
      // preferences: {
      //   label: 'Preferences',
      //   // The `adminLocales` option **must** be configured in the `@apostrophecms/i18n` module for this to be allowed
      //   subforms: [ 'adminLocale' ]
      // }
    }
  }
};

```

<template v-slot:caption>
  /modules/@apostrophecms/settings/index.js
</template>
</AposCodeBlock>


<AposCodeBlock>

``` javascript
module.exports = {
  fields: {
    add: {
      firstName: {
        type: 'string',
        label: 'First Name'
      },
      lastName: {
        type: 'string',
        label: 'Last Name'
      },
      displayName: {
        type: 'string',
        label: 'Display Name'
      }
    },
    group: {
      account: {
        label: 'Account',
        fields: [
          'firstName',
          'lastName',
          'displayName'
        ]
      }
    }
  }
};

```

<template v-slot:caption>
  /modules/@apostrophecms/user/index.js
</template>
</AposCodeBlock>

<AposCodeBlock>

``` javascript
module.exports = {
  options: {
    defaultLocale: 'en',
    locales: {
      en: { label: 'English' },
      fr: {
        label: 'French',
        prefix: '/fr'
      },
      es: {
        label: 'Spanish',
        prefix: '/es'
      }
    },
    // only allow "locking" of the admin language to a sub-set of locales
    adminLocales: [
      {
        label: 'English',
        value: 'en'
      },
      {
        label: 'French',
        value: 'fr'
      }
    ]
    // We can also set a default UI language
    // defaultAdminLocale: 'en'
  }
};

```

<template v-slot:caption>
  /modules/@apostrophecms/i18n/index.js
</template>
</AposCodeBlock>

### `subforms`

The `subforms` option takes an object of named objects.  Each individual object has a required `fields` property that takes an array of strings that are the names of existing schema fields in the `@apostrophecms/user` settings. By default, the `password` and `adminLocale` fields are available for addition. Note that the `adminLocale` field needs to be enabled by [setting the `adminLocales` option](/reference/modules/i18n.html) of the `@apostrophecms/i18n` module.

In addition to the required `fields` property, each object can take six additional optional properties.

The `label` property takes a string to display to the user in both preview, when not editing that subform, and edit mode, as a label at the left or a heading label, respectively. If not supplied, Apostrophe will use the label for the first schema passed to the `fields` property.

The `protection` property can take a value of either `true` or `"password"`. These values are equivalent and will require that the user enters their password when attempting to change the value(s) of this `fields` object. Additional fields that are protected by default can be added through the `addProtectedField()` method of the module.

The `reload` property defaults to false, but can take a value of `true` if the page should update after the user makes a change, clarifying to the user that the setting change took effect.

#### Previewing options

The remaining three subform options govern the display of information to the user in preview mode. This lets the user know the current value for that field, or in the case of complex fields, some type of other messaging.

These preview options are optional. If none are added, as is the case with the example above, Apostrophe will create a preview by combining the values of any schema fields within the individual `subforms` object as a space-separated string. For example, if the object has two schema fields, `firstName` and `lastName`, the resulting preview would be equivalent to <code v-pre>{{ firstName }} {{ lastName }}</code>. While this would work well for an object with a small number of fields, this might not be optimal for an object with a larger number.

For complex subforms with multiple fields, or with sensitive information like a password, the `help` option can be used. It takes a string (or i18n key) to display to the user.

<AposCodeBlock>

``` javascript
module.exports = {
  options: {
    subforms: {
      // other subforms
      fullName: {
        // Passing in a label so that it doesn't use the label for `lastName`
        label: 'Full Name',
        // Schema fields added at project level
        fields: [ 'lastName', 'firstName' ],
        preview: '{{ firstName }} {{ lastName}}'
      }
    },
    // remainder of configuration
};

```

<template v-slot:caption>
  /modules/@apostrophecms/settings/index.js
</template>
</AposCodeBlock>

In order to show the user a preview of selected subform fields, or to take advantage of localization you can use the `preview` option. This option receives a string that can include subform schema field names, like <code v-pre>{{ firstName }} {{ lastName}}</code>, leveraging i18next as a built-in templating system and allowing different locales to put them in different orders as appropriate.

<AposCodeBlock>

``` javascript
module.exports = {
  options: {
    subforms: {
      // other subforms
      displayInitials: {
        label: 'Display Initials',
        // Schema fields added at project level
        fields: [ 'firstName', 'lastName' ],
        previewComponent: 'SettingsDisplayInitialsPreview',
        protection: true,
        reload: true
      },
    },
    // remainder of configuration
};

```

<template v-slot:caption>
  /modules/@apostrophecms/settings/index.js
</template>
</AposCodeBlock>

Finally, the `previewComponent` property takes the name of a Vue component that has been added to your project through any `modules/my-custom-module/ui/apos/components` folder. The string passed to this property should not contain the file extension. This component is rendered and displayed to the right of the subform label in the preview mode and has access to the values provided in the subform by the user. [See below](#previewcomponent) for further information about the component structure.

You should avoid setting all three of these options on a single subform. However, if you do, the `previewComponent` will be used preferentially, followed by the `help` and then the `preview` option.

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
      var firstName = this.values.firstName || '';
      var lastName = this.values.lastName || '';
      var initials = firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
      return initials;
    }
  }
};
</script>
```

<template v-slot:caption>
  /modules/@apostrophecms/settings/ui/apos/components/SettingsDisplayInitialsPreview.vue
</template>
</AposCodeBlock>

::: info
In this example, we are adding the preview component into the `@apostrophecms/settings` folder at the project level. However, you could also elect to create a single module for all of the Vue components you are adding to your project, as long as the component files are being added to the `/ui/apos/components/` folder of the module.
:::

The preview Vue component takes two props, `subform` and `values`. The values prop can be used to retrieve the values the user adds to the schema fields and then manipulate and output those values. In this example, we are simply retreiving the `lastName` and `firstName` field values from the associated subform, then returning the users initials for display.
