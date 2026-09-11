# Migrating templates with an AI assistant

If you are moving an existing project from Nunjucks to [JSX templates](/guide/jsx-templates.md), you can give a coding assistant — Claude Code, Cursor, Copilot, or anything else that reads a project instructions file — the context it needs to do the conversion correctly.

The instructions below encode the parts of Apostrophe's JSX support that an assistant will otherwise get wrong. They are not a substitute for understanding the migration yourself: an assistant working from them still produces code you need to review, and this page tells you where to look hardest.

::: warning
Conversion errors in JSX templates are **silent**. The renderer does not validate attribute names, does not warn about React-isms, and does not reject malformed markup. A converted template that renders wrong markup looks exactly like one that worked. Convert on a clean git branch, review every diff, and render the pages before you merge.
:::

## Step 1 — add the core instructions

Copy the block below into your project's instructions file. The filename depends on your tool:

| Tool | File |
| --- | --- |
| Claude Code, Cowork | `CLAUDE.md` in your project root |
| Cursor, Windsurf, Codex, most others | `AGENTS.md` in your project root |
| Something else | Check your tool's docs for "project instructions", "rules", or "context file" |

If the file already exists, append this to it under its own heading rather than replacing what's there.

````markdown
## Converting ApostropheCMS Nunjucks templates to JSX

ApostropheCMS renders `.jsx` templates server-side as an alternative to Nunjucks
`.html`. Both are supported and coexist in one project, so migration is
incremental and can stop at any point.

The goal is converting templates **without breaking a working site**. That
matters more than speed: conversion errors here are silent, so a half-converted
template that renders subtly wrong markup is worse than one still in Nunjucks —
nothing errors, and nobody notices until a visitor does.

### Before converting anything

1. Check `git status`. If the tree is dirty, stop and say so — the user needs a
   clean point to diff against and revert to.
2. Confirm from `package.json` that the Apostrophe version supports JSX
   templates. If you cannot confirm it, say so rather than converting blindly.
3. Ask what specifically to convert. "Convert my templates" usually means one
   module, not the whole project.
4. Ask how the user verifies rendering. Silent failures make a verification path
   non-optional.

### Ordering: leaves first, layouts last

**A `.html` template cannot `{% extends %}`, `{% include %}`, or `{% import %}`
a `.jsx` template.** Nunjucks has no way to invoke the JSX renderer. The reverse
works fully: JSX can extend, include, and import Nunjucks, including block
overrides.

So a `page.jsx` extending an untouched `layout.html` is fine, and other
`page.html` files keep working because they still extend a `.html` layout. Only
once every template extending `layout.html` is converted or deleted can
`layout.html` itself become `layout.jsx`.

Before a multi-file conversion, build the dependency picture: grep for
`{% extends %}`, `{% include %}`, and `{% import %}` across the templates, and
work out which files are depended upon by others. Convert files nothing depends
on first. Apostrophe's core `outerLayoutBase.html` stays Nunjucks indefinitely —
a fully-migrated project ends with a `.jsx` layout extending it via `<Extend>`.
That is the intended steady state, not an unfinished migration.

### Macros do not convert incrementally

This is the one case with no safe intermediate state, and the obvious conversion
fails silently.

**`<Template>` cannot invoke a macro.** A macro file like `views/link.html`
contains only `{% macro render(options) %}…{% endmacro %}`. Rendering it
produces *nothing*, because defining a macro emits no output:

```jsx
{/* WRONG — renders an empty string */}
<Template templateName="link" label={item.linkText} />
```

Two correct routes:

- **If every caller is being converted:** rewrite the macro as a function
  component and import it. But a macro and all templates importing it must
  convert **in the same change** — the moment `link.html` becomes `link.jsx`,
  any remaining `.html` template importing it breaks.
- **If some callers must stay Nunjucks:** convert the macro file into an
  ordinary Nunjucks template reading `data.*` instead of macro arguments, then
  render it with `<Template>`, which passes props through as data.

Count the importers before starting.

### Template shape

A JSX template default-exports a function taking `(data, helpers)`:

```jsx
export default function({ page }, { Area, Extend }) {
  return (
    <Extend
      templateName="layout"
      main={<Area doc={page} name="main" />}
    />
  );
}
```

Destructure `data` in the signature — `page`, `piece`, `widget`, `global`,
`home` — rather than writing `data.page` throughout. The second argument carries
`{ apos, helpers, __t, Area, Component, Extend, Template, Widget }`.

Each prop passed to `<Extend>` maps to a `{% block %}` of that name in the
target. Use the bare template name, no extension. `{% set %}` becomes a `const`
in the function body. `{% area %}` becomes `<Area doc={page} name="main" />`.

### This is HTML in JSX syntax, not server-rendered React

There is no reconciler, no hydration, no client runtime. The following produce
broken markup with **no error**:

- **Event handler props do not work.** `onClick={fn}` stringifies the function
  into the attribute. Attach behavior from browser-side JavaScript targeting a
  class or data attribute. A lowercase inline `onclick="…"` *string* is fine —
  it passes through like any other attribute, so leave existing ones alone.
- **`style` takes a string.** `style={{ color: 'red' }}` renders
  `style="[object Object]"`.
- **Only three attribute groups are translated:** `className` → `class`,
  `htmlFor` → `for`, and SVG camelCase properties (`strokeWidth` →
  `stroke-width`, `xlinkHref` → `xlink:href`). **Everything else passes through
  verbatim.** So `srcSet` emits `srcSet`, `httpEquiv` emits `httpEquiv`,
  `defaultValue` emits `defaultValue`. Write the HTML attribute names —
  `srcset`, `http-equiv`, `value`. (`srcSet` appears to work only because HTML
  attribute parsing is case-insensitive; it is still wrong.)
- **`false`, `null`, and `undefined` remove an attribute entirely**; `true`
  renders it bare. Correct for HTML boolean attributes, wrong for `aria-*`,
  where the string `"false"` is meaningful: write
  `aria-hidden={String(isHidden)}`.
- **Objects as children render `[object Object]`** rather than raising an error.
  Void elements given children serialize as malformed `<img>…</img>`.
- **Hooks, state, context, refs, portals, `memo`, `forwardRef` do not exist.**
  `key` and `ref` are accepted and silently discarded — do not add them.

Also: `{items.length && <ul>…</ul>}` renders a literal `0` when the array is
empty. Write `{items.length > 0 && …}`.

### Where no clean equivalent exists yet

Nunjucks **template filters are unavailable in JSX** — they live in a registry
the JSX renderer does not read. `{{ super() }}` inside a block override has no
documented equivalent. `apos.styles.elements()` and `apos.styles.attributes()`
return raw HTML and attribute strings that do not drop into JSX.

For a project's *own* custom filters there is a clean path: register the
underlying function via `addHelpers` and call it as
`helpers.modules['module-name'].method(value)`, or reach the module method
through `apos`.

When you hit one of these, produce your best working equivalent **and mark it**:

```jsx
// TODO(apostrophe-migration): `date` filter has no JSX equivalent.
// Using dayjs — verify format tokens and locale against the original output.
```

Then list every TODO in your summary. A blocked file helps nobody, but an
unverified guess shipped silently is how a migration quietly breaks a production
site. Both halves matter. Never invent an API that does not exist — if you
cannot find the real one, say so.

For `super()` specifically, leaving that template in Nunjucks is often the right
call. A template whose only purpose is tweaking one block is a poor conversion
candidate.

### Verifying

- **Render the page** and compare against the pre-conversion version. This
  catches more than any static check.
- **Diff the HTML** before and after if you can. Attribute-level regressions
  show up here and nowhere else.
- **Grep your own output** for `onClick`, `style={{`, `srcSet`, `key={`, and any
  remaining `{%` or `{{`.

Report honestly: what converted cleanly, what carries a TODO, what you left in
Nunjucks and why. A migration report that overstates completeness costs more
than one admitting three files need review.
````

## Step 2 — save the pattern reference

The block above covers the rules that prevent silent breakage. This second block is a tag-by-tag reference — useful during an actual migration, not worth carrying as permanent context.

Save it as a separate file in your project, for example `docs/nunjucks-to-jsx-patterns.md`, and point your assistant at it when you start converting: *"Read docs/nunjucks-to-jsx-patterns.md, then convert modules/hero-widget/views/widget.html."*

````markdown
# Nunjucks to JSX — pattern reference

## Interpolation

`{{ data.page.title }}` → `{page.title}`

Destructure once in the signature rather than carrying `data.` through the file.
Both auto-escape.

## Comments

`{# note #}` → `{/* note */}`. In the function body, ordinary `//` comments read
better.

## Conditionals

```nunjucks
{% if data.user %}<a href="/logout">Log out</a>{% endif %}
```

```jsx
{user && <a href="/logout">Log out</a>}
```

For if/else use a ternary. Beware `&&` with numbers — `{items.length && …}`
renders `0` when empty. Write `{items.length > 0 && …}`.

## Loops

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

No `key` — there is no reconciler and it is discarded. Nunjucks `{% for %}` has
an `{% else %}` clause for the empty case; in JSX that becomes an explicit
conditional around the `.map()`.

## Areas

```nunjucks
{% area data.page, 'main' %}
```

```jsx
<Area doc={page} name="main" />
```

Context options move from the `with` keyword to a prop:

```jsx
<Area
  doc={page}
  name="main"
  contextOptions={{
    '@apostrophecms/image': { sizes: '(min-width: 600px) 45vw' }
  }}
/>
```

Inside the receiving widget template those arrive as `contextOptions`.

## Async components

```nunjucks
{% component 'blog:recent' with { max: 5 } %}
```

```jsx
<Component module="blog" name="recent" max={5} />
```

## Includes

`{% include 'partial.html' %}` → `<Template templateName="partial" />`

`<Template>` is include semantics: props arrive as data in the target.
Apostrophe's cross-module `module:file` syntax works in `templateName`. When the
partial is co-located, a direct `import` is simpler — JSX templates are real
modules.

## Extends and block overrides

```nunjucks
{% extends "layout.html" %}
{% block beforeMain %}<header><h2>Header</h2></header>{% endblock %}
{% block main %}<h3>Content</h3>{% endblock %}
```

```jsx
<Extend
  templateName="layout"
  beforeMain={<header><h2>Header</h2></header>}
  main={<h3>Content</h3>}
/>
```

`<Template>` and `<Extend>` differ only when the target is `.html`: `<Template>`
passes props as data without overriding blocks; `<Extend>` overrides blocks.
Against a `.jsx` target they are identical, because props *are* data.

## set

```nunjucks
{% set attachment = apos.image.first(data.widget._image) %}
```

```jsx
const attachment = apos.image.first(widget._image);
```

Declare it in the function body before the `return`.

## Widget templates

Same shape as page templates; widget data is on `widget`:

```jsx
export default function({ widget }, { apos }) {
  const attachment = apos.image.first(widget._image);
  const url = attachment && apos.attachment.url(attachment, { size: 'full' });

  return url && (
    <img
      src={url}
      width={apos.attachment.getWidth(attachment)}
      height={apos.attachment.getHeight(attachment)}
      srcset={apos.image.srcset(attachment)}
      alt={widget.imageAlt || ''}
    />
  );
}
```

Note `srcset` lowercase — `srcSet` is not translated.

## Raw HTML

```nunjucks
{{ data.widget.content | safe }}
```

```jsx
<div dangerouslySetInnerHTML={{ __html: widget.content }} />
```

The attribute name is deliberately alarming; treat it that way. Never pass
untrusted input through it. Nunjucks `SafeString` values returned from helpers
pass through unescaped without needing this.

## Localization

`__t` is on the helper object and matches the Nunjucks global:

```jsx
export default function(data, { __t }) {
  return <p>{__t('project:articleBlurb')}</p>;
}
```

## Filter substitutions

| Filter | JSX equivalent |
| --- | --- |
| `build` | `apos.url.build(...)` |
| `escape` | Unnecessary — JSX auto-escapes |
| `safe` | `dangerouslySetInnerHTML={{ __html: value }}` |
| `nlbr` | `value.split('\n').map((line, i) => <>{i > 0 && <br />}{line}</>)` |
| `date` | Import `dayjs` — **verify format tokens and locale**, they differ |
| `striptags` | No safe one-liner; a regex mishandles attributes containing `>` and comments. Prefer stripping server-side in a module method |
| `clonePermanent`, `css`, `json`, `jsonAttribute`, `merge`, `nlp`, `query` | No documented equivalent — leave marked as TODO rather than inventing one |
````

## What this will not do for you

The instructions make an assistant substantially more reliable on Apostrophe-specific mechanics. They do not make it correct.

Expect to review carefully around: anything touching template filters or `super()`, where no clean equivalent exists and the assistant is guessing; macro conversions, where the whole importer set has to move together; and attribute-level details, which are exactly what silent failures look like.

If your project is large, convert one module, review it thoroughly, and only then continue. The first module tells you how much you can trust the rest.
