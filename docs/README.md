---
title: 'A3 Docs Home'
---

> Apostrophe 3 is currently in its alpha 1 release. You should build production projects with [Apostrophe 2](https://docs.apostrophecms.org).

# Introduction

This document is for Apostrophe 2.x developers who wish to try out Apostrophe 3.x and give feedback. We look forward to your input!

## Getting Started

Grab the boilerplate project and give your project a name of its own. We're assuming `myproject` here. Replace that with your own project name wherever you see it. Use a short name with only letters, digits and dashes.

```
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

```
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

```
{% extends "layout.html" %}

{% block main %}
  {% area data.page, 'main' %}
{% endblock %}
```

**"What's changed from A2 in this code?"**

1. Areas are added to the template with the new `area` nunjucks tag. There is no `apos.area` helper function anymore.

2. You don't configure the area here. You do that in the `index.js` file for the page type or piece type. In the template you just pass the page and the name of the area.

### Adding more standard widgets

Try adding more sub-properties to `widgets` in `index.js`:

```javascript
'@apostrophecms/video': {},
'@apostrophecms/raw-html': {},
'@apostrophecms/image': {}
```

You will also need to configure a CSS class for the image widget, because A3 does not impose strong opinions on your front end code. First make a folder for project-level configuration of the image-widget module:

```
mkdir modules/@apostrophecms/image-widget
```

Then you can configure it:

```
// in modules/@apostrophecms/image-widget/index.js
module.exports = {
  options: {
    className: 'a3-widget-image'
  }
};
```

Now you can add CSS so images don't run off the page. Add this to `./src/index.scss`:

.a3-widget-image {
  max-width: 100%;
}

> A3 comes with a still image widget, but it doesn't come with a slideshow widget, because everyone has their own preferred slideshow library. You can make your own widget that uses a relationship with images, or an array field, and write a widget player (TODO: document A3 widget players).

When you make code changes the boilerplate project will automatically restart and refresh the browser. *Alpha note: if you get a "port in use" error, press control-C and start `npm run dev` again. We're tracking down how to reliably reproduce this issue.*

## Building Page tree navigation

Building a page tree in Apostrophe 3 is largely the same as you would in Apostrophe 2. For a quick refresh:

* `data.home` is the home page.
* `data.home._children` contains its top-level children (tabs).
* `data.page` is the current page.
* `data.page._children` contains the children of the current page.
* `data.page._ancestors[data.page._ancestors.length - 1]._children` contains the peers of the current page, including itself.
* `data.page._ancestors` contains the ancestors of `data.page`.
* By default, one level of `_children` are available on each ancestor, including the home page, and on `data.page` itself. If you want more for dropdown menus, you can configure the `@apostrophecms/page` module to give you more:

```js
// in modules/@apostrophecms/page/index.js
module.exports = {
  options: {
    ancestors: {
      // Children of ancestors of `data.page`
      children: {
        depth: 2
      }
    },
    // Children of `data.page`
    children: {
      depth: 2
    }
  }
}
```

Of course, the more you load, the more time it takes.
