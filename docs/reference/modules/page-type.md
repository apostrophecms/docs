--
extends: '@apostrophecms/doc-type'
---

# `@apostrophecms/page-type`

<AposRefExtends :module="$frontmatter.extends" />

This module serves as the cornerstone for creating page types in Apostrophe. It allows developers to define multiple page types, each with its own configuration methods, schema fields, and template(s), including fragments. This module adds the `type` field and `orphan` field, which controls the visibility of the page in the navigation, to the schema fields already exposed by the `@apostrophecms/doc-type` module. Any newly created page type needs to be added to both the `app.js` file, but also to the `types` array in the options of the [`@apostrophecms/page` module](/reference/modules/page.html). The object for each page type should have a `name` property that takes the module name and a `label` property that is used to populate the choices of page types presented to the content manager when they create a new page.

<AposCodeBlock>

```javascript
module.exports = {
  options: {
    types: [
      {
        name: '@apostrophecms/home-page',
        label: 'Home'
      },
      {
        name: 'default-page',
        label: 'Default'
      },
      {
        name: 'article-page',
        label: 'Article Index'
      }
    ],
    park: [
      {
        parkedId: 'search-parked',
        slug: '/search',
        title: 'Search',
        type: '@apostrophecms/search'
      }
    ],
    cache: {
      api: {
        maxAge: 60 * 60, // 3600s (1h)
        etags: true
      },
      page: {
        maxAge: 60 * 60, // 3600s (1h)
        etags: true
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>

</AposCodeBlock>

The `page-type` module can expose multiple views but by default serves the template located at `<module-name>/views/page.html`.

## Featured Methods:
dispatch
dispatchAll