---
title: 'A3 Docs Home'
---

> Apostrophe 3 is currently in its alpha 1 release. You should build production projects with [Apostrophe 2](https://docs.apostrophecms.org).

# Introduction

This document is for Apostrophe 2.x developers who wish to try out Apostrophe 3.x and give feedback. We look forward to your input!

## Getting Started

Grab the boilerplate project and give your project a name of its own. We're assuming `myproject` here. Replace that with your own project name wherever you see it. Use a short name with only letters, digits and dashes.

```bash
git clone https://github.com/apostrophecms/a3-boilerplate myproject
cd myproject
npm install
node app @apostrophecms/user:add admin
npm run dev
```

> Be sure to give the admin user a password when prompted.

Now you can [view the site here on your own computer](http://localhost:3000).

To edit the site, [log in here](http://localhost:3000/login). Click on the text on the page to start editing. **Be sure to try selecting the text;** you have many formatting options which appear only when text is selected.

> You don't have to "save" anything because your changes are saved right away. However we plan to introduce a more intentional save button in alpha 2.

## Making your project your own

First **edit `app.js` and change `shortName` to `myproject`** (replace with the folder name of your own project).

Then, to push your project to your own github, cut it loose from ours:

```bash
git remote rm origin
```

Now create a `myproject` repo on your own github account and follow their directions to "push an existing repository from the command line."

## Editable content areas in Apostrophe 3

### `index.js` for the home page

You'll find this in `modules/@apostrophecms/home-page/index.js`:

```javascript
module.exports = {
  options: {
    label: 'Home Page'
  },
  fields: {
    add: {
      main: {
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {
              toolbar: [
                'styles',
                '|',
                'bold',
                'italic',
                'strike',
                'link',
                '|',
                'bullet_list',
                'ordered_list'
              ],
              styles: [
                {
                  tag: 'p',
                  label: 'Paragraph (P)'
                },
                {
                  tag: 'h3',
                  label: 'Heading 3 (H3)'
                },
                {
                  tag: 'h4',
                  label: 'Heading 4 (H4)'
                }
              ]
            }
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

**"What's changed from A2 in this code?"**

* Project-level modules now reside in `./modules`, not `./lib/modules`.

* Apostrophe's core modules like `@apostrophecms/home-page` are namespaced now, just like newer npm modules. This is true even for modules that ship inside a "bundle" such as the `apostrophe` npm module.

* Even the home page has its own module, `@apostrophecms/home-page`. We're just configuring it here, so we don't have to use `extend`. But we will when we add a new page type to the site.

* Ordinary module options like `label` now go in an `options` property, not at the top level.

* Every area must be configured as part of the schema for a page type or piece type.

* Fields are added to the module with the new `fields` feature. New fields go in the `add` property. You can also `remove` fields by passing an array for `remove`. For convenience, fields are now configured as an object, rather than an array.

### The template for the home page

Check out `modules/@apostrophecms/home-page/views/page.html`:

```nunjucks
{% extends "layout.html" %}

{% block main %}
  {% area data.page, 'main' %}
{% endblock %}
```

**"What's changed from A2 in this code?"**

* Areas are added to the template with the new `area` nunjucks tag. There is no `apos.area` helper function anymore.

* You don't configure the area here. You do that in the `index.js` file for the page type or piece type. In the template you just pass the page and the name of the area.

### Adding more standard widgets

Try adding more sub-properties to `widgets` in `index.js`:

```javascript
'@apostrophecms/video': {},
'@apostrophecms/raw-html': {},
'@apostrophecms/image': {}
```

You will also need to configure a CSS class for the image widget, because A3 does not impose strong opinions on your front end code. First make a folder for project-level configuration of the image-widget module:

```bash
mkdir modules/@apostrophecms/image-widget
```

Then you can configure it:

```javascript
// in modules/@apostrophecms/image-widget/index.js
module.exports = {
  options: {
    className: 'a3-widget-image'
  }
};
```

Now you can add CSS so images don't run off the page. Add this to `./src/index.scss`:

```scss
.a3-widget-image {
  max-width: 100%;
}
```

When you make code changes the boilerplate project will automatically restart and refresh the browser. *Alpha note: if you get a "port in use" error, press control-C and start `npm run dev` again. We're tracking down how to reliably reproduce this issue.*

**"What's changed from A2 in this code?"**

* The image widget only accepts one image. A3 comes with a still image widget, but it doesn't come with a slideshow widget, because everyone has their own preferred slideshow library. You can make your own widget that uses a relationship with images, or an array field, and write a widget player (TODO: document custom widgets, A3 widget players).

* A3 doesn't impose its own asset pipeline on you. Instead, the boilerplate project contains a simple webpack configuration. We'll talk about this more in the next section.

## Frontend assets in Apostrophe 3

In Apostrophe 2, Apostrophe compiled your stylesheets as LESS files and bundled your `.js` files. Developers called `pushAsset` to tell Apostrophe about their assets. But by 2020, most developers just pushed the end result of their own preferred webpack pipeline.

So in Apostrophe 3, we don't impose any decisions on you about the front end. Instead, Apostrophe just automatically imports **any .js files in the `ui/public` folder of any module** into its own asset bundle, **without any compilation or changes.** This is tailor-made for pushing the output of your own webpack pipeline.

The boilerplate project contains a good example of this:

* The `dev` task in `package.json` runs `webpack`, which compiles `src/index.js` according to the rules in `webpack.config.js`. If you don't like these rules you can change them; it's project-level code.
* `src/index.scss` (written in [SASS](https://sass-lang.com/)) is imported by `src/index.js`, allowing the browser to load just one file for both.
* At the end of the build, the bundled assets are written to `modules/asset/ui/public/sites.js`.
* Then the `dev` task runs the `@apostrophecms/asset:build` task, which compiles Apostrophe's own assets. In addition, **any `.js` files in the `ui/public` folder of any module are automatically included in the frontend build.**
* This is our recommended strategy: **use webpack to build your assets, and push the end result to Apostrophe's own asset pipeline.** But you can do it any way you want, including pushing your own `script` and `link` tags in an override of the `extraHead` nunjucks block in your layout template (you could do this in `views/layout.html` in your project).

## Adding page types in A3

Our site only has a home page template. Let's make a separate `default` template for additional pages. To save space, we won't include things that are the same as in the home page module.

```javascript
// in app.js, after the other modules, configure a new one
    'default-page': {}
```

```bash
# Create a folder for our home page module and its template
mkdir -p modules/default-page/views
```

```javascript
// in modules/default-page/index.js, configure the new module
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

```javascript
// in modules/@apostrophecms/page/index.js, add the new page
// type to the list of choices

module.exports = {
  options: {
    types: [
      {
        name: '@apostrophecms/home-page',
        label: 'Home'
      },
      {
        name: 'default-page',
        label: 'Default'
      },
    ]
  }
};
```

```nunjucks
{# in modules/default-page/views/page.html #}

{% extends "layout.html" %}

{% block main %}
  {% area data.page, 'main' %}
{% endblock %}
```

**"What's changed from A2 in this code?"**

* Every page type needs a module to hold its configuration.
* The template for the page lives inside that module.
* Note the `extend` property. We need this property because we are creating a new module that extends (subclasses) a core apostrophe module. `@apostrophecms/page-type` is the "base class" for page type modules. *We didn't need it for the home page because that module already exists in the core.*
* Every editable content area must be a configured field in the appropriate module, and the template just pulls it into the page.

> This module is our own project-level module, so we **do not** use the `@apostrophecms` namespace in its name.
