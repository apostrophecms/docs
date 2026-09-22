---
prev: false
next: false
---
# ApostropheCMS Assembly Starter Kits

::: info
This page provides detailed information about a Pro module, accessible with an Apostrophe Pro subscription. If you haven't subscribed yet, explore our [Apostrophe Workspaces](https://app.apostrophecms.com/login) to discover the benefits of a subscription. For further details or inquiries, feel free to [contact us](https://apostrophecms.com/contact-us) or visit our [pricing page](https://apostrophecms.com/pricing).
:::

## Choosing your starter kit

There are two starter kits for Apostrophe Assembly. Both are working examples of a project built on the [`@apostrophecms-pro/multisite` module](https://apostrophecms.com/extensions/multisite-apostrophe-assembly), and they are deliberately close siblings: the same dashboard, the same hostname and theming model, the same widgets, and the same article-based content model. **What differs is how your customer-facing sites are rendered.**

| | **Astro kit**<br>[`astro-public-demo-multisite`](https://github.com/apostrophecms/astro-public-demo-multisite) | **JSX kit**<br>[`public-demo-multisite`](https://github.com/apostrophecms/public-demo-multisite) |
|---|---|---|
| Customer-facing rendering | Astro components, in a separate frontend project | [JSX templates](/guide/jsx-templates.md), rendered in-process by ApostropheCMS |
| Processes in development | Two: ApostropheCMS on port 3000, Astro on port 4321 | One, on port 3000 |
| Frontend asset build | Astro's own build | Apostrophe's `ui/src` build, via [Vite](/guide/vite.md) |
| Project layout | npm workspaces: `backend/` and `frontend/` | A single ApostropheCMS project at the root |

**If you have no strong reason to choose otherwise, start from [`astro-public-demo-multisite`](https://github.com/apostrophecms/astro-public-demo-multisite).** It gives your frontend developers a full Astro project, with the ecosystem and tooling that comes with it, and it is the architecture the rest of our documentation and tooling is built around.

Choose [`public-demo-multisite`](https://github.com/apostrophecms/public-demo-multisite) when you would rather keep everything in a single process and render on the server with JSX templates — fewer moving parts, and a shorter path for a team already comfortable inside ApostropheCMS.

This page refers to them by the short names above. Most of it applies to both kits; sections that apply to only one are marked.

::: info
Earlier versions of this page documented `starter-kit-assembly-essentials`. That repository has been archived and is no longer a starting point for Assembly projects. Its Nunjucks templates, palette configuration and sample Dockerfile are not carried forward by either kit above.
:::

## Purpose

Each starter kit serves as a quick start for multisite-enabled, cloud-hosted projects based on and hosted via Apostrophe Assembly. Each also serves as example code for creating your own custom modules and organizing your files in an ApostropheCMS project.

Both starter kits include:

* An example of project-level code for your customer-facing sites.
* An example of project-level code for the dashboard site that manages the rest.
* A working content model — articles with a paginated index and show pages — plus a set of [layout and marketing widgets](#provided-widgets-and-content).
* Best practices for easy hostname configuration in dev, staging and prod environments.
* Support for multiple themes.

## Requirements For Development On Your Computer

### Operating System

ApostropheCMS development works on Windows, macOS, and Linux. Windows developers can either work directly on Windows, using Git Bash as their terminal, or use the Windows Subsystem for Linux (WSL 2). See [Setting up your environment](/guide/development-setup.md) for the tradeoffs and setup steps for each.

Two things are worth knowing before developing an Assembly project on native Windows:

* **Both kits use bash for their build and deployment scripts** — `npm run build` in the JSX kit calls `bash -c`, and the Astro kit's `backend/deployment` scripts have a bash shebang. Git Bash satisfies this; PowerShell does not.
* **The hosts file you will edit below is at a different path on Windows**, and requires an administrator to change it. See [Hosts file configuration requirements](#hosts-file-configuration-requirements).

### Software Installation Requirements

To test-drive the project in development, make sure you have Apostrophe's usual dependencies on your local machine:

* MongoDB (6.0 or better, we recommend 8.0). See [Installing MongoDB locally](/guide/installing-mongodb-locally.md).
* Node.js 22 or later. We recommend the current Active LTS release (Node 24 at the time of writing). Node 18 and 20 have both reached end of life, and Node 22 is in maintenance until April 2027.

For more information see the Apostrophe [Getting Started Tutorial](/guide/development-setup.md).

## Getting started

**We recommend installing either project by cloning it locally and then pushing it to a repository in your own account. The Apostrophe CLI is not currently intended for multisite projects.**

Both kits require access to the private `@apostrophecms-pro` npm packages, so be sure you are logged in to an npm account that has been granted access before installing (`npm whoami` should print your username).

1) Clone the kit you chose into the directory where you want your project installed:

```sh
# Astro frontend
git clone https://github.com/apostrophecms/astro-public-demo-multisite.git your-new-project-name

# JSX templates, single process
git clone https://github.com/apostrophecms/public-demo-multisite.git your-new-project-name
```

2) In the root directory of your project, initialize version tracking with your preferred tool (GitHub, BitBucket, SourceForge, etc...) and create the base repo for your project.

3) Install dependencies:

```sh
cd your-new-project-name
npm install
```

In the Astro kit this is an npm workspaces project, so a single install at the root covers both the `backend` and `frontend` workspaces.

4) **In the Astro kit only**, deal with automatic translation before going any further.

::: warning
The Astro kit enables `@apostrophecms-pro/automatic-translation` with the DeepL provider, and **the backend will refuse to start — including for command line tasks — until that provider has a key.** Either export a real key:

```sh
export APOS_DEEPL_API_SECRET=your-deepl-api-secret
```

...or, if you don't intend to use automatic translation, remove the `@apostrophecms-pro/automatic-translation` and `@apostrophecms-pro/automatic-translation-deepl` entries from `backend/sites/index.js`.
:::

5) Add an admin user to the dashboard site, which manages all other sites. In the Astro kit, Apostrophe tasks run from the `backend` directory; in the JSX kit they run from the project root:

```sh
node app @apostrophecms/user:add admin admin --site=dashboard
```

Enter a password when prompted. The first startup also builds the admin UI, so expect this to take a minute or two.

> When running command line tasks in a multisite environment you must always specify which site you are referring to. For the dashboard, use `--site=dashboard`. For other sites, you can use any of their valid hostnames, or `--all-sites` which runs the task on every site except the dashboard.

## First Steps: required before project startup

::: info
The JSX kit is a single ApostropheCMS project, so `app.js`, `domains.js` and `themes.js` sit at the repository root. In the Astro kit the ApostropheCMS project is one workspace down, so the same files are `backend/app.js`, `backend/domains.js` and `backend/themes.js`.
:::

### Setting your shortname prefix

Before you do anything else, set the fallback value for the `shortNamePrefix` option in `app.js` to a unique string for your project, replacing the value the kit ships with. This should match your repo name followed by a `-` character. This should be distinct from any other Assembly projects you have, to ensure their MongoDB databases do not conflict in a dev environment.

> MongoDB Atlas note: if you are self-hosting and you plan to use a low-end MongoDB Atlas cluster (below M10), you must use a unique prefix less than 12 characters (before the `-`), even if your repo name is longer. This is not an issue with hosting provided by the Apostrophe Assembly team.

### Configuring your domains

After cloning this project, be sure to edit the `domains.js` file and update the list to match your actual project's domains, typically for development, staging, and production. The `@apostrophecms-pro/multisite-dashboard` extension's `site` module requires an object with URL strings for the `baseUrlDomains` option, and this file provides those values. While `dev`, `staging`, and `prod` are common domain names, you can use other names, but the first one defined in the object will be considered the development environment.

If you are doing local development on your own computer, leave the development domain pointed at your local machine. In the JSX kit that value is `localhost:3000`, the port ApostropheCMS listens on. **In the Astro kit it is `localhost:4321`, the port Astro listens on** — your browser always talks to Astro, which talks to ApostropheCMS on port 3000 behind the scenes. For staging and production, the Apostrophe Assembly team will typically preconfigure this for you and you won't need to worry about DNS or certificates.

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

> **Note:** Your configuration won't be applied immediately on the existing sites. You need to update ("touch") your site records in order to apply the changes. You can do that for all existing sites via the CLI command `node app site:touch --site=dashboard`.

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

Locate `disabledFileKey` and replace the value the kit ships with, using a random string of your choosing. This is used when disabling access to files in the local backend.

* **JSX kit:** the `@apostrophecms/uploadfs` options in `sites/index.js`.
* **Astro kit:** `backend/dashboard/modules/@apostrophecms/uploadfs/index.js`.

### Session Secret

Locate the session `secret` and replace it with a random string of your choosing. This is used for login session encryption. Set one everywhere it appears — the top-level configuration, the sites and the dashboard each have their own.

* **JSX kit:** the `sessionSecret` option in `app.js`, plus the `@apostrophecms/express` session options in `sites/index.js`.
* **Astro kit:** the `sessionSecret` option in `backend/app.js`, plus the `session.secret` option in `backend/sites/modules/@apostrophecms/express/index.js` and `backend/dashboard/modules/@apostrophecms/express/index.js`.

### Hosts File Configuration Requirements

Because this project serves multiple websites, certain hostnames must point directly to your own computer for local testing.

**If you will only be testing in Chrome at first,** you do not have to edit your hosts file right away. That's because in Chrome, all subdomains of `localhost` resolve to your own computer.

In other browsers this is not true, and you must add the following line to your hosts file before proceeding:

```
127.0.0.1 dashboard.localhost company1.localhost
```

Your hosts file is in a different place on each platform:

* **macOS and Linux:** `/etc/hosts`. You will need `sudo` to save changes.
* **Windows:** `C:\Windows\System32\drivers\etc\hosts`. Open your editor as an administrator first, or the file will appear read-only.

These entries are hostnames only, so they are the same for both starter kits regardless of which port you browse.

**You will need a subdomain for each test site you plan to add to the multisite platform.** See the example below, where a site called `company` is added to the platform via the dashboard. You can always add more of these entries later.

## Starting Up In Development

Once you have followed the steps above you are ready to start your project up in development mode. How you start it, and which port you browse, depends on your starter kit.

### Starting the JSX kit

This kit runs a single process. Type:

```sh
npm run dev
```

When ready, visit:

```
http://dashboard.localhost:3000/login
```

### Starting the Astro kit

This kit runs two processes: the ApostropheCMS backend on port 3000 and the Astro frontend on port 4321. Start each in its own terminal, from the project root:

```sh
# Terminal 1 — the ApostropheCMS backend
npm run dev-backend

# Terminal 2 — the Astro frontend
npm run dev-frontend
```

Both scripts set `APOS_EXTERNAL_FRONT_KEY=dev` for you, which is the shared secret Astro uses to authenticate to the backend. If you run the two halves by hand instead, you must set the same value in both.

The backend builds the admin UI for each theme on first startup, which takes a minute or two. Wait for `Proxy listening on port 3000` before browsing.

**You browse port 4321, never port 3000.** Astro serves every request and proxies the login page, the media uploads, the REST API, and the admin UI assets through to ApostropheCMS. When ready, visit:

```
http://dashboard.localhost:4321/login
```

### Creating your first sites

> In Chrome this works with no extra configuration, since every subdomain of `localhost` resolves to your own computer. In other browsers, add each site's hostname to your hosts file as described in [Hosts file configuration requirements](#hosts-file-configuration-requirements). You'll do this for each site you test locally.

You can now log into the admin account and view the basic dashboard.

To create a site, access "Sites" on the admin bar and add a new site. Notice that sites are Apostrophe "pieces" in the dashboard.

Be sure to give your first site a "shortname" which is distinct from other sites, like `company1`. Also fill out the admin password field for the site.

After you successfully save the site, you can access it at its own subdomain — on port 3000 for the JSX kit, or port 4321 for the Astro kit:

```
http://company1.localhost:3000/login
```

And log in with the admin account you created for the site. Then make some simple edits to the homepage.

Now try creating `company2` and `company3`. Notice that while the code is the same, the databases and content are separate.

> If you access these sites while logged out, you won't see your content edits unless you have used the "Commit" button to make them live.

## Scheduling tasks with ApostropheCMS Assembly hosting

### Using a crontab file

**This is the recommended way to schedule tasks.** Add a file named `crontab` to the root of your project repository, and ApostropheCMS hosting reads it automatically. It uses ordinary cron syntax, and it works for single-site ApostropheCMS projects as well as for Assembly. As with any crontab, entries run in your server's timezone.

The current working directory is the root of your repository, so each entry invokes your application exactly as you would from a terminal there. In the Astro kit, where the ApostropheCMS project lives in the `backend` workspace:

```
0 0 * * * node backend/app.js @apostrophecms/scheduled-publishing:update
```

In the JSX kit, where the project sits at the repository root:

```
0 0 * * * node app.js @apostrophecms/scheduled-publishing:update
```

Because each entry is an ordinary command line invocation, the usual multisite rule applies: say which site the task is for with `--site=`, or use `--all-sites` to run it for every site except the dashboard.

```
0 * * * * node app.js products:sync --all-sites
0 3 * * * node app.js some-module:some-task --site=dashboard
```

If you are self-hosting, put the equivalent entries in your server's own crontab instead.

### The `tasks` option

The `tasks` option predates the crontab file and is still supported. It was designed for environments running several workers, using locks so that a scheduled task runs only once across the cluster. In practice a single worker per environment has been the norm, so the crontab file above is both simpler and more flexible — it can express any schedule, rather than only hourly and daily.

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

> If you are not already familiar with single-site Apostrophe development, start with [Code organization with modules](/guide/modules.md), which covers how a module is structured, configured, and inherited — the concepts the rest of this section assumes.

In a typical single-site Apostrophe project, modules are configured in `app.js`. In a multisite project, you'll find that `app.js` is instead reserved for top-level configuration that applies to all sites.

The code you're used to seeing in `app.js` can instead be found in `sites/index.js`. And, the code you're used to seeing in `modules` can be found in `sites/modules`.

In all other respects, development is just like normal ApostropheCMS single-site development. Feel free to add page templates and modules. You can `npm install` modules like `@apostrophecms/blog` and configure them in a normal way; just do it in `sites/index.js` rather than `app.js`.

If you have already started a single-site project, you can move your modules directly from `modules` to `sites/modules`, and move the `modules` section of your `app.js` file to the corresponding section of `sites/index.js`. However, take note of the existing settings we provide and merge accordingly.

> **If you are hosting your project with us, or using tools provided by us, you should remove any legacy app.js or module code that configures UploadFS cloud storage or mongodb database hosts.** Such settings are handled automatically and the configuration is set behind the scenes by `@apostrophecms-pro/multisite` and the provided logic in the starter kit.

In the JSX kit, that project sits at the repository root:

```
├── app.js               # Top-level multisite configuration
├── domains.js           # Per-environment base domains
├── themes.js            # The list of available themes
├── sites/               # Code for the customer-facing sites
│   ├── index.js         # What `app.js` holds in a single-site project
│   ├── lib/             # Shared helpers and per-theme config
│   ├── modules/         # Page types, piece types, and widgets
│   └── views/           # Shared JSX templates, including the layout
└── dashboard/           # Code for the dashboard site
    ├── index.js
    └── modules/
```

In the Astro kit, that same ApostropheCMS project lives in the `backend` workspace, and the Astro application that renders your customer-facing sites lives alongside it in `frontend`:

```
├── backend/                 # The ApostropheCMS multisite project, as above
│   ├── app.js
│   ├── domains.js
│   ├── themes.js
│   ├── sites/
│   └── dashboard/
└── frontend/                # The Astro application
    └── src/
        ├── pages/           # A single [...slug].astro catch-all route
        ├── templates/       # One component per page type, plus index.js
        ├── widgets/         # One component per widget, plus index.js
        └── components/      # Reusable pieces such as the header and footer
```

Both kits are written as ES modules, using `import` and `export default` rather than `require` and `module.exports`.

### Rendering With JSX Templates

*This section applies to the JSX kit.*

Your customer-facing sites are rendered by ApostropheCMS itself, using [JSX templates](/guide/jsx-templates.md). Every page and widget template in `sites/` is a `.jsx` file — `sites/views/layout.jsx` for the shared layout, `sites/modules/hero-widget/views/widget.jsx` for a widget, `sites/modules/article-page/views/index.jsx` and `show.jsx` for the article index and show pages.

JSX here is a server-side rendering option, not a front-end framework: there is no virtual DOM, no client runtime, and no React dependency. It is an alternate JavaScript syntax for markup, evaluated on the server in the same place Nunjucks would have run, which buys you real JavaScript control flow, editor support, and accurate error reporting with source maps. The [JSX templates guide](/guide/jsx-templates.md) covers the Apostrophe-specific equivalents of the Nunjucks features you may know.

The dashboard site is the exception: its views are still Nunjucks (`dashboard/views/layout.html`). This is by design — the dashboard is an internal admin tool, and you rarely need to touch its markup.

Frontend assets follow the standard ApostropheCMS pattern, built by [Vite](/guide/vite.md). Place modern JavaScript in the `ui/src/index.js` file of any module, and Sass SCSS in `ui/src/index.scss`, using `import` statements to pull in more of each. As noted in our documentation, it is **important for `ui/src/index.js` to export a function as its default export.** This function will be invoked to initialize your module at a safe time when `apos.http`, `apos.util`, etc. are already available. This kit keeps its project-wide styles together in the `asset` module, at `sites/modules/asset/ui/src/`.

### Rendering With Astro

*This section applies to the Astro kit.*

ApostropheCMS still owns every content schema, widget definition, page type, and the editing UI. Astro owns the markup. The `@apostrophecms/apostrophe-astro` bridge package connects the two, and preserves in-context editing, so your editors still click directly on the page to make changes.

The division of labor means adding a widget is a two-sided job:

1. Create the widget module under `backend/sites/modules/`, and turn it on in `backend/sites/index.js`.
2. Create the matching component in `frontend/src/widgets/`, and register it in `frontend/src/widgets/index.js`.

Page types work the same way, using `frontend/src/templates/` and its `index.js`.

**The registry keys must match the names ApostropheCMS stores in the database, not the module folder names.** Apostrophe strips the `-widget` suffix, so the `hero-widget` module is registered under the key `hero`, and core widgets keep their scope — `@apostrophecms/rich-text`, not `rich-text`. A missing or misspelled key doesn't crash anything; the widget simply renders as nothing, with an error logged on the server.

Because the multisite module routes requests by hostname, and Astro passes the incoming `Host` header through to the backend, a single Astro process serves every site on your platform. There is nothing per-site to configure on the frontend.

For a fuller treatment of these patterns — `aposPageFetch`, `AposArea`, link resolution, and image rendering — see the [Astro demo architecture guide](/guide/astro-demo-overview.md) and the [ApostropheCMS and Astro tutorial](/tutorials/astro/apostrophecms-and-astro.md).

### Themes

Apostrophe Assembly and the multisite module are designed to accommodate hundreds of websites, or more, running on a single codebase. But, you may need some differences in appearance and behavior between sites. For that you can create multiple themes. Each site is set via the dashboard UI to use a single theme and will typically stay with that theme throughout its lifetime.

Each kit ships with exactly one theme to build on — `default` in the JSX kit, `demo` in the Astro kit. You might not need more than one. If that's the case, just build that theme out to suit your needs.

#### Adding a New Theme

To configure your list of themes, edit `themes.js`. Right now it looks like:

```javascript
export default [
  {
    value: 'default',
    label: 'Default'
  }
];
```

You can add additional themes as needed. Your `value` should be a shortname like `default` or `arts`. The `value` must not be changed later.

#### Custom Module Configuration for Themes

For a theme named `default`, you must have a `sites/lib/theme-default.js` file, like this:

```javascript
export default function(site, config) {
  config.modules = {
    ...config.modules,
    'theme-default': {}
  };
};
```

The `config` object already contains what was configured in `sites/index.js`. Here we can modify the configuration by adding extra modules only for this theme, or changing the configuration of a module specifically for this theme. Any module you enable this way — such as the `theme-default` module above — needs a corresponding directory in `sites/modules`.

**What a theme controls depends on your kit.** In the JSX kit, a theme module is a natural home for that theme's own SCSS and JavaScript entry points, so themes can be the unit of visual difference. In the Astro kit the frontend is Astro, and the theme module is an intentionally empty starting point; a theme there is still the right hook for changing *backend* configuration per site, but visual variation belongs in your Astro components. The theme name is not sent to the Astro frontend automatically; expose it with the [`templateData` module option](/reference/module-api/module-options.md#templatedata) so that it arrives alongside the rest of your page data, then branch on it in your components.

Note that Apostrophe builds one asset bundle per theme. This is why you **must not decide to completely enable or disable a module that pushes assets on any basis other than the theme name.**

### Serving Static Files: Fonts and Static Images

If you need to serve static files, you can do this much as you would in standalone ApostropheCMS development.

The folder `sites/public` maps to `/` in the URL space of a site. For instance, `sites/public/fonts/myfile.ttf` maps to `/fonts/myfile.ttf`. In the Astro kit, static files for the frontend can also be served from Astro's own `frontend/public` directory.

## Provided widgets and content

Both kits ship the same content model and the same widget set, so this section applies to either one. In the JSX kit each widget is a module under `sites/modules`; in the Astro kit each widget is a module under `backend/sites/modules` paired with a component in `frontend/src/widgets`.

**Content types:**

* `article` — a piece type extending `@apostrophecms/blog`.
* `article-category` — a piece type for categorizing articles.
* `article-page` — a paginated index of articles, with "show pages" for individual articles.
* `default-page` — a page type for ordinary pages.

**Widgets**, supplementing the core rich text, image, video and file widgets:

* `layout-widget` and `layout-column-widget` — structured page composition.
* `hero-widget` — a hero element with image or color background, text and links. Demonstrates using `relationship` schema fields to add an image or video for the background.
* `card-widget` — a card with optional image and text, which can be made directly clickable or have links and buttons added.
* `price-card-widget` — a pricing card.
* `button-widget` — a button or inline link.
* `article-widget` — teases an article on any page.
* `github-prs-widget` — lists pull requests from GitHub, demonstrating how a widget can call an external API.

Several of these reuse the shared schema helpers in `sites/lib`, particularly `link.js` for link fields and `area.js` for area configuration. These serve as a model for implementing reusable parts of widgets in your own project.

If you look at the `sites/index.js` file you won't see every widget module listed individually in the `modules` object. Instead, the `nestedModuleSubdirs` property is set to `true`, which causes Apostrophe to register all the modules listed in the `modules.js` file of any subfolder in the project-level `sites/modules` folder. You can use this to organize custom modules, such as grouping all of your piece types, to keep your `modules` folder and the `index.js` file less cluttered.

## Dashboard Development

**The dashboard site has one job: managing the other sites.** As such you don't need to worry about making this site a pretty experience for the general public, because they won't have access to it. However you may want to dress up this experience and add extra functionality for your own customer admin team (the people who add and remove sites from the platform).

Both kits have the `@apostrophecms-pro/multisite-dashboard` extension installed. This presents sites as a scrollable list rather than individual cards. Each site has a link for login to the site, as well as navigation to the home page. This extension also creates a search box that makes finding sites easier. Finally, this extension adds a template tab to the site creation modal. When creating or editing a site you can select to make it a template by clicking on "Template" control in the "Basics" tab. This will still be an active site, but it will be moved to the template tab. Sites in the template tab can be duplicated by selecting that option in the context menu to the far right.

The dashboard site can be extended much like the regular sites. Dashboard development is very similar to regular site development, except that modules live in `dashboard/modules`, what normally resides in `app.js` lives in `dashboard/index.js`, and so on.

The most important module is the `site` module. The `site` module is a piece type, with a piece to represent each site that your dashboard admins choose to create. This module is registered through the `@apostrophecms-pro/multisite-dashboard` extension and can be extended at the project level by creating a `dashboard/modules/@apostrophecms-pro/site` folder and placing your code there. This is the [standard method](/guide/module-configuration-patterns.md) for extending any package at project level.

The `site` schema field values get passed to the individual sites in the `site` object. This is what is used to set the theme configuration in the `sites/index.js` file. The starter kits also add the value of the `theme` schema field to the `apos.options` object.

```javascript
// sites/index.js
export default async function (site) {
  const config = {
    // Theme name is globally available as apos.options.theme
    theme: site.theme,
    ...
```

If you have additional values being passed from the `site` piece schema that you want to make available to your modules you have several choices. The value can be added in the modules config options in the `sites/index.js` file.

```javascript
// sites/index.js
export default async function (site) {
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

You can also elect to add them to the `apos.options` object, as is shown in the example above for `site.theme`. This can then be accessed in any module function with access to `self` using `self.apos.options.<property>`. If you need that value in your templates you can use the [`templateData` module option](/reference/module-api/module-options.md#templatedata).

### Allowing dashboard admins to pass configuration to sites

You can add custom schema fields to `sites` and those fields are available on the `site` object passed to `sites/index.js`, and so they can be passed on as part of the configuration of modules.

However, there is one important restriction: you **must not decide to completely enable or disable a module that pushes assets on any basis other than the theme name.** This is because Apostrophe builds only one asset bundle per theme.

**"Should I add a field to the `site` piece in the dashboard, or just add it to `@apostrophecms/global` for sites?"** Good question! Here's a checklist for you:

* **If single-site admins who cannot edit the dashboard should be able to edit it,** you should put it in `sites/modules/@apostrophecms/global`.
* **If only dashboard admins who create and remove sites should be able to make this decision,** it belongs in `dashboard/modules/site/index.js`. You can then pass it on as module configuration in `sites/index.js`.

## Accessing the MongoDB utilities for a specific site

The database name for a site is the prefix, followed by the `_id` of the site piece. However this is awkward to look up on your own, so we have provided utility tasks to access the MongoDB utilities. Run these — and every other `node app` task — from the project root in the JSX kit, or from the `backend` directory in the Astro kit:

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

Apostrophe will complete asset builds for each theme, as well as running any necessary new database migrations for each site, before switching to the newly deployed version of the code. Both kits provide the scripts this relies on: a build that runs `@apostrophecms/asset:build` once per theme, and a migration step that runs `@apostrophecms/migration:migrate` for the dashboard and for all sites.

In the Astro kit, the Astro frontend is deployed alongside the backend and must be able to reach it. Set `APOS_EXTERNAL_FRONT_KEY` to the same value for both halves — a real secret, not the `dev` value used locally — and be sure the frontend passes the incoming `Host` header through, since that is how the multisite module knows which site a request is for. If you are hosting with us, the Assembly team configures this for you.

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
import themes from '../themes.js';
import baseUrlDomains from '../domains.js';

export default {
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
