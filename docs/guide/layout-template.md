# Layout Templates

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

You might notice is that this does not have essential web page elements such as a `head` or `body` tag. The first thing this template does is extend another template:

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
