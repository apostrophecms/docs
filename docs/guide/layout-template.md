# ApostropheCMS layout templates

A layout template is common in most Apostrophe apps. As the name suggests, it **contains the markup that surrounds page content and is mostly consistent across the website**. Website navigation and footers are both usually in the layout template, whether directly as markup or included from template partials.

**Let's look at a simple layout template file at `views/layout.jsx`.**

<AposCodeBlock>

```jsx
function Header({ user }) {
  return (
    <header>
      <img src="/images/logo.png" alt="Organization logo" />
      <nav></nav>
      {!user && <a href="/login">Login</a>}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bp-footer">
      <p>© Apostrophe Technology, Inc.</p>
    </footer>
  );
}

export default function(data, { Extend }) {
  return (
    <Extend
      templateName={data.outerLayout}
      title={data.title}
      main={
        <div>
          <Header user={data.user} />
          <main>{data.main}</main>
          <Footer />
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

You might notice that this does not have essential web page elements such as a `head` or `body` tag. That is because the layout extends another template:

```jsx
<Extend templateName={data.outerLayout} … />
```

`data.outerLayout` is a reference to a lower level layout template from Apostrophe core. **The lowest-level templates in any project should extend this.** For a normal page request it points to core's `outerLayout.html`. When Apostrophe refreshes page content during editing, it points to a smaller `refreshLayout.html` instead, which is why layouts extend `data.outerLayout` rather than naming a template directly.

`outerLayout.html` itself contains only one line: it extends `outerLayoutBase.html`. That base template is where the critical HTML elements, the markup required by Apostrophe, and the named regions that project-level templates fill in are defined. ([See `outerLayoutBase.html` on GitHub](https://github.com/apostrophecms/apostrophe/blob/main/packages/apostrophe/modules/%40apostrophecms/template/views/outerLayoutBase.html) if you're interested.)

These core outer layouts are Nunjucks templates, and they are expected to stay that way, since every existing Nunjucks project extends them too. You never need to edit them or write any Nunjucks to use them. A JSX template can extend a Nunjucks template: `<Extend>` turns each prop you pass into the matching `{% block %}` of that template. Here, `title` fills the document `<title>` and `main` fills the page body. See [Extending a Nunjucks template](/guide/jsx-templates.md#extending-a-nunjucks-template-named-block-overrides) for how that bridge works.

The same mechanism is what lets an existing project adopt JSX gradually. A project that still has a Nunjucks `layout.html` can write any new page template in JSX, extending `layout.html` with `<Extend templateName="layout" … />`, and convert its older templates over time. The reverse is not possible: a Nunjucks template can never extend a JSX one. See [Migration order](/guide/jsx-templates.md#migration-order) for the rules.

The layout renders everything that wraps the page content (header, `<main>` element, footer) in one place, inside `main`. Page templates then extend the layout and pass only their own content:

```jsx
<Extend templateName="layout" main={<PageContent page={page} />} />
```

A page never needs to know what the header or footer render. The layout owns what is shared, and each page supplies only what varies.

::: tip
`data` is deliberately not destructured in the layout above. A page template's own props, such as `title` and `main`, arrive as this template's `data`, so `data.main` here is the page's content prop, not something from the page document itself.
:::

The most important props you can pass to the core outer layout are:

| Prop name | What is it? |
| ------------------- | ----------- |
| `startHead` | Markup at the beginning of the `head` tag for inserting metadata tags. |
| `title` | The contents of the `title` tag. This defaults to using the title of the page or piece (for [show pages](/guide/piece-pages.md#the-show-page-template)). |
| `extraHead` | Markup at the end of the `head` tag for inserting metadata tags. |
| `bodyClass` | A string added to the `body` tag's `class` attribute. |
| `beforeMain` | Markup before the `main` content region. |
| `main` | The primary region for page content. In a JSX layout, this usually holds the header, page content, and footer together. |
| `afterMain` | Markup after the `main` content region. |
| `extraBody` | Markup at the end of the `body` tag. |

Your layout decides which of these its pages can influence. To let a page set its own `bodyClass`, for example, pass `bodyClass={data.bodyClass}` through from the layout, the same way `title` is passed above.

::: info NOTES
The `beforeMain`, `main`, and `afterMain` regions are inside the section that Apostrophe refreshes regularly during content editing. Any `script` tags inside them will run an indeterminate number of times during editing. Be especially careful when using event handlers. As a reminder, any widget-related JavaScript belongs in a [widget player](/guide/custom-widgets.md#client-side-javascript-for-widgets).

`layout` is a naming convention in Apostrophe, but is not a required file name. You can name it anything you like. Just remember to extend `data.outerLayout` and update page templates to extend it by its new name.

**RTL language support:** The `outerLayout` template automatically applies the correct text direction (`dir` attribute) to the `<html>` element based on your locale configuration. See the [localization guide](/guide/localization/overview.md#right-to-left-rtl-language-support) for more information.

:::

::: warning
Only `.jsx` templates can extend a `.jsx` layout. A `.html` template that extends it throws an error instead of rendering.

That includes templates you didn't write yourself, most commonly the 404 page. Current starter kits already include a JSX 404 template at `modules/@apostrophecms/page/views/notFound.jsx`. If you're converting an older project, check that folder before you switch to `layout.jsx`. If it has a `notFound.html`, or no 404 template at all so core's `notFound.html` is used, **create `notFound.jsx` there** and delete any project-level `notFound.html`. Apostrophe then uses your JSX version instead.

<AposCodeBlock>

```jsx
export default function(data, { Extend }) {
  return (
    <Extend
      templateName="layout"
      title="404 - Page not found"
      main={<p>We're sorry. We couldn't find the page you're looking for.</p>}
    />
  );
}
```

<template v-slot:caption>
modules/@apostrophecms/page/views/notFound.jsx
</template>
</AposCodeBlock>

Do the same for any other `.html` template in your project, or in a module you installed, that extends `layout`.
:::

## Nunjucks layouts

Projects created before JSX support, and projects still converting their templates, use a Nunjucks layout at `views/layout.html`. As described above, new JSX page templates can extend it directly, and the layout itself is converted last.

The same layout as above, written in Nunjucks, looks like this:

<AposCodeBlock>

``` nunjucks
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
<template v-slot:caption>
views/layout.html
</template>
</AposCodeBlock>

In Nunjucks, the props from the table above are **template blocks**, overridden with `{% block %}` tags. This layout overrides `beforeMain` and `afterMain`, leaving `main` for page templates to fill, and page templates can add to a block's existing content [using the `super()` tag](/guide/nunjucks-templates.md#the-super-tag).

Notice that the page wrapper `<div>` and the `<main>` tag are opened in one block and closed in another. Blocks can't express a single element that wraps the content between them, which is one reason the JSX layout renders all of this in `main` instead. For the general pattern of moving from blocks and `super()` to props, see [Coming from blocks and `super()`](/guide/jsx-templates.md#coming-from-blocks-and-super).
