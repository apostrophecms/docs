# Building site navigation

Almost every website needs some kind of primary navigation. It's usually a row of links at the top of each page that is hidden behind some kind of "hamburger menu" button on smaller devices. For Apostrophe sites there are two main approaches to adding and maintaining site navigation:

1. **Use the page tree** to automatically generate navigation for pages
2. **Manually build the site nav** using an array field

## Generating site navigation from the page tree

One of the defining features of pages in Apostrophe is that they exist in a hierarchy. Even if we added all pages on a website as siblings (the same hierarchy level) they would still all be children of the home page. This structure is expressed through the [page tree](/guide/pages.md#connecting-pages-with-page-tree-navigation).

The Apostrophe demo site is a small example of common page tree structure. Under the home page there are two **top-level pages**. One of those pages, "Editor Experience," has three additional **child pages**, making it their **parent page**. These pages can all be rearranged through drag-and-drop interaction.

![Screenshot of the Apostrophe demo page structure in the page manager UI](/images/recipes/demo-page-tree.png)

Apostrophe templates have access to this page tree using `data.home._children`, an array of top-level page data objects. Templates also have access to the children of the page a visitor is on, but since we're focused on the main site navigation, we want to use the home page's children. Home page children do not change as visitors move around the website.

As explained on the [pages guide](/guide/pages.md#connecting-pages-with-page-tree-navigation), we can loop over `data.home._children` and print the pages' URLs and titles in a list. Once you add some classes and CSS, this can work great as site navigation. And since it is based on the page tree structure **it will automatically stay up to date as editors update page content**.

<AposCodeBlock>
  ```django
  {% block beforeMain %}
  <div>
    <header>
      {# 👇 Adding our navigation wrapper. #}
      <nav>
        <ul>
          {# 👇 Referencing `data.home._children` and looping over them. #}
          {% for page in data.home._children %}
            <li>
              <a href="{{ page._url }}">{{ page.title }}</a>
            </li>
          {% endfor %}
        </ul>
      </nav>
    </header>
    <main>
  {% endblock %}
  ```
  <template v-slot:caption>
    views/layout.html
  </template>
</AposCodeBlock>

### Change page tree data in templates

The example above is a very simple site navigation. It includes only the top-level pages and the basic data available for each page. In some cases you may want different data from the page tree for your navigation. The direct way to do this is to alter the **query builders** that the core page module uses to get that data.

The *default* query builder options for the page module look like this:

<AposCodeBlock>
  ```javascript
  module.exports = {
    options: {
      builders: {
        children: true,
        ancestors: {
          children: true
        }
      }
    }
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>
</AposCodeBlock>

For example, **to include two levels of pages in the nav** we would add to the `builders` option that ancestors (such as the home page) should include two levels of child pages (`depth: 2`).

<AposCodeBlock>
  ```javascript
  module.exports = {
    options: {
      builders: {
        children: true,
        // `ancestors` includes the home page, so we adjust things there.
        ancestors: {
          children: {
            depth: 2
          }
        }
      }
    }
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>
</AposCodeBlock>

By default the page data object includes all properties from the database document. We can **limit that returned data** (for a minor speed improvement and clearer logging) by adding a projection to the query builder. *Make sure to include the `path` in this projection to avoid crashing.*

<AposCodeBlock>
  ```javascript
  module.exports = {
    options: {
      builders: {
        children: true,
        ancestors: {
          children: {
            depth: 2,
            project: {
              title: 1,
              path: 1,
              _url: 1,
              _children: 1
            }
          }
        }
      }
    }
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>
</AposCodeBlock>

If pages had **thumbnail images we wanted to show in the navigation**, we can include that as well. If we had added an area field called `thumbnail` to the page schema, we could get that data by also *configuring the query builder to include that area data*. (The relationship field data from the image widget isn't stored directly on the page.)

<AposCodeBlock>
  ```javascript
  module.exports = {
    options: {
      builders: {
        children: true,
        ancestors: {
          children: {
            depth: 2,
            project: {
              title: 1,
              path: 1,
              thumbnail: 1, // 👈 Also included in the projection
              _url: 1,
              _children: 1
            },
            // 👇 Now including the area data
            areas: [ 'thumbnail' ]
          }
        }
      }
    }
  }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>
</AposCodeBlock>

We would then display the image [using an `area` tag](/guide/media.html#the-image-widget-option) or [the template methods for accessing the image attachment](/guide/media.html#the-relationship-field-option).

As you can see, page templates come ready with page tree data that is ready to become site navigation. With additional configuration we can customize the data that templates give us. The examples above are only a few such ways to configure it.

## Add fields for manual nav building