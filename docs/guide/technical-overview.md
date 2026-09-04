# Technical overview

<iframe src="https://www.youtube.com/embed/DoOSBfOy6NY?si=ZziVXYUqaSyEVZn2" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## The core tech

In brief, the main technologies behind Apostrophe are:

- [Node.js](https://nodejs.org): **Popular server-side JavaScript runtime.** We originally chose Node.js to achieve a fully-JavaScript development experience for developers. It has continued to improve over time, delivering high performance and powerful features we can use.
- [Express](https://npmjs.org/package/express): **Un-opinionated Node.js web framework.** Express is the most widely used web framework for Node.js. Because it is simple, un-opinionated, and well-known, it was straightforward to extend it to suit Apostrophe's needs.
- [MongoDB](https://www.mongodb.com): **Recommended database engine for sites that need to scale.** MongoDB offers a fluent JavaScript-based API and mature clustering and managed-hosting options for high-traffic deployments. [PostgreSQL](https://www.postgresql.org) and [SQLite](https://www.sqlite.org) are also fully supported — PostgreSQL is a solid choice when you already prefer it or want a 100% open-source database at scale, and SQLite is great for evaluating Apostrophe or running smaller sites with zero setup. See [Choosing a Database](/guide/choosing-a-database.md) for more detail.
- [Nunjucks](https://mozilla.github.io/nunjucks/): **Richly featured template language for JavaScript.** Nunjucks provides tons of features, extensibility, and a syntax nearly identical to Twig, Jinja, and other Django-inspired templating languages.

## Directory structure

There are a few directories and top-level files that are especially important in Apostrophe projects. Here is a rough overview of these files and folders you will see in the official boilerplate, starter-kit-essentials.

| Folder/File | What is it? |
| ------ | ------ |
| `app.js` | The heart of the application. This is where you tell Apostrophe what modules are in your project and set a few top-level parameters. |
| `/modules` | All project-level [modules](/reference/glossary.md#module) and configuration for installed modules. |
| `/public` | Public, static files (not managed through the CMS). Apostrophe will generate specific directories inside, but you can also use it as needed.  |
| `/views` | Template files that do not belong to any one module. Apostrophe looks for site wrapper templates here, including `layout.html`. |

::: tip
Core module configuration is all done in a subdirectory of `modules`: `modules/@apostrophecms`. This keeps core modules organized together and out of the way, following [the npm scoping pattern](https://docs.npmjs.com/about-scopes).
:::
