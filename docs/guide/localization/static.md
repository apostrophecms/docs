# Static content localization

This section covers localization of strings throughout template files and Apostrophe user interface. These strings are hard-coded, not editable by logged-in users, and thus are not stored in the database. Instead, this localization is stored in JSON files associated with the various locales.

## Registering strings to localize

There are often good reasons to hard-code text in templates even if we operate in multiple languages. For example, if our website has a blog with related articles featured at the bottom of each post using a relationship field. The heading "Related articles" belongs in the show page template. We don't want to make content editors translate that each time and we want to avoid creating any custom global fields for a text string that is not likely to change.

That section of our show page template might look like this:

<AposCodeBlock>
  ```django
    {# More article template stuff above ⤴ #}
    <section>
      <h2>Related articles</h2> {# 👈 We need to register this. #}
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

Registering that string is as easy as wrapping it in a template method: `__t()`. Make sure the string passed to the method is in quotes and any matching quotes in the string are escaped (e.g., `__t('Gritty\'s friends')`).

<AposCodeBlock>
  ```django
    {# More article template stuff above ⤴ #}
    <section>
      <h2>__t('Related articles')</h2> {# 🎉 It's registered! #}
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

In that example, we passed the actual text to the localization method. This has the benefit that it will be automatically used for the default locale and any other locales that don't translate it.

Our other option is to use a **localization key that is different from the original text**. Taking our example, that heading tag might instead look like:

```django
<h2>__t('relatedArticles')</h2>
```

This method is better if your team prefers to maintain all hard-coded strings in the same way across locales (treating the default locale the same as others). Using the original text as the key, as in our previous example, might be better so that translators can see the original text alongside their translations in the JSON files. It mostly depends how you prefer to work. The important thing is to be consistent.

### Registering text outside of templates

Two other places you may want to register strings are in **API routes** and in Vue.js **user interface components**.

To register strings in **custom API routes**, use the `req.t()` method on the request object.

<AposCodeBlock>
  ```javascript
  // modules/product/index.js
  module.exports = {
    // ...
    apiRoutes(self) {
      return {
        get: {
          // GET /api/v1/product/newest
          async newest(req) {
            const product = await self.find(req).sort({ createdAt: -1 }).toObject();
            if (!product) {
              // 👇 The 404 error is registered with req.t()
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

If you are customizing Apostrophe **user interface components**, the `$t()` method is available in the component (used as `this.$t()`) outside the template block.

<!-- TODO: Link to UI customization guide when available. -->

::: note
As a reminder, the Vue.js components of the user interface are not connected to any Vue app you may be running for your website visitors. The registration method will not be automatically available outside the UI components.
:::

## Adding and using localization files

## Localizing the Apostrophe user interface

## Using namespaces
