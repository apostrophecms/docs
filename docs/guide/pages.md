# Pages and page types

Every page in an Apostrophe website is assigned a **"page type"**. The page type tells Apostrophe **what template to use** to render the page and **what configuration to apply**. Configurations will often at least include the field schema for the page type.

## Creating a page type

Apostrophe core only includes a "Home page" type with some basic default content options. You will likely need your own page types, which you create by adding modules that extend `@apostrophecms/page-type` and instantiating them in `app.js`. You can read more about using `extend` in our [section on module configuration](/guide/module-configuration-patterns.md).

<AposCodeBlock>

  ```js
  module.exports = {
    extend: '@apostrophecms/page-type'
  };
  ```
  <template v-slot:caption>
    modules/default-page/index.js
  </template>

</AposCodeBlock>

<AposCodeBlock>

```js
require('apostrophe')({
  shortName: 'my-website',
  modules: {
    'default-page': {}
  }
});
```
<template v-slot:caption>
  app.js
</template>

</AposCodeBlock>

<!-- TODO: Replace area field link to a guide page when available. -->
If we add a string field for the subtitle and an [area field](/reference/field-types/area.md) for rich text and images, the Default page type would look like:

<AposCodeBlock>

  ```js
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
  <template v-slot:caption>
    modules/default-page/index.js
  </template>

</AposCodeBlock>

See the [field schema](/guide/content-schema.md) page for more on configuring fields.

::: tip
We can add functionality to the default home page type by adding a configuration file for it at `modules/@apostrophecms/home-page/index.js`. Add new fields to it as in the example above and this core page type will be ready for additional content possibilities. Or it will be once we update its page template... See below.
:::

## Page template essentials

Each page type requires a template. The only exception to that rule is if a page type extends another page type that already has a template.

Page templates are added in a `views` directory for the page type as `page.jsx`. The template for the previous example's default page would be `modules/default-page/views/page.jsx`. A very simple page template for the Default page might look like this:
<!-- TODO: Consider adding a file tree component when available. -->

```jsx
/* modules/default-page/views/page.jsx */
export default function({ page }, { Area, Extend }) {
  return (
    <Extend
      templateName="layout"
      main={
        <>
          <header>
            <h1>{page.title}</h1>
            {page.subtitle && <p>{page.subtitle}</p>}
          </header>
          <Area doc={page} name="main" />
        </>
      }
    />
  );
}
```

There are a number of things at work here.

### The template is extending a layout template

```jsx
<Extend templateName="layout" main={mainContent} />
```

`layout.jsx` (or `layout.html` in a project still on Nunjucks — the two are interchangeable targets for `<Extend>`) is a base-level template placed in `views/`. It adds markup for things that belong on every page, such as the website navigation and footer. It extends the `outerLayout` template from Apostrophe core, but provides a layer to customize the page wrapper without overwriting `outerLayoutBase.html`.

Each prop passed to `<Extend>` fills a slot the layout exposes — `main={…}` above provides the page's content. This is the recommended way to migrate an existing project: convert page templates to JSX one at a time; a JSX page template extends an existing Nunjucks `layout.html` unchanged, no layout changes required first.

A JSX layout renders its own invariant markup and exposes a single slot for the page body, rather than splitting a wrapper across separate regions:

<AposCodeBlock>

```jsx
export default function(data, { Extend }) {
  return (
    <Extend
      templateName={data.outerLayout}
      main={
        <div>
          <header>{/* Page header code: logo, navigation, etc. */}</header>
          <main>{data.main}</main>
          <footer>{/* Page footer code: contact information, secondary navigation, etc. */}</footer>
        </div>
      }
    />
  );
}
```

<template v-slot:caption>
views/layout.jsx
</template>
</AposCodeBlock>

For the full walkthrough — including the transitional shape while a layout is still Nunjucks, and a trap worth knowing about before converting one — see [Writing a layout in JSX](/guide/layout-template.md#writing-a-layout-in-jsx). The Nunjucks equivalent, for reference:

``` nunjucks
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

Note how `beforeMain` opens the `<div>` and `<main>` tags that `afterMain` closes — Nunjucks blocks are textual, so a tag may be opened in one block and closed in another. JSX has no equivalent to reopen a tag block-by-block, but it doesn't need one: the JSX layout above sidesteps the problem entirely by rendering the whole wrapper in one place and taking the page body as a single `main` slot.

### We are inserting page template markup in a named block

```jsx
<Extend templateName="layout" main={mainContent} />
```

The layout declares named blocks, and a page template fills them. In JSX each block is a **prop passed to `<Extend>`**, and the prop name is the block name — so `main={…}` overwrites the layout template's `main` block. Because a block's content is a prop rather than a tag pair, it must be a single expression: wrap multiple elements in a fragment (`<>…</>`), as the example above does.

### Page data is the first argument

```jsx
{page.title}
```

Templates have access to the same data that Nunjucks templates reach through `data`. It arrives as the **first argument of the exported function**, so destructure the properties you need rather than reaching through a `data` object. In page templates, `page` contains data for the active page — for our Default page, that includes the title, subtitle, "main" area, and lots of other information.

Naming specific properties inside curly braces, `{}`, prints them in the template.

```jsx
{page.subtitle && <p>{page.subtitle}</p>}
```

Conditionals are ordinary JavaScript. `&&` renders the right-hand side only when the left is truthy, and a ternary covers if/else. See [Conditionals](/guide/jsx-templates.md#conditionals) for the full set of idioms.

::: tip
If you want to know what is available in a template object, you can log it in your terminal using the template method `apos.log()`. This looks like:

```jsx
{apos.log(page)}
```
:::

### The widget area is added using the `Area` component

```jsx
<Area doc={page} name="main" />
```

`Area` is one of the helpers on the second argument of the template function. It lets editors add and manage content widgets on the page. Pass the field's context as `doc`, which is our page, and the field name as `name`. We [configured it in the `index.js` file](#creating-a-page-type) to use two widget types. While editing the page, the user will have access to a menu to add widgets of those types.

![A page with the area menu opened](/images/page-area.jpg)

We'll explore areas more in [the areas guide](/guide/areas-and-widgets.md).

::: tip
To overwrite the home page type template, create a template file for it at  `modules/@apostrophecms/home-page/views/page.html` and add template markup.
:::

## Activating page types

 There is one more step to make a page type available to use: You'll need to add it to the core page module's `type` option. This configures the "Type" field for pages.

![A page editing modal with the type field highlighted](/images/page-type-select.jpg)

This is a core module option, but you can add your own configuration by giving it an `index.js` file in your project: `modules/@apostrophecms/page/index.js`. You'll then configure it's `types` option with all page types you want to allow.

<AposCodeBlock>

```javascript
module.exports = {
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
<template v-slot:caption>
  modules/@apostrophecms/page/index.js
</template>

</AposCodeBlock>

Each type needs a `name` matching the module's name and a label for editors. See the reference section for [other core page module options](/reference/module-api/module-options.md#options-for-the-core-page-module).

## Connecting pages with page tree navigation

<!-- TODO: Link to a guide on building manual navigation widgets or through
     the global doc when available. -->
There are many ways to build navigation with Apostrophe. One is to base site navigation on the page tree. The **"page tree"** refers to the parent-child relationship between pages. For example, the home page is the parent of all top-level pages, which may have subpages of their own.

Pages can be organized into a page tree hierarchy while adding them or through the page manager interface.

![A modal interface with pages organized in order and nested under one another](/images/new-page-tree.png)

Apostrophe templates have data available to add navigation based on the page tree. This includes:

| Data property | Nunjucks | What is it? |
| ------ | ------ | ------ |
| `home` | `data.home` | Home page data. It is similar to the data on `page`, but always references the home page. |
| `home._children` | `data.home._children` | Page data for pages one level below the home page in the page tree. |
| `page._ancestors` | `data.page._ancestors` | Page data for the ancestors of the active page, starting with the home page. |
| `page._children` | `data.page._children` | Page data for pages one level *below* the active page. |

By default, one level of children are available on each ancestor, as well as on the home page and `page`.

With that available data, we could construct navigation for the website header. In JSX this is a `.map()` over the children — and `home` arrives the same way `page` does, as a property of the data object passed to every template, layout included:

```jsx
export default function({ home, main }, { Extend }) {
  return (
    <Extend
      templateName="outerLayoutBase"
      main={
        <div>
          <header>
            <nav>
              <ul>
                {home._children.map((child) => (
                  <li>
                    <a href={child._url}>{child.title}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </header>
          <main>{main}</main>
        </div>
      }
    />
  );
}
```

In a Nunjucks layout, the same navigation uses a `{% for %}` loop inside the `beforeMain` block:

``` nunjucks
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
