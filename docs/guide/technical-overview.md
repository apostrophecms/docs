---
prev:
  text: '🌟 Introduction'
  link: 'guide/introduction'
next:
  text: '🚀 Getting Started'
  link: ' guide/setting-up.md'
---

# Technical overview

## The core tech

In brief, the main technologies behind Apostrophe are:

- [Node.js](https://nodejs.org): **Popular server-side JavaScript runtime.** We originally chose Node.js to achieve a fully-JavaScript development experience for developers. It has continued to improve over time, delivering high performance and powerful features we can use.
- [Express](https://npmjs.org/package/express): **Un-opinionated Node.js web framework.** Express is the most widely used web framework for Node.js. Because it is simple, un-opinionated, and well-known, it was straightforward to extend it to suit Apostrophe's needs.
- [MongoDB](https://www.mongodb.com): **Secure, document-based database engine.** We chose MongoDB for its fluent JavaScript-based API, its safety from "SQL injection"—style attacks, its developer-friendliness, and its support for documents with varying schemas in the same collection.
- [Nunjucks](https://mozilla.github.io/nunjucks/): **Richly featured template language for JavaScript.** Nunjucks provides tons of features, extensibility, and a syntax nearly identical to Twig, Jinja, and other Django-inspired templating languages.

## Directory structure

There are a few directories and top-level files that are especially important in Apostrophe projects. Here is a rough overview of these files and folders you will see in the official boilerplate.

| Folder/File | What is it? |
| ------ | ------ |
| `app.js` | The heart of the application. This is where you tell Apostrophe what modules are in your project and set a few top-level parameters. |
| `/modules` | All project-level [modules](/reference/glossary.md#module) and configuration for installed modules. |
| `/public` | Public, static files (not managed through the CMS). Apostrophe will generate specific directories inside, but you can also use it as needed.  |
| `/views` | Template files that do not belong to any one module. Apostrophe looks for site wrapper templates here, including `layout.html`. |

::: tip
Core module configuration is all done in a subdirectory of `modules`: `modules/@apostrophecms`. This keeps core modules organized together and out of the way, following [the npm scoping pattern](https://docs.npmjs.com/about-scopes).
:::
