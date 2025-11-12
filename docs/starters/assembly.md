---
prev: false
next: false
---
# Apostrophe Assembly Essentials Starter Kit

::: info
This page provides detailed information about a Pro module, accessible with an Apostrophe Pro subscription. If you haven't subscribed yet, explore our [Apostrophe Workspaces](https://app.apostrophecms.com/login) to discover the benefits of a subscription. For further details or inquiries, feel free to [contact us](https://apostrophecms.com/contact-us) or visit our [pricing page](https://apostrophecms.com/pricing).
:::

## Purpose

The purpose of the [Assembly Essentials starter kit](https://github.com/apostrophecms/starter-kit-assembly-essentials) is to serve as a quick start for multisite-enabled, cloud-hosted projects based on and hosted via Apostrophe Assembly. Technically speaking, it serves as a working example of a project built on the [`@apostrophecms-pro/multisite` module](https://apostrophecms.com/extensions/multisite-apostrophe-assembly).

It also serves as example code for creating your own custom modules and organizing your files in an ApostropheCMS project. The [section describing the widgets](#provided-widgets) outlines some code practices and features that can be used in your own custom modules.

This starter kit includes:

* An example of project-level code for your customer-facing sites.
* An example of project-level code for the dashboard site that manages the rest.
* An example of project-level frontend asset generation via a modern webpack build.
* Best practices for easy hostname configuration in dev, staging and prod environments.
* Support for multiple themes.

## Requirements For Development On Your Computer

### Operating System: Mac, Linux, or Virtual Linux

**Your local development environment must be either MacOS or Linux.** If your development computer runs Windows, we recommend development on Ubuntu Linux in a full virtual Linux machine, via [VirtualBox](https://www.virtualbox.org/).

Another option is to use the Windows Subsystem for Linux, which is also an Ubuntu Linux-based environment. However this option has not been extensively tested with Assembly.

### Software Installation Requirements

To test-drive the project in development, make sure you have Apostrophe's usual dependencies on your local machine:

* MongoDB (5.0 or better, we recommend 6.0)
* NodeJS (18.x or better, latest long term support release recommended)

For more information see the Apostrophe [Getting Started Tutorial](/guide/development-setup.md).

## Getting started

**We recommend installing this project by cloning it locally and then pushing it to a repository in your own account. The Apostrophe CLI is not currently intended for multisite projects**

1) Navigate to the [Starter Kit](https://github.com/apostrophecms/starter-kit-pro-essentials) repository and clone it locally, or navigate to the directory where you want your project installed and type:

```sh
git clone https://github.com/apostrophecms/starter-kit-assembly-essentials.git your-new-project-name
```
2) In the root directory of your project initialize version tracking with your preferred tool (GitHub, BitBucket, SourceForge, etc...) and create the base repo for your project.

3) Install dependencies:

``` sh
npm install
```

3) After installation, add an admin user to the dashboard site, which manages all other sites:

```sh
node app @apostrophecms/user:add admin admin --site=dashboard
```

Enter a password when prompted.

> When running command line tasks in a multisite environment you must always specify which site you are referring to. For the dashboard, use `--site=dashboard`. For other sites, you can use any of their valid hostnames, or `--all-sites` which runs the task on every site except the dashboard.

## First Steps: required before project startup

### Setting your shortname prefix

Before you do anything else, set the fallback value for the `shortnamePrefix` option in `app.js` to a unique string for your project, replacing `a3ab-`. This should match your repo name followed by a `-` character. This should be distinct from any other Assembly projects you have, to ensure their MongoDB databases do not conflict in a dev environment.

> MongoDB Atlas note: if you are self-hosting and you plan to use a low-end MongoDB Atlas cluster (below M10), you must use a unique prefix less than 12 characters (before the `-`), even if your repo name is longer. This is not an issue with hosting provided by the Apostrophe Assembly team.

### Configuring your domains

After cloning this project, be sure to edit the `domains.js` file in the root directory and update the list to match your actual project's domains, typically for development, staging, and production. The `@apostrophecms-pro/multisite-dashboard` extension's `site` module requires an object with URL strings for the `baseUrlDomains` option, and this file provides those values. While `dev`, `staging`, and `prod` are common domain names, you can use other names, but the first one defined in the object will be considered the development environment.

If you are doing local development on your own computer, leave the `dev` domain set to `localhost:3000`. For staging and production, the Apostrophe Assembly team will typically preconfigure this for you and you won't need to worry about DNS or certificates.

If you are rolling your own hosting, the recommended approach is to create a DNS "wildcard" `A` record for a subdomain of your actual domain name, like `*.staging.example.com`, and configure `staging.example.com` as the `staging` value in `domains.js`. You'll also need a wildcard SSL certificate for each of staging and production.

You will later be able to set a "shortname" for each site and it will automatically work as a subdomain of all three domains. This saves a lot of configuration effort.

> In the case of production, you will of course also be able to add a final production domain name for *each* site via the user interface. But you will need a "pre-production" hostname for early content creation. That is where `baseUrlDomains` comes into play even for production.
>
> You are not restricted to the environment names `dev`, `staging` and `prod`. However, the first environment configured is assumed to be a local debugging environment for programmers (typically `dev`), and the environment named `prod` is the only one that attempts to serve a site under its `prodHostname`. If you are working with the Apostrophe Assembly team for hosting, ask us for an additional cloud instance for each environment.

### Adding a suffix to your subdomains (optional)

The `shortNameSuffix` configuration option, which defaults to an empty string, allows you to add additional suffix string to every site short name. For example, for a site with short name `cars` and the following configuration:
```js
multisite({
  // ...
  shortNameSuffix: '-assembly',
});
```
The resulting base URL for this site will be `http://cars-assembly.localhost:3000`, `https://cars-assembly.staging.your-domain.com`, etc.

These options apply only when the hostname is determined in part by the `shortName` field for the site, so if a production hostname is configured, it will be used exactly as given.

> Note that your dashboard will also be affected, the base URL would become `https://dashboard-assembly.staging.your-domain.com`

> **Note:** This option is not currently supported by Apostrophe Assembly Hosting, as we apply the naming convention for you when hosting for you. It's there for self-hosted customers with different needs.

### Changing the locale separator of your subdomains (optional)

The `localeSeparator` configuration option, which defaults to `.`, allows you to change how the subdomains for localized sites (if chosen so) will be built. By default a dot separator will be used. For example, if "Separate Host" is enabled for a particular locale, `fr.cars.your-domain.com` will be the URL of a site with the short name `cars` and the `fr` locale.
If you apply the following configuration:
```js
multisite({
  // ...
  localeSeparator: '-',
});
```
The hostname above will become `fr-cars.your-domain.com`.

This option applies only when the hostname is determined in part by the `shortName` field for the site, so if a production hostname is configured for the locale it will be used exactly as given.

> **Note:** Your configuration won't be applied immediately on the existing sites. You need to update ("touch") your site records in order to apply the changes. You can do that for all existing sites via the CLI command `node app site:touch --site=dashboard`. If you do not have the `touch` task, update the apostrophe module to the latest 3.x version.

> **Note:** This option is not currently supported by Apostrophe Assembly Hosting, as we apply the naming convention for you when hosting for you. It's there for self-hosted customers with different needs.

### Setting your Dashboard shortname (optional)

By default, your dashboard will be available on a `dashboard` subdomain - `http://dashboard.localhost:3000`, `https://dashboard.staging.your-domain.com`, etc. You can change that with the configuration option `dashboardShortName` in your `app.js`. For example:
```js
multisite({
  // ...
  dashboardShortName: 'admin',
});
```
With the setting above, the Dashboard application will be available at `http://admin.localhost:3000`, `https://admin.staging.your-domain.com`, etc.

Note that if `shortNameSuffix` is also set, the two options are combined to arrive at the complete dashboard subdomain.

> **Note:** This option is not currently supported by Apostrophe Assembly Hosting. Contact us if this is a concern for your project.

### Disabled File Key

In `sites/index.js`, locate `disabledFileKey` and change `CHANGEME` to a random string of your choosing. This is used when disabling access to files in the local backend.

### Session Secret

In `sites/index.js`, locate `secret` and change `CHANGEME` to a random string of your choosing. This is used for login session encryption.


### `/etc/hosts` File Configuration Requirements

Because this project serves multiple websites, certain hostnames must point directly to your own computer for local testing.

**If you will only be testing in Chrome at first,** you do not have to edit your hosts file right away. That's because in Chrome, all subdomains of `localhost` resolve to your own computer.

However, in other browsers this is not true and you must add the following lines to `/etc/hosts` before proceeding:

```
127.0.0.1 dashboard.localhost company1.localhost
```

**You will need a subdomain for each test site you plan to add to the multisite platform.** See the example below, where a site called `company` is added to the platform via the dashboard. You can always add more of these entries later.

## Starting Up In Development
Once you have followed the steps above you are ready to start your project up in development mode.

Type
```
npm run dev
```

When ready, visit:

```
http://dashboard.localhost:3000/login
```

> If you are on a Mac this will work without extra configuration. If you are on Linux you may need to edit `/etc/hosts` and add an entry for `dashboard.localhost`, pointing to 127.0.0.1 just like plain `localhost` does. You'll do this for each site you test locally.

You can now log into the admin account and view the basic dashboard.

To create a site, access "Sites" on the admin bar and add a new site. Notice that sites are Apostrophe "pieces" in the dashboard.

Be sure to give your first site a "shortname" which is distinct from other sites, like `company1`. Also fill out the admin password field for the site.

After you successfully save the site, you can access:

```
http://company1.localhost:3000/login
```

And log in with the admin account you created for the site. Then make some simple edits to the homepage.

Now try creating `company2` and `company3`. Notice that while the code is the same, the databases and content are separate.

> If you access these sites while logged out, you won't see your content edits unless you have used the "Commit" button to make them live.

## Scheduling tasks with Apostrophe Assembly hosting

To schedule tasks much like you would with `cron` in a single-server environment, add a new `tasks` option to `app.js` when configuring `@apostrophecms/multisite`. This option is top-level, it's a peer of the `sites` and `dashboard` options.

```javascript
tasks: {
  // These tasks are run for all sites, i.e. like the `--all-sites` option
  'all-sites': {
    hourly: [
      // Run this task hourly but only on the server that
      // happens to grab the lock first
      'products:sync'
    ],
    daily: [ ... also supported, same syntax ]
  },
  // These tasks are run for the dashboard site, i.e. like `--site=dashboard`
  dashboard: {
    hourly: [
      'some-module-name:some-task-name'
    ],
    daily: [ ... also supported, same syntax ]
  }
}
```

Note that the individual tasks are configured as strings. These strings start with the Apostrophe task name, like `product:sync`, and can optionally also include additional parameters to the task exactly as they would if you invoked it directly at the command line. You should **not** include `node app` in these strings.

Then, to test your hourly tasks in a local environment:

```javascript
node app tasks --frequency=daily
```

> ⚠️ VERY IMPORTANT NOTE: this will intentionally **not** run the job more than once in an hour, even if you try to test it twice in an hour. That's normal. This is a guard so that tasks scheduled on more than one of our workers actually run just once as intended.

If you need to skip that check for testing purposes, you can clear the `aposTaskLog` mongodb collection in your dashboard database. If your `shortName` is `companyname`, then your dashboard database name is `companyname-dashboard`.

## Site Development

Right now we have a bare-bones example. Let's look at where to put our code to customize the experience.

### Where Does My Apostrophe Project Code Go?

> If you are not already familiar with single-site Apostrophe development, we strongly recommend that you [read the ApostropheCMS documentation](https://apostrophecms.com/docs) as a starting point.

In a typical single-site Apostrophe project, modules are configured in `app.js`. In a multisite project, you'll find that `app.js` is instead reserved for top-level configuration that applies to all sites.

The code you're used to seeing in `app.js` can instead be found in `sites/index.js`. And, the code you're used to seeing in `modules` can be found in `sites/modules`.

In all other respects, development is just like normal ApostropheCMS single-site development. Feel free to add page templates and modules. You can `npm install` modules like `@apostrophecms/blog` and configure them in a normal way; just do it in `sites/index.js` rather than `app.js`.

If you have already started a single-site project, you can move your modules directly from `modules` to `sites/modules`, and move the `modules` section of your `app.js` file to the corresponding section of `sites/index.js`. However, take note of the existing settings we provide and merge accordingly.

> **If you are hosting your project with us, or using tools provided by us, you should remove any legacy app.js or module code that configures UploadFS cloud storage or mongodb database hosts.** Such settings are handled automatically and the configuration is set behind the scenes by `@apostrophecms-pro/multisite` and the provided logic in the starter kit.

### Themes

Apostrophe Assembly and the multisite module are designed to accommodate hundreds of websites, or more, running on a single codebase. But, you may need some differences in appearance and behavior that go beyond what the palette editor can provide. For that you can create multiple themes. Each site is set via the dashboard UI to use a single theme and will typically stay with that theme throughout its lifetime.

You might not need more than one theme. If that's the case, just build out the `default` theme to suit your needs, and remove the `demo` theme from `themes.js`. You can also remove the `sites/modules/theme-demo` module and `sites/lib/theme-demo.js`.

#### Adding a New Theme

To configure your list of themes, edit `themes.js`. Right now it looks like:

```javascript
module.exports = [
  {
    value: 'default',
    label: 'Default'
  },
  {
    value: 'demo',
    label: 'Demo'
  }
];
```

You can add additional themes as needed. Your `value` should be a shortname like `default` or `arts`. The `value` must not be changed later.

#### Custom Module Configuration for Themes

If your theme is named `default`, then you must have a `sites/lib/theme-default.js` file, like this:

```javascript
module.exports = function(site, config) {
  config.modules = {
    ...config.modules,
    'theme-default': {}
  };
};
```

The `config` object already contains what was configured in `sites/index.js`. Here we can modify the configuration by adding extra modules only for this theme, or changing the configuration of a module specifically for this theme.

In this case we add one custom module, `theme-default`, when the default theme is active. **It is a best practice to push your theme's frontend assets to Apostrophe in a module like this,** named after the theme. If your themes share any assets, then they should be imported into the appropriate `.js` or `.scss` master file by each theme.

#### Modern Frontend Assets Without A Custom Build Process

Beginning with the 1.1.0 release, there is no need for Webpack for simpler cases. Specifically, you can follow our documentation and place your modern JavaScript code in the `ui/src/index.js` file of any module, or use `import` statements in that file to import it there. As noted in our documentation, it is **important for `ui/src/index.js` to export a function as its default export.** This function will be invoked to initialize your module at a safe time when `apos.http`, `apos.util`, etc. are already available.

You may also place Sass SCSS code in the `ui/src/index.scss` file of any module, and use `import` statements in that file to bring in more Sass SCSS code.

To include theme-specific code, place it in the `ui/src/index.scss` or `ui/src/index.js` file of the appropriate theme module. The provided example theme modules are `theme-default` and `theme-alternate`.

For example:
- The default theme's SASS stylesheet entrypoint is located at `sites/modules/theme-default/ui/src/index.scss`
- The default theme's JavaScript browser-side entry point is located at: `sites/modules/theme-default/ui/src/index.js`

#### Example webpack extensions

The `theme-default` and `theme-demo` modules modify the base webpack build using the [`webpack` property](/guide/webpack.md#extending-webpack-configuration) to incorporate SCSS variables for colors and fonts. This is included to demonstrate how to set up centralized theme management with global variables in one place. They also both add a function for converting font sizes from `px` to `rem`. While this is a useful function that is used in several of the `theme-default` stylesheets, it primarily serves to illustrate how SCSS functions can be added to your project. A similar approach would be used to add in any SCSS mixins that subsequent stylesheets utilize.

The two theme modules accomplish this extension in slightly different ways. The `theme-default` extension adds all the variables and the function into a template literal block within the `additionalData` property. If you continue to use the `theme-default` module in your project and want to use the included project-level widgets, you need to keep and potentially edit this template literal block since the styling of the widgets depends on them.

The `theme-demo` module includes the variables and function by importing files from the `sites/modules/theme-demo/ui/src/scss/settings/` folder. Note that these files also need to be imported into the `sites/modules/theme-demo/ui/src/index.scss` file. This is necessary for the main webpack build to include them. If your project includes additional [SASS "partials"](https://sass-lang.com/guide/#partials) files that other stylesheets access through `@use` you will need to add them to both the `index.scss` file and in the extended webpack configuration. Again, the project-level widgets included in this starter-kit depend on the styling included in these files.

The `theme-default` module depends on only the `sites/layout.html` file to provide markup for the `@apostrophecms/home-page` page type. In contrast, the `views` folder of the `theme-demo` module has two markup files that provide additional HTML markup. The main `welcome.html` file contains a conditional block for displaying different content based on whether there is a user is logged in or not. It has a second conditional block for displaying markup from the `placeholder.html` file if no content has been added to the page. The Nunjucks template in the `sites/modules/@apostophecms/home-page/views/page.html` file conditionally adds this markup if `demo` is the selected theme. You can choose to maintain this structure and modify the `welcome.html` file, or change the `modules/@apostrophecms/home-page/views/page.html` to contain your own markup.

#### Frontend Assets With Your Own Build Process

Beginning with the 1.1.0 release, a sample webpack build is not included as standard equipment, as `ui/src` suffices for most needs. However, if you need to use webpack or another custom build process, the solution is to configure the output of your build process to be a `ui/public/something.js` file in any module in your Apostrophe project. As above you can create a build that is included in only one theme by writing its output to the `ui/src` subdirectory of that theme module.

#### Developing For IE11

With Microsoft ending Internet Explorer 11 support in 2022, we no longer enable IE11 support by default. However you can enable IE11 support by setting the `es5: true` option to the `@apostrophecms/asset` module. This will create a compatibility build of your `ui/src` JavaScript. Please note that editing is never supported in IE11. See the Apostrophe documentation for more information.

#### Serving Static Files: Fonts and Static Images

If you need to serve static files, you can do this much as you would in standalone A3 development.

The folder `sites/public` maps to `/` in the URL space of a site. For instance, `sites/public/fonts/myfile.ttf` maps to `/fonts/myfile.ttf`. For assets like favicons and fonts, you can add `link` tags to the `standardHead` block already present in `sites/modules/@apostrophecms/template/views/outerLayout.html`.

### Palette Configuration

The palette allows styles to be edited visually on the site. It is configured in `sites/modules/@apostrophecms-pro/palette/index.js`. There you can specify the selectors, CSS properties, and field types to be used to manipulate color, font size, font family and other aspects of the site as a whole.

For complete information and a sample configuration, see the [@apostrophecms-pro/palette module documentation](https://npmjs.org/package/@apostrophecms-pro/palette). *You will need to be logged into an npm account that has been granted access, such as the one you used to npm install this project.*

> Note that like all other changes, palette changes do not take place for logged-out users until the user clicks "Publish."

## Provided widgets
There are six basic widget modules located in the `sites/modules/widgets` folder of this starter kit. This supplements the core `rich-text`, `image`, `video`, and `html` widgets. They can be altered to fit the design and functionality of your project or act as a blueprint to build your own custom widgets. Both the `hero` and `column` widgets have been added to the `main` area of the `@apostrophecms/home-page`. The remainder of the basic widgets have been added to the areas of the `column` widget as described below.

If you look at the `sites/index.js` file you won't see these widget modules in the `modules` object. Instead, they are being registered using the `nestedModuleSubdirs` property. Setting this property to `true` will cause Apostrophe to register all the modules listed in the `modules.js` file of any subfolder in the project-level `sites/modules` folder. You can choose to organize any custom modules, such as grouping all of your piece-types, to keep your `modules` folder and the `index.js` file less cluttered. Note that if you choose to move any of the provided widgets out of the current folder you will need to add them to the `sites/index.js` file and remove them from the `sites/modules/widgets/modules.js` file. If you choose to keep this structure, any custom widgets you add to the folder need to be listed in the `modules.js` file.

All the styling for the supplied widgets, except for the partials added in the custom webpack extensions added in the theme modules, is located in the `ui/src/index.scss` file of each module. You can choose to maintain this structure, move the styling to another project-level module like a `sites/modules/asset/ui/src/` folder, or organize them in a different project-specific manner. Note that for them to be included in the standard webpack build, they need to be imported into a `<module>/ui/src/index.scss` file.

### `accordion-widget`
The `accordion-widget` implements an accordion element powered by the [`accordion-js` npm package](https://www.npmjs.com/package/accordion-js). You can read about additional configuration options in the documentation of that package. The module consists of a main `index.js` file with the content schema fields, plus a `views` folder that contains a `widget.html` file with the Nunjucks markup for the accordion.

Finally, there is the `ui/src` folder that contains the `index.scss` stylesheet and the `index.js` file that contains the JavaScript that is delivered to the frontend and powers the accordion using a [widget player](/guide/custom-widgets.md#client-side-javascript-for-widgets). Any custom widgets that require client-side code should be structured in this same way. Data is passed from the schema fields to the browser for use in the player script by adding it to a data attributes in the template.

### `card-widget`
The `card-widget` creates a simple card with optional image and text. The card can be made directly clickable, or can have links and buttons added. The schema fields for these elements are provided by the `lib/schema/link.js` file, which serves as a model for implementing reusable parts of widgets. These same schema fields are reused in the `hero` and `link` widgets and can be used in your custom project widgets. The markup for the links is imported into the `card-widget` template from the `sites/views/fragments/link.html` file using the [`rendercall` helper](/guide/fragments.md#inserting-markup-with-rendercall). This is present in a simpler form in the `links-widget`. Again, all your custom modules (not just widgets) can utilize fragments to replicate similar areas of markup in this same way.

### `column-widget`
The `column-widget` implements one method of adding a user-selected number of columns to a page. It uses a select field and conditional fields that restrict the number of columns based on the value of the select. Each column has an area with widgets for the `link`, `card`, and `accordion` basic widgets, plus the core `rich-text`, `image`, and `video` widgets. These are added through a shared configuration object that defines the available widgets for each column. The first column additionally adds the basic `slideshow` widget.

The widget also provides a `helper(self)` customization function that is used in the Nunjucks template. Depending on the value of the select field it returns the correct number of columns. The `helper(self)` functions can be used in your custom modules to provide computed values from data passed back from the markup.

### `hero-widget`
The `hero-widget` implements a hero element with image or color background, text and links. As stated above, this module reuses the `links.js` helper file. It also demonstrates how to use `relationship` schema fields to add an image or video for the background.

### `link-widget`
This simple widget adds either a button or inline-link. As described for the `card-widget`, It utilizes the `lib/schema/link.js` helper file and the `sites/views/fragments/link.html` fragment. Within the widget template there is a `rendercall` that passes data from the widget schema fields to the fragment.

### `slideshow-widget`
The `slideshow-widget`, much like the `accordion-widget`, utilizes client-side JavaScript. For this widget the `ui/src/index.js` is adding the [`swiper.js` package](https://swiperjs.com/) to the player.

## Dashboard Development

**The dashboard site has one job: managing the other sites.** As such you don't need to worry about making this site a pretty experience for the general public, because they won't have access to it. However you may want to dress up this experience and add extra functionality for your own customer admin team (the people who add and remove sites from the platform).

This starter kit has the `@apostrophecms-pro/multisite-dashboard` extension installed. This converts the dashboard from sites being presented as individual cards to a scrollable list. Each site now has a link for login to the site, as well as navigation to the home-page. This extension also creates a search box that makes finding sites easier. Finally, this extension also adds a template tab to the site creation modal. When creating or editing a site you can select to make it a template by clicking on "Template" control in the "Basics" tab. This will still be an active site, but it will be moved to the template tab. Sites in the template tab can be duplicated by selection that option in the context menu to the far right.

The dashboard site can be extended much like the regular sites. Dashboard development is very similar to regular site development, except that modules live in `dashboard/modules`, what normally resides in `app.js` lives in `dashboard/index.js`, and so on.

The most important module is the `site` module. The `site` module is a piece type, with a piece to represent each site that your dashboard admins choose to create. This module is registered through the `@apostrophecms-pro/multisite-dashboard` extension and can be extended at the project level by creating a `dashboard/modules/@apostrophecms-pro/site` folder and placing your code there. This is the [standard method](/guide/modules.md) for extending any package at project level.

The `site` schema field values get passed to the individual sites in the `site` object. This is what is used to set the theme configuration in the `sites/index.js` file. The starter kit is also adding the value of the `theme` schema field to the `apos.options` object.

```
// sites/index.js
module.exports = function (site) {
  const config = {
    // Theme name is globally available as apos.options.theme
    theme: site.theme,
    ...
```

If you have additional values being passed from the `site` piece schema that you want to make available to your modules you have several choices. The value can be added in the modules config options in the `sites/index.js` file.

```javascript
// sites/index.js
module.exports = function (site) {
  const config = {
    // Theme name is globally available as apos.options.theme
    theme: site.theme,
    nestedModuleSubdirs: true,
    modules: {
      'commerce-page': {
        options: {
          apiKey: site.apiKey,
        }
      },
      ...
```
You can also elect to add them to the `apos.options` object, as is shown above example for the `site.theme`. This can then be accessed in any module function with access to `self` using `self.apos.options.<property>`. If you need that value in your templates you can use the [`templateData` module option](/reference/module-api/module-options.md#templatedata).
### Allowing dashboard admins to pass configuration to sites

You can add custom schema fields to `sites` and those fields are available on the `site` object passed to `sites/index.js`, and so they can be passed on as part of the configuration of modules.

However, there is one important restriction: you **must not decide to completely enable or disable a module that pushes assets on any basis other than the theme name.** This is because Apostrophe builds only one asset bundle per theme.

**"Should I add a field to the `site` piece in the dashboard, or just add it to `@apostrophecms/global` for sites?"** Good question! Here's a checklist for you:

* **If single-site admins who cannot edit the dashboard should be able to edit it,** you should put it in `sites/modules/@apostrophecms/global`.
* **If only dashboard admins who create and remove sites should be able to make this decision,** it belongs in `dashboard/modules/site/index.js`. You can then pass it on as module configuration in `sites/lib/index.js`.

## Accessing the MongoDB utilities for a specific site

The database name for a site is the prefix, followed by the `_id` of the site piece. However this is awkward to look up on your own, so we have provided utility tasks to access the MongoDB utilities:

```
# Mongo shell for the dashboard site
node app mongo:mongo --site=dashboard
# Mongo shell for an individual site; use its hostname
# in the appropriate environment
node app mongo:mongo --site=test1.localhost
# mongodump
node app mongo:mongodump --site=test1.localhost
# mongorestore, with the --drop option to prevent
# doubled content
node app mongo:mongorestore --site=test1.localhost -- --drop
```

Note the use of `--` by itself as an end marker for the options to Apostrophe, allowing the `--drop` option to be passed on to `mongodump`.

## Hosting

Hosting for staging and production clouds is typically provided by the Apostrophe Assembly team.

Self-hosted arrangements can also be made. For more information contact the Apostrophe Assembly team.

## Deployment

If we are hosting Apostrophe Assembly for you, then you can deploy updates to your staging cloud by pushing to your `staging` git branch, and deploy updates to your production cloud by pushing to your `production` git branch. You will receive notifications in our shared Slack channel, including links to access the deployment progress logs.

Apostrophe will complete asset builds for each theme, as well as running any necessary new database migrations for each site, before switching to the newly deployed version of the code.

## Profiling with OpenTelemetry

ApostropheCMS supports profiling with OpenTelemetry. There is an [article in the documentation](/cookbook/opentelemetry.md) covering the use of OpenTelemetry in general. Launching Apostrophe Assembly with OpenTelemetry support is slightly different. However for your convenience, `app.js` and `telemetry.js` are already set up appropriately in this project.

To launch in your local development environment with OpenTelemetry logging to Jaeger, first [launch Jaeger according to the instructions in our documentation](/cookbook/opentelemetry.md). Then start your Apostrophe Assembly project like this:

```
APOS_OPENTELEMETRY=1 npm run dev
```

This provides a great deal of visibility into where the time is going when Apostrophe responds to a request. Note that separate hosts can be distinguished via the `http.host` tag attached to each request in Jaeger.

Using OpenTelemetry in a staging environment provided by the Apostrophe team is possible. This involves modifying the provided `telemetry.js` file to log to a hosted backend such as [New Relic](https://docs.newrelic.com/docs/more-integrations/open-source-telemetry-integrations/opentelemetry/opentelemetry-introduction/) using an appropriate Open Telemetry exporter module. `process.env.ENV` can be used to distinguish between `dev` or no setting (usually local development), `staging` and `prod` when decidig whether to enable an OpenTelemetry backend.

We do not recommend enabling OpenTelemetry in production, at least not permanently, because of the performance impact of the techniques OpenTelemetry uses to obtain the necessary visibility into async calls.

## Self-hosting and the sample Dockerfile

A sample `Dockerfile` is provided with this project and can be used for self-hosting. See also the provided `.dockerignore` file.

Typical `build` and `run` commands look like:

```bash
# build command
docker build -t apostrophe-assembly . \
  --build-arg="NPMRC=//registry.npmjs.org/:_authToken=YOUR_NPM_TOKEN_GOES_HERE" \
  --build-arg="ENV=prod" --build-arg="APOS_PREFIX=YOUR-PREFIX-GOES-HERE-" \
  --build-arg="DASHBOARD_HOSTNAME=dashboard.YOUR-DOMAIN-NAME-GOES-HERE.com" \
  --build-arg="PLATFORM_BALANCER_API_KEY=YOUR-STRING-GOES-HERE" \
  --build-arg="APOS_S3_REGION=YOURS-GOES-HERE" \
  --build-arg="APOS_S3_BUCKET=YOURS-GOES-HERE" \
  --build-arg="APOS_S3_KEY=YOURS-GOES-HERE" \
  --build-arg="APOS_S3_SECRET=YOURS-GOES-HERE"

# run command
docker run -it --env MONGODB_URL=YOUR-MONGODB-ATLAS-URL-GOES-HERE apostrophe-assembly
```

To avoid passing the real MongoDB URL to the build task, currently the provided Dockerfile uses a
temporary instance of `mongod` to satisfy a requirement that it be present for the build task.

An npm token is required to successfully `npm install` the private packages inside the
image during the build.

S3 credentials are passed to the build so that the static assets can be mirrored to S3, however
at a cost in performance this can be avoided by removing `APOS_UPLOADFS_ASSETS=1` from
the `Dockerfile` and removing the references to these environment variables as well. Note
that you will still need S3 credentials in the `run` command, unless you arrange for
`dashboard/public/uploads` and `sites/public/uploads` to be persistent volumes on a
filesystem shared by all instances. This is slow, so we recommend using S3 or configuring
a different [uploadfs backend](https://github.com/apostrophecms/uploadfs) such as
Azure Blob Storage or Google Cloud Storage.

## Localized domain names

Dashboard administrators can define the locales for each site from the `locales` tab of the site editor modal. This is turned on by default with the `localizedSites` option of the `site` module set to `true`.

You can add as many locales as you want via the `locales` tab, and for each of them you can give it a name, label, prefix, choose if you want a separate host, and if so, set a separate production hostname.

If the separate host is set to `true`, the locale will be used as a subdomain of the domain name
in addition to the separate production hostname if that field has been filled out and DNS has been configured for it.
There is now also `stagingSubdomain` to allow a free choice of staging subdomain name,
for those who want to test the effects of `separateProductionHostname` being set the same for any group of sites in advance.

Let's say we have a French locale with these options:

| Fields                       | Values               |
|------------------------------|----------------------|
| Label                        | `French`             |
| Prefix                       |                      |
| Separate Host                | `true`               |
| Separate Production Hostname | `my-french-site.com` |


And our site piece `shortName` is set to `site`.

In this case, if the environment variable `ENV` is set to `staging`, we will have `fr.site.staging.com` as the hostname.
If we are in production, so `ENV` is set to `prod`, we will have `fr.site.production.com` and `my-french-site.com` (only in production) as hostnames.

If we set a prefix, such as `/fr`, then only URLs in which the path part begins with `/fr` will display content from that locale. This way some locales can share the same `separateProductionHostname` being differentiated by the prefix.

If `separateHost` is set to `false` and `prefix` is `/fr`, we simply use the latter to differentiate locales: `site.localhost:3000/fr`, `site.staging.com/fr`, `site.production.com/fr`.

Note that you can have only one locale with no prefix _and_ no separate host, that would be the default one.

## Private locales

You can make a locale `private`, meaning that this locale is only visible for logged in users.

There is a new `boolean` field with the label `Private Locale` for each configured locale in your dashboard.

When adding the option `localizedSites` to the `site` module of your project, instead of `true` you can pass an object and specify the option `privateByDefault`.
If this sub-option is set to `true`, every new locale created will have its `private` property set to `true` by default, otherwise they will be public by default.

```javascript
// in dashboard/index.js
const themes = require('../themes');
const baseUrlDomains = require('../domains');

module.exports = {
  privateDashboards: true,
  modules: {
    // other dashboard modules
    '@apostrophecms-pro/multisite-dashboard': {},
    site: {
      options: {
        themes,
        baseUrlDomains,
        localizedSites: {
          privateByDefault: true
        }
      }
    },
    'site-page': {},
  }
};

```

The `private` option will be editable from the dashboard when editing your site locales.
