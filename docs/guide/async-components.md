---
title: "Async Components"
---

# Async Components

In A2, developers often struggled to dynamically load the custom content they wanted on their pages. There were two common solutions: widget module `load` methods, and `apostrophe-pages:beforeSend` promise events (now known as `@apostrophecms/page:beforeSend`).

While these solutions work and are appropriate for some use cases they can be hard to understand. The data must be loaded before the template runs at all. But sometimes it is best for the template to decide if the data is even needed.

So in A3, we've taken inspiration from Rails, Symfony and other frameworks. Starting in A3, Nunjucks templates can invoke "async components," like this:

```django
{# in ./modules/@apostrophecms/home-page/views/page.html #}
<h3>Our Latest Product</h3>
{% component 'product:latest' with { max: 1 } %}
```

When this command is encountered, Apostrophe looks for a "component function" called `latest` in the `product` module and `await`s it:

```js
// in ./modules/product/index.js
module.exports = {
  extend: '@apostrophecms/piece-type',
  // ...
  components(self, options) {
    return {
      async latest(req, data) {
        const products = await self.find(req).sort({
          createdAt: -1
        }).limit(data.max || 5).toArray();
        return {
          products
        };
      }
    };
  }
};
```

Then Apostrophe passes the returned object as `data` to the `latest.html` Nunjucks template in the same module:

```django
{# in ./modules/product/views/latest.html #}
{% for product in data.products %}
  <h4><a href="{{ product._url }}">{{ product.title }}</h4>
{% endfor %}
```

The resulting markup is output as part of the page.

Async components have many uses. One of the most common is to provide reuse in different contexts. For instance, the home page always use the `latest` component at a fixed point in the page template, while a `widget.html` template might also use it to allow the latest products to be pulled in anywhere.

Inside A3, async components are used to implement the new `{% area %}` tag.
