---
title: "Getting Started"
description: "Create an ApostropheCMS + Astro project from the Astro Essentials starter kit, make your first page, learn the core concepts of page types, areas, widgets, and pieces, and trace how a request flows from ApostropheCMS to Astro."
detailHeading: "Astro"
url: "/tutorials/astro/getting-started.html"
content: "Create a project from the Astro Essentials starter kit, run it, and learn the core concepts behind how ApostropheCMS and Astro work together to render each page."
tags:
  topic: "Core Concepts"
  type: astro
  effort: beginner
order: 2
excludeFromFilters: true
---
# Getting Started with ApostropheCMS and Astro

In this chapter you will create the project you'll build on for the rest of the series. You'll start from the [Astro Essentials starter kit](https://github.com/apostrophecms/starter-kit-astro-essentials), run it, and make your first page. Then you'll use that page to learn the core concepts of an ApostropheCMS + Astro project, and follow a single page request from the browser through Astro to ApostropheCMS and back.

By the end of the chapter you'll have:

- An ApostropheCMS + Astro project running on your machine
- An admin account and a first page of your own
- An understanding of page types, areas, widgets, and pieces, and how each one is split between ApostropheCMS and Astro
- A working picture of how the two applications share the work of rendering a page

## What you'll build

Over this series, you'll build the Essentials starter kit up into the [Astro public demo](https://github.com/apostrophecms/astro-public-demo), a complete site with a styled home page, articles and authors, custom widgets, a light and dark mode toggle, and English, French, and German versions that visitors switch between from the header.

<!-- TODO(screenshot): astro-public-demo home page, logged out, desktop width -->

<!-- TODO(screenshot): astro-public-demo article page, logged in with the admin bar visible -->

Each chapter adds one part of the demo to your project. The demo is also a project starter in its own right. If you'd rather start a real project from the finished site, choose **Demo** instead of **Essentials** when you run the installer.

::: tip Exploring the demo alongside the tutorial
To browse the finished site while you work, create a second project with the installer and choose **Demo** as the starting point. Both projects use ports 3000 and 4321, so stop one before you start the other.
:::

## Prerequisites

You need:

- **Node.js 24.** Node 22 works only in its latest releases, because Astro raises its minimum Node 22 version from time to time. If the installer or Astro reports that your Node version is too old, upgrade to Node 24.
- **On Windows, Git Bash or WSL 2.** npm doesn't work out of the box in PowerShell. See the [Windows options in the setup guide](/guide/development-setup.html#overview).

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
6. **Help us improve Apostrophe?** The installer asks whether it can send anonymous usage data: the choices you made in the installer, your operating system, and your Node.js version. It never sends your content or any personal information. For details, see the [telemetry policy](https://apostrophecms.com/telemetry-policy). Choose **See exactly what would be sent** to preview the data first. Choosing **Yes, share anonymous data** helps the ApostropheCMS team improve the installer and starter kits. The installer remembers your answer, so this step appears only the first time you run it.

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

This will create an admin account with the default user name of `admin`.

The `--telemetry=off` flag will prevent your machine from sending anonymous information to Apostrophe about the starter kit selected and your development environment. No identifying information is sent. If this disclosure is okay, you can run the command without this flag.

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

<!-- TODO(screenshot): Essentials starter kit welcome page at localhost:4321, logged out -->

::: info Always work on port 4321
Do all browsing and editing on the Astro address, `http://localhost:4321`. If you open the backend at port 3000, it shows a short message saying that it's a backend for Astro. That's expected.
:::

## Log in and make your first page

1. Go to `http://localhost:4321/login` and log in with the account you created in the installer.
2. Back on the home page, the ApostropheCMS admin bar will appear across the top of the site.
3. Click **Pages** in the admin bar, then **New Page**.
4. Enter the title `About`. In the right-hand column, check that **Type** is set to **Default**.
5. Click **Add Content** in the main area, choose **Rich Text**, and type a sentence.
6. Click **Publish**.

<!-- TODO(screenshot): New Page modal with title "About", Type set to Default, and a rich text widget in the main area -->

ApostropheCMS takes you to the new page at `http://localhost:4321/about`, showing the title as a heading and your text below it.

Now edit that text in context, directly on the page:

1. Click **Edit** in the admin bar.
2. Click the sentence you typed and change it. The rich text toolbar appears while you type.
3. Click **Update** to publish the change. The button says **Update** because the page is already published. On a page that has never been published, it says **Publish**.

<!-- TODO(screenshot): About page in edit mode, rich text widget selected with its toolbar showing -->

You created the page in a modal and then edited its content in context, both on the Astro site with the ApostropheCMS editing UI. The rest of this chapter explains how that works.

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
- `templatesMapping` and `widgetsMapping` point to the folders that hold your page and widget components. The next section shows how they're used.

## Core concepts

Your About page already uses three of the four building blocks of an ApostropheCMS site: it has a **page type**, its content sits in an **area**, and the text you typed is a **widget**. The fourth, **pieces**, holds content that lives outside the page tree.

Each building block has two halves. ApostropheCMS defines what the content is, in a module under `backend/modules`. Astro defines how it looks, in a component under `frontend/src`. A mapping file connects the two.

If you already know ApostropheCMS, the backend halves will be familiar. The new part is how the Astro halves replace Nunjucks templates.

### Page types

A [page type](/guide/pages.html) defines a kind of page: which fields it has and which template renders it. When you created the About page, you chose the **Default** type.

The backend half is a module that extends `@apostrophecms/page-type`:

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

The `label` is what you saw in the **Type** menu. Every page type gets a `title` field automatically. This one adds a `main` field, which you'll look at in the next section.

The Astro half is a template component that receives the page's data as the `aposData` prop:

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

The template mapping connects them. `templates/index.js` maps each page type's name to its Astro component:

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

The key is the backend module name, so the About page's `default-page` type renders with `DefaultPage.astro`. Every page in the page tree, which you open from **Pages** in the admin bar, has a type, and every type needs an entry here.

In the demo, the home page and article pages are page types with their own fields and templates. You'll add page types in the [Creating Pages](/tutorials/astro/creating-pages.html) chapter.

### Areas

An [area](/guide/areas-and-widgets.html) is a field that holds a list of widgets. Editors add, remove, and reorder the widgets, and the area's options control which widget types are allowed. The `main` field in `default-page/index.js` is an area that allows layout, rich text, image, and video widgets.

::: info Two naming rules for widget names
- Widget names in an area's options leave off the `-widget` suffix of the module name. The `@apostrophecms/rich-text-widget` module is listed as `@apostrophecms/rich-text`.
- Widgets that come with ApostropheCMS, or with official ApostropheCMS packages, keep their `@apostrophecms/` prefix. Your own widgets have no prefix.
:::

In the template, the `AposArea` component renders the area:

```astro
<AposArea area={main} />
```

That one line is where both editing experiences you tried come from:

- **In context:** when you're logged in, `AposArea` adds editing controls around each widget, so editors can change content directly on the Astro page.
- **In the modal:** an area is also a field in the page's editor modal, alongside the page's other fields. `default-page/index.js` puts `main` in the **Basics** group with `title`, so it appears on the modal's first tab. That's why you could add content when you created the page.

Widgets can have areas of their own. The layout widget in the Essentials kit, for example, holds columns, and each column is an area for more widgets. In the demo, the home page's area offers layout widgets alongside heroes, cards, and other custom widgets.

### Widgets

A [widget](/guide/core-widgets.html) is one block of content inside an area, such as a paragraph of rich text, an image, or a video. Widgets don't exist on their own. They always belong to an area on a page, a piece, or another widget, and they're deleted with it.

Like page types, each widget type has two halves:

- **A backend module** that extends `@apostrophecms/widget-type` and defines the widget's fields and options. The core widgets, such as rich text, come with ApostropheCMS.
- **An Astro component** in `frontend/src/widgets` that renders the widget.

`AposArea` loops over the widgets in an area and finds a component for each one in `widgets/index.js`, the same way `AposTemplate` finds a page template:

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

The keys follow the same naming rules as area options. The rich text you added is stored as `@apostrophecms/rich-text`, so `RichTextWidget.astro` renders it.

The demo adds its own widgets, including a hero, cards, and buttons. You'll build widgets like these in the [Creating Widgets](/tutorials/astro/creating-widgets.html) chapter.

### Pieces

A [piece](/guide/pieces.html) is content that lives outside the page tree, such as a blog post, a team member, or a product. Each piece type gets its own manager in the admin bar, where editors add and organize pieces of that type.

Pieces have two halves too. The backend module defines the piece type's fields. On the Astro side, a special page type displays the pieces with two templates: `:index` for the list and `:show` for a single piece. You can see this in the template mapping above, where the Essentials kit's blog uses `@apostrophecms/blog-page:index` and `@apostrophecms/blog-page:show`.

Because pieces aren't tied to a single page, the same piece can appear anywhere on the site, such as a featured post on the home page or a list of related articles.

In the demo, articles, authors, and article categories are all piece types. You'll build them in the [Creating Pieces](/tutorials/astro/creating-pieces.html) chapter.

### The pattern

Every building block follows the same steps:

1. Define the content in a backend module.
2. Build an Astro component to render it.
3. Map the component in `templates/index.js` or `widgets/index.js`.

The chapters that follow repeat this pattern for each part of the demo.

## How a page request flows

You've seen the pieces. Now follow the request for your About page from start to finish to see how they fit together.

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

### 4. The mappings render the page

`AposTemplate` reads `aposData.template` and looks it up in the template mapping. The About page's template is `default-page:page`. Regular pages end in `:page`, and `AposTemplate` drops that suffix before looking up the key, which is why the mapping key is just `default-page`.

`DefaultPage.astro` renders the title and passes the `main` area to `AposArea`. `AposArea` looks up each widget in the widget mapping and renders it with its component, adding editing controls when you're logged in. Astro sends the finished HTML back to the browser.

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

At this point your project is running, you know the building blocks of an ApostropheCMS + Astro site, and you've seen how a page gets from ApostropheCMS to the browser. In the [next chapter](/tutorials/astro/site-chrome.html), you'll give the site its chrome: global settings, a header with navigation, a footer, and breadcrumbs.
