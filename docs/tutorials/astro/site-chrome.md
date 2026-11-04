---
title: "Site Chrome"
description: "Add global settings, a header with navigation, a footer, and breadcrumbs to an ApostropheCMS + Astro project, and render them on every page."
detailHeading: "Astro"
url: "/tutorials/astro/site-chrome.html"
content: "Add global settings for the site title and logo, then build the header, navigation, footer, and breadcrumbs that appear on every page."
tags:
  topic: "Core Concepts"
  type: astro
  effort: beginner
order: 3
excludeFromFilters: true
---
# Building the Site Chrome with ApostropheCMS and Astro

A site's chrome is everything that stays the same from page to page: the header with the logo and navigation, the footer, and the breadcrumbs that show where a page sits in the site. In this chapter you add that chrome to the project from [Getting Started](/tutorials/astro/getting-started.html).

By the end of the chapter you'll have:

- Global settings where editors set the site title and logo
- A header whose navigation updates as editors add pages
- A footer and breadcrumbs on every page
- Page titles in the browser tab that include the site title

Start the project with `npm run dev` from the project root if it isn't already running.

::: info Comparing with the demo
Each file in this chapter comes from the [Astro public demo](https://github.com/apostrophecms/astro-public-demo), the site this series builds. The demo's versions also include a locale switcher, translated labels, and a dark mode toggle. You'll add those in the Styling and Localization chapters, so this chapter leaves them out.
:::

## Add global settings

Some content belongs to the whole site rather than to one page, like the site title and logo. ApostropheCMS keeps this content in a single **global** document. Every page request loads it, so it's always available to your templates.

The global document comes from the core `@apostrophecms/global` module. To add fields to it, configure the module in your project. Create this file:

<AposCodeBlock>

```javascript
export default {
  fields: {
    add: {
      siteTitle: {
        label: 'Site Title',
        type: 'string',
        def: 'ApostropheCMS Site'
      },
      _siteLogo: {
        label: 'Site Logo',
        type: 'relationship',
        withType: '@apostrophecms/image',
        max: 1
      }
    },
    group: {
      general: {
        label: 'General',
        fields: [ 'siteTitle', '_siteLogo' ]
      }
    }
  }
};
```
<template v-slot:caption>
  backend/modules/@apostrophecms/global/index.js
</template>
</AposCodeBlock>

- `siteTitle` is a plain text field. Its `def` value is used until an editor changes it.
- `_siteLogo` is a **relationship** to an image in the media library. Relationship field names start with an underscore. `max: 1` limits it to one image.
- `group` puts both fields on a **General** tab in the editing modal.

You don't need to register the module in `app.js`. Core modules are already active, and this file only changes their configuration.

The backend restarts when you save the file. Then set the title and logo:

1. Log in at `http://localhost:4321/login`.
2. In the admin bar, click the gear icon on the right, labeled **Open Global Site Settings**.
3. Enter a **Site Title**.
4. Under **Site Logo**, click **Browse Images** and upload or choose an image. A wide, short logo works best.
5. Save your changes.

Nothing on the site changes yet. The settings are stored, but no template displays them. You'll do that next.

## Put the chrome around every page

Every page passes through the catch-all route, `[...slug].astro`, so that's where the chrome goes. `AposLayout` has named slots for each part of the page:

| Slot | Where it renders |
|---|---|
| `standardHead` | Inside `<head>` |
| `beforeMain` | At the start of `<body>`, before the page content |
| `main` | The page content |
| `afterMain` | After the page content |
| `endBody` | At the end of `<body>` |

The header goes in `beforeMain` and the footer in `afterMain`. When an editor is logged in, `AposLayout` adds the admin bar above all of them.

Update `frontend/src/pages/[...slug].astro`. The changes are the two component imports, the `site-chrome.css` import, the `title` and `siteTitle` constants, the `title` passed to `AposLayout`, and the `SiteHeader` and `SiteFooter` elements:

<AposCodeBlock>

```astro
---
import aposPageFetch from "@apostrophecms/apostrophe-astro/lib/aposPageFetch.js";
import AposLayout from "@apostrophecms/apostrophe-astro/components/layouts/AposLayout.astro";
import AposTemplate from "@apostrophecms/apostrophe-astro/components/AposTemplate.astro";
import SiteHeader from "../components/SiteHeader.astro";
import SiteFooter from "../components/SiteFooter.astro";
import "../styles/app.css";
import "../styles/styles.css";
import "../styles/site-chrome.css";

// aposPageFetch fetches the full page payload from the ApostropheCMS backend for the
// current URL. It returns an object with: `page` (the page document), `piece` (set on
// piece-show routes), `global` (global config), and flags like `redirect` and `notFound`.
// Downstream templates receive this object as `Astro.props.aposData`.
const aposData = await aposPageFetch(Astro.request);
const bodyClass = `myclass`;

const title = aposData.page?.title;
const siteTitle = aposData.global?.siteTitle || "ApostropheCMS Demo";

if (aposData.redirect) {
  return Astro.redirect(aposData.url, aposData.status);
}
if (aposData.notFound) {
  Astro.response.status = 404;
}
---

<AposLayout title={`${title} - ${siteTitle}`} {aposData} {bodyClass}>
  <Fragment slot="standardHead">
    <meta name="description" content={aposData.page?.seoDescription} />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta charset="UTF-8" />
  </Fragment>
  <SiteHeader {aposData} slot="beforeMain" />

  <main slot="main" class="main">
    <AposTemplate {aposData} />
  </main>

  <SiteFooter {aposData} slot="afterMain" />
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

`aposData.global` is the global document, so `siteTitle` is the title an editor set. The browser tab now shows the page title followed by the site title, such as `About - My Site`.

You'll create the two components and the stylesheet in the next sections. Until you do, Astro reports that it can't find them.

## Build the header

Create `frontend/src/components/SiteHeader.astro`:

<AposCodeBlock>

```astro
---
import {
  getAttachmentUrl,
  getWidth,
  getHeight,
} from "@apostrophecms/apostrophe-astro/helpers/universal";

const { aposData } = Astro.props;
const { page, home, global } = aposData;

const logoAttachment = global?._siteLogo?.[0];
const logoUrl = logoAttachment
  ? getAttachmentUrl(logoAttachment, { size: "one-third" })
  : null;
const logoWidth = logoAttachment ? getWidth(logoAttachment) : 100;
const logoHeight = logoAttachment ? getHeight(logoAttachment) : 36;
---

<header class="header">
  <div class="nav-bar">
    <h2>
      <a href="/">
        {
          logoAttachment ? (
            <img
              src={logoUrl}
              alt={global?.siteTitle || "Home"}
              width={logoWidth}
              height={logoHeight}
            />
          ) : (
            global?.siteTitle || "Site Title"
          )
        }
      </a>
    </h2>
    <nav class="nav" role="navigation">
      <ul>
        <li>
          <a
            class={page?.slug === home?.slug ? "active" : ""}
            href={home?._url || "/"}>{home?.title || "Home"}</a
          >
        </li>
        {
          home?._children
            ?.filter((p) => p.visibility === "public")
            .map((navPage) => (
              <li>
                <a
                  class={page?.slug === navPage.slug ? "active" : ""}
                  href={navPage._url}
                >
                  {navPage.title}
                </a>
              </li>
            ))
        }
      </ul>
    </nav>
    <button
      class="nav__mobile-button"
      data-mobile-trigger
      aria-controls="mobile-nav"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-menu-icon lucide-menu"
        ><path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"
        ></path></svg
      >
      <span>Menu</span>
    </button>
  </div>
</header>

<div class="mobile-nav" data-mobile-nav="hidden" aria-hidden="true">
  <button class="mobile-nav__close-trigger" data-mobile-close-trigger>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-x-icon lucide-x"
      ><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg
    >
    <span>Close</span>
  </button>
  <nav id="mobile-nav" class="mobile-nav__nav" role="navigation">
    <ul>
      <li>
        <a
          class={page?.slug === home?.slug ? "active" : ""}
          href={home?._url || "/"}>{home?.title || "Home"}</a
        >
      </li>
      {
        home?._children
          ?.filter((p) => p.visibility === "public")
          .map((navPage) => (
            <li>
              <a
                class={page?.slug === navPage.slug ? "active" : ""}
                href={navPage._url}
              >
                {navPage.title}
              </a>
            </li>
          ))
      }
    </ul>
  </nav>
</div>

<script is:inline>
  (function () {
    // Guard against duplicate initialization
    if (window.__mobileNavInit) return;
    window.__mobileNavInit = true;

    function initMobileNav() {
      const trigger = document.querySelector("[data-mobile-trigger]");
      const closeTrigger = document.querySelector(
        "[data-mobile-close-trigger]",
      );
      const mobileNav = document.querySelector("[data-mobile-nav]");

      if (!trigger || trigger.dataset.initialized) return;
      trigger.dataset.initialized = "true";

      trigger.addEventListener("click", () => {
        mobileNav?.classList.add("active");
        mobileNav?.setAttribute("aria-hidden", "false");
      });

      closeTrigger?.addEventListener("click", () => {
        mobileNav?.classList.remove("active");
        mobileNav?.setAttribute("aria-hidden", "true");
      });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initMobileNav);
    } else {
      initMobileNav();
    }
  })();
</script>
```
<template v-slot:caption>
  frontend/src/components/SiteHeader.astro
</template>
</AposCodeBlock>

The header has three parts.

### The logo

`global._siteLogo` is an array, because relationships can hold more than one document. The header takes the first image and passes it to three helpers from `@apostrophecms/apostrophe-astro`:

- `getAttachmentUrl` returns the URL of the image at a given size. ApostropheCMS stores several sizes of every uploaded image, and `one-third` is wide enough for a logo.
- `getWidth` and `getHeight` return the image's dimensions, so the browser can reserve space for it before it loads.

If no logo is set, the header shows the site title as text.

### The navigation

ApostropheCMS adds `aposData.home` to every page request: the home page, along with its child pages in `_children`. Those children are the top level of the page tree, which makes them the site's main navigation. When an editor adds, removes, or reorders a top-level page in the page tree, the navigation follows.

Each child page has a `visibility` field. The filter keeps only pages set to **Public**, so pages that require a login don't appear in the navigation.

The `active` class marks the link for the current page by comparing slugs.

::: tip Deeper navigation
`_children` holds only one level of pages. For drop-down menus, each ancestor in `page._ancestors` also includes its own `_children`. To load more levels everywhere, set the `builders` option of the [`@apostrophecms/page`](/reference/modules/page.html) module.
:::

### The mobile menu

On narrow screens, the menu button replaces the navigation and opens a full-screen copy of it. The script that does this uses `is:inline`, so Astro adds it to the page as written instead of bundling it. It's small, it runs on every page, and it guards against running twice when ApostropheCMS refreshes the page during editing.

## Build the footer

The demo's footer is a set of link columns beside the ApostropheCMS logo. Most of it is plain HTML, so rather than typing it in, copy it from the demo:

1. Copy [`SiteFooter.astro`](https://github.com/apostrophecms/astro-public-demo/blob/develop/frontend/src/components/SiteFooter.astro) from the demo to `frontend/src/components/SiteFooter.astro`.
2. Delete the frontmatter, everything between the two `---` lines at the top, including the lines themselves. It loads translation helpers you haven't added yet.
3. Change the logo link from `href={basePath("/")}` to `href="/"`.
4. Replace the three column headings with plain text: `Explore ApostropheCMS`, `Product`, and `Social Media`. In the demo they're written as `{__t("footerExplore")}` and so on.
5. Delete everything from `<!-- Light/Dark mode switch -->` to the end of the file. That's the dark mode toggle, which you'll add in the Styling chapter.

The result starts like this, with the logo SVG and the last two columns shortened:

<AposCodeBlock>

```astro
<footer class="footer">
  <div class="footer__section footer__top">
    <div class="footer__column footer__column--logo">
      <a href="/" class="footer__logo">
        <svg ...>
          <!-- ApostropheCMS logo, copied from the demo -->
        </svg>
      </a>
    </div>
    <div class="footer__column">
      <h4>Explore ApostropheCMS</h4>
      <ul>
        <li>
          <a href="http://apostrophecms.com/?utm_source=demo" target="_blank"
            >ApostropheCMS.com</a
          >
        </li>
        <li>
          <a
            href="https://docs.apostrophecms.org/?utm_source=demo"
            target="_blank">ApostropheCMS Docs</a
          >
        </li>
        <li>
          <a
            href="https://docs.apostrophecms.org/guide/development-setup.html?utm_source=demo"
            target="_blank">Getting Started</a
          >
        </li>
        <li>
          <a
            href="https://apostrophecms.com/assembly?utm_source=demo"
            target="_blank">ApostropheCMS Multisite</a
          >
        </li>
        <li>
          <a
            href="https://meetings.hubspot.com/tom-boutell/demo-meeting?utm_source=demo"
            target="_blank">Book a Call</a
          >
        </li>
      </ul>
    </div>
    <!-- Product and Social Media columns, copied from the demo -->
  </div>
</footer>
```
<template v-slot:caption>
  frontend/src/components/SiteFooter.astro
</template>
</AposCodeBlock>

The footer's links are hard-coded, so changing them means changing code. To let editors manage them, you could add a field for them to the global settings, the same way you added the site title.

## Add breadcrumbs

Breadcrumbs show the path from the home page to the current page. ApostropheCMS adds `_ancestors` to every page: the pages above it in the page tree, starting with the home page. That's all a breadcrumb trail needs.

Create `frontend/src/components/Breadcrumbs.astro`:

<AposCodeBlock>

```astro
---
const { page, piece } = Astro.props;
const ancestors = page?._ancestors || [];
const showBreadcrumbs = ancestors.length > 0;
---

{showBreadcrumbs && (
  <div class="layout">
    <nav class="breadcrumb">
      {ancestors.map((ancestorPage) => (
        <a href={ancestorPage._url}>{ancestorPage.title}</a>
      ))}
      <a class={!piece ? 'current-page' : ''} href={page._url}>{page.title}</a>
      {piece && (
        <a class="current-page" href={piece._url}>{piece.title}</a>
      )}
    </nav>
  </div>
)}
```
<template v-slot:caption>
  frontend/src/components/Breadcrumbs.astro
</template>
</AposCodeBlock>

The home page has no ancestors, so the component renders nothing there. The optional `piece` prop adds one more link on pages that display a single piece, such as a blog post. You'll use it in the Pieces chapter.

Unlike the header and footer, breadcrumbs belong inside the page template, between the page and its title. Add them to `frontend/src/templates/DefaultPage.astro`:

<AposCodeBlock>

```astro
---
import AposArea from '@apostrophecms/apostrophe-astro/components/AposArea.astro';
import Breadcrumbs from '../components/Breadcrumbs.astro';
const { page, user, query } = Astro.props.aposData;
const { main } = page;
---

<Breadcrumbs {page} />

<section class="bp-content">
  <h1>{ page.title }</h1>
  <AposArea area={main} />
</section>
```
<template v-slot:caption>
  frontend/src/templates/DefaultPage.astro
</template>
</AposCodeBlock>

## Add basic styles

Without styles, the navigation renders as a bulleted list and the logo SVG in the footer fills the page. Create `frontend/src/styles/site-chrome.css` with enough layout to make the chrome usable:

<AposCodeBlock>

```css
/* Minimal layout for the header, navigation, breadcrumbs, and footer.
   The Styling chapter replaces this file with the demo's SCSS. */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 1rem;
}
.nav-bar h2 {
  margin: 0;
}
.nav ul,
.mobile-nav ul {
  display: flex;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.nav a.active,
.mobile-nav a.active,
.breadcrumb .current-page {
  font-weight: bold;
}
.breadcrumb {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.breadcrumb a + a::before {
  content: "/";
  margin-right: 0.5rem;
}
.nav__mobile-button,
.mobile-nav {
  display: none;
}
@media (max-width: 680px) {
  .nav {
    display: none;
  }
  .nav__mobile-button {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .mobile-nav.active {
    display: block;
    padding: 1rem;
  }
  .mobile-nav ul {
    flex-direction: column;
    gap: 0.75rem;
  }
}
.footer__top {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  max-width: var(--content-max-width);
  margin: 3rem auto 0;
  padding: 2rem 1rem;
  border-top: 1px solid #ddd;
}
.footer__logo svg {
  width: 200px;
  height: auto;
}
.footer__column ul {
  margin: 0;
  padding: 0;
  list-style: none;
  line-height: 1.8;
}
```
<template v-slot:caption>
  frontend/src/styles/site-chrome.css
</template>
</AposCodeBlock>

The catch-all route already imports this file. In the Styling chapter you'll replace it with the demo's complete styles.

## Try it

Reload `http://localhost:4321/about`. The header shows your logo and links to Home and About, with About marked as the current page. The breadcrumbs read Home / About, and the footer sits below the content.

Now watch the chrome follow the page tree:

1. Click **Pages** in the admin bar, then **New Page**.
2. Enter the title `Contact`, make sure **Type** is **Default**, and click **Publish**. Contact appears in the navigation.
3. Create another page titled `Our Team`. Before publishing, set its parent to About: open the page settings, choose **About** under **Parent Page**, then publish. Our Team doesn't appear in the navigation, because it isn't a top-level page. Its breadcrumbs read Home / About / Our Team.
4. Open the Contact page's settings and set **Visibility** to **Login Required**. Contact disappears from the navigation, even while you're logged in, because the header lists only public pages. Set it back to **Public** before you continue.
5. Change the site title in the global settings. The header updates on every page, and so does the browser tab.

Narrow the browser window to below 680 pixels. The navigation is replaced by the **Menu** button, which opens the mobile menu.

## Troubleshooting

**The header shows "Site Title" instead of your title**

`aposData.global` doesn't have a `siteTitle`. Check that the global module file is at `backend/modules/@apostrophecms/global/index.js`, including the `@apostrophecms` folder, and that the backend restarted without errors.

**The logo doesn't appear**

Check that you saved the global settings after choosing the image. The header reads `global._siteLogo`, so the field name must start with an underscore.

**A new page is missing from the navigation**

The navigation lists only published, public, top-level pages. Check the page's parent and **Visibility** in its settings.

**"Could not import ../components/SiteHeader.astro"**

The file is missing or misnamed. Astro file names are case-sensitive.

## Files covered in this chapter

- [`backend/modules/@apostrophecms/global/index.js`](https://github.com/apostrophecms/astro-public-demo/blob/develop/backend/modules/@apostrophecms/global/index.js)
- [`frontend/src/pages/[...slug].astro`](https://github.com/apostrophecms/astro-public-demo/blob/develop/frontend/src/pages/%5B...slug%5D.astro)
- [`frontend/src/components/SiteHeader.astro`](https://github.com/apostrophecms/astro-public-demo/blob/develop/frontend/src/components/SiteHeader.astro)
- [`frontend/src/components/SiteFooter.astro`](https://github.com/apostrophecms/astro-public-demo/blob/develop/frontend/src/components/SiteFooter.astro)
- [`frontend/src/components/Breadcrumbs.astro`](https://github.com/apostrophecms/astro-public-demo/blob/develop/frontend/src/components/Breadcrumbs.astro)

The demo's versions include the localization and dark mode parts this chapter leaves out. `site-chrome.css` isn't in the demo. The Styling chapter replaces it.

## Next steps

Your site has a header, navigation, a footer, and breadcrumbs, all driven by content editors can change. In the next chapter, you'll build the demo's page types and learn how areas and template mapping shape each page.
