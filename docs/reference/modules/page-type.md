--
extends: '@apostrophecms/doc-type'
---

# `@apostrophecms/page-type`

<AposRefExtends :module="$frontmatter.extends" />

This module serves as the cornerstone for creating page types in Apostrophe. It allows developers to define multiple page types, each with its own configuration methods, schema fields, and template(s). This module extends the schema fields provided by the `@apostrophecms/doc-type` module with the `type` field and introduces the `orphan` field (labeld `visibility`), which controls page visibility in the navigation. Any newly created page type needs to be added to both the `app.js` file, but also to the `types` array in the options of the [`@apostrophecms/page` module](/reference/modules/page.html). The object for each page type should have a `name` property that takes the module name and a `label` property that is used to populate the choices of page types presented to the content manager when they create a new page.

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
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/page/index.js
  </template>

</AposCodeBlock>

The `page-type` module can expose multiple views, but by default serves the template located at `<module-name>/views/page.html`. Additional views can be exposed using the `dispatch()` method.

## Featured Methods:
The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/tree/main/modules/%40apostrophecms/page-type) for all the methods that belong to this module.

### `dispatch(pattern)`
The `dispatch()` method provides a way to add Express-style routing for ApostropheCMS pages. This method allows you to define custom behavior for URLs that extend beyond the basic page slug, matching specified URL patterns. This method is used in the `@apostrophecms/piece-page-type` to redirect from the `index.html` template to the `show.html` template.