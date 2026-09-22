# Template tags

Apostrophe template tags add additional functionality to templates, such as inserting widget areas, async components, and template fragments. The tags described below are specific to Apostrophe, though they use the standard Nunjucks syntax: `{% tagName %}`. See standard tags in the [Nunjucks reference](https://mozilla.github.io/nunjucks/templating.html#tags).

::: info
Tags are a **Nunjucks** feature — JSX has no tag syntax at all, since it's real JavaScript. Every tag below has a JSX equivalent, though:

| Nunjucks tag | In a JSX template |
| --- | --- |
| [`area`](#area) | `<Area doc={page} name="main" />` — see [Areas](/guide/jsx-templates.md#areas) |
| [`field`](#field) | <span v-pre>`<Field doc={page} name="headline" with={{ tag: 'h1' }} />`</span> — see [Inline editing](/guide/inline-editing.md#jsx-templates) |
| [`component`](#component) | `<Component module="product" name="newest" max={3} />` — see [Async components](/guide/jsx-templates.md#async-components) |
| [`fragment`](#fragment-render-and-rendercall) | A plain function component — see the [fragments-to-components mapping](/guide/fragments.md) |
| [`render`](#fragment-render-and-rendercall) | Call the component as a JSX element, e.g. `<Button text="Click me" action="send" />` |
| [`rendercall`](#fragment-render-and-rendercall) | Same as `render`, passing content as `children` instead of a `rendercaller()` slot |
| [`widget`](#widget) | `<Widget widget={widget} options={options} with={contextOptions} />` — like the tag itself, rarely needed outside core's own area-rendering template |

Nunjucks remains fully supported, so the reference below describes current, working functionality.
:::

If a template tag takes multiple arguments they will be comma-separated. Additional context data may be included after a `with` keyword. See `area` below for examples of both.

| Tag name | Description | Self-closing |
| -------- | ----------- | ------------ |
| [`area`](#area) | Insert a [widget area](/guide/areas-and-widgets.md) | Yes |
| [`field`](#field) | Insert one schema field, [editable in place](/guide/inline-editing.md) | Yes |
| [`component`](#component) | Insert an [async component](/guide/async-components.md) | Yes |
| [`fragment`](#fragment-render-and-rendercall) | Declare a [template fragment](/guide/fragments.md) | No |
| [`render`](#fragment-render-and-rendercall) | Insert a basic template fragment | Yes |
| [`rendercall`](#fragment-render-and-rendercall) | Insert a template fragment that includes a `rendercaller` slot | No |
| [`widget`](#widget) | Used in the core area template to render individual widgets | Yes |


## `area`

The `area` tag inserts an area field into the template. The area field [must already be configured](/guide/areas-and-widgets.md#basic-area-configuration) in the page.

### Usage

``` nunjucks
{% area context, areaName with contextOptions %}
```

**Example:**
``` nunjucks
{# Without context options (most typical) #}
{% area data.page, 'sidebar' %}

{# Including context options #}
{% area data.page, 'main' with {
  '@apostrophecms/image': {
    sizes: '(min-width: 600px) 45vw, (min-width: 1140px) 530px'
  }
} %}
```

### Arguments

#### `context`

The area's document context, either a page (`data.page`), piece (`data.piece`), widget (`data.widget`), `array` field or `object` field. The area field must be defined in the field schema for that context. See the [template data](/guide/template-data.md) section for more on each `data` property.

#### `areaName`

The name (a string) of the area field as defined in the field schema.

#### `contextOptions` (optional)

The context options object is added after area tag arguments following the `with` keyword. It is an object with keys matching the names of widget types allowed in that particular area field. Each key is assigned a value that will be passed into the widget template as `data.contextOptions`. See the [image widget guide](/guide/core-widgets.md#image-widget) for an example.

Context options are optional for all core and official Apostrophe widget types.

::: info
Context options are not the best place for most widget configuration. That should be done in the [area field configuration](/reference/field-types/area.md#widgets). Context options are used to supplement that with options that only apply to the specific template context. Context options cannot change which widgets are permitted in an area.
:::

## `field`

The `field` tag outputs one schema field of a document, widget, array item or object, and lets the user edit it right where it appears on the page.

In JSX this is the [`Field` helper](/guide/jsx-templates.md#fields), which takes the same arguments in the same order:

```jsx
<Field doc={page} name="headline" with={{ tag: 'h1' }} />
```

See the [inline editing guide](/guide/inline-editing.md) for the full feature, in JSX, Nunjucks and Astro.

### Usage

``` nunjucks
{% field context, fieldName with options %}
```

**Example:**
``` nunjucks
{# The tag the field type chooses, and nothing else #}
{% field data.page, 'blurb' %}

{# Overriding the tag and adding a class #}
{% field data.page, 'headline' with { tag: 'h1', class: 'article__headline' } %}

{# A single line string stays on its line, full stop and all #}
<p>Name: {% field data.page, 'name' %}.</p>

{# A field of an array item #}
{% for section in data.page.sections %}
  {% field section, 'caption' with { tag: 'h2' } %}
{% endfor %}
```

### Arguments

#### `context`

The document the field belongs to — a page (`data.page`), piece (`data.piece`), widget (`data.widget`), `array` item or `object` field value. The field must be defined in the field schema for that context.

#### `fieldName`

The name (a string) of the field as defined in the field schema.

Only field types with an on-page editor can be named here, which today means [`string`](/reference/field-types/string.md) and [`richText`](/reference/field-types/richText.md). An [`area`](/reference/field-types/area.md) is also accepted, and is exactly equivalent to `{% area %}`. Any other type raises an exception naming the field and its type, rather than rendering something the user cannot edit — output those with an ordinary <span v-pre>`{{ }}`</span> expression.

#### `options` (optional)

An object added after the field name following the `with` keyword:

|  Property | Type | Description |
|---|---|---|
|`tag` | String | Overrides the tag the field type chose. A `string` is a `span`, a `string` with `textarea: true` is a `div`, and so is a `richText` field. |
|`class` | String | Added to the classes the field type asks for, not replacing them. |
|`style` | String | An inline style string, passed through to the tag. |
|`attrs` | Object | Additional attributes, passed through to the tag. |
|`edit` | Boolean | `false` renders the value and never offers editing, even to a user who could. |

Any other property is passed on to the editor component as one of its options.

When the field is an area, `with` means [what it means for `{% area %}`](#contextoptions-optional).

::: info
The tag outputs exactly one element — the one described above, with its classes, styles and attributes — whether or not the user is editing. Only the `data-` attributes the editor needs are added, and only in edit mode. Nothing is printed after the closing tag, not even a newline, so a field can be followed immediately by a comma or a full stop.
:::

## `component`

The `component` tag inserts an asynchronous component into the template. See the [async components guide](/guide/async-components.md) for more on using this feature.

### Usage

``` nunjucks
{% component 'module:componentName' with data %}
```

**Example:**
``` nunjucks
{% component 'product:newest' with { max: 3 } %}
```

### Arguments

#### `module:componentName`

The primary argument is a combination of the name of a module and the name of an async component from that module, separated by a colon. All async components belong to a specific module, though multiple modules may have components with the same name.

#### `data` (optional)

The data argument, following the `with` keyword, is available in the async component template as `data`. It can be any data type, however it is a best practice to use an object with subproperties.

## `fragment`, `render`, and `rendercall`

These three tags work together to declare and use **template fragments** — reusable template markup, including markup that needs to run [async code](/guide/async-components.md) such as an `area` tag. `fragment` *declares* a fragment (closed with `endfragment`); `render` inserts one; `rendercall` inserts one while also passing markup into a `rendercaller()` slot inside it (closed with `endrendercall`).

```nunjucks
{% fragment button(text, action, options = {}) %}
  <button class="o-button {{ options.class }}" data-action="{{ action }}">{{ text }}</button>
{% endfragment %}

{% render button('Click me', 'send', { class: 'is-blue' }) %}
```

See the [template fragments guide](/guide/fragments.md) for the full syntax, argument defaults, importing fragments across files, and `rendercall`'s markup-passing pattern — it covers all three tags in depth and this page won't duplicate it.

## widget

The `widget` template tag will usually not be used in Apostrophe project templates. It is used in the core area template file to render individual widgets.

``` nunjucks
{% widget widgetObject, widgetOptions with contextOptions %}
```

**Example:**
``` nunjucks
{# Example from modules/@apostrophecms/area/views/area.html in apostrophe core #}
{% widget item, widgetOptions with data._with %}
```

### Arguments

#### `widgetObject`

An individual widget object from area field data. Eventually passed into a widget template as `data.widget`.

#### `widgetOptions`

Widget options object as defined in the area configuration. Eventually passed into a widget template as `data.options`.

#### `contextOptions`

Area context options for the widget type as [defined in the template using the area](/guide/areas-and-widgets.md#passing-context-options). Eventually passed into a widget template as `data.contextOptions`.
