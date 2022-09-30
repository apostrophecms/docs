# Setting up

This article covers the first steps to get started. MacOS and Linux users can dive right in. If you have Windows, please follow our [Windows development](../cookbook/windows-development.md) cookbook article first.

## System requirements

| Software | Minimum Version |
| ------------- | ------------- |
| [Node.js](https://nodejs.org/en/) | 14.x+ |
| [MongoDB](https://docs.mongodb.com/manual/administration/install-community/)  | 4.2+ |

See the links above to install each. To check that these are installed in your environment, try the following commands:

```bash
node -v && npm -v
# This will display your Node.js version and npm version (installed with Node),
# if installed.
mongod --version
# This will display your MongoDB version, if installed.
```

::: tip NOTE
[ImageMagick](https://imagemagick.org/script/download.php) can be used if your system doesn't support the default npm [`sharp` package](https://www.npmjs.com/package/sharp). It provides the `convert` and `identify` command line tools, which Apostrophe uses to scale and crop images quickly. If your project does not contain `sharp` and ImageMagick is installed, apostrophe will fall-back automatically.
:::

## The Apostrophe CLI tool

There is [an official CLI](https://www.npmjs.com/package/@apostrophecms/cli) (Command Line Interface) for quickly setting up starter code for your Apostrophe project. Once in a project it can also help add new module code with a single command so you can focus on the unique parts rather than copying or remembering boilerplate. Keep an eye out for updates once it is installed since it will continue to evolve to help with additional tasks.

Install the CLI tool:

```bash
npm install -g @apostrophecms/cli
# Or `yarn global add @apostrophecms/cli`, if you prefer. We'll stick to npm commands.
```

Once installed you have access to the `apos` command. Simply use that command, or `apos --help`, to see a list of additional commands anytime.

**The CLI is not required** to work with Apostrophe. It primarily makes developing with Apostrophe faster and takes care of the more repetitive tasks during development.

## Creating a project

Before creating a project, make sure you start [MongoDB](https://docs.mongodb.com/manual/administration/install-community/) locally following their instructions. MongoDB can be configured to run all the time or started as needed, but it must be up and running to provide a place for ApostropheCMS to store its information.

The easiest way to get started with Apostrophe is to use the official starter project. If you have the CLI installed, go into your normal projects directory and use the command:

``` bash
apos create apos-app
```

The CLI will take care of installing dependencies and walk you through creating the first user. You can then skip down to the ["Finishing touches"](#finishing-touches) section. *If you don't want to use the CLI*, or if you want to see other things it does for you, continue on.

To get started quickly without the CLI, clone the starter repository:

```bash
git clone https://github.com/apostrophecms/a3-boilerplate apos-app
```

If you want to change the project directory name, please do so. We will continue referring to `apos-app`.

Open the `app.js` file in the root project directory. Find the `shortName` setting and change it to match your project (only letters, digits, hyphens and/or underscores). This will be used as the name of your database.

```javascript
// app.js
require('apostrophe')({
  shortName: 'apos-app', // 👈
  modules: {
  // ...
```

Excellent! Back in your terminal we'll install dependencies:

```bash
npm install
```

Before starting up you'll need to create an admin-level user so that you can log in. After running the following command, Apostrophe will ask you to enter a password for this user.

```bash
node app @apostrophecms/user:add my-user admin
# Replace `my-user` with the name you want for your first user.
```

### Finishing touches

You should also update the [session secret for Express.js](https://github.com/expressjs/session#secret) to a unique, random string. The starter project has a placeholder for this option already. If you do not update this, you will see a warning each time the app starts up.

```javascript
// modules/@apostrophecms/express/index.js
module.exports = {
  options: {
    session: {
      // If this still says `undefined`, set a real secret!
      secret: undefined
    }
  }
};
```

### Starting up the website

Start the site with `npm run dev`. The app will then watch for changes in client-side code, rebuilds it, then refresh the browser when it detects any. You can log in with the username and password you created at [http://localhost:3000/login](http://localhost:3000/login).

::: tip
If you are starting the site in a production environment or do not want the process to watch for changes, start the site with `node app.js`.
:::

## Next steps

Now that Apostrophe is installed, you're ready to start building. Check out the essentials [guide](/guide/) to learn about essential features or read more about Apostrophe's inner workings in the [technical overview](/guide/technical-overview.md).
