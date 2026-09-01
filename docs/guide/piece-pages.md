# Piece index and show pages

**Index pages** list pieces of a particular type. Once one is created, each individual piece automatically has its own web page, known in Apostrophe as a **show page**. If you're familiar with blogs, you know this model all too well.

This feature set is powered by the `@apostrophecms/piece-page-type` module (because you're creating a *page type* that displays *pieces*, get it?).

Index pages support all features from [pages](/guide/pages.md), then add on some special features. In short, those are:

- Two template files: one for index pages and one for show pages
- Additional piece data available in templates

## Creating a piece page type

There are two critical steps to adding a new module for a piece page type:

1. [Extend](/guide/module-configuration-patterns.html) `@apostrophecms/piece-page-type`
2. Specify what piece type should be shown on the page

Extending the right module is simple enough. These modules use the property:

```javascript
extend: '@apostrophecms/piece-page-type',
```

Identifying the piece type can be done two ways: **using a module naming convention** or **using the `pieceModuleName` setting**. We can look at both options using a blog as our example.

### Matching a piece type using naming

In this example, the piece type is `article`, since "articles" are the individual entries that make up a blog. If you name the piece page type `article-page`, Apostrophe will automatically know that the two modules go together. (In case you missed the trick there, the piece page name is: piece type + `-page`.)

The piece page module then looks like:

<AposCodeBlock>

  ```javascript
  module.exports = {
    extend: '@apostrophecms/piece-page-type',
    options: {
      label: 'Blog page'
    }
  };
  ```
  <template v-slot:caption>
    modules/article-page/index.js
  </template>

</AposCodeBlock>

One benefit of this approach is that the codebase folders for the piece type and piece page type will be next to one another alphabetically. This tends to be the choice of the Apostrophe core team.

![Screenshot of code directories "article" and "article-page"](/images/piece-page-modules.png)

### Specifying the piece type with `pieceModuleName`

This method allows you to name the module whatever you want since you are specifically identifying a piece type. Set the [`pieceModuleName` option](/reference/module-api/module-options.md#piecemodulename) to the piece type name and Apostrophe makes the right connection.

<AposCodeBlock>

```javascript
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    label: 'Blog page',
    pieceModuleName: 'article'
  }
};
```
<template v-slot:caption>
  modules/blog-page/index.js
</template>

</AposCodeBlock>

Either method works well and you may find both options useful depending on the situation.

### Add template files and instantiate

Piece page types use two templates, both added in the module's `views` directory (e.g., `modules/article-page/views/`).

::: tip
When using the [official CLI](/guide/development-setup.md#installing-the-apostrophe-cli) to create a piece page type, include the `--page` option when creating the piece type. It will not only generate the piece type for you, but also the piece page code including blank template files.

```bash
apos add piece article --page
```

It scaffolds the templates as Nunjucks, so rename the generated `index.html` and `show.html` to `.jsx` and write them as function components — see the [CLI note](/guide/development-setup.md#installing-the-apostrophe-cli).
:::

| Template file name | What is it? |
| ------------------ | ----------- |
| `index.jsx` | Template for listing pieces (the **"index page**) |
| `show.jsx` | Template to display an individual piece (a **"show page"**) |

We'll review each template's features next.

Once those template files exist, you would **add this to the `app.js` configuration** [like any other module](/guide/modules.html#setting-up-a-module). Additionally, in order for your pages to show up in the page selection dropdown, you also need to add your module to the `module/@apostrophecms/page/index.js` file. As with other pages, you add an object with the name of the module and a label into the `types` option array.

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    types: [
      // 👇 Adding our new page type
      {
        name: 'article-page',
        label: 'Article page'
      },
      // 👇 Optionally including the core "Home page" type
      {
        name: '@apostrophecms/home-page',
        label: 'Home page'
      }
    ]
  }
}
```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>

</AposCodeBlock>

::: warning 🛑 Hold up. ✋

You've reviewed the [page type guide](/guide/pages.md), right? The sections below will highlight the special features of index and show page templates. For general page template syntax, see that page type guide.
:::

## The index page template

Index page templates look very similar to other page templates.

```jsx
/* modules/article-page/views/index.jsx */
import Pager from './pager.jsx';

export default function(
  { page, pieces, currentPage, totalPages, url },
  { Extend }
) {
  return (
    <Extend
      templateName="layout"
      main={
        <>
          <h1>{page.title}</h1>

          {pieces.map((article) => (
            <article>
              <h2>
                <a href={article._url}>{article.title}</a>
              </h2>
            </article>
          ))}

          <Pager
            page={currentPage}
            total={totalPages}
            url={url}
            className="blog-pager"
          />
        </>
      }
    />
  );
}
```

### `data.pieces` and other unique `data` properties

The first new thing here is the `Pager` import, but we'll get back to that. Let's talk about the **loop over `pieces`**.

```jsx
{pieces.map((article) => (
  <article>
    <h2>
      <a href={article._url}>{article.title}</a>
    </h2>
  </article>
))}
```

Index page templates have access to `pieces`, which is an array of piece docs. Since it's an array, we use `.map()` to loop over the pieces.

The `data` object properties unique to index pages are:

| Property | What is it? |
| -------- | ----------- |
| `pieces` | An array of piece docs for the current set of results |
| `currentPage` | A number representing what page of results is shown, starting with `1` |
| `totalPages` | The total number of results pages there are |
| `totalPieces` | The total number of pieces across all result pages |

### Pagination

By default, index pages will include up to *ten* pieces on `pieces` at a time. **You can change the number of pieces in each page of results** by setting [the `perPage` option](/reference/module-api/module-options.md#perpage-1) on the module. The data passed to templates will update, so you don't need to make any other adjustments.

The `@apostrophecms/pager` module supplies the arithmetic for basic, unstyled pagination through three [helper methods](/reference/modules/pager.md#helpers). They return plain data — an array of page numbers and two booleans — so you write the markup yourself as an ordinary component:

<AposCodeBlock>

```jsx
export default function(
  { page, total, url, className },
  { apos, helpers, __t }
) {
  if (!(page > 1 || total > 1)) {
    return null;
  }

  // Normalize `shown` before calling any of the three helpers. They do not
  // default it themselves, and an undefined `shown` makes both gap checks
  // return false.
  const options = { page, total, shown: 5 };

  const pages = helpers.pager.pageRange(options);
  const showHeadGap = helpers.pager.showHeadGap(options);
  const showTailGap = helpers.pager.showTailGap(options);

  const itemClass = className ? `${className}__item` : '';
  const gapClass = className ? `${className}__gap` : '';

  function Gap() {
    // Decorative: the surrounding numbers already imply the skipped pages.
    // Must be the string 'true' — see the note below.
    return <span className={gapClass} aria-hidden="true">…</span>;
  }

  function Page({ number }) {
    const active = number === page;
    const classes = [
      itemClass,
      number === 1 && 'is-first',
      number === total && 'is-last',
      active && 'is-active'
    ].filter(Boolean).join(' ');

    return (
      <span className={classes} aria-current={active ? 'page' : null}>
        {active
          ? number
          : (
            <a
              href={apos.url.build(url, { page: number })}
              aria-label={__t('Page {{ number }}', { number })}
            >
              {number}
            </a>
          )}
      </span>
    );
  }

  return (
    <nav className={className} aria-label={__t('Pagination')}>
      <Page number={1} />
      {showHeadGap && <Gap />}
      {pages.map((number) => <Page number={number} />)}
      {showTailGap && <Gap />}
      {total > 1 && <Page number={total} />}
    </nav>
  );
}
```

<template v-slot:caption>
  modules/article-page/views/pager.jsx
</template>
</AposCodeBlock>

The three helpers are reached through **`helpers.pager`**, the template-helper object supplied as part of the second argument — not through `apos.pager`, which is the module instance and does not expose them directly. `apos.url.build()` builds each page's URL.

`shown` controls how many interior page numbers appear, not counting the separately rendered first and last pages.

### Accessibility notes

Pagination is easy to render in a way that looks right but tells assistive technology nothing. Four details in the example above are doing that work:

- **`<nav aria-label>`** makes the block a navigation landmark that can be jumped to directly. The label distinguishes it from other navigation on the page.
- **`aria-current="page"`** marks the active page. Without it, the current page is signalled only by a CSS class and by not being a link — neither of which a screen reader conveys. It would simply announce a bare number.
- **`aria-label` on each link** gives "Page 4" instead of "4". This matters when someone lists the page's links, a common way to navigate, where bare digits carry no meaning.
- **`aria-hidden="true"` on the ellipses** keeps decorative punctuation from being read aloud.

::: warning
Write `aria-hidden="true"` as a **string**, not `aria-hidden={true}`. A prop set to `true` renders as a bare attribute, which serializes as `aria-hidden=""` — not the same as `"true"`, and generally treated as *not* hidden. See [Attribute names are mostly passed through verbatim](/guide/jsx-templates.md#what-does-not-carry-over-from-react).

`aria-current={active ? 'page' : null}` is safe for the opposite reason: a `null` prop omits the attribute entirely, which is what you want on the inactive pages.
:::

The example keeps the `<span>` structure of the original Nunjucks pager macro so that existing pager styles continue to apply. If you are writing fresh CSS, wrapping the items in an `<ol>`/`<li>` is the more conventional pattern and lets screen readers announce the number of pages.

## The show page template

Show pages are the web pages for individual pieces, rendered from `show.jsx` templates. Instead of `page`, the template uses `piece` to access the piece data.

Assuming our `article` piece type example has a single `body` area, it could look like this:

<AposCodeBlock>

  ```javascript
  module.exports = {
    extend: '@apostrophecms/piece-type',
    options: {
      label: 'Article'
      // Additionally add a `pluralLabel` option if needed.
    },
    fields: {
      add: {
        body: {
          label: 'Article text',
          type: 'area',
          options: {
            max: 1,
            widgets: {
              '@apostrophecms/rich-text': {}
            }
          }
        }
      },
      group: {
        basics: {
          label: 'Basics',
          fields: [ 'title', 'body' ]
        }
      }
    }
  }
  ```
  <template v-slot:caption>
    modules/article/index.js
  </template>

</AposCodeBlock>

```jsx
/* modules/article-page/views/show.jsx */
export default function({ piece }, { Area, Extend }) {
  return (
    <Extend
      templateName="layout"
      main={
        <>
          <h1>{piece.title}</h1>
          <section>
            <Area doc={piece} name="body" />
          </section>
        </>
      }
    />
  );
}
```

There are some other special data available in show page templates:

| Property | What is it? |
| -------- | ----------- |
| `piece` | The document object for the featured piece. In a blog, this would be a single article. |
| `page` | In show page templates, `data.page` refers to the index page |
| `previous` | If using the [`previous: true` option](/reference/module-api/module-options.md#previous), `data.previous` is the previous piece based on the [sort](/reference/module-api/module-options.md#sort) |
| `next` | If using the [`next: true` option](/reference/module-api/module-options.md#next), `data.next` is the next piece based on the [sort](/reference/module-api/module-options.md#sort) |

## Index and show page URL basics

Index page URLs, like other page URLs, generally are constructed from the base domain/URL (the home page URL) plus their slug. Page slugs include forward slashes and, by default, the path of their parent page, if they have one.

If the home page URL was `https://example.rocks` and the "Articles" index page had the slug `/articles`, the "Articles" page URL would be **`https://example.rocks/articles`**.

Show pages are extensions of their index page. To that end, their URLs are the index page url plus the piece slug. Piece slugs do not have slashes or look like a URL path on their own since pieces can be used in many ways.

Consider an article "How to write JavaScript." Apostrophe would generate the slug `how-to-write-javascript` based on the title. With the index page url `https://example.rocks/articles` and that slug, the show page URL would be **`https://example.rocks/articles/how-to-write-javascript`**.

The structure of index and show page URLs is one of the most clear ways to understand how show pages depend on index pages. Even if this does not seem terribly complex, it is important to understand that relationship.

::: info
You may create multiple index pages of a particular type. If you do, the related piece show pages can be accessed at URLs based on any of the index pages. For example, if you create one articles index page with the slug `/articles` and another with `/news`, both of these URLs will go to the same article:

- `https://example.rocks/articles/how-to-write-javascript`
- `https://example.rocks/news/how-to-write-javascript`

This can be used to create index pages that are filtered to list different pieces (e.g., articles on different topics).

Even if any of the index page URL paths can be used to reach a particular show page, the piece will have a primary `_url` property when requested (e.g., in a `GET` API request). That primary URL is generated using the index page identified using the `chooseParentPage` method on `@apostrophecms/piece-page-type` (and modules that extend it). By default it simply returns the first index page created, but you can override that method to choose a matching index page another way.

<!-- TODO: Link to the piece page module reference page `chooseParentPage` method when available. -->
:::
