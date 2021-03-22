# Getting started

## System requirements

| Software | Minimum Version |
| ------------- | ------------- |
| [Node.js](https://nodejs.org/en/) | 12.x+ |
| [MongoDB](https://docs.mongodb.com/manual/administration/install-community/)  | 3.6+ |
| [ImageMagick](https://imagemagick.org/script/download.php#macosx) (optional) | Any |

See the links above to install each. To check that these are installed in your environment, try the following commands:

```bash
node -v && npm -v
# This will display your Node.js version and npm version (installed with Node),
# if installed.
mongod --version
# This will display your MongoDB version, if installed.
which convert && which identify
# This will display the location of the ImageMagick utilities, if installed.
```

::: tip NOTE
ImageMagick is optional, but recommended. It provides the `convert` and `identify` command line tools, which Apostrophe uses to scale and crop images quickly. If you do not install it Apostrophe can still handle image uploads, though more slowly, using [Jimp](https://www.npmjs.com/package/jimp).
:::

<!-- ## TODO: The Apostrophe CLI tool -->

## Creating a project

<!-- TODO: Update with CLI info when ready. -->
The easiest way to get started with Apostrophe is to use the starter boilerplate project. On the command line, clone the boilerplate:

```bash
git clone https://github.com/apostrophecms/a3-boilerplate apos-app
```

If you want to change the project directory name, please do so. We will continue referring to `apos-app`.

::: tip NOTE
There is a CLI tool for Apostrophe 2 with commands to create projects, among other tasks. That will support Apostrophe 3 closer to the 3.0 stable release.
:::

Open the project directory in your code editor. We'll want to change one line before starting up so the database is created correctly. In the `app.js` file, find the `shortname` setting and change it to match your project (only letters, digits, hyphens and/or underscores). By default, this will be the name of your database:

```javascript
// app.js
const path = require('path');

require('apostrophe')({
  shortName: 'apos-app', // 👈
  modules: {
  // ...
```

Excellent. Back in your terminal we'll install dependencies:

```bash
npm install
# Or `yarn install`, if you prefer. We'll stick to npm commands.
```

Before starting up you'll need to create an admin-level user so that you can to log in. After running the following command, Apostrophe will ask you to enter a password for this user.

```bash
node app @apostrophecms/user:add my-user
# Replace `my-user` with the name you want for your first user.
```

Start the site with `node app.js` and your site should be running at [http://localhost:3000](http://localhost:3000). You can log in with the username and password you created at [http://localhost:3000/login](http://localhost:3000/login)

::: tip
If you are doing active development on the project, you can also start the site with `npm run dev`. The app will then watch for changes, then restart the app and refresh the browser when it detects any.
:::
