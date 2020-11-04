---
title: "Custom Page Types"
---

# Custom Page Types

Let's make a new `default` page template for adding additional pages on our site. To save space, we won't include things that are the same as in the [home page module](widgets-and-templates.md). This module is our own project-level module, so we do not use the `@apostrophecms` namespace in its name.

```bash
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
          // You can copy the `widgets` option from the `main` area in
          // home-page/index.js
        }
      }
    },
    group: {
      // Group the fields into tabs.
      areas: {
        label: 'Flexible Content',
        fields: ['main']
      }
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

```django
{# modules/default-page/views/page.html #}

{% extends "layout.html" %}

{% block main %}
  {% area data.page, 'main' %}
{% endblock %}
```

### Major changes from A2

* Every page type needs a module to hold its configuration.
* The template for the page lives inside that module.
* Note the `extend` property. We need this property because we are creating a new module that extends (subclasses.md) a core apostrophe module. `@apostrophecms/page-type` is the "base class" for page type modules. *We don't need it when customizing the home page configuration because that module already exists in the core.*
* Every editable content area must be a configured field in the appropriate module, and the template just pulls it into the page.