# PRO-9191 Review Diff

Generated: 2026-03-09 15:42:24 EDT

Baseline: `main`

## Changed Pages

- [build.html](http://localhost:5173/docs/build.html) (+30 / -0)
- [concepts.html](http://localhost:5173/docs/concepts.html) (+30 / -0)
- [deploy.html](http://localhost:5173/docs/deploy.html) (+29 / -0)
- [get-started.html](http://localhost:5173/docs/get-started.html) (+23 / -0)
- [guide/headless-cms.html](http://localhost:5173/docs/guide/headless-cms.html) (+2 / -0)
- [guide/hosting.html](http://localhost:5173/docs/guide/hosting.html) (+9 / -1)
- [guide/localization/dynamic.html](http://localhost:5173/docs/guide/localization/dynamic.html) (+2 / -2)
- [guide/migration/upgrading.html](http://localhost:5173/docs/guide/migration/upgrading.html) (+28 / -7)
- [reference-overview.html](http://localhost:5173/docs/reference-overview.html) (+25 / -0)
- [reference/field-types/oembed.html](http://localhost:5173/docs/reference/field-types/oembed.html) (+2 / -0)
- [reference/module-api/module-options.html](http://localhost:5173/docs/reference/module-api/module-options.html) (+4 / -0)
- [reference/modules/i18n.html](http://localhost:5173/docs/reference/modules/i18n.html) (+20 / -14)
- [reference/modules/piece-page-type.html](http://localhost:5173/docs/reference/modules/piece-page-type.html) (+4 / -0)
- [reference/modules/styles.html](http://localhost:5173/docs/reference/modules/styles.html) (+3 / -1)
- [reference/modules/url.html](http://localhost:5173/docs/reference/modules/url.html) (+127 / -0)
- [reference/server-events.html](http://localhost:5173/docs/reference/server-events.html) (+39 / -0)
- [tutorials/astro/apostrophecms-and-astro.html](http://localhost:5173/docs/tutorials/astro/apostrophecms-and-astro.html) (+8 / -5)
- [tutorials/astro/build-with-apostrophe-and-astro.html](http://localhost:5173/docs/tutorials/astro/build-with-apostrophe-and-astro.html) (+36 / -0)
- [tutorials/astro/concepts-for-apostrophe-and-astro.html](http://localhost:5173/docs/tutorials/astro/concepts-for-apostrophe-and-astro.html) (+38 / -0)
- [tutorials/astro/creating-pages.html](http://localhost:5173/docs/tutorials/astro/creating-pages.html) (+3 / -1)
- [tutorials/astro/creating-pieces.html](http://localhost:5173/docs/tutorials/astro/creating-pieces.html) (+4 / -0)
- [tutorials/astro/creating-widgets.html](http://localhost:5173/docs/tutorials/astro/creating-widgets.html) (+6 / -1)
- [tutorials/astro/deploying-hybrid-projects.html](http://localhost:5173/docs/tutorials/astro/deploying-hybrid-projects.html) (+13 / -3)
- [tutorials/astro/deploying-to-github-pages.html](http://localhost:5173/docs/tutorials/astro/deploying-to-github-pages.html) (+54 / -0)
- [tutorials/astro/deploying-to-netlify.html](http://localhost:5173/docs/tutorials/astro/deploying-to-netlify.html) (+56 / -0)
- [tutorials/astro/deploying-to-vercel.html](http://localhost:5173/docs/tutorials/astro/deploying-to-vercel.html) (+49 / -0)
- [tutorials/astro/deployment-overview.html](http://localhost:5173/docs/tutorials/astro/deployment-overview.html) (+70 / -0)
- [tutorials/astro/deployment-troubleshooting.html](http://localhost:5173/docs/tutorials/astro/deployment-troubleshooting.html) (+77 / -0)
- [tutorials/astro/environment-variables-by-host.html](http://localhost:5173/docs/tutorials/astro/environment-variables-by-host.html) (+73 / -0)
- [tutorials/astro/get-started-with-apostrophe-and-astro.html](http://localhost:5173/docs/tutorials/astro/get-started-with-apostrophe-and-astro.html) (+29 / -0)
- [tutorials/astro/index.html](http://localhost:5173/docs/tutorials/astro/index.html) (+69 / -0)
- [tutorials/astro/post-deploy-checklist.html](http://localhost:5173/docs/tutorials/astro/post-deploy-checklist.html) (+54 / -0)
- [tutorials/astro/reference-for-apostrophe-and-astro.html](http://localhost:5173/docs/tutorials/astro/reference-for-apostrophe-and-astro.html) (+36 / -0)
- [tutorials/astro/static-builds-with-apostrophe.html](http://localhost:5173/docs/tutorials/astro/static-builds-with-apostrophe.html) (+196 / -0)
- [tutorials/index.html](http://localhost:5173/docs/tutorials/index.html) (+3 / -3)

## Non-Page Markdown Files

- `PRO-9191-cross-repo-follow-on-plan.md` (+108 / -0)

## Per-File Diffs

### PRO-9191-cross-repo-follow-on-plan.md

\`\`\`diff
diff --git a/PRO-9191-cross-repo-follow-on-plan.md b/PRO-9191-cross-repo-follow-on-plan.md
new file mode 100644
index 0000000..23a40af
--- /dev/null
+++ b/PRO-9191-cross-repo-follow-on-plan.md
@@ -0,0 +1,108 @@
+# PRO-9191 Cross-Repo Follow-On Plan
+
+## Goal
+
+Align documentation across related repositories after the docs-site static build work, so Astro static-build behavior is consistently documented in:
+
+1. `docs` (already implemented in this branch)
+2. `apostrophe-astro`
+3. Apostrophe core (`apostrophe`)
+
+## Repositories and Deliverables
+
+## 1) `apostrophe-astro` repository
+
+### Primary deliverables
+
+1. Update README/docs for static build mode:
+   - `APOS_BUILD=static` behavior
+   - `output: 'static'` integration expectations
+   - `getAllStaticPaths` usage
+2. Document helper APIs:
+   - `buildPageUrl`
+   - `getFilterBaseUrl`
+   - `getAposHost`
+   - `aposFetch`
+3. Document integration static options and env precedence:
+   - `staticBuild.attachments`
+   - `staticBuild.attachmentSizes`
+   - `staticBuild.attachmentSkipSizes`
+   - `staticBuild.attachmentScope`
+   - `APOS_HOST`, `APOS_PREFIX`, `APOS_EXTERNAL_FRONT_KEY`, `APOS_ATTACHMENT_*`
+4. Add explicit static widget guidance:
+   - browser `/api/v1/...` calls in static output
+   - build-time/server-side data fetch pattern
+5. Add non-root hosting guidance:
+   - Astro `base` and Apostrophe `prefix` alignment
+
+### Acceptance criteria
+
+1. README/docs include at least one end-to-end static config example.
+2. Helper API docs include signatures and minimal examples.
+3. Env var override order is stated clearly.
+4. Docs include at least one static build caveat section.
+
+## 2) Apostrophe core (`apostrophe`) repository
+
+### Primary deliverables
+
+1. Add or expand docs for `@apostrophecms/url` static behavior:
+   - `options.static`
+   - effect on filter/pagination URL format
+2. Document URL metadata extension points:
+   - `getUrlMetadata(req, doc)`
+   - `getUrlMetadataQuery(req)`
+   - `@apostrophecms/url:getAllUrlMetadata` event
+3. Document metadata entry contract:
+   - document entries vs literal content entries
+   - `contentType` semantics
+   - relative prefix-free `url` requirement
+4. Document sitemap exclusion behavior:
+   - `sitemap: false`
+
+### Acceptance criteria
+
+1. Official core docs cover URL metadata APIs and event usage.
+2. At least one literal-content example appears in core docs.
+3. Static URL mode caveat is explicit (global URL behavior impact).
+
+## 3) `docs` repository follow-up wiring
+
+### Primary deliverables
+
+1. Replace any temporary wording with links to newly published upstream docs.
+2. Verify no stale links to unpublished upstream sections remain.
+3. Add release-note-style changelog entry if your team process requires it.
+
+### Acceptance criteria
+
+1. All upstream links resolve.
+2. `npm run docs:build` passes after link updates.
+
+## Execution Order
+
+1. Open `apostrophe-astro` PR with static-mode docs updates.
+2. Open Apostrophe core PR for `@apostrophecms/url`/metadata docs.
+3. After both merge, open small docs-site PR to refresh cross-links.
+
+## Suggested PR Breakdown
+
+1. PR A (`apostrophe-astro`): integration + helper + env + static caveats.
+2. PR B (`apostrophe` core): URL module + metadata/event contract.
+3. PR C (`docs`): upstream link sync and wording cleanup only.
+
+## Risks and Mitigations
+
+1. Risk: Terminology drift between repos.
+   - Mitigation: Reuse one shared glossary block for `static`, `literal content`, `prefix`, `staticBaseUrl`.
+2. Risk: API naming mismatches in examples.
+   - Mitigation: Validate examples against current package exports before merge.
+3. Risk: Non-root hosting confusion.
+   - Mitigation: Include one canonical example in every repo using identical values.
+
+## Hand-off Checklist
+
+1. Confirm target default branches for all repos.
+2. Confirm docs owners/reviewers for each repo.
+3. Open three tracked tasks linked to `PRO-9191`.
+4. Merge in sequence: PR A -> PR B -> PR C.
\`\`\`

### docs/build.md

Preview: [http://localhost:5173/docs/build.html](http://localhost:5173/docs/build.html)

\`\`\`diff
diff --git a/docs/build.md b/docs/build.md
new file mode 100644
index 0000000..5746839
--- /dev/null
+++ b/docs/build.md
@@ -0,0 +1,30 @@
+---
+title: Build
+layout: doc
+---
+
+# Build
+
+Implementation guides for developing features, UI, and integrations.
+
+## Build features
+
+1. [Custom Widgets](/guide/custom-widgets.html)
+2. [Core Widgets](/guide/core-widgets.html)
+3. [Custom UI](/guide/custom-ui.html)
+4. [Editing Custom Widgets In Context](/guide/editing-custom-widgets-in-context.html)
+
+## Data and backend workflows
+
+1. [Database Queries](/guide/database-queries.html)
+2. [Inserting and Updating Docs](/guide/database-insert-update.html)
+3. [Accessing the Database Directly](/guide/database-access.html)
+4. [Writing Migrations](/guide/writing-migrations.html)
+
+## Extend and optimize
+
+1. [Server Events](/guide/server-events.html)
+2. [Vite Configuration](/guide/vite.html)
+3. [Webpack Configuration](/guide/webpack.html)
+4. [Logging](/guide/logging.html)
+
\`\`\`

### docs/concepts.md

Preview: [http://localhost:5173/docs/concepts.html](http://localhost:5173/docs/concepts.html)

\`\`\`diff
diff --git a/docs/concepts.md b/docs/concepts.md
new file mode 100644
index 0000000..310afd5
--- /dev/null
+++ b/docs/concepts.md
@@ -0,0 +1,30 @@
+---
+title: Concepts
+layout: doc
+---
+
+# Concepts
+
+Core concepts for modeling and managing content in ApostropheCMS.
+
+## Content modeling
+
+1. [Module Configuration Patterns](/guide/module-configuration-patterns.html)
+2. [Content Schema](/guide/content-schema.html)
+3. [Conditional Fields](/guide/conditional-fields.html)
+4. [Relationships](/guide/relationships.html)
+
+## Content structure and rendering
+
+1. [Pages](/guide/pages.html)
+2. [Pieces](/guide/pieces.html)
+3. [Piece Pages](/guide/piece-pages.html)
+4. [Areas and Widgets](/guide/areas-and-widgets.html)
+
+## Templates and frontend concepts
+
+1. [Templating](/guide/templating.html)
+2. [Template Data](/guide/template-data.html)
+3. [Template Filters](/guide/template-filters.html)
+4. [Front End Assets](/guide/front-end-assets.html)
+
\`\`\`

### docs/deploy.md

Preview: [http://localhost:5173/docs/deploy.html](http://localhost:5173/docs/deploy.html)

\`\`\`diff
diff --git a/docs/deploy.md b/docs/deploy.md
new file mode 100644
index 0000000..3c21550
--- /dev/null
+++ b/docs/deploy.md
@@ -0,0 +1,29 @@
+---
+title: Deploy
+layout: doc
+---
+
+# Deploy
+
+Guides for hosting, infrastructure, and production operations.
+
+## Hosting and infrastructure
+
+1. [Hosting in Production](/guide/hosting.html)
+2. [Docker](/cookbook/using-docker.html)
+3. [Ubuntu Hosting](/cookbook/ubuntu-hosting.html)
+4. [Deploying to Heroku](/cookbook/deploying-to-heroku.html)
+
+## Storage and integrations
+
+1. [Using S3 Storage](/cookbook/using-s3-storage.html)
+2. [Creating Webhooks](/cookbook/creating-webhooks.html)
+3. [Sending Email](/guide/sending-email.html)
+
+## Astro deployment track
+
+1. [ApostropheCMS + Astro Deployment Overview](/tutorials/astro/deployment-overview.html)
+2. [Deploying to Vercel](/tutorials/astro/deploying-to-vercel.html)
+3. [Deploying to Netlify](/tutorials/astro/deploying-to-netlify.html)
+4. [Deploying to GitHub Pages](/tutorials/astro/deploying-to-github-pages.html)
+
\`\`\`

### docs/get-started.md

Preview: [http://localhost:5173/docs/get-started.html](http://localhost:5173/docs/get-started.html)

\`\`\`diff
diff --git a/docs/get-started.md b/docs/get-started.md
new file mode 100644
index 0000000..c1e352e
--- /dev/null
+++ b/docs/get-started.md
@@ -0,0 +1,23 @@
+---
+title: Get Started
+layout: doc
+---
+
+# Get Started
+
+Use this section to get an ApostropheCMS project running and understand the fundamentals before implementation.
+
+## Start here
+
+1. [Introduction](/guide/introduction.html)
+2. [Why Apostrophe](/guide/why-apostrophe.html)
+3. [Technical Overview](/guide/technical-overview.html)
+4. [Development Setup](/guide/development-setup.html)
+5. [Core Concepts](/guide/core-concepts.html)
+
+## Environment setup guides
+
+- [Windows Development](/cookbook/windows-development.html)
+- [Dockerized MongoDB](/guide/dockerized-mongodb.html)
+- [Migration Overview](/guide/migration/overview.html)
+
\`\`\`

### docs/guide/headless-cms.md

Preview: [http://localhost:5173/docs/guide/headless-cms.html](http://localhost:5173/docs/guide/headless-cms.html)

\`\`\`diff
diff --git a/docs/guide/headless-cms.md b/docs/guide/headless-cms.md
index e0b74dd..1b29167 100644
--- a/docs/guide/headless-cms.md
+++ b/docs/guide/headless-cms.md
@@ -201,4 +201,6 @@ As official platform-specific plugins are made available they will be added here
 plugin provides a bridge that allows Astro to act as an "external front end" for Apostrophe. Note that Astro allows sites to be built with any mix of React, Vue, SvelteJS and other frontend frameworks which is highly effective when combined with Apostrophe as a back end.
 
+Astro integrations can run in SSR mode or static build mode. In static mode, Apostrophe provides URL metadata that allows Astro to pre-render all relevant routes at build time. See [Static Builds with ApostropheCMS + Astro](/tutorials/astro/static-builds-with-apostrophe.html).
+
 ### Gatsby source plugin
 
\`\`\`

### docs/guide/hosting.md

Preview: [http://localhost:5173/docs/guide/hosting.html](http://localhost:5173/docs/guide/hosting.html)

\`\`\`diff
diff --git a/docs/guide/hosting.md b/docs/guide/hosting.md
index 9ee259f..9546e5b 100644
--- a/docs/guide/hosting.md
+++ b/docs/guide/hosting.md
@@ -33,4 +33,13 @@ Deployment processes will vary depending on the hosting environment, technical r
 4. **Start (or restart) the application process(es).**
 
+## Deployment models with Astro frontends
+
+If you are pairing Apostrophe with Astro, there are two common production models:
+
+1. **SSR Astro + Apostrophe backend**: both services run in production.
+2. **Static Astro output + Apostrophe backend for authoring/build**: Astro deploys static files, while Apostrophe remains your authoring and build-time content source.
+
+For static Astro setup details, see [Static Builds with ApostropheCMS + Astro](/tutorials/astro/static-builds-with-apostrophe.html).
+
 ## Best practices
 
@@ -52,3 +61,2 @@ Apostrophe concatenates [project-level front end code](/guide/front-end-assets.m
 
 The information here applies to most all hosting platforms. Implementation will vary depending on the platform. To help get started on specific platforms, [we provide hosting recipes for popular options](/cookbook/index.md#hosting).
-
\`\`\`

### docs/guide/localization/dynamic.md

Preview: [http://localhost:5173/docs/guide/localization/dynamic.html](http://localhost:5173/docs/guide/localization/dynamic.html)

\`\`\`diff
diff --git a/docs/guide/localization/dynamic.md b/docs/guide/localization/dynamic.md
index 25927e9..d9f5db8 100644
--- a/docs/guide/localization/dynamic.md
+++ b/docs/guide/localization/dynamic.md
@@ -24,7 +24,7 @@ Localizing means that **we make a clone of the content for a new locale, then ma
 >By default, Apostrophe preserves accents and diacritical marks when generating slugs from page or piece titles. For example, a page titled "À propos de l'équipe" will have the slug `à-propos-de-l-équipe` with accents preserved.
 >
->If you prefer to strip accents from slugs for URL compatibility or SEO consistency, you can enable the `stripUrlAccents` option in the `@apostrophecms/i18n` module.
+>If you prefer to strip accents from slugs for URL compatibility or SEO consistency, you can enable the `stripAccentsFromSlugs` option in the `@apostrophecms/i18n` module.
 >
->With this option enabled, slugs will automatically have accents removed during generation (e.g., "À propos de l'équipe" becomes `a-propos-de-l-equipe`). If you enable this on an existing site with localized content, you can use the `strip-slug-accents` task to update existing slugs. See the [i18n module reference](/reference/modules/i18n.md#strip-slug-accents) for details.
+>With this option enabled, slugs will automatically have accents removed during generation (e.g., "À propos de l'équipe" becomes `a-propos-de-l-equipe`). If you enable this on an existing site with localized content, you can use the `strip-accents-from-slugs` task to update existing slugs. See the [i18n module reference](/reference/modules/i18n.md#strip-accents-from-slugs) for details.
 
 **Each page or piece in Apostrophe is initially created for only one locale.** Sometimes we don't go any further. It may not be necessary to localize a page about Canadian office holidays into Mandarin, for example. If the page or piece should be available in more locales, *then* we localize it. The only exceptions are [parked pages](/reference/module-api/module-options.md#park) and piece types with the `replicate: true` option.
\`\`\`

### docs/guide/migration/upgrading.md

Preview: [http://localhost:5173/docs/guide/migration/upgrading.html](http://localhost:5173/docs/guide/migration/upgrading.html)

\`\`\`diff
diff --git a/docs/guide/migration/upgrading.md b/docs/guide/migration/upgrading.md
index 58d32ca..17bf63f 100644
--- a/docs/guide/migration/upgrading.md
+++ b/docs/guide/migration/upgrading.md
@@ -2,7 +2,7 @@
 next: false
 ---
-# Migration from Apostrophe 2 to Apostrophe 4 with AI
+# Migration from Apostrophe 2 to Apostrophe 4
 
-While many foundational patterns from Apostrophe 2 (A2) were maintained in Apostrophe 3 and now in the latest versions of Apostrophe, there are significant breaking changes to both the database document structure and site-building APIs. This guide will summarize those and cover how to begin upgrading website and standalone module projects from A2 to the newest Apostrophe. Importantly, it will also introduce [tools for developers to automate most of the necessary migration work with AI](#migration-tools-and-process).
+While many foundational patterns from Apostrophe 2 (A2) were maintained in Apostrophe 3 and now in the latest versions of Apostrophe, there are significant breaking changes to both the database document structure and site-building APIs. This guide will summarize those and cover how to begin upgrading website and standalone module projects from A2 to the newest Apostrophe. Importantly, it will also introduce [tools for developers to automate most of the necessary migration work](#migration-tools-and-process).
 
 ## Breaking changes
@@ -98,5 +98,5 @@ Migrating an Apostrophe 2 codebase and data should be done with care, but there
 While completely manual code migration is possible, the *Content* Upgrader tool is basically essential for data conversion. Writing custom data migrations would not be able to do many things differently from the official tool and there is very little to gain by doing so.
 
-The Content Upgrader tool does not change anything in the original Apostrophe 2 database. Instead, it reads that original database and creates a *new database* using a name the developer provides. That new database will contain the original data, converted for use in the newest versions of Apostrophe.
+The Content Upgrader tool does not change anything in the original Apostrophe 2 database. Instead, it reads that original database and creates a *new database* using a name the developer provides. That new database will contain the original data, converted for use in the newest verrsions ofApostrophe.
 
 Developers will install the Content Upgrader as a module **within the A2 project**. This allows it to access schemas and other important project information. **See the [Content Upgrader README](https://www.npmjs.com/package/@apostrophecms/content-upgrader) for full instructions.**
@@ -116,9 +116,30 @@ There are a few limitations in the Content Upgrader to understand before using i
 ### Code Upgrader
 
-The *Code* Upgrader extension supports upgrading codebases for **full Apostrophe projects** (websites) and **installable modules**.
+The *Code* Upgrader tool supports upgrading codebases for **full Apostrophe projects** (websites) and **installable modules**. It has two major roles in converting an A2 codebase to use the newer version of Apostrophe:
 
-This extension includes an AI Agent Skill (Claude Skill). The Agent Skill is now the recommended way to carry out the upgrade, as this is exactly where AI excels most. Developers using Claude Code and similar tools can complete over 90% of the migration work quickly, and we have also been successful in resolving remaining issues by directing Claude Code. The last 5% of the work usually involves attention to what is rendering on the page.
+1. It will lint an Apostrophe codebase for A2 syntax and structure that must change. This is its `lint` command.
+2. It will *make* many of those code changes for you. This is its `upgrade` command.
 
-The Code Upgrader extension also includes legacy tools for those who prefer not to use the Agent Skill. These tools have much more limited support for automatic upgrades, however the linting feature can be useful.
+Additionally, there is a `reset` command that can undo all uncommitted changes. Always use a new git branch during this process as well to have an additional way to roll back changes.
 
-**See the [Code Upgrader README](https://www.apostrophecms.com/extensions/code-upgrader) for full instructions,** including how to install and use the Agent Skill.
+One reason we recommend using this tool to execute changes on a full project is that it will make minimal code adjustments for newer version use. This is important because additional changes (such as field name changes), could unnecessarily break compatibility with the [upgraded database](#content-upgrader). After running the automatic code upgrade, take care with final code changes to avoid affecting data compatibility.
+
+The Code Upgrader is installed globally in a Node environment (including developer environments) and run as a command line tool. **See the [Code Upgrader README](https://www.npmjs.com/package/@apostrophecms/code-upgrader) for full instructions.**
+
+::: info
+The Code Upgrader tool is currently published as an **alpha** release. It will lint most A2 features that need updating, but there are several features that it cannot automatically upgrade yet. The tool will never do 100% of the necessary code conversion, but we will continue adding feature support before it can be published as a full 1.0 release.
+
+We encourage developers to begin trying it on A2 projects and [provide feedback](https://github.com/apostrophecms/code-upgrader/issues/new) as we prepare for a stable release.
+:::
+
+#### Limitations
+
+Just as with the content tool, the Code Upgrader has some limitations to understand. While database structure is very predictable, code styles and patterns are not. Some A2 APIs and syntax are intentionally not touched to avoid making incorrect assumptions.
+
+- The tool is designed to operation on the majority of standard Apostrophe 2 codebases. Projects that generally follow patterns in official documentation and sample projects will have the best results. The tool will help on very custom projects (especially the linting mode), but more manual work will be always be needed to finish the work.
+- [Widget player code](/guide/custom-widgets.md#client-side-javascript-for-widgets) (client-side JavaScript) is not changed. The original widget player syntax relies on jQuery, which the newer versions of Apostrophe do not include. A2 "lean" players may be supported in the future.
+- [Areas](/reference/glossary.md#area) (and A2's "singletons") that are only defined in A2 template files, "anonymous areas," are not changed. In newer versions, all areas must be registered in a module's field schema, however, the complexity of area configuration (and limitations of template parsers) make them better converted manually.
+- [As mentioned above](#limitations) the image widget only supports a single image in newer versions. As in the content tool, these are converted to the equivalent updated version, but full slideshow conversion will need to be done manually.
+- As the tool is still in development, some features will eventually be supported in the automatic upgrade, but are not yet. We appreciate your patience during development.
+
+In many of these limitation cases the **`lint`** command will still alert you to the outdated code so you can find it and make changes manually.
\`\`\`

### docs/reference-overview.md

Preview: [http://localhost:5173/docs/reference-overview.html](http://localhost:5173/docs/reference-overview.html)

\`\`\`diff
diff --git a/docs/reference-overview.md b/docs/reference-overview.md
new file mode 100644
index 0000000..fa9d0a8
--- /dev/null
+++ b/docs/reference-overview.md
@@ -0,0 +1,25 @@
+---
+title: Reference
+layout: doc
+---
+
+# Reference
+
+API and module references for day-to-day implementation work.
+
+## Core references
+
+1. [Reference Index](/reference/index.html)
+2. [Core Modules](/reference/modules/module.html)
+3. [Field Types](/reference/field-types/index.html)
+4. [Module API Overview](/reference/module-api/module-overview.html)
+5. [Glossary](/reference/glossary.html)
+
+## API references
+
+1. [REST API Reference](/reference/api/rest-api-reference.html)
+2. [API Explorer](/reference/api/api-explorer.html)
+3. [Authentication](/reference/api/authentication.html)
+4. [Pages API](/reference/api/pages.html)
+5. [Pieces API](/reference/api/pieces.html)
+
\`\`\`

### docs/reference/field-types/oembed.md

Preview: [http://localhost:5173/docs/reference/field-types/oembed.html](http://localhost:5173/docs/reference/field-types/oembed.html)

\`\`\`diff
diff --git a/docs/reference/field-types/oembed.md b/docs/reference/field-types/oembed.md
index d121791..5e60d98 100644
--- a/docs/reference/field-types/oembed.md
+++ b/docs/reference/field-types/oembed.md
@@ -59,4 +59,6 @@ Simplest usage could involve simply printing the thumbnail image (if available)
 More likely, you will want to add the full embed code from the media source. This should be done in client-side JavaScript. Apostrophe provides an API route to get that.
 
+If your frontend is deployed as static files without a runtime Apostrophe backend, fetch oEmbed data during build/server render instead of from browser-side code.
+
 <!-- TODO: link to the oembed module's API route reference when available. -->
 Submit a `GET` request to `/api/v1/@apostrophecms/oembed/query` with the media URL as the `url` query parameter. A successful response will be an object with several properties to help place and style the embed, including an `html` property with the actual HTML markup to embed.
\`\`\`

### docs/reference/module-api/module-options.md

Preview: [http://localhost:5173/docs/reference/module-api/module-options.html](http://localhost:5173/docs/reference/module-api/module-options.html)

\`\`\`diff
diff --git a/docs/reference/module-api/module-options.md b/docs/reference/module-api/module-options.md
index 026f55a..7c04090 100644
--- a/docs/reference/module-api/module-options.md
+++ b/docs/reference/module-api/module-options.md
@@ -927,4 +927,8 @@ modules/article-page/index.js
 When the index page is served, configured filters will be represented on a `req.data.piecesFilters` object (`data.piecesFilters` in the template). If you include `counts: true` in a filter object, the number of pieces matching that filter are included on `req.data.piecesFilters` properties.
 
+In Astro and other headless frontends, `req.data.filters` is also available and may be preferable because it includes filter-level metadata plus direct `_url` links for each choice.
+
+If `@apostrophecms/url` is configured with `static: true`, generated filter and pagination links switch to path-based URLs rather than query-string URLs.
+
 #### Example
 
\`\`\`

### docs/reference/modules/i18n.md

Preview: [http://localhost:5173/docs/reference/modules/i18n.html](http://localhost:5173/docs/reference/modules/i18n.html)

\`\`\`diff
diff --git a/docs/reference/modules/i18n.md b/docs/reference/modules/i18n.md
index ee4073c..9ce8fbf 100644
--- a/docs/reference/modules/i18n.md
+++ b/docs/reference/modules/i18n.md
@@ -24,5 +24,5 @@ The module makes an instance of the [i18next](https://npmjs.org/package/i18next)
 | [`adminLocales`](#adminlocales) | Array | The locales that can be selected by the users for the admin UI |
 | `defaultAdminLocale` | String | Optionally takes the locale key for the default Admin UI language. If not present, it will default to match the locale language. Overridden by the user preferences. |
-| `stripUrlAccents` | Boolean | If set to true, accents and diacritical marks will be automatically removed from slugs when they are generated. For example, "café" becomes "cafe". Defaults to false to maintain backward compatibility. This setting affects all new slugs created after it is enabled. |
+| `stripAccentsFromSlugs` | Boolean | If set to true, accents and diacritical marks will be automatically removed from slugs when they are generated. For example, "café" becomes "cafe". Defaults to false to maintain backward compatibility. This setting affects all new slugs created after it is enabled. |
 
 ### `locales`
@@ -70,9 +70,9 @@ Other notes:
         'en-CA': {
           label: 'Canada (English)',
-          prefix: '/ca-en'
+          prefix: '/ca/en'
         },
         'fr-CA': {
           label: 'Canada (French)',
-          prefix: '/ca-fr'
+          prefix: '/ca/fr'
         },
         'es-MX': {
@@ -91,6 +91,6 @@ Other notes:
 With `redirectToFirstLocale` option enabled.
 
-In the following example, _**every** locale has a prefix_ so if we request the base URL of the site without a locale prefix (`/en` or `/us-en`) in the URL, the first locale will be taken into account (`en`) and we will be redirected to `/en`.  
-Same thing if we request `example.ca` with no locale prefix, we will be redirected to `/ca-en` as it is the first locale configured with that hostname.
+In the following example, _**every** locale has a prefix_ so if we request the base URL of the site without a locale prefix (`/en` or `/us/en`) in the URL, the first locale will be taken into account (`en`) and we will be redirected to `/en`.  
+Same thing if we request `example.ca` with no locale prefix, we will be redirected to `/ca/en` as it is the first locale configured with that hostname.
 
 <AposCodeBlock>
@@ -108,14 +108,14 @@ Same thing if we request `example.ca` with no locale prefix, we will be redirect
         'en-US': {
           label: 'English',
-          prefix: '/us-en'
+          prefix: '/us/en'
         },
         'en-CA': {
           label: 'Canada (English)',
-          prefix: '/ca-en',
+          prefix: '/ca/en',
           hostname: 'example.ca'
         },
         'fr-CA': {
           label: 'Canada (French)',
-          prefix: '/ca-fr',
+          prefix: '/ca/fr',
           hostname: 'example.ca'
         }
@@ -288,15 +288,21 @@ The `rename-locale` command moves all content from one locale name to another, u
 Usage: `node app @apostrophecms/i18n:rename-locale --old=de-DE --new=de-de --keep=de-de`
 
-### `strip-slug-accents`
+### `strip-accents-from-slugs`
 
-The `strip-slug-accents` command removes accents and diacritical marks from all existing slugs in the database. This is useful when you enable the `stripUrlAccents` option and want to update slugs that were created before the option was turned on.
+The `strip-accents-from-slugs` command removes accents and diacritical marks from all existing slugs in the database. This is useful when you enable the `stripAccentsFromSlugs` option and want to update slugs that were created before the option was turned on.
 
-**Important:** This task will modify slugs across all content types and locales. Make sure to back up your database before running it.
+By default, the task runs in "dry run" mode, showing you what changes would be made without actually modifying the database. To apply the changes, add the `--live` flag.
 
-Usage example:
+**Important:** This task will modify slugs across all content types and locales. Make sure to back up your database before running it with the `--live` flag.
+
+Usage examples:
 
 ```bash
-node app @apostrophecms/i18n:strip-slug-accents
+# Preview what changes would be made (safe, no modifications)
+node app @apostrophecms/i18n:strip-accents-from-slugs
+
+# Actually apply the changes to the database
+node app @apostrophecms/i18n:strip-accents-from-slugs --live
 ```
 
-The task will display each slug that is changed, showing the before and after values.
\ No newline at end of file
+The task will display each slug that would be changed (or is being changed in live mode), showing the before and after values.
\ No newline at end of file
\`\`\`

### docs/reference/modules/piece-page-type.md

Preview: [http://localhost:5173/docs/reference/modules/piece-page-type.html](http://localhost:5173/docs/reference/modules/piece-page-type.html)

\`\`\`diff
diff --git a/docs/reference/modules/piece-page-type.md b/docs/reference/modules/piece-page-type.md
index 616a0df..aaccb36 100644
--- a/docs/reference/modules/piece-page-type.md
+++ b/docs/reference/modules/piece-page-type.md
@@ -123,4 +123,8 @@ These include:
 When the index page is served, filter data will be returned in the `req.data.piecesFilters` object (`data.piecesFilters` in the template). This object consists of an array for each configured filter. That array contains objects with `value` and `label` properties for every `piece-type` that matches the filter. Passing filter values back to the index page as query string parameters will filter the results accordingly. If `counts: true` is included for the filter query, each object in the array will also have a `count` property with the number of matching pieces.
 
+For headless and Astro integrations, `req.data.filters` is also available and is often preferred because it includes filter-level metadata and direct `_url` values on each choice.
+
+When `@apostrophecms/url` is configured with `static: true`, filter and pagination URLs become path-based rather than query-string based (for example `/articles/category/tech/page/2`).
+
 A simplified schema for a 'book' `piece-type`:
 <AposCodeBlock>
\`\`\`

### docs/reference/modules/styles.md

Preview: [http://localhost:5173/docs/reference/modules/styles.html](http://localhost:5173/docs/reference/modules/styles.html)

\`\`\`diff
diff --git a/docs/reference/modules/styles.md b/docs/reference/modules/styles.md
index 012fd4f..2b75fd8 100644
--- a/docs/reference/modules/styles.md
+++ b/docs/reference/modules/styles.md
@@ -430,4 +430,6 @@ These routes serve **global styles** only. Widget styles are generated and injec
 Serves the cached global stylesheet.
 
+In static build workflows, this stylesheet URL can be contributed as literal content through URL metadata so static frontends can fetch and write the generated CSS file during build.
+
 **Query parameters:**
 - `version` (String): Stylesheet version identifier for cache busting
@@ -614,3 +616,3 @@ For implementation details, see the migration code in `@apostrophecms-pro/palett
 
 - [Global Styling](/guide/global-styles.md)
-- [Per-Widget Styling](/guide/widget-styles.md)
\ No newline at end of file
+- [Per-Widget Styling](/guide/widget-styles.md)
\`\`\`

### docs/reference/modules/url.md

Preview: [http://localhost:5173/docs/reference/modules/url.html](http://localhost:5173/docs/reference/modules/url.html)

\`\`\`diff
diff --git a/docs/reference/modules/url.md b/docs/reference/modules/url.md
new file mode 100644
index 0000000..84e031e
--- /dev/null
+++ b/docs/reference/modules/url.md
@@ -0,0 +1,127 @@
+---
+extends: '@apostrophecms/module'
+---
+
+# `@apostrophecms/url`
+
+The `@apostrophecms/url` module centralizes URL generation behavior for Apostrophe pages and pieces. It also provides URL metadata collection used by static build pipelines (including Apostrophe + Astro static builds).
+
+## Options
+
+| Property | Type | Default | Description |
+|---|---|---|---|
+| [`static`](#static) | Boolean | `false` | Enables static-friendly path-based URLs and URL metadata behavior for static generation. |
+
+### `static`
+
+When set to `true`, URL generation for piece-index filtering and pagination switches from query-string format to path-based format.
+
+Examples:
+
+- Query style (default): `/articles?category=tech&page=2`
+- Static style: `/articles/category/tech/page/2`
+
+This option also enables URL metadata collection used by static frontends to discover all pages that should be generated.
+
+::: warning
+`static: true` affects URL behavior for all frontends connected to the same backend. Make sure your SSR templates and helpers also use URL-safe patterns that work in static mode.
+:::
+
+## URL metadata for static builds
+
+The module gathers URL metadata from doc types and event listeners. Static frontends (such as Astro static builds) consume this metadata to determine:
+
+- Which HTML routes should be rendered.
+- Which literal files (for example CSS, `robots.txt`, or sitemap XML) should be copied to output.
+
+Doc types that extend page/piece base modules are automatically included.
+
+## Extending metadata from doc types
+
+You can extend document-level metadata by overriding `getUrlMetadata(req, doc)` in page or piece managers.
+
+```javascript
+export default {
+  extend: '@apostrophecms/page-type',
+  extendMethods(self) {
+    return {
+      async getUrlMetadata(_super, req, doc) {
+        const metadata = await _super(req, doc);
+        metadata.push({
+          url: `${doc._url}/print`,
+          type: doc.type,
+          aposDocId: doc.aposDocId,
+          i18nId: `${doc.aposDocId}.print`,
+          _id: doc._id
+        });
+        return metadata;
+      }
+    };
+  }
+};
+```
+
+You can also extend `getUrlMetadataQuery(req)` to adjust which documents are considered.
+
+## Adding metadata from non-doc modules
+
+Modules that do not extend a doc type can contribute metadata via the `@apostrophecms/url:getAllUrlMetadata` event.
+
+```javascript
+export default {
+  handlers(self) {
+    return {
+      '@apostrophecms/url:getAllUrlMetadata': {
+        addGeneratedFile(req, results) {
+          results.push({
+            url: '/my-generated-file.json',
+            contentType: 'application/json',
+            i18nId: 'my-module:generated-file',
+            sitemap: false
+          });
+        }
+      }
+    };
+  }
+};
+```
+
+## Metadata entry format
+
+### Document entries
+
+Use these for renderable HTML routes:
+
+- `url` (required)
+- `type` (required)
+- `aposDocId` (required)
+- `i18nId` (required)
+- `_id` (required)
+- `changefreq` (optional)
+- `priority` (optional)
+- `sitemap` (optional)
+
+### Literal content entries
+
+Use these for non-HTML files:
+
+- `url` (required)
+- `contentType` (required)
+- `i18nId` (required)
+- `sitemap` (optional; commonly `false`)
+
+`url` values should be relative, prefix-free paths that begin with `/` (for example `/robots.txt`).
+
+## Sitemaps and exclusions
+
+Set `sitemap: false` on metadata entries that should be built but excluded from sitemap output. Typical cases include:
+
+- Paginated filter pages
+- CSS or generated text files
+- Utility pages such as print views
+
+## Related docs
+
+- [Server-side events](/reference/server-events.html)
+- [@apostrophecms/piece-page-type](/reference/modules/piece-page-type.html)
+- [ApostropheCMS + Astro static builds tutorial](/tutorials/astro/static-builds-with-apostrophe.html)
\`\`\`

### docs/reference/server-events.md

Preview: [http://localhost:5173/docs/reference/server-events.html](http://localhost:5173/docs/reference/server-events.html)

\`\`\`diff
diff --git a/docs/reference/server-events.md b/docs/reference/server-events.md
index d6a2fca..8adf935 100644
--- a/docs/reference/server-events.md
+++ b/docs/reference/server-events.md
@@ -1050,4 +1050,43 @@ Triggered just before the search index page is served, after the page's results
 </AposCodeBlock>
 
+## `@apostrophecms/url` events
+
+Events emitted by the `@apostrophecms/url` module.
+
+### `getAllUrlMetadata`
+
+Triggered when Apostrophe compiles URL metadata used by static build consumers.
+
+This event is commonly used by modules that need to add non-document URLs (for example generated CSS or text files) to static build outputs.
+
+#### Parameters
+
+- `req`: The active request
+- `results`: Shared array of URL metadata entries. Push your entries onto this array.
+- `options`: Object containing metadata controls, including `excludeTypes`
+
+<AposCodeBlock>
+
+  ```javascript
+  handlers(self, options) {
+    return {
+      '@apostrophecms/url:getAllUrlMetadata': {
+        addMyGeneratedFile(req, results) {
+          results.push({
+            url: '/my-generated-file.json',
+            contentType: 'application/json',
+            i18nId: 'my-module:generated-file',
+            sitemap: false
+          });
+        }
+      }
+    };
+  }
+  ```
+  <template v-slot:caption>
+    modules/my-module/index.js
+  </template>
+</AposCodeBlock>
+
 ## `@apostrophecms/template` events
 
\`\`\`

### docs/tutorials/astro/apostrophecms-and-astro.md

Preview: [http://localhost:5173/docs/tutorials/astro/apostrophecms-and-astro.html](http://localhost:5173/docs/tutorials/astro/apostrophecms-and-astro.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/apostrophecms-and-astro.md b/docs/tutorials/astro/apostrophecms-and-astro.md
index ba60886..4159fee 100644
--- a/docs/tutorials/astro/apostrophecms-and-astro.md
+++ b/docs/tutorials/astro/apostrophecms-and-astro.md
@@ -5,10 +5,10 @@ videoList:
     link: '#want-to-learn-more'
 next:
-  text: 'Introducing Apollo'
-  link: '/tutorials/astro/introducing-apollo.html'
+  text: 'Deployment Overview'
+  link: '/tutorials/astro/deployment-overview.html'
 title: "ApostropheCMS and Astro"
 detailHeading: "Astro"
 url: "/tutorials/astro/apostrophecms-and-astro.html"
-content: "ApostropheCMS and Astro work seamlessly together through the `apostrophe-astro` extension. Learn who this integration is for and what makes it a powerful choice for building modern websites."
+content: "ApostropheCMS and Astro integrate through the `apostrophe-astro` extension. Learn who this integration is for and how teams use it to build modern websites."
 tags:
   topic: "Core Concepts"
@@ -24,4 +24,7 @@ excludeFromFilters: true
 The tutorials in this section will guide you through building modern websites using ApostropheCMS as your content management system with Astro powering your frontend. This combination offers powerful advantages for different types of developers:
 
+> [!NOTE]
+> This Astro section is a teaching track. Some tutorials use Apollo as an example project, but deployment guidance is theme-agnostic and starts at [Deployment Overview](/tutorials/astro/deployment-overview.html).
+
 ### Who Is This For?
 
@@ -68,7 +71,7 @@ If you get stuck:
 - Visit our [Github repository](https://github.com/apostrophecms/apostrophe-astro)
 
-Ready to start building? Begin with our [introduction to Apollo and core concepts tutorial](/tutorials/astro/introducing-apollo.html).
+Ready to start building? If your immediate goal is deployment, begin with [Deployment Overview](/tutorials/astro/deployment-overview.html). If your goal is static hosting, also review [Static Builds with ApostropheCMS + Astro](/tutorials/astro/static-builds-with-apostrophe.html). If you want to follow our theme-based teaching path, start with [Introducing Apollo](/tutorials/astro/introducing-apollo.html).
 
 ## Want to learn more?
 Listen to the CTO of ApostropheCMS talk about the integration of ApostropheCMS and Astro:
-<iframe width="560" height="315" src="https://www.youtube.com/embed/8HczFSLFDno?si=tHxIhDTdOboNyIPN" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
\ No newline at end of file
+<iframe width="560" height="315" src="https://www.youtube.com/embed/8HczFSLFDno?si=tHxIhDTdOboNyIPN" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
\`\`\`

### docs/tutorials/astro/build-with-apostrophe-and-astro.md

Preview: [http://localhost:5173/docs/tutorials/astro/build-with-apostrophe-and-astro.html](http://localhost:5173/docs/tutorials/astro/build-with-apostrophe-and-astro.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/build-with-apostrophe-and-astro.md b/docs/tutorials/astro/build-with-apostrophe-and-astro.md
new file mode 100644
index 0000000..b4c0551
--- /dev/null
+++ b/docs/tutorials/astro/build-with-apostrophe-and-astro.md
@@ -0,0 +1,36 @@
+---
+title: "Build with ApostropheCMS + Astro"
+detailHeading: "Astro"
+url: "/tutorials/astro/build-with-apostrophe-and-astro.html"
+content: "Build your ApostropheCMS + Astro frontend by implementing pages, widgets, and pieces."
+tags:
+  topic: "Core Concepts"
+  type: astro
+  effort: beginner
+order: 5
+excludeFromFilters: true
+---
+# Build with ApostropheCMS + Astro
+
+This phase covers implementation work after setup and before deployment.
+
+## Core implementation tutorials
+
+1. [Creating Pages](/tutorials/astro/creating-pages.html)
+2. [Creating Widgets](/tutorials/astro/creating-widgets.html)
+3. [Creating Pieces](/tutorials/astro/creating-pieces.html)
+
+## Build phase checklist
+
+1. Map page types to Astro templates.
+2. Map widget types to Astro components.
+3. Verify piece index/show routes and templates.
+4. Confirm area rendering and editing flow in development.
+
+## Next phase
+
+Continue to [Deployment Overview](/tutorials/astro/deployment-overview.html).
+
+## Keep references handy
+
+Use [Reference for ApostropheCMS + Astro](/tutorials/astro/reference-for-apostrophe-and-astro.html) while implementing and debugging.
\`\`\`

### docs/tutorials/astro/concepts-for-apostrophe-and-astro.md

Preview: [http://localhost:5173/docs/tutorials/astro/concepts-for-apostrophe-and-astro.html](http://localhost:5173/docs/tutorials/astro/concepts-for-apostrophe-and-astro.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/concepts-for-apostrophe-and-astro.md b/docs/tutorials/astro/concepts-for-apostrophe-and-astro.md
new file mode 100644
index 0000000..cf78489
--- /dev/null
+++ b/docs/tutorials/astro/concepts-for-apostrophe-and-astro.md
@@ -0,0 +1,38 @@
+---
+title: "Concepts for ApostropheCMS + Astro"
+detailHeading: "Astro"
+url: "/tutorials/astro/concepts-for-apostrophe-and-astro.html"
+content: "Understand key concepts for building ApostropheCMS + Astro projects before implementation."
+tags:
+  topic: "Core Concepts"
+  type: astro
+  effort: beginner
+order: 2
+excludeFromFilters: true
+---
+# Concepts for ApostropheCMS + Astro
+
+Use this page as your concept checkpoint before the build tutorials.
+
+## Read first
+
+1. [ApostropheCMS and Astro](/tutorials/astro/apostrophecms-and-astro.html)
+2. [Creating Pages](/tutorials/astro/creating-pages.html)
+3. [Creating Widgets](/tutorials/astro/creating-widgets.html)
+4. [Creating Pieces](/tutorials/astro/creating-pieces.html)
+
+## Concept map
+
+1. **Template mapping**
+   - Connect backend page types to Astro templates.
+2. **Widget mapping**
+   - Connect backend widget types to Astro components.
+3. **Piece routes**
+   - Support index/show views and related filters.
+4. **Rendering mode**
+   - Choose static or server-capable output based on deployment needs.
+
+## Next step
+
+Proceed to [Build with ApostropheCMS + Astro](/tutorials/astro/build-with-apostrophe-and-astro.html).
+
\`\`\`

### docs/tutorials/astro/creating-pages.md

Preview: [http://localhost:5173/docs/tutorials/astro/creating-pages.html](http://localhost:5173/docs/tutorials/astro/creating-pages.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/creating-pages.md b/docs/tutorials/astro/creating-pages.md
index 8b23e18..eceb532 100644
--- a/docs/tutorials/astro/creating-pages.md
+++ b/docs/tutorials/astro/creating-pages.md
@@ -629,4 +629,6 @@ const clearFilter = setParameter(Astro.url, 'category', '');
 ```
 
+For static Astro output, prefer helper utilities from `@apostrophecms/apostrophe-astro/helpers` when generating piece index filter and pagination links, especially `buildPageUrl()` for pagination. This keeps your URLs compatible with both SSR query-string mode and static path-based mode. See [Static Builds with ApostropheCMS + Astro](/tutorials/astro/static-builds-with-apostrophe.html) for the full static pattern.
+
 #### Accessing Global Data
 ApostropheCMS provides a global document for site-wide settings and content. This is configured in your backend through the `@apostrophecms/global` module:
@@ -746,3 +748,3 @@ For detailed examples of these patterns in action, explore the Apollo theme's so
 - The global header and footer components
 
-With our understanding of how pages work in an ApostropheCMS + Astro project, we can now turn our attention to another crucial component: widgets. These modular building blocks provide the actual content and functionality within your page areas, and mastering their creation is essential for building flexible, editor-friendly websites.
\ No newline at end of file
+With our understanding of how pages work in an ApostropheCMS + Astro project, we can now turn our attention to another crucial component: widgets. These modular building blocks provide the actual content and functionality within your page areas, and mastering their creation is essential for building flexible, editor-friendly websites.
\`\`\`

### docs/tutorials/astro/creating-pieces.md

Preview: [http://localhost:5173/docs/tutorials/astro/creating-pieces.html](http://localhost:5173/docs/tutorials/astro/creating-pieces.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/creating-pieces.md b/docs/tutorials/astro/creating-pieces.md
index 343edcc..e766709 100644
--- a/docs/tutorials/astro/creating-pieces.md
+++ b/docs/tutorials/astro/creating-pieces.md
@@ -384,4 +384,6 @@ frontend/src/templates/ArticleIndexPage.astro
 Clicking on one of these filters will result in the backend populating the `aposData.pieces` with only those that match the filter value. So, you don't need any special markup, just the same markup you use to display all the unfiltered pieces.
 
+For newer Astro integrations, you can also use `aposData.filters` (from `req.data.filters`) which includes richer filter metadata and `_url` values for each choice. That shape is preferred for static builds because links can be rendered directly from choice URLs rather than manually assembling query parameters.
+
 #### 3. Pagination
 
@@ -409,4 +411,6 @@ frontend/src/templates/ArticleIndexPage.astro
 The `setParameter` helper from the `apostrophe-astro` package ensures that pagination URLs maintain other query parameters (like active filters) while changing only the page number.
 
+If you plan to support static output, use `buildPageUrl(aposData, pageNumber)` from `@apostrophecms/apostrophe-astro/helpers` for pagination links. It automatically handles both query-string URLs (SSR) and path-based URLs (static mode).
+
 Then it renders a pagination component if there's more than one page:
 
\`\`\`

### docs/tutorials/astro/creating-widgets.md

Preview: [http://localhost:5173/docs/tutorials/astro/creating-widgets.html](http://localhost:5173/docs/tutorials/astro/creating-widgets.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/creating-widgets.md b/docs/tutorials/astro/creating-widgets.md
index 245e3fa..3385824 100644
--- a/docs/tutorials/astro/creating-widgets.md
+++ b/docs/tutorials/astro/creating-widgets.md
@@ -334,4 +334,9 @@ Next, let's look at how we can add client-side interactivity to widgets. The vid
 Astro provides several routes for adding JavaScript to the browser. This can take the form of public scripts loaded on every page, `<script>` tags in your components, and the addition of client-side framework components, e.g. Vue or React components. Let's explore the different approaches available for adding client-side interactivity to widgets in the ApostropheCMS + Astro environment, using examples from the Apollo project.
 
+::: warning Static build caveat
+Browser-side calls to Apostrophe routes such as `/api/v1/...` require a live backend at runtime. In a fully static deployment, move those calls to Astro server/frontmatter code during build (for example with `aposFetch`) and pass the result into the widget as props or `data-*` attributes.
+See [Static Builds with ApostropheCMS + Astro](/tutorials/astro/static-builds-with-apostrophe.html) for the full static workflow.
+:::
+
 <iframe width="560" height="315" src="https://www.youtube.com/embed/JEU2RdgqrIs?si=reRnkOBt_rTIpXTA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
 
@@ -1024,3 +1029,3 @@ While widgets handle modular content and layouts, pieces in ApostropheCMS serve
 - Handling piece data in Astro templates
 
-Pieces complement widgets by providing reusable content that can be displayed across your site in various contexts. Understanding both systems gives you powerful tools for building flexible, content-rich websites.
\ No newline at end of file
+Pieces complement widgets by providing reusable content that can be displayed across your site in various contexts. Understanding both systems gives you powerful tools for building flexible, content-rich websites.
\`\`\`

### docs/tutorials/astro/deploying-hybrid-projects.md

Preview: [http://localhost:5173/docs/tutorials/astro/deploying-hybrid-projects.html](http://localhost:5173/docs/tutorials/astro/deploying-hybrid-projects.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/deploying-hybrid-projects.md b/docs/tutorials/astro/deploying-hybrid-projects.md
index f2ec749..c3d69ed 100644
--- a/docs/tutorials/astro/deploying-hybrid-projects.md
+++ b/docs/tutorials/astro/deploying-hybrid-projects.md
@@ -8,10 +8,13 @@ tags:
   type: astro
   effort: beginner
-order: 6
+order: 8
 excludeFromFilters: true
 ---
 # Deploying ApostropheCMS + Astro Projects
 
-Now that you've built your site with ApostropheCMS and Astro, it's time to deploy it for the world to see. The Apollo project's dual-repository structure (backend + frontend) offers flexibility but also requires special considerations for deployment.
+> [!TIP]
+> Start with [Deployment Overview](/tutorials/astro/deployment-overview.html) if you have not chosen between static and server-capable deployment yet.
+
+Now that you've built your site with ApostropheCMS and Astro, it's time to deploy it for the world to see. A split frontend/backend structure offers flexibility but also requires special considerations for deployment.
 
 ## Understanding Deployment Options
@@ -29,4 +32,8 @@ There are two main approaches to deploying your ApostropheCMS + Astro project:
    - Requires more configuration and coordination
 
+::: info Static output option
+If you are deploying a fully static Astro build (no Node.js Astro server in production), use [Static Builds with ApostropheCMS + Astro](/tutorials/astro/static-builds-with-apostrophe.html). That workflow changes Astro output mode, path generation, and attachment/literal-content handling.
+:::
+
 ## Prerequisites for Production Deployment
 
@@ -304,3 +311,6 @@ For further assistance, consider:
 - Joining the [ApostropheCMS Discord community](http://chat.apostrophecms.org)
 - Consulting the [Astro deployment documentation](https://docs.astro.build/en/guides/deploy/)
-- Reaching out to the Apostrophe team for hosting solutions
\ No newline at end of file
+- Reaching out to the Apostrophe team for hosting solutions
+- Reviewing [Environment Variables by Host](/tutorials/astro/environment-variables-by-host.html)
+- Running the [Post-Deploy Checklist](/tutorials/astro/post-deploy-checklist.html)
+- Using [Deployment Troubleshooting](/tutorials/astro/deployment-troubleshooting.html) for failures
\`\`\`

### docs/tutorials/astro/deploying-to-github-pages.md

Preview: [http://localhost:5173/docs/tutorials/astro/deploying-to-github-pages.html](http://localhost:5173/docs/tutorials/astro/deploying-to-github-pages.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/deploying-to-github-pages.md b/docs/tutorials/astro/deploying-to-github-pages.md
new file mode 100644
index 0000000..4f8b8bd
--- /dev/null
+++ b/docs/tutorials/astro/deploying-to-github-pages.md
@@ -0,0 +1,54 @@
+---
+title: "Deploying ApostropheCMS + Astro to GitHub Pages"
+detailHeading: "Astro"
+url: "/tutorials/astro/deploying-to-github-pages.html"
+content: "Deploy a static ApostropheCMS + Astro site to GitHub Pages."
+tags:
+  topic: "Core Concepts"
+  type: astro
+  effort: beginner
+order: 11
+excludeFromFilters: true
+---
+# Deploying ApostropheCMS + Astro to GitHub Pages
+
+GitHub Pages is a static-only host. Use this path only for static Astro output.
+
+## Required path
+
+Start with [Static Builds with ApostropheCMS + Astro](/tutorials/astro/static-builds-with-apostrophe.html). Do not use a server-capable Astro setup for GitHub Pages.
+
+## Core configuration
+
+1. Configure Astro with `base` matching your repository path:
+   - User/org site: `base: '/'`
+   - Project site: `base: '/<repo-name>'`
+2. Match Apostrophe `prefix` to the same path when serving generated links.
+3. Set `staticBaseUrl` to your final origin (for example `https://<user>.github.io`).
+
+## Build and publish
+
+1. Run your static build command (for example `APOS_BUILD=static npm run build`).
+2. Publish the generated `dist` directory with your preferred GitHub Pages workflow.
+3. If using GitHub Actions, ensure the workflow uploads and deploys the `dist` artifact.
+
+## Environment variables
+
+Set build-time secrets/variables in GitHub Actions (or your build environment):
+
+- `APOS_EXTERNAL_FRONT_KEY`
+- `APOS_HOST`
+- `APOS_BUILD=static`
+- `APOS_STATIC_BASE_URL`
+
+## Validate deployment
+
+1. Confirm URLs include the expected repository prefix.
+2. Confirm media and CSS/JS load from the correct base path.
+3. Confirm links to paginated and filtered pages resolve correctly.
+
+## Related guides
+
+- [Environment Variables by Host](/tutorials/astro/environment-variables-by-host.html)
+- [Post-Deploy Checklist](/tutorials/astro/post-deploy-checklist.html)
+- [Deployment Troubleshooting](/tutorials/astro/deployment-troubleshooting.html)
\`\`\`

### docs/tutorials/astro/deploying-to-netlify.md

Preview: [http://localhost:5173/docs/tutorials/astro/deploying-to-netlify.html](http://localhost:5173/docs/tutorials/astro/deploying-to-netlify.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/deploying-to-netlify.md b/docs/tutorials/astro/deploying-to-netlify.md
new file mode 100644
index 0000000..0767c96
--- /dev/null
+++ b/docs/tutorials/astro/deploying-to-netlify.md
@@ -0,0 +1,56 @@
+---
+title: "Deploying ApostropheCMS + Astro to Netlify"
+detailHeading: "Astro"
+url: "/tutorials/astro/deploying-to-netlify.html"
+content: "Deploy ApostropheCMS + Astro to Netlify with static output or a server-capable setup."
+tags:
+  topic: "Core Concepts"
+  type: astro
+  effort: beginner
+order: 10
+excludeFromFilters: true
+---
+# Deploying ApostropheCMS + Astro to Netlify
+
+Netlify supports both static Astro output and server-capable deployments.
+
+## Choose output mode first
+
+1. For static output, follow [Static Builds with ApostropheCMS + Astro](/tutorials/astro/static-builds-with-apostrophe.html).
+2. For server-capable output, follow [Deploying ApostropheCMS + Astro Projects](/tutorials/astro/deploying-hybrid-projects.html).
+
+## Netlify project setup
+
+1. Connect your repository in Netlify.
+2. Set base directory to the Astro frontend directory in monorepo setups.
+3. Set build command: `npm run build`
+4. Set publish directory: `dist`
+
+Optional `netlify.toml` pattern:
+
+```toml
+[build]
+  base = "frontend"
+  command = "npm run build"
+  publish = "dist"
+```
+
+## Environment variables
+
+Set these in Netlify site settings:
+
+- `APOS_EXTERNAL_FRONT_KEY`
+- `APOS_HOST` (public Apostrophe backend URL)
+- `APOS_BUILD=static` (only for static output)
+
+## Validate deployment
+
+1. Confirm page routes load from the deployed URL.
+2. Confirm media files load without broken links.
+3. Confirm backend-driven content refresh behavior matches your selected mode.
+
+## Related guides
+
+- [Environment Variables by Host](/tutorials/astro/environment-variables-by-host.html)
+- [Post-Deploy Checklist](/tutorials/astro/post-deploy-checklist.html)
+- [Deployment Troubleshooting](/tutorials/astro/deployment-troubleshooting.html)
\`\`\`

### docs/tutorials/astro/deploying-to-vercel.md

Preview: [http://localhost:5173/docs/tutorials/astro/deploying-to-vercel.html](http://localhost:5173/docs/tutorials/astro/deploying-to-vercel.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/deploying-to-vercel.md b/docs/tutorials/astro/deploying-to-vercel.md
new file mode 100644
index 0000000..a27ae9c
--- /dev/null
+++ b/docs/tutorials/astro/deploying-to-vercel.md
@@ -0,0 +1,49 @@
+---
+title: "Deploying ApostropheCMS + Astro to Vercel"
+detailHeading: "Astro"
+url: "/tutorials/astro/deploying-to-vercel.html"
+content: "Deploy ApostropheCMS + Astro to Vercel using either static output or a server-capable runtime."
+tags:
+  topic: "Core Concepts"
+  type: astro
+  effort: beginner
+order: 9
+excludeFromFilters: true
+---
+# Deploying ApostropheCMS + Astro to Vercel
+
+Vercel supports both static Astro sites and server-capable Astro deployments.
+
+## Choose output mode first
+
+1. For static output, follow [Static Builds with ApostropheCMS + Astro](/tutorials/astro/static-builds-with-apostrophe.html).
+2. For server-capable output, follow [Deploying ApostropheCMS + Astro Projects](/tutorials/astro/deploying-hybrid-projects.html).
+
+## Vercel project setup
+
+1. Import your repository into Vercel.
+2. Set the project root to the Astro frontend directory if you use a monorepo.
+3. Set build command: `npm run build`
+4. Set output directory to Astro defaults (usually `dist`).
+
+## Environment variables
+
+Set these in Vercel project settings:
+
+- `APOS_EXTERNAL_FRONT_KEY`
+- `APOS_HOST` (public Apostrophe backend URL)
+- `APOS_BUILD=static` (only for static output)
+
+If your backend is deployed separately, ensure CORS/network access and shared keys are correct.
+
+## Validate deployment
+
+1. Open a few page URLs and confirm content is rendered.
+2. Confirm media and linked assets load.
+3. Confirm protected integration endpoints work as expected.
+
+## Related guides
+
+- [Environment Variables by Host](/tutorials/astro/environment-variables-by-host.html)
+- [Post-Deploy Checklist](/tutorials/astro/post-deploy-checklist.html)
+- [Deployment Troubleshooting](/tutorials/astro/deployment-troubleshooting.html)
\`\`\`

### docs/tutorials/astro/deployment-overview.md

Preview: [http://localhost:5173/docs/tutorials/astro/deployment-overview.html](http://localhost:5173/docs/tutorials/astro/deployment-overview.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/deployment-overview.md b/docs/tutorials/astro/deployment-overview.md
new file mode 100644
index 0000000..f35cf3a
--- /dev/null
+++ b/docs/tutorials/astro/deployment-overview.md
@@ -0,0 +1,70 @@
+---
+title: "Deployment Overview for ApostropheCMS + Astro"
+detailHeading: "Astro"
+url: "/tutorials/astro/deployment-overview.html"
+content: "Choose the right deployment path for your ApostropheCMS + Astro project and then follow host-specific setup guides."
+tags:
+  topic: "Core Concepts"
+  type: astro
+  effort: beginner
+order: 6
+excludeFromFilters: true
+---
+# Deployment Overview for ApostropheCMS + Astro
+
+This page helps you choose a deployment path before you configure a specific host.
+
+## Choose your path
+
+1. **Static Astro output (no Astro server runtime)**
+   - Best when your site can be rebuilt and redeployed for content updates.
+   - Lowest runtime complexity and broad host support.
+   - Start with [Static Builds with ApostropheCMS + Astro](/tutorials/astro/static-builds-with-apostrophe.html).
+
+2. **Server-capable Astro output (SSR/hybrid)**
+   - Best when you need runtime rendering or server-side behavior.
+   - Requires hosting that supports a Node.js runtime.
+   - Start with [Deploying ApostropheCMS + Astro Projects](/tutorials/astro/deploying-hybrid-projects.html).
+
+## Host compatibility quick view
+
+| Host | Static Astro | Server-capable Astro | Notes |
+| --- | --- | --- | --- |
+| Vercel | Yes | Yes | Good fit for both paths. |
+| Netlify | Yes | Yes | Good fit for both paths. |
+| GitHub Pages | Yes | No | Static-only hosting. |
+
+## Decision checklist
+
+Use this to pick static vs server-capable quickly:
+
+1. Do you need runtime rendering per request?
+   - Yes: choose server-capable.
+   - No: static is usually simpler.
+2. Are you deploying to GitHub Pages?
+   - Yes: static is required.
+3. Is your team comfortable with rebuild/redeploy for each content publish?
+   - Yes: static is usually a good fit.
+   - No: server-capable may be a better fit.
+
+## Host-specific guides
+
+- [Deploying to Vercel](/tutorials/astro/deploying-to-vercel.html)
+- [Deploying to Netlify](/tutorials/astro/deploying-to-netlify.html)
+- [Deploying to GitHub Pages](/tutorials/astro/deploying-to-github-pages.html)
+- [Environment Variables by Host](/tutorials/astro/environment-variables-by-host.html)
+- [Post-Deploy Checklist](/tutorials/astro/post-deploy-checklist.html)
+- [Deployment Troubleshooting](/tutorials/astro/deployment-troubleshooting.html)
+
+## Shared deployment checklist
+
+1. Confirm you selected either static or server-capable output.
+2. Set `APOS_EXTERNAL_FRONT_KEY` in backend and frontend environments.
+3. Set `APOS_HOST` for frontend builds and runtime where required.
+4. Configure backend asset storage (for example S3) for production uploads.
+5. Run a production-like local check before deploying:
+   ```bash
+   npm run build
+   npm run preview
+   ```
+6. Verify page rendering, media URLs, and API connectivity after deploy.
\`\`\`

### docs/tutorials/astro/deployment-troubleshooting.md

Preview: [http://localhost:5173/docs/tutorials/astro/deployment-troubleshooting.html](http://localhost:5173/docs/tutorials/astro/deployment-troubleshooting.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/deployment-troubleshooting.md b/docs/tutorials/astro/deployment-troubleshooting.md
new file mode 100644
index 0000000..4f0c34f
--- /dev/null
+++ b/docs/tutorials/astro/deployment-troubleshooting.md
@@ -0,0 +1,77 @@
+---
+title: "Deployment Troubleshooting"
+detailHeading: "Astro"
+url: "/tutorials/astro/deployment-troubleshooting.html"
+content: "Troubleshoot common ApostropheCMS + Astro deployment issues across static and server-capable hosting."
+tags:
+  topic: "Core Concepts"
+  type: astro
+  effort: intermediate
+order: 14
+excludeFromFilters: true
+---
+# Deployment Troubleshooting
+
+Use this page to isolate common deployment failures quickly.
+
+## Frontend cannot load backend content
+
+Common causes:
+
+1. `APOS_HOST` is wrong or points to a private/internal URL.
+2. `APOS_EXTERNAL_FRONT_KEY` does not match backend value.
+3. Backend host is blocked by network/CORS/security rules.
+
+Checks:
+
+1. Verify both env vars in deployment settings.
+2. Confirm backend URL is reachable from frontend runtime.
+3. Redeploy after env var changes.
+
+## Static build generates wrong URLs
+
+Common causes:
+
+1. `APOS_STATIC_BASE_URL` missing or incorrect.
+2. Prefix mismatch between Apostrophe `prefix` and Astro `base`.
+
+Checks:
+
+1. Confirm static base URL uses your public origin.
+2. Confirm prefix/base match for non-root deployments.
+3. Rebuild and re-check a paginated/filter URL.
+
+## Broken media URLs after deploy
+
+Common causes:
+
+1. Asset storage configuration missing on backend.
+2. Static attachment copy settings not configured for build scope.
+3. Path prefix mismatch on static hosts.
+
+Checks:
+
+1. Verify backend storage config (for example S3 env vars).
+2. Verify static attachment build settings from the static build guide.
+3. Inspect one broken media URL and compare with expected base path.
+
+## 404s on GitHub Pages subpaths
+
+Common causes:
+
+1. Astro `base` not set to repository path.
+2. Generated links do not include repository prefix.
+
+Checks:
+
+1. Set `base` to `/<repo-name>` for project pages.
+2. Ensure Apostrophe `prefix` matches that path.
+3. Rebuild and redeploy.
+
+## Related guides
+
+- [Deployment Overview](/tutorials/astro/deployment-overview.html)
+- [Static Builds with ApostropheCMS + Astro](/tutorials/astro/static-builds-with-apostrophe.html)
+- [Deploying ApostropheCMS + Astro Projects](/tutorials/astro/deploying-hybrid-projects.html)
+- [Post-Deploy Checklist](/tutorials/astro/post-deploy-checklist.html)
+
\`\`\`

### docs/tutorials/astro/environment-variables-by-host.md

Preview: [http://localhost:5173/docs/tutorials/astro/environment-variables-by-host.html](http://localhost:5173/docs/tutorials/astro/environment-variables-by-host.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/environment-variables-by-host.md b/docs/tutorials/astro/environment-variables-by-host.md
new file mode 100644
index 0000000..cc18e60
--- /dev/null
+++ b/docs/tutorials/astro/environment-variables-by-host.md
@@ -0,0 +1,73 @@
+---
+title: "Environment Variables by Host"
+detailHeading: "Astro"
+url: "/tutorials/astro/environment-variables-by-host.html"
+content: "Reference environment variable requirements for ApostropheCMS + Astro deployments by host and output mode."
+tags:
+  topic: "Core Concepts"
+  type: astro
+  effort: intermediate
+order: 12
+excludeFromFilters: true
+---
+# Environment Variables by Host
+
+Use this page as a quick reference after you pick a deployment path.
+
+## Core variables
+
+| Variable | Where | Required | Purpose |
+| --- | --- | --- | --- |
+| `APOS_EXTERNAL_FRONT_KEY` | Backend + Frontend | Yes | Shared key for ApostropheCMS/Astro integration. |
+| `APOS_HOST` | Frontend | Yes | URL of the ApostropheCMS backend used by Astro integration. |
+| `APOS_BUILD` | Frontend build | Static only | Set to `static` to force static Astro output. |
+| `APOS_STATIC_BASE_URL` | Backend/build | Static recommended | Public origin used for static URL generation. |
+| `APOS_MONGODB_URI` | Backend | Yes | Database connection string. |
+
+## Vercel
+
+### Static output
+
+- `APOS_EXTERNAL_FRONT_KEY`
+- `APOS_HOST`
+- `APOS_BUILD=static`
+- `APOS_STATIC_BASE_URL` (recommended)
+
+### Server-capable output
+
+- `APOS_EXTERNAL_FRONT_KEY`
+- `APOS_HOST`
+- Optional: `PORT` if your host setup needs explicit binding
+
+## Netlify
+
+### Static output
+
+- `APOS_EXTERNAL_FRONT_KEY`
+- `APOS_HOST`
+- `APOS_BUILD=static`
+- `APOS_STATIC_BASE_URL` (recommended)
+
+### Server-capable output
+
+- `APOS_EXTERNAL_FRONT_KEY`
+- `APOS_HOST`
+
+## GitHub Pages
+
+GitHub Pages is static-only:
+
+- `APOS_EXTERNAL_FRONT_KEY`
+- `APOS_HOST`
+- `APOS_BUILD=static`
+- `APOS_STATIC_BASE_URL`
+
+Also ensure Astro `base` matches your Pages path.
+
+## Related guides
+
+- [Deployment Overview](/tutorials/astro/deployment-overview.html)
+- [Deploying to Vercel](/tutorials/astro/deploying-to-vercel.html)
+- [Deploying to Netlify](/tutorials/astro/deploying-to-netlify.html)
+- [Deploying to GitHub Pages](/tutorials/astro/deploying-to-github-pages.html)
+
\`\`\`

### docs/tutorials/astro/get-started-with-apostrophe-and-astro.md

Preview: [http://localhost:5173/docs/tutorials/astro/get-started-with-apostrophe-and-astro.html](http://localhost:5173/docs/tutorials/astro/get-started-with-apostrophe-and-astro.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/get-started-with-apostrophe-and-astro.md b/docs/tutorials/astro/get-started-with-apostrophe-and-astro.md
new file mode 100644
index 0000000..f03e65f
--- /dev/null
+++ b/docs/tutorials/astro/get-started-with-apostrophe-and-astro.md
@@ -0,0 +1,29 @@
+---
+title: "Get Started with ApostropheCMS + Astro"
+detailHeading: "Astro"
+url: "/tutorials/astro/get-started-with-apostrophe-and-astro.html"
+content: "Start an ApostropheCMS + Astro project and choose whether to follow the Apollo teaching example."
+tags:
+  topic: "Core Concepts"
+  type: astro
+  effort: beginner
+order: 1
+excludeFromFilters: true
+---
+# Get Started with ApostropheCMS + Astro
+
+This page is your starting point for the Astro tutorial track.
+
+## Recommended order
+
+1. Read [ApostropheCMS and Astro](/tutorials/astro/apostrophecms-and-astro.html) for integration context.
+2. Decide your learning path:
+   - Theme-agnostic path: continue to [Concepts for ApostropheCMS + Astro](/tutorials/astro/concepts-for-apostrophe-and-astro.html), then [Build with ApostropheCMS + Astro](/tutorials/astro/build-with-apostrophe-and-astro.html).
+   - Teaching-example path: review [Introducing Apollo](/tutorials/astro/introducing-apollo.html).
+3. When ready to launch, move to [Deployment Overview](/tutorials/astro/deployment-overview.html).
+
+## Who should use this track
+
+- Developers building custom ApostropheCMS + Astro implementations.
+- Teams who may never use Apollo but still need production deployment guidance.
+- Teams who want an optional end-to-end example project for teaching.
\`\`\`

### docs/tutorials/astro/index.md

Preview: [http://localhost:5173/docs/tutorials/astro/index.html](http://localhost:5173/docs/tutorials/astro/index.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/index.md b/docs/tutorials/astro/index.md
new file mode 100644
index 0000000..e57fe4b
--- /dev/null
+++ b/docs/tutorials/astro/index.md
@@ -0,0 +1,69 @@
+---
+title: "ApostropheCMS + Astro Tutorials"
+detailHeading: "Astro"
+url: "/tutorials/astro/"
+content: "A focused tutorial collection for building and deploying ApostropheCMS + Astro projects."
+excludeFromFilters: true
+prev: false
+next: false
+---
+# ApostropheCMS + Astro Tutorials
+
+This section contains practical tutorials for teams using ApostropheCMS as a headless backend with Astro on the frontend.
+
+<AposTwoColumns>
+  <template #leftColumn>
+    <AposCtaButton
+      detail-heading="Astro"
+      title="Core Concepts"
+      content="Start with the integration overview and Apollo foundation before building pages, widgets, and pieces."
+      url="/docs/tutorials/astro/apostrophecms-and-astro.html"
+    />
+  </template>
+  <template #rightColumn>
+    <AposCtaButton
+      detail-heading="Astro"
+      title="Build Pages and Content"
+      content="Learn the main implementation path for templates, widgets, and reusable piece content."
+      url="/docs/tutorials/astro/creating-pages.html"
+    />
+  </template>
+</AposTwoColumns>
+
+<AposTwoColumns>
+  <template #leftColumn>
+    <AposCtaButton
+      detail-heading="Deploy"
+      title="Deployment Overview"
+      content="Review hosting models, environment setup, and deployment paths for SSR and split hosting."
+      url="/docs/tutorials/astro/deployment-overview.html"
+    />
+  </template>
+  <template #rightColumn>
+    <AposCtaButton
+      detail-heading="Deploy"
+      title="Static Builds"
+      content="Configure Astro static output with Apostrophe URL metadata, filters, and attachment handling."
+      url="/docs/tutorials/astro/static-builds-with-apostrophe.html"
+    />
+  </template>
+</AposTwoColumns>
+
+<AposTwoColumns>
+  <template #leftColumn>
+    <AposCtaButton
+      detail-heading="Deploy"
+      title="Host-Specific Guides"
+      content="Follow Vercel, Netlify, and GitHub Pages deployment walkthroughs and env-var mappings."
+      url="/docs/tutorials/astro/deploying-to-vercel.html"
+    />
+  </template>
+  <template #rightColumn>
+    <AposCtaButton
+      detail-heading="Support"
+      title="Troubleshooting"
+      content="Use deployment troubleshooting and post-deploy checks when a build or launch fails."
+      url="/docs/tutorials/astro/deployment-troubleshooting.html"
+    />
+  </template>
+</AposTwoColumns>
\`\`\`

### docs/tutorials/astro/post-deploy-checklist.md

Preview: [http://localhost:5173/docs/tutorials/astro/post-deploy-checklist.html](http://localhost:5173/docs/tutorials/astro/post-deploy-checklist.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/post-deploy-checklist.md b/docs/tutorials/astro/post-deploy-checklist.md
new file mode 100644
index 0000000..8b21677
--- /dev/null
+++ b/docs/tutorials/astro/post-deploy-checklist.md
@@ -0,0 +1,54 @@
+---
+title: "Post-Deploy Checklist"
+detailHeading: "Astro"
+url: "/tutorials/astro/post-deploy-checklist.html"
+content: "Validate an ApostropheCMS + Astro deployment with a focused post-deploy checklist."
+tags:
+  topic: "Core Concepts"
+  type: astro
+  effort: beginner
+order: 13
+excludeFromFilters: true
+---
+# Post-Deploy Checklist
+
+Use this checklist right after each deployment.
+
+## Page and routing checks
+
+1. Homepage loads without server or build errors.
+2. At least one nested page route resolves correctly.
+3. Piece index and piece show routes resolve correctly.
+4. Pagination and filter links work as expected.
+
+## Asset and media checks
+
+1. CSS and JS files load with no 404 errors.
+2. Uploaded media renders in pages and widgets.
+3. Image variants/crops resolve correctly.
+
+## Integration checks
+
+1. `APOS_HOST` points to the intended backend.
+2. Frontend and backend `APOS_EXTERNAL_FRONT_KEY` values match.
+3. Runtime/API calls used by widgets succeed.
+
+## Host/path checks
+
+1. On GitHub Pages, URL prefix and Astro `base` are correct.
+2. Canonical/public URLs match your production domain.
+3. No mixed-content warnings (HTTP assets on HTTPS page).
+
+## Smoke test commands
+
+```bash
+npm run build
+npm run preview
+```
+
+Then test a representative set of URLs manually.
+
+## If something fails
+
+Start with [Deployment Troubleshooting](/tutorials/astro/deployment-troubleshooting.html).
+
\`\`\`

### docs/tutorials/astro/reference-for-apostrophe-and-astro.md

Preview: [http://localhost:5173/docs/tutorials/astro/reference-for-apostrophe-and-astro.html](http://localhost:5173/docs/tutorials/astro/reference-for-apostrophe-and-astro.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/reference-for-apostrophe-and-astro.md b/docs/tutorials/astro/reference-for-apostrophe-and-astro.md
new file mode 100644
index 0000000..3a073d6
--- /dev/null
+++ b/docs/tutorials/astro/reference-for-apostrophe-and-astro.md
@@ -0,0 +1,36 @@
+---
+title: "Reference for ApostropheCMS + Astro"
+detailHeading: "Astro"
+url: "/tutorials/astro/reference-for-apostrophe-and-astro.html"
+content: "Quick links to the most relevant ApostropheCMS and Astro references for day-to-day development."
+tags:
+  topic: "Core Concepts"
+  type: astro
+  effort: intermediate
+order: 15
+excludeFromFilters: true
+---
+# Reference for ApostropheCMS + Astro
+
+Use this page as a jump-off to detailed docs while you implement or deploy.
+
+## ApostropheCMS references
+
+- [Guide: Pages](/guide/pages.html)
+- [Guide: Pieces](/guide/pieces.html)
+- [Guide: Areas and Widgets](/guide/areas-and-widgets.html)
+- [Guide: Piece Pages](/guide/piece-pages.html)
+- [REST API Reference](/reference/api/rest-api-reference.html)
+
+## Astro + integration references
+
+- [apostrophe-astro package](https://github.com/apostrophecms/apostrophe-astro)
+- [Astro deployment guides](https://docs.astro.build/en/guides/deploy/)
+
+## Deployment references in this tutorial track
+
+- [Deployment Overview](/tutorials/astro/deployment-overview.html)
+- [Environment Variables by Host](/tutorials/astro/environment-variables-by-host.html)
+- [Post-Deploy Checklist](/tutorials/astro/post-deploy-checklist.html)
+- [Deployment Troubleshooting](/tutorials/astro/deployment-troubleshooting.html)
+
\`\`\`

### docs/tutorials/astro/static-builds-with-apostrophe.md

Preview: [http://localhost:5173/docs/tutorials/astro/static-builds-with-apostrophe.html](http://localhost:5173/docs/tutorials/astro/static-builds-with-apostrophe.html)

\`\`\`diff
diff --git a/docs/tutorials/astro/static-builds-with-apostrophe.md b/docs/tutorials/astro/static-builds-with-apostrophe.md
new file mode 100644
index 0000000..c1fd3c0
--- /dev/null
+++ b/docs/tutorials/astro/static-builds-with-apostrophe.md
@@ -0,0 +1,196 @@
+---
+title: "Static Builds with ApostropheCMS + Astro"
+detailHeading: "Astro"
+url: "/tutorials/astro/static-builds-with-apostrophe.html"
+content: "Build and deploy a fully static Astro frontend backed by ApostropheCMS content. Configure URL metadata, static paths, attachments, and non-root hosting."
+tags:
+  topic: "Core Concepts"
+  type: astro
+  effort: intermediate
+order: 7
+excludeFromFilters: true
+---
+# Static Builds with ApostropheCMS + Astro
+
+This tutorial explains how to run ApostropheCMS as your content backend while generating a fully static Astro frontend at build time. The final output is static HTML, CSS, JS, and media files that can be deployed to static hosting platforms.
+
+## How static mode works
+
+In static mode, the Astro build:
+
+1. Requests URL metadata from ApostropheCMS (pages, piece show URLs, filter/pagination URLs).
+2. Renders all routes returned by `getStaticPaths()`.
+3. Writes literal backend content (for example generated CSS, `robots.txt`, and sitemap files).
+4. Copies attachment files so the static output can run without a live Apostrophe frontend server.
+
+Your Apostrophe backend must be running during the build.
+
+## Backend configuration
+
+### 1. Enable static URL behavior
+
+Set `@apostrophecms/url` `static: true`:
+
+```javascript
+// modules/@apostrophecms/url/index.js
+export default {
+  options: {
+    static: true
+  }
+};
+```
+
+This enables path-based filter/pagination URLs and static URL metadata collection.
+
+### 2. Set `staticBaseUrl`
+
+Set a public origin for generated static URLs:
+
+```javascript
+// app.js
+apostrophe({
+  shortName: 'my-project',
+  baseUrl: 'http://localhost:3000',
+  staticBaseUrl: 'https://www.example.com',
+  modules: {
+    '@apostrophecms/url': {
+      options: {
+        static: true
+      }
+    }
+  }
+});
+```
+
+You can also set this with `APOS_STATIC_BASE_URL`.
+
+### 3. Configure piece filters for static generation
+
+When piece index filters are used, declare them with `piecesFilters` so static filter and pagination URLs can be generated:
+
+```javascript
+// modules/article-page/index.js
+export default {
+  extend: '@apostrophecms/piece-page-type',
+  options: {
+    piecesFilters: [
+      { name: 'category' }
+    ]
+  }
+};
+```
+
+## Frontend configuration
+
+### 1. Switch Astro output mode
+
+Use `APOS_BUILD=static` to switch from SSR to static output:
+
+```javascript
+// astro.config.mjs
+import { defineConfig } from 'astro/config';
+import node from '@astrojs/node';
+import apostrophe from '@apostrophecms/apostrophe-astro';
+
+const isStatic = process.env.APOS_BUILD === 'static';
+
+export default defineConfig({
+  output: isStatic ? 'static' : 'server',
+  adapter: isStatic ? undefined : node({ mode: 'standalone' }),
+  integrations: [
+    apostrophe({
+      aposHost: 'http://localhost:3000',
+      widgetsMapping: './src/widgets/index.js',
+      templatesMapping: './src/templates/index.js'
+    })
+  ]
+});
+```
+
+### 2. Add `getStaticPaths` in your catch-all route
+
+```astro
+---
+// src/pages/[...slug].astro
+import { getAllStaticPaths } from '@apostrophecms/apostrophe-astro/lib/static.js';
+import { getAposHost } from '@apostrophecms/apostrophe-astro/helpers';
+import aposPageFetch from '@apostrophecms/apostrophe-astro/lib/aposPageFetch.js';
+
+export async function getStaticPaths() {
+  return getAllStaticPaths({
+    aposHost: getAposHost(),
+    aposExternalFrontKey: import.meta.env.APOS_EXTERNAL_FRONT_KEY
+  });
+}
+
+const aposData = await aposPageFetch(Astro.request);
+---
+```
+
+## Build commands and env vars
+
+Example frontend `package.json` scripts:
+
+```json
+{
+  "scripts": {
+    "dev": "cross-env APOS_EXTERNAL_FRONT_KEY=dev astro dev",
+    "build": "astro build",
+    "build:static": "APOS_BUILD=static APOS_EXTERNAL_FRONT_KEY=dev astro build"
+  }
+}
+```
+
+Common variables:
+
+- `APOS_BUILD=static`
+- `APOS_EXTERNAL_FRONT_KEY` (required)
+- `APOS_HOST`
+- `APOS_PREFIX`
+- `APOS_STATIC_BASE_URL` (required for production static URLs)
+- `APOS_SKIP_ATTACHMENTS`
+- `APOS_ATTACHMENT_SIZES`
+- `APOS_ATTACHMENT_SKIP_SIZES`
+- `APOS_ATTACHMENT_SCOPE`
+
+## Static-safe template helpers
+
+Use helpers from `@apostrophecms/apostrophe-astro/helpers`:
+
+- `buildPageUrl(aposData, pageNumber)` for pagination URLs in SSR and static modes.
+- `getFilterBaseUrl(aposData)` for filter-aware base URLs.
+- `getAposHost()` for server-side backend host resolution.
+- `aposFetch()` for server-side requests to Apostrophe APIs.
+
+## Filters and pagination updates
+
+For piece index pages, prefer `req.data.filters` (available as `aposData.filters`) for filter metadata and links, while keeping `req.data.piecesFilters` support for legacy patterns.
+
+For pagination, use `buildPageUrl` instead of manually assembling query strings.
+
+## Widget behavior in static output
+
+Client-side calls to Apostrophe backend routes (for example `/api/v1/...`) will fail on a purely static site. Move those calls to Astro server/frontmatter code at build time, then pass results into client components as props or `data-*` attributes.
+
+## Non-root hosting (GitHub Pages and similar)
+
+When deploying under a path prefix:
+
+- Backend: set `prefix` (for example `/my-repo`) and `staticBaseUrl` (origin only, for example `https://user.github.io`).
+- Frontend: set `base: '/my-repo'`.
+- Keep Apostrophe `prefix` and Astro `base` identical.
+
+## What to watch out for
+
+1. The backend must stay online for the entire static build.
+2. Content changes require rebuilding and redeploying static output.
+3. Preview and in-context editing are not available on the final static site.
+4. Static mode can increase build time significantly with many filter combinations or large attachment sets.
+
+## Next steps
+
+- Review [Deployment Overview](/tutorials/astro/deployment-overview.html) for host selection.
+- Review [Environment Variables by Host](/tutorials/astro/environment-variables-by-host.html) for setup details.
+- Review [Creating Pieces](/tutorials/astro/creating-pieces.html) for filter/pagination templates.
+- Review [Creating Widgets](/tutorials/astro/creating-widgets.html) for API-driven widget patterns.
+- Review [Deploying ApostropheCMS-Astro Projects](/tutorials/astro/deploying-hybrid-projects.html) for production deployment setups.
\`\`\`

### docs/tutorials/index.md

Preview: [http://localhost:5173/docs/tutorials/index.html](http://localhost:5173/docs/tutorials/index.html)

\`\`\`diff
diff --git a/docs/tutorials/index.md b/docs/tutorials/index.md
index 6875b67..916595e 100644
--- a/docs/tutorials/index.md
+++ b/docs/tutorials/index.md
@@ -22,6 +22,6 @@ Step-by-step tutorials that go beyond the technical explanations in our Guide or
       detail-heading="Astro"
       title="ApostropheCMS & Astro"
-      content="ApostropheCMS and Astro work seamlessly together through the `apostrophe-astro` extension. Learn who this integration is for and what makes it a powerful choice for building modern websites."
-      url="/docs/tutorials/astro/introducing-apollo.html"
+      content="ApostropheCMS and Astro integrate through the `apostrophe-astro` extension. Learn SSR and static-build workflows for modern content-driven sites."
+      url="/docs/tutorials/astro/"
       hideEffort="true"
     />
@@ -47,3 +47,3 @@ Step-by-step tutorials that go beyond the technical explanations in our Guide or
     />
   </template>
-</AposTwoColumns>
\ No newline at end of file
+</AposTwoColumns>
\`\`\`

