# Use AI Coding Tools Effectively in ApostropheCMS Development

AI coding tools have a working knowledge of ApostropheCMS. The framework is well-documented, open source, and has a public GitHub history. This is enough that tools like Claude, ChatGPT, Copilot, Codex, or Cursor can often explain core concepts, describe how the module system works, or outline the difference between pieces and widgets without much help.

Where things get harder is project-specific context. An AI tool has no awareness of your module structure, your schema conventions, which widgets your project uses, or whether your project is using ESM or CommonJS. It also has less training depth on ApostropheCMS than it does on higher-traffic tools and frameworks, which means it can get subtly wrong on specifics, like the exact property name for a relationship field, the right namespace for a core module, or how your project renders templates.

These are not always obvious errors. They are the kind that produce code that looks right until you have spent an hour wondering why a custom option is not being set correctly, why a relationship only includes some of the fields you expected, or why a generated widget does not appear where it should.

This guide covers how to close that gap by giving AI tools the context they need to be useful for day-to-day ApostropheCMS development.

## Choose the right tool for the job

There are two broad categories of AI coding tools, and they behave very differently for code assistance.

**Chat interfaces** (Claude.ai, ChatGPT, etc.) start each conversation without awareness of your project. By default, every session starts cold, but most chat interfaces let you upload files directly or create persistent projects where you can attach your source tree, documentation, or selected project files. If you use a chat interface, best practice is to take advantage of these features.

Even with full context, there is a key difference from agentic tools: the chat does not transfer created code into your project directly.

This can be a drawback. Any code the AI generates exists only in the chat, and you are responsible for copying it into the right files or applying a diff patch in your project, which adds friction and introduces room for error. However, this can also be desirable for teams that prefer to keep AI-generated code out of the codebase entirely. Chat interfaces are well-suited to answering architecture and implementation questions, helping you reason through the right solution before writing it yourself, or reviewing a focused set of files without letting an AI tool touch your project directly.

**In-project agentic tools** (Claude Code, Codex, Cursor, etc.) run directly inside your project directory. They can read, write, and edit your actual files — creating new modules in the right location, modifying existing schemas without overwriting surrounding code, and running project commands to verify output. Because they work with your real codebase rather than a copied snippet, they can stay in sync with changes you make and can handle multi-file tasks.

The tradeoff is that in-project tools can act on more than you intended. They may modify files you did not expect, chain multiple actions together, or make reasonable-looking changes based on the wrong assumption. Reviewing diffs before accepting changes is a good habit. For implementation work, this is usually the recommended approach.

## Give AI tools persistent project context

The most effective way to improve AI output across your interactions — in chat or in-project tools — is to define your project context once rather than re-explaining it in every session. Most AI coding tools support some form of project-level instructions for exactly this purpose.

**Claude Code** commonly uses `CLAUDE.md` for project instructions. **Codex** uses `AGENTS.md`. **Cursor** supports persistent rules through Project Rules, Team Rules, User Rules, and `AGENTS.md`, with project rules typically stored in `.cursor/rules/`. Chat interfaces typically support persistent project instructions. Whatever tool you use, the idea is the same: describe your project once so each AI interaction can inherit that context automatically.

For an ApostropheCMS project, useful things to include are:

- ApostropheCMS version and whether the project uses ESM or CommonJS
- Template language in use, such as Nunjucks, JSX, or both
- Key module naming conventions and folder structure
- Project-specific patterns, such as shared field groups, widget naming, reusable helpers, or migration conventions
- Common development, linting, and test commands
- Any routes, APIs, or integration points the AI tool should handle carefully
- Links to relevant internal docs or architecture notes

A developer working with the agent, for example, can then ask "create a new piece type for events" without specifying all of the above because the project instruction file has already told the tool how the project is organized.

This is especially important in ApostropheCMS because two projects can organize the same feature differently. One project might define shared schema fields in helper files, another might keep all fields in the module, and another might use JSX templates instead of Nunjucks. Asking the AI to inspect nearby modules first helps it follow the project instead of generating a generic ApostropheCMS example.

::: tip
The ApostropheCMS docs themselves are a useful starting point for what to include. Linking to relevant guide pages in your context file gives AI tools a reliable reference for Apostrophe-specific patterns.
:::

## Working effectively with in-project tools

In-project tools like Claude Code, Codex, and Cursor can do more than generate code. They can read, create, and edit files directly in your project. Taking advantage of this makes them significantly more useful than treating them as code generators.

### Let the AI read before it writes

Before asking for a new module, ask the AI to read an existing one first. This grounds its output in your actual project conventions rather than its training data defaults.

> Read modules/article/index.js, then create a new piece type for case studies at 
> modules/case-study/index.js. It should follow the same patterns and include fields 
> for title, client (string), summary (string, required), and a body area.

The AI tool can then replicate your field groupings, your ESM or CommonJS style, and any project-specific conventions it finds in the file.

### Ask it to modify existing files, not just create new ones

One of the main advantages of in-project tools over chat is that they can edit a specific section of an existing file without you having to copy and paste anything. Example prompt:

> Add a `featuredImage` relationship field to the article module's schema, using the project's existing image field pattern. Put it in the basics group, update the group definition if needed, and make sure the article template renders the image using the same helper or component pattern used elsewhere in the project.

The tool can inspect the project, locate the likely module and template files, and propose a targeted change — including updating the field group if needed.

### Verify generated code in context

Ask the AI to check its work against related files. If it generates a new widget, ask it to also verify that the widget is registered in `app.js` or `app.mjs` and that the template file is in the right location, such as `modules/[widget-name]/views/widget.html` for a Nunjucks widget.

> After creating the widget, check that it's registered in the modules configuration 
> in app.js and that a basic widget.html template exists at the correct path.

You can also ask the tool to run the same verification commands you would run yourself, such as linting, tests, or a local build.

Example prompt:

> After making the change, run the project's lint and test commands. If either fails, explain the failure and propose the smallest fix.

### Check the inheritance chain when something does not work

If generated code does not behave as expected, ask the AI to reason about what the parent module provides. Unexpected behavior is often a conflict between a custom field name, a project convention, and something inherited from a base module.

> What fields and options does @apostrophecms/piece-type provide automatically? 
> Is there anything in my article module's schema that could conflict with those?

This can help identify issues that look like syntax errors but are actually module-system or schema-design problems.

### Watch for common ApostropheCMS failure modes

AI-generated code can look plausible while still being wrong for ApostropheCMS or for your specific project. When reviewing output, watch for issues like:

- using older ApostropheCMS patterns from previous major versions
- confusing piece types, page types, and widgets
- forgetting to register a new module in the project configuration
- placing widget templates in the wrong location
- inventing schema field options that are not part of the ApostropheCMS schema API
- projecting a relationship field without including the related fields needed for rendering
- generating Nunjucks examples for a JSX project, or JSX examples for a Nunjucks project
- treating ApostropheCMS like a generic Express app instead of using its module system

These are good reasons to keep the ApostropheCMS docs, project-specific conventions, and nearby working examples in the tool's context.

### Use the AI to navigate the docs

The ApostropheCMS docs at [apostrophecms.com/docs](https://apostrophecms.com/docs) are comprehensive. In-project tools with web access can look up specifics on demand:

> What toolbar options are available for the @apostrophecms/rich-text widget? 
> Check the ApostropheCMS docs and update the body area in modules/article/index.js 
> to include a standard set.

For documentation-backed questions, ask the tool to cite or summarize the page it used. This makes it easier to catch outdated assumptions before they become code.

## Use the Astro integration docs for headless frontend work

When an ApostropheCMS project uses Astro as the frontend, the best reference for AI tools is usually the `@apostrophecms/apostrophe-astro` integration documentation, not the REST API spec.

The integration is designed so ApostropheCMS manages content, URLs, editing, media, permissions, and page data, while Astro handles frontend rendering. In a typical Astro integration project, you do not manually fetch each content type from the REST API for normal page rendering. Instead, the catch-all Astro route uses `aposPageFetch(Astro.request)` to retrieve the current page data, then `AposLayout`, `AposTemplate`, and `AposArea` render the mapped Astro components.

That distinction matters when prompting AI tools. If the tool assumes the project is a generic headless frontend, it may generate unnecessary API calls, duplicate routing logic, or bypass the visual editing integration. For most page, template, widget, and layout work, ask it to follow the Astro integration patterns instead.

Example prompt:

> Read the @apostrophecms/apostrophe-astro setup in the frontend project. Then update
> the article show template using the existing AposTemplate, AposArea, and widget
> mapping patterns. Do not add direct REST API calls unless the existing project
> already uses them for this feature.

Useful integration-specific files to point the AI toward include:

- the Astro `astro.config.mjs` file where the Apostrophe integration is configured
- the catch-all `src/pages/[...slug].astro` route that calls `aposPageFetch`
- the `templatesMapping` file, often `src/templates/index.js`
- the `widgetsMapping` file, often `src/widgets/index.js`
- Astro page components in `src/templates`
- Astro widget components in `src/widgets`
- any `onBeforeWidgetRender` hook used for edit-mode widget rendering
- the `src/pages/api/apos-external-front/render-area.astro` bridge, if the project supports rendered area previews

The OpenAPI spec is still useful for custom API work, integrations, SDK generation, or frontend features that intentionally call REST endpoints. It just should not be the default reference for normal Astro-rendered page and widget work.

## Be explicit about headless Astro project boundaries

Many ApostropheCMS projects use ApostropheCMS with Astro handling the frontend. In these projects, ApostropheCMS still provides the Admin UI, content model, permissions, media library, page tree, URL-aware page data, and visual editing experience, while Astro handles frontend rendering through mapped templates and widgets.

These projects are often organized as a monorepo with separate backend and frontend apps. That split is important context for AI tools. Without it, the tool may try to solve a frontend problem in the ApostropheCMS backend, add routing to the wrong app, generate Nunjucks templates for a project that renders pages in Astro, or add direct API requests where the integration already provides the page data.

For headless Astro projects, include details like these in your project instructions:

- which directory contains the ApostropheCMS backend
- which directory contains the Astro frontend
- how the frontend connects to ApostropheCMS
- whether the project uses `@apostrophecms/apostrophe-astro`
- where `aposPageFetch`, `AposTemplate`, and `AposArea` are used
- where `templatesMapping` and `widgetsMapping` are defined
- where Astro routes, layouts, and components live
- which content types are rendered by Astro
- which files control visual editing integration
- which commands start the backend, the frontend, or both together

Example project instruction:

> This project uses ApostropheCMS with Astro as the frontend.
> The backend app is in apps/cms. The Astro frontend is in apps/frontend.
> ApostropheCMS provides the Admin UI, content schema, page tree, media library,
> URL-aware page data, and visual editing. Astro owns frontend rendering through
> templates, widgets, layouts, and components. Follow the existing
> @apostrophecms/apostrophe-astro patterns, including aposPageFetch,
> AposTemplate, AposArea, templatesMapping, and widgetsMapping. Do not add
> Nunjucks templates or direct REST API calls unless the task specifically asks
> for them.

This helps the AI tool make changes on the correct side of the project. A schema change belongs in the ApostropheCMS backend. A page layout change likely belongs in Astro. A visual editing issue may require checking both sides: the ApostropheCMS module configuration and the Astro integration code.

When asking for implementation work, name the boundary directly:

Example prompt:

> Update the article card display in the Astro frontend. Do not change the
> ApostropheCMS article schema unless a frontend field is missing. If a field is
> missing, explain the backend schema change before making it.

For monorepo projects, you can also ask the tool to inspect both apps before writing code:

Example prompt:

> Read the article piece type in apps/cms and the article listing route in
> apps/frontend. Then update the Astro article cards to display the existing
> featured image field using the project's current ApostropheCMS-Astro pattern.

## Review AI output like code from a new contributor

Treat AI-generated changes the same way you would treat code from a new contributor who is familiar with JavaScript but not necessarily familiar with your project.

Before accepting a change, check that:

- the diff is limited to the files you expected
- generated code follows the existing module, schema, and template conventions
- fields, options, and module names match the ApostropheCMS docs
- any new module is registered correctly
- related templates, helpers, or frontend components were updated only where needed
- linting, tests, or build checks pass when available

AI tools are most useful when they help you move faster through work you still understand. If you cannot explain the change, ask the tool to walk through it before you accept it.
