# Layout Templates

A layout template is common in most Apostrophe apps. As the name suggests, it **contains the markup that surrounds page content and is mostly consistent across the website**. Website navigation and footers are both usually in the layout template, whether directly as markup or included from template partials.

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

You might notice is that this does not have essential web page elements such as a `head` or `body` tag. That is because the first thing this template does is extend another template:

```django
{% extends data.outerLayout %}
```

`data.outerLayout` is a reference to a lower level layout template from Apostrophe core that includes those critical HTML elements, markup required by Apostrophe, and the template block structure that project-level templates use. **The lowest-level templates in any project should extend this.** ([See that file on Github](https://github.com/apostrophecms/apostrophe/blob/3.0/modules/%40apostrophecms/template/views/outerLayoutBase.html) if you're interested.)

This layout template then includes two template blocks, **`beforeMain` and `afterMain`**, containing markup that wraps most page content.

```django
{% block beforeMain %}
  {# Page opening markup... #}
{% endblock %}

{% block afterMain %}
  {# Page ending markup... #}
{% endblock %}
```

These two are before and after the `main` block in the base layout template linked above. By using them in `views/layout.html`, they override the matching blocks in the extended template. They are great places to put the site navigation, site footer, and other markup that should always wrap the main content of the page.

The most important templates blocks from that core layout template are:

| Template block name | What is it? |
| ------------------- | ----------- |
| `startHead` | A block at the beginning of the `head` tag for inserting metadata tags. |
| `title` | The contents of the `title` tag. This defaults to using the title of the page or piece (for [show pages](/guide/piece-pages.md#the-show-page-template)). |
| `extraHead` | A block at the end of the `head` tag for inserting metadata tags. |
| `bodyClass` | A block in the `body` tag's `class` attribute for adding a class for when that template is used. |
| `beforeMain` | A block before the `main` content block. Usually used for the website header. |
| `main` | The primary block for page content. Most page template markup goes inside `main`. |
| `afterMain` | A block after the `main` content block. Usually used for the website footer. |
| `extraBody` | A block at the end of the `body` tag. |

The layout template and any page, index page, or show page template could use these blocks to overwrite them or add to them ([using the `super()` tag](/guide/templating.md#the-super-tag)).

::: note NOTES
The `beforeMain`, `main`, and `afterMain` blocks are inside the section that Apostrophe refreshes regularly during content editing. Any `script` tags inside those blocks will run an indeterminate number of times during editing. Be especially careful when using event handlers. As a reminder, any widget-related JavaScript belongs in a [widget player](/docs/guide/areas-and-widgets/custom-widgets.md#client-side-javascript-for-widgets).

`layout.html` is a naming convention in Apostrophe, but is not a required file name. You can name it anything you like. Just remember to  extend `data.outerLayout` and update page templates to extend it by its new name.
:::
