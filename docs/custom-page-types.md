---
title: "Custom Page Types"
---

# Custom Page Types

Let's make a new `default` page template for building additional pages on our site. To save space, we won't include things that are the same as in the [home page module](widgets-and-templates).

```sh
# Create a folder for our home page module and its template
mkdir -p modules/default-page/views
```

```javascript
// in app.js, after the other modules, configure a new one
    'default-page': {}
```

```javascript
// in modules/default-page/index.js
module.exports = {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'Default Page'
  },
  fields: {
    add: {
      main: {
        type: 'area',
        options: {
          // You can paste the same options used for the "main"
          // area of the home page here
        }
      }
    },
    group: {
      // Group the fields into tabs.
      // Same as the home page example above
    }
  }
};
```

```js
// in modules/@apostrophecms/page/index.js

module.exports = {
  options: {
    types: [
      {
        name: '@apostrophecms/home-page',
        label: 'Home'
      },   
      // add the new page type to the list of choices
      {
        name: 'default-page', 
        label: 'Default'
      },
    ]
  }
};
```

```js
{# modules/default-page/views/page.html #}

{% extends "layout.html" %}

{% block main %}
  {% area data.page, 'main' %}
{% endblock %}
```

> To actually add a new page to the site, click "Page Tree," then "New Page." Note that for now, you are not immediately taken to the new page when you save it. You can navigate manually or via "Page Tree."

## Differences from A2

* Every page type needs a module to hold its configuration.
* The template for the page lives inside that module.
* Note the `extend` property. We need this property because we are creating a new module that extends (subclasses) a core apostrophe module. `@apostrophecms/page-type` is the "base class" for page type modules. *We didn't need it when configuring the home page because that module already exists in the core.*
* Every editable content area must be a configured field in the appropriate module, and the template just pulls it into the page.

::: tip Note:
This module is our own project-level module, so we **do not** use the `@apostrophecms` namespace in its name.
::: 
