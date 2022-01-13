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

Each locale should get its own JSON file using the locale name, in a `i18n` subdirectory of a module that has internationalization active.

Like all modules, we would need to activate this module in `app.js`, even if we don't need an `index.js` file. Our JSON files would be:

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
The primary module to avoid using to store l10n strings for project-level text is `@apostrophecms/i18n`, the actual internationalization module. This is used by Apostrophe core for the user interface and it uses a namespace to keep its l10n keys separate from project-level localization.
:::

## Using namespaces

A l10n **namespace** is a prefix on localization keys that makes it harder to accidentally override. In project-level l10n namespacing is *not really necessary* since there are not additional layers of work that might override translation there.

Namespacing can be useful if you are building your own modules with hard-coded strings that you intend to publish. When that module is installed in a project later it would be less likely that the project will change them accidentally.

To use a l10n namespace, first choose a namespace name. Let's say it's `ourTeam`. Then create an `i18n/ourTeam` subdirectory inside your module, and populate it with `.json` files.

::: warning
Although you can set the `i18n.ns` option of the module instead to determine the namespace for `.json` files placed directly in `i18n/`, we do not recommend this legacy approach because it can break localization of text inherited from another module. Use the subdirectories.
:::

<AposCodeBlock>
  ```json
  {
    "relatedArticles": "Related articles"
  }
  ```
  <template v-slot:caption>
    /modules/localization/i18n/ourTeam/en.json
  </template>
</AposCodeBlock>

**You do not need to include the namespace name in the contents of the l10n JSON files themselves.** Apostrophe will know the namespace already based on the directory name.

Then when you use the localization keys in template files (or elsewhere), start each key with the namespace:

```django
<h2>__t('ourTeam:relatedArticles')</h2>
```

Apostrophe will then treat keys with the namespace differently from the same key without the namespace (`ourTeam:relatedArticles` vs. `relatedArticles`). If someone uses the version *without* the namespace it will not overwrite the version *with* the namespace.

::: warning
Avoid using namespaces that begin with `apos`. The core team uses namespaces that begin with that for official modules, e.g., `aposForm` and `aposSeo`. Using that prefix is not technically forbidden, but it could result in conflicts with official modules. Using the `apostrophe` namespace should definitely be avoided since it is used in Apostrophe core.

As a reminder, namespacing is primarily necessary for *installable modules* and not for project-level localization.
:::

## Localizing the Apostrophe user interface

The Apostrophe user interface contains many registered strings, currently localized to English and a few other languages. We will be working to provide more localization files, but if you are interested in adding l10n files to your project for the UI, you are welcome to do that. Localizing text in your own **custom** admin UI modules is a separate topic which we'll address later.

To localize Apostrophe's existing user interface strings, add JSON files for the locales to a project-level `modules/@apostrophecms/i18n/apostrophe` directory. You can also do this in any other module as long as you use an `i18n/apostrophe` subdirectory within that module, keeping these localizations separate from your project level strings. The core UI keys all use this namespace. Note that separately installed npm modules may use other namespaces, which you can see in the source code. You can create subdirectories for these as well.

In each JSON file, copy the contents of [the Apostrophe core l10n file](https://github.com/apostrophecms/apostrophe/blob/main/modules/@apostrophecms/i18n/i18n/en.json) to get all the keys. You can then start translating each string.

Of course, this can be a lot of work and would likely involve tracking down where strings are used for testing purposes. If you are interested in being part of translating the UI for a language that isn't supported yet, please contact us in [Discord](http://chat.apostrophecms.com) or at [help@apostrophecms.com](mailto:help@apostrophecms.com) so we can coordinate efforts and let the whole community benefit.

### Localizing your own custom Apostrophe user interface modules

If you are [writing your own extensions to the Apostrophe user interface](../custom-ui.md), you will want to localize strings there just as you would in any module, with the following additions:

* You should use a custom namespace for your strings, to avoid any confusion with our official `apostrophe` namespace.
* You'll need to set `browser: true` for your namespace, as shown below. Doing this in any module will ensure strings for this namespace make it to the browser for the admin UI.
* You'll need to know how to access your phrases in your custom Vue admin UI components.

Here is an example module `index.js` file that sets the `browser: true` flag for a namespace:

<AposCodeBlock>

  ```javascript
  module.exports = {
    // Note this is at top level, not under options
    i18n: {
      ourTeamUI: {
        browser: true
      }
    }
  };
  ```
  <template v-slot:caption>
    /modules/team-ui/index.js
  </template>
</AposCodeBlock>

Once that file is in place we can populate the `/modules/team-ui/i18n/ourTeamUI` folder with JSON files as described earlier.

To access our phrases in our custom admin UI Vue components, we invoke `this.$t()` when writing Vue methods, or just `$t()` when in the template block. In all other respects invoking `$t()` works the same way as `__t()`, discussed earlier.

::: note
As a reminder, the Vue.js components of the user interface are not connected to any Vue app you may be running for your website visitors. The registration method will not be automatically available outside the UI components.
:::

## Debugging localization

There are two environment variables developers can use to debug during localization.

### `APOS_DEBUG_I18N`

Starting Apostrophe with the `APOS_DEBUG_I18N=1` environment variable will trigger the `i18next` debugging mode. This provides information about the i18n settings that may help resolve issues.

### `APOS_SHOW_I18N`

Using the `APOS_SHOW_I18N=1` environment variable adds emoji indicators to localized strings. For example, the localized string "Images" would be displayed as "🌍 Images." These help identify that text in a web page (or logged errors) have been passed through localization. Different emojis indicate additional information.

| Emoji indicator | Meaning |
|-----|----|
| 🌍 | The string used a localization key and is registered with a value. |
| 🕳️ | The displayed string is identical to the string passed into localization. It also *does not* seem to be using a l10n namespace.
| ❌ | The displayed string is identical to the string passed into localization. It also *does* seem to be using a l10n namespace. Look for a module using the string's namespace (the part before `:`).

For 🕳️ and ❌ indicators those are likely either localization keys that have not yet been registered with values (e.g., not translated) or they are not localization keys at all. Those do not necessarily indicate a problem, but simply are meant to give developers more information if a problem occurs.
