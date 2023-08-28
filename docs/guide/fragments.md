# Template fragments

We will often find that template code is reused across multiple files or that it simply gets overly complicated for a single file. **Template fragments** help solve this by splitting template code into smaller, managable pieces that can be used in other templates.

::: info
If you are already familiar with the [Nunjucks macro](https://mozilla.github.io/nunjucks/templating.html#macro) feature, fragments are very similar. Fragments are a new feature specific to Apostrophe to support asynchronous template tags, such as the [area](/guide/areas-and-widgets.md#adding-areas-to-templates) tag and [async components](/guide/async-components.md). If the code does *not* use either async components or areas, macros are also fine to use.

The only macros feature currently unavailable or unreplaced for fragments is passing the template context using `with context`. This is planned for fragments as well.
:::

## Using fragments

We define fragments by putting template markup between `{% fragment %}` and `{% endfragment %}` tags. The opening tag should also include a name for the fragment.

``` njk
{% fragment heading() %}
  <h2>This is a heading fragment</h2>
{% endfragment %}
```

To use the fragment in a template, reference it by name using the `{% render %}` tag:

``` njk
{% render heading() %}
{# Renders: `<h2>This is a heading fragment</h2>` #}
```

We can also pass arguments to fragments, allowing us to reuse them across templates with different data.

``` njk
{% fragment heading(adjective) %}
  <h2>This is a {{ adjective }} fragment</h2>
{% endfragment %}

{# 👇 Passing in a string argument #}
{% render heading('cool') %}
```

Fragment arguments can be any data or template variables understood by Apostrophe templates (e.g., strings, objects, arrays, etc.). It can often be useful to pass a [doc object](/reference/glossary.md#doc) to a macro to render its areas, especially when docs are referenced in [relationships](/guide/relationships.md).

``` njk
{% fragment authorCredit(author) %}
  <div>
    <p>By {{ author.title }}</p>
    {% area author, 'photo' %}
  </div>
{% endfragment %}

{# 👇 Passing in a piece object from a relationship field #}
{% render authorCredit(data.piece._author) %}
```

<!-- ::: tip
Fragments also support keyword arguments, another [feature of Nunjucks macros](https://mozilla.github.io/nunjucks/templating.html#keyword-arguments). They can be used to establish default argument values as well as to skip positional arguments.

``` njk
{% fragment listNumbers(first, second, third=3, fourth=4) %}
  <p>{{ first }} {{ second }} {{ third }} {{ fourth }}</p>
{% endfragment %}

{% render listNumbers(1, 2) %}
{# Renders: `<p>1 2 3 4</p> #}

{% render listNumbers(1, third=9) %}
{# Renders: `<p>1  9 4</p> #}
```
::: -->

::: warning
It is possible to pass the entire `data` object into a fragment as an argument. That is usually excessive, however. It's generally a better idea to be more specific with what you pass into a fragment.
:::

## Importing fragments across files

The examples above simply render the fragments by name since they were defined in the same file. That can be useful sometimes, but it is more common to define fragments in different files from where they are used. This works very similarly to how template files are [extended or included](/guide/templating.md#referencing-templates-across-modules) across files. In this case, we use the `{% import %}` tag.

### Importing within the same module or the root `views` directory

As when we `include` or `extend` another template file, when that file is in the project root `views` directory or from the same module as where we're working, we only need to name the file or relative file path.

For example, you might have an article [index page](/guide/piece-pages.md) that lists a series of linked article titles with rich text teasers. The index page template itself would be at the path `modules/article-page/views/index.html`. You could separate the markup for each article in the listing into a fragment file, `modules/article-page/views/item-fragment.html`.

``` njk
{# modules/article-page/views/item-fragment.html #}
{# 👇 Accepting an argument with the article data object #}
{% fragment teaser(article) %}
  <section>
    <h2>{{ article.title }}</h2>
    {% area article, 'teaser' %}
    <a href="{{ article._url }}">Read more</a>
  </section>
{% endfragment %}
```

Since the fragment and page template are both in the `article-page` module, we can import it with only the file name using the `{% import %}` template tag.

``` njk
{# modules/article-page/views/index.html #}
{% import 'item-fragment.html' as articleFragment %}

{% for article in data.pieces %}
  {# 👇 Rendering a heading and teaser for each article in the loop #}
  {% render articleFragment.teaser(article) %}
{% endfor %}
```

::: info
Unlike importing and extending templates, when importing, the fragment is a property of the imported file, e.g, `articleFragment.teaser()`. This allow us to define multiple fragments in a single file, then import the one file and use any inside it.

``` njk
{# modules/article-page/views/show.html #}
{% import 'fragments.html' as articleFragments %}

<h1>{{ data.piece.title }}</h1>
{# Maybe one fragment in the file has author credit markup: #}
{% render articleFragments.author(data.piece._author) %}
{# And another handles the article topic tags: #}
{% render articleFragments.topicTags(data.piece.tags) %}
```
:::

Similarly, **when fragment files are in the root-level `views` directory** or a sub-directory of it, we can import the fragment with only the relative file path from that `views` directory.

The global fragment file:

``` njk
{# views/fragments/utilities.html #}
{% fragment heading(title) %}
  <h2 class="fancy">{{ title }}</h2>
{% endfragment %}
```

Importing the fragment into any page or widget template would look exactly as if the fragment was in the same module.

``` njk
{# In any page or widget template file #}
{% import 'fragments/utilities.html' as utilities %}

{% render utilities.heading('Organization history') %}
{# Renders: `<h2 class="fancy">Organization history</h2>` #}
```

### Importing from a different module

To import template fragments from one module into templates of another module, include the fragment file's module name in the `import` tag. This is what it might look like to import the article teaser fragment from above into a `press-page` index page template:

``` njk
{# modules/press-page/views/index.html #}
{# 👇 Importing our fragment from the `article-page` module #}
{% import 'article-page:item-fragment.html' as importedFragment %}

{% for article in data.pieces %}
  {% render importedFragment.teaser(article) %}
{% endfor %}
```

In this case, the file name is prefixed with `article-page:`, indicating the source module for the template fragment.

## Inserting markup with `rendercall`

In addition to passing arguments, it is possible to pass markup directly from a template into a fragment it is using. The fragment must first include `rendercaller()`. This will be the location where the calling template will insert markup.

``` njk
{# /views/fragments/utilities.html #}
{% fragment highlighter %}
  <aside class="highlight">
    {# 👇The inserted markup will slot in here, inside the `aside` tags. #}
    {{ rendercaller() }}
  </aside>
{% endfragment %}
```

When using the fragment, a template would use `{% rendercall %}` instead of `{% render %}`.

``` njk
{# modules/default-page/views/page.html #}
{% import 'fragments/utilities.html' as utilities %}

{% rendercall utilities.highlighter() %}
  Fun fact: {{ data.page.funFact }}
{% endrendercall %}
```

This might render something like:

```html
<aside class="highlight">
  Fun fact: The first ever ice cream sundae was served in Two Rivers, Wisconsin in 1881.
</aside>
```

