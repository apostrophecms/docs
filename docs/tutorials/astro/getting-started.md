---
title: "Getting Started"
description: "Create an ApostropheCMS + Astro project from the Astro Essentials starter kit, run both servers, make your first edit, and trace how a request flows from ApostropheCMS to Astro."
detailHeading: "Astro"
url: "/tutorials/astro/getting-started.html"
content: "Create a project from the Astro Essentials starter kit, run it, and learn how ApostropheCMS and Astro work together to render each page."
tags:
  topic: "Core Concepts"
  type: astro
  effort: beginner
order: 2
excludeFromFilters: true
---
# Getting Started with ApostropheCMS and Astro

In this chapter you create the project you'll build on for the rest of the series. You'll start from the [Astro Essentials starter kit](https://github.com/apostrophecms/starter-kit-astro-essentials), run it, make your first edit, and follow a single page request from the browser through Astro to ApostropheCMS and back.

By the end of the chapter you'll have:

- An ApostropheCMS + Astro project running on your machine
- An admin account and a first page of your own
- A working picture of how the two applications share the work of rendering a page

## Prerequisites

You need:

- **Node.js 22.22 or later.** Node 24 is recommended.
- **A terminal.** On Windows, see the [Windows options in the setup guide](/guide/development-setup.html#overview).

You don't need to install a database. The installer offers SQLite, which keeps the database in a file inside your project. If you'd rather use MongoDB or PostgreSQL, see [Choosing a database](/guide/choosing-a-database.html).

If you haven't set up Node.js yet, follow [Setting Up Your Environment](/guide/development-setup.html) first, then come back here.

## Create the project

Run the guided installer:

```bash
npm create apostrophe@latest
```

Answer the prompts like this:

1. **Project name:** any name you like. This tutorial uses `my-site`. It becomes the folder name and the database name.
2. **How would you like to build?** Choose **Apostrophe + Astro**.
3. **Choose a starting point:** choose **Essentials**. The default is **Demo**, so pick Essentials explicitly. The series builds the Essentials kit up into the demo one chapter at a time.
4. **Choose a database:** choose **SQLite**, unless you already run MongoDB or PostgreSQL.
5. **Create your admin account:** pick a username and password. You'll use them to log in.

The installer copies the starter kit, writes a `.env` file for each application, installs dependencies, and creates your admin account. When it finishes, it prints the next steps:

```bash
cd my-site
npm run dev
```

::: tip Running the installer without prompts
To script the install, for example in CI, pass the answers as flags:

```bash
npm create apostrophe@latest -- --unattended --kit=apostrophe-astro-essentials \
  --project-name=my-site --password=<admin-password> --telemetry=off
```

Run `npm create apostrophe@latest -- --help` for every flag.
:::

## Start the servers

From the project folder, run:

```bash
npm run dev
```

This starts two servers side by side, with their output labeled `[backend]` and `[frontend]`:

| Server | Address | What it does |
|---|---|---|
| ApostropheCMS (backend) | `http://localhost:3000` | Stores content, runs the admin UI's API, and answers Astro's requests for page data |
| Astro (frontend) | `http://localhost:4321` | Renders every page visitors and editors see |

The first start takes a little longer because ApostropheCMS builds its admin UI. Wait until the backend logs a line containing `apos-listening`.

Open `http://localhost:4321`. You'll see the starter kit's welcome page.

::: info Always work on port 4321
Do all browsing and editing on the Astro address, `http://localhost:4321`. If you open the backend at port 3000, it shows a short message saying that it's a backend for Astro. That's expected.
:::

## Log in and make your first page

1. Go to `http://localhost:4321/login` and log in with the account you created in the installer.
2. Back on the home page, the ApostropheCMS admin bar appears across the top of the site.
3. Click **Pages** in the admin bar, then **New Page**.
4. Enter the title `About`. In the right-hand column, check that **Type** is set to **Default**.
5. Click **Add Content** in the main area, choose **Rich Text**, and type a sentence.
6. Click **Publish**.

ApostropheCMS takes you to the new page at `http://localhost:4321/about`, showing the title as a heading and your text below it.

You just edited content in context, on the Astro site, with the ApostropheCMS editing UI. The rest of this chapter explains how that works.

## What's in the project

The project holds two separate applications in one folder:

```
my-site/
├── backend/                 # ApostropheCMS application
│   ├── app.js               # Registers modules and sets the project name
│   ├── modules/             # Page types, widgets, and core module configuration
│   └── lib/                 # Shared configuration, such as area widget lists
├── frontend/                # Astro application
│   ├── astro.config.mjs     # Connects Astro to ApostropheCMS
│   └── src/
│       ├── pages/
│       │   └── [...slug].astro  # The one route that renders every page
│       ├── templates/       # One Astro component per page type
│       ├── widgets/         # One Astro component per widget type
│       └── components/      # Shared components
└── package.json             # Scripts that run both applications
```

Each application has its own `package.json`, `node_modules`, and `.env` file. The root `package.json` only holds scripts. For example, the root `npm run dev` runs `npm run dev` in each folder.

The split follows a simple rule:

- **ApostropheCMS owns content.** Every content type, field, and widget is defined in `backend/modules`. If you add a field, you add it in the backend.
- **Astro owns presentation.** Every page and widget is rendered by a component in `frontend/src`. Astro never defines or stores content.

The [`@apostrophecms/apostrophe-astro`](https://github.com/apostrophecms/apostrophe/tree/main/packages/apostrophe-astro) package connects the two. It's installed in the frontend and configured in `astro.config.mjs`:

<AposCodeBlock>

```javascript
export default defineConfig({
  output: 'server',
  // ...
  integrations: [
    apostrophe({
      aposHost: 'http://localhost:3000',
      widgetsMapping: './src/widgets',
      templatesMapping: './src/templates',
      // ...
    })
  ],
  // ...
});
```
<template v-slot:caption>
  frontend/astro.config.mjs
</template>
</AposCodeBlock>

- `output: 'server'` renders each page on request, so editors always see current content. To publish a static site instead, see [Static Builds with ApostropheCMS + Astro](/tutorials/astro/static-builds-with-apostrophecms-astro.html).
- `aposHost` is where Astro finds the backend. In production, set it with the `APOS_HOST` environment variable.
- `templatesMapping` and `widgetsMapping` point to the folders that hold your page and widget components. You'll see how they're used below.

## How a page request flows

Follow the request for your About page from start to finish.

### 1. The browser asks Astro

The browser requests `http://localhost:4321/about`. Astro receives every request first.

A few kinds of URLs go straight through to ApostropheCMS without rendering anything: `/api/v1/...` for the REST API, `/login`, `/uploads/...` for media, and `/apos-frontend/...` for admin UI assets. That's how logging in and editing work on port 4321.

### 2. One route handles every page

The Astro project has no page file for `/about`. Instead, a single catch-all route, `[...slug].astro`, matches every URL:

<AposCodeBlock>

```astro
---
import aposPageFetch from "@apostrophecms/apostrophe-astro/lib/aposPageFetch.js";
import AposLayout from "@apostrophecms/apostrophe-astro/components/layouts/AposLayout.astro";
import AposTemplate from "@apostrophecms/apostrophe-astro/components/AposTemplate.astro";
import "../styles/app.css";
import "../styles/styles.css";

// aposPageFetch fetches the full page payload from the ApostropheCMS backend for the
// current URL. It returns an object with: `page` (the page document), `piece` (set on
// piece-show routes), `global` (global config), and flags like `redirect` and `notFound`.
// Downstream templates receive this object as `Astro.props.aposData`.
const aposData = await aposPageFetch(Astro.request);
const bodyClass = `myclass`;

if (aposData.redirect) {
  return Astro.redirect(aposData.url, aposData.status);
}
if (aposData.notFound) {
  Astro.response.status = 404;
}
---

<AposLayout title={aposData.page?.title} {aposData} {bodyClass}>
  <Fragment slot="standardHead">
    <meta name="description" content={aposData.page?.seoDescription} />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta charset="UTF-8" />
  </Fragment>
  <main slot="main" class="main">
    <AposTemplate {aposData} />
  </main>
  <Fragment {aposData} slot="endBody">
    <script>
      // Registers widget custom elements (e.g. <video-widget>) at page level so
      // they are defined even when a widget is added client-side in edit mode.
      import "../widgets/players.ts";
    </script>
  </Fragment>
</AposLayout>
```
<template v-slot:caption>
  frontend/src/pages/[...slug].astro
</template>
</AposCodeBlock>

The page tree lives in ApostropheCMS, so Astro doesn't need to know which URLs exist. It asks the backend about each one.

### 3. Astro asks ApostropheCMS for the page data

`aposPageFetch` forwards the request to the backend, including the visitor's cookies, so logged-in editors get draft content and editing controls. It adds two headers:

- `x-requested-with: AposExternalFront`
- `apos-external-front-key`, set to the value of `APOS_EXTERNAL_FRONT_KEY`

When ApostropheCMS sees these headers with the right key, it returns the page as JSON instead of HTML. You can make the same request yourself while the servers are running:

```bash
curl -H "x-requested-with: AposExternalFront" \
  -H "apos-external-front-key: dev" \
  http://localhost:3000/about
```

The response is the `aposData` object that every template receives. These are the parts you'll use most:

| Property | Contains |
|---|---|
| `page` | The page document: `title`, `type`, `slug`, and its fields, such as the `main` area |
| `template` | Which template to render, such as `default-page:page` |
| `global` | Site-wide settings, which you'll use in the next chapter |
| `user` | The logged-in user, if there is one |
| `piece` | On a piece's show page, the piece being displayed |

::: info The key must match on both sides
`APOS_EXTERNAL_FRONT_KEY` must be the same in the backend and the frontend. The `dev` scripts in both `package.json` files set it to `dev` for local development, which is why the `curl` example uses `dev`. With a different key, the backend answers `forbidden`. In production, set the same secret value on both servers.
:::

### 4. The template mapping picks a component

`AposTemplate` looks at `aposData.template` and finds the matching Astro component in `templates/index.js`:

<AposCodeBlock>

```javascript
// Template registry — maps backend page type names to Astro components.
// Keys MUST match the backend module name exactly (e.g. '@apostrophecms/home-page', 'default-page').
// A wrong or missing key silently falls back to a default renderer — the page
// will appear blank in the frontend with no console warning or error thrown.
// Piece show/index pages use the 'module-name:show' / 'module-name:index' pattern.
import HomePage from './HomePage.astro';
import DefaultPage from './DefaultPage.astro';
import BlogIndexPage from './BlogIndexPage.astro';
import BlogShowPage from './BlogShowPage.astro';
import NotFoundPage from './NotFoundPage.astro';

const templateComponents = {
  '@apostrophecms/home-page': HomePage,
  'default-page': DefaultPage,
  '@apostrophecms/blog-page:index': BlogIndexPage,
  '@apostrophecms/blog-page:show': BlogShowPage,
  '@apostrophecms/page:notFound': NotFoundPage
};

export default templateComponents;
```
<template v-slot:caption>
  frontend/src/templates/index.js
</template>
</AposCodeBlock>

Your About page is a `default-page`, so ApostropheCMS reports its template as `default-page:page`. Regular pages end in `:page`, and `AposTemplate` drops that suffix before looking up the key. That's why the mapping key is just `default-page`.

Pages that list and display pieces, such as blog posts, use two templates: `:index` for the list and `:show` for a single item. You'll build these in the Pieces chapter.

### 5. The page component renders the content

`DefaultPage.astro` receives `aposData` and renders the page:

<AposCodeBlock>

```astro
---
import AposArea from '@apostrophecms/apostrophe-astro/components/AposArea.astro';
const { page, user, query } = Astro.props.aposData;
const { main } = page;
---

<section class="bp-content">
  <h1>{ page.title }</h1>
  <AposArea area={main} />
</section>
```
<template v-slot:caption>
  frontend/src/templates/DefaultPage.astro
</template>
</AposCodeBlock>

`main` is an **area**: a field that holds a list of widgets that editors add, remove, and reorder. The backend module for the page type defines the area and the widgets it allows:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'Default Page'
  },
  fields: {
    add: {
      main: {
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/layout': {},
            '@apostrophecms/rich-text': {},
            '@apostrophecms/image': {},
            '@apostrophecms/video': {}
          }
        }
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [
          'title',
          'main'
        ]
      }
    }
  }
};
```
<template v-slot:caption>
  backend/modules/default-page/index.js
</template>
</AposCodeBlock>

### 6. The widget mapping renders each widget

`AposArea` loops over the widgets in the area. For each one, it finds a component in `widgets/index.js`, the same way `AposTemplate` finds a page template:

<AposCodeBlock>

```javascript
const widgetComponents = {
  '@apostrophecms/rich-text': RichTextWidget,
  '@apostrophecms/image': ImageWidget,
  '@apostrophecms/video': VideoWidget,
  '@apostrophecms/layout': LayoutWidget,
  '@apostrophecms/layout-column': LayoutColumnWidget,
  'nested-layout': NestedLayoutWidget,
  'nested-column': NestedLayoutColumnWidget,
  '@apostrophecms/file': FileWidget,
};
```
<template v-slot:caption>
  frontend/src/widgets/index.js
</template>
</AposCodeBlock>

Widget keys are the backend module name without the `-widget` suffix. The rich text you added is stored as `@apostrophecms/rich-text`, so `RichTextWidget.astro` renders it. Widgets that come with ApostropheCMS keep their `@apostrophecms/` prefix.

When you're logged in, `AposArea` also adds the editing controls around each widget. That's what makes in-context editing work on an Astro page.

### The whole flow

```
Browser ──GET /about──▶ Astro [...slug].astro
                          │
                          │ aposPageFetch: same URL, plus the external front key
                          ▼
                        ApostropheCMS ──▶ JSON: page, template, global, user
                          │
                          ▼
                        AposTemplate ──templates/index.js──▶ DefaultPage.astro
                          │
                          ▼
                        AposArea ──widgets/index.js──▶ RichTextWidget.astro
                          │
Browser ◀──── HTML ───────┘
```

## Try it: change a template

Templates are ordinary Astro components, and the dev server reloads them as you save.

Open `frontend/src/templates/DefaultPage.astro` and add a line under the heading:

<AposCodeBlock>

```astro
<section class="bp-content">
  <h1>{ page.title }</h1>
  <p>Page type: { page.type }</p>
  <AposArea area={main} />
</section>
```
<template v-slot:caption>
  frontend/src/templates/DefaultPage.astro
</template>
</AposCodeBlock>

Reload `http://localhost:4321/about`. You'll see `Page type: default-page` under the title.

Now see what happens when a mapping is missing. In `frontend/src/templates/index.js`, comment out the `default-page` line:

```javascript
  // 'default-page': DefaultPage,
```

Reload the About page. The page loads, but the heading and your text are gone, and nothing appears in the browser console. `AposTemplate` can't find a template, so it renders nothing. When a page or widget shows up blank, check its mapping key first.

Restore the `default-page` line and remove the `Page type` line before you continue.

## Troubleshooting

**"Unable to connect to Apostrophe CMS server"**

The backend isn't running, or it isn't at the `aposHost` address. Check the `[backend]` output for errors.

**"Error fetching page from Apostrophe CMS" right after starting**

The frontend can start before the backend finishes building its admin UI. Wait for the backend's `apos-listening` line, then reload.

**"Authentication failed: Header keys do not match"**

`APOS_EXTERNAL_FRONT_KEY` is different in the backend and the frontend. Set the same value in both.

**A page or widget is blank**

Its key is missing from `templates/index.js` or `widgets/index.js`, or doesn't match. For a widget, the frontend server log shows `Missing widget mapping for <type>`.

## Files covered in this chapter

- [`frontend/astro.config.mjs`](https://github.com/apostrophecms/starter-kit-astro-essentials/blob/main/frontend/astro.config.mjs)
- [`frontend/src/pages/[...slug].astro`](https://github.com/apostrophecms/starter-kit-astro-essentials/blob/main/frontend/src/pages/%5B...slug%5D.astro)
- [`frontend/src/templates/index.js`](https://github.com/apostrophecms/starter-kit-astro-essentials/blob/main/frontend/src/templates/index.js)
- [`frontend/src/templates/DefaultPage.astro`](https://github.com/apostrophecms/starter-kit-astro-essentials/blob/main/frontend/src/templates/DefaultPage.astro)
- [`frontend/src/widgets/index.js`](https://github.com/apostrophecms/starter-kit-astro-essentials/blob/main/frontend/src/widgets/index.js)
- [`backend/modules/default-page/index.js`](https://github.com/apostrophecms/starter-kit-astro-essentials/blob/main/backend/modules/default-page/index.js)

For a reference overview of the starter kit's patterns, including image helpers, see the [Astro Essentials starter guide](/guide/astro-essentials-overview.html).

## Next steps

Your project runs, and you know how a page gets from ApostropheCMS to the browser. In the [next chapter](/tutorials/astro/site-chrome.html), you'll give the site its chrome: global settings, a header with navigation, a footer, and breadcrumbs.
