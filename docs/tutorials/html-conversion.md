---
prev: false
next: false
title: "From HTML to ApostropheCMS"
detailHeading: "Series"
url: "/tutorials/html-conversion.html"
content: "This tutorial will walk through the conversion of a pre-made HTML template for use in an ApostropheCMS project."
tags:
  topic: "Core Concepts"
  type: tutorial
  effort: beginner
---
# Converting a premade HTML template for use in an ApostropheCMS Project

Creating a web site from scratch can be a daunting process. Not only do you have to create the HTML markup, but also the styling to make it all look good. One way to get started quickly is to use one of the numerous premade templates available on the internet. In this tutorial, we will walk through the steps to convert the ["Start Bootstrap Clean Blog"](https://startbootstrap.com/theme/clean-blog) template into an Apostrophe template. While we are starting with a specific template, these steps can be generalized to any template you might download.

### Prefer to read? Scroll past the video.

::: tip
This tutorial is available in video and textual forms. Watch the video, or continue reading if you prefer. Of course, you can do both!
:::

### Video - Converting an HTML template for use in Apostrophe

<iframe src="https://www.youtube.com/embed/KqzKrbCv5G4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Overview

Let's outline the steps that we need to perform.

1. Create a new starter kit project
2. Add the styling and scripts from the template to our project
3. Identify sections found on each page that can be extracted into reusable components
   - Navigation
   - Header
   - Footer
4. Modify the project core layout in `views/layout.jsx`
5. Create the apostrophe default page type
6. Add the blog pages using `apostrophecms/page`
   - create the `index.jsx` page
   - create the `show.jsx` page

## Template Introduction

This recipe is based on the Clean Blog template which is a free [download](https://startbootstrap.com/theme/clean-blog) from Start Bootstrap. This template contains 4 simple pages.

The "Home" page contains a listing of all the blog articles on the site.
![The template home page](../images/home-page.png)

This has an accompanying page to show the individual articles.

![The template 'show.html' page](../images/show-page.png)

This structure matches up nicely with the structure of the apostrophe `piece-page-type` with an `index.jsx` template to list all of the pieces and a `show.jsx` template to show each individual piece.

The final two pages are an "About" page and a "Contact Me" page, which have identical structures, just content differences.

![The 'Contact-me" page.'](../images/contact-me.png)

All of these pages have very similar headers containing fixed navigation, a large header image, and some text over the image.

They also all display an identical footer containing social links and some copyright text.

The styling of the template is a combination of the popular Bootstrap frontend styling framework and custom CSS.

Let's get started converting this template to an Apostrophe project!

## Creating a new project

Create a new project from the command line. Make sure you are in the directory where you want to create your new project folder and run the following command:

<AposCodeBlock>

``` sh
npm create apostrophe@latest template-app
```

</AposCodeBlock>

This will create the new project and an admin user. At the end of the installation, it will ask for an administrator password - make sure to remember this password for login.

## Adding Bootstrap and project styling

### Adding the styling

This particular template comes with both `dist` and `src` folders. Within the dist folder is a `css` folder that contains all of the compiled styling for the site. We could use this as the source for the styling of our project, but this wouldn't be as easy to modify with additional or custom styling variables.

Alternatively, the `src` folder contains an `scss` folder with all of the styling sheets and imports. Since this template utilizes Bootstrap, which has a npm package, we are going to install and then include the main styling from the `node-modules` folder. Open a terminal at the root of your project and install Bootstrap using:

``` sh
npm install bootstrap
```

::: info
This template uses Bootstrap 5, which is the latest version as of this writing. If you need another version for your template, make sure to specify it during the install.
:::

The next thing we will do is copy the contents of the `scss` folder that contains all of the theme-specific styling into our project. While these files could be added to any Apostrophe module, we recommend creating an "asset" module just for your project. If you are using the CLI-created starter kit project, this module will already exist. If not, create a `modules/asset` folder and add the `asset` module to your `app.js` file. Next, within the `modules/asset` folder create a `ui/src` folder and copy the entirety of the `dist/scss` folder.

For the HTML template, the `styles.scss` file is the entry point for loading all of the individual scss sheets. For our Apostrophe project, we are going to move this sheet up one level from the `/scss` folder into the `ui/src` folder and rename it `index.scss`. If an Apostrophe module has a `ui/src/index.js` file it is automatically recognized and loaded. Other Sass files won't be loaded unless imported by such a file. Next, we need to edit this file to point to all of the theme-specific [partials](https://sass-lang.com/guide#topic-4). Looking at the file path for each `@import` statement, each partial or folder of partials is expected to be found in the same folder as the entry sheet. After copying it into our project, this is no longer true. Instead, all of the partials are located within the `scss` folder of the same directory. Modify all of the `@import` statements (except for the Bootstrap import) to point to the correct location by prefixing the path with the folder name:

<AposCodeBlock>

``` scss
// Import variables
@import './scss/variables';

// import bootstrap
// This path is pointing to the Bootstrap package in the node_module folder
@import 'bootstrap/scss/bootstrap';

// Global CSS
@import './scss/global';

// Components
@import './scss/components/buttons';
@import './scss/components/forms';
@import './scss/components/navbar';

// Sections
@import './scss/sections/footer';
@import './scss/sections/masthead';
@import './scss/sections/post';
```

<template v-slot:caption>
modules/asset/ui/src/index.scss
</template>
</AposCodeBlock>

The main Bootstrap components are loaded in from the `node_modules` where they were installed. An alternative to directly loading from the `node-modules`, which will load in every Bootstrap component, would be to import only those components needed for the project using `@import 'bootstrap/scss/_buttons';`, for example.

### Adding the Bootstrap and project JavaScript

Bootstrap has its own bundle of JavaScript. In addition, this template has a small, custom script that modifies the navigation based on scroll direction. We have multiple choices for adding the Bootstrap code to the page. We could elect to bring it in from a CDN. However, we have already installed the Bootstrap NPM package and are going to make a server call to load custom JavaScript, so instead, we can bundle all of our scripts into a single call.

Create another file named `index.js` within the `modules/asset/ui/src` folder. Within this file, we can import the main Javascript bundle and add the custom script from the template `src/js/scripts.js` file.

<AposCodeBlock>

``` javascript
// import the bootstrap.js and popper.js files from the node_modules
import bootstrap from 'bootstrap';

export default () => {
  //code from the template
  window.addEventListener('DOMContentLoaded', () => {
    let scrollPos = 0;
    const mainNav = document.getElementById('mainNav');
    const headerHeight = mainNav.clientHeight;
    window.addEventListener('scroll', function () {
      const currentTop = document.body.getBoundingClientRect().top * -1;
      if (currentTop < scrollPos) {
        // Scrolling Up
        if (currentTop > 0 && mainNav.classList.contains('is-fixed')) {
          mainNav.classList.add('is-visible');
        } else {
          mainNav.classList.remove('is-visible', 'is-fixed');
        }
      } else {
        // Scrolling Down
        mainNav.classList.remove(['is-visible']);
        if (
          currentTop > headerHeight &&
          !mainNav.classList.contains('is-fixed')
        ) {
          mainNav.classList.add('is-fixed');
        }
      }
      scrollPos = currentTop;
    });
  });
};
```

<template v-slot:caption>
  modules/asset/ui/src/index.js
</template>

</AposCodeBlock>

## Identifying common areas

Each of the four pages included in this template has some common areas that can be extracted into reusable **components** — ordinary functions that return markup. While all of the pages have both navigation and main header areas that occupy the same general area, we are going to split these into two components. That is because the navigation can get all of its settings from global, whereas the rest of the header area is going to get settings on a per-page basis. We will add each of the three components in the `views` folder at the project level.

::: info
If you are coming from Nunjucks, this is the job [fragments](/guide/fragments.md) did. A JSX component covers the same ground and can also perform the async work that fragments were introduced for, so there is no separate construct to learn — see [Coming from macros and fragments](/guide/jsx-templates.md#coming-from-macros-and-fragments).
:::

### Adding the navigation

Inside the `views` folder create another folder named `components` and a file named `Navigation.jsx`. A component is a function that returns markup, exported as the file's default export.

Open one of the template pages and copy the navigation section. Paste this inside the returned markup, converting `class` to `className` as you go. To add the website brand to the navigation, we will replace the `href` with the homepage URL from `home._url`, which is available to all [templates](/guide/pages.md). We will add a simple text logo from user input in the apostrophe global settings.

Next, within the unordered list, delete the last three `<li>` items. To populate the list with each of the pages selected in the global settings we will use a `for` loop.

<AposCodeBlock>

```jsx
export default function({ home, global }) {
  return (
    /* Navigation */
    <nav className="navbar navbar-expand-lg navbar-light" id="mainNav">
      <div className="container px-4 px-lg-5">
        <a className="navbar-brand" href={home._url}>{global.brand}</a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarResponsive"
          aria-controls="navbarResponsive"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          Menu<i className="fas fa-bars"></i>
        </button>
        <div className="collapse navbar-collapse" id="navbarResponsive">
          <ul className="navbar-nav ms-auto py-4 py-lg-0">
            {global.pages.map((page) => page._page?.[0] && (
              <li className="nav-item">
                <a
                  className="nav-link px-lg-3 py-3 py-lg-4"
                  href={page._page[0]._url}
                >
                  {page.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
```

<template v-slot:caption>
  views/components/Navigation.jsx
</template>
</AposCodeBlock>

In this code block, we are surrounding one of the list items with our `for` loop. For each selected page we are adding a list item containing a link and label. This data will come from an `array` field schema field containing a `string` input for the label and a `relationship` field for the page link. Note that since this URL is populated from a `relationship` field, data will be delivered to the page in an array. So, we need to specify that we are getting the `_url` from the first array item.

All of the styling for our menu and each of the items will come from the Bootstrap class names we copied over with the HTML markup.

Next, we need to add the schema fields to populate our navigation menu. If your project doesn't already contain one, create a `modules/@apostrophecms/global/index.js` file. Our [tutorial](/tutorials/building-navigation.md) section has some more complicated methods for adding navigation. In this case, we are going to add a simple array schema field with a relationship to our pages.

<AposCodeBlock>

``` javascript
module.exports = {
  fields: {
    add: {
      brand: {
        type: 'string',
        label: 'Brand name',
        required: true
      },
      pages: {
        type: 'array',
        titleField: 'Pages',
        fields: {
          add: {
            label: {
              type: 'string',
              label: 'Page label'
            },
            _page: {
              label: 'Page to link',
              type: 'relationship',
              withType: '@apostrophecms/page',
              max: 1,
              required: true,
              builders: {
                project: {
                  title: 1,
                  _url: 1
                }
              }
            }
          }
        }
      }
    },
    group: {
      navigation: {
        label: 'Navigation links',
        fields: [ 'brand', 'pages' ]
      }
    }
  }
};
```

<template v-slot:caption>
  modules/@apostrophecms/global/index.js
</template>
</AposCodeBlock>

### Adding the footer

Much like we constructed the navigation, we are going to use a component populated with data from the apostrophe global settings for the footer. Create a `views/components/Footer.jsx` file and paste the footer area from any of the template pages into the returned markup. In this case, we are going to replace each of the social links and the copyright text. You can choose to make the link for each social media account be required, or wrap each of the list items in an `if` block to make them optional.

<AposCodeBlock>

```jsx
function SocialLink({ url, icon }) {
  return (
    <li className="list-inline-item">
      <a href={url}>
        <span className="fa-stack fa-lg">
          <i className="fas fa-circle fa-stack-2x"></i>
          <i className={`fab ${icon} fa-stack-1x fa-inverse`}></i>
        </span>
      </a>
    </li>
  );
}

export default function({ global }) {
  return (
    /* Footer */
    <footer className="border-top">
      <div className="container px-4 px-lg-5">
        <div className="row gx-4 gx-lg-5 justify-content-center">
          <div className="col-md-10 col-lg-8 col-xl-7">
            <ul className="list-inline text-center">
              {global.twitterUrl && (
                <SocialLink url={global.twitterUrl} icon="fa-twitter" />
              )}
              {global.facebookUrl && (
                <SocialLink url={global.facebookUrl} icon="fa-facebook-f" />
              )}
              {global.githubUrl && (
                <SocialLink url={global.githubUrl} icon="fa-github" />
              )}
            </ul>
            <div className="small text-center text-muted fst-italic">
              Copyright &copy; {global.copyright}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

<template v-slot:caption>
  views/components/Footer.jsx
</template>
</AposCodeBlock>

Modify the global settings file to include the new footer schema fields.

<AposCodeBlock>

``` javascript
module.exports = {
  fields: {
    add: {
      // ...
      twitterUrl: {
        type: 'url',
        label: 'Twitter URL'
      },
      facebookUrl: {
        type: 'url',
        label: 'Facebook URL'
      },
      githubUrl: {
        type: 'url',
        label: 'Github URL'
      },
      copyright: {
        type: 'string',
        label: 'Copyright text',
        required: true
      }
    },
    group: {
      // ...
      footer: {
        label: 'Footer URLs and text',
        fields: [ 'twitterUrl', 'facebookUrl', 'githubUrl', 'copyright' ]
      }
    }
  }
};

```

<template v-slot:caption>
  modules/@apostrophecms/global/index.js
</template>
</AposCodeBlock>

::: info
An alternative way to add the social links would be to use an `array` schema field to collect the URL and logo class information. Then within the template loop over each item in the array to add them to the page. This would make the template code and logic a little cleaner.
:::

### Adding the header

The headers of each page have an image and headline in common. They also each have a subheading, but the styling of that subheading depends on the type of page that is being displayed. Additionally, the header for the page displaying the individual blog articles also has metadata about the author and publication date. While we could have separate header components, we can also use a conditional to add the needed markup.

Create a `views/components/Header.jsx` file. Unlike the navigation and footer components, which get their data from apostrophe's global settings, the header gets its data from the page. That means the page has to pass it in — as a prop, which the component destructures from its first argument: `function({ doc })`.

Paste the page header section from the `index.html` template page in between the tags. This markup is present on the home, about, and contact pages. Once we create the blog article page we will come back and add the conditional block. Modify the heading and subheading to get field schema data from the page settings.

Adding an image as a background for the header takes a little more work. First, when we create the page settings, we will add a `headerImage` area that requires a maximum of one image through the `@apostrophe/image` widget. Within the component we retrieve that image using the `apos.image.first` and `apos.attachment.url` helpers, which arrive on the second argument.

<AposCodeBlock>

```jsx
export default function({ doc }, { apos }) {
  const background = apos.image.first(doc.headerImage);

  /* One `style` string covers both cases, so the <header> is written once.
     Nunjucks could open the tag inside an {% if %} and close it after the
     {% endif %}; JSX elements must balance inside a single expression. */
  const style = background
    ? `background-image: url('${apos.attachment.url(background, { size: 'max' })}')`
    : 'background-color: blue;';

  return (
    /* Page Header */
    <header className="masthead" style={style}>
      <div className="container position-relative px-4 px-lg-5">
        <div className="row gx-4 gx-lg-5 justify-content-center">
          <div className="col-md-10 col-lg-8 col-xl-7">
            <div className="site-heading">
              <h1>{doc.heading}</h1>
              <span className="subheading">{doc.subheading}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
```

<template v-slot:caption>
  views/components/Header.jsx
</template>
</AposCodeBlock>

We will revisit the field schema for the header when we create our default page.

## Modifying the `layout.jsx` file

Now that we have our three common components set up, we need to start adding them to our pages. Again, the navigation and footer are populated with data from the global settings. Therefore, we can add those to our base layout file — `views/layout.jsx`. In addition, looking at the head section of the template files, we can see that the `fontawesome` and Google `Lora` and `Open Sans` fonts are being added. We can alter this same file to load those files into the head section

::: info
If your pages are being loaded and viewed in an EU country, serving fonts from Google might violate GDPR. There are multiple articles on the internet detailing how to download the files and host them locally in order to comply with GDPR.
:::

The first modification we are going to make is to import our two components.

<AposCodeBlock>

```jsx
import Navigation from './components/Navigation.jsx';
import Footer from './components/Footer.jsx';
```

</AposCodeBlock>

These are ordinary JavaScript imports, so the names are yours to choose.

To load our font files we are going to take advantage of the `extraHead` section of the `outerLayout` template that our layout is extending. You can read the [documentation](/guide/layout-template.html) to learn about other sections of this template that can be extended. Each of those sections is a prop you pass to `<Template>`, so add an `extraHead` prop and copy the fonts section of the head from any of the template pages into it. You can also see that there are links for the site favicon and some other meta tags in this section of the template. You can elect to add those if you desire.

Finally, replace the markup in the `beforeMain` and `afterMain` sections. Render `<Navigation />` in `beforeMain` and `<Footer />` in `afterMain`. The final modification is to add the semantic `<main></main>` tags. Looking at the original template pages, we can see that the main section has a class of `mb-4`, so wrap `{children}` in it.

Notice that `beforeMain` also renders `{pageHeader}` straight after the navigation. That is the extension point our page templates will fill. **The layout renders the navigation itself and the pages add to it — the pages never need to reach back for what the layout put there.** This is why none of the page templates below needs anything resembling Nunjucks's `super()`; see [Coming from blocks and `super()`](/guide/jsx-templates.md#coming-from-blocks-and-super).

<AposCodeBlock>

```jsx
import Navigation from './components/Navigation.jsx';
import Footer from './components/Footer.jsx';

export default function(
  { outerLayout, page, piece, pageHeader, children },
  { apos, Template }
) {
  const title = piece?.title || page?.title;

  if (!title) {
    apos.log('Looks like you forgot to override the title block in a template that does not have access to an Apostrophe page or piece.');
  }

  /* The layout renders the navigation and footer itself. Page templates fill
     `pageHeader` and `children` only — they never need to know what is already
     here, so nothing has to reach back for a parent block's content. */
  return (
    <Template
      templateName={outerLayout}
      title={title}
      extraHead={
        <>
          {/* Font Awesome icons (free version) */}
          <script
            src="https://use.fontawesome.com/releases/v6.1.0/js/all.js"
            crossorigin="anonymous"
          />
          {/* Google fonts */}
          <link
            href="https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic"
            rel="stylesheet"
            type="text/css"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800"
            rel="stylesheet"
            type="text/css"
          />
        </>
      }
      beforeMain={
        <>
          <Navigation />
          {pageHeader}
        </>
      }
      main={<main className="mb-4">{children}</main>}
      afterMain={<Footer />}
    />
  );
}

```

<template v-slot:caption>
  views/layout.jsx
</template>
</AposCodeBlock>

Each component file has a single default export, so the name you give it on import is the name you use in the markup. A file can export more than one component if you want several related pieces in one place — `Footer.jsx` above does exactly that with its small `SocialLink` helper.

## Creating a default page

Now all of our pages will have our navigation and footer areas, but we need to add our header and all of the body content. We could make a separate file for each page of our site, but it makes sense to have a default page that will be used for the non-blog pages. We can use the existing `modules/default-page`.

We need to make two major modifications to the existing `default-page`. First, we import our `Header` component and pass it to the layout as the `pageHeader` prop. The layout already renders the navigation before it, so there is nothing to preserve or re-render here.

Second, we add the template styling and the main content area as the children of `<Extend>`, which the layout receives as `children` and places inside `<main>`.

<AposCodeBlock>

```jsx
import Header from '../../../views/components/Header.jsx';

export default function({ page }, { Area, Extend }) {
  return (
    <Extend
      templateName="layout"
      pageHeader={<Header doc={page} />}
    >
      <div className="container px-4 px-lg-5">
        <div className="row gx-4 gx-lg-5 justify-content-center">
          <div className="col-md-10 col-lg-8 col-xl-7">
            <Area doc={page} name="main" />
          </div>
        </div>
      </div>
    </Extend>
  );
}
```

<template v-slot:caption>
  modules/default-page/views/page.jsx
</template>
</AposCodeBlock>

Next, we need to modify the schema fields of the `default-page/index.js` file to add the data to the header and the main body of the page. For a number of the schema fields below, I'm choosing to make them required. You could instead leave them optional, but then wrap the areas where they are added to the templates in conditional statements in case the editor leaves the fields empty.

<AposCodeBlock>

``` javascript
module.exports = {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'Default Page'
  },
  fields: {
    add: {
      heading: {
        type: 'string',
        label: 'Heading',
        required: true
      },
      subheading: {
        type: 'string',
        label: 'Subheading',
        required: true
      },
      headerImage: {
        type: 'area',
        required: true,
        options: {
          widgets: {
            '@apostrophecms/image': {}
          },
          max: 1
        }
      },
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
                'bulletList',
                'orderedList'
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
            },
            '@apostrophecms/image': {},
            '@apostrophecms/video': {}
          }
        }
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [
          'title',
          'heading',
          'subheading',
          'headerImage',
          'main'
        ]
      }
    }
  }
};

```

<template v-slot:caption>
  modules/default-page/index.js
</template>
</AposCodeBlock>

Since we are modifying the project's existing `default-page/index.js` file, we don't need to modify either the `app.js` or `modules/@apostrophecms/page/index.js` files.

To accommodate the content on the 'Contact Us' page, we could also add the widgets from the [form extension](https://apostrophecms.com/extensions/form-builder-3-x) in the `main` area. 

### Modifying the logged-in page display
If we were to take a look at our page right now while logged-in as an editor, we would see a couple of problems. First, the navigation section is styled to be added at the top of the page using a `postion: absolute` CSS rule. The problem with this is that this ends up putting our navigation *over* the ApostropheCMS admin-bar. Not only can we not see the navigation, but this also blocks access to the admin-bar menus. So, we need to add some code onto the page that will move our navigation below the admin-bar in the page flow.

There are several areas in our project where we could add code to solve this problem. In this case, we will add a small script to our asset module again. While we could add it to `modules/asset/ui/src/index.js` along with the template code, this would result in the delivery of extra unnecessary JavaScript to all users. Instead, we will add the code into `modules/asset/ui/apos/apps`. This folder is commonly used in projects to add new custom Vue UI components and is only served to logged-in users.

<AposCodeBlock>

``` javascript
export default () => {
  // check that the admin-bar module exists
  const loggedIn = !!window.apos.modules['@apostrophecms/admin-bar'];
  if (loggedIn) {
    // wrap in `apos.util.onReady()` that fires when the page is loaded and at every refresh
    apos.util.onReady(() => {
      //get the admin-bar height
      const adminBarHeight =
        window.apos.modules['@apostrophecms/admin-bar'].height;
        // get the navigation ID - if you are using a different template, adjust accordingly
      const pageNav = document.getElementById('mainNav');
      // set the absolute position of the navigation to after the admin-bar
      pageNav.style.top = adminBarHeight + 'px';
    });
  }
};

```

<template v-slot:caption>
  modules/asset/ui/apos/apps/AdminBarHeight.js
</template>
</AposCodeBlock>


## Add the blog pages

The last two pages from the template are blog index and article pages. We could use the [blog module](https://apostrophecms.com/extensions/blog), but it has features we don't necessarily need for this template. So, to simplify this tutorial we will just create our blog `piece-type` and `piece-page-type`. We can do this using the CLI tool.

``` sh
apos add piece blog --page
```

The CLI scaffolds its templates as Nunjucks, so rename the generated `index.html` and `show.html` to `index.jsx` and `show.jsx` — we rewrite both as function components below anyway.

Once we have these added to our project we need to modify the `app.js` file to include both.

<AposCodeBlock>

``` javascript
require('apostrophe')({
  modules: {
    // ...
    blog: {},
    'blog-page': {}
  }
});

```

<template v-slot:caption>
  app.js
</template>
</AposCodeBlock>

Additionally, the `blog-page` needs to be added to the `modules/@apostrophecms/page/index.js` file so that it is available in our page manager.

Next, we will modify the `modules/blog/index.js` file to include the necessary field schema. We need to add the header image and text, plus the actual blog content. This is essentially identical to the index for the `default-page`. We can copy the contents of that file and then add two additional schema fields - `author` and `publicationDate`.

<AposCodeBlock>

``` javascript
module.exports = {
  extend: '@apostrophecms/piece-type',
  fields: {
    add: {
      headerImage: {
        type: 'area',
        label: 'Header image',
        required: true,
        options: {
          widgets: {
            '@apostrophecms/image': {}
          },
          max: 1
        }
      },
      heading: {
        type: 'string',
        label: 'Heading',
        required: true
      },
      subheading: {
        type: 'string',
        label: 'Subheading',
        required: true
      },
      author: {
        type: 'string',
        label: 'Author',
        required: true
      },
      publicationDate: {
        type: 'date',
        label: 'Publication date',
        required: true
      },
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
                'bulletList',
                'orderedList'
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
            },
            '@apostrophecms/image': {},
            '@apostrophecms/video': {}
          }
        }
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [ 'title', 'headerImage', 'heading', 'subheading', 'author', 'publicationDate', 'main' ]
      }
    }
  }
};

```

<template v-slot:caption>
  modules/blog/index.js
</template>
</AposCodeBlock>

The `index.js` file for the `blog-page` will also be quite similar. Again, it will have a header image, heading, and subheading.

<AposCodeBlock>

``` javascript
module.exports = {
  extend: '@apostrophecms/piece-page-type',
  options: {
    perPage: 5
  },
  fields: {
    add: {
      headerImage: {
        type: 'area',
        label: 'Header image',
        required: true,
        options: {
          widgets: {
            '@apostrophecms/image': {}
          },
          max: 1
        }
      },
      heading: {
        type: 'string',
        label: 'Heading',
        required: true
      },
      subheading: {
        type: 'string',
        label: 'Subheading',
        required: true
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [
          'title',
          'headerImage',
          'heading',
          'subheading'
        ]
      }
    }
  }
};

```

<template v-slot:caption>
  modules/blog-page/index.js
</template>
</AposCodeBlock>

In the code above we are adding a `perPage` option of `5`. This will limit the number of blog articles shown on the "Home" page. This can be adjusted to best serve your needs.

### The blog `index.jsx` page

The "Home" page of the template is essentially an `index.jsx` page that lists all of the blog articles. Just like with the default page, we pass our header as `pageHeader`. As the children, we copy the `<!-- Main Content -->` section from the `index.html` file of the original HTML template. To convert it to dynamically show all of the blog articles from our site we delete all of the code in each of the `<!-- Post preview -->` sections except the first. Then we map over `pieces`, returning that first section for each one. Finally, we modify the `<!-- Pager -->` section to show both newer and older posts.

<AposCodeBlock>

```jsx
import dayjs from 'dayjs';
import Header from '../../../views/components/Header.jsx';

export default function(
  { page, pieces, currentPage, totalPages, slug },
  { Extend }
) {
  return (
    <Extend
      templateName="layout"
      pageHeader={<Header doc={page} />}
    >
      {/* Main Content */}
      <div className="container px-4 px-lg-5">
        <div className="row gx-4 gx-lg-5 justify-content-center">
          <div className="col-md-10 col-lg-8 col-xl-7">
            {pieces.map((piece) => (
              <>
                {/* Post Preview */}
                <div className="post-preview">
                  <a href={piece._url}>
                    <h2 className="post-title">{piece.heading}</h2>
                    <h3 className="post-subtitle">{piece.subheading}</h3>
                  </a>
                  <p className="post-meta">
                    {' '}Posted by {piece.author} on{' '}
                    {dayjs(piece.publicationDate).format('MMMM D, YYYY')}
                  </p>
                </div>
                {/* Divider */}
                <hr className="my-4" />
              </>
            ))}
            {/* Pager */}
            <div className="d-flex mb-4">
              {currentPage > 1 && (
                <a
                  href={`${slug}?page=${currentPage - 1}`}
                  className="btn btn-primary text-uppercase me-auto"
                >
                  newer posts
                </a>
              )}
              {totalPages > currentPage && (
                <a
                  href={`${slug}?page=${currentPage + 1}`}
                  className="btn btn-primary text-uppercase ms-auto"
                >
                  older posts
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Extend>
  );
}
```

<template v-slot:caption>
  modules/blog-page/views/index.jsx
</template>
</AposCodeBlock>

Focusing on the `for` loop in the code. We are stepping through all of the articles returned in `data.pieces` and outputing the relevant data. Again, since we specified a `perPage` value of `5` in the options, this will return the five newest blog articles. This can be further configured within the `blog-page` module options, for example with the [`sort` option](/reference/modules/piece-type.md#sort).

The "Pager" section is expanded to conditionally show newer and older blog articles, unlike the original template, which only shows older articles. Within the section, we are taking advantage of some additional data that is being delivered to the `index.jsx` page — `currentPage` and `totalPages`, destructured from the first argument. The `data.totalPages` is how many individual data sets are present for the particular piece type if divided into groups based on the `perPage` option (the default is `10`).

By default, we are showing the newest blog articles first. Therefore, if the `data.currentPage` is equal to `1` then we shouldn't display the button to load newer articles. If we are on any other page we want the button displayed, with a URL that adds a query to go to the previous page -
::: v-pre
`{{data.currentPage - 1}}`.
:::

We are only displaying the button to go to older posts if we aren't at the last set of pieces - `data.totalPages > data.currentPage`. If this is true we display a button that points to the URL with a query that goes to the next set of pieces - 
::: v-pre
`{{data.currentPage + 1}}`.
:::

### The blog `show.jsx` page

The `show.jsx` page will display each of the individual blog articles and will be based on the original HTML template `post.html` page. Like the other pages, we start by passing the `Header` component as `pageHeader`. If we look at the `post.html` page we can see that the header looks slightly different from the other pages. It contains metadata not found on the other pages. After setting up the main part of the page we will alter the `Header` component to address this.

Open the `post.html` template file and copy the `<!-- Post Content -->` section into the children of `<Extend>` in `show.jsx`. All of the content in `p` tags can be deleted because we will replace it with the content added to the `main` area of our blog pieces.

<AposCodeBlock>

```jsx
import Header from '../../../views/components/Header.jsx';

export default function({ piece }, { Area, Extend }) {
  return (
    <Extend
      templateName="layout"
      pageHeader={<Header doc={piece} />}
    >
      {/* Post Content */}
      <article className="mb-4">
        <div className="container px-4 px-lg-5">
          <div className="row gx-4 gx-lg-5 justify-content-center">
            <div className="col-md-10 col-lg-8 col-xl-7">
              <Area doc={piece} name="main" />
            </div>
          </div>
        </div>
      </article>
    </Extend>
  );
}
```

<template v-slot:caption>
  modules/blog-page/views/show.jsx
</template>
</AposCodeBlock>

As outlined above, the header of the blog piece pages is different from the other pages. There are two ways that we could approach this. We could create a dedicated blog header component alongside the existing one. The other approach is to add some conditional markup to our existing `Header`. In this case, we will do the latter.

<AposCodeBlock>

```jsx
import dayjs from 'dayjs';

const pageClasses = {
  'default-page': 'page-heading',
  'blog-page': 'site-heading'
};

export default function({ doc }, { apos }) {
  const background = apos.image.first(doc.headerImage);
  const pageClass = pageClasses[doc.type] || 'post-heading';

  const style = background
    ? `background-image: url('${apos.attachment.url(background, { size: 'max' })}')`
    : 'background-color: blue;';

  return (
    /* Page Header */
    <header className="masthead" style={style}>
      <div className="container position-relative px-4 px-lg-5">
        <div className="row gx-4 gx-lg-5 justify-content-center">
          <div className="col-md-10 col-lg-8 col-xl-7">
            <div className={pageClass}>
              <h1>{doc.heading}</h1>
              {doc.type !== 'blog' ? (
                <span className="subheading">{doc.subheading}</span>
              ) : (
                <>
                  <h2 className="subheading">{doc.subheading}</h2>
                  <span className="meta">
                    Posted by {doc.author} on{' '}
                    {dayjs(doc.publicationDate).format('MMMM D, YYYY')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
```

<template v-slot:caption>
  views/components/Header.jsx
</template>
</AposCodeBlock>

So, what did we change? Looking at the code differences in the header section of each of the three pages, we can see that the container for the header text has a different class depending on the template page type. Because this is ordinary JavaScript, a small lookup object maps `doc.type` to the right class, falling back to `post-heading` — clearer than a chain of conditionals once there are more than two cases. Next, we wrap the markup below the `h1` tag in a ternary to only add the metadata if we are on a blog page.

Now we need to add our pages to the site and give them some content. The "About Me" and "Contact Me" both use the `default-page` template. The existing "Home" page should be swapped out for a `blog-page` template. All that is left to do is create your blog articles!

## Summary

Any pre-made HTML template can be converted for use in Apostrophe through some simple steps.

- Add the front end assets to your Apostrophe project
- Create an Apostrophe page type for each of the template pages that substitutes data from the schema fields into each area of the page that you want to edit.
- Add special piece types and piece page types

In this tutorial, we took extra steps to create reusable navigation, header, and footer components. While this makes the overall project more compact it is completely optional. Hopefully, this will help you get your Apostrophe project up and running a little more quickly!
