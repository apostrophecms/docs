---
title: "Creating Pieces"
detailHeading: "Astro"
url: "/tutorials/astro/creating-pieces.html"
content: "Pieces manage collections of reusable content like articles or team members. Learn how to create, organize, and display piece content throughout your ApostropheCMS + Astro site."
tags:
  topic: "Core Concepts"
  type: astro
  effort: beginner
order: 5
videoList:
  - id: 'tCG5GtbIlYI'
    title: 'Piece-type Basics'
    link: '#working-with-pieces-in-apostrophecms-astro'
  - id: '_spAfke_Rt8'
    title: 'Advanced Piece Display'
    link: '#using-pieces-outside-dedicated-pages'
---
# Working with Pieces in ApostropheCMS + Astro

While widgets excel at providing modular content blocks for your pages, pieces serve a different purpose in ApostropheCMS. They represent collections of structured content that can be reused throughout your site. The Apollo project demonstrates this through two key piece types: articles and authors.

::: tip Watch & Learn! 🎥
This tutorial is available in both text and video formats. The videos cover the key highlights, while this page provides additional details and references. Watch the videos for a guided introduction, then read on for deeper insights!
:::

<iframe width="560" height="315" src="https://www.youtube.com/embed/tCG5GtbIlYI?si=Nw5i3RYStlXmOZl-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


## Understanding Pieces in Apollo

The article and author pieces in Apollo showcase different aspects of piece functionality:

- **Articles** are the primary content pieces (blog posts, news items) that form the bulk of your site's content
- **Authors** demonstrate how pieces can create relationships between different content types

Unlike widgets (which are managed within pages), pieces get their own dedicated management modals. This provides a more focused interface for managing collections of content with features like filtering, searching, and batch operations. In Apollo, the managers for "Articles" and "Authors" are grouped in the "Blog" section of the admin bar. You can learn more about grouping admin bar items in the [ApostropheCMS documentation](https://docs.apostrophecms.org/reference/modules/admin-bar.html#groups) and examine the implementation in `backend/modules/@apostrophecms/admin-bar/index.js`.

## Examining the Article Piece Type

Let's look at Apollo's article piece module (`backend/modules/article/index.js`) as an example of a piece type implementation:

<AposCodeBlock>

```javascript
import { getWidgetGroups } from '../../lib/helpers/area-widgets.js';

export default {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Article',
    pluralLabel: 'Articles',
    shortcut: 'Shift+Alt+A'
  },
  fields: {
    add: {
      category: {
        type: 'select',
        label: 'Category',
        help: 'Choose a category for this article',
        choices: [
          {
            label: 'News',
            value: 'news'
          },
          {
            label: 'Opinion',
            value: 'opinion'
          },
          {
            label: 'Feature',
            value: 'feature'
          },
          {
            label: 'Review',
            value: 'review'
          }
        ]
      },
      _heroImage: {
        type: 'relationship',
        label: 'Hero Image',
        withType: '@apostrophecms/image',
        max: 1
      },
      excerpt: {
        type: 'string',
        textarea: true,
        label: 'Article Excerpt',
        help: 'Brief summary for listings and previews'
      },
      mainContent: {
        type: 'area',
        options: getWidgetGroups({
          includeLayouts: true
        })
      },
      _author: {
        type: 'relationship',
        label: 'Author',
        withType: 'author',
        withRelationships: [ '_articles' ]
      },
      publishDate: {
        label: 'Publication Date',
        type: 'date',
        required: true
      },
      _related: {
        type: 'relationship',
        label: 'Related Articles',
        withType: 'article',
        max: 4,
        builders: {
          project: {
            title: 1,
            _url: 1
          }
        },
        withRelationships: [ '_heroImage' ]
      }
    },
    group: {
      basics: {
        label: 'Basic Info',
        fields: ['_author', 'category', 'publishDate', '_related']
      },
      content: {
        label: 'Content',
        fields: ['_heroImage', 'excerpt', 'mainContent']
      }
    }
  }
};
```
<template v-slot:caption>
backend/modules/article/index.js
</template>
</AposCodeBlock>

This piece type includes:

- Basic metadata like categories and publication dates
- A relationship to authors (`_author` field)
- Content areas that can contain widgets (`mainContent`)
- Relationships to other articles (`_related`)
- Organizational grouping of fields through the `group` property

The relationship between articles and authors demonstrates a key strength of pieces in ApostropheCMS. By specifying `withRelationships: [ '_articles' ]` in the `_author` field, we establish a bidirectional relationship where authors know which articles they've written and articles store who authored them. For more information on relationships in ApostropheCMS, refer to the [relationship field documentation](https://docs.apostrophecms.org/reference/field-types/relationship.html).

## Displaying Pieces in Astro Templates

The Apollo project includes two templates for displaying articles:

1. An **index page** (`frontend/src/templates/ArticleIndexPage.astro`) that shows a collection of articles with pagination and filtering
2. A **show page** (`frontend/src/templates/ArticleShowPage.astro`) for individual articles with details and related content

Each template comes with multiple layout options in the `frontend/src/layouts/article-layouts` directory (like `HeroGrid.astro`, `HorizontalList.astro`, etc.) that content editors can select, demonstrating how the same data can be presented in different ways. You can review the piece page type implementation in `backend/modules/article-page/index.js`.

### Template Mapping for Piece Pages

Remember that piece pages require special mapping in your `frontend/src/templates/index.js` file. Unlike regular pages, piece types have both an index template (for listing pieces) and a show template (for individual pieces):

<AposCodeBlock>

```javascript
import ArticleIndexPage from './ArticleIndexPage.astro';
import ArticleShowPage from './ArticleShowPage.astro';

export default {
  // Regular pages
  '@apostrophecms/home-page': HomePage,
  'default-page': DefaultPage,

  // Piece pages with their specific templates
  'article-page:index': ArticleIndexPage,
  'article-page:show': ArticleShowPage
};
```
<template v-slot:caption>
frontend/src/templates/index.js
</template>
</AposCodeBlock>

The `:index` and `:show` suffixes tell ApostropheCMS which template to use for each view. This mapping ensures that when users navigate to an article listing page or an individual article, the correct template is rendered.

### The Index Page: Listing Articles with Filtering and Pagination

The `ArticleIndexPage.astro` template demonstrates several important concepts for displaying collections of pieces:

<AposCodeBlock>

```astro
---
import setParameter from '@apostrophecms/apostrophe-astro/lib/aposSetQueryParameter.js';
import AposArea from '@apostrophecms/apostrophe-astro/components/AposArea.astro';

import Pagination from '../components/Pagination.astro';

import HeroGrid from '../layouts/article-layouts/HeroGrid.astro';
import ListAside from '../layouts/article-layouts/ListAside.astro';
import Standard from '../layouts/article-layouts/Standard.astro';

const {
  page,
  user,
  query,
  piecesFilters = [],
  pieces,
  currentPage,
  totalPages
} = Astro.props.aposData;

const pages = [];
for (let i = 1; i <= totalPages; i++) {
  pages.push({
    number: i,
    current: i === currentPage,
    url: setParameter(Astro.url, 'page', i)
  });
}
---
<section class='main-content content-index-page section'>
  <div class='container'>
    <h1 class="is-size-1">{page.title}</h1>

    {/* Global Masthead - Shows for all layouts */}
    {
      page.masthead && (
        <div class='container mb-6'>
          <div class='content has-text-centered'>
            <AposArea area={page.masthead} />
          </div>
        </div>
      )
    }

    {/* Display Filters */}
    {
      Array.isArray(piecesFilters) && piecesFilters.length > 0 && (
        <div class='tags are-medium mb-5'>
          {piecesFilters.map((filter) => (
            <a
              href={filter.url}
              class={`tag ${filter.active ? 'is-primary' : 'is-light'}`}
            >
              {filter.label}
            </a>
          ))}
        </div>
      )
    }

    {/* Before Content Area */}
    {page.beforeContent && (
      <div class='mb-6'>
        <AposArea area={page.beforeContent} />
      </div>
    )}

    {/* Dynamic Layout Selection */}
    {page.indexLayout === 'heroGrid' && (
      <HeroGrid
        pieces={pieces}
        gridColumns={3}
        heroImageClass="is-2by1"
      />
    )}

    {page.indexLayout === 'listAside' && (
    <ListAside
      pieces={pieces}
      sidebarWidth={4}
      showRelated={true}
      showAuthorAvatar={true}
      sidebarArea={page.sidebarContent}
    />
    )}

    {page.indexLayout === 'standard' && (
    <Standard
      pieces={pieces}
      showImage={true}
      imageWidth={4}
      showAuthorAvatar={true}
      excerptLength={200}
    />
    )}

    {/* After Content Area */}
    {page.afterContent && (
      <div class='mt-6'>
        <AposArea area={page.afterContent} />
      </div>
    )}

    {/* Pagination */}
    {totalPages > 1 && (
      <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      url={Astro.url}
      class="my-8"
      />
    )}
  </div>
</section>
```
<template v-slot:caption>
frontend/src/templates/ArticleIndexPage.astro
</template>
</AposCodeBlock>

This template highlights several important features:

#### 1. Data from ApostropheCMS

The `aposData` prop includes everything needed for a piece index page:

```javascript
const {
  page,           // The current page document
  user,           // Current user info
  query,          // URL query parameters
  piecesFilters,  // Available filters for the pieces
  pieces,         // Array of piece documents for this page
  currentPage,    // Current pagination page number
  totalPages      // Total number of pagination pages
} = Astro.props.aposData;
```

#### 2. Filtering with `piecesFilters`

The `piecesFilters` array provides pre-configured filtering options for your piece collection. This is powered by the [ApostropheCMS filters system](/reference/modules/piece-page-type.html#piecesfilters) which is configured in the piece page module:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/piece-page-type',
  options: {
    label: 'Article Page',
    perPage: 7,
    piecesFilters: [
      {
        name: 'category'
      }
    ]
  },
  // ... more configuration
};
```
<template v-slot:caption>
backend/modules/article-page/index.js
</template>
</AposCodeBlock>

The template then renders each of the values for the `article` module `category` field as clickable filter tags:

<AposCodeBlock>

```astro
{
  Array.isArray(piecesFilters) && piecesFilters.length > 0 && (
    <div class='tags are-medium mb-5'>
      {piecesFilters.map((filter) => (
        <a
          href={filter.url}
          class={`tag ${filter.active ? 'is-primary' : 'is-light'}`}
        >
          {filter.label}
        </a>
      ))}
    </div>
  )
}
```
<template v-slot:caption>
frontend/src/templates/ArticleIndexPage.astro
</template>
</AposCodeBlock>

Clicking on one of these filters will result in the backend populating the `aposData.pieces` with only those that match the filter value. So, you don't need any special markup, just the same markup you use to display all the unfiltered pieces.

#### 3. Pagination

The template handles pagination in two parts:

First, it generates an array of page objects with URLs:

<AposCodeBlock>

```javascript
const pages = [];
for (let i = 1; i <= totalPages; i++) {
  pages.push({
    number: i,
    current: i === currentPage,
    url: setParameter(Astro.url, 'page', i)
  });
}
```
<template v-slot:caption>
frontend/src/templates/ArticleIndexPage.astro
</template>
</AposCodeBlock>

The `setParameter` helper from the `apostrophe-astro` package ensures that pagination URLs maintain other query parameters (like active filters) while changing only the page number.

Then it renders a pagination component if there's more than one page:

<AposCodeBlock>

```astro
{totalPages > 1 && (
  <Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  url={Astro.url}
  class="my-8"
  />
)}
```
<template v-slot:caption>
frontend/src/templates/ArticleIndexPage.astro
</template>
</AposCodeBlock>

#### 4. Dynamic Layout Selection

The template renders different layouts based on the `indexLayout` value from the page document:

<AposCodeBlock>

```astro
{page.indexLayout === 'heroGrid' && (
  <HeroGrid
    pieces={pieces}
    gridColumns={3}
    heroImageClass="is-2by1"
  />
)}

{page.indexLayout === 'listAside' && (
  <ListAside
    pieces={pieces}
    sidebarWidth={4}
    showRelated={true}
    showAuthorAvatar={true}
    sidebarArea={page.sidebarContent}
  />
)}
```
<template v-slot:caption>
frontend/src/templates/ArticleIndexPage.astro
</template>
</AposCodeBlock>

This allows content editors to select their preferred layout from the page settings in the ApostropheCMS admin UI.

### The Show Page: Displaying Individual Articles

The `ArticleShowPage.astro` template is more simple, but demonstrates a similar dynamic layout approach:

<AposCodeBlock>

```astro
---
import FullWidth from '../layouts/article-layouts/ShowFullWidth.astro';
import Magazine from '../layouts/article-layouts/ShowMagazine.astro';
import Minimal from '../layouts/article-layouts/ShowMinimal.astro';

const { piece } = Astro.props.aposData;

const layouts = {
  fullWidth: FullWidth,
  magazine: Magazine,
  minimal: Minimal
};

const SelectedLayout = layouts[page.showLayout] || FullWidth;
---

<div class="main-content article-show-page">
  <SelectedLayout article={piece} />
</div>
```
<template v-slot:caption>
frontend/src/templates/ArticleShowPage.astro
</template>
</AposCodeBlock>

Key points from this template:

1. It imports all possible layout components
2. It accesses the `piece` object from `aposData` which contains the full article document
3. It dynamically selects the appropriate layout component based on the `page.showLayout` value
4. It passes the article data to the selected layout component

This approach gives content editors flexibility in how they present articles while keeping the template code clean and maintainable.

## Using Pieces Outside Dedicated Pages

While piece pages provide a structured way to display collections of content, there are many situations where you'll want to use pieces in other contexts throughout your site. Let's explore three approaches to incorporate pieces anywhere in your site: using built-in API endpoints, creating custom API routes, and leveraging relationships.

<iframe width="560" height="315" src="https://www.youtube.com/embed/_spAfke_Rt8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Approach 1: Built-in API Endpoints

An easy way to fetch pieces is through ApostropheCMS's built-in API endpoints. These endpoints accept query parameters that let you filter and sort pieces without writing any backend code.

Here's an example that fetches and displays article pieces that have a `news` category. In your Astro component you would construct your fetch along with parameters to structure what pieces you get back:

```javascript
---
// frontend/src/components/NewsArticles.astro
const apiUrl = new URL('/api/v1/article', Astro.url.origin);
// Add query parameters to filter for news category
apiUrl.searchParams.set('category', 'news');
// Sort by publish date, most recent first
apiUrl.searchParams.set('sort', '{"publishDate":-1}');
// Limit to 5 articles
apiUrl.searchParams.set('limit', '5');

const response = await fetch(apiUrl);
const { results: newsArticles } = await response.json();
---

<div class="latest-news">
  <h2>Latest News</h2>
  <div class="news-grid">
    {newsArticles.map(article => (
      <article class="news-item">
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
        <a href={article._url}>Read More</a>
      </article>
    ))}
  </div>
</div>
```

On the backend (ApostropheCMS), you need to give permission for this `GET` request by setting the [`publicApiProjection` option](/reference/modules/piece-type.html#publicapiprojection) in the `backend/modules/article/index.js` file:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Article',
    pluralLabel: 'Articles',
    shortcut: 'Shift+Alt+A',
    publicApiProjection: {
      title: 1,
      excerpt: 1,
      _url: 1
    }
  },
  // ... remainder of code
```
<template v-slot:caption>
backend/modules/article/index.js
</template>
</AposCodeBlock>

The `publicApiProjection` can be set to allow any of the document fields to be returned. In this case, since we do have a piece type page for displaying the individual article pieces, we are also returning the computed `_url` property.

This approach is perfect for simple filtering and sorting needs - no custom backend code is required. The query parameters correspond directly to MongoDB query operators, giving you powerful filtering capabilities out of the box. You can [read more](/guide/database-queries.html) about this in the main documentation.

### Approach 2: Custom API Routes

Sometimes you need more complex logic to fetch and transform your piece's data. That's where custom API routes come in. Let's look at an example that fetches the latest article from each author and adds a purchase link:

<AposCodeBlock>

```javascript
apiRoutes(self) {
  return {
    get: {
      async latestByAuthor(req) {
        // Fetch all authors
        // Since this is the article module, we need to specify
        // we want documents from the author module
        const authors = await self.apos.modules.author.find(req).toArray();

        if (!authors.length) {
          return [];
        }

        // Fetch the latest article for each author
        const latestArticles = await Promise.all(authors.map(async (author) => {
          // Here we can use just `self.find()` since we want article pieces
          const article = await self.find(req, {
            // There can be more than one author so it is an array
            authorIds: { $in: [ author.aposDocId ] }
          })
            .sort({ publishDate: -1 })
            // We only need the title, no since grabbing extra data
            .project({
              title: 1
            })
            .limit(1)
            .toArray();

          return article.length
            ? {
              author: author.title,
              articleTitle: article[0].title,
              purchaseLink: `https://www.amazon.com/s?k=${encodeURIComponent(article[0].title)}`
            }
            : null;
        }));

        // Filter out authors without articles
        return latestArticles.filter(entry => entry !== null);
      }
    }
  };
}
```
<template v-slot:caption>
backend/modules/article/index.js
</template>
</AposCodeBlock>

Then we can use this custom endpoint in any Astro component:

<AposCodeBlock>

```astro
---
// ApostropheCMS will automatically kebab-case our `latestByAuthor` route
const apiUrl = new URL('/api/v1/article/latest-by-author', Astro.url.origin);
const response = await fetch(apiUrl);
const latestArticles = await response.json();
---

<section class="author-latest">
  <h3>Latest Articles by Our Authors</h3>
  <ul class="article-list">
    {
      latestArticles.length > 0 ? (
        latestArticles.map((entry) => (
          <li class="article-item">
            <strong>{entry.author}</strong>: "{entry.articleTitle}" -
            <a href={entry.purchaseLink} target="_blank" rel="noopener noreferrer">
              Buy on Amazon
            </a>
          </li>
        ))
      ) : (
        <p>No articles found.</p>
      )
    }
  </ul>
</section>
```
<template v-slot:caption>
frontend/src/templates/HomePage.astro
</template>
</AposCodeBlock>

This approach lets you create specialized endpoints that encapsulate complex business logic while keeping your frontend code clean and focused on presentation.

### Approach 3: Using Relationships

The third approach leverages ApostropheCMS's relationship fields to connect pieces to your pages or widgets. This is perfect for curated content selections where editors want direct control over which pieces appear.

For example, let's say you want to feature specific articles on your homepage. First, add a relationship field to your home page type:

<AposCodeBlock>

```javascript
export default {
  fields: {
    add: {
      _featuredArticles: {
        type: 'relationship',
        label: 'Featured Articles',
        withType: 'article',
        max: 3,
        builders: {
          // Only fetch the fields we need
          project: {
            title: 1,
            excerpt: 1,
            _url: 1
          }
        }
      }
    }
  }
};
```
<template v-slot:caption>
backend/modules/@apostrophecms/home-page/index.js
</template>
</AposCodeBlock>

Then use these relationships in your home page template:

<AposCodeBlock>

```astro
---
const { page } = Astro.props.aposData;
const featuredArticles = page._featuredArticles || [];
---

<section class="featured-articles">
  <h2>Featured Articles</h2>
  <div class="article-grid">
    {featuredArticles.map(article => (
      <article class="featured-item">
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
        <a href={article._url}>Read More</a>
      </article>
    ))}
  </div>
</section>
```
<template v-slot:caption>
frontend/src/templates/HomePage.astro
</template>
</AposCodeBlock>

The beauty of relationships is that they maintain referential integrity - if an article is archived or deleted, it's automatically removed from the relationships. Plus, editors can easily manage these connections through the ApostropheCMS admin UI.

Each of these approaches has its strengths:
- **Built-in API endpoints** are perfect for simple filtering and sorting
- **Custom API routes** handle complex data transformations and business logic
- **Relationships** give editors direct control over content connections

By combining these approaches, you can create rich, interconnected content experiences that go well beyond traditional page-based navigation.

## The Author Piece Type

The author piece type (`backend/modules/author/index.js`) in Apollo demonstrates how pieces can serve supporting roles without needing their own dedicated pages. Authors include fields for:

- Biographical information 
- Profile images
- Contact details
- A reverse relationship to articles they've written (`_articles` field)

While authors don't have their own piece pages in the Apollo setup, their information appears within article displays (see `frontend/src/layouts/article-layouts/Standard.astro` for an example). This shows how pieces can enhance other content through relationships without necessarily being featured as standalone content.

You can examine how author information is accessed in the article templates by looking at code like this:

```javascript
// Example from an article layout template
const authors = piece._author || [];
```

And then displayed:

```astro
<!-- Display author information -->
{authors.length > 0 && (
  <div class="article-authors">
    {authors.map(author => (
      <div class="author-card">
        {author._image?.[0] && (
          <img src={getAttachmentUrl(author._image[0], { size: 'one-sixth' })} 
               alt={author.title} />
        )}
        <h4>{author.title}</h4>
        <p>{author.bio}</p>
      </div>
    ))}
  </div>
)}
```
