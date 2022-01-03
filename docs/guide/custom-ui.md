# Customizing the user interface

This guide focuses on how to customize Apostrophe's administrative user interface, or "admin UI." The built-in functionality covers most situations, but sometimes you'll want to add or change functionality.

::: warning
* Altering the UI should be done rarely and carefully.
* Overriding or replacing a UI component prevents the project from benefiting from future UI improvements and bug fixes related to that component.
* Make sure there is not a better way to achieve the desired goal. This includes [asking for help in discord](https://chat.apostrophecms.org) and [requesting](https://portal.productboard.com/apostrophecms/1-product-roadmap/tabs/1-under-consideration) or [contributing](https://github.com/apostrophecms/apostrophe/blob/main/CONTRIBUTING.md#apostrophecms-contribution-guide) new features for the core.
* At some point during the lifetime of Apostrophe 3.x we intend to migrate to Vue.js 3.x. We will do so with as much backwards compatibility as possible and make the community aware of the timeline, but when coding custom admin UI components it must be understood that minor changes may be necessary in the future.
:::

## Overriding standard Vue.js components by name

Apostrophe's admin UI is implemented with Vue.js. It is built from many `.vue` files across various Apostrophe modules, primarily in Apostrophe core.

Most of the time we don't need to override admin UI components that ship with Apostrophe. But if we have a need, we can do so by **placing a file with the same name as a standard component in the `ui/apos/components` subdirectory of a project-level module.** You can also do this in a custom npm module to achieve reuse across projects.

Apostrophe will use only the last version of a component that it finds during startup. The general startup order is:

1. Core Apostrophe modules
2. Installed and project-level modules, in the order they are configured in `app.js`
that is configured. For instance, if the last module in our project's `app.js` modules list contains a `ui/apos/components/AposLogPadless.vue` file, that logo will be used in the admin bar, in place of the version that is normally loaded from Apostrophe core or in any module configured earlier.

::: note
For more information about the patterns used, props provided and APIs needed to implement a component, it's necessary to study the source code of the original.
:::

## Overriding standard Vue.js components through configuration

There can be only one `AposDocsManager` Vue.js component definition in a project, but sometimes we need different behavior for a specific piece type only. We could work around this by overriding a core component and adding conditional logic, but this results in code that is hard to maintain, and also means we are stuck maintaining a copy of a complex component and missing out on bug fixes and improvements. It would be better if we could **specify a different, custom component name to be used** to manage a particular piece type.

Here is an example of how to do that:

<AposCodeBlock>
```js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    components: {
      managerModal: 'AnnouncementManager'
    }
  }
}
```
  <template v-slot:caption>
    modules/announcement/index.js
  </template>
</AposCodeBlock>


With this configuration, Apostrophe will look for a Vue.js component called `AnnouncementManager` when the user selects "Announcements" from the admin bar, bypassing `AposDocManager`.

As for the actual Vue.js code, we would place that in `modules/announcement/ui/apos/components/AnnouncementManager.vue`.

Of course there are other components that can be overridden in this way, and the list is growing over time. Here are the components that can currently be overridden through configuration:

| Module                     | Option             | Default          |
| -------------------------- | ------------------ | ---------------- |
| `@apostrophecms/piece-type`  | `components.managerModal` | `AposDocsManager`  |
| `@apostrophecms/piece-type`  | `components.editorModal`  | `AposDocEditor`    |
| `@apostrophecms/page`        | `components.managerModal` | `AposPagesManager` |
| `@apostrophecms/page`        | `components.editorModal`  | `AposDocEditor`    |
| `@apostrophecms/widget-type` | `components.widgetEditor` | `AposWidgetEditor` |
| `@apostrophecms/widget-type` | `components.widget`       | `AposWidget`       |

For readability's sake, a `.` is used in the table above to separate sub-properties of `options` (see the example above for what the actual configuration looks like). If an option exists for `@apostrophecms/piece-type` it can be used for any module that extends it.

::: note
Since the type of an existing page can be changed, there is only one manager modal and only one editor modal for all pages, and those component names are configured on the `@apostrophecms/page` module. Piece and widget types can have their own type-specifc overrides.

If an option ends in `Modal`, the component is required to embed the `AposModal` component. For examples, look at the source code of the default components listed above.

The `AposWidgetEditor` component already provides a modal dialog box in which to edit the schema of any widget, so we won't need to configure a replacement unless we want to support editing directly on the page. `AposRichTextWidgetEditor` is an example of how to do this.

The `AposWidget` component has **nothing to do with a typical site visitor experience.** It is used only when displaying our widget while the page is in edit mode. While overriding this component is rare, the `@apostrophecms/rich-text-widget` module does so to provide a "click the text to edit" experience for rich text widgets. If you're just trying to enhance your widget with frontend JavaScript, you should write a [widget player](custom-widgets.md#client-side-javascript-for-widgets) instead.

Before you override an editor modal, consider just adding a custom schema field type.
:::

## Registering custom field types

Apostrophe's [schema field types](content-schema.md) cover many situations, but we might wish to add a new one.

A schema field has two parts: a server-side part and a browser-side part. The server-side part is responsible for sanitizing the input received from the browser, while the browser-side part is responsible for providing the admin UI.

### Implementing the server-side part

Any module can register a schema field type on the server side, like this one, which allows editors to set a "star rating" of 1 to 5 stars, as is often seen in movie and restaurant reviews.

<AposCodeBlock>
```js
module.exports = {
  init(self) {
    self.addStarRatingFieldType();
  },
  methods(self) {
    return {
      addStarRatingFieldType() {
        self.apos.schema.addFieldType({
          name: 'starRating',
          convert: self.convertInput,
          vueComponent: 'InputStarRating'
        });
      },
      async convertInput(req, field, data, object) {
        const input = data[field.name];
        if ((data[field.name] == null) || (data[field.name] === '')) {
          if (field.required) {
            throw self.apos.error('notfound');
          }
        }
        object[field.name] = self.apos.launder.integer(input, field.def, 1, 5);
      }
    }
  }
}
```
  <template v-slot:caption>
    modules/star-rating-field/index.js
  </template>
</AposCodeBlock>

In `init`, which runs when the module is initialized, we call our `addStarRatingFieldType` method. `init` is the right place to invoke code that should run when the Apostrophe process starts up.

In `addStarRatingFieldType`, we invoke `self.apos.schema.addFieldType` to add our custom field type on the server side. We provide:

* `name`, which can be used as a `type` setting when adding the field to a schema.
* `convert`, a function to be used to sanitize the input and copy it to a destination. We pass our `convertInput` method for this purpose. Methods of our module are available as properties of `self`.
* `component`, the name of a Vue.js component to be displayed when editing the field.

In `convertInput`, we sanitize the input and copy it from `data[field.name]` to `object[field.name]`. Since we must not trust the browser, we take care to sanitize it with [the `launder` module](https://npmjs.com/package/launder), which is always available as `apos.launder`. But we can validate the input any way we like, as long as we never trust the input.

### Implementing the browser-side part

On the browser side, we'll need a custom Vue.js component. Apostrophe provides a Vue.js mixin, `AposInputMixin`, that does much of the work for us.

<AposCodeBlock>
```js
<template>
  <AposInputWrapper
    :modifiers="modifiers" :field="field"
    :error="effectiveError" :uid="uid"
    :display-options="displayOptions"
  >
    <template #body>
      <div class="apos-input-wrapper">
        <button v-for="index in 5" :key="index" @click="setValue(index)" class="rating">{{ isActive(index) ? '☆' : '★' }}</button>
        <button class="clear" @click="clear">Clear</button>
      </div>
    </template>
  </AposInputWrapper>
</template>

<script>
import AposInputMixin from 'Modules/@apostrophecms/schema/mixins/AposInputMixin';

export default {
  name: 'InputStarRating',
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
    setValue(index) {
      this.next = index;
    },
    clear() {
      this.next = null;
    },
    isActive(index) {
      return index <= this.next;
    }
  }
};
</script>

<style lang="scss" scoped>
  .rating {
    border: none;
    background-color: inherit;
    color: inherit;
    font-size: inherit;
  }
</style>
```
  <template v-slot:caption>
    modules/star-range-field/ui/apos/components/InputStarRating.vue
  </template>
</AposCodeBlock>

In our template element, `AposInputWrapper` takes care of decorating our field with a label, error messages, etc. All we have to do is pass on some standard props that are provided to us. Beyond that, our responsibility is to display the current `value` to the user. We also add event handlers to handle user input, as explained below.

In our script element, we have just two jobs: assigning a new value to `this.next` whenever the value changes, and validating the user's input. The `AposInputMixin` does the rest of the work for us.

To update `this.next`, we implement methods that respond to click events, like the `setValue` and `clear` methods in this example. To validate the user's input, we implement a `validate` method, which accepts the current value and checks constraints like the `required` property of the field. If there is a problem, we return an error code such as `required`, `min` or `max`, otherwise we return `false`. The field configuration is available to us as `this.field`.

The `style` element takes care of CSS for this component. Note that SCSS syntax is available. To avoid conflicts, using the `scoped` attribute is recommended.

### Putting the new schema field type to work

Now we can use the new schema field type in any piece or widget much as we would use an `integer` field:

```javascript
fields: {
  add: {
  stars: {
    type: 'starRating',
    label: 'Star Rating',
    required: true
  }
```

The resulting value is then available as the `stars` property of the piece or widget, with an integer value between `1` and `5`.

::: warning
:::
