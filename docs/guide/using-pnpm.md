# Using pnpm

`pnpm` and `npm` are both package managers for JavaScript projects, but they have different approaches to managing dependencies. Node comes pre-packaged with `npm`, but `pnpm` presents a number of advantages such as better security, and monorepo support.

::: warning
The Apostrophe core is compatible with v7 and v8 of `pnpm`. However, if your project has custom extensions or testing that is not pnpm-compatible, for example, an extension that takes advantage of `npm` hoisting of core dependencies for functionality, your project will not build correctly. You should test this carefully before converting your project.
:::

When creating a project from scratch, Apostrophe will attempt to automatically detect the use of `pnpm` by examining your project root directory for a `pnpm-lock.yaml` file. Some monorepo tools will interfere with automatic detection. You can force the use of `pnpm` by setting an option of `pnpm: 'true'` in your `app.js` file. 

When using the Apostrophe CLI tool to create a new project `npm` will be used by default to install your dependencies. This means that if you create a project using the CLI you will need to convert it to utilize `pnpm`.

This is as simple as deleting the `node_modules` folder and the `package-lock.json` files. Additionally, you want to change the `release` script of your `package.json` file to use `pnpm` instead of `npm`.

Finally, to install your packages run `pnpm install`. Using version 8 this will install any non-optional peer dependencies by default. For version 7 of `pnpm`, you need to either turn this on by passing the configuration in using `pnpm install --config.auto-install-peers=true`, or by setting it using `pnpm set auto-install-peers=true --global`. Using global will force this configuration on all projects built locally and you can leave this off. You can see other options in the [pnpm documentation](https://pnpm.io/).

Lastly, to spin your project up locally for development use `pnpm run dev` as you would with `npm`.
