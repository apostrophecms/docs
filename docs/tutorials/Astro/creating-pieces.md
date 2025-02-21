# Working with Pieces in ApostropheCMS + Astro

While widgets excel at providing modular content blocks for your pages, pieces serve a different purpose in ApostropheCMS. They represent collections of structured content that can be reused throughout your site. The Apollo project demonstrates this through two key piece types: articles and authors.

## Understanding Pieces in Apollo

The article and author pieces in Apollo showcase different aspects of piece functionality:

- **Articles** are the primary content pieces (blog posts, news items) that form the bulk of your site's content
- **Authors** demonstrate how pieces can create relationships between different content types

Unlike widgets (which are managed within pages), pieces get their own dedicated management modals. This provides a more focused interface for managing collections of content with features like filtering, searching, and batch operations. In Apollo, the managers for "Articles" and "Authors" are grouped in the "Blog" section of the admin bar. You can learn more about grouping admin bar items in the [ApostropheCMS documentation](https://docs.apostrophecms.org/reference/modules/admin-bar.html#groups) and examine the implementation in `backend/modules/@apostrophecms/admin-bar/index.js`.

## Examining the Article Piece Type

Let's look at Apollo's article piece module (`backend/modules/article/index.js`) as an example of a piece type implementation:

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

This piece type includes:

- Basic metadata like categories and publication dates
- A relationship to authors (`_author` field)
- Content areas that can contain widgets (`mainContent`)
- Relationships to other articles (`_related`)
- Organizational grouping of fields through the `group` property

The relationship between articles and authors demonstrates a key strength of pieces in ApostropheCMS. By specifying `withRelationships: [ '_articles' ]` in the `_author` field, we establish a bidirectional relationship where authors know which articles they've written and articles know who their authors are. For more information on relationships in ApostropheCMS, refer to the [relationship field documentation](https://docs.apostrophecms.org/reference/field-types/relationship.html).

## Displaying Pieces in Astro Templates

The Apollo project includes two templates for displaying articles:

1. An **index page** (`frontend/src/templates/ArticleIndexPage.astro`) that shows a collection of articles with pagination and filtering
2. A **show page** (`frontend/src/templates/ArticleShowPage.astro`) for individual articles with details and related content

Each template comes with multiple layout options in the `frontend/src/layouts/article-layouts` directory (like `HeroGrid.astro`, `HorizontalList.astro`, etc.) that content editors can select, demonstrating how the same data can be presented in different ways. You can review the piece page type implementation in `backend/modules/article-page/index.js`.

### Template Mapping for Piece Pages

Remember that piece pages require special mapping in your `frontend/src/templates/index.js` file. Unlike regular pages, piece types have both an index template (for listing pieces) and a show template (for individual pieces):

```javascript
// frontend/src/templates/index.js
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

The `:index` and `:show` suffixes tell ApostropheCMS which template to use for each view. This mapping ensures that when users navigate to an article listing page or an individual article, the correct template is rendered.

### The Index Page: Listing Articles with Filtering and Pagination

The `ArticleIndexPage.astro` template demonstrates several important concepts for displaying collections of pieces:

```javascript
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

The `piecesFilters` array provides pre-configured filtering options for your piece collection. This is powered by the [ApostropheCMS filters system](https://docs.apostrophecms.org/guide/piece-pages.html#filtering-by-category) which is configured in the piece page module:

```javascript
// Example from backend/modules/article-page/index.js
export default {
  extend: '@apostrophecms/piece-page-type',
  options: {
    label: 'Article Index Page',
    pluralLabel: 'Article Index Pages',
    // Configure the filters that appear on the page
    filters: {
      projection: {
        title: 1,
        category: 1
      },
      columns: {
        category: true
      }
    }
  }
  // ... more configuration
};
```

The template then renders these as clickable filter tags:

```javascript
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

#### 3. Pagination

The template handles pagination in two parts:

First, it generates an array of page objects with URLs:

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

The `setParameter` helper from the `apostrophe-astro` package ensures that pagination URLs maintain other query parameters (like active filters) while changing only the page number.

Then it renders a pagination component if there's more than one page:

```javascript
{totalPages > 1 && (
  <Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  url={Astro.url}
  class="my-8"
  />
)}
```

#### 4. Dynamic Layout Selection

The template renders different layouts based on the `indexLayout` value from the page document:

```javascript
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

This allows content editors to select their preferred layout from the page settings in the ApostropheCMS admin UI.

### The Show Page: Displaying Individual Articles

The `ArticleShowPage.astro` template is simpler but demonstrates a similar dynamic layout approach:

```javascript
---
import FullWidth from '../layouts/article-layouts/ShowFullWidth.astro';
import Magazine from '../layouts/article-layouts/ShowMagazine.astro';
import Minimal from '../layouts/article-layouts/ShowMinimal.astro';

const {
  page,
  piece
} = Astro.props.aposData;

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

Key points from this template:

1. It imports all possible layout components
2. It accesses the `piece` object from `aposData` which contains the full article document
3. It dynamically selects the appropriate layout component based on the `page.showLayout` value
4. It passes the article data to the selected layout component

This approach gives content editors flexibility in how they present articles while keeping the template code clean and maintainable.

## Using Pieces Outside Dedicated Pages

While piece pages provide a structured way to display collections, you can also use pieces throughout your site in other contexts. Here's how you might feature recent articles on your home page:

```javascript
---
// In your HomePage.astro component
import { getAttachmentUrl } from '../lib/attachments.js';
import formatDate from '../lib/formatDate.js';

const { global, page } = Astro.props.aposData;

// Fetch recent articles
const articles = await fetch(`/api/v1/article?sort={"publishDate":-1}&limit=3`)
  .then(res => res.json())
  .then(data => data.results);
---

<section class="recent-articles">
  <h2>Latest Articles</h2>
  <div class="articles-grid">
    {articles.map(article => (
      <div class="article-card">
        {article._heroImage?.[0] && (
          <img 
            src={getAttachmentUrl(article._heroImage[0], { size: 'one-third' })}
            alt={article._heroImage[0].title || 'Article image'}
          />
        )}
        <h3><a href={article._url}>{article.title}</a></h3>
        <p class="date">{formatDate(article.publishDate)}</p>
        <p class="excerpt">{article.excerpt}</p>
      </div>
    ))}
  </div>
</section>
```

This approach directly queries the ApostropheCMS API to fetch recent articles and display them on the home page, regardless of the page's template type. For more information on the ApostropheCMS REST API, refer to the [API documentation](https://docs.apostrophecms.org/reference/api/pieces.html).

Alternatively, you could create a dedicated widget for displaying articles:

```javascript
// backend/modules/featured-articles-widget/index.js
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Featured Articles'
  },
  fields: {
    add: {
      headline: {
        type: 'string',
        label: 'Section Headline',
        def: 'Featured Articles'
      },
      _articles: {
        type: 'relationship',
        label: 'Articles to Feature',
        withType: 'article',
        max: 3,
        required: true
      },
      displayExcerpt: {
        type: 'boolean',
        label: 'Display Excerpt',
        def: true
      }
    }
  }
};
```

The corresponding Astro component would then display these selected articles:

```javascript
---
// frontend/src/widgets/FeaturedArticlesWidget.astro
import { getAttachmentUrl } from '../lib/attachments.js';
const { widget } = Astro.props;
---

<section class="featured-articles">
  <h2>{widget.headline}</h2>
  <div class="articles-grid">
    {widget._articles.map(article => (
      <div class="article-card">
        {article._heroImage?.[0] && (
          <img 
            src={getAttachmentUrl(article._heroImage[0], { size: 'one-third' })}
            alt={article._heroImage[0].title || 'Article image'}
          />
        )}
        <h3><a href={article._url}>{article.title}</a></h3>
        {widget.displayExcerpt && <p>{article.excerpt}</p>}
      </div>
    ))}
  </div>
</section>
```

This widget-based approach gives content editors more control over which specific articles to feature and how they should be displayed. Remember that to complete this implementation, you would need to:

1. Register the widget in `backend/app.js`
2. Map the widget in `frontend/src/widgets/index.js`
3. Add it to the appropriate areas in your page types

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

```html
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

## Beyond Apollo: Extending Piece Functionality

The same patterns demonstrated with articles and authors can be applied to many other content types:

- Products in an e-commerce site
- Events in a calendar system
- Team members in a company directory
- Locations for a multi-location business
- Testimonials for display throughout your site

Pieces provide a way to manage collections of similar content items that need to be organized, related to each other, and displayed in various contexts throughout your site.

The integration between ApostropheCMS and Astro makes it particularly powerful to extend piece functionality. You can leverage ApostropheCMS's robust content management features while using Astro's modern frontend capabilities to create dynamic, performant displays of your piece content.
