---
title: 'Apostrophe 3 Documentation'
---

# Introduction

This document assumes a level of familiarity with Apostrophe 2. We suggest building your production projects with the latest stable release of [Apostrophe 2](https://github.com/apostrophecms/apostrophe). This repository reflects our current progress towards a stable 3.0 release, which is scheduled in Q1 of 2021. We're eager to share our progress so far and grateful for any feedback you might have.

### New in Apostrophe 3

- New editing experience
- lots of cool headless stuff
- rewritten in vue
- module architecture
- etc

### Coming Soon in Future Releases

- Permissions (all admins)
- Version History
- Image Cropping
- Batch Operations
- User Roles and Groups

## Prerequisites

Apostrophe 3 introduces a number of new features and APIs, but the server requirements are the same as before. This document assumes you're running on macOS**.** As always, we recommend installing the following with [Homebrew](https://brew.sh/).

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

## Getting Started

Clone the Apostrophe 3 Boilerplate project give your project a name of its own. Legal characters consist of letters, digits and dashes. We're assuming **myproject** here. Be sure to give the admin a user and password when prompted. 

```bash
git clone https://github.com/apostrophecms/a3-boilerplate myproject
cd myproject
node app @apostrophecms/user:add admin
npm install
npm run dev
```

Once installed, the application will run at [http://localhost:3000/](http://localhost:3000/), and you will be able to login with the admin credentials you provided in the previous step at [http://localhost:3000/](http://localhost:3000/)login.

::: tip Note: 
Currently, all edits made contextually are automatically saved. We're introducing an Edit Mode in our next released, which will offer a direct "save" option and remove automatic saving.
:::

## Developing in Apostrophe 3

Apostrophe 3 introduces several changes to module architecture and schemas. Lets start by taking a look at our home page and discuss the major differences. 

```jsx
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

### Schemas

- Ordinary module options like `label` now reside in an `options` property.
- Every area must be configured as part of the schema for a page-type or piece-type.
- Fields are added to the module with the new `fields` syntax. New fields are added via the `add` property.
- You can also `remove` fields by passing an array for `remove`.
- For convenience, fields are now configured as an object, rather than an array.

### Templates

The following is our template for the homepage. There are a few important changes to templates in Apostrophe 3, but the syntax should be familiar.

- Areas are added to the template with the new `area` nunjucks tag. There is no `apos.area` helper function anymore.
- You don't configure the area here. You do that in the `index.js` file for the page type or piece type. In the template you just pass the page and the name of the area.

```jsx
// modules/@apostrophecms/home-page/views/page.html

{% extends "layout.html" %}

{% block main %}
  {% area data.page, 'main' %}
{% endblock %}

```

### Widgets

Try adding more sub-properties to `widgets` in `index.js`:

```jsx
// modules/@apostrophecms/home-page/index.js

...
widgets: {
	'@apostrophecms/video': {},
	'@apostrophecms/raw-html': {},
	'@apostrophecms/image': {}
...
```

**Configuring a Widget**

Apostrophe 3 does not impose any front-end opinions regarding widgets, and thus its necessary to configure them properly with CSS classes for styling. In this example, we'll configure our image-widget to have a class. Start by creating a directory for project-level configuration. Using your terminal:

```
mkdir modules/@apostrophecms/image-widget

```

Then, you can configure it by creating an `index.js` file in that directory.

```jsx
// modules/@apostrophecms/image-widget/index.js
module.exports = {
  options: {
    className: 'home-image'
  }
};

```