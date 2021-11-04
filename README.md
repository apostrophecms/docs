# How to update Apostrophe CMS documentation
========================

This project contains [the documentation site](https://docs.apostrophecms.com)
for [ApostropheCMS](https://apostrophecms.com).

You don't need to read this page to read the documentation! [Read the
actual documentation here.](https://docs.apostrophecms.com) This page
is about *contributing to* the documentation.

## Building the docs

### 1. Setup

Clone the repo.

```bash
$ git clone https://github.com/apostrophecms/a3-docs.git
$ cd a3-docs
```

Next, install the dependencies for the main Vuepress documentation build.

```
npm install
```

Now you can build the docs with:

```
npm run dev
```

For testing, or

```
npm run build
```

Before deployment with the `deploy` script (requires credentials of course).

### 2. Editing content

See the `docs` subdirectory for Markdown files.

Images should be added to `images/assets` and embedded with relative paths, like this:

```
![](../../../images/assets/user-menu.png)
```

**If you add a new top level page,** you will need to edit `docs/.vuepress/config.js`. **If you add a new deeper page,** you will need to edit `docs/.vuepress/sidebar.json`.  Otherwise it will not appear in the navigation.

### 3. Linking to other pages

When creating links in the body of a documentation page that point to another
page of documentation, either make sure the link is relative and pointing to the
`.md` extension OR use the file path starting starting after the `docs`
directory. So you would link to `docs/devops/email.md` with
`[link text](/devops/email.md)`.

### 4. Submit for review

First, make sure you've built and reviewed your documentation locally (`npm run dev`) and
confirmed that your links work properly. Submit your changes as a pull request
on the [a3-docs](https://github.com/apostrophecms/a3-docs/)
repository. Please include as much context for the change as is reasonable in
the PR description.

## Notes about using the Apostrophe Vuepress theme
This site uses [`vuepress-theme-apostrophe`](https://github.com/apostrophecms/vuepress-theme-apostrophe), which imports *stylesheets, components, and plugins (and their configurations)*. Other modifications, like enhancements to the markdown parser, must be present at project level across all vuepress sites that need them.

Use this space to make other notes particular to the theme's shared resources