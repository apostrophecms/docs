---
prev: false
next: false
---
# Apostrophe Essentials Starter Kit

## Requirements For Development On Your Computer

### Operating System

ApostropheCMS development works on Windows, macOS, and Linux. Windows users can develop natively using Git Bash, though Microsoft recommends WSL for Node.js development. See the [Development Setup guide](/guide/development-setup.md) for details on both Windows approaches.

### Software Installation Requirements

To test-drive the project in development, make sure you have Apostrophe's usual dependencies on your local machine:

* MongoDB 8.0+, SQLite, or PostgreSQL 14+ (see [Using SQLite or PostgreSQL](/guide/using-sqlite-and-postgres.html))
* NodeJS 22+

For more information see the Apostrophe [Getting Started Tutorial](/guide/development-setup.md).
## Getting started

This Starter Kit, also known as a boilerplate project, serves as a template for initiating new projects and can be installed in two main ways:

1. **Using `npm create apostrophe@latest`**: Run the interactive installer, which clones this template, installs dependencies, wires up your database, and creates an admin user:

   ```bash
   npm create apostrophe@latest
   ```

   Select **Essentials** when prompted to choose a starter kit. The installer supports MongoDB, SQLite, and PostgreSQL — choose whichever suits your setup, and it will prompt you for a connection string. MongoDB and PostgreSQL require a running server or hosted solution (such as MongoDB Atlas or a managed PostgreSQL service) to be reachable when the installer runs. SQLite requires no server. See [Using SQLite or PostgreSQL](/guide/using-sqlite-and-postgres.html) if you want a non-MongoDB backend.

   If you have the `@apostrophecms/cli` installed globally, `apos create <my-project-name>` also works and delegates to the same installer.

2. **Manual Setup**: Manually `git clone` this repository and install its dependencies using `npm install`. Then add an initial admin user with `node app @apostrophecms/user:add admin admin`. Set the `APOS_DB_URI` environment variable to point at your database before running the app:

   ```sh
   export APOS_DB_URI="mongodb+srv://username:pa%24%24word@mycluster.1234x.mongodb.net/YOUR-PROJECT-NAME?retryWrites=true&w=majority"
   ```

**Note: This template is NOT designed to be installed into an existing project.**

## Running the project

Run `npm run dev` to build the Apostrophe UI and start the site up. Remember, this is during alpha development, so we're all in "dev mode." The `dev` script will watch for saves in client-side CSS and JavaScript and trigger a build and page refresh if they are detected. It will also restart the app when server-side code is saved.

## Making it your own

This boilerplate is designed so you can install and start running it right away. If you are starting a project that will go into production one day, there are a few things you should be sure to check:

- [ ] **Update the shortname.** You don't need to perform this step if you created your project using the CLI tool. The `shortname` option in `app.js` is used for the database name (unless another is given in the `@apostrophecms/db` module). You should change this to an appropriate project name before you start adding any users or content you would like to keep.
- [ ] **Update the Express.js session secret.** The secret is set to `undefined` initially in the `modules/@apostrophecms/express/index.js` file. You should update this to a unique string.
- [ ] **Decide if you want hot reloading on.** This boilerplate uses nodemon to restart the app when files are changed. In `modules/@apostrophecms/asset/index.js` there is an option enabled to refresh the browser on restart. If you like this, do nothing. If you don't, remove the option or set it to `false`. The option has no effect when the app is in production.
- [ ] **Update the `className` options in `app.js`.** This option is set for core widget types to provide CSS styling hooks. It is namespaced with `bp-` for "boilerplate." You will likely want to update that to match your general CSS class naming practices.

## You really want the docs

Right now, [all the juicy info is in the ApostropheCMS docs](https://apostrophecms.com/docs), so head over there and start reading! This boilerplate project is a fun introduction to the UI, but you'll want to know more to really try it out.