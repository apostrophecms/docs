# How to update Apostrophe CMS documentation


This project contains [the documentation site](https://apostrophecms.com/docs)
for [ApostropheCMS](https://apostrophecms.com).

You don't need to read this page to read the documentation! This page
is about *contributing to* the documentation.

## Building the docs

### 1. Setup

Clone the repo.

```bash
$ git clone https://github.com/apostrophecms/docs.git
$ cd docs
```

Next, install the dependencies for the main Vitepress documentation build.

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
followed by
```
npm run preview
```
Note that the build version is *less* tolerant of errors in your markdown files, so it is important to do this step before deployment.

`package.json` pins `rollup` to `4.52.4` via `overrides`. Rollup `>=4.53` has a parser
regression ([rollup/rollup#6176](https://github.com/rollup/rollup/issues/6176)) that panics on
`swagger-ui-dist`'s prebuilt ES bundle (used by the API Explorer) during `vitepress build`. If
you see a build fail with `called 'Option::unwrap()' on a 'None' value` mentioning
`swagger-ui-dist`, delete `node_modules` and `package-lock.json` and run `npm install` again to
pick up the pin. Remove the override once Rollup ships a fix and this repo's `vitepress`/`vite`
versions are updated past it.

For deployment (requires credentials of course), you can select to deploy to staging, production, or both. For deployment to staging only, for example, you would use

```
npm run deploy-staging
```
For deployment to production only (unusual):

```
npm run deploy-production
```

For deployment to both, 

```
npm run deploy-all
```

`npm run build` (and therefore each `npm run deploy-*` variant) also builds the site's
Pagefind search index as a final step. See [SEARCH.md](./SEARCH.md) for how search — including
the merged search across this site and apostrophecms.com — works and how to test it locally.

### 2. Editing content

See the `docs` subdirectory for Markdown files.

Images should be added to `images/assets` and embedded with relative paths, like this:

```
![](../../../images/assets/user-menu.png)
```

**If you add a new top level page,** you will need to edit `docs/.vitepress/config.js`.  Otherwise it will not appear in the navigation.

### 3. Linking to other pages

When creating links in the body of a documentation page that point to another
page of documentation, either make sure the link is relative and pointing to the
`.md` extension OR use the file path starting starting after the `docs`
directory. So you would link to `docs/devops/email.md` with
`[link text](/devops/email.md)`.

### 4. Submit for review

First, make sure you've built and reviewed your documentation locally using build and preview (`npm run build && npm run preview`) and
confirmed that your links work properly. Submit your changes as a pull request
on the [docs](https://github.com/apostrophecms/docs/)
repository. Please include as much context for the change as is reasonable in
the PR description.
