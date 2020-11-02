---
title: 'Apostrophe 3 Documentation'
---

# Introduction

This document assumes a level of familiarity with Apostrophe 2. We suggest building your production projects with the latest stable release of [Apostrophe 2](https://github.com/apostrophecms/apostrophe). This repository reflects our current progress towards a stable 3.0 release, which is scheduled in Q1 of 2021. We're eager to share our progress so far and grateful for any feedback you might have.

First let's talk about what's new and what is still to come.

## New in Apostrophe 3 Alpha 1

* **New editing experience.** Powered by Vue, the new editing experience is much faster than in A2. And the design and UX are much improved for use cases like nested widgets.
* **100% RESTful headless APIs.** While A2 had custom APIs and a separate `apostrophe-headless` module, A3 is powered by RESTful APIs from the ground up.
* **Better module architecture.** A2 developers told us it was hard to know where to put their code. So in A3, we have a clearer layout for modules. Each module has a clearly defined home for methods, event handlers, Nunjucks helpers, async components, query builders and more.
* **Async components and lazy loading.** A2 developers often asked why they couldn't fetch content from the database from inside a template. Now you can. The async component pattern delivers this feature without cluttering your templates with complex JavaScript code. Load what you need when you need it.
* **Un-opinionated on the front end.** A2 shipped with jQuery, lodash, momentjs and more on the front end. Later, we added the lean option to remove these things. A3 takes this one step further: there are no frontend libraries at all sent to logged-out users, except for a very small vanilla JavaScript helper library for core tasks like communicating with Apostrophe and displaying our video widget. The new library is under 10K when delivered with gzip encoding.

## Coming Before the 3.0 Final Release

These features are not in alpha 1, but it's important to us that you know they are coming before the final release of 3.0:

* **New permissions system.** A new, simplified permissions system is on its way. However, **just for alpha 1, all logged-in users are treated as admins.**
* **Drafts for everyone.** In A2, if you wanted to work on your content privately before making it live, the `apostrophe-workflow` module was required. In A3, you explicitly "publish" your changes when they are ready to go live. UX improvements make this process friendly for everyone.
* **Version history.** In A3 you'll be able to access the publication history of any document and potentially roll back if needed.
* **Internationalization.** A3 final will ship with optional internationalization both for static text and for dynamic content. We have learned many UX lessons from `apostrophe-workflow` and are simplifying this experience.
* **Image cropping and focal points.** Standard in 2.x, these features are still in the works for 3.x.
* **Relationships with more than one type.** "Polymorphic joins," a popular feature added late in the 2.x series, will reappear in 3.x before the final release.
* **And more.** We have a rich ecosystem of plug-in modules for A2, and  those modules will be ported to A3 as appropriate.

# Prerequisites

Apostrophe 3 introduces a number of new features and APIs, but the server requirements are the same as before. This document assumes you're running on **macOS**. As always, we recommend installing the following with [Homebrew](https://brew.sh/).

| Sotfware | Minimum Version |
| ------------- | ------------- |
| Git  ||
| Xcode  ||
| Node.js | 10.x |
| npm  | 6.x  |
| MongoDB  | 3.6  |
| Imagemagick (optional)  ||

::: tip Note: 
When you make code changes the boilerplate project will automatically restart and refresh the browser. If you get a "port in use" error, press control-C and start `npm run dev` again. We're tracking down how to reliably reproduce this issue.* 
:::

# Getting Started

Clone the Apostrophe 3 Boilerplate project give your project a name of its own. Legal characters consist of letters, digits and dashes. We're assuming **myproject** as a name here. Be sure to give the admin a user and password when prompted. 

```bash
git clone https://github.com/apostrophecms/a3-boilerplate myproject
cd myproject
node app @apostrophecms/user:add admin
npm install
npm run dev
```

Once installed, the application will run at [http://localhost:3000/](http://localhost:3000/), and you will be able to login with the admin credentials you provided in the previous step at [http://localhost:3000/](http://localhost:3000/)login.

::: tip Note: 
Currently, all edits made contextually are automatically saved. We're introducing an Edit Mode in our next release, which will offer a direct "save" option and remove automatic saving.
:::

# Developing in Apostrophe 3

Apostrophe 3 introduces several changes to module architecture. Let's start by taking a look at our home page and discuss the major differences.

## The home page

Even the home page has its own module, `@apostrophecms/home-page`. We're just configuring it here in this project-level `index.js` file, so we don't have to use `extend`.

```js
// modules/@apostrophecms/home-page/index.js
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

### Modules

- Project-level modules have been moved from `./lib/modules` to  `./modules`
- Apostrophe's core modules like `@apostrophecms/home-page` are namespaced now, just like newer npm modules. This is true even for modules that ship inside a "bundle" such as the `apostrophe` npm module.

### Options

Ordinary module options like `label` now reside in an `options` property, not at the top level.

### Fields

- Fields are added to the module with the new `fields` syntax. New fields are added via the `add` sub-property of `fields`. If a module extends another module, they cascade, so you get all of the fields.
- For convenience, fields are now configured as an object, rather than an array.
- Every area must be configured as a field of the appropriate page type or piece type.
- You can also `remove` fields by passing an array as the `remove` sub-property of `fields`. This is useful for removing unwanted fields inherited from the module you extended.
- The `group` option is used to group fields into tabs in the editor. This cascades, too, so we don't have to spell out every group we inherit every time.

### Templates

The following is our template for the homepage. There are a few important changes to templates in Apostrophe 3, but the syntax should be familiar.

- Areas are added to the template with the new `area` nunjucks tag. There is no `apos.area` helper function anymore.
- You don't configure the area here. You do that in the `index.js` file for the page type or piece type. In the template you just pass the page and the name of the area.

```js
// modules/@apostrophecms/home-page/views/page.html

{% extends "layout.html" %}

{% block main %}
  {% area data.page, 'main' %}
{% endblock %}
```

## Standard Widgets

There are more standard widgets. Try adding more sub-properties to `widgets` in `index.js`:

```js
// modules/@apostrophecms/home-page/index.js

...
widgets: {
  '@apostrophecms/video': {},
  '@apostrophecms/html': {},
  '@apostrophecms/image': {}
...
```

### Image Widget

Apostrophe 3 does not impose any front-end opinions regarding widgets, and thus it's necessary to configure them properly with CSS classes for styling. In this example, we'll configure the image-widget to have a class. Start by creating a directory for project-level configuration. Using your terminal:

```
mkdir modules/@apostrophecms/image-widget
```

Then, you can configure it by creating an `index.js` file in that directory.

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

## Custom widgets

Let's add a two-column layout widget to the site:

```bash
mkdir -p modules/two-column-widget/views
```

```js
// in modules/@apostrophecms/home-page/index.js
// Add our new widget to the "widgets" property for
// the "main" area
    'two-column': {}
```

```js
// in modules/two-column-widget/index.js

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Two Column',
  },
  fields: {
    add: {
      left: {
        type: 'area',
        label: 'Column One',
        options: {
          // You can copy from the "main" area in home-page/index.js
        }
      },
      right: {
        type: 'area',
        label: 'Column Two',
        options: {
          // You can copy from the "main" area in home-page/index.js
        }
      },
    }
  }
}
```

```js
{# in modules/two-column-widgets/views/widget.html #}
<div class="two-column-layout-container">
  <div class="two-column-layout column-one">
    {% area data.widget, 'columnOne' %}
  </div>
  <div class="two-column-layout column-two">
    {% area data.widget, 'columnTwo' %}
  </div>
</div>
```

```scss
// in src/index.scss
.two-column-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
}

.two-column-layout {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 1;
}

.column-one {
  order: 1;
}

.column-two {
  order: 2;
}
```

Here are the notable differences from A2 for custom widgets:

* Our custom widget modules extend `@apostrophecms/widget-type`.
* Simple options like `label` go inside `options` rather than at the top level.
* Just like with pages, we use `fields` to configure our fields. However, `group` is not used.
* Just like with pages, any sub-areas must be specified in `index.js`.
* Apostrophe is not supplying CSS classes, so we supply our own.
* We can nest widgets even more deeply than this if we wish. In A3 there is no technical limit on nesting, apart from common sense.

Custom widgets can also make great use of async components, which we'll talk about later.

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
