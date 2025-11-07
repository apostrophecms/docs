---
title: "Creating Widgets"
detailHeading: "Astro"
url: "/tutorials/astro/creating-widgets.html"
content: "Widgets are the building blocks for your site's content areas. Learn how to create widgets that handle nested content, dynamic layouts, and client-side interactivity in your ApostropheCMS + Astro project."
tags:
  topic: "Core Concepts"
  type: astro
  effort: beginner
order: 4
excludeFromFilters: true
videoList:
  - id: 'JEU2RdgqrIs'
    title: 'Introducing Widgets'
    link: '#creating-widgets-in-apostrophecms-astro'
  - id: 'grhDL8Xo0xE'
    title: 'Simple Widgets'
    link: '#the-apollo-rows-widget'
  - id: 'JEU2RdgqrIs'
    title: 'Widget Interactivity'
    link: '#adding-client-side-interactivity-to-widgets'
---
# Creating Widgets in ApostropheCMS + Astro
Widgets are the fundamental building blocks of content in ApostropheCMS. They allow content editors to change the page layout, add images, or rich text to a page. As we covered in the [Core Concepts](/tutorials/astro/introducing-apollo.html#core-concepts) section of the Apollo introduction, this occurs through the addition of widgets to areas on the page. As we will briefly touch on, Astro also allows developers to reuse widgets as components added directly to the page. To understand widget creation, we will first look at several widgets from the Apollo theme and then create a new widget from scratch.

::: tip Watch & Learn! 🎥
This tutorial is available in both text and video formats. The videos cover the key highlights, while this page provides additional details and references. Watch the videos for a guided introduction, then read on for deeper insights!
:::

This tutorial provides only a brief introduction to widget development in ApostropheCMS, but there's much more to explore. For comprehensive documentation on Apostrophe's field types, query syntax, and advanced widget features, visit the [core ApostropheCMS documentation](https://apostrophecms.com/docs).

<iframe width="560" height="315" src="https://www.youtube.com/embed/tC6vJwqYO8o?si=Inv-0eTcMhbpE-a_" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Understanding Widget Mapping

As with pages, when ApostropheCMS serves content containing widgets, the Astro frontend needs to know which component should render each widget type. This is handled through a mapping configuration defined in your Astro project.

The mapping between ApostropheCMS widget types and Astro components is defined in the `frontend/src/widgets/index.js` file:

<AposCodeBlock>

```javascript
import RichTextWidget from './RichTextWidget.astro';
import ImageWidget from './ImageWidget.astro';
import VideoWidget from './VideoWidget.astro';
import GridLayoutWidget from './GridLayoutWidget.astro';
import AccordionWidget from './AccordionWidget.astro';
import CardWidget from './CardWidget.astro';
import HeroWidget from './HeroWidget.astro';
import LinkWidget from './LinkWidget.astro';
import SlideshowWidget from './SlideshowWidget.astro';
import RowsWidget from './RowsWidget.astro';

const widgetComponents = {
  '@apostrophecms/rich-text': RichTextWidget,
  '@apostrophecms/image': ImageWidget,
  '@apostrophecms/video': VideoWidget,
  'grid-layout': GridLayoutWidget,
  'accordion': AccordionWidget,
  'card': CardWidget,
  'hero': HeroWidget,
  'link': LinkWidget,
  'slideshow': SlideshowWidget,
  'rows': RowsWidget
};

export default widgetComponents;
```
<template v-slot:caption>
frontend/src/widgets/index.js
</template>
</AposCodeBlock>

This mapping file is referenced in your `astro.config.mjs` through the `apostrophe` integration settings:

```javascript
// astro.config.mjs
integrations: [apostrophe({
  // Other configuration...
  widgetsMapping: './src/widgets',
  // Additional settings...
})],
```
If desired, you could use this configuration setting to specify that the mapping come from a different file.

As with pages, core widgets and widgets added through packages in the node modules are prefixed with the namespace, e.g. `@apostrophecms/widget-name`. Project-level widgets use just the base name. For all the widgets you remove the `-widget` suffix.

## The Apollo Rows Widget
![The rows-widget edit modal](../../images/apollo-rows-widget.png)

In ApostropheCMS, areas provide a flexible way to structure content, making it easy to build dynamic layouts. While areas can be defined at the page level, widgets (and pieces) can also have their own areas, allowing them to act as containers for other widgets. This enables complex, nested layouts.

<iframe width="560" height="315" src="https://www.youtube.com/embed/grhDL8Xo0xE?si=_00W4gmum16Wo3ZG" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

A great example of this is the rows widget in the Apollo project. When added to a page, it lets users configure a set number of column areas based on their chosen layout. Each column can hold any type of widget—including another rows widget—enabling deep nesting when needed. This pattern appears throughout Apollo; for instance, the hero widget uses an area to manage call-to-action buttons while still fitting seamlessly into ApostropheCMS’s editing interface.

By structuring layouts this way, you get the best of both worlds: modular, reusable components and a maintainable codebase. Now, let’s break down how this works under the hood—both on the backend and frontend.

### Backend Implementation
In ApostropheCMS, the rows widget module demonstrates several key concepts for widget development. Let's break down its structure:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Rows Layout',
    icon: 'view-column-icon',
    description: 'Create row and column-based layouts for your content.'
  }
}
```
<template v-slot:caption>
backend/modules/rows-widget
</template>
</AposCodeBlock>

The module extends the base widget type and provides metadata used in the editor interface. The `icon` designates an already [registered icon](/reference/module-api/module-overview.html#icons) that will be displayed in the [widget selection flyout](/guide/areas-and-widgets.html#expanded-widget-preview-menu-configuration). The real complexity comes in the `fields` configuration, where we define both the layout controls and the areas:

<AposCodeBlock>

```javascript
fields: {
  add: {
    columnLayout: {
      type: 'select',
      label: 'Column Layout',
      def: 'single',
      choices: [
        {
          label: 'Single Column',
          value: 'single'
        },
        {
          label: 'Two Equal Columns (50/50)',
          value: 'two-equal'
        }
        // Additional layouts...
      ]
    },
    columnOneContent: {
      type: 'area',
      label: 'First Column',
      options: getWidgetGroups({
        includeLayouts: true,
        exclude: [ 'grid-layout' ]
      })
    },
    // additional area fields
  }
}
```
<template v-slot:caption>
backend/modules/rows-widget
</template>
</AposCodeBlock>

A key feature is the [conditional visibility](/guide/conditional-fields.html#displaying-conditional-fields) of areas based on the selected layout. For example, the second column area only appears when certain layouts are selected:

<AposCodeBlock>

```javascript
columnTwoContent: {
  type: 'area',
  label: 'Second Column',
  options: getWidgetGroups({
    includeLayouts: true,
    exclude: ['grid-layout']
  }),
  if: {
    $or: [
      { columnLayout: 'two-equal' },
      { columnLayout: 'three-equal' },
      { columnLayout: 'four-equal' },
      { columnLayout: 'one-third-two-thirds' },
      { columnLayout: 'two-thirds-one-third' },
      { columnLayout: 'quarter-half-quarter' }
    ]
  }
}
```
<template v-slot:caption>
backend/modules/rows-widget
</template>
</AposCodeBlock>

The `if` condition with `$or` operator is part of ApostropheCMS's MongoDB-style query syntax. It's used throughout Apostrophe for conditional field visibility, permissions, and querying content. Each potential column gets its own uniquely named area, which becomes available for content only when the chosen layout supports it.

The `getWidgetGroups` helper used in the `options` is a utility that transforms a simple configuration into a fully expanded area configuration with organized widget groups. Without this helper, a standard area configuration would look more verbose:

```javascript
columnOneContent: {
  type: 'area',
  label: 'First Column',
  options: {
    widgets: {
      '@apostrophecms/rich-text': {
        toolbar: ['styles', 'bold', 'italic', 'link']
      },
      '@apostrophecms/image': {},
      '@apostrophecms/video': {},
      'hero': {},
      'card': {}
      // Each widget must be individually configured
    }
  }
}
```

The helper centralizes these configurations and organizes widgets into groups, making the code more maintainable. For more details on how this helper works, you can examine the `backend/lib/helpers/area-widgets.js` file in the Apollo project. Using the `getWidgetGroups` helper ensures that each area of the row accepts the same set of widgets, excluding the grid layout to prevent nesting conflicts.

Note that within areas you use the same naming conventions used for mapping. Core widgets get prefixed, and none receive the `-widget` suffix.

### Frontend Implementation in Astro
Just like the page template components, the widget frontend implementation starts with the component frontmatter, where we handle imports, type definitions, and data processing:

<AposCodeBlock>

```astro
---
const { widget } = Astro.props;
import AposArea from '@apostrophecms/apostrophe-astro/components/AposArea.astro';
```
<template v-slot:caption>
frontend/src/widgets/RowsWidget.astro
</template>
</AposCodeBlock>

When a widget is rendered in an area, Astro passes the data from the ApostropheCMS backend through the `widget` prop. The values of these schema fields can then be used in the template as we did with our pages. If the widget also contains any areas, as the rows widget does, we can also import the `AposArea` helper for rendering those additional widgets.

The component then defines configuration objects that map our backend choices to frontend styling:

<AposCodeBlock>

```javascript
const layouts = {
  'two-equal': {
    classes: ['is-12-mobile is-6-tablet', 'is-12-mobile is-6-tablet'],
    areas: ['columnOneContent', 'columnTwoContent']
  },
  'three-equal': {
    classes: ['is-12-mobile is-6-tablet is-4-desktop', 'is-12-mobile is-6-tablet is-4-desktop', 'is-12-mobile is-6-tablet is-4-desktop'],
    areas: ['columnOneContent', 'columnTwoContent', 'columnThreeContent']
  }
  // Additional layouts...
};
```
<template v-slot:caption>
frontend/src/widgets/RowsWidget.astro
</template>
</AposCodeBlock>

These configurations are processed in the frontmatter to generate our final classes:

<AposCodeBlock>

```javascript
const currentLayout = layouts[widget.columnLayout || 'two-equal'];
const columnsClasses = [
  'columns',
  spacingClass,
  verticalAlignClass,
  horizontalAlignClass,
  maxWidth,
  'mx-auto'
].filter(Boolean).join(' ');
```
<template v-slot:caption>
frontend/src/widgets/RowsWidget.astro
</template>
</AposCodeBlock>

::: info
Astro has a built-in directive for creating class lists - [`class:list`](https://docs.astro.build/en/reference/directives-reference/#classlist). This allows for construction of the class list directly in the template instead of the frontmatter.
```astro
<span class:list={['columns', {spacingClass}, {verticalAlignClass}, ['mx-auto'] ]} />
```
Since in many cases we are translating to Bulma classes we created some helper functions and have elected to create our class lists in the frontmatter.
:::

These configurations and processed classes are then used in the template section to create our dynamic layout:

<AposCodeBlock>

```astro
<section
  class="column-layout container is-fluid mb-6"
  role="region"
  aria-label={widget.label || 'Content columns'}
>
  <div class={columnsClasses} role="presentation">
    {currentLayout.areas.map((areaName, index) => (
      widget[areaName] && (
        <div
          class={`column ${currentLayout.classes[index]} editor-column`}
          data-column-index={index + 1}
          role="region"
          aria-label={`Column ${index + 1}`}
        >
          <div class="column-content">
            <AposArea area={widget[areaName]} />
          </div>
        </div>
      )
    ))}
  </div>
</section>
```
<template v-slot:caption>
frontend/src/widgets/RowsWidget.astro
</template>
</AposCodeBlock>

The template demonstrates several key concepts:

1. The `currentLayout.areas` array drives the structure, mapping to our backend area fields
2. Each area is only rendered if it exists in the widget data (`widget[areaName]`)
3. The `AposArea` component renders the nested content, maintaining the widget-within-widget pattern
4. Layout classes are applied dynamically based on the selected configuration

The `AposArea` component is doing the heavy lifting here - it takes our area data and renders any widgets that have been added to that area by content editors. This creates the recursive structure we discussed earlier, where each column can contain its own set of widgets.

The rows widget demonstrates the foundational patterns of widget development in ApostropheCMS and Astro:
- Widget configuration through fields and options in the backend
- Conditional field visibility using Apostrophe's conditional syntax
- Area fields that enable nested widget structures
- Frontend component organization with configuration objects and dynamic templating
- Integration with the `AposArea` component for nested content rendering

Next, let's look at how we can add client-side interactivity to widgets. The video and slideshow widgets offer two different approaches to handling JavaScript in the widget ecosystem.

## Adding Client-Side Interactivity to Widgets
Astro provides several routes for adding JavaScript to the browser. This can take the form of public scripts loaded on every page, `<script>` tags in your components, and the addition of client-side framework components, e.g. Vue or React components. Let's explore the different approaches available for adding client-side interactivity to widgets in the ApostropheCMS + Astro environment, using examples from the Apollo project.

<iframe width="560" height="315" src="https://www.youtube.com/embed/JEU2RdgqrIs?si=reRnkOBt_rTIpXTA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Web Components Approach

Web Components are a great choice for widgets that need to maintain their own state and behavior. The Apollo `VideoWidget` relies on a custom web component to access the ApostropheCMS backend oEmbed endpoint.

::: info
You can add additional routes into your ApostropheCMS backend that can be accessed by client-side fetch operations. If they are prefixed with `/api/v1/` they will be proxied by the `apostrophe-astro` extension. If not, they can be added to the `proxyRoutes` array in the extension configuration within the `astro.config.mjs` file.
:::

Within the widget it passes `title` and `URL` data to this component:

<AposCodeBlock>

```astro
<video-widget
  url={placeholder ? PLACEHOLDER_VIDEO_URL : url}
  title={videoTitle}
>
</video-widget>
```
<template v-slot:caption>
frontend/src/widgets/VideoWidget.astro
</template>
</AposCodeBlock>

In past versions of Astro, JavaScript included in your components through the `<script>` tag was hoisted and initiated as soon as a component was added to the page through dynamic editing. In modern versions of Astro, this is no longer true. If you are generating static pages with Astro, this isn't typically a concern and can make overall bundle size smaller depending on page content. For Apostrophe widget addition however, we want a dynamic editing experience where widget content is available upon in-context addition.

Any scripts added directly to your Astro components are linked inline and only initiated after full page reload. This presents a problem when we initially add our custom `<video-widget>` to the page, because the web component won't exist until the script is run and will therefore throw an error. To get around this limitation, we moved the client-side JavaScript to the `frontend/public/scripts` folder and are loading the component script in the `[...slug].astro` file.

#### Widget Template Structure

First, let's look at how the widget template is structured:

<AposCodeBlock>

```astro
---
const { widget } = Astro.props;
const { video, title } = widget;
const url = video?.url;
const videoTitle = title || 'Video';
const placeholder = widget?.aposPlaceholder;
const PLACEHOLDER_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
---

<div class="video-widget-wrapper">
  <video-widget
    url={placeholder ? PLACEHOLDER_VIDEO_URL : url}
    title={videoTitle}
  >
  </video-widget>
</div>
```
<template v-slot:caption>
frontend/src/widgets/VideoWidget.astro
</template>
</AposCodeBlock>

We are accessing the data passed from the ApostropheCMS backend server through the `widget` prop and destructuring the two fields, `video` and `title`. This information is then passed to the `<video-widget>` web component. Note that in an Astro only project we could instead import the web component in this template.

#### Web Component Implementation

The [web component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) itself is defined in a separate file. Here's a simplified version showing the core functionality:

<AposCodeBlock>

```javascript
class VideoWidget extends HTMLElement {
  static observedAttributes = ['url', 'title'];

  constructor() {
    super();
    this.videoData = null;
  }

  async connectedCallback() {
    await this.initializeVideo();
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      await this.initializeVideo();
    }
  }

  async initializeVideo() {
    const url = this.getAttribute('url');
    if (!url) return;

    try {
      // Fetch oEmbed data from ApostropheCMS
      const response = await fetch(`/api/v1/@apostrophecms/oembed/query?url=${encodeURIComponent(url)}`);
      this.videoData = await response.json();
      this.render();
    } catch (error) {
      console.error('Error fetching video data:', error);
    }
  }

  render() {
    if (!this.videoData) return;

    // Create responsive wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'video-responsive';
    wrapper.innerHTML = this.videoData.html;

    // Clear and update content
    this.innerHTML = '';
    this.appendChild(wrapper);
  }
}

customElements.define('video-widget', VideoWidget);
```
<template v-slot:caption>
frontend/public/scripts/video-widget.js
</template>
</AposCodeBlock>

We aren't going to go through this file in detail. The one thing that you will note is that it is making an API call to the ApostropheCMS server:
```javascript
const response = await fetch(`/api/v1/oembed?url=${encodeURIComponent(url)}`);
```
If desired, you could create [custom API routes](/reference/module-api/module-overview.html#restapiroutes-self) for any of your widgets or other web components to query in this manner. We will touch on this in the [Creating Pieces tutorial](/tutorials/astro/creating-pieces.md#approach-2-custom-api-routes) section.

#### Loading the Web Component

In the Apollo `[...slug].astro` file we are adding the web component script to the `startHead` slot:

<AposCodeBlock>

```astro
<AposLayout title={aposData.page?.title} {aposData} {bodyClass}>
  <Fragment slot="startHead">
    <script src="/scripts/video-widget.js"></script>
  </Fragment>
  <!-- ... rest of layout -->
</AposLayout>
```
<template v-slot:caption>
frontend/src/pages/[...slug].astro
</template>
</AposCodeBlock>

### Traditional JavaScript Initialization

For widgets that need more traditional JavaScript initialization, like the `SlideshowWidget`, we need a different approach.

#### Widget Template

<AposCodeBlock>

```astro
---
const { widget } = Astro.props;
const { images, _id } = widget;
---

<div
  class="slideshow-widget"
  data-slideshow
  data-widget-id={_id}
>
  <div class="slideshow-content">
    {images?.map((image, index) => (
      <div
        class:list={[
          'slide',
          { active: index === 0 }
        ]}
        data-slide={index}
      >
        <img src={image._urls.max} alt={image.title || ''} />
      </div>
    ))}
  </div>

  <div class="slideshow-controls">
    <button class="prev" aria-label="Previous slide">←</button>
    <button class="next" aria-label="Next slide">→</button>
  </div>
</div>
```
<template v-slot:caption>
frontend/src/widgets/SlideshowWidget.astro
</template>
</AposCodeBlock>

The template just brings in the widget data and creates simple markup to display and navigate through the slides.

#### JavaScript Initialization

We won't look at all the JavaScript powering the slideshow functionality, just the portion that initializes the script during page load.

<AposCodeBlock>

```astro
<script>
// ... other slideshow specific code

const slideshows = new Map();

setTimeout(() => {
  initSlideshows();

  if (window.apos) {
    apos.bus.$on('refreshed', initSlideshows);
    apos.bus.$on('modal-resolved', initSlideshows);
  }
}, 300);

function initSlideshows() {
  slideshows.forEach((slideshow) => slideshow.destroy());
  slideshows.clear();

  setTimeout(() => {
    document.querySelectorAll('.slideshow-container').forEach((container) => {
      const slideshowId = container.dataset.slideshowId;
      if (slideshowId) {
        slideshows.set(slideshowId, new Slideshow(container));
      }
    });
  }, 100);
}
</script>
```
<template v-slot:caption>
frontend/src/widgets/SlideshowWidget.astro
</template>
</AposCodeBlock>

The slideshow widget uses a combination of Astro and ApostropheCMS event handling to manage slideshow functionality. When in editing mode, the widget properly reinitializes after preview/edit toggles by listening to ApostropheCMS's event bus. Here we are listening for two different emit events - `refreshed` that occurs when a user switches between the edit and preview modes, and `modal-resolved` that occurs after the user closes the editing modal to reinitialize when slides are removed or added. A small timeout ensures both ApostropheCMS is available and the DOM has been updated before initializing or reinitializing slideshows. Each slideshow instance is tracked in a Map to properly clean up event listeners and autoplay intervals when needed.

Currently, when a new slideshow widget is first added to a page through ApostropheCMS, a page reload is required for the JavaScript initialization to take effect. However, once the page has been reloaded, the slideshow functions normally and handles preview/edit mode switches correctly. This initial load limitation is a known issue in the current implementation, related to the timing of widget addition and script hydration.

Another approach to initializing JavaScript is to use a `MutationObserver` as we do in the `backend/src/widgets/AccordionWidget.astro`. We won't go through this approach in detail, but you can look through the code to see if it is a preferred approach in your own project.

## Creating a Custom Testimonial Widget

Let's create a testimonial widget from scratch to demonstrate the complete widget development process. This widget will display customer testimonials with a quote, author name, role, and optional image.

### Backend Setup

First, create the widget module in your backend project:

```bash
mkdir -p backend/modules/testimonial-widget
touch backend/modules/testimonial-widget/index.js
```

#### Module Configuration

Add this configuration to `backend/modules/testimonial-widget/index.js`:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Testimonial',
    icon: 'format-quote-icon',
    description: 'Add customer testimonials to your page'
  },
  fields: {
    add: {
      quote: {
        type: 'string',
        label: 'Quote',
        textarea: true,
        required: true
      },
      author: {
        type: 'string',
        label: 'Author Name',
        required: true
      },
      role: {
        type: 'string',
        label: 'Author Role'
      },
      authorImage: {
        type: 'area',
        label: 'Author Image',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/image': {}
          }
        }
      },
      style: {
        type: 'select',
        label: 'Display Style',
        def: 'simple',
        choices: [
          {
            label: 'Simple',
            value: 'simple'
          },
          {
            label: 'Card',
            value: 'card'
          },
          {
            label: 'Featured',
            value: 'featured'
          }
        ]
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [
          'quote',
          'author',
          'role'
        ]
      },
      appearance: {
        label: 'Appearance',
        fields: [
          'authorImage',
          'style'
        ]
      }
    }
  }
};
```
<template v-slot:caption>
backend/modules/testimonial-widget/index.js
</template>
</AposCodeBlock>

### Register the Widget

1. First, add the widget to the widget groups in `backend/lib/helpers/area-widgets.js`:

<AposCodeBlock>

```javascript
export const widgetGroups = {
  // ... existing groups
  content: {
    label: 'Content',
    columns: 3,
    widgets: {
      '@apostrophecms/image': {},
      '@apostrophecms/video': {},
      '@apostrophecms/rich-text': {},
      // ... other content widgets
      testimonial: {} // Add our new testimonial widget
    }
  }
};
```
<template v-slot:caption>
backend/lib/helpers/area-widgets.js
</template>
</AposCodeBlock>

The `area-widgets.js` helper provides a clean, maintainable way to:
- Organize widgets into logical groups (layout vs. content)
- Configure widget display in the admin UI (columns, labels)
- Centrally manage widget availability across different areas
- Easily exclude specific widgets when needed

2. Then add the widget to `backend/app.js`:

<AposCodeBlock>

```javascript
export default {
  modules: {
    // ... other modules
    'testimonial-widget': {}
  }
}
```
<template v-slot:caption>
backend/app.js
</template>
</AposCodeBlock>

### Using the Widget in Areas

Now you can use the helper to add the testimonial widget to any area. For example, in a page type:

<AposCodeBlock>

```javascript
import { getWidgetGroups } from '../../lib/helpers/area-widgets.js';

export default {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'My Page Type'
  },
  fields: {
    add: {
      main: {
        type: 'area',
        options: getWidgetGroups({
          includeLayouts: true // Include layout widgets if needed
        })
      }
    }
  }
};
```
<template v-slot:caption>
</template>
</AposCodeBlock>

### Frontend Implementation

#### Create the Widget Component

Create a new file at `frontend/src/widgets/TestimonialWidget.astro`:

<AposCodeBlock>

```astro
---
import AposArea from '@apostrophecms/apostrophe-astro/components/AposArea.astro';

const { widget } = Astro.props;
const { quote, author, role, style = 'simple', authorImage } = widget;

// Map styles to Bulma classes
const styleClasses = {
  simple: 'is-light',
  card: 'is-primary',
  featured: 'is-info is-large'
};

const boxClass = `box notification ${styleClasses[style]} p-5`;
---

<div class={boxClass}>
  {authorImage && (
    <figure class="image is-96x96 mb-4 mx-auto">
      <AposArea area={authorImage} />
    </figure>
  )}

  <blockquote class="is-size-5 has-text-centered mb-4">
    "{quote}"
  </blockquote>

  <div class="has-text-centered">
    <strong class="is-block">{author}</strong>
    {role && <span class="is-block has-text-grey">{role}</span>}
  </div>
</div>

<style>
  blockquote {
    font-style: italic;
    line-height: 1.5;
  }

  .box {
    max-width: 800px;
    margin: 2rem auto;
  }

  .is-large {
    font-size: 1.25rem;
  }
</style>
```
<template v-slot:caption>
frontend/src/widgets/TestimonialWidget.astro
</template>
</AposCodeBlock>

### Register the Widget Component

Add the widget to `frontend/src/widgets/index.js`:

<AposCodeBlock>

```javascript
import TestimonialWidget from './TestimonialWidget.astro';

export default {
  // ... other widgets
  'testimonial': TestimonialWidget
};
```
<template v-slot:caption>
frontend/src/widgets/index.js
</template>
</AposCodeBlock>

## Reusing Widget Schema Fields in Page Templates

One powerful advantage of working with ApostropheCMS and Astro together is the ability to reuse widget components directly in page templates rather than only within areas. In a traditional ApostropheCMS-only project, widgets can only be added to areas through the editing interface. However, in a hybrid ApostropheCMS + Astro project, you can also use widgets as standalone Astro components directly in your page templates.

### The Schema Sharing Pattern

To facilitate this flexibility, we can extract widget schema field definitions into reusable modules that can be imported by both widget modules and page modules. The Apollo theme demonstrates this pattern with several widgets, including the hero, card, link, and slideshow widgets.

Let's see how this works with the hero widget as an example:

1. **Create a schema mixin file**

First, we define our schema fields in a dedicated module:

<AposCodeBlock>

```javascript
import colorOptionsHelper from '../../lib/helpers/color-options.js';

export default {
  layout: {
    type: 'select',
    label: 'Layout Style',
    def: 'full',
    choices: [
      {
        label: 'Full Width',
        value: 'full'
      },
      {
        label: 'Split Content',
        value: 'split'
      }
    ]
  },
  // ... many more schema fields for the hero component
  // Including background options, content settings, etc.
  callToAction: {
    type: 'area',
    label: 'Call-to-Action Links',
    options: {
      widgets: {
        link: {}
      },
      max: 2
    }
  }
};
```
<template v-slot:caption>
backend/lib/schema-mixins/hero-fields.js
</template>
</AposCodeBlock>

2. **Import in the widget module**

The hero widget module imports these fields:

<AposCodeBlock>

```javascript
import heroFields from '../../lib/schema-mixins/hero-fields.js';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Hero Section',
    icon: 'presentation',
    description: 'Add a hero section with customizable background and content'
  },
  fields: {
    add: heroFields
  }
};
```
<template v-slot:caption>
backend/modules/hero-widget/index.js
</template>
</AposCodeBlock>

3. **Import in the page module**

The same fields can now be imported and used in a page module:

<AposCodeBlock>

```javascript
import heroFields from '../../../lib/schema-mixins/hero-fields.js';

export default {
  options: {
    label: 'Home Page'
  },
  fields: {
    add: {
      layout: {
        type: 'select',
        label: 'Layout',
        def: 'minimal',
        choices: [
          {
            label: 'Minimal',
            value: 'minimal'
          },
          {
            label: 'Foundation',
            value: 'foundation'
          },
          {
            label: 'Showcase',
            value: 'showcase'
          }
        ]
      },
      heroSection: {
        type: 'object',
        label: 'Hero Section',
        fields: {
          add: heroFields
        },
        if: {
          layout: 'foundation'
        }
      },
      // ... other fields
    }
  }
};
```
<template v-slot:caption>
backend/modules/@apostrophecms/home-page/index.js
</template>
</AposCodeBlock>

4. **Use the widget component directly in the page template**

Finally, in your Astro page template, you can import and use the widget component directly:

<AposCodeBlock>

```astro
---
import Hero from '../widgets/HeroWidget.astro';
import AposArea from '@apostrophecms/apostrophe-astro/components/AposArea.astro';
const { page } = Astro.props.aposData;
---

{page.layout === 'foundation' && (
  <Hero widget={page.heroSection} />
)}

<div class="main-content">
  <AposArea area={page.main} />
</div>
```
<template v-slot:caption>
frontend/src/templates/HomePage.astro
</template>
</AposCodeBlock>

### Benefits of This Approach

This schema sharing pattern offers several advantages:

1. **DRY (Don't Repeat Yourself)**: Define field schemas once, use them in multiple places.
2. **Consistency**: Ensure that the same options are available whether using the component in an area or directly in a page.
3. **Maintainability**: Changes to the schema need to be made in only one place.
4. **Flexibility**: Allow content editors to use components either as widgets in areas or as fixed elements in specific page templates.

### When to Use This Pattern

This approach is particularly useful for:

- **Page-specific features**: Elements like heroes or headers that are integral to specific page types but might also be useful as flexible widgets.
- **Complex components**: When a component has many configuration options that would be tedious to duplicate.
- **Standardized elements**: Components that should maintain consistent options across your site.

In the Apollo theme, this pattern is used for several widgets including the hero, card, link, and slideshow widgets - all components that benefit from being available both as widgets in areas and as direct components in templates.

By leveraging schema mixins, you can create a more flexible, maintainable codebase while providing both developers and content editors with powerful tools for building diverse page layouts.

## Next Steps: Working with Pieces
While widgets handle modular content and layouts, pieces in ApostropheCMS serve a different purpose - managing collections of content like blog posts, team members, or products. In the next section, we'll explore how pieces work in an ApostropheCMS + Astro environment, including:

- Creating piece types
- Building piece pages
- Managing relationships
- Implementing piece widgets
- Handling piece data in Astro templates

Pieces complement widgets by providing reusable content that can be displayed across your site in various contexts. Understanding both systems gives you powerful tools for building flexible, content-rich websites.