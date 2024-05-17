---
next:
  text: 'Localization - Overview'
  link: 'guide/localization/overview.md'
---
# Global settings

Editable content or settings used across your app can be managed through the **global doc**. You can use this for many things, including configuring:

- company information or navigation in the website footer
- a special ID for a third-party service, such as Google Analytics
- social media account URLs

The global doc is a special [piece](/guide/pieces.md): it is created automatically and there can only be one. It is configured through the `@apostrophecms/global` piece type module.

To demonstrate, we may want to display an organizational Github URL in the website footer and a "Contact" page. We can add that to the global doc as we would on any other piece type.

```javascript
// modules/@apostrophecms/global/index.js
module.exports = {
  fields: {
    add: {
      githubUrl: {
        type: 'url',
        label: 'Github organization url'
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['githubUrl']
      }
    }
  }
}
```

Once the global doc is configured with fields, it will be added to the admin bar for editing.

**Templates always have direct access to the global doc as `data.global`.** The Github URL field could be used in a template as a property of that doc:

``` nunjucks
{% extends data.outerLayout %}

{% block afterMain %}
  <footer>
    {% if data.global.githubUrl %}
      <a href="{{ data.global.githubUrl }}">Our Github organization</a>
    {% endif %}
  </footer>
{% endblock %}
```

::: warning
Since the global doc is available in every template it can be tempting to add all kinds of data to it. This can eventually lead to performance problems since **the whole global doc is fetched for templates on every page request**. If it contains a lot of [content areas](/guide/areas-and-widgets.md) and has [relationships](/guide/relationships.md) with other docs, that one request can get very large.

A basic guideline is that things should only be added to the global doc if they are used in *at least* 50% of pages.
:::
