---
permalink: '/guide/template-fragments'
---

# Fragments are the new macros

[Nunjucks macros](https://mozilla.github.io/nunjucks/templating.html#macro) are great tools for sharing template code across files. They have one significant limitation, however, in that they run synchronously. If you include template tags in them that run asynchronously, those tags will seem to not run at all when it comes to rendering.

This poses a challenge when using the new [async components](/guide/async-components) in Apostrophe 3. In addition, the [area syntax changed](/guide/major-changes.md#areas-and-pages) to support those async components, so areas won't work in synchronous macros either. To enable developers to continue writing maintainable, [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) code, A3 has a new feature, **fragments**.

## Macros are still supported

Before getting into fragment's syntax, it is important to make one thing clear right away:

**Macros aren't disabled or deprecated in A3.** Macros are still useful, and there is no great reason to force legacy projects to refactor macros that do not include areas already. Apostrophe developers can still use macros as they have been for simple and synchronous use cases.

As you'll see, fragment syntax intentionally mimics macro syntax. It shouldn't be too difficult to refactor macros as fragments if you choose. In fact, **the current best practice recommendation is to only use fragments**. The primary reason for this is simply so that you only need to remember one syntax. Fragments can do ([nearly](#fragment-limitations)) everything that macros can do, so it might be simpler to use that one feature rather than have to think each time which one you should use.

## Using fragments

With that out of the way, how do they work?

Fragments are defined with the `{% fragment %}` template tag, followed by a name for the fragment. The fragment closes with the `{% endfragment %}` tag.

```django
{% fragment heading() %}
  <h2>This is a heading fragment</h2>
{% endfragment %}
```

One difference from macros is that they are then called using the `render` template tag:

```django
{% render heading() %}
{# Renders: `<h2>This is a heading fragment</h2>` #}
```

You can also pass arguments to fragments, which is key to using them across templates. Those arguments can be any data or variables understood by Apostrophe templates (e.g., strings, objects, arrays, etc.).

```django
{% fragment heading(adjective) %}
  <h2>This is a {{ adjective }} fragment</h2>
{% endfragment %}

{% render heading('cool') %}
{# Renders: `<h2>This is a cool fragment</h2>` #}
```

## Importing fragments

As shown above, fragments can be defined and used in a single template file. That can be useful to break up complicated markup, but it is often better to put the fragment into its own file for reuse or to improve mantainability. Like any template file, fragments are placed in a module's `views` directory, or the root-level `views` directory in an Apostrophe project.

### Importing within a single module

For example, you might have an article [index page](/reference/glossary.md#index-page) that will list a series of linked article titles with rich text teasers. The index page template itself would be at the path `modules/article-page/views/index.html`. You could separate the markup for each item in the listing into a fragment file, `modules/article-page/views/item-fragment.html`.

```django
{# modules/article-page/views/item-fragment.html #}
{% fragment teaser(article) %}
  <section>
    <h2>{{ article.title }}</h2>
    {# 👇 Adding the article's `teaser` area field #}
    {% area article, 'teaser' %}
    <a href="{{ article._url }}">Read more</a>
  </section>
{% endfragment %}
```

Since the fragment and page template are both in the `article-page` module, we can import it with only the file name using the `{% import %}` template tag.

```django
{# modules/article-page/views/page.html #}
{% import 'item-fragment.html' as articleFragment %}

{% for article in data.pieces %}
  {# 👇 Rendering a heading and teaser for each article in the loop #}
  {% render articleFragment.teaser(article) %}
{% endfor %}
```

### Importing from a different module

We can import fragments into a separate module by adding the fragment file's module name in the `import` tag. This is what it might look like to import the article teaser fragment into a `press-page` index page template:

```django
{# modules/press-page/views/page.html #}
{# 👇 Importing our fragment from the `article-page` module #}
{% import 'article-page:item-fragment.html' as importedFragment %}

{% for article in data.pieces %}
  {% render importedFragment.teaser(article) %}
{% endfor %}
```

### Importing from the global `views` directory

The root-level `views` directory is directly accessible by all modules. In the page template examples above, we are extending the `layout.html` template without prefixing the file name with a module because it is located at `views/layout.html`. Similarly, you can place fragments directly in the root-level views directory, or in a sub-directory of it, and then import that fragment file without prefixing the file name.

```django
{# views/fragments/utilities.html #}
{% fragment heading(title) %}
  <h2 class="fancy">{{ title }}</h2>
{% endfragment %}
```

Then to import that fragment into any page or widget template the import tag would look exactly as if the fragment was in the same module.

```django
{# In any page or widget template file #}
{% import 'utilities.html' as utilityFragments %}

{% render utilityFragments.heading('Organization history') %}
{# This renders `<h2 class="fancy">Organization history</h2>` #}
```

## Fragment limitations

In comparing fragments to macros, it is worth noting a couple of macro features that are not *yet* supported in fragments.


### Default parameter values

Macros can include default values for their arguments. This is not currently available in fragments. As a work-around, you can set variables in fragments that are overwritten if the argument is provided.

```django
{% fragment emojiFact(emoji) %}
  {% set fav = emoji or '🦤' %}
  <p>
    My favorite emoji is {{ fav }}
  </p>
{% endfragment %}
```

### `with context`

You can add `with context` on the end of a macro import to make everything available in a template also available to the file it is importing. In Apostrophe, this can be useful to make the full `data` object available in macros. This is also not yet available in fragments.

Instead, make sure to pass the data needed in the fragment into the render tag declaration. Fragments can take multiple arguments.

```django
{% for article in data.pieces %}
  {#
    Including `data.page.themeColor` since the fragment won't automatically
    have access to `data.page`
  #}
  {% render articleFragments.teaser(article, data.page.themeColor) %}
{% endfor %}
```

::: warning
It is possible to pass the entire `data` object into a fragment as an argument. That is usually excessive, however, and could lead to a false sense of completeness. Unlike `with context`, passing `data` still leaves out any template variables set in the page template, for example. It's generally a better idea to be more specific with what you pass into a fragment.
:::