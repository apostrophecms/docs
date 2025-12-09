---
title: "Creating Pages"
detailHeading: "Astro"
url: "/tutorials/astro/creating-pages.html"
content: "ApostropheCMS and Astro handle page routing and content through a unified dynamic route system. Learn how to structure your pages, work with slots, and create custom page templates for your site."
tags:
  topic: "Core Concepts"
  type: astro
  effort: beginner
order: 3
excludeFromFilters: true
videoList:
  - id: 'lKJkXomBa4U'
    title: 'Introducing Page-types'
    link: '#building-pages-in-apostrophecms-astro'
  - id: 'AlWPERA3E1w'
    title: 'Creating Pages'
    link: '#implementing-a-default-page'
  - id: 'grvZKHb35BQ'
    title: 'Creating Piece Pages'
    link: '#implementing-piece-pages'
---
# Building Pages in ApostropheCMS + Astro
This section will give you an idea of the basics of page creation, but it only scratches the surface of using Astro components for templating. We encourage you to look at the excellent [Astro documentation](https://docs.astro.build/en/basics/astro-pages/#astro-pages).

::: tip Watch & Learn! 🎥
This tutorial is available in both text and video formats. The videos cover the key highlights, while this page provides additional details and references. Watch the videos for a guided introduction, then read on for deeper insights!
:::

<iframe width="560" height="315" src="https://www.youtube.com/embed/lKJkXomBa4U?si=Nw5i3RYStlXmOZl-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Understanding Astro Page Structure
If you're coming from ApostropheCMS, Astro's page structure might look quite different from what you're used to. Let's break down the key components of an Astro page:

**Frontmatter Scripts**
Astro pages begin with a frontmatter section enclosed by triple dashes (---). This section contains JavaScript that runs during server-side rendering:

```astro
---
// This is the frontmatter section
import AposArea from '@apostrophecms/apostrophe-astro/components/AposArea.astro';

// Props are available in Astro.props
const { page, user } = Astro.props.aposData;

// You can run any server-side JavaScript here
const formattedDate = new Date().toLocaleDateString();
---
```

The frontmatter is where you:

- Import components and utilities
- Access data passed as props
- Run server-side computations
- Define variables used in your template

**Template Section**
After the frontmatter comes the template section, which contains your HTML markup and component usage:

```astro
<section class="main-content">
  <h1>{page.title}</h1>
  <AposArea area={page.main} />
</section>
```
The template section supports:

- HTML markup
- Dynamic expressions in curly braces
- Component usage from various frameworks (like Vue or React)
- Conditional rendering and loops

**Styles & Scripts**
Astro components can include scoped styles, global styles, and client-side scripts with a number of options for rendering. Consult the documentation for [styling](https://docs.astro.build/en/guides/styling/) and [adding scripts](https://docs.astro.build/en/guides/client-side-scripts/) for additional details.

```html
<style>
  /* These styles only affect this component */
  .main-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
</style>

<script>
  // This JavaScript runs in the browser after the component loads
  const element = document.querySelector('.my-element');
  element.addEventListener('click', () => {
    // Handle interaction
  });
</script>
```
Unlike the frontmatter section which runs during server-side rendering, code in the `<script>` tag runs client-side. Astro deduplicates script tags from the same component, ensuring each script only appears once in the final HTML, regardless of how many component instances exist on the page. The script executes once when loaded by the browser (after the DOM is ready), so you don't need a `DOMContentLoaded` listener. If your component appears multiple times, your script should use DOM queries to find and initialize all instances. Some widgets that interact with the ApostropheCMS admin UI may require additional initialization strategies, which we'll cover in the widgets section.

Now that we understand Astro's structure, let's look at how pages work in an ApostropheCMS + Astro project.

## Understanding Route Handling

In this hybrid setup, all page routing is handled through a single dynamic route file: `[...slug].astro`. This file acts as the central bridge between ApostropheCMS's content management and Astro's rendering system. While Astro projects typically have multiple page files for different routes, our setup leverages ApostropheCMS's routing capabilities, with the `[...slug].astro` file determining how that content gets rendered.

<AposCodeBlock>

```astro
---
import aposPageFetch from '@apostrophecms/apostrophe-astro/lib/aposPageFetch.js';
import AposLayout from '@apostrophecms/apostrophe-astro/components/layouts/AposLayout.astro';
import AposTemplate from '@apostrophecms/apostrophe-astro/components/AposTemplate.astro';

const aposData = await aposPageFetch(Astro.request);
const bodyClass = `myclass`;
---
<AposLayout title={aposData.page?.title} {aposData} {bodyClass}>
    <Fragment slot="standardHead">
      <meta name="description" content={aposData.page?.seoDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charset="UTF-8" />
    </Fragment>
    <AposTemplate {aposData} slot="main" />
</AposLayout>
```
  <template v-slot:caption>
    frontend/src/pages/[...slug].astro
  </template>
</AposCodeBlock>

Let's do a walkthrough of the relevant sections of code:

``` javascript
import aposPageFetch from '@apostrophecms/apostrophe-astro/lib/aposPageFetch.js';
import AposLayout from '@apostrophecms/apostrophe-astro/components/layouts/AposLayout.astro';
import AposTemplate from '@apostrophecms/apostrophe-astro/components/AposTemplate.astro';
```
There are several imports in the slug file frontmatter. The `aposPageFetch` function retrieves content from ApostropheCMS for the current URL. The `AposLayout` component provides a comprehensive set of slots for customizing your page structure. Unlike a traditional ApostropheCMS project where page templates have direct access to the named slots, here only the slug file does. These slots are defined in the `apostrophe-astro` extension and provide specific insertion points throughout your core HTML document:

**Head Section Slots**

- `startHead`: For elements that need to be at the very beginning of the `<head>`, such as character encoding or early-loading scripts
- `standardHead`: For typical meta tags, title, and standard head content
- `extraHead`: For additional head content that should be loaded last, like page-specific styles or scripts

**Body Section Slots**

- `startBody`: Content immediately after the opening `<body>` tag - not part of the refresh zone in edit mode
- `beforeMain`: Content before the main content area - part of the refresh zone in edit mode
- `main`: The primary content area - part of the refresh zone in edit mode
- `afterMain`: Content after the main content area - part of the refresh zone in edit mode
- `endBody`: Content at the end of the `<body>` - not part of the refresh zone in edit mode

Here is the layout that is delivered when no user is logged in:

<AposCodeBlock>

```astro
---
const { title, bodyClass, lang } = Astro.props;
---

<!DOCTYPE html>
<html lang={ lang }>
  <head>
    <slot name="startHead" />
    <title>{ title }</title>
    <slot name="standardHead" />
    <slot name="extraHead" />
  </head>
  <body class={ bodyClass }>
    <slot name="startBody" />
    <slot name="beforeMain" />
    <slot name="main" />
    <slot name="afterMain" />
    <slot name="endBody" />
  </body>
</html>
```
  <template v-slot:caption>
    apostrophe-astro/components/layouts/AposRunLayout.astro
  </template>
</AposCodeBlock>

The `AposLayout` component can also take props for the page title and body classes, in addition to page language for localization. It also takes care of wrapping the body content to allow for in-context editing and content addition when there is a user that is logged in.

Finally, the `AposTemplate` selects the correct template from the mapping index based on the name of the template that ApostropheCMS is requesting and places it in the `main` slot.

```javascript
const aposData = await aposPageFetch(Astro.request);
```
Next up, we use the `aposPageFetch` helper function we imported to populate `aposData` with the information being returned from the ApostropheCMS request query. This data is passed to out `AposTemplate` component as a standard Astro prop.

The rest of the code in this file just uses the components to create content that will be displayed on all pages in your project, plus the imported `AposTemplate` to add the selected template to the `main` slot.

The full `[...slug].astro` file in the Apollo theme also handles 404 errors and the addition of a common header and footer component, since we will want these on all our pages. You can look at this file to see how we handle this content.

## Template Slot Limitations

When working with an ApostropheCMS-Astro project, it's important to understand how template content and slots work:

1. Individual page templates (like `HomePage.astro` or `DefaultPage.astro`) can only render content within the `main` slot because the `AposTemplate` component is specifically placed in the `main` slot in your `[...slug].astro` file:

```astro
<AposTemplate {aposData} slot="main" />
```

1. Content that needs to appear in other slots (like `startHead`, `standardHead`, `beforeMain`, etc.) must be defined in your `[...slug].astro` file.

## Customization Strategies

There are several approaches to customizing your pages in an ApostropheCMS and Astro project. The Apollo template uses the simplest and most straightforward approach: adding site-wide elements directly in the `[...slug].astro` file:

<AposCodeBlock>

```astro
---
import SiteHeader from '../components/SiteHeader.astro';
import SiteFooter from '../components/SiteFooter.astro';
---
<AposLayout title={aposData.page?.title} {aposData} {bodyClass}>
    <Fragment slot="standardHead">
      <meta name="description" content={aposData.page?.seoDescription} />
      <link rel="stylesheet" href="/styles/global.css" />
    </Fragment>

    <Fragment slot="beforeMain">
      <SiteHeader />
    </Fragment>

    <AposTemplate {aposData} slot="main" />

    <Fragment slot="afterMain">
      <SiteFooter />
    </Fragment>
</AposLayout>
```
  <template v-slot:caption>
    frontend/src/pages/[...slug].astro
  </template>
</AposCodeBlock>

While this is the approach used in Apollo, there are other valid strategies you might consider. You could use conditional rendering based on page types - for example, showing different components or styles on your home page versus other pages.
 In your `[...slug].astro` page:

<AposCodeBlock>

```astro
<Fragment slot="standardHead">
  <meta name="description" content={aposData.page?.seoDescription} />
  {isHomePage && <link rel="stylesheet" href="/styles/home.css" />}
</Fragment>
```
<template v-slot:caption>
backend/src/pages/[...slug].astro
</template>
</AposCodeBlock>

And in your `HomePage.astro` template:

<AposCodeBlock>

```astro
----
// imports and other code

const isHomePage = aposData.page?.type === '@apostrophecms/home-page';
---
```
<template v-slot:caption>
backend/src/templates/HomePage.astro
</template>
</AposCodeBlock>

Adding this check to the frontmatter of your HomePage template will check the type of page data being supplied by the backend (ApostropheCMS). This will set the `isHomePage` variable and in turn conditionally determine the addition of the extra styling.

Another approach is to pass custom props through to your page templates, allowing for more dynamic customization of how each template renders.

<AposCodeBlock>

```astro
---
const customProps = {
  showSidebar: aposData.page?.type === 'default-page',
  theme: aposData.page?.type === '@apostrophecms/home-page' ? 'dark' : 'light'
};
---
<AposTemplate {aposData} slot="main" {...customProps} />
```
<template v-slot:caption>
frontend/src/pages/[...slug].astro
</template>
</AposCodeBlock>

<AposCodeBlock>

```astro
---
const { showSidebar, theme } = Astro.props;
---
<div class={`page-content theme-${theme}`}>
  {showSidebar && <Sidebar />}
  <main>
    <!-- Page content here -->
  </main>
</div>
```
<template v-slot:caption>
frontend/src/templates/DefaultPage.astro
</template>
</AposCodeBlock>

Each of these strategies serves different needs in your site architecture. The first option provides a clean way to manage global elements, the second allows for page-specific customizations, and the third offers deep template customization through props. You can mix and match these approaches based on your specific requirements - for instance, using global elements for your header and footer while employing props for page-specific customizations.

While there are many ways to organize your templates and slots, the key is to use component composition effectively. Breaking down slot management into reusable components makes your code more maintainable and easier to test. Choose the approach that best fits your project's needs, whether that's organizing slots in the main layout file or creating dedicated components for different sections of your site.

### Understanding Edit Mode Implications

Remember that content in different slots behaves differently in edit mode:

- Content in `beforeMain`, `main`, `afterMain` and `endBody` slots refreshes when content is updated
- Content in head slots and `startBody` remains static until full page reload
- Consider these behaviors when deciding where to place dynamic content

This slot system provides a structured way to organize your site's content while maintaining the benefits of the in-context editing capabilities of ApostropheCMS.

## Implementing a Default Page

Now let's look at a simple default page type that can be used for basic content pages. This requires configuration in both the backend (ApostropheCMS) and frontend (Astro).

<iframe width="560" height="315" src="https://www.youtube.com/embed/AlWPERA3E1w?si=sm7zo2cn3AQ6yEMA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Backend Configuration

The backend ApostropheCMS module defines the page type's structure and available content areas.

::: info
The Apollo project uses ECMAScript modules (ESM) syntax in the ApostropheCMS backend code rather than CommonJS (CJS). This aligns with modern JavaScript practices and is the recommended approach for new ApostropheCMS projects. You don't have to follow this pattern, but keep in mind the entire backend project must be written with 100% ESM or 100% CommonJS.
:::

<AposCodeBlock>

```javascript
import { getWidgetGroups } from '../../lib/helpers/area-widgets.js';

export default {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'Default Page'
  },
  fields: {
    add: {
      main: {
        type: 'area',
        options: getWidgetGroups({
          includeLayouts: true
        })
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [
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

This setup is exactly what you would see in a standard ApostropheCMS project without an Astro frontend. It extends the core page type and creates a main content area that accepts various widgets. In the case of the Apollo theme, we have created a `backend/lib/helpers/area-widgets.js` helper that allows for easy addition of widgets to areas. You can check out this file to see how we do this, but this helper function allows the developer to pass the `includeLayouts` property to determine if the area should contain just the content widgets, like the rich-text and image widgets, or also include the layout widgets. The `group` property places this `main` schema field onto the basics tab. You can read more about creating pages in the main [ApostropheCMS documentation](/guide/pages.html).

Next, we need to add the page to the `backend/app.js` file.

<AposCodeBlock>

```javascript
import apostrophe from 'apostrophe';

export default apostrophe({
  root: import.meta,
  shortName: 'apollo',
  modules: {
    // ... other modules
    'default-page': {}
  }
});
```
<template v-slot:caption>
backend/app.js
</template>
</AposCodeBlock>

Finally, we need to register the page so that it shows up as a page type for the content manager to select from the page creation modal. This is accomplished by adding it to the `types` array in the `backend/modules/@apostrophecms/page/index.js` file:

<AposCodeBlock>

```javascript
export default {
  options: {
    builders: {
      children: true,
      ancestors: {
        children: {
          depth: 2,
          relationships: false
        }
      }
    },
    types: [
      {
        name: '@apostrophecms/home-page',
        label: 'Home'
      },
      {
        name: 'default-page',
        label: 'Default'
      }
    ]
  }
};
```
<template v-slot:caption>
backend/modules/@apostrophecms/page/index.js
</template>
</AposCodeBlock>

In this case, our `default-page` module is at the project-level, so we don't prefix it with `@apostrophecms/`.

### Frontend Template

Next, we need a frontend (Astro) template to render the page. Instead of creating pages in the `src/pages` directory, we create them in the `src/templates` directory. These templates correspond to your ApostropheCMS page types.

<AposCodeBlock>

```astro
---
import AposArea from '@apostrophecms/apostrophe-astro/components/AposArea.astro';
const { page, user, query } = Astro.props.aposData;
const { main } = page;
---
<section class="main-content astro-default-content">
  <AposArea area={main} />
</section>
```
  <template v-slot:caption>
    frontend/src/templates/DefaultPage.astro
  </template>
</AposCodeBlock>

While simple, this template demonstrates several important concepts. First, it shows how to access the data passed from the ApostropheCMS backend through the `aposData` prop. While we are only using the `page` data in this template, there is additional data available to us.

Common data properties for page templates include:

```javascript
const {
  page,      // The current page document
  piece,     // Current piece (for show pages)
  pieces,    // Array of pieces (for index pages)
  user,      // Current user info
  query,     // URL query parameters
  global     // Global document
} = Astro.props.aposData;
```

Second, it shows the import of the `AposArea` component that is used to easily output each user-edited area's widget content to the page. Here, we are passing in the contents of the `main` schema field that we set up in the ApostropheCMS schema field as the `area` prop.

::: info
You can pass any number of props to the `AposArea` component besides the required `area` named prop. You just need to have your widget template destructure those props from the `Astro.props` to use them. This is shown with the implementation of the core `ImageWidget.astro` component and the author piece image in the `backend/src/layouts/article-layouts/HeroGrid.astro` template.
:::

### Template Mapping

To connect the backend (ApostropheCMS) and frontend (Astro), we need to map the page type to its template:

<AposCodeBlock>

```javascript
import HomePage from './HomePage.astro';
import DefaultPage from './DefaultPage.astro';

const templateComponents = {
  '@apostrophecms/home-page': HomePage,
  'default-page': DefaultPage

  // other page type mappings...
};

export default templateComponents;
};
```
  <template v-slot:caption>
    frontend/src/templates/index.js
  </template>
</AposCodeBlock>

## Implementing Piece Pages

<iframe width="560" height="315" src="https://www.youtube.com/embed/grvZKHb35BQ?si=PstzMnL5mklc1zYq" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

While standard pages have a straightforward one-to-one mapping between ApostropheCMS page types and Astro templates, piece pages require a different approach. A single piece page type in ApostropheCMS typically needs two different templates:

1. An **index template** that displays a list of pieces (like a blog listing page)
2. A **show template** that displays a single piece (like an individual blog post)

In a standard ApostropheCMS project, this would be accomplished by adding `index.html` and `show.html` templates to the `views` folder of your piece page module.

## Template Mapping for Piece Pages

To handle this, the template mapping uses a suffix notation with `:index` and `:show` to specify which template handles which view:

<AposCodeBlock>

```javascript
// other template imports
import ArticleIndexPage from './ArticleIndexPage.astro';
import ArticleShowPage from './ArticleShowPage.astro';

export default {
  // Standard pages
  '@apostrophecms/home-page': HomePage,
  'default-page': DefaultPage,
  // Piece pages with suffixes
  'article-page:index': ArticleIndexPage,
  'article-page:show': ArticleShowPage
};
```
<template v-slot:caption>
frontend/src/templates/index.js
</template>
</AposCodeBlock>

## Handling Index Pages

Index templates need to handle not just the display of multiple pieces, but also pagination and filtering. We will cover this in greater depth, along with options that can be passed to your piece page type when we cover pieces. As a first glance, ApostropheCMS provides extra data to these types of pages through the `aposData` prop:

<AposCodeBlock>

```astro
---
const {
  pieces,      // Array of pieces for current page
  totalPages,  // Total number of pages
  currentPage, // Current page number
  query        // URL query parameters
} = Astro.props.aposData;
---

<div class="article-listing">
  {pieces.map(article => (
    <article>
      <h2><a href={article._url}>{article.title}</a></h2>
      <!-- Additional article preview content -->
    </article>
  ))}
</div>
```
<template v-slot:caption>
frontend/src/templates/ArticleIndexPage.astro
</template>
</AposCodeBlock>

The template uses Astro's curly brace syntax for dynamic content. Inside these braces, you can write JavaScript expressions, including array methods like map().
This code:

1. Takes the pieces array provided by ApostropheCMS
2. Uses map() to loop through each article
3. Creates an `<article>` element for each piece
4. Uses curly braces to insert the article's URL and title into the HTML

The curly braces tell Astro to evaluate the JavaScript expression inside and insert the result into the HTML. This is similar to other template systems like <span v-pre>`{{ }}`</span> in Vue or `<%= %>` in EJS, but with native JavaScript syntax.

We can use the pagination data passed into our piece page to create our own pagination, but as we will cover in the section on pieces, we can also use a helper component from the `apostrophe-astro` extension.

## Show Templates for Individual Pieces

Show templates receive the individual piece through the `piece` property of `aposData`:

<AposCodeBlock>

```astro
---
const { piece: article } = Astro.props.aposData;
---

<article>
  <h1>{article.title}</h1>
  <AposArea area={article.main} />

  <!-- Example of accessing relationships -->
  {article._author?.[0] && (
    <div class="author-info">
      <h2>About the Author</h2>
      <p>{article._author[0].title}</p>
    </div>
  )}
</article>
```
<template v-slot:caption>
frontend/src/templates/ArticleShowPage.astro
</template>
</AposCodeBlock>

### URL Generation

Note that piece documents include a `_url` property that provides the correct URL for viewing that piece. Always use this property rather than constructing URLs manually, as it handles:
- The correct base URL for your site
- Any configured URL prefixes
- Localization prefixes if your site is multilingual
- Special parameters needed for draft preview mode

## Common Page Patterns

### Working with Query Parameters
When building interactive pages, you'll often need to work with query parameters for features like pagination, filtering, or search. The `apostrophe-astro` package provides the `aposSetQueryParameter` helper to safely manage URL parameters while preserving ApostropheCMS's admin UI parameters:

```astro
---
import setParameter from '@apostrophecms/apostrophe-astro/lib/aposSetQueryParameter.js';

// Add or update a parameter
const filterUrl = setParameter(Astro.url, 'category', 'news');

// Remove a parameter by passing empty string
const clearFilter = setParameter(Astro.url, 'category', '');
---
```

#### Accessing Global Data
ApostropheCMS provides a global document for site-wide settings and content. This is configured in your backend through the `@apostrophecms/global` module:

<AposCodeBlock>

```javascript
export default {
  fields: {
    add: {
      // Simple fields
      siteTitle: {
        type: 'string',
        label: 'Site Title'
      },
      footerText: {
        type: 'string',
        label: 'Footer Text',
        textarea: true
      },
      // Areas for widgets
      footer: {
        type: 'area',
        label: 'Footer Content',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {},
            '@apostrophecms/image': {}
          }
        }
      },
      socialLinks: {
        type: 'array',
        label: 'Social Media Links',
        fields: {
          add: {
            platform: {
              type: 'select',
              label: 'Platform',
              choices: [
                { label: 'Twitter', value: 'twitter' },
                { label: 'LinkedIn', value: 'linkedin' }
              ]
            },
            url: {
              type: 'url',
              label: 'URL'
            }
          }
        }
      }
    },
    group: {
      basics: {
        label: 'Site Settings',
        fields: ['siteTitle', 'footerText']
      },
      footer: {
        label: 'Footer',
        fields: ['footer', 'socialLinks']
      }
    }
  }
};
```
<template v-slot:caption>
backend/modules/@apostrophecms/global/index.js
</template>
</AposCodeBlock>

The global data is then available in any Astro template through the `aposData` prop. This also means that you should use relationships sparingly in the global document. Remember they must be loaded on every page view.

```astro
---
const { global } = Astro.props.aposData;
---
// Using simple fields
<h1>{global.siteTitle}</h1>

// Using areas
<footer>
  <div class="footer-content">
    <AposArea area={global.footer} />
  </div>
  
  // Using array fields
  <div class="social-links">
    {global.socialLinks?.map(link => (
      <a href={link.url} class={`icon-${link.platform}`}>
        {link.platform}
      </a>
    ))}
  </div>
</footer>
```

The global document is perfect for content that needs to appear across your site, such as:
- Header and footer content
- Site-wide navigation
- Social media links
- Company contact information
- Default SEO metadata
- Branding assets like logos

Unlike page content, global fields are edited through the admin bar's "Global" menu item rather than on the page itself.

### Page Layouts
While every page type could define its own complete structure, it's often useful to create reusable layouts. The Apollo theme demonstrates several approaches to layouts:

- Layout selection through the admin UI (see the home page's three layouts)
- Shared components for common elements like headers and footers
- Content-specific layouts (see the article index and show page layouts)

For detailed examples of these patterns in action, explore the Apollo theme's source code, particularly:
- The home page implementation with its three layout options
- The article page layouts in `frontend/src/layouts/article-layouts/`
- The global header and footer components

With our understanding of how pages work in an ApostropheCMS + Astro project, we can now turn our attention to another crucial component: widgets. These modular building blocks provide the actual content and functionality within your page areas, and mastering their creation is essential for building flexible, editor-friendly websites.