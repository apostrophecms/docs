---
title: "Custom Page Types"
---

# Custom Page Types

Our boilerplate site features two page types, "home" and "default." The home page type always exists, so we just configure it at project level in `modules/@apostrophecms/page`. But the other, "default," is specific to our project.

This module is our own project-level module, so we do not use the `@apostrophecms` namespace in its name.

Here's how we activate the module in `app.js`:

```javascript
// in app.js, after the other modules, configure a new one
    'default-page': {}
```

And here's the configuration in `modules/default-page/index.js`, leaving out things that are identical to the home page configuration:

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
          widgets: {
            // Same as the home page
          }
        }
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [
          'title',
          'main'
        ]
      }
    }
  }
};
```

In our configuration of the `@apostrophecms/page` module, which manages the entire page tree, we add our new page type to the list of choices:

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
      }
    ]
  }
};
```

And of course we need a template for the page. Again, we just pull the area in with `{% area %}`, all the details of the area are in `index.js`.

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
