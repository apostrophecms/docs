---
title: 'Templating'
---

# Working with Templates

Templates are where code and content turn into web pages people can actually see and use. Apostrophe templates use the Nunjucks templating language and generally look like normal HTML markup with special tags and variables sprinkled throughout to render data.

Template files go in `views` directories, either in individual module directories or at the project root.

## Global templates

Global templates go in a `views` directory at the project root. Generally speaking, templates in the root `views` directory are either:

1. layout templates, such as `layout.html`
2. used in many other template, such as [fragments or macros](/guide/templating/fragments.md)

### Layout templates

Layout templates are the most common global templates. As the name suggests, these **provide the outer structure for pages**. While individual page type templates insert data for the pages, the main layout template will likely include sitewide features. **Website navigation and footers** are both usually in the layout template. They might also include markup for the page's `<head>` tag and wrapping elements for the main page content.

**Let's look at a simple layout template file at `views/layout.html`.**

```django
{# views/layout.html #}
{% extends data.outerLayout %}{# 👈 Extending outerLayout.html from core #}

{# 👇 Inserting markup into a lower level template block #}
{% block beforeMain %}
<div>{# Open page wrapper #}
  <header>
    <img src="/images/logo.png" alt="Organization logo">
    <nav>{# Website navigation #}</nav>
    {% if not data.user %}<a href="/login">Login</a>{% endif %}
  </header>
  <main>{# Open main tag #}
{% endblock %}

{% block afterMain %}
  </main>{# Close main tag #}
  <footer class="bp-footer">
    <p>
      © Apostrophe Technology, Inc.
    </p>
  </footer>
</div>{# Close page wrapper #}
{% endblock %}
```

You might notice is that this does not have essential web page elements such as a `head` or `body` tag. The first thing this module does is extend another template:

```django
{% extends data.outerLayout %}
```

This references a lower level layout template from Apostrophe core that includes those critical HTML elements, markup required by Apostrophe, and template block structure that `layout.html` and other templates use. ([See that file on Github](https://github.com/apostrophecms/apostrophe/blob/3.0/modules/%40apostrophecms/template/views/outerLayoutBase.html) if you're interested.)

The layout template then includes two template blocks, **`beforeMain` and `afterMain`**. These two are before and after the `main` block in the base layout template linked above. By using them here, they override the blocks in the base template. They are great places to put the site navigation, site footer, and other markup that should always wrap the main content of the page.

::: note NOTES
The `main` block is used in page templates for the main content of a page. You can see it used [in the page templating guide](/guide/pages.md#page-template-essentials).

`layout.html` is a naming convention in Apostrophe, but is not a required file name. The most important things to remember are that it must extend `data.outerLayout` and that page templates will extend it by whatever name you give it.
:::

Your app's `layout.html` file will likely include these elements, but could also include others as well. The base layout template (`data.outerLayout`) also includes blocks to add markup various places in the `head` tag and at the end of the `body` tag, in addition to other locations.

## Module templates

Module templates go in a `views` directory directly inside the module folder. For example, the module and `views` directory paths for a slideshow widget might be:

```
modules/slideshow-widget/
modules/slideshow-widget/views/
```

It's widget template would be at the file path:

```
modules/slideshow-widget/views/widget.html
```

**Widgets and pages** (including [piece pages](/guide/piece-pages.md)) have their own special templates. For detailed discussion of each of those, see the [widget](/guide/areas-and-widgets/custom-widgets.md#widget-templates), [page](/guide/pages.md#page-template-essentials), and [piece page](/guide/piece-pages.md#the-index-page-template) templating guides.

You may place template in any module type; not only those mentioned above. Module template files, other than those special ones, can also be *named* however you like. Those special template files are simply the ones that Apostrophe looks for automatically.

## How templates work together

### Extending templates

The [layout template example](#layout-templates) above demonstrates one way that templates work together: **"extending" one another**. As shown above, when you use the `{% extends %}` tag in a template, it will inherit all of the markup and template blocks of the template it is extending.

The `layout.html` template code above inherits all of the markup and template blocks of the `outerLayout.html` template from Apostrophe core. When it uses the `beforeMain` and `afterMain` blocks, those *replace* the matching blocks from the inherited template.

Going forward, a page template would extend `layout.html`. That *page template* may also use blocks from `outerLayout.html`, **replacing those blocks** (such as the `main` block below).

```django
{# modules/default-page/views/page.html #}
{% extends "layout.html" %}{# 👈 Our template extension #}

{% block main %}
  {% area data.page, 'mainContent' %}
{% endblock %}
```

**You can also *add to* template block content, rather than completely replace it.** To do this, include a `super()` render tag at the beginning of a block. `super()` will render as the contents of the inherited block.

For example, this may be in your layout file:

```django
{# views/layout.html #}

{% block main %}
<h1>{{ data.piece.title or data.page.title }}</h1>
{% endblock main %}
```

In my home page template I could extend the layout template and use `super()` to include that `h1` tag before new content markup:

```django
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

```django
{# views/layout.html #}

{% block afterMain %}
  </main> {# Closing tag for the main block #}
  {% include footer.html %}
{% endblock %}
```

That footer template would render as part of the layout template.

See more about including templates [in the Nunjucks documentation](https://mozilla.github.io/nunjucks/templating.html#include).


### Referencing templates across modules

The `include` and `extends` tags in the examples above reference [global templates](#global-templates) that are directly in the root `views` directory. As such, they simply name the file: e.g., `{% extends layout.html %}`.


::: tip
The Nunjucks templating language includes many tags and tools you can use in Apostrophe templates. These include:

- Adding conditional checks
- Looping over arrays
- Declaring variables
- Comparison and math operators

See the official [Nunjucks templating documentation](https://mozilla.github.io/nunjucks/templating.html) to see what is available.
:::