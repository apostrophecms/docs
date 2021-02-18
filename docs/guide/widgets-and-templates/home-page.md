# Home page template

In A3 each page type has its own module, with its own `views/page.html` template. The following is a minimal template for the homepage. There are a few important changes to templates in Apostrophe 3, but the syntax should be familiar.

```js
// modules/@apostrophecms/home-page/views/page.html
{% extends "layout.html" %}

{% block main %}
  {% area data.page, 'main' %}
{% endblock %}
```

- Areas are added to the template with the new `area` nunjucks tag. There is no `apos.area` helper function anymore.
- You no longer configure the area here. This is done exclusively in the `index.js` file for the page-type or piece-type. In the template, just pass the page and the name of the area.
- `apos.singleton` is gone too, but you can pass the `max: 1` option when configuring an area field.
