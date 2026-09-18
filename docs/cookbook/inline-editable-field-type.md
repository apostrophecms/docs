---
prev: false
next: false
---
# Adding inline editing to a custom field type

## Introduction

[Inline editing](/guide/inline-editing.md) lets a template put a schema field on the page and let the editor type straight into it. Out of the box that works for [`string`](/reference/field-types/string.md) and [`richText`](/reference/field-types/richText.md). A [custom field type](/guide/custom-schema-field-types.md) can join them.

In this recipe we build a `markdown` field type: the stored value is Markdown source, the page shows the HTML it renders to, and the editor types the source right there on the page. When they stop typing, the value is patched and the page updates.

Markdown is a good illustration because the display and the value genuinely differ. Only the server has the Markdown parser, so only the server can say what the page should show — exactly the situation `richText` is in with its permalinks. Everything here applies just as well to a field type whose rendering is a simpler affair.

Finished, it is used like any other field:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/piece-type',
  fields: {
    add: {
      notes: {
        type: 'markdown',
        label: 'Release notes',
        textarea: true
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/release/index.js
  </template>
</AposCodeBlock>

```jsx
<Field doc={piece} name="notes" with={{ class: 'release__notes' }} />
```

## What a field type has to provide

A field type opts in with `wysiwyg: true` and customizes the rest:

| Property | Purpose |
|---|---|
| `wysiwyg: true` | This type can be edited in place. Required; without it the field throws when a template names it. |
| `wysiwygComponent` | The Vue component that edits it. Defaults to `AposWysiwygInput` plus the capitalized type name. |
| `wysiwygRender(req, field, value)` | The markup a visitor sees. Defaults to the value escaped as text. |
| `wysiwygTag(field)` | The tag the value is rendered as when the template does not say. Defaults to `div`. Given the whole field, so one type can answer differently depending on configuration, as `string` does for `textarea: true`. |
| `wysiwygModifiers(field)` | Extra `apos-wysiwyg-field--*` classes, so one type can be styled differently depending on configuration. |
| `wysiwygIcon` | The icon that opens the breadcrumb trail. Defaults to `pencil-icon`. An individual field can override it with a `wysiwygIcon` property of its own. |

None of these replace the ordinary parts of a field type. `convert` still sanitizes and stores the value, and `vueComponent` is still the editor shown in the modal. Inline editing is an addition, not an alternative: the same field is editable both ways.

## Installing the Markdown parser

```bash
npm install markdown-it
```

## The server side

<AposCodeBlock>

```javascript
import MarkdownIt from 'markdown-it';

// `html: false` means raw HTML in the source is escaped rather than passed
// through. Markdown is a convenience for editors, not a way around
// sanitization, and this is the one line that keeps it that way
const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

export default {
  icons: {
    'language-markdown-icon': 'LanguageMarkdown'
  },
  init(self) {
    self.addMarkdownFieldType();
  },
  methods(self) {
    return {
      addMarkdownFieldType() {
        self.apos.schema.addFieldType({
          name: 'markdown',
          // The editor shown in the document's modal: a plain string input,
          // or a textarea for a field configured with `textarea: true`
          vueComponent: 'AposInputString',
          def: '',

          // 👇 Everything from here down is inline editing

          // This type can be edited in place
          wysiwyg: true,
          // Our own component, since the value is not what is displayed
          wysiwygComponent: 'AposWysiwygInputMarkdown',
          // Markdown is a block of prose, so a block element
          wysiwygTag() {
            return 'div';
          },
          // So a stylesheet can address it: `.apos-wysiwyg-field--markdown`
          // is added for us, this adds `--prose` on top of it
          wysiwygModifiers() {
            return [ 'prose' ];
          },
          // Registered in the `icons` section above
          wysiwygIcon: 'language-markdown-icon',
          // The part only the server can do
          async wysiwygRender(req, field, value) {
            return markdown.render(value || '');
          },

          // 👆 Everything above is inline editing

          convert(req, field, data, destination) {
            const value = self.apos.launder.string(data[field.name], field.def);
            if (field.required && !value.length) {
              throw self.apos.error('required');
            }
            destination[field.name] = value;
          },
          index(value, field, texts) {
            texts.push({
              weight: field.weight || 10,
              text: value || '',
              silent: field.silent ?? false
            });
          },
          isEmpty(field, value) {
            return !(value || '').trim().length;
          }
        });
      }
    };
  }
};
```
  <template v-slot:caption>
    modules/markdown-field/index.js
  </template>
</AposCodeBlock>

Don't forget to enable the module in `app.js`, like any other module.

A few things to note:

`wysiwygRender` receives the request, so it can do anything an Apostrophe method can: look up related documents, honor the locale, check a permission. `richText` uses that to resolve permalinks, which is why rich text rendered in place has working internal links.

Its return value is trusted as markup and inserted unescaped. That is the whole point — the field type is the authority on what its value looks like as HTML — so it is also where the responsibility to sanitize lands. Here `markdown-it` is configured not to pass raw HTML through, so there is nothing to sanitize afterwards.

`wysiwygModifiers` returns bare words. Apostrophe prefixes each with `apos-wysiwyg-field--`, alongside the `apos-wysiwyg-field` and `apos-wysiwyg-field--markdown` classes every inline field gets, and any `class` the template passed.

## The browser side

The editing component is an ordinary Vue component in `ui/apos/components`. Mix in `AposWysiwygInputMixin`, and the props, the save semantics and the events are taken care of:

<AposCodeBlock>

```js
<template>
  <textarea
    ref="textarea"
    class="apos-wysiwyg-markdown"
    rows="1"
    :value="next"
    :placeholder="placeholder"
    :readonly="readOnly"
    :aria-label="placeholder"
    @input="onInput"
    @blur="flush"
  />
</template>

<script>
import AposWysiwygInputMixin from 'Modules/@apostrophecms/schema/mixins/AposWysiwygInputMixin';

export default {
  name: 'AposWysiwygInputMarkdown',
  mixins: [ AposWysiwygInputMixin ],
  mounted() {
    this.resize();
  },
  methods: {
    onInput(event) {
      // Saves about once a second while the user is typing, and emits
      // `context-editing` so the context bar shows work in progress
      this.updateDebounced(event.target.value);
      this.resize();
    },
    resize() {
      const el = this.$refs.textarea;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }
};
</script>

<style lang="scss" scoped>
  // Editing should feel like typing on the page, so take the page's own
  // typography rather than the admin UI's
  .apos-wysiwyg-markdown {
    display: block;
    overflow: hidden;
    width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    background-color: transparent;
    color: inherit;
    font: inherit;
    resize: none;
    outline: none;

    &::placeholder {
      color: inherit;
      opacity: 0.4;
    }
  }
</style>
```
  <template v-slot:caption>
    modules/markdown-field/ui/apos/components/AposWysiwygInputMarkdown.vue
  </template>
</AposCodeBlock>

The mixin gives the component:

| | |
|---|---|
| `field` | The schema field definition, as the server composed it, so `field.textarea`, `field.required` and any option of your own are all available |
| `modelValue` | The stored value — the Markdown source, not the rendered HTML |
| `next` | The working copy the component edits. Starts as `modelValue` and follows it if it changes underneath |
| `placeholder` | The field's `placeholder`, or its `label`, already localized |
| `readOnly` | True for a `readOnly` field |
| `update(value)` | Accept a value and save it immediately |
| `updateDebounced(value)` | Accept a value, signal that the user is typing, and save in about a second. What you want for a keystroke |
| `flush()` | Save a pending debounced change right now. Call it on blur; the mixin also calls it before unmounting |

There is no save call to write. When the field belongs to the document the page is about, the mixin patches it through the context bar, which debounces and serializes changes the way the area editor does. When it does not — the same component mounted inside a modal, for instance — it emits `update:modelValue` and `changed` for a parent to deal with. Either way the component's only job is to say what the value is now.

::: tip
Apostrophe's own [`AposWysiwygInputString.vue`](https://github.com/apostrophecms/apostrophe/blob/main/packages/apostrophe/modules/%40apostrophecms/schema/ui/apos/components/AposWysiwygInputString.vue) is a short, complete implementation of the same pattern, including a trick for growing a textarea without measuring anything. It is worth a read before writing your own.
:::

Remember that admin UI code is only rebuilt when you ask for it. Run with `APOS_DEV=1` or configure `hmr: 'apos'` while working on the component. See [customizing the user interface](/guide/custom-ui.md).

## Trying it out

Add the field to a piece type or page type, render it with `Field`, and edit the page:

<AposCodeBlock>

```jsx
export default function({ piece }, { Field }) {
  return (
    <article className="release">
      <Field doc={piece} name="title" with={{ tag: 'h1' }} />
      <Field doc={piece} name="notes" with={{ class: 'release__notes' }} />
    </article>
  );
}
```
  <template v-slot:caption>
    modules/release-page/views/show.jsx
  </template>
</AposCodeBlock>

Or in Nunjucks:

<AposCodeBlock>

```nunjucks
<article class="release">
  {% field data.piece, 'title' with { tag: 'h1' } %}
  {% field data.piece, 'notes' with { class: 'release__notes' } %}
</article>
```
  <template v-slot:caption>
    modules/release-page/views/show.html
  </template>
</AposCodeBlock>

Clicking the notes should replace the rendered HTML with the Markdown source, in the page's own type, and typing should update the document a second later.

## Astro and other external fronts

Nothing above changes, but each field that a front end renders in place has to say so, with `wysiwyg: true` in its definition or by being named in its module's `wysiwygFields` option. Apostrophe sends an external front its data before the templates run, so it cannot work out which fields are involved on its own. See [Astro](/guide/inline-editing.md#astro).

## Related

- [Inline editing](/guide/inline-editing.md) — the feature, in all three template languages
- [Custom schema field types](/guide/custom-schema-field-types.md) — the rest of what a field type does
- [Customizing the user interface](/guide/custom-ui.md) — building and shipping admin UI code
