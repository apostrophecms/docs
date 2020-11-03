---
title: "Widgets and Templates"
---

# Widgets and Templates

This section looks at how to add content areas and widgets to your pages, using the home page as an example. Later we'll look at how to add more [custom page types](custom-page-types) beyond the home page.

## The home page template

The following is our template for the homepage. There are a few important changes to templates in Apostrophe 3, but the syntax should be familiar.

```js
// modules/@apostrophecms/home-page/views/page.html
{% extends "layout.html" %}

{% block main %}
  {% area data.page, 'main' %}
{% endblock %}
```

- Areas are added to the template with the new `area` nunjucks tag. There is no `apos.area` helper function anymore.
- You don't configure the area here. You do that in the `index.js` file for the page type or piece type. In the template, you just pass the page and the name of the area.
- `apos.singleton` is gone too, but you can pass the `max: 1` option when configuring an area field.

## Adding Standard Widgets

There are more standard widgets. Try adding more sub-properties to the `widgets` subproperty of the `main` area in `index.js`:

```js
// modules/@apostrophecms/home-page/index.js

...
widgets: {
  '@apostrophecms/video': {},
  '@apostrophecms/html': {},
  '@apostrophecms/image': {}
...
```

These all work great out of the box, except you'll note that images can push beyond the page. Apostrophe 3 does not impose any front-end opinions regarding widgets, and thus it's necessary to configure them properly with CSS classes for styling. In this example, we'll configure the image-widget to have a class.

### Configuring the Image Widget

Start by creating a directory for project-level configuration of the module. Using your terminal:

```sh
mkdir modules/@apostrophecms/image-widget
```

Then, you can configure it by creating an `index.js` file in that directory:

```js
// modules/@apostrophecms/image-widget/index.js
module.exports = {
  options: {
    className: 'full-width-image'
  }
};
```

Now, you can add CSS so images don't run off the page. Add this to `./src/index.scss`:

```scss
// ./src/index.scss
.full-width-image { 
  max-width: 100%; 
}
```

A3 doesn't impose its own asset pipeline on you. This boilerplate project contains a simple webpack configuration. We'll talk about that next in [front end assets](front-end-assets).

::: tip Note: 
The image widget only accepts one image. A3 comes with a still image widget, but because we are [less opinionated on the front end](front-end-assets), it doesn't come with a slideshow widget like in A2.
:::

### Configuring the Video Widget

While the video widget looks better out of the box, you can configure a `className` option for that as well if you wish.
