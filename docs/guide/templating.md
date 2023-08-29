---
prev:
  text: 'Pieces | Piece Pages'
  link: 'guide/piece-pages.md'
next:
  text: 'Layout templates'
  link: 'guide/layout-template.md'
---
# Working with templates

Templates are where code and content turn into web pages people can actually see and use. Apostrophe templates use the Nunjucks templating language and generally look like normal HTML markup with special tags and variables sprinkled throughout to render data.

Template files go in `views` directories, either as module subdirectories or at the project root.

![Screenshot of a file directory highlighting a default-page module views directory and the global views directory](/images/templating-views-dirs.jpg)

The root `views` directory will usually contain [a layout template](/guide/layout-template.md) and often [fragment templates](/guide/fragments.md). Templates in modules' `views` directories will usually be used only for their respective modules. [Widget](/guide/custom-widgets.md#widget-templates), [page](/guide/pages.md#page-template-essentials), and [piece page](/guide/piece-pages.md#the-index-page-template) templates are the main examples of that.

## How templates work together

To paraphrase [John Donne](https://en.wikipedia.org/wiki/John_Donne), no template is an island. Templates will always be used as a system. We do this with the **`extends`**, **`include`**, and **[`import`](/guide/fragments.md)** tags.

### Extending templates

When you use the `{% extends %}` tag in a template, it will inherit all of the markup and template blocks of the template it is extending. Any template blocks used in the *extending* template will replace matching blocks in the *extended* template.

For example, the layout template will often be structured like this:

``` nunjucks
{# views/layout.html #}
{% extends data.outerLayout %}

{% block beforeMain %}
  {# Page header markup and the main content area opening tag... #}
{% endblock %}

{% block main %}{% endblock %}

{% block afterMain %}
  {# The main content area closing tag and page footer... #}
{% endblock %}
```

Individual page type templates will extend that layout:

``` nunjucks
{# modules/default-page/views/page.html #}
{% extends "layout.html" %}{# 👈 Our template extension #}

{% block main %}
  {% area data.page, 'mainContent' %}
{% endblock %}
```

`page.html` *inherits* all of the markup and template blocks of `layout.html`. When it uses the `main` block, that *replaces* only the matching block from `layout.html`.

::: info
You may have noticed that the layout template above also extends another template. `data.outerLayout` is a core, base level template. See the [layout template](/guide/layout-template.md) guide for more on that.
:::

#### The `super()` tag

**You can also *add to* template block content, rather than completely replace it.** To do this, include a `super()` render tag at the beginning of a block. `super()` will render as the contents of the inherited block.

For example, this may be in your layout file:

``` nunjucks
{# views/layout.html #}

{% block main %}
<h1>{{ data.piece.title or data.page.title }}</h1>
{% endblock main %}
```

In my home page template I could extend the layout template and use `super()` to include that `h1` tag before new content markup:

``` nunjucks
{# modules/@apostrophecms/home-page/views/page.html #}

{% block main %}
  {{ super() }} {# 👈 That will render the <h1> tag above #}
  <div>
    {# ... additional home page content #}
  </div>
{% endblock %}
```

See another example [in the Nunjucks documentation](https://mozilla.github.io/nunjucks/templating.html#template-inheritance).

### Including templates

The `{% include %}` template tag pulls one template *into* another template. This can be useful to break large template files into pieces. For example, you might write your site footer in a template file: `views/footer.html`. The layout template could include that like so:

``` nunjucks
{# views/layout.html #}

{% block afterMain %}
  </main> {# Closing tag for the main block #}
  {% include "footer.html" %}
{% endblock %}
```

That footer template would render as part of the layout template.

See more about including templates [in the Nunjucks documentation](https://mozilla.github.io/nunjucks/templating.html#include).

### Referencing templates across modules

The `include` and `extends` tags in the examples above name "global templates," which are in the root `views` directory. As such, we can simply reference by file name: e.g., `{% extends "layout.html" %}` or `{% include "footer.html" %}`. You could do the same thing if both templates were in the *same* module directory (both in our `modules/default-page/views` directory).

In some cases, **we will need to extend or include a template file that belongs to a separate module**. In that case, we need to provide additional information so Apostrophe can find that template.

For example, we may have a default page type that includes a sidebar we want to use in other page types:

``` nunjucks
{# modules/default-page/views/page.html #}
{% extends "layout.html" %}

{% block main %}
  {# 👇 Sidebar that we'll reuse. #}
  <aside>
    {# Sidebar content... #}
  <aside />
  {# 👇 Content area that we'll replace. #}
  {% block content %}
    {% area data.page, 'main' %}
  {% endblock %}
{% endblock %}
```

Let's extend it in a contact page type to reuse that sidebar. We will only replace the `content` block. To do this, the `{% extend %}` tag must include the name of the default page module:

``` nunjucks
{% extends "default-page:page.html" %}

{% block content %}
  <h1>Contact info</h1>
  {# Contact information... #}
{% endblock %}
```

`{% extends "default-page:page.html" %}` tells Apostrophe that we are using the `page.html` template file that belongs to the `default-page` module. The same pattern applies when using the `include` tag.

::: tip
The Nunjucks templating language includes many tags and tools you can use in Apostrophe templates. These include:

- Adding conditional checks
- Looping over arrays
- Declaring variables
- Comparison and math operators

See the official [Nunjucks templating documentation](https://mozilla.github.io/nunjucks/templating.html) to see what is available.
:::
