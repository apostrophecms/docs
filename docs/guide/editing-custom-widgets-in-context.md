# Editing custom widgets in context

::: note
Be sure to read [customizing the user interface](custom-ui.md) first before proceeding with this guide.
:::

Most [custom widgets](custom-widgets.md), and indeed most core widgets, are edited in a dialog box when the user clicks on the edit button. But there is another possibility: in-context editing on the page. The standard rich text widget is an example of this. The user types text directly on the page.

While editing a schema of fields in the provided dialog box is convenient for developers, sometimes editing directly on the page provides a better user experience. This guide explains how to do that.

::: warning
Editing on the page is not always the best path. Always consider the smallest space in which the widget might be placed when making this decision. Also bear in mind that the appearance of the widget will be different on different devices. The "what you see is what you get" experience can be misleading in some situations.
:::

To implement on-page editing for a custom widget type, we must implement the following pattern:

## The basics of contextual editing

### Module configuration

The `contextual` option of the widget module must be set to `true`. This is the trigger for contextual editing. Otherwise the normal editing dialog box is displayed for the widget.

The `components` option of the widget module must be set to an object with `widgetEditor` (widget editor) and `widget` (widget viewer) properties specifying the names of Vue components.

The `defaultData` option of the widget module may be set to a default value for newly created widgets of this type.

### The widget viewer

The configured `widget` Vue component (the "widget wrapper") is responsible for two things: injecting the current markup of the widget, which is provided as pre-rendered HTML, and detecting situations where the user wants to edit the widget.

The widget wrapper must activate the `AposWidgetMixin`, via the `mixins` feature of Vue. This provides the `rendered` data property, containing the pre-rendered HTML.

The widget wrapper must also use the `v-html` directive to display `rendered` as the internal markup of its wrapper `div`. This wrapper element must be a `div` and will *not* be present later when non-editors view the page.

And of greatest interest to us here, the widget wrapper must emit an `edit` event when the user takes an action that indicates they wish to edit the widget, such as clicking inside it.

::: warning
The widget viewer is **not** responsible for deciding how to present the content of the widget and should not be used that way. Rendering the widget is the responsibility of the `widget.html` Nunjucks template, optionally with help from a widget player function. When logged-out visitors look at the site, Vue won't be running at all, unless project-level developers choose to use it.
:::

### The widget editor

The configured `widgetEditor` Vue component (the "widget editor") must display the content of the widget in an editable form. To provide a contextual editing experience, that interface should be similar to the ordinary read-only form.

The widget editor receives a `value` Vue prop containing the existing value of the widget (an object), and emits an `update` Vue event with a new object whenever appropriate. The component should *not* modify the `value` prop given to it.

The widgetEditor **must not** attempt to save changes by itself. Instead it must emit the `update` event and let Apostrophe takes care of the rest. Never assume the widget will be in a particular document type. It may be in any area, nested in any document type. Apostrophe will handle this for you.

### Debouncing update events

If the value will be changing quickly, for instance as the user types, the widget editor component should speed up the interface by emitting an `update` event no more than approximately once per second. This is called "debouncing."

As a hint that input might not yet be saved, a widget that "debounces" `update` events should emit a `context-editing` event on every change, even if `update` is intentionally delayed. However this should only be done if the `docId` prop passed to the widget editor is equal to `windows.apos.adminBar.contextId`.

If the `focused` prop becomes `false` and an `update` event has been delayed for debouncing purposes, the widget should cancel its timer and immediately emit the update. Use Vue's `watch` feature to monitor `focused`.

### Saving the content

By default the `fields` section of a contextually edited widget has no effect on the user interface. Emitting a reasonable value is the task of the custom widget editor component. However configuring fields is still necessary since the server will still use them to sanitize the data before saving it.

If no `fields` section is configured, no data will be saved at all unless the `sanitize` method of the module is overridden to provide an alternative way to verify user input, as is done in the case of the core rich text widget.

## Example

Here is a simple "hero" heading widget. Both the heading and the width of the heading can be adjusted directly on the page. This gives the user immediate visual feedback.

<AposCodeBlock>
```js
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    contextual: true,
    components: {
      widget: 'HeroWidget',
      widgetEditor: 'HeroWidgetEditor'
    }
  }
};
```
  <template v-slot:caption>
    modules/hero-widget/index.js
  </template>
</AposCodeBlock>
