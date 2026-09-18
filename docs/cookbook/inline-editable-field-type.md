---
prev: false
next: false
---
# Adding inline editing to a custom field type

## Introduction

[Inline editing](/guide/inline-editing.md) lets a template put a schema field on the page and let the editor change it right there. Out of the box that works for [`string`](/reference/field-types/string.md) and [`richText`](/reference/field-types/richText.md). A [custom field type](/guide/custom-schema-field-types.md) can join them.

In this recipe we build an `inlineSelect` field type: one choice out of several, shown on the page as a word in a sentence and changed with a `select` element in that same spot. Pick a new choice and the document is patched immediately.

A select makes a good illustration for two reasons.

**What is stored is not what is shown.** The document holds `faculty`; the page shows *Faculty*. Only the server knows the choices, so only the server can turn one into the other — exactly the situation `richText` is in with its permalinks. That is what `wysiwygRender` is for.

**The editor is not a text box.** Inline editing is not only about typing. A select changes once, deliberately, so this component saves immediately instead of debouncing keystrokes, and it needs no styling tricks to grow as you type. It is the shortest complete example of the pattern.

Finished, it is used like any other field:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/piece-type',
  fields: {
    add: {
      affinity: {
        label: 'Affinity',
        type: 'inlineSelect',
        choices: [
          {
            label: 'Faculty',
            value: 'faculty'
          },
          {
            label: 'Student',
            value: 'student'
          },
          {
            label: 'Employee',
            value: 'employee'
          }
        ]
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/person/index.js
  </template>
</AposCodeBlock>

Templates render it like any other field too. Here it sits in the middle of a sentence, which is what the field type's choice of tag is for:

```jsx
<p>Affiliation: <Field doc={piece} name="affinity" />.</p>
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

## The server side

<AposCodeBlock>

```javascript
export default {
  icons: {
    'form-select-icon': 'FormSelect'
  },
  init(self) {
    self.addInlineSelectFieldType();
  },
  methods(self) {
    return {
      addInlineSelectFieldType() {
        self.apos.schema.addFieldType({
          name: 'inlineSelect',
          // In the document's modal it is an ordinary select field
          vueComponent: 'AposInputSelect',
          def: null,

          // 👇 Everything from here down is inline editing

          // This type can be edited in place
          wysiwyg: true,
          // Our own component, since a select is not a text box
          wysiwygComponent: 'AposWysiwygInputInlineSelect',
          // A choice is a word in a sentence, not a block of its own
          wysiwygTag() {
            return 'span';
          },
          // Registered in the `icons` section above
          wysiwygIcon: 'form-select-icon',
          // The page shows the label; the document stores the value. Only the
          // server knows which is which, so only the server can say this
          async wysiwygRender(req, field, value) {
            const choice = (field.choices || [])
              .find(choice => choice.value === value);
            return self.apos.util.escapeHtml(choice ? req.t(choice.label) : '');
          },

          // 👆 Everything above is inline editing

          convert(req, field, data, destination) {
            destination[field.name] = self.apos.launder.select(
              data[field.name],
              field.choices,
              field.def
            );
          },
          index(value, field, texts) {
            texts.push({
              weight: field.weight || 15,
              text: value,
              // A stored choice is rarely what someone searches for, so stay
              // out of the search index unless the field asks to be in it
              silent: field.silent ?? true
            });
          },
          isEmpty(field, value) {
            return !value;
          }
        });
      }
    };
  }
};
```
  <template v-slot:caption>
    modules/inline-select-field/index.js
  </template>
</AposCodeBlock>

Don't forget to enable the module in `app.js`, like any other module.

A few things to note:

`wysiwygRender` receives the request, so it can do anything an Apostrophe method can: look up related documents, honor the locale, check a permission. Here it uses `req.t` so a choice whose label is a translation key is shown in the visitor's language. `richText` uses the same hook to resolve permalinks, which is why rich text rendered in place has working internal links.

Its return value is trusted as markup and inserted unescaped. That is the whole point — the field type is the authority on what its value looks like as HTML — so it is also where the responsibility to escape lands, which is what `escapeHtml` is doing above.

`wysiwygTag` returns `span` because a choice belongs on a line with other words. Apostrophe notices that the rendered element is inline and lays the editor out inline too, so the sentence reads the same while it is being edited. A type whose value is a block of its own should return `div` instead, which is the default.

## The browser side

The editing component is an ordinary Vue component in `ui/apos/components`. Mix in `AposWysiwygInputMixin`, and the props, the save semantics and the events are taken care of:

<AposCodeBlock>

```vue
<template>
  <select
    class="apos-wysiwyg-inline-select"
    :value="next"
    :disabled="readOnly"
    :aria-label="placeholder"
    @change="update($event.target.value)"
  >
    <option
      v-if="!field.required"
      value=""
    >
      {{ placeholder }}
    </option>
    <option
      v-for="choice in field.choices"
      :key="choice.value"
      :value="choice.value"
    >
      {{ $t(choice.label) }}
    </option>
  </select>
</template>

<script>
import AposWysiwygInputMixin from 'Modules/@apostrophecms/schema/mixins/AposWysiwygInputMixin';

export default {
  name: 'AposWysiwygInputInlineSelect',
  mixins: [ AposWysiwygInputMixin ]
};
</script>

<style lang="scss" scoped>
  // Editing should feel like changing a word on the page, not filling in a
  // form, so take the page's own typography and none of the form chrome
  .apos-wysiwyg-inline-select {
    margin: 0;
    padding: 0;
    border: 0;
    background-color: transparent;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    text-align: inherit;
    text-transform: inherit;
    cursor: pointer;
    outline: none;

    &:disabled {
      cursor: default;
    }
  }
</style>
```
  <template v-slot:caption>
    modules/inline-select-field/ui/apos/components/AposWysiwygInputInlineSelect.vue
  </template>
</AposCodeBlock>

There is no `methods` section at all. The mixin's `update` is already the right handler for a select, so the template calls it directly.

The mixin gives the component:

| | |
|---|---|
| `field` | The schema field definition, as the server composed it. This is where `field.choices` comes from: the editor never has to ask the server what the choices are |
| `modelValue` | The stored value — `faculty`, not *Faculty* |
| `next` | The working copy the component edits. Starts as `modelValue` and follows it if it changes underneath |
| `placeholder` | The field's `placeholder`, or its `label`, already localized |
| `readOnly` | True for a `readOnly` field |
| `update(value)` | Accept a value and save it immediately |
| `updateDebounced(value)` | Accept a value, signal that the user is typing, and save in about a second. What you want for a keystroke |
| `flush()` | Save a pending debounced change right now. Call it on blur; the mixin also calls it before unmounting |
| `focus()` | Put the cursor in the editor, because the user clicked the last crumb of the field's trail. Finds an ordinary form control or a rich text editing area, whether that is the component's own root element — as the `select` is here — or something inside it. Override it if your editor is neither |

::: tip `update` or `updateDebounced`?
Use `updateDebounced` when the value passes through states the user does not mean — every keystroke of a half-typed word — and `update` when each change is a finished thought. A select is the second kind, which is why nothing here debounces, and why there is no `flush` on blur: there is never a pending change to lose.

Apostrophe's own [`AposWysiwygInputString.vue`](https://github.com/apostrophecms/apostrophe/blob/main/packages/apostrophe/modules/%40apostrophecms/schema/ui/apos/components/AposWysiwygInputString.vue) is the other case, and a short read.
:::

There is no save call to write. When the field belongs to the document the page is about, the mixin patches it through the context bar, which debounces and serializes changes the way the area editor does. When it does not — the same component mounted inside a modal, for instance — it emits `update:modelValue` and `changed` for a parent to deal with. Either way the component's only job is to say what the value is now.

Remember that admin UI code is only rebuilt when you ask for it. Run with `APOS_DEV=1` or configure `hmr: 'apos'` while working on the component. See [customizing the user interface](/guide/custom-ui.md).

## Trying it out

Add the field to a piece type or page type, render it with `Field`, and edit the page:

<AposCodeBlock>

```jsx
export default function({ piece }, { Field }) {
  return (
    <article className="person">
      <Field doc={piece} name="title" with={{ tag: 'h1' }} />
      <p>Affiliation: <Field doc={piece} name="affinity" />.</p>
    </article>
  );
}
```
  <template v-slot:caption>
    modules/person-page/views/show.jsx
  </template>
</AposCodeBlock>

Or in Nunjucks:

<AposCodeBlock>

```nunjucks
<article class="person">
  {% field data.piece, 'title' with { tag: 'h1' } %}
  <p>Affiliation: {% field data.piece, 'affinity' %}.</p>
</article>
```
  <template v-slot:caption>
    modules/person-page/views/show.html
  </template>
</AposCodeBlock>

Logged out, the page says `Affiliation: Faculty.` — one `span`, no editor, no second copy of the value. Editing the page turns that same word into a select, on the same line, in the page's own type. Choosing *Student* patches the document right away and the sentence reads `Affiliation: Student.`

A field with no value yet renders as an empty element, which is nothing to look at but is still there to click: in edit mode the select appears in its place with the label as its placeholder.

## Astro and other external fronts

Nothing above changes, but each field that a front end renders in place has to say so, with `wysiwyg: true` in its definition or by being named in its module's `wysiwygFields` option. Apostrophe sends an external front its data before the templates run, so it cannot work out which fields are involved on its own. This matters even for a field nobody will edit, because the rendered markup — *Faculty* rather than `faculty` — travels with that annotation. See [Astro](/guide/inline-editing.md#astro).

## Related

- [Inline editing](/guide/inline-editing.md) — the feature, in all three template languages
- [Custom schema field types](/guide/custom-schema-field-types.md) — the rest of what a field type does
- [Customizing the user interface](/guide/custom-ui.md) — building and shipping admin UI code
