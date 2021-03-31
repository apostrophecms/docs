# Pages and page types

Every page on the an Apostrophe website is assigned a **"page type"**. The page type tells Apostrophe **what template to use** to render the page and **what configuration to apply**. Configurations will often at least include the content schema for the page type.

## Creating a page type

Apostrophe core only includes a "Home page" type with minimal functionality. You will likely need your own page types, which you create by adding modules that extend `@apostrophecms/page-type` and instantiating them in `app.js`.

```js
// modules/default-page/index.js
module.exports = {
  extend: '@apostrophecms/page-type'
};
```

```js
// app.js
require('apostrophe')({
  shortName: 'my-website',
  modules: {
    'default-page': {}
  }
});
```

<!-- TODO: Replace area field link to a guide page when available. -->
If we add a subtitle field and an [area field](/reference/field-types/area.md) for rich text and images, the Default page type would look like:

```js
// modules/default-page/index.js
module.exports = {
  extend: '@apostrophecms/page-type',
  fields: {
    add: {
      subtitle: {
        type: 'string'
      },
      main: {
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {},
            '@apostrophecms/image': {}
          }
        }
      }
    },
    group: {
      basics: {
        fields: ['title', 'subtitle', 'main']
      }
    }
  }
};
```

See the [content schema](/guide/introduction.md#content-schemas) page for more on configuring fields.

## Page template essentials

You will need to add a template file for each page type. The only exception to that rule is if your page type module extends another page type that already has a template.

Page templates are added in a `views` directory in the module as `page.html`. The template for the previous example's default page would be `modules/default-page/views/page.html`. A very simple page template for the Default page might look like this:

```django
{# modules/default-page/views/page.html #}
{% extends "layout.html" %}

{% block main %}
  <header>
    <h1>{{ data.page.title }}</h1>
    {% if data.page.subtitle %}
      <p>{{ data.page.subtitle }}</p>
    {% endif %}
  </header>
  {% area data.page, 'main' %}
{% endblock %}
```

There are a number of things at work here.

### The template is extending a `layout.html` template

```django
{% extends "layout.html" %}
```

`layout.html` is a base level template [used in official Apostrophe boilerplates](https://github.com/apostrophecms/a3-boilerplate/blob/main/views/layout.html) and placed in `views/layout.html`. It is used to add markup for things that belong on every page, such as the website navigation and footer. It extends the `outerLayout.html` template from Apostrophe core, but provides a layer to customize the page wrapper while not overwriting `outerLayout.html`.

The layout template might look something like this:

```django
{% extends data.outerLayout %}

{% block beforeMain %}
<div>
  <header>
    {# Page header code: logo, navigation, etc. #}
  </header>
  <main>
{% endblock %}

{% block main %}
  {# Page body content. Pages templates normally override this. #}
{% endblock %}

{% block afterMain %}
  </main>
  <footer>
    {# Page header code: contact information, secondary navigation, etc. #}
  </footer>
</div>
{% endblock %}
```

### We are inserting page template markup in a template block

```django
{% block main %}
{% endblock %}
```

Apostrophe uses the Nunjucks template language, which has a [block system](https://mozilla.github.io/nunjucks/templating.html#block) for injecting markup into lower-level templates. The block system involves placing a `block` tag in the root-level template file, then using those blocks in higher-level templates to insert markup.

In the Default page example, the layout template's `beforeMain` and `afterMain` blocks are not replaced, so rendered Default pages use that markup as-is. The Default page template does use the `main` block, so the layout template's version is replaced.

### Page data is on `data.page`

```django
{{ data.page.title }}
```

Templates have access to a `data` object containing information about the Apostrophe application and current context data. In page templates, `data.page` contains data for the active page. For our Default page, that includes the title, subtitle, "main" area, and lots of other information.

Naming specific properties in the double brackets syntax, `{{}}`, prints them in the template.

```django
{% if data.page.subtitle %}
  <p>{{ data.page.subtitle }}</p>
{% endif %}
```

Nunjucks offers additional tags, including the [`{% if %}` conditional tag](https://mozilla.github.io/nunjucks/templating.html#if), to help work with data in templates.

::: tip
If you want to know what is available in a template object, you can log it in your terminal using the template method `apos.log()`. This looks like:

```django
{{ apos.log(data.page) }}
```
:::

### The widget area is added using the `area` tag

```django
{% area data.page, 'main' %}
```

This is a special tag in Apostrophe used to let editors add and manage content widgets to the page. After the `area` tag name, we pass the tag the field's context, which is our page, followed by the field name. We [configured it in the `index.js` file](#creating-a-page-type) to use two widget types. While editing the page, the user will have access to a menu to add widgets of those types.

![A page with the area menu opened](/images/page-area.jpg)

[The widget guide](/guide/widgets-and-templates/README.md) will go deeper into using areas.

 ## Activating page types

 There is one more step to make a page type available to use: You'll need to add it to the core page module's `type` option. This configures the "Type" field for pages.

![A page editing modal with the type field highlighted](/images/page-type-select.jpg)

This is a core module option, but you can add your own configuration by giving it an `index.js` file in your project code: `modules/@apostrophecms/page/index.js`. You'll then configure it's `types` option with all page types you want to allow.

```javascript
// modules/@apostrophecms/page/index.js
module.export = {
  options: {
    types: [
      // 👇 Adding our new page type
      {
        name: 'default-page',
        label: 'Default page'
      },
      // 👇 Optionally including the core "Home page" type
      {
        name: '@apostrophecms/home-page',
        label: 'Home page'
      }
    ]
  }
}
```

Each type needs a `name` matching the module's name and a label for editors. See the reference section for [other core page module options](/reference/module-api/module-options.md#options-for-the-core-page-module).

## Connecting pages with page tree navigation

<!-- TODO: Link to a guide on building manual navigation widgets or through
     the global doc when available. -->
There are many ways to build navigation with Apostrophe. One is to base site navigation on the page tree. The **"page tree"** refers to the parent-child relationship between pages. For example, the home page is the parent of all top-level pages, which may have subpages of their own.

Pages can be organized into a page tree hierarchy while adding them or through the page manager interface.

![A modal interface with pages organized in order and nested under one another](/images/page-tree.png)

Apostrophe templates have data available to add navigation based on the page tree. This includes:

| Data object | What is it? |
| ------ | ------ |
| `data.home` | Home page data. It is similar to the data on `data.page`, but always references the home page. |
| `data.home._children` | Page data for pages one level below the home page in the page tree. |
| `data.page._ancestors` | Page data for pages one level *above* the active page. |
| `data.page._children` | Page data for pages one level *below* the active page. |

With that available data, we could construct navigation for the website header using the Nunjucks `{% for %}` loop tag. The `layout.html` `beforeMain` block could look like:

```django
{# views/layout.html #}
{% block beforeMain %}
<div>
  <header>
    {# 👇 Adding our navigation wrapper. #}
    <nav>
      <ul>
        {# 👇 Referencing `data.home._children` and looping over them. #}
        {% for page in data.home._children %}
          <li>
            <a href="{{ page._url }}">{{ page.title }}</a>
          </li>
        {% endfor %}
      </ul>
    </nav>
  </header>
  <main>
{% endblock %}
```

This is looping over the home page's child pages, printing their URLs and titles into links. This is simply one way to add navigation using the page data in templates.
