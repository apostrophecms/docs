---
prev:
  text: 'Layout templates'
  link: 'guide/layout-template.md'
next:
  text: 'Template filters'
  link: 'guide/template-filters.md'
---
# Template data

All Apostrophe template files have access to a `data` object. It contains content data as well as additional information such as the page's URL and the active user. Some properties differ depending on the template type (e.g., `data.widget` is only available in widget templates).

The table below lists the data properties available from Apostrophe core as well as the template types where they are available.

::: info
**Template type indicators:**
- <AposTag text="All pages"/>: The property is present in all page templates, including piece index pages and show pages.
- <AposTag text="Show pages" :tagStyle="0"/>: The property is present in piece show page templates and not in other normal page templates.
- <AposTag text="Widgets" :tagStyle="1"/>: The property is present in widget templates.
:::
| Property | Description | Templates where present |
|----------|-------------|----------------|
| `absoluteUrl` | The complete URL currently displayed, including base URL (with prefix, if set) and query parameters. | <AposTag text="All pages"/> <AposTag text="Widgets" :tagStyle="1"/> |
| `aposBodyDataAttributes` | A string of JSON that Apostrophe applies to the `body` tag as data attributes. Used by the UI app. | <AposTag text="All pages"/> <AposTag text="Widgets" :tagStyle="1"/> |
| `baseUrl` | The site's configured `baseUrl` value. Typically the website's domain. | <AposTag text="All pages"/> <AposTag text="Widgets" :tagStyle="1"/> |
| `baseUrlWithPrefix` | The `baseUrl` value, plus the site's `prefix` value, if set. | <AposTag text="All pages"/> <AposTag text="Widgets" :tagStyle="1"/> |
| `bestPage` | Usually the same as `data.page`. If no page is found for the URL (e.g., a 404 page) it will be the data object for the page that best matches the slug, going back to the home page. | <AposTag text="All pages"/> <AposTag text="Widgets" :tagStyle="1"/> |
| `contextOptions` | An object of [context options](/guide/areas-and-widgets.md#passing-context-options), if passed in.| <AposTag text="Widgets" :tagStyle="1"/> |
| `edit` | An alias of `data.bestPage._edit`, indicating whether the active user has editing permissions for the `data.bestPage` document. | <AposTag text="All pages"/>|
| `global` | The data object for the global doc. | <AposTag text="All pages"/> <AposTag text="Widgets" :tagStyle="1"/> |
| `home` | The data object for the home page. | <AposTag text="All pages"/> <AposTag text="Widgets" :tagStyle="1"/> |
| `locale` | The active locale.| <AposTag text="All pages"/> <AposTag text="Widgets" :tagStyle="1"/> |
| `localizations` | An array of active locales including information about the active page in each.| <AposTag text="All pages"/> |
| `manager` | In widget templates, the widget module manager object. | <AposTag text="Widgets" :tagStyle="1"/> |
| `next` | If [`next: true` is set on the piece page type](/reference/module-api/module-options.md#next), the data object for the next piece in sort order. | <AposTag text="Show pages" :tagStyle="0"/> |
| `options` | | <AposTag text="Widgets" :tagStyle="1"/> |
| `outerLayout` | A reference path to the outer layout template. Used in [layout templates](/guide/layout-template.md). | <AposTag text="All pages"/> |
| `page` | A data object for the active page *or* the index page in show page templates. | <AposTag text="All pages"/> <AposTag text="Widgets" :tagStyle="1"/> |
| `piece` | The piece data object in a show page template. | <AposTag text="Show pages" :tagStyle="0"/> |
| `previous` | If [`previous: true` is set on the piece page type](/reference/module-api/module-options.md#previous), the data object for the previous piece in sort order. | <AposTag text="Show pages" :tagStyle="0"/> |
| `query` | An object of query parameters from the request URL. | <AposTag text="All pages"/> |
| `scene` | A string indicating the active "scene," or general user context. Either `'public'` or `'apos'`. | <AposTag text="All pages"/> |
| `slug` | The active page's slug. | <AposTag text="All pages"/> |
| `url` | The active page's full relative URL, including query parameters. | <AposTag text="All pages"/> |
| `user` | When a user is logged in, a data object for the active user. `null` if logged out. | <AposTag text="All pages"/> <AposTag text="Widgets" :tagStyle="1"/> |
| `widget` | The widget data object in a widget template. | <AposTag text="Widgets" :tagStyle="1"/> |
<!-- TODO: Update `locale` with a link to localization info when available. -->
