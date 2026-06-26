---
title: "Using AI effectively"
---

# Using AI Effectively in ApostropheCMS Development

AI coding tools can meaningfully accelerate ApostropheCMS development — but only when they have the right context. Because ApostropheCMS has a distinctive module system, schema API, and templating conventions, AI tools without project context will often generate plausible-looking code that doesn't run. This guide covers how to set up AI tools for success, what context to provide, and common mistakes to avoid.

## Choose the right tool for the job

There are two broad categories of AI coding tools, and they behave very differently for ApostropheCMS work.

**Chat interfaces** (Claude.ai, ChatGPT, etc.) start each conversation without awareness of your project. By default, every session starts cold, but most chat interfaces let you upload files directly or create persistent projects where you can attach your entire source tree. If you use a chat interface, use a project or upload relevant files; cold-start code generation for a framework-specific CMS is unreliable. Even with full context, there is a key difference from agentic tools. The chat doesn't transfer created code into your project directly.

This can be viewed as a drawback. Any code the AI generates exists only in the chat, and you're responsible for copying it into the right files or applying a diff patch in your project, which adds friction and introduces room for error. However, this can be viewed as desirable for teams that prefer to keep AI-generated code out of the codebase entirely. They're well-suited to answering architecture and implementation approach questions, helping you reason through the right solution before writing it yourself without an AI tool touching your files directly.

**In-project agentic tools** (Claude Code, Codex, etc...) run directly inside your project directory. They can read, write, and edit your actual files — creating new modules in the right location, modifying existing schemas without overwriting surrounding code, and running your project to verify output. Because they work with your real codebase rather than a snapshot of it, they stay in sync with changes you make and can handle multi-file tasks. The tradeoff is that in-project tools can act on more than you intended: they may modify files you didn't expect or chain multiple actions together. Reviewing diffs before accepting changes is a good habit. For implementation work, this is the recommended approach.

**Recommendation:** Use Claude Code or a similar in-project tool for implementation work, reviewing diffs before accepting. Use chat interfaces — with a project or uploaded files — for planning, architecture questions, and teams that want to keep AI out of the codebase.

## Giving an AI the context it needs

Whether you're using a chat interface or an in-project tool, the more Apostrophe-specific context you provide, the better the output.

### Always specify the version and template system

```
I'm working with ApostropheCMS 4, using Nunjucks templates (not JSX).
```

This immediately tells the AI it's not dealing with a generic Node.js CMS, and that templates should be Nunjucks.

### Point to or share a working example before asking for new code

If you need a new piece type that follows your existing patterns, give the AI a real module to work from rather than asking it to reconstruct your conventions from scratch.

In an in-project tool, reference the file directly:

```
Read modules/article/index.js, then create a case-study piece type at 
modules/case-study/index.js that follows the same patterns, with fields for:
- client (string)
- summary (string, required)
- body (area, allows rich-text and image widgets)
```

In a chat interface with an uploaded file or project, refer to it by name:

```
Using the article module I've attached as a reference, create a case-study 
piece type that follows the same patterns, with fields for:
- client (string)
- summary (string, required)
- body (area, allows rich-text and image widgets)
```

Both approaches are more reliable than asking the AI to reconstruct ApostropheCMS conventions from scratch.

### For REST API and headless work, use the OpenAPI spec

The ApostropheCMS team maintains an [OpenAPI 3.1 specification](https://github.com/apostrophecms/apostrophe/tree/main/packages/apostrophecms-openapi) for the core REST API as a separate package. Uploading the YAML to a chat session or pointing an in-project tool at it gives the AI precise, structured knowledge of standard endpoints, authentication, and field formats — more reliable than prose documentation for API questions.

The core spec covers built-in endpoints only. For a spec that also includes your custom piece types and project-specific routes, use [`@apostrophecms/openapi-generator`](https://apostrophecms.com/extensions/openapi-generator) to generate one from your running project.

### Be explicit about module base types

Name the ApostropheCMS base type explicitly in your prompts. Generic descriptions leave too much room for incorrect guesses.

Instead of:
> "Create a widget that displays a team member card"

Use:
> "Create an ApostropheCMS widget that extends `@apostrophecms/widget-type`. It should have schema fields for `name` (string), `title` (string), and `photo` (relationship to `@apostrophecms/image`, max 1)."

The key terms to use in prompts:
- `extends @apostrophecms/piece-type` for piece types
- `extends @apostrophecms/page-type` for page types
- `extends @apostrophecms/widget-type` for widgets
- `@apostrophecms/image` for image relationships
- `area` field type for editable content regions

## ApostropheCMS-specific patterns to include in prompts

These are the patterns AI tools most often get wrong without explicit guidance.

### Module file structure

An ApostropheCMS module lives at `modules/[module-name]/index.js` (or `index.mjs` for ESM projects). It exports a configuration object, not a class:

```javascript
// modules/article/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Article'
  },
  fields: {
    add: {
      subtitle: {
        type: 'string',
        label: 'Subtitle'
      },
      body: {
        type: 'area',
        label: 'Body',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {},
            '@apostrophecms/image': {}
          }
        }
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['title', 'subtitle', 'body']
      }
    }
  }
};
```

Sharing this pattern with an AI before asking it to generate a new module gives it the exact structure to follow.

### Schema field types

When asking AI to add or modify schema fields, name the field type explicitly. Common types the AI should know:

| Type | Use for |
|---|---|
| `string` | Single-line text |
| `area` | Editable content region with widgets |
| `array` | Repeatable groups of fields |
| `object` | A fixed group of sub-fields |
| `relationship` | References to other docs (pieces, pages, images) |
| `boolean` | True/false toggle |
| `select` | Dropdown with defined choices |
| `integer` / `float` | Numeric fields |
| `slug` | URL-safe identifier (auto-generated from title by default) |

See the full [schema field types reference](/reference/field-types/) for all options and their properties.

### Areas and widgets

An `area` field defines an editable content region. The `widgets` object inside `options` lists the widget types editors can add. Widget type names use the module name format:

```javascript
body: {
  type: 'area',
  options: {
    widgets: {
      '@apostrophecms/rich-text': {
        toolbar: ['bold', 'italic', 'link']
      },
      '@apostrophecms/image': {},
      'my-custom-widget': {}
    }
  }
}
```

Widgets are part of the page or piece document — they are not independent database documents. Tell the AI this if it tries to treat widgets like standalone entities.

### Nunjucks templates

Apostrophe's default template language is [Nunjucks](https://mozilla.github.io/nunjucks/). If you're in a chat interface and asking for template code, specify this explicitly. Key template patterns:

```nunjucks
{# Render an area field #}
{% area data.piece, 'body' %}

{# Render an image relationship #}
{% if data.piece.photo and data.piece.photo.length %}
  {% set image = apos.image.first(data.piece.photo) %}
  <img src="{{ apos.attachment.url(image, { size: 'full' }) }}" alt="{{ image.alt }}">
{% endif %}

{# Loop over a relationship field #}
{% for author in data.piece._authors %}
  <span>{{ author.title }}</span>
{% endfor %}
```

Note that relationship fields resolved at query time are prefixed with `_` (e.g., `_authors`). This is an ApostropheCMS convention AI tools frequently miss.

## Common mistakes AI tools make with Apostrophe

### Using the wrong template syntax

An AI without context will often generate JSX, EJS, or plain HTML templates. Always specify Nunjucks, or paste in a working `.html` template as a reference.

### Generating module.exports as a class

Some AI tools, especially those trained on generic Node.js patterns, will try to export a class instead of a configuration object. ApostropheCMS modules export plain objects.

```javascript
// ❌ Wrong
module.exports = class ArticleModule { ... }

// ✅ Correct
module.exports = {
  extend: '@apostrophecms/piece-type',
  ...
}
```

### Missing the `@apostrophecms/` namespace

Core module names use the `@apostrophecms/` npm namespace. An AI that shortens these (e.g., `piece-type` instead of `@apostrophecms/piece-type`) will generate code that throws at startup.

### Getting relationship field syntax wrong

Relationship fields have specific syntax for limiting types and quantity:

```javascript
// ✅ Correct
photo: {
  type: 'relationship',
  withType: '@apostrophecms/image',
  max: 1,
  label: 'Photo'
}
```

Without an example, AI tools often mix up `withType`, `max`, and `required` for relationship fields.

### Treating widgets as standalone documents

Widgets are embedded in a piece or page document, not separate database entries. They don't have their own `_id` lookups or REST endpoints in the standard API. AI tools sometimes suggest querying or updating widgets independently, which doesn't work.

## Working effectively with in-project tools

In-project tools like Claude Code can do more than generate code — they can read, create, and edit files directly in your project. Taking advantage of this makes them significantly more useful than using them as a fancier chat interface.

### Let the AI read before it writes

Before asking for a new module, ask the AI to read an existing one first. This grounds its output in your actual project conventions rather than its training data defaults.

In Claude Code:
```
Read modules/article/index.js, then create a new piece type for case studies at 
modules/case-study/index.js. It should follow the same patterns and include fields 
for title, client (string), summary (string, required), and a body area.
```

The AI will replicate your field groupings, your ESM/CJS style, and any project-specific conventions it finds in the file.

### Ask it to modify existing files, not just create new ones

One of the biggest advantages of in-project tools over chat is that they can edit a specific section of an existing file without you having to copy-paste anything. You can say:

```
Add a `featuredImage` relationship field (withType: '@apostrophecms/image', max: 1) 
to the article module's schema, in the basics group.
```

The AI will locate the right file, find the right section, and insert the field correctly — including updating the `group` definition if needed.

### Verify generated code in context

Ask the AI to check its work against related files. If it generates a new widget, ask it to also verify that the widget is registered in `app.js` (or `app.mjs`) and that the template file is in the right location (`modules/[widget-name]/views/widget.html`).

```
After creating the widget, check that it's registered in the modules configuration 
in app.js and that a basic widget.html template exists at the correct path.
```

### Check the inheritance chain when something doesn't work

If generated code doesn't behave as expected, ask the AI to reason about what the parent module provides. Unexpected behavior is often a conflict between a custom field name and one inherited from a base module.

```
What fields and options does @apostrophecms/piece-type provide automatically? 
Is there anything in my article module's schema that could conflict with those?
```

### Use the AI to navigate the docs

The ApostropheCMS docs at [apostrophecms.com/docs](https://apostrophecms.com/docs) are comprehensive. In-project tools with web access can look up specifics on demand:

```
What toolbar options are available for the @apostrophecms/rich-text widget? 
Check the ApostropheCMS docs and update the body area in modules/article/index.js 
to include a standard set.
```

## Further reading

- [Modules](/guide/modules.html) — the building block of every ApostropheCMS project
- [Custom Widgets](/guide/custom-widgets.html) — creating your own widget types
- [Pieces](/guide/pieces.html) — structured content types
- [Content Schema](/guide/content-schema.html) — the full schema field API
- [Areas and Widgets](/guide/areas-and-widgets.html) — editable content regions
- [Working with Templates](/guide/templating.html) — Nunjucks template patterns
