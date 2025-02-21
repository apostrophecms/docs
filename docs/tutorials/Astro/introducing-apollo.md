# Introducing Apollo

## Introduction

Many of the tutorials in this section explore the integration of ApostropheCMS with Astro, using the [Apollo project](https://github.com/apostrophecms/apollo) as a working example. While Apollo provides an opinionated, production-ready setup, the principles and patterns covered here apply to any ApostropheCMS-Astro integration, regardless of your preferred frontend framework or styling approach. These tutorials are not aimed at being a comprehensive dissection of the entire Apollo codebase, but rather a high level introduction to using Astro as a frontend for ApostropheCMS.

### Learning Through Apollo

We'll use the [`Apollo`](https://github.com/apostrophecms/apollo) project to demonstrate the basic concepts of hybrid project development, and the overall codebase can be used as examples for topics not covered by this tutorial. Apollo includes:
- A complete project structure demonstrating proper separation of concerns
- Examples of page types, pieces, and widgets showing integration patterns
- Setup of global content and styling (headers, footers, logos, etc.) alongside page-specific configurations
- Theme system showcasing content management approaches
- Helper functions for image handling, including URL generation and responsive sizing

Throughout our tutorials, we'll highlight which patterns are Apollo-specific and which are universal best practices for any ApostropheCMS-Astro integration. Whether you plan to use Apollo as your starting point or build your own integration from scratch, you'll learn how to:
1. Structure your development environment
2. Implement proper template mapping
3. Create effective widget systems
4. Handle routing and data flow
5. Deploy your integrated solution

### Integration with Astro

The [`apostrophe-astro` package](https://github.com/apostrophecms/apostrophe-astro) seamlessly connects ApostropheCMS with Astro, handling all the complex integration work behind the scenes. Once installed in your Astro project, you get:
- Full use of the ApostropheCMS Admin UI with in-context editing
- Zero-configuration content delivery - no need to write any fetch code or API calls
- Automatic routing that matches your ApostropheCMS page tree
- Support for your choice of frontend framework (React, Vue, Svelte, etc.) or Astro's native templating system

The Apollo theme and the more bare bones [`combined-astro-starter-kit`](https://github.com/apostrophecms/combined-astro-starter-kit) both include this package as a dependency and provide the necessary `astro.config.mjs` configuration. You can explore additional configuration options in the [package documentation](https://github.com/apostrophecms/apostrophe-astro).

```javascript
// backend/astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import apostrophe from '@apostrophecms/apostrophe-astro';
import path from 'path';

// https://astro.build/config
export default defineConfig({
  viewTransitions: true,
  output: "server",
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4321,
    // Required for some hosting, like Heroku
    // host: true
  },
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [apostrophe({
    aposHost: 'http://localhost:3000',
    widgetsMapping: './src/widgets',
    templatesMapping: './src/templates',
    includeResponseHeaders: [
      'content-security-policy',
      'strict-transport-security',
      'x-frame-options',
      'referrer-policy',
      'cache-control'
    ],
    excludeRequestHeaders: [
      // For hosting on multiple servers, block the host header
      // 'host'
    ]
  })],
  vite: {
    ssr: {
      // Do not externalize the @apostrophecms/apostrophe-astro plugin, we need
      // to be able to use virtual: URLs there
      noExternal: ['@apostrophecms/apostrophe-astro']
    }
  }
});
```
The key parts of this Astro configuration file are the specification of server-side rendering using `output: "server"`, usage of the `node` adapter, and `integration` of the `apostrophe` extension. The `aposHost` setting tells Astro where to find your ApostropheCMS server, defaulting to `localhost:3000` in development. Within the extension configuration, we specify where the template and widget components for mapping to ApostropheCMS documents should be located - we'll cover this mapping system in detail later. We also configure which headers should be passed between the servers: `includeResponseHeaders` preserves important security and caching headers from ApostropheCMS responses, while `excludeRequestHeaders` lets you block specific headers from being forwarded (useful when hosting the frontend and backend on different servers where the host header might cause conflicts). Finally, the `vite.ssr.noExternal` setting ensures the integration can properly handle virtual URLs during server-side rendering.

## Development Environment Set Up

Before diving into the ApostropheCMS and Astro integration, let's set up your development environment. The requirements for ApostropheCMS and Astro largely overlap, so you can look at our [ApostropheCMS guides to setting up your environment](/guide/development-setup.html).

### Prerequisites
  > [!IMPORTANT]
  > **Windows Users**: Please install WSL2 (Windows Subsystem for Linux 2)
  > - Required for ALL Windows development with ApostropheCMS
  > - Ensures consistent behavior with image processing and file system operations
  > - Follow our [Windows Development Guide](/cookbook/windows-development.html)
  > - All prerequisites should be installed from within WSL2

1. **Node.js**: Version 18 or higher required
   ```bash
   node --version  # Should be >= 18.0.0
   ```

2. **MongoDB**: Three options for setup (see our [Development Set Up Guide](/guide/development-setup.html) for details):

   a. **MongoDB Community Server**: Install from [mongodb.com](https://www.mongodb.com/try/download/community) following the instructions for your specific OS

   b. **MongoDB Atlas**: Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

    c. **Docker/Podman Container**
   - Install Docker/Podman first
   - Then set up the MongoDB container following the instructions in the [mongodb-container repo readme](https://github.com/BoDonkey/mongodb-container/blob/main/README.md). In brief:
     ```bash
     git clone https://github.com/BoDonkey/mongodb-container
     cd mongodb-container
     ./start-mongo.sh
     ```

   >[!IMPORTANT]
   >No matter the method chosen, your MongoDB instance needs to be available when you load in the starter content or create your admin user.

### Project Structure

The Apollo project uses a monorepo structure that contains the code for both the ApostropheCMS backend and Astro frontend:

```
apollo/
├── backend/         # ApostropheCMS codebase
├── frontend/        # Astro codebase
└── package.json     # Root-level dependencies and scripts
```

### Initial Setup

1. Clone the Apollo repository - optionally you can give your project a custom name, but note, you will also need to [change the ApostropheCMS shortname](/guide/development-setup.html#if-you-don-t-want-to-use-the-cli-or-if-you-want-to-see-other-things-it-does-for-you-continue-on) in the `app.js` file if you want your database name to match:
    ```bash
    git clone https://github.com/apostrophecms/apollo
    cd apollo
    ```
    or
    ```bash
    git clone https://github.com/apostrophecms/apollo <my-project>
    cd <my-project>
    ```

2. Install all dependencies:
    ```bash
    npm install  # This triggers install for both frontend and backend
    ```

3. Load starter content and set admin password (*optional*):
    ```bash
    npm run load-starter-content
    ```
    If you prefer not to load the starter content, you should still create an initial admin user:
    ```bash
    cd backend
    node app @apostrophecms/user:add admin admin
    ```

### Environment Configuration

The ApostropheCMS backend and Astro frontend development servers must be started in separate terminal instances. Ensure that the necessary environment variables are set for each before launching.

**For your ApostropheCMS project:**
```bash
cd backend
export APOS_EXTERNAL_FRONT_KEY=your-secret-key-here

# If you are running MongoDB on the default port,
# no further environment variables needed

# MongoDB Atlas: Use the connection string from Atlas dashboard
export APOS_MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# Local MongoDB on different port:
export APOS_MONGODB_URI=mongodb://localhost:27018
```

For MongoDB Atlas users: Replace `<username>`, `<password>`, `<cluster>`, and `<dbname>` with your actual Atlas connection details found in the Atlas dashboard under "Connect to Database".

**For your Astro project:**
```bash
cd frontend
export APOS_EXTERNAL_FRONT_KEY=your-secret-key-here

# If the ApostropheCMS backend is *not* running on default port
export APOS_HOST=http://localhost:<port>
```
### Starting the Development Servers

1. Start the backend (in one terminal):
```bash
cd backend
npm run dev
```

2. Start the frontend (in another terminal):
```bash
cd frontend
npm run dev
```

Your development environment is now ready with:
- Backend at http://localhost:3000
  - Used for checking the connection to the frontend only
- Frontend at http://localhost:4321
  - Where all your content editing will occur

### Preparing for Production
Before deploying, you may want to test how your Astro frontend behaves in production mode. The development (npm run dev) and preview (npm run preview) modes differ slightly, especially in how they handle SSR, static asset generation, and environment variables.

To build and preview your site before deployment, run:

```bash
cd frontend
npm run build
npm run preview
```
This serves your built project in a production-like environment, helping you catch any issues before deployment.

With our development environment ready, we need to understand some fundamental concepts before we start building. Both ApostropheCMS and Astro bring their own paradigms to web development, and seeing how they work together will be crucial for building effective websites with the Apollo Theme.

## Core concepts

Current ApostropheCMS users are likely already familiar with its core concepts and components. This section covers those fundamentals and will be especially useful for developers coming from Astro or those new to this stack.

That said, even experienced ApostropheCMS developers will find value here — we’re not just reviewing core concepts, but also how they integrate with Astro.

ApostropheCMS provides a structured approach to managing content and design, and understanding these concepts is key because they require implementation on both the backend (ApostropheCMS) and the frontend (Astro). If you're already comfortable with ApostropheCMS, the transition to using Astro as a frontend isn’t a huge leap—you’ll primarily be shifting how you handle templates.

#### Areas
[Areas](/guide/areas-and-widgets.html) are editable regions on your pages where content editors can add and arrange content. In the ApostropheCMS backend, you define what types of content (widgets) can be placed in each area and configure their options. In your Astro frontend templates, these areas are rendered using the `AposArea` component, which maintains the in-context editing capabilities of ApostropheCMS while working within Astro's component system.

Here's how an area is configured in your backend:

```javascript
// backend/modules/@apostrophecms/home-page/index.js
export default {
  fields: {
    add: {
      main: {
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {},
            '@apostrophecms/image': {},
            'row': {}
          }
        }
      }
    }
  }
};
```
This area would allow for content managers to add any number of three different widget types - rich-text, image, and row. You can [read about](/guide/areas-and-widgets.html) additional configuration options, like limiting the number of widgets that can be added, and passing options to the individual widgets.

::: info
Note two things:
  - the widgets are passed into the area options without including the `-widget` suffix
  - widgets that come from the ApostropheCMS core are prefixed with `@apostrophecms/` - this is also true for any other widgets that come from packages in the `node_modules`
:::

And here's how that same area is rendered in your Astro frontend:

```javascript
// frontend/src/templates/HomePage.astro
---
import AposArea from '@apostrophecms/apostrophe-astro/components/AposArea.astro';
const { page } = Astro.props.aposData;
---

<div class="main-content">
  <AposArea area={page.main} />
</div>
```
In this example, the `area` schema field in the ApostropheCMS backend is named `main`. Data from the page is passed into the template through the `aposData` prop. The individual `main` area is then passed to the `AposArea` component through the named `area` prop.

Note that widgets themselves can have areas. For example, the layout widgets in the Apollo theme each have multiple areas for adding content widgets.

#### Page Types
[Page types](/guide/pages.html) are the building blocks that give your ApostropheCMS site structure and flexibility. They allow you to create distinct templates for different content needs - whether that's blog posts, team member profiles, project showcases, or landing pages. Each page type is configured in both your frontend templates and backend modules, working together to define how content is managed and displayed. In the ApostropheCMS backend, you define the schema fields, area configurations, and other settings that determine what content can be managed for that page type. In your Astro frontend, you create corresponding template components that determine how that content is displayed.

For example, a blog post page type might be configured in your backend to capture fields like title, author, publication date, and content areas. The corresponding Astro template would then structure how these fields are presented on the actual webpage, handling both the display of the content and any necessary frontend interactivity.

Pages are managed through ApostropheCMS's page tree interface, which you can access in the admin UI. When creating a new page, you'll select from your available page types using the utility rail (the menu on the right side of the page manager). This selection determines which fields and areas are available for content entry, as well as which Astro template will render the page.

#### Template Mapping
Template mapping is a crucial concept in the ApostropheCMS + Astro integration because it creates the bridge between your backend page types and your frontend templates. When ApostropheCMS serves a page, the frontend `[...slug].astro` needs to know which Astro template should render that content. This mapping is defined in the frontend Astro `src/templates/index.js` file:

<AposCodeBlock>

```javascript
import HomePage from './HomePage.astro';
import DefaultPage from './DefaultPage.astro';
import ArticleIndexPage from './ArticleIndexPage.astro';
import ArticleShowPage from './ArticleShowPage.astro';

export default {
  '@apostrophecms/home-page': HomePage,
  'default-page': DefaultPage,
  'article-page:index': ArticleIndexPage,
  'article-page:show': ArticleShowPage
};
```
  <template v-slot:caption>
    frontend/src/templates/index.js
  </template>
</AposCodeBlock>

This mapping ensures that when someone visits your homepage, Astro knows to use the `HomePage.astro` template to render the content that ApostropheCMS provides.

Page types that come from the ApostropheCMS core are prefixed with `@apostrophecms/` and any page types coming from packages in the `node-modules` folder should be prefixed accordingly.

ApostropheCMS [piece type pages](/guide/piece-pages.html) render an `index` template when viewing the main page of the blog, and a `show` template when viewing a single blog post (a "permalink" page) - these templates are identified by adding the template name following a `:` as a suffix, as shown in the example.

::: info
Note that in a standard ApostropheCMS project the file name for them template of a standard page type is `page.html`. While the non-piece type pages don't have a suffix at the end, by default they are treated as if they have `:page` at the end.
:::

#### Piece Types
[Piece types](/guide/pieces.html) represent reusable content that exists independently of your page hierarchy. Common examples include blog posts, team members, or products. Like page types, they require both backend configuration and frontend templates, but pieces are managed differently from pages.

Pieces are accessed through the admin bar at the top of your site. By default, each piece type gets its own menu item, but you can [customize this](/tutorials/admin-ui.html) to organize related piece types into groups (for example, grouping "Articles" and "Authors" under a "Content" menu). Each piece type has its own manager interface where you can add, edit, and organize your content.

In the backend, you define:
- The schema fields that make up the content structure
- How the pieces can be organized and filtered

In the frontend, you create:
- Templates for displaying individual pieces ("show" pages)
- Templates for displaying lists of pieces ("index" pages)

A blog piece type might have a show template for full articles and an index template for the main blog listing. However, through relationships, these same pieces can appear anywhere on your site - featured posts on your homepage, related articles on other blog posts, or in a "Latest News" widget in your sidebar. This flexibility lets you manage content in one place while displaying it in multiple contexts.

#### Widgets
[Widgets](/guide/core-widgets.html) are the building blocks that editors use to construct content within areas. Unlike pieces or pages, widgets don't exist as standalone content - they are always part of an area field within a page, piece, or another widget. When that parent content is removed, its widgets are removed as well.

Areas appear on the page as editable regions where users can add, remove, and reorder widgets to create their desired layout and content. Each widget type provides a specific content structure and functionality, like rich text editing, image display, or content layout into rows.

Each widget type requires two key components:

1. A backend module that defines:
   - The widget's schema fields
   - Any server-side functionality
   - Configuration options

2. An Astro component that determines:
   - How the widget renders on the frontend
   - Any client-side interactivity

For example, a testimonial widget might look like this in the backend:

```javascript
// backend/modules/testimonial-widget/index.js
export default {
  extend: '@apostrophecms/widget-type',
  fields: {
    add: {
      quote: {
        type: 'string',
        textarea: true
      },
      author: {
        type: 'string'
      }
    }
  }
};
```

And have a corresponding frontend component:

```javascript
//frontend/src/widgets/TestimonialWidget.astro
---
const { widget } = Astro.props;
---

<div class="testimonial">
  <blockquote>{widget.quote}</blockquote>
  <cite>{widget.author}</cite>
</div>
```

Any added widget needs to be mapped in your frontend's `widgets/index.js` file, similar to how templates are mapped:

```javascript
// frontend/src/widgets/index.js
import TestimonialWidget from './TestimonialWidget.astro';
import RichTextWidget from './RichTextWidget.astro';

export default {
  'testimonial': TestimonialWidget,
  '@apostrophecms/rich-text': RichTextWidget
};
```

Just like adding widgets to areas, core widgets should be prefixed with `@apostrophecms/`, while project-level widgets are mapped without prefix. The mapping should leave the `-widget` suffix off of the ApostropheCMS widget name.

### Understanding the Development Flow

When developing with ApostropheCMS and Astro, you'll typically follow this pattern:

1. Define your content structure in the backend through ApostropheCMS modules
2. Create corresponding Astro components in the frontend
3. Map these components in the appropriate index.js files
4. Test the integration to ensure the editing experience works smoothly

This dual-sided development approach allows you to leverage the strengths of both systems: ApostropheCMS's robust content management capabilities and Astro's modern frontend development features. The integration layer handles the communication between the two, maintaining features like in-context editing that make ApostropheCMS powerful while allowing you to build your frontend using modern tools and practices.

Now that we understand these core concepts - how content is structured in ApostropheCMS and how it maps to Astro components - we can explore how the Apollo Theme puts them into practice. The theme provides a collection of pre-built components that demonstrate these concepts while giving you a foundation to build upon.

## Introducing the Apollo Theme
The Apollo theme can serve as a starting point for building out your own project, but is also a complete example of how these two systems can be used together to produce a production-ready site.

### Page Types and Layout

The theme provides several page types, each designed to serve different content needs.

#### Home Page
The home page comes with three distinct layouts that showcase different approaches to content presentation:

 - Minimal: A clean layout with the common page header, footer, and a single content area
   - This layout serves as an excellent starting point for landing pages or when you want content to take center stage.
 - Foundation: Adds a hero section above the content area
   - This hero section can feature prominently displayed content, making it ideal for marketing pages or when you need to make a strong first impression.
- Showcase: Includes a slideshow component for featuring multiple content pieces
  - This layout is ideal when you need to feature multiple pieces of content prominently - for example, highlighting different products, showcasing portfolio items, or rotating through key announcements.

It should be noted that while this page is used as the template for the parked home page of your site, you can add additional instances of this page in your site.

#### Default Page
The default page provides a flexible template for general content, inheriting the same header and footer components as the home page, with a main content area that accepts any of the theme's widgets.

#### Article Page
The two article page templates are for displaying the article piece type included with the theme. There is a single page type that is added to the page tree.

When the user first navigates to the page, the `ArticleIndexPage.astro` template lists all the articles. This page can be filtered to display a subset of articles and comes in three different layout options. Depending on the layout, additional areas for widget content are added to the page. This page also acts to demonstrate how to add pagination in your hybrid project.

The user can then select to view individual articles displayed by the `ArticleShowPage.astro`. Again, three different potential layouts can be selected for the display of this content.

### Content Components

The theme includes ten widgets that cover common content needs while demonstrating different aspects of component development. These widgets fall into two main categories: layout and content.

The layout widgets help structure your content in responsive, visually appealing ways. The **Rows** widget creates rows with varying numbers of columns that automatically adjust for different screen sizes. The **Grid Layout** widget provides even more flexibility, allowing you to either select from preconfigured layouts or create custom layouts using CSS grid. These layout components show how complex styling can be abstracted into manageable, reusable pieces.

The content widgets allow content managers to add a wide variety of engaging elements to their pages without needing technical knowledge.

The theme includes three core ApostropheCMS widgets:

- **Rich Text Widget**: Provides formatted text editing with standard controls for headings, tables, lists, links, and text styling
- **Image Widget**: Adds images with support for alt text, cropping, responsive sizing, and focal point control
- **Video Widget**: Embeds videos from services like YouTube and Vimeo

It also includes five custom widgets designed for common content needs:

- **Hero Widget**: Creates customizable hero sections with options for color gradient, image, or video backgrounds
- **Slideshow Widget**: Adds interactive slideshows with customizable transitions and navigation controls
- **Accordion Widget**: Organizes content into collapsible sections for better information hierarchy
- **Card Widget**: Displays content in various card formats with multiple style options
- **Link Widget**: Creates links that can be styled as text or customizable buttons

### Available Piece Types

The theme implements two piece types that demonstrate different aspects of content management. The **article** piece type shows how to structure longer-form content, complete with rich text editing, image management, and metadata handling. As mentioned above, this piece type comes with two page templates. The **author** piece type demonstrates relationship fields, showing how different pieces of content can be connected. There isn't a dedicated page for this piece type. Instead, it is used and displayed within the article piece type.

### Image Helpers
The theme includes several helper functions for working with images, whether they come from relationships or attachment fields. These helpers handle:

- URL generation
- Responsive `srcset` image sets
- Cropped image selection
- Focal point management

We'll cover the usage of these helpers in detail when we look at implementing widgets and piece types.

### Theme Customization

While the Apollo Theme provides a complete website toolbox out of the box, it's designed to be customized. The theme uses [Bulma](https://bulma.io/) as its CSS framework, with variables carefully organized for easy customization. You can adjust colors, typography, spacing, and other design elements by modifying these variables. You can read further about this in the repository README file and in the code comments of the `frontend/src/styles.main.scss` file.

The theme's component structure makes it easy to extend or replace functionality. Each component is self-contained, with clear separation between content structure and presentation. This means you can modify a component's appearance without affecting its content management capabilities, or extend its functionality while maintaining its existing styling.

Now that we understand these core concepts - how content is structured in ApostropheCMS and how it maps to Astro components - we can explore how the Apollo Theme puts them into practice. In the next section, we'll dive into implementing pages and components, starting with how Astro's single dynamic route handles all your ApostropheCMS content and moving through the creation of both simple and complex page templates. We'll see how these concepts come together in real-world examples, with detailed explanations of the code and patterns you'll use in your own projects.