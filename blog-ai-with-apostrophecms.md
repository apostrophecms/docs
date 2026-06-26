# Why Your AI Coding Assistant Doesn't Know Your CMS (And What to Do About It)

There's a failure mode with AI coding tools that's worse than getting obviously wrong output. Obviously wrong output is fine — you see it immediately, lose thirty seconds, and move on. The costly failure is subtly wrong output: code that follows the right general shape, uses the right vocabulary, and looks completely plausible until you've spent three hours trying to figure out why a field isn't saving or a widget isn't rendering. Then you find it. One wrong property name. A missing namespace. A field type that's close but not valid.

This is the more common experience with specialized frameworks, and it's worth understanding why — because the fix isn't "use a better AI." It's understanding what AI tools actually know, and giving them what they're missing.

## The context problem with specialized frameworks

AI coding tools — Claude, Copilot, ChatGPT — are trained on enormous amounts of public code and documentation. That training data skews heavily toward the most popular tools. React, Express, Laravel, WordPress. The long tail of excellent, specialized software gets much thinner coverage.

This creates a real problem for developers working with less-ubiquitous frameworks. The AI isn't *wrong* about your CMS because it's bad at coding. It's wrong because it learned from a smaller, potentially older sample of code, and it has no awareness of your specific project's configuration.

CMS frameworks are particularly susceptible to this. They tend to have:

- Highly opinionated conventions that differ significantly from the underlying language defaults
- Configuration-heavy APIs that require knowing *exactly* which options are valid
- Inheritance and extension systems that are easy to get wrong if you're guessing
- Templates and schemas that interlock in ways a general-purpose AI won't predict correctly

The result: ask a general AI chat interface to write a widget or configure a content type, and you'll often get something that looks plausible but won't run.

## Chat interfaces vs. agentic tools

There's an important distinction that gets glossed over: using AI in a chat interface (like Claude.ai or ChatGPT) is fundamentally different from using an agentic coding tool that runs inside your project (like Claude Code, GitHub Copilot in your editor, or Cursor).

Chat interfaces start every conversation without awareness of your project. Most now let you upload files or create persistent projects where you attach your source tree, which meaningfully closes that gap — an AI with your actual module files in context is far more useful than one guessing from scratch. But even then, any code it generates lives only in the chat. Getting it into the right files in your project is on you, which adds friction and a second opportunity for something to go wrong.

Agentic tools that run *inside* your project directory are different. They can read your actual files, understand your module structure, see how your pieces and widgets are configured, and generate code that fits your existing patterns. When you ask "add a `subtitle` field to my blog post module," an in-project tool can actually look at `modules/blog-post/index.js`, understand what's already there, and write something that extends it correctly.

For CMS development specifically, this distinction matters enormously. The conventions are too project-specific for cold context to get right consistently.

## What AI tools don't know about ApostropheCMS

ApostropheCMS is a useful case study here because it's genuinely excellent software with a thoughtful, consistent API — but that API is distinctive enough that an AI working from generic "Node.js CMS" patterns will miss important things.

A few patterns that trip up AI tools without proper context:

**Module inheritance.** Everything in Apostrophe extends a base module. A piece type isn't just a file that exports an object — it's a module that explicitly declares `extend: '@apostrophecms/piece-type'`. An AI that doesn't know this will generate plausible-looking code that won't wire up correctly.

**Area fields and widgets.** In Apostrophe, editable content regions (areas) are defined as schema fields of type `area`, and they reference allowed widget types by name. This is not how most CMSes work, and an AI without this context will often try to handle editable regions differently.

**The schema field API.** Apostrophe has a rich, consistent schema field API — `string`, `integer`, `relationship`, `array`, `object`, `area`, and more — each with its own valid options. Getting the exact property names right matters. `required: true` in the wrong place, or a missing `type` property, and the field silently fails or throws at startup.

**Nunjucks templating.** Unless you're using the JSX template option, Apostrophe templates are Nunjucks — not React, not standard HTML, not EJS. An AI that defaults to JSX or standard template literals will generate templates that don't run.

**The `@apostrophecms/` namespace.** Core modules are namespaced. If you ask an AI to "add an image field," it needs to know that the relationship should point to `@apostrophecms/image`, not `image` or `Image`.

None of these are obscure edge cases. They're the everyday building blocks of an Apostrophe project.

## Giving AI the context it needs

The fix isn't abandoning AI tools — it's being deliberate about what context you provide. A few approaches that actually work:

**Use an agentic tool inside your project.** This is the highest-leverage change you can make. When an AI has read access to your actual codebase, it can pattern-match against your real module structure instead of guessing. In-project tools like Claude Code will read your existing modules and replicate your conventions.

**Paste in a representative example before asking for new code.** If you're in a chat interface, paste in a working module that's similar to what you want to create. "Here's my existing `article` piece type — write a `case-study` piece type that follows the same patterns." You're giving the AI a template to work from, not asking it to reconstruct your conventions from scratch.

**Name the Apostrophe version and template system explicitly.** "I'm using ApostropheCMS 3, Nunjucks templates" removes ambiguity immediately and signals to the AI that this is not a generic Node CMS setup.

**Be specific about module base types.** Instead of "create a widget that shows a team member," say "create an Apostrophe widget that extends `@apostrophecms/widget-type` with `name`, `title`, and `photo` schema fields where `photo` is a relationship to `@apostrophecms/image`." The more precise you are about Apostrophe's specific abstractions, the less the AI has to infer.

**Reference the docs in your prompt.** Apostrophe's documentation is well-structured and public. Telling an AI "use the pattern from the Apostrophe custom widgets guide" gives it a useful anchor, especially for tools that have web access.

## The broader principle

The underlying issue isn't specific to Apostrophe. It applies to any specialized framework, any opinionated platform, any system with its own conventions that diverge from the generic patterns an AI was trained on.

The developers who get the most out of AI tooling treat it like a very fast but slightly uninformed collaborator. They don't ask it to figure out their stack — they tell it the relevant constraints, give it a working example, and ask it to extend a pattern it can actually see.

For CMS work especially, the difference between a useful AI collaborator and one that generates plausible-but-broken code is almost always context. Get the context right, and the productivity gains are real. Assume the AI already knows your system, and you'll spend more time debugging than you saved.

---

*ApostropheCMS is a full-featured, open source Node.js CMS with in-context editing, a headless API, and a powerful module system. [See the docs](https://apostrophecms.com/docs) or try the [live demo](https://demo.apostrophecms.com).*
