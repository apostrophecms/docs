# The global doc

Editable settings used across the Apostrophe app can be managed through the **global doc**. The global doc is a special piece: it is created automatically and is the only doc of its type allowed. It is configured through the `@apostrophecms/global` piece type module.

There are many good uses for the global doc, including configuring:

- company information or navigation in the website footer
- a special ID for a third-party service, such as Google Analytics
- social media account URLs

These are all piece of information that are used across many web pages and they may potentially change at some point. They also only need to be defined once or they at least serve as a site-wide default.

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

::: note
For normal piece types, we talk about adding fields to the *piece type*. Since there is always only one doc for the "global piece type," we'll often simply talk about configuring *the global doc* instead of *the global piece type*.
:::

Once the global doc has fields available it will be available for editing in the admin bar with other content types.

**Templates always have direct access to the global doc as `data.global`.** The Github URL field could be used in a template as a property of that doc:

```django
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
It can be easy to abuse the global doc. Since the global doc is available in every template it can be tempting to add all kinds of data to it. This can eventually lead to performance problems since **the whole global doc is fetched on every page request**. If it contains a lot of [content areas](/guide/areas-and-widgets/) and has [relationships](/guide/relationships.md) with other docs, that one request can get very large.

A basic guideline is that things should only be added to the global doc if they are used in *at least* 50% of pages.
:::