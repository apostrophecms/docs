# Localization in Apostrophe

For Apostrophe, "localization," often abbreviated as **l10n**, is the process of adapting the Apostrophe user interface and Apostrophe website content for different "locales," or groups of people (usually based on language and country). This can include text translation, date formats, content variation, and much more.

Localizing Apostrophe websites is done in two contexts:

- **Static content**: localizing "hard-coded" text and other information. This primarily involves strings in template files and the Apostrophe user interface components. This will usually involve a developer, though translation will likely be done by other people. [See the related guide for more on this.](static.md)
- **Dynamic content**: translating and generally customizing content controlled through the user interface. Depending on the website needs, this may mean direct translation between locales, but may also mean major content changes for the different groups of people. This work is usually done by content editors and translators. [See the related guide for more on this.](dynamic.md)

::: note What about "internationalization"?
The term "internationalization," often abbreviated **i18n** comes up when discussing this as well. And for good reason. See [the localization section of the glossary](/reference/glossary.md#localization-terms) for a quick overview of how we use these terms. Put simply, we use "internationalization" to refer to the system that supports the localization processes. That's why the core Apostrophe modules is `@apostrophecms/i18n`.
:::

## Configuring locales

The first step in localizing content, whether static or dynamic, is to define locales. These are most often different languages, countries, or combinations of the two. In some cases locales it may also be appropriate to establish locales for people based on topical interests, professional categories, or cultural identities.


We configure locales through the `@apostrophecms/i18n` module. In a project code base, we can add a `modules/@apostrophecms/i18n/index.js` file. The locales will go in its `locales` option object.

<AposCodeBlock>
  ```javascript
    module.exports = {
      options: {
        locales: {}
      }
    }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/i18n/index.js
  </template>
</AposCodeBlock>

**Each locale needs a short identifier**, which is typically a two letter country code, language code, or one of each with a dash separating them. This will be the object key for each locale. For example, if we had a USA-based business working across North America we might have locales for US/general English speakers (`'en'`) and Spanish speakers (`'es'`), residents of Mexico using Spanish (`'es-MX'`), Canadian French speakers (`'fr-CA'`), and Canadian English speakers (`'en-CA'`). The `label` property is used in the user interface.

<AposCodeBlock>
  ```javascript
    module.exports = {
      options: {
        locales: {
          en: {
            label: 'English'
          },
          es: {
            label: 'Spanish'
          },
          'es-MX': {
            label: 'Spanish (Mexico)'
          },
          'fr-CA': {
            label: 'French (Canada)'
          },
          'en-CA': {
            label: 'English (Canada)'
          }
        }
      }
    }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/i18n/index.js
  </template>
</AposCodeBlock>

::: note
- Locale names (e.g., `'en'`, `'fr-CA'`) must begin with an alphabetic (non-numeric) character.
- The best practice for locale names is to use a two-character language code (`'en'`) or the language code with two character country code, capitalized (`'en-GB'`). This will improve compatibility with i18n features as they are added to Apostrophe.
:::

There's one thing left to configure these locales for use: We need to tell Apostrophe how to identify which one to use. This is done based on the URL used to access the website, either by the URL **hostname**, the URL path **prefix**, or a combination of the two.

<AposCodeBlock>
  ```javascript
    module.exports = {
      options: {
        locales: {
          en: {
            label: 'English'
          },
          es: {
            label: 'Spanish',
            prefix: '/es'
          },
          'es-MX': {
            label: 'Spanish (Mexico)',
            hostname: 'example.mx'
          },
          'fr-CA': {
            label: 'French (Canada)'
            hostname: 'example.ca',
            prefix: '/fr'
          },
          'en-CA': {
            label: 'English (Canada)'
            hostname: 'example.ca',
            prefix: '/en'
          }
        }
      }
    }
  ```
  <template v-slot:caption>
    modules/@apostrophecms/i18n/index.js
  </template>
</AposCodeBlock>

::: note
If `hostname` is used for any locale:
- a `baseUrl` must be set on the application, defining the default hostname, OR
- a `hostname` setting must be used on all locales

For this example we'll assume we have `baseUrl: 'example.com'` set on the application.
:::

So how does Apostrophe choose the best locale to use? In many cases it is clear. If there is conflict, however, the best locale uses the following prioritization:
1. The locale matches *both* the URL's `hostname` *and* path `prefix`.
2. The locale matches the URL's `hostname` only.
3. The locale matches the URL's path `prefix` only.
4. The locale is higher in the configuration object.
5. The locale is the default locale (when no other locale matches).

## The default locale

The default locale is the locale used when no others matche the URL better. It is typically the locale used by your website's primary audience. **If no locales are configured, Apostrophe will use `'en'` as the default locale name.**

The default locale can be changed in one of the following ways:
- Configuring one locale (ideally the first) with *no* `prefix` or `hostname` properties
- Making sure no lower-specificity locales appear earlier in the `locales` configuration
- Using [the `defaultLocale` option](/reference/modules/i18n.md) on the `@apostrophecms/i18n` module to name another locale

::: warning
It is important to configure locales, especially the default locale, before content entry begins. This is especially the case if your locales will not include `'en'`. If content entry begins on the default `'en'` locale and we later configure locales that do not include `'en'`, that original content will disappear.
:::

With locales configured, the next step is to proceed with actual content localization. See the following guides on [static](static.md) and [dynamic](dynamic.md) localization.
