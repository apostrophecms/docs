---
prev: false
next: false
---
# ApostropheCMS Starter Kits

A starter kit is a complete, working ApostropheCMS project that you copy and build on. Each one comes with the modules, templates, and configuration for a particular kind of site, plus an `ARCHITECTURE.md` quick reference in the repository and an architecture guide here in the docs.

## Starter kits from the installer

The guided installer, `npm create apostrophe@latest`, offers four starter kits. It picks one from your answers to two questions: how you want to build, and where you want to start.

| Build | Starting point | Repository | Architecture guide |
|---|---|---|---|
| Apostrophe + Astro | Essentials | `starter-kit-astro-essentials` | [Astro Essentials](/guide/astro-essentials-overview.md) |
| Apostrophe + Astro | Demo | `astro-public-demo` | [Astro Public Demo](/guide/astro-demo-overview.md) |
| Apostrophe Standalone | Essentials | `starter-kit-essentials` | [Essentials](/guide/apostrophe-standalone-essentials-overview.md) |
| Apostrophe Standalone | Demo | `public-demo` | [Public Demo](/guide/apostrophe-demo-overview.md) |

**Apostrophe + Astro is the recommended build.** An [Astro](https://astro.build/) frontend renders your pages from content it fetches from ApostropheCMS over REST, and editors keep in-context editing. The Astro kits write their page and widget templates as `.astro` components. Inside those components you can also use React, Vue, Svelte, or another UI framework by adding its [Astro integration](https://docs.astro.build/en/guides/framework-components/).

Choose **Apostrophe Standalone** when you want a single Node.js process that renders pages on the server. [JSX templates](/guide/jsx-templates.md) are recommended for Standalone projects, and Nunjucks is also supported.

For the starting point, **Essentials** is a clean slate with no sample content. **Demo** is a working site with a blog, widgets, and components already in place, and you can choose to fill its database with sample content.

For a walkthrough of the installer's questions, see [Creating a project](/guide/development-setup.md#creating-a-project).

## Adding ApostropheCMS Pro extensions

None of the four installer kits needs a Pro subscription. You can add Pro extensions, such as [Advanced Permission](https://apostrophecms.com/extensions/advanced-permission) or the [Section Template Library](https://apostrophecms.com/extensions/section-template-library), to a project created from any of them. Browse what's available in the [extensions directory](https://apostrophecms.com/extensions), and see the [pricing page](https://apostrophecms.com/pricing) for subscription options.

## ApostropheCMS Assembly starter kits

[Apostrophe Assembly](https://apostrophecms.com/extensions/multisite-apostrophe-assembly) runs many sites, each with its own hostname and theme, from one dashboard. It requires an Apostrophe Pro subscription. The installer doesn't offer the Assembly starter kits. You clone them from GitHub instead.

There are two Assembly starter kits. They have the same dashboard, content model, and widgets, and differ in how they render customer-facing sites:

* **`astro-public-demo-multisite`** renders with Astro, in a separate frontend project. This is the recommended choice.
* **`public-demo-multisite`** renders with JSX templates, in a single ApostropheCMS process.

See [Assembly Starter Kits](./assembly.md) for how to choose between them and how to set one up.
