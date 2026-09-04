# Working with templates

Templates are where code and content turn into web pages people can actually see and use.

Apostrophe supports two template languages, and a single project can use both at once:

- **[JSX templates](/guide/jsx-templates.md)** — the recommended choice for new work. A template is a JavaScript module exporting a function that returns markup. It runs entirely on the server; no client-side JavaScript is involved and there is no React runtime.
- **[Nunjucks templates](/guide/nunjucks-templates.md)** — HTML with tags and variables sprinkled through it. Fully supported, and what existing projects and the starter kits use today.

A `.jsx` template can extend or include a `.html` one, so you can move a project across a file at a time. The reverse does not work — a Nunjucks template cannot extend a JSX one — which is why migrations run from the leaves up. See [migration order](/guide/jsx-templates.md#migration-order).

## Where templates live

Template files go in `views` directories, either as module subdirectories or at the project root.

![Screenshot of a file directory highlighting a default-page module views directory and the global views directory](/images/templating-views-dirs.jpg)

The root `views` directory will usually contain [a layout template](/guide/layout-template.md) and often [fragment templates](/guide/fragments.md). Templates in modules' `views` directories will usually be used only for their respective modules. [Widget](/guide/custom-widgets.md#widget-templates), [page](/guide/pages.md#page-template-essentials), and [piece page](/guide/piece-pages.md#the-index-page-template) templates are the main examples of that.

When you name a template without an extension, Apostrophe walks the module's view-folder override chain, preferring `.jsx` then `.njk` then `.html` **within each folder** — so a template in a nearer override folder wins regardless of its extension. See [`render()`](/reference/modules/module.md#async-render-req-template-data).

## How templates work together

To paraphrase [John Donne](https://en.wikipedia.org/wiki/John_Donne), no template is an island. Templates are always used as a system, composed three ways:

| | What it does | JSX | Nunjucks |
| --- | --- | --- | --- |
| **Extending** | A template inherits another and replaces named blocks of it | [`<Extend>`](/guide/jsx-templates.md#extending-templates) | [`{% extends %}`](/guide/nunjucks-templates.md#extending-templates) |
| **Including** | One template is pulled *into* another | [`<Template>`](/guide/jsx-templates.md#including-another-template) | [`{% include %}`](/guide/nunjucks-templates.md#including-templates) |
| **Cross-module references** | Naming a template that belongs to a different module, as `module-name:file` | [`<Template name="…">`](/guide/jsx-templates.md#including-another-template) | [`{% extends "module:file.html" %}`](/guide/nunjucks-templates.md#referencing-templates-across-modules) |

The composition model is the same in both languages. What differs is the syntax: a Nunjucks template declares `{% block %}` regions that a child overrides by name, while a JSX template passes those same named regions as **props**, so a block's content is an expression rather than a tag pair.

Almost every page template extends a layout, which in turn extends Apostrophe's core outer layout. See the [layout template](/guide/layout-template.md) guide for how that chain fits together.

## Further reading

- [JSX templates](/guide/jsx-templates.md) — syntax, the Nunjucks-to-JSX cheat sheet, and what does not carry over from React
- [Nunjucks templates](/guide/nunjucks-templates.md) — syntax, tags, filters, macros, and `super()`
- [Template data](/guide/template-data.md) — what is available inside a template
- [Areas and widgets](/guide/areas-and-widgets.md) — rendering editable content
