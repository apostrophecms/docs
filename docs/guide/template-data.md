# Template data

All Apostrophe template files have access to a `data` object. It contains content data as well as additional information such as the page's URL and the active user. Some properties differ depending on the template type (e.g., `data.widget` is only available in widget templates).

The table below lists the data properties available from Apostrophe core as well as the template types where they are available.

::: note
**Template type indicators:**
- <AposTag text="Page"/>: The property is present in all page templates, including piece index pages.
- <AposTag text="Show page" :tagStyle="0"/>: The property is present in piece show page templates.
- <AposTag text="Widget" :tagStyle="1"/>: The property is present in widget templates.
:::
| Property | Description | Templates where present |
|----------|-------------|----------------|
| `absoluteUrl` | The complete URL currently displayed, including base URL (with prefix, if set) and query parameters. | <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/> <AposTag text="Widget" :tagStyle="1"/> |
| `aposBodyDataAttributes` | A string of JSON that Apostrophe applies to the `body` tag as data attributes. Used by the UI app. | <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/> <AposTag text="Widget" :tagStyle="1"/> |
| `baseUrl` | The site's configured `baseUrl` value. Typically the website's domain. | <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/> <AposTag text="Widget" :tagStyle="1"/> |
| `baseUrlWithPrefix` | The `baseUrl` value, plus the site's `prefix` value, if set. | <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/> <AposTag text="Widget" :tagStyle="1"/> |
| `bestPage` | Usually the same as `data.page`. If no page is found for the URL (e.g., a 404 page) it will be the data object for the page that best matches the slug, going back to the home page. | <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/> <AposTag text="Widget" :tagStyle="1"/> |
| `contextOptions` | An object of [context options](/guide/areas-and-widgets.md#passing-context-options), if passed in.| <AposTag text="Widget" :tagStyle="1"/> |
| `edit` | An alias of `data.bestPage._edit`, indicating whether the active user has editing permissions for the `data.bestPage` document. | <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/>|
| `global` | The data object for the global doc. | <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/> <AposTag text="Widget" :tagStyle="1"/> |
| `home` | The data object for the home page. | <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/> <AposTag text="Widget" :tagStyle="1"/> |
| `locale` | The active locale.| <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/> <AposTag text="Widget" :tagStyle="1"/> |
| `manager` | In widget templates, the widget module manager object. | <AposTag text="Widget" :tagStyle="1"/> |
| `next` | If `next: true` is set on the piece page type, the data object for the next piece in sort order. | <AposTag text="Show page" :tagStyle="0"/> |
| `options` | | <AposTag text="Widget" :tagStyle="1"/> |
| `outerLayout` | A reference path to the outer layout template. Used in [layout templates](/guide/layout-template.md). | <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/> |
| `page` | A data object for the active page *or* the index page in show page templates. | <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/> <AposTag text="Widget" :tagStyle="1"/> |
| `piece` | The piece data object in a show page template. | <AposTag text="Show page" :tagStyle="0"/> |
| `previous` | If `previous: true` is set on the piece page type, the data object for the previous piece in sort order. | <AposTag text="Show page" :tagStyle="0"/> |
| `query` | An object of query parameters from the request URL. | <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/> |
| `scene` | A string indicating the active "scene," or general user context. Either `'public'` or `'apos'`. | <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/> |
| `slug` | The active page's slug. | <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/> |
| `url` | The active page's full relative URL, including query parameters. | <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/> |
| `user` | When a user is logged in, a data object for the active user. `null` if logged out. | <AposTag text="Page"/> <AposTag text="Show page" :tagStyle="0"/> <AposTag text="Widget" :tagStyle="1"/> |
| `widget` | The widget data object in a widget template. | <AposTag text="Widget" :tagStyle="1"/> |
<!-- TODO: Update `locale` with a link to localization info when available. -->
