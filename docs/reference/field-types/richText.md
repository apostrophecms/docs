# `richText`

A `richText` field stores formatted text — headings, bold, italics, links, lists, tables, inline images — edited with the same editor as the [rich text widget](/guide/core-widgets.md#rich-text-widget). The value is a string of sanitized HTML markup.

```javascript
// Configuring a `blurb` field in a `fields.add` subsection of a module:
blurb: {
  label: 'Blurb',
  type: 'richText'
}
```

## When to use it instead of an area

Rich text was originally available only as a widget inside an [`area`](/reference/field-types/area.md). That is still the right choice when an editor should be able to mix rich text with images, videos and other widgets, in any order and any number.

But a great many areas in real projects look like this:

```javascript
// One rich text widget. Always exactly one.
introduction: {
  type: 'area',
  options: {
    widgets: {
      '@apostrophecms/rich-text': {}
    },
    max: 1
  }
}
```

That is not an area of widgets at all — it is a rich text field wearing an area costume, and it makes everyone pay for the disguise. Templates have to render an area to get at a paragraph. Editors see an "Add widget" affordance for something they can never add a second one of. The REST API returns `{ metaType: 'area', items: [ { type: '@apostrophecms/rich-text', content: '…' } ] }` where a string would have done.

A `richText` field is the direct way to say it:

```javascript
introduction: {
  label: 'Introduction',
  type: 'richText'
}
```

**Rule of thumb:** if the area's `widgets` option names only `@apostrophecms/rich-text` and constrains the count to one, use a `richText` field. If more than one widget type is allowed, or the number is open-ended, keep the area.

## Settings

### Required

|  Property | Type | Default | Description |
|---|---|---|---|
|`label` | String | n/a | Sets the visible label for the field in the UI |
|`type` | String | n/a | Specifies the field type (`richText` for this type) |

### Optional

|  Property | Type | Default | Description |
|---|---|---|---|
|`def` | String | `''` | The default value for the field, as a string of HTML |
|`help` | String | n/a | Help text for the content editor |
|`hidden` | Boolean | `false` | If `true`, the field is hidden |
|`htmlHelp` | String | n/a | Help text with support for HTML markup |
|`if` | Object | `{}` | Conditions to meet before the field is active. [See the guide for details.](/guide/conditional-fields) |
|[`options`](#options) | Object | `{}` | Rich text editor configuration: `toolbar`, `styles`, `insert`, and the rest |
|`readOnly` | Boolean | `false` | If `true`, prevents the user from editing the field value |
|`required` | Boolean | `false` | If `true`, the field is mandatory. Markup containing no text, no table and no figure counts as empty |
|`requiredIf` | Object | `{}` | Conditions to meet before the field is required. [See the guide for details.](/guide/conditional-fields) |
|`wysiwyg` | Boolean | `false` | Needed for [Astro and other external fronts](/guide/inline-editing.md#astro), which receive the rendered markup rather than producing it — so set it even when the field will only be displayed. Nunjucks and JSX do not need it |

## `options`

The `options` object takes **exactly the options a rich text widget accepts** when configured in an area, and they are merged over the `defaultOptions` of the `@apostrophecms/rich-text-widget` module:

```javascript
pullQuote: {
  label: 'Pull Quote',
  type: 'richText',
  options: {
    toolbar: [ 'styles', 'bold', 'italic', 'link' ],
    styles: [
      {
        tag: 'p',
        label: 'Paragraph'
      },
      {
        tag: 'h3',
        label: 'Heading 3'
      }
    ]
  }
}
```

See the [rich text widget guide](/guide/core-widgets.md#rich-text-widget) for the full list: [`toolbar`](/guide/core-widgets.md#configuring-the-toolbar), [`styles`](/guide/core-widgets.md#configuring-text-styles), [`color`](/guide/core-widgets.md#configuring-the-color-picker), `insert`, table configuration, and the rest. Everything documented there applies here.

::: warning
`toolbar`, `styles` and `insert` go **inside** `options`, not alongside `type` and `label`. Apostrophe warns at startup if it finds one of them at the top level of a `richText` field, because in that position it has no effect.
:::

### One place to configure rich text

The `@apostrophecms/rich-text-widget` module remains the single place where the *behavior* of rich text is configured. Its `defaultOptions`, its `tools`, and its methods govern `richText` fields as well as rich text widgets.

A project that has already customized rich text — a house style set, a restricted toolbar, a custom link type — gets all of it in `richText` fields without doing anything.

## Displaying the value

Rich text is not quite markup you can print. A link to another Apostrophe document is stored as a **permalink placeholder** rather than a URL, so that it keeps working when the target page is moved or renamed, and an inline image is stored at a placeholder URL. Something has to turn those into real URLs before a visitor sees them. A rich text widget does it at render time, because a widget has an `output` method to do it in. A `richText` field is just a property of a document, with no render-time hook of its own.

### Use `Field`

`Field` and its equivalents resolve the placeholders for you. This is the easiest correct way to display a `richText` field, and editing in place comes with it:

```jsx
<Field doc={page} name="blurb" />
```

``` nunjucks
{% field data.page, 'blurb' %}
```

```astro
<AposField doc={page} name="blurb" />
```

See [inline editing](/guide/inline-editing.md) for the whole feature.

### When you do not want editing in place

Still use `Field`. Pass `edit: false` and it renders the value and never offers an editor, even to a user who could edit the document. The permalinks and images are resolved just the same:

```jsx
<Field doc={page} name="blurb" with={{ edit: false }} />
```

``` nunjucks
{% field data.page, 'blurb' with { edit: false } %}
```

```astro
<AposField doc={page} name="blurb" edit={false} />
```

::: warning Astro needs `wysiwyg: true` even here
Apostrophe renders the value for JSX and Nunjucks itself. For Astro it has to *send* the rendered markup, and it only sends it for fields marked [`wysiwyg: true`](/guide/inline-editing.md#astro). Without that mark `AposField` has nothing but the raw stored value to fall back on, placeholders and all — and nothing says so in production.

So mark the field either way, and let `edit={false}` be what turns the editor off. The mark says "this field is rendered by a template of mine", not "this field is editable."
:::

### Rendering it yourself

Sometimes a template is not involved at all — you are assembling markup for an email, or answering with a fragment of your own. Resolve the placeholders first, with the same method `Field` calls:

```javascript
const blurb = await self.apos.modules['@apostrophecms/rich-text-widget']
  .renderRichText(req, piece.blurb);
```

Then output the result as trusted markup:

```jsx
<div dangerouslySetInnerHTML={{ __html: blurb }} />
```

``` nunjucks
{{ blurb | safe }}
```

::: warning
Print the stored value without that step and the markup still contains placeholders: its internal links go nowhere. Inline images do display, because the image module serves them at their placeholder URL, but not at the SEO-friendly URL `renderRichText` would have given them.

If a template *is* involved, prefer [`Field`](#use-field) with `edit: false` over doing this by hand. It is one line, it cannot be forgotten, and it stays correct if the way rich text renders ever changes.
:::

## Storage, sanitization and search

- **Storage.** The value is a plain string of HTML in the document, so `piece.blurb` is the markup. No `metaType`, no `items` array, no `_id` to navigate past.
- **Sanitization.** Markup is sanitized on save with the same rules as a rich text widget with the same options. Anything the configured toolbar and styles do not permit is stripped, whether it arrives from the editor or from the REST API.
- **Search.** The text is indexed exactly as the content of a rich text widget is, so a `richText` field is findable in site search and in the admin UI without any extra configuration.
- **Emptiness.** Markup with no text is considered empty for `required` and for `isEmpty` checks — but a table or a figure counts as content even when it contains no words.

## Related

- [Inline editing](/guide/inline-editing.md) — putting this field on the page
- [Rich text widget](/guide/core-widgets.md#rich-text-widget) — the same editor, in an area
- [`area` field](/reference/field-types/area.md) — when one widget type is not enough
- [Rich text in the REST API](/reference/api/rich-text.md) — filtering, and importing inline images
