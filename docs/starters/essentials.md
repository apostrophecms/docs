---
prev: false
next: false
---
# Apostrophe Pro Essentials Starter Kit

::: info
This page provides detailed information about a Pro module, accessible with an Apostrophe Pro subscription. If you haven't subscribed yet, explore our [Apostrophe Workspaces](https://app.apostrophecms.com/login) to discover the benefits of a subscription. For further details or inquiries, feel free to [contact us](https://apostrophecms.com/contact-us) or visit our [pricing page](https://apostrophecms.com/pricing).
:::

## Purpose
The purpose of the Pro Essentials Starter Kit is to serve as a quick start for single-site Apostrophe Pro projects.
As such, it includes several Pro modules, pre-configured, although it does not include all, as developer needs vary. Subscribers will have access to additionally `npm install` and configure any of the Pro modules listed on our website.

It also serves as example code for creating your own custom modules and organizing your files in an ApostropheCMS project. The [section describing the widgets](#provided-widgets) outlines some code practices and features that can be used in your own custom modules.

This Starter Kit includes:

* The `@apostrophecms-pro/document-versions` module.
* Example configuration of the `@apostrophecms-pro/palette` module.
* Basic Apostrophe Widgets, including an Accordion, Card, Column, Hero, Link, and Slideshow Widget located in `modules/widgets`.
* Basic examples of theme specific front-end code.

## Requirements For Development On Your Computer

### Operating System: Mac, Linux, or Virtual Linux

**Your local development environment must be either MacOS or Linux.** If your development computer runs Windows, we recommend development on
Windows Subsystem for Linux (WSL). Microsoft recommends WSL for Node.js development.

### Software Installation Requirements

To test-drive the project in development, make sure you have Apostrophe's usual dependencies on your local machine:

* MongoDB (5.x or better, we recommend 6.x or better)
* NodeJS (18.x or better)

For more information see the Apostrophe [Getting Started Tutorial](https://docs.apostrophecms.org/getting-started/setting-up-your-environment.html).

## Getting Started
The Pro Essentials starter kit can either be installed using the [Apostrophe CLI tool](https://apostrophecms.com/extensions/apos-cli) or you can navigate to the [official GitHub repository](https://github.com/apostrophecms/starter-kit-pro-essentials), fork the template into your own account, and clone it locally.

---
### Installing with the CLI tool

To install with the [CLI tool](https://apostrophecms.com/extensions/apos-cli), use the `--starter` flag to specify this kit:

```sh
apos create my-project --starter=pro-essentials
```
---
### To install from GitHub:

1) `git clone` the [Starter Kit](https://github.com/apostrophecms/starter-kit-pro-essentials) and push it up to your own git repository under an appropriate name, matching your choice of `shortName`, for ongoing work.

2) Install dependencies:

``` sh
npm install
```

3) Add an admin user:

``` sh
node app @apostrophecms/user:add admin admin
```

Enter a password when prompted.

## Before you begin

This document assumes familiarity with Apostrophe concepts. If you are not already familiar with
single-site Apostrophe development, you should pause here and familiarize yourself with the
[ApostropheCMS documentation](https://docs.apostrophecms.org/) as a starting point.

## First Steps: required before project startup

### Setting your shortName

**Don't leave this setting in `app.js`, or anything else, set to `CHANGEME`.** The `shortName` should usually be the same
as your repository name, which should usually be the same as the name of your project folder. It will also be the name of
your MongoDB database by default in local development. Do not use punctuation other than hyphens. Good examples include
`smithco-marketing`, to distinguish from other sites built for that company, or just `smithco`.

This name should be unique among your projects.

Note that the CLI tool will automatically change this to the project name you used for installation.

### Disabled File Key

In `app.js`, locate `disabledFileKey` and change `CHANGEME` to a random string of your choosing. This is used when disabling access to files in the local backend. Do not leave it set to `CHANGEME`.

### Session Secret

In `app.js`, locate `secret` and change `CHANGEME` to a random string of your choosing. This is used for login session encryption. Do not
leave it set to `CHANGEME`.


After following all the steps above you can start your project in development mode:

``` sh
npm run dev
```

Once the project has finished starting up you can visit:

``` sh
http://localhost:3000/login
```

And log in with the admin account you created for the site. Then make some simple edits to the homepage.


## Site Development

Right now we have basic example templates in place. Let's look at where to put our code to customize the experience.

> Again, if you are not already familiar with single-site Apostrophe development, you should pause here and
[review the ApostropheCMS documentation](https://docs.apostrophecms.org/) as a starting point.

Just like in any single-site Apostrophe project, modules are configured in `app.js`, and module code lives
in subdirectories of `modules/`.

Feel free to add page templates and modules as you would with an ordinary open-source Apostrophe project. You can `npm install` modules
like `@apostrophecms/blog` and configure them in a normal way. You can also install additional Pro modules like
`@apostrophecms-pro/advanced-permission` if they are necessary to your plans.

### The `theme-default` module

Apostrophe allows frontend assets to be placed in any module, but as a suggested
code organization, this project contains a `theme-default` module with a sample
`ui/src/index.js` and `ui/src/index.scss` as described further below. This approach
simplifies later migration to an Assembly multisite project especially if you anticipate
implementing a choice of themes at that time.

The `theme-default` module also modifies the base webpack build to incorporate SCSS variables for colors and fonts. This is included to demonstrate how to set up centralized theme management with global variables in one place. It also adds a function for converting font sizes from `px` to `rem`. While this is a useful function that is used in several of the `theme-default` stylesheets, it primarily serves to illustrate how SCSS functions can be added to your project. A similar approach would be used to add in any SCSS mixins that subsequent stylesheets utilize.

The `views` folder of the `theme-default` module has two markup files that provide the HTML for the `@apostrophecms/home-page`. The main `welcome.html` file contains a conditional block for displaying different content based on whether there is a user is logged in or not. It has a second conditional block for displaying markup from the `placeholder.html` file if no content has been added to the page. You can choose to maintain this structure and modify the `welcome.html` file, or change the `modules/@apostrophecms/home-page/views/page.html` to contain your own markup.

#### Modern Frontend Assets Without A Custom Build Process

There is no need for a custom Webpack configuration in most cases. Specifically, you can follow our documentation and place your modern
JavaScript code in the `ui/src/index.js` file of any module, or use `import` statements in that file to import it there. As noted in
our documentation, it is **important for `ui/src/index.js` to export a function as its default export.** This function will be invoked
to initialize your module at a safe time when `apos.http`, `apos.util`, etc. are already available.

You may also place Sass SCSS code in the `ui/src/index.scss` file of any module, and use `import` statements in that file to bring in
more Sass SCSS code.

#### Frontend Assets With Your Own Build Process

A sample webpack build is not included as standard equipment, as `ui/src` suffices for most needs, and the built-in, automatic Webpack configuration
can be extended, per our public documentation and as illustrated. However, if you prefer to create your own webpack configuration, the typical pattern
is to configure the output of your build process to be a `ui/public/something.js` file in any module in your Apostrophe project.

#### Serving Static Files: Fonts and Static Images

If you need to serve static files, you can do this much as you would in standalone Apostrophe development.

The folder `public` maps to `/` in the URL space of a site. For instance, `public/fonts/myfile.ttf` maps to the URL `/fonts/myfile.ttf`.
For assets like favicons and fonts, you can add `link` tags to the `standardHead` block already present in
`modules/@apostrophecms/template/views/outerLayout.html`.

### Palette Configuration

The palette module allows styles to be edited visually on the site. It is configured in `modules/@apostrophecms-pro/palette/index.js`.
There you can specify the selectors, CSS properties, and field types to be used to manipulate color, font size, font family
and other aspects of the site as a whole.

For complete information and a sample configuration, see the [@apostrophecms-pro/palette module documentation](https://apostrophecms.com/extensions/palette-3).

> Note that like all other changes, palette changes do not take place for logged-out users until the editor clicks "Publish."

## Hosting and Deployment

### If we are your host

If we are hosting Apostrophe for you, then you can deploy updates to your staging and production environments by pushing to your
`staging` and `production` git branches, respectively. You will receive notifications in our shared Slack channel, including links to
access the deployment progress logs.

Apostrophe will complete the build steps listed in the `build` npm command provided in `package.json` and also execute any
database migrations before restarting with your newest code.

### Self-hosting

Self-hosting is also an option if you have not chosen to host with us. We offer several how-to guides on this, such as
[Ubuntu hosting setup](https://v3.docs.apostrophecms.org/cookbook/ubuntu-hosting.html) and
[deploying Apostrophe in the cloud with Heroku](https://v3.docs.apostrophecms.org/cookbook/deploying-to-heroku.html). The main new element
with Apostrophe Pro is making sure that the `npm install` command has access to the `@apostrophecms-pro` modules during installation.

Here is the simplest recipe to achieve that:

1. Make sure you have been granted access to install our pro modules (that is, make sure `npm install` works for you in this project). If
not, reach out to our support team.
2. [Log into the npm website](https://www.npmjs.com/) using the account that has been granted access.
3. Pull down the personal menu and select "Access Tokens."
4. Select "Classic Token" from the "Generate Tokens" dropdown.
5. Give the token a name, such as "ops-deployment".
6. Select "Read-Only."
7. **Immediately** copy and paste the token that is displayed. It will not be shown again.
8. Create a `.npmrc` file in the root of your project, like this:

```
//registry.npmjs.org/:_authToken=YOUR-TOKEN-HERE
```

It is also possible to use an environment variable for additional security, depending on your preferred deployment and hosting
solution. Please see the npm documentation for more information on that option.

## Provided widgets
There are six basic widget modules located in the `modules/widgets` folder of this starter kit. This supplements the core `rich-text`, `image`, `video`, and `html` widgets. They can be altered to fit the design and functionality of your project or act as a blueprint to build your own custom widgets. Both the `hero` and `column` widgets have been added to the `main` area of the `@apostrophecms/home-page`. The remainder of the basic widgets have been added to the areas of the `column` widget as described below.

If you look at the `app.js` file you won't see these widget modules in the `modules` object. Instead, they are being registered using the `nestedModuleSubdirs` property. Setting this property to `true` will cause Apostrophe to register all the modules listed in the `modules.js` file of any subfolder in the project-level `modules` folder. You can choose to organize any custom modules, such as grouping all of your piece-types, to keep your `modules` folder and the `app.js` file less cluttered. Note that if you choose to move any of the provided widgets out of the current folder you will need to add them to the `app.js` and remove them from the `modules/widgets/modules.js` file. If you choose to keep this structure, any custom widgets you add to the folder need to be listed in the `modules.js` file.

All the styling for the supplied widgets, except for the partials added in the custom webpack extensions added in the `theme-default` module, is located in the `ui/src/index.scss` file of each module. You can choose to maintain this structure, move the styling to the `theme-default/ui/src/scss` folder, or organize them in a different project-specific manner. Note that for them to be included in the standard webpack build, they need to be imported into a `<module>/ui/src/index.scss` file.

### `accordion-widget`
The `accordion-widget` implements an accordion element powered by the [`accordion-js` npm package](https://www.npmjs.com/package/accordion-js). You can read about additional configuration options in the documentation of that package. The module consists of a main `index.js` file with the content schema fields, plus a `views` folder that contains a `widget.html` file with the Nunjucks markup for the accordion.

Finally, there is the `ui/src` folder that contains the `index.scss` stylesheet and the `index.js` file that contains the JavaScript that is delivered to the frontend and powers the accordion using a [widget player](https://docs.apostrophecms.org/guide/custom-widgets.html#client-side-javascript-for-widgets). Any custom widgets that require client-side code should be structured in this same way. Data is passed from the schema fields to the browser for use in the player script by adding it to a data attributes in the template.

### `card-widget`
The `card-widget` creates a simple card with optional image and text. The card can be made directly clickable, or can have links and buttons added. The schema fields for these elements are provided by the `lib/schema/link.js` file, which serves as a model for implementing reusable parts of widgets. These same schema fields are reused in the `hero` and `link` widgets and can be used in your custom project widgets. The markup for the links is imported into the `card-widget` template from the `views/fragments/link.html` file using the [`rendercall` helper](https://docs.apostrophecms.org/guide/fragments.html#inserting-markup-with-rendercall). This is present in a simpler form in the `links-widget`. Again, all your custom modules (not just widgets) can utilize fragments to replicate similar areas of markup in this same way.

### `column-widget`
The `column-widget` implements one method of adding a user-selected number of columns to a page. It uses a select field and conditional fields that restrict the number of columns based on the value of the select. Each column has an area with widgets for the `link`, `card`, and `accordion` basic widgets, plus the core `rich-text`, `image`, and `video` widgets. These are added through a shared configuration object that defines the available widgets for each column. The first column additionally adds the basic `slideshow` widget.

The widget also provides a `helper(self)` customization function that is used in the Nunjucks template. Depending on the value of the select field it returns the correct number of columns. The `helper(self)` functions can be used in your custom modules to provide computed values from data passed back from the markup.

### `hero-widget`
The `hero-widget` implements a hero element with image or color background, text and links. As stated above, this module reuses the `links.js` helper file. It also demonstrates how to use `relationship` schema fields to add an image or video for the background.

### `link-widget`
This simple widget adds either a button or inline-link. As described for the `card-widget`, It utilizes the `lib/schema/link.js` helper file and the `views/fragments/link.html` fragment. Within the widget template there is a `rendercall` that passes data from the widget schema fields to the fragment.

### `slideshow-widget`
The `slideshow-widget`, much like the `accordion-widget`, utilizes client-side JavaScript. For this widget the `ui/src/index.js` is adding the [`swiper.js` package](https://swiperjs.com/) to the player.