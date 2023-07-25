---
prev:
  text: 'Static i10n'
  link: 'guide/localization/static.md'
next:
  text: 'Caching'
  link: 'guide/caching.md'
---
# Dynamic content localization

Dynamic content localization (or simply "content localization") refers to the process of translating and customizing Apostrophe site content for different locales. In most cases this is primarily a matter of translation, but it can be much more than that depending on the website.

While [static localization](static.md) involves rendering strings of text depending on the locale, content localization involves using entirely *different database documents* based on the locale. That may seem like technical trivia, but it can be helpful when thinking about the content creation process.

<!-- TODO: Update when the l10n API reference is available. -->
Content l10n also is generally done completely through the user interface. There is an API for localization which will be covered in reference material, but for now we'll focus on:
- the content editor's experience of localization
- developer tools to give visitors and editors navigation between locales ([skip to this](#template-data-for-l10n))

::: info
Localizing content is only possible if the Apostrophe app has configured locales. If you are looking for information on configuring locales, see the [localization landing page](index.md#configuring-locales). There is also a [glossary section](/reference/glossary.md#localization-terms) of related terms.
:::

## Localizing editable content

Before going into specifics of user interface, it is worth establishing some of the important concepts and patterns used in Apostrophe's content localization.

Localizing means that **we make a clone of the content for a new locale, then make changes specific to the new locale.** As mentioned earlier, this will often involve translation, switching out photos, adding information, and other content changes. Once the page or piece has a new locale version, website visitors using the new locale will be able to see that thing.

**Each page or piece in Apostrophe is initially created for only one locale.** Sometimes we don't go any further. It may not be necessary to localize a page about Canadian office holidays into Mandarin, for example. If the page or piece should be available in more locales, *then* we localize it. The only exceptions are [parked pages](/reference/module-api/module-options.md#park) and piece types with the `replicate: true` option.

Let's take a look at this process using a new page in the Apostrophe demo as an example. In this example we will have three locales configured:

<AposCodeBlock>

  ```javascript
    module.exports = {
      options: {
        locales: {
          en: {
            label: 'English'
            // The default locale since there is no prefix requirement.
          },
          fr: {
            label: 'French',
            prefix: '/fr'
          },
          es: {
            label: 'Spanish',
            prefix: '/es'
          }
        }
      }
    }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/i18n/index.js
  </template>
</AposCodeBlock>

### Creating the page in the active locale

We'll start in the default locale, `'en'`. If the hostname of this site was `example.com`, we'd be on the home page, `https://example.com`. When we create a page through the UI, there is now an indicator in the editor modal telling us what the active locale is.

![The page editor modal with a new "Locale: en" indicator at the top](/images/l10n/locale-in-editor-modal.png)

Now on the new page, we can note the new locale chooser on the right side of the admin bar, next to the user avatar. It is added to the interface when more than one locale is configured for the app. Here we can see that there are three locales on the website: English, French, and Spanish.

We haven't switched locales, so the "English" option is selected. There is also a green, filled dot next to the label, indicating that the page exists in that locale.

![The Apostrophe locale chooser with "English" selected"](/images/l10n/locale-chooser-ui.png)

If we switched over to French or Spanish now, we would be prompted to either localize it immediately or redirect to the home page.

In Edit mode the context bar menu includes a "Localize" option to start cloning this page into other locales.

![The edit menu for this page opened and including a localize option](/images/l10n/edit-mode-menu.png)

We are now led through a few steps in the "wizard modal" to localize the page.

1. **Choose whether to only localize this page, this page and any related documents, or only related documents.** "Related documents" may include new images you uploaded for this page, pieces that you connected to this page through a widget, or other such [relationships](/guide/relationships.md).
2. **Select the locales that should get clones of this page.**
3. **Confirm whether to localize only new related docs or all related docs** (overriding existing versions) with checkboxes to fine tune this selection.

![The localization wizard modal with options for what docs to localize](/images/l10n/step1.png)

![The localization wizard modal letting us choose locales](/images/l10n/step2.png)

![The localization wizard modal confirming settings](/images/l10n/step3.png)

Once confirmed, the page now exists in all three locales. We can see this by the updated indicators in the locale chooser.

![The Apostrophe locale chooser showing the page in all locales](/images/l10n/locale-chooser-updated.png)

We can then switch to another locale, make edits specific to that locale, and publish.

![The original page in the French locale, translated](/images/l10n/fr-localized-page.png)

## Template data for l10n

The Apostrophe user interface has a locale chooser for editors, but visitors to the website won't have access to that. We typically need to provide a way for visitors to switch to a version of the page they are on, but in a different locale. There are two properties on the `data` object in templates to help with this.

### `data.locale`

`data.locale` is simple. It will render as the locale code for the active locale. So if you're in the English (`'en'`) locale, it will return `'en'`.

### `data.localizations`

This property provides much more information. It will be an array of objects that include information about the current page context (or piece, when on a show page) in all the active locales. It will include special properties that can help build a locale switcher for visitors:

| Locale property | Description |
| ------- | ------- |
| `locale` | The locale code (e.g., `'en'`, `'es'`) |
| `label` | The configured label for the locale (e.g., "English", "Spanish") |
| `available` | A boolean value indicating whether the page has been added to this locale |
| `current` | A boolean value indicating whether this is the currently displayed locale |
| `_url` | An API route that will return the page's URL in the locale (if it exists there) |

The `_url` property is an API route, and not the actual URL, to avoid making too many requests. If a website had 20 locales configured then Apostrophe would need to make 20 requests to get the actual page URL in each one. The API route is predictable and redirects to the actual URL when hit.

Here is an example of `data.localizations` for the page from the screenshots above.

```javascript
[
  {
    _id: 'cksqi1ye1000mof3rdgtmvn0y:en:draft',
    title: 'Localized page 🇬🇧',
    slug: '/localized-page',
    type: 'default-page',
    visibility: 'public',
    aposLocale: 'en:draft',
    aposMode: 'draft',
    available: true,
    _url: '/api/v1/@apostrophecms/page/cksqi1ye1000mof3rdgtmvn0y:es:draft/locale/en',
    locale: 'en',
    label: 'English',
    homePageUrl: 'http://localhost:3000/'
  },
  {
    _id: 'cksqi1ye1000mof3rdgtmvn0y:fr:draft',
    title: 'Page localisée 🇫🇷',
    slug: '/localized-page',
    type: 'default-page',
    visibility: 'public',
    aposLocale: 'fr:draft',
    aposMode: 'draft',
    available: true,
    _url: '/api/v1/@apostrophecms/page/cksqi1ye1000mof3rdgtmvn0y:es:draft/locale/fr',
    locale: 'fr',
    label: 'French',
    homePageUrl: 'http://localhost:3000/fr/'
  },
  {
    _id: 'cksqi1ye1000mof3rdgtmvn0y:es:draft',
    title: 'Página localizada 🇪🇸',
    slug: '/localized-page',
    type: 'default-page',
    visibility: 'public',
    aposLocale: 'es:draft',
    aposMode: 'draft',
    available: true,
    _url: '/api/v1/@apostrophecms/page/cksqi1ye1000mof3rdgtmvn0y:es:draft/locale/es',
    current: true,
    locale: 'es',
    label: 'Spanish',
    homePageUrl: 'http://localhost:3000/es/'
  }
]
```

### Sample locale switcher template

Here is an example of using the `data.localizations` array to generate a locale switcher for a page.

``` njk
<div class="locales">
  {# A button to open the list of locales (nothing special here) #}
  <button class="locales__toggler" data-locales-toggle aria-expanded="false">
    Toggle locales 🌐
  </button>
  <ul class="locales__list" data-locales hidden>
    {# List of locales, looping over data.localizations #}
    {% for localization in data.localizations %}
      <li class="locales__item">
        {#
          Linking the locale name only when it exists in the locale and it's
          not the current locale
        #}
        {% if localization._url and not localization.current %}
          <a href="{{ localization._url or localization.homePageUrl }}">
        {% endif %}
        {# Using both the label and the locale code #}
        {{ localization.label }} ({{ localization.locale }})
        {% if localization._url and not localization.current %}
          </a>
        {% endif %}
      </li>
    {% endfor %}
  </ul>
</div>
```
