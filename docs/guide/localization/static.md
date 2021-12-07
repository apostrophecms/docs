# Static string localization

This section covers localization of strings throughout template files and Apostrophe user interface. These strings are hard-coded, not editable by logged-in users, and thus are not stored in the database. Instead, this localization is stored in JSON files associated with the various locales.

::: note
Localizing static strings is only possible if the Apostrophe app has configured locales. If you are looking for information on configuring locales, see the [localization landing page](README.md#configuring-locales). There is also a [glossary section](/reference/glossary.md#localization-terms) of related terms.
:::

## Localizing strings

There are often good reasons to hard-code text in templates even if we operate in multiple languages. For example, if our website has a blog with related articles featured at the bottom of each post using a relationship field. The heading "Related articles" belongs in the show page template. We don't want to make content editors translate that each time and we want to avoid creating any custom global fields for a text string that is not likely to change.

That section of our show page template might look like this:

<AposCodeBlock>
  ```django
    {# More article template stuff above ⤴ #}
    <section>
      <h2>Related articles</h2> {# 👈 We need to localize this. #}
      <ul>
        {% for post in data.piece._related %}
          <li><a href="{{ post._url }}">{{ post.title }}</a></li>
        {% endfor %}
      </ul>
    </section>
  ```
  <template v-slot:caption>
    /modules/article-page/views/show.html
  </template>
</AposCodeBlock>

Localizing that string is as easy as wrapping it in a template helper: `__t()`. Make sure the string passed to the helper is in quotes and any matching quotes in the string are escaped (e.g., `__t('Gritty\'s friends')`).

<AposCodeBlock>
  ```django
    {# More article template stuff above ⤴ #}
    <section>
      <h2>{{ __t('Related articles') }}</h2> {# 🎉 It's localized! #}
      <ul>
        {% for post in data.piece._related %}
          <li><a href="{{ post._url }}">{{ post.title }}</a></li>
        {% endfor %}
      </ul>
    </section>
  ```
  <template v-slot:caption>
    /modules/article-page/views/show.html
  </template>
</AposCodeBlock>

In that example, we passed the actual text to the localization helper. This has the benefit that it will be automatically used for the default locale and any other locales that don't translate it.

Our other option is to use a **localization key that is different from the original text**. Taking our example, that heading tag might instead look like:

```django
<h2>{{ __t('relatedArticles') }}</h2>
```

This method is better if your team prefers to maintain all hard-coded strings in the same way across locales (treating the default locale the same as others). Using the original text as the key, as in our previous example, might be better so that translators can see the original text alongside their translations in the JSON files. It mostly depends how you prefer to work. The important thing is to be consistent.

### Registering text outside of templates

Two other places you may want to register strings are in **API routes** and in Vue.js **user interface components**.

To register strings in **custom API routes**, use the `req.t()` method on the request object.

<AposCodeBlock>

  ```javascript
  module.exports = {
    // ...
    apiRoutes(self) {
      return {
        get: {
          // GET /api/v1/product/newest
          async newest(req) {
            const product = await self.find(req).sort({ createdAt: -1 }).toObject();
            if (!product) {
              // 👇 Sends a localized version of the error with req.t()
              throw self.apos.error('notfound', req.t('No products were found.'));
            }

            return { product };
          }
        }
      };
    }
  };
  ```
  <template v-slot:caption>
    /modules/product/index.js
  </template>
</AposCodeBlock>

::: tip
There is currently no browser method available to register strings in project client-side JS. A good alternative is to create an API route that returns localized strings then use the response from that route in client-side JS.
:::

If you are customizing Apostrophe **user interface components**, the `$t()` method is available in the component (used as `this.$t()` outside the template block).

<!-- TODO: Link to UI customization guide when available. -->

::: note
As a reminder, the Vue.js components of the user interface are not connected to any Vue app you may be running for your website visitors. The registration method will not be automatically available outside the UI components.
:::

### Localizing with string interpolation

Consider the following string: "*Contact the London office*." Maybe we have offices in multiple countries and use this heading on each office's page. In this case we don't know the *exact* string to translate since the city will change. The variable part, the city, is also in the middle (for some languages, at least) so we could not even translate the rest very easily. In cases like this we use **string interpolation**.

String interpolation is a process of generating a text string that is partly dynamic. In the previous paragraph's example, the city name is dynamic, or variable, since it is reused for each office.

Regardless of whether we are localizing text in templates, server-side code, or UI Vue files, interpolation works essentially the same way. The string or localization key is still the first argument in the localization function. **Then an object is passed as a second argument to the l10n function, containing interpolation properties that match keys in curly braces.**

Template example:

<AposCodeBlock>
  ```django
    {{ __t('Contact the {{ city }} office', {
      city: data.piece.city
    }) }}
  ```
  <template v-slot:caption>
    /modules/office-page/views/show.html
  </template>
</AposCodeBlock>

The arguments would look essentially identical in server-side or a UI file, using the respective l10n functions (`req.t()` and `this.$t()`, respectively). This also works if the first argument was a localization key that had that string assigned as its value.

<AposCodeBlock>
  ```json
    {
      "contactOffice": "Contact the {{ city }} office"
    }
  ```
  <template v-slot:caption>
    /modules/office-page/i18n/en.json
  </template>
</AposCodeBlock>

<AposCodeBlock>
  ```django
    {{ __t('contactOffice', {
      city: data.piece.city
    }) }}
  ```
  <template v-slot:caption>
    /modules/office-page/views/show.html
  </template>
</AposCodeBlock>

See the [i18next documentation](https://www.i18next.com/translation-function/interpolation) for more available options.

## Adding and using localization files

Now that there are strings to localize, we need to add JSON files for locales with the strings and their translations. For the purposes of our example we will assume we have two locales: `'en'` (English) and `'es'` (Spanish).

Each locale should get its own JSON file using the locale name, in a `i18n` subdirectory of a module that has internationalization active. Configure that module with the [`i18n` option](/reference/module-api/module-options.md#i18n), such as:

<AposCodeBlock>
  ```javascript
  module.exports = {
    options: {
      i18n: true
    }
  };
  ```
  <template v-slot:caption>
    /modules/localization/index.js
  </template>
</AposCodeBlock>

**If the l10n strings will be used in the user interface**, set the `i18n` option to an object with `browser: true`. *This includes any piece type and page type labels* that will appear in the UI. If that is not present then the UI build process will ignore the l10n JSON file. This is only appropriate for Apostrophe UI strings as they are only available when logged-in and, as noted above, there is no utility for localizing strings in other client-side JavaScript.

<AposCodeBlock>
  ```javascript
  module.exports = {
    options: {
      i18n: {
        browser: true
      }
    }
  };
  ```
  <template v-slot:caption>
    /modules/localization/index.js
  </template>
</AposCodeBlock>

Like all modules, we would need to activate this in `app.js`. Our JSON files would be:

- `modules/localization/i18n/en.json`
- `modules/localization/i18n/es.json`

::: tip
These files can be spread across modules if you like. For example you might want to localize strings from a particular module's template files in that module directory. Like with many things, this depends how you and your team like to work.

It's important to note that **if the same key is used in multiple template files they will be rendered to the same string**. It does not matter if each template has a localization JSON file with that key registered.
:::

Each JSON file will include key/value pairs with the localization key and a string that should replace the localization key.

If the only localization key we registered in our project was `relatedArticles` from above, our files would look like:

<AposCodeBlock>
  ```json
  {
    "relatedArticles": "Related articles"
  }
  ```
  <template v-slot:caption>
    /modules/localization/i18n/en.json
  </template>
</AposCodeBlock>

<AposCodeBlock>
  ```json
  {
    "relatedArticles": "Artículos relacionados"
  }
  ```
  <template v-slot:caption>
    /modules/localization/i18n/es.json
  </template>
</AposCodeBlock>

When rendering the show page template, Apostrophe will look in these files, find the registered key and replace it with the correct string based on the active locale.

::: warning
The primary module to avoid using to store l10n strings is `@apostrophecms/i18n`, the actual internationalization module. This is used by Apostrophe core for the user interface and it uses a namespace to keep its l10n keys separate from project-level localization.
:::

## Using namespaces

A l10n **namespace** is a prefix on localization keys that makes it harder to accidentally override. In project-level l10n namespacing is *not really necessary* since there are not additional layers of work that might override translation there.

Namespacing can be useful if you are building your own modules with hard-coded strings that you intend to publish. When that module is installed in a project later it would be less likely that the project will change them accidentally.

To use a l10n namespace, include it in the `i18n` option object in the module where your JSON files are with the `ns` setting.

<AposCodeBlock>
  ```javascript
  module.exports = {
    options: {
      i18n: {
        ns: 'myTeam'
      }
    }
  };
  ```
  <template v-slot:caption>
    /modules/localization/index.js
  </template>
</AposCodeBlock>

**You do not need to include this namespace in the l10n JSON files.** If the JSON files are in the module directory where this setting appears, Apostrophe will know that the keys in those files should be namespaced.

Then when you use the localization keys in template files (or elsewhere), start each key with the namespace:

```django
<h2>__t('myTeam:relatedArticles')</h2>
```

Apostrophe will then treat keys with the namespace differently from the same key without the namespace (`myTeam:relatedArticles` vs. `relatedArticles`). If someone uses the version *without* the namespace it will not overwrite the version *with* the namespace.

::: warning
Avoid using namespaces that begin with `apos`. The core team uses namespaces that begin with that for official modules, e.g., `aposForm` and `aposSeo`. Using that prefix is not technically forbidden, but it could result in conflicts with official modules. Using the `apostrophe` namespace should definitely be avoided since it is used in Apostrophe core.

As a reminder, namespacing is primarily necessary for *installable modules* and not for project-level localization.
:::

## Localizing the Apostrophe user interface

The Apostrophe user interface contains many registered strings, currently localized to English. We will be working to provide more localization files, but if you are interested in adding l10n files to your project for the UI, you are welcome to do that.

Add JSON files for the locales as normal in the project-level `modules/@apostrophecms/i18n` module directory. You can also use any other module configured to use the `'apostrophe'` namespace (keeping project strings separate). The UI keys all use this namespace. In each JSON file, copy the contents of [the Apostrophe core l10n file](https://github.com/apostrophecms/apostrophe/blob/main/modules/@apostrophecms/i18n/i18n/en.json) to get all the keys. You can then start translating each string.

Of course, this would be a lot of work and would likely involve tracking down where strings are used. If you are interested in being part of translating the UI for a language that isn't supported yet, please contact us in [Discord](http://chat.apostrophecms.com) or at [help@apostrophecms.com](mailto:help@apostrophecms.com) so we can coordinate efforts and let the whole community benefit.
