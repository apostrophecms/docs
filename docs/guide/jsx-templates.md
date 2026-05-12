# JSX templates

Apostrophe page, widget, and component templates can be written in **JSX** as an alternative to [Nunjucks](/guide/templating.md). For developers already comfortable with React or another JSX-aware framework, this means modern editor support, real JavaScript control flow, and accurate error reporting with source maps, without standing up a separate front-end project.

::: info
This guide assumes you have written JSX before. It focuses on the Apostrophe-specific equivalents of Nunjucks features rather than on JSX itself.
:::

JSX templates are a server-side rendering option. They do **not** imply React: there is no virtual DOM, no client runtime, and no front-end framework requirement. JSX here is simply an alternate JavaScript syntax that accommodates inline markup, evaluated on the server in the same place Nunjucks would have run.

JSX interoperates with Nunjucks in one direction: a `.jsx` template can extend or include a `.html` template (with block overrides where appropriate), but a `.html` template cannot extend or include a `.jsx` template. In practice this means you migrate a project from the leaves up, converting individual page and widget templates to JSX while keeping `layout.html` and the core Nunjucks templates in place. See [Migration order](#migration-order) for the rules.

## File location and naming

JSX templates live in the same `views/` directories as Nunjucks templates, and Apostrophe finds them with the same lookup rules:

```
modules/default-page/views/page.jsx
modules/two-column-widget/views/widget.jsx
modules/blog/views/newest.jsx
views/layout.jsx
```

When both `page.jsx` and `page.html` exist for the same module, the `.jsx` version is used. Rename a single `.html` file to `.jsx` (and convert its contents) to migrate it; no other configuration is required.

## Anatomy of a JSX template

A JSX template **exports a default function** that returns markup. The function takes two arguments:

1. **`data`**: the same data object you would have referenced as `data.*` in Nunjucks. Destructure the props you need, just as you would in a React component.
2. **An object of Apostrophe template helpers**: `{ apos, helpers, Area, Component, Extend, Template, Widget }`.

<AposCodeBlock>

```jsx
export default function({ page }, { Area }) {
  return (
    <>
      <h1>{page.title}</h1>
      <Area doc={page} name="main" />
    </>
  );
}
```
<template v-slot:caption>
modules/default-page/views/page.jsx
</template>

</AposCodeBlock>

The function may be `async`. It does not need to be: see [Async without async](#async-without-async) below.

### The second argument

| Name | Purpose |
| ---- | ------- |
| `apos` | The same object the rest of Apostrophe calls `self.apos`. Call any module method directly; JSX templates can `await`. |
| `helpers` | The Nunjucks-oriented helper functions (mostly thin wrappers around `apos.util` and related modules). Use these when you want the exact behavior of an existing Nunjucks helper or filter. |
| `Area` | Renders an area. Replaces `{% area ... %}`. |
| `Component` | Invokes an [async component](/guide/async-components.md). Replaces `{% component ... %}`. |
| `Template` | Renders another template by name with **include semantics**: props are passed as data. Replaces `{% include %}`. Against a JSX target, also serves as `{% extends %}` because props *are* data. |
| `Extend` | Renders another template by name with **extends semantics**. Against a Nunjucks target, props become named `{% block %}` overrides. Against a JSX target, behaves identically to `Template`. |
| `Widget` | Renders a single widget directly. Only needed if you are reimplementing `area.html` in JSX. |

## Nunjucks to JSX cheat sheet

### Interpolation

```nunjucks
<h1>{{ data.page.title }}</h1>
```

```jsx
<h1>{page.title}</h1>
```

Note the cognitive shift: in JSX, `data` is the first function argument. Destructure it once at the top and reference fields directly rather than as `data.page.title`.

### Conditionals

```nunjucks
{% if data.user %}
  <a href="/logout">Log out</a>
{% endif %}
```

```jsx
{user && <a href="/logout">Log out</a>}
```

For if/else, the ternary is the usual idiom:

```jsx
{user
  ? <a href="/logout">Log out</a>
  : <a href="/login">Log in</a>}
```

### Loops

```nunjucks
{% for product in data.products %}
  <li><a href="{{ product._url }}">{{ product.title }}</a></li>
{% endfor %}
```

```jsx
{products.map(product => (
  <li>
    <a href={product._url}>{product.title}</a>
  </li>
))}
```

::: info
React-flavored attributes like `key` and `ref` are accepted but ignored. They exist in React to help the client-side reconciler match elements across renders; there is no reconciler here, so they have nothing to do. Don't bother adding them.
:::

### Areas

```nunjucks
{% area data.page, 'main' %}
```

```jsx
<Area doc={page} name="main" />
```

[Context options](/guide/areas-and-widgets.md#passing-context-options) become an ordinary prop:

```jsx
<Area
  doc={page}
  name="main"
  contextOptions={{
    '@apostrophecms/image': {
      sizes: '(min-width: 600px) 45vw, 530px'
    }
  }}
/>
```

### Async components

```nunjucks
{% component 'product:newest' with { max: 3 } %}
```

```jsx
<Component module="product" name="newest" max={3} />
```

The component function defined in `modules/product/index.js` is invoked exactly as before. Apostrophe locates its template (`.jsx` first, then `.html`) using the same rules as Nunjucks.

Because JSX templates can run `async` code on their own (calling any method of any Apostrophe module directly), many components that previously existed only to expose async data to a template are no longer strictly necessary. They remain useful when you want a named, reusable separation of concerns.

### Including another template

```nunjucks
{% include "footer.html" %}
```

```jsx
<Template name="footer" />
```

Cross-module references use the same `module:file` syntax as Nunjucks:

```jsx
<Template name="blog:preview" item={item} />
```

If the template itself expects a prop literally named `name`, use `templateName` to disambiguate:

```jsx
<Template templateName="blog:preview" name="fancy" item={item} />
```

`name` is forwarded to the rendered template as a prop only when `templateName` is also present. `templateName` is never forwarded.

## Extending templates

JSX has no concept of named blocks. Markup the parent should render is passed in as **props**, including the implicit `children` prop made up of markup between the opening and closing tags, matching React conventions.

### Extending another JSX template

Pass named slots as props and the main body as children. The layout receives the slots in its `data` argument and the body as `children`, exactly like a React function component.

<AposCodeBlock>

```jsx
export default function({ page, global }, { Area, Component, Template }) {
  return (
    <Template templateName="layout"
      beforeMain={
        <header>
          <h2>Header Override</h2>
        </header>
      }
      afterMain={
        <footer>
          <Area doc={global} name="footer" />
        </footer>
      }
    >
      <h3>The Main Show</h3>
      <Component module="blog" name="recent" />
      <Area doc={page} name="body" />
    </Template>
  );
}
```
<template v-slot:caption>
modules/default-page/views/page.jsx
</template>

</AposCodeBlock>

The matching layout destructures the named slots and the implicit `children` prop:

<AposCodeBlock>

```jsx
export default function(
  { outerLayout, beforeMain, children, afterMain },
  { Template }
) {
  return (
    <Template templateName={outerLayout}
      main={
        <>
          {beforeMain || <header>Default Header</header>}
          {children}
          {afterMain || <footer>Default Footer</footer>}
        </>
      }
    />
  );
}
```
<template v-slot:caption>
views/layout.jsx
</template>

</AposCodeBlock>

### Extending a Nunjucks template (named block overrides)

Use **`<Extend>`** to extend a Nunjucks template with JSX-supplied block overrides. Each prop name maps to a `{% block <name> %}` in the target; the JSX value replaces the block contents. This is the migration path: keep `layout.html` exactly as it is and rewrite individual page templates in JSX one at a time.

<AposCodeBlock>

```jsx
export default function(
  { page, global },
  { Area, Component, Extend }
) {
  return (
    <Extend templateName="layout"
      beforeMain={
        <header>
          <h2>Header Override</h2>
        </header>
      }
      main={
        <>
          <h3>The Main Show</h3>
          <Component module="blog" name="recent" />
          <Area doc={page} name="body" />
        </>
      }
      afterMain={
        <footer>
          <Area doc={global} name="footer" />
        </footer>
      }
    />
  );
}
```
<template v-slot:caption>
modules/default-page/views/page.jsx
</template>

</AposCodeBlock>

::: info
`<Template>` and `<Extend>` differ only when the target is a `.html` file:

- `<Template templateName="layout.html" foo={…} />` is **include semantics**: `foo` arrives in `data.foo` and `{% block %}` declarations in `layout.html` are not overridden.
- `<Extend templateName="layout.html" foo={…} />` is **extends semantics**: `foo` overrides `{% block foo %}` in `layout.html`.

When the target is a `.jsx` file, both behave identically (props are the data argument, markup between tags is `children`). Use whichever name reads better in context.
:::

## Migration order

JSX and Nunjucks coexist freely in the same project, but there is one hard rule:

> **A `.html` template cannot `{% extends %}`, `{% include %}`, or `{% import %}` a `.jsx` template.** Nunjucks's template loader has no way to invoke the JSX renderer. The reverse (JSX consuming Nunjucks) is fully supported, including block overrides via `<Extend>`.

That asymmetry determines how to migrate a project. Two orderings work; the hybrid case does not.

**Bottom-up (recommended): convert leaves first.** Rename `page.html` files to `page.jsx` one at a time. Each new `page.jsx` extends the existing `layout.html` with `<Extend templateName="layout" … />`. Other `page.html` files continue to work unchanged because they still extend a `.html` layout.

**Top-down in one cut: convert a whole inheritance chain together.** Once every `page.html` that extends `layout.html` is gone (either deleted or converted to `.jsx`), you can rename `layout.html` to `layout.jsx`. The new `layout.jsx` extends the core outer layout with `<Extend templateName="outerLayoutBase" … />`.

**Hybrid: don't.** Don't leave any `.html` template extending a `.jsx` template. That combination cannot work.

::: info
Core's `outerLayoutBase.html` will remain Nunjucks for the foreseeable future, because every existing project's `layout.html` extends it via `{% extends data.outerLayout %}`. A fully-JSX project typically ends up with a `.jsx` layout that extends the core Nunjucks outer layout through `<Extend>`. This is the intended steady state, not a limitation.
:::

## Auto-escaping and raw HTML

JSX auto-escapes interpolated values, both inside element bodies and inside attribute values. This matches both React's and Nunjucks's defaults.

When you need to emit trusted raw HTML (for example, when overriding the rich text widget's template), use React's `dangerouslySetInnerHTML`:

```jsx
<div dangerouslySetInnerHTML={{ __html: widget.content }} />
```

The attribute name is intentionally alarming. Treat it that way: never pass untrusted input through it.

## Async without `async` {#async-without-async}

A JSX template can render an `<Area>`, a `<Component>`, or a `<Template>` whose default export is `async` **without itself being declared `async`**. Apostrophe collects pending output as it renders, awaits everything, and assembles the final HTML before the response is sent. You can mix synchronous and asynchronous markup freely.

Declare the template function `async` only when it needs to fetch data before rendering, for example by calling an external API. The [async component pattern](/guide/async-components.md) is often a cleaner place for that fetch, since it separates data-loading from markup.

::: info
This rendering model is not streaming. There is no React Suspense equivalent: the whole page is rendered, all pending pieces are awaited, and the response is sent in one piece. If your application needs partial hydration, streaming, or browser-side reactivity for components, our standard front-end pipeline (Vite, web components, HTMX) or a dedicated Astro project remain the right tools.
:::

## `import`, `require`, and inline components

JSX templates are real JavaScript modules. Use either `import` or `require` to pull in helpers, and write additional pure-function components inline in the same file:

```jsx
import { formatPrice } from '../lib/format.js';

function Price({ amount }) {
  return <span className="price">{formatPrice(amount)}</span>;
}

export default function({ product }) {
  return (
    <article>
      <h2>{product.title}</h2>
      <Price amount={product.price} />
    </article>
  );
}
```

This is in addition to `<Template name="...">`, which exists for parity with Nunjucks's string-based lookup and to support Apostrophe's `module:file` cross-module syntax. Use direct `import` when the partial is co-located and you do not need name-based resolution; use `<Template>` when you do.

## Widget templates

Widget templates work the same way as page templates: a default-exported function receiving `data` and the helper object. The widget data is on `widget`, and options and context options arrive as you would expect:

<AposCodeBlock>

```jsx
export default function({ widget, contextOptions }, { Area }) {
  return (
    <section className="two-column">
      <div className="col">
        <Area doc={widget} name="columnOne" />
      </div>
      <div className="col">
        <Area doc={widget} name="columnTwo" />
      </div>
    </section>
  );
}
```
<template v-slot:caption>
modules/two-column-widget/views/widget.jsx
</template>

</AposCodeBlock>

See [Template data](/guide/template-data.md) for the full list of properties available in widget templates.

## Error reporting

JSX templates are compiled with source maps. Runtime errors point at the original `.jsx` line and column rather than at the compiled output. Syntax errors and undefined variables surface as ordinary JavaScript errors with accurate locations, a significant improvement over Nunjucks's reporting.

## When to keep using Nunjucks

JSX is an alternative, not a replacement. The Nunjucks pipeline remains a first-class, fully supported option, and is the right choice when:

- An existing codebase already uses Nunjucks and its templates do not need to change.
- Your team prefers tag-based syntax or has Jinja/Twig/Nunjucks experience.
- You are sharing templates with a tool or workflow that expects Nunjucks.

The two can coexist indefinitely in the same project. Pick the option that fits the team and the file.
