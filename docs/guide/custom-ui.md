# Customizing the Apostrophe user interface

This guide focuses on how to customize Apostrophe's administrative user interface, or "admin UI." The built-in functionality covers most situations, but sometimes you'll want to add or change functionality.

## Overriding standard Vue components by name

Apostrophe's admin UI is implemented in Vue. We'll find various Vue components implemented in `.vue` files in different Apostrophe modules, including a number of modules that are packaged inside the core `apostrophe` npm module.

Most of the time we don't need to override admin UI Vue components that ship with Apostrophe. But if we have a need, we can do by **placing a file with the same name as a standard component in the `ui/apos/components` subdirectory of our own module.**

Apostrophe will use only the last version of a component that is configured. For isntance, if the last module in our project's `app.js` modules list contains a `ui/apos/components/AposLogPadless.vue` file, that logo will be used in the admin bar, in place of the version that is normally loaded from Apostrophe core or in any module configured earlier.

::: note
You will need to read the source code of the existing component we are overriding for more information about the patterns used, props provided and APIs we may need to access.
:::

## Overriding standard Vue components through configuration

There can be only one `AposDocsManager` Vue component definition in a project, but sometimes we need different behavior for a specific piece type only. We could work around this by adding conditional logic to the component, but this results in code that is hard to maintain, and also means we are stuck maintaining a copy of a complex component and missing out on bug fixes and improvements. It would be better if we could **specify a different, custom component name to be used** to manage a particular piece type.

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

As for the actual Vue code, we would place that in `modules/announcement/ui/apos/components/AnnouncementManager.vue`.

Of course there are other components that can be overridden in this way, and the list is growing over time. Here are the components that can currently be overridden through configuration:

| Module                    | Option             | Default          |
| --------------------------| ------------------ | ---------------- |
| @apostrophecms/piece-type | components.managerModal | AposDocsManager  |
| @apostrophecms/piece-type | components.editorModal  | AposDocEditor    |
| @apostrophecms/page       | components.managerModal | AposPagesManager |
| @apostrophecms/page       | components.editorModal  | AposDocEditor    |

For readability's sake, a `.` is used in the table above to separate sub-properties of options. If an option exists for `@apostrophecms/piece-type` it can be used for any module that extends it.

::: note
If the option ends in `Modal`, our component is expected to embed the `AposModal` component so that the admin UI can await it with `apos.modal.execute`. For an example, look at the source code of the module for which we are providing a substitute.
:::

## Registering custom field types

Apostrophe's [schema field types](content-schema.md) cover many situations, but we might wish to add a new one.

A schema field has two parts: a server-side part and a browser-side part. The server-side part is responsible for sanitizing the input received from the browser, while the browser-side part is responsible for providing the admin UI.

### Implementing the server-side part

Any module can register a schema field type on the server side, like this one, which provides a range field with two inputs, one for the low end of the range and one for the high end.

```
// modules/double-range-field/index.js
module.exports = {
  init(self) {
    self.addDoubleRangeFieldType();
  },
  methods(self) {
    return {
      addDoubleRangeFieldType() {
        self.apos.schema.addFieldType({
          name: 'doubleRange',
          convert: self.convert,
          component: 'InputDoubleRange'
        });
      },
      async convert(req, field, data, object) {
        let info = data[field.name];
        if (typeof info !== 'object') {
          info = {};
        }
        if (((typeof info.low) !== 'number') || ((typeof info.high) !== 'number')) {
          throw self.apos.error('notfound');
        }
        object[field.name] = {
          low: info.low,
          high: info.high
        };
      }
    }
  }
}
```

In `init`, which runs when the module is initialized, we call our `addDoubleRangeFieldType` method. `init` is the right place to invoke code that should run when the Apostrophe process starts up.

In `addDoubleRangeFieldType`, we invoke `self.apos.schema.addFieldType` to add our custom field type. We provide:

* `name`, which can be used as a `type` setting when adding the field to a schema.
* `convert`, a function to be used to sanitize the input and copy it to a destination. We pass our `convert` method for this purpose. Methods of our module are available as properties of `self`.
* `component`, the name of a Vue component to be displayed when editing the field.

In `convert`, we sanitize the input and copy it from `data[field.name]` to `object[field.name]`. Since we must not trust the browser, we check the type of every piece of input. If the input does not have both `low` and `high` properties with the `number` type, we throw a `notfound` error, which rejects the submission. `invalid` is another useful error name, if we wish to distinguish between missing data and data of the wrong type.

### Implementing the browser-side part

On the browser side, we'll need a custom Vue component. Apostrophe provides a Vue mixin, `AposInputMixin`, that does much of the work for us.

```
<template>
  <!-- modules/double-range-field/ui/apos/components/InputDoubleRange.vue -->
  <AposInputWrapper
    :modifiers="modifiers" :field="field"
    :error="effectiveError" :uid="uid"
    :display-options="displayOptions"
  >
    <template #body>
      <div class="apos-input-wrapper">
        <div class="input-double-range" v-apos-tooltip="tooltip">
          <label :for="`${uid}-low`">
            Low:
            <input
              type="range"
              class="apos-range__input"
              @change="setLow"
              :id="`${uid}-low`"
              :disabled="field.readOnly"
            >
          </label>
          <label :for="`${uid}-high`">
            High:
            <input
              type="range"
              class="apos-range__input"
              @change="setHigh"
              :id="`${uid}-high`"
              :disabled="field.readOnly"
            >
          </label>
          <button @click="clear" />Clear</button>
        </div>
      </div>
    </template>
  </AposInputWrapper>
</template>

<script>
import AposInputMixin from 'Modules/@apostrophecms/schema/mixins/AposInputMixin';

export default {
  name: 'InputDoubleRange',
  mixins: [ AposInputMixin ],
  methods: {
    validate(value) {
      if (this.field.required) {
        if (!value) {
          return 'required';
        }
      }
      return false;
    },
    setLow(e) {
      this.value = this.value || {};
      this.value.low = e.target.value;
    },
    setHigh() {
      this.value = this.value || {};
      this.value.high = e.target.value;
    },
    clear() {
      this.value = null;
    }
  }
};
</script>

<style lang="scss" scoped>
  /* Optional: styles here */
</style>
```
