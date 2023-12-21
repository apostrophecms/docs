# Setting Up Your Environment

## Overview
This article covers the first steps to get started. We're going to make sure your workstation is ready for development and give an overview of the Apostrophe CLI. While these steps will work directly for Mac OS and many Linux distributions, Windows OS users will need to [install WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install) first. **Importantly**, for both WSL2 and other Linux users we recommend checking to make sure that the Linux distribution you are installing or using is supported by the [MongoDB Community Edition](https://www.mongodb.com/docs/v6.0/administration/install-on-linux/). Alternatively, you can also elect to install and use Docker for running the [MongoDB server](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-community-with-docker/), which is OS agnostic.

## Requirements

Let's get started with what you will need to have installed on your machine to run a project locally:

::: info 📌 For Windows OS users, we only support development in the WSL 2 environment or another virtual Linux environment. All the additional instructions on this page should be followed from the WSL 2 prompt, not the Windows command or Powershell prompt. If you are having difficulties, there is further [guidance in the documentation](/cookbook/windows-development.html#installing-windows-subsystem-for-linux) that contains additional troubleshooting instructions for the entire install including WSL 2, Node.js, npm, and MongoDB.
:::

### 1. Node.js 18+/ npm<br>

Node.js is a JavaScript runtime and it runs server-side JS, including the Apostrophe app. npm is automatically included with Node. You can download and install these at https://nodejs.org. However, we (and indeed Microsoft) highly encourage the use of NVM to allow you to switch easily between Node and npm versions. You can find the installation instructions [here](https://github.com/nvm-sh/nvm#installing-and-updating).

⚠️ NVM is only available for Linux / Mac OS / Windows WSL.

Once installed, you can switch between different versions of Node and npm by using

```bash
$ nvm install 18
# and
$ nvm use 18
```

See the `nvm` page for more options.

### 2. MongoDB 6.0+<br>

You can make a MongoDB instance available to your project in two main ways. For completely local development you can install the MongoDB community edition server. You can also elect to use a hosted version of the server, either through the MongoDB [Atlas service](https://www.mongodb.com/atlas/database), or self-hosted. By default, Apostrophe attempts to connect to the database using the connection string `mongodb://localhost:27017<project-shortName>` where the `shortName` is set in the project `app.js` file. You can set a connection string for a hosted instance using the `APOS_MONGODB_URI` environment variable.

For example:
```bash
APOS_MONGODB_URI=mongodb://db_user:D1fficultP%40ssw0rd@mongodb0.example.com:27017/?authSource=apos-site-db node app
```

Installation of the MongoDB Community Edition is slightly different for each OS. We advise that you follow the [instructions](https://www.mongodb.com/docs/v6.0/administration/install-community/) on the MongoDB website for your OS. Again, Windows users should install from within WSL2 and follow the instructions for their Linux distribution.

::: info 📌 When using Ubuntu 22.04, the only currently supported MongoDB version is 6.04 or newer. If your production environment requires that you use an earlier version of MongoDB for development, we advise you use Ubuntu 20.04.
:::

In addition to installing MongoDB Community Edition, there are options in the instructions for restarting MongoDB following a system reboot. You can opt to either follow these instructions or manually start mongoDB each time you reboot.

To check for successful installation of these tools, try the following commands:

```bash
# This will display your Node.js version and npm version (installed with Node),
# if installed successfully.
node -v && npm -v

# This will display your MongoDB version, if installed successfully.
mongod --version
```


### Installing the Apostrophe CLI
There is an [official CLI](https://github.com/apostrophecms/cli) for quickly setting up starter code for your Apostrophe project. Once in a project, the CLI can also help add new module code with a single command so you can focus on the aspects that are unique to your project rather than copying or remembering boilerplate.

The CLI is **not required** to work with Apostrophe, but it makes developing with Apostrophe faster and takes care of the more repetitive tasks during development. This is especially true when creating a new project.

Install the CLI globally through npm.
`npm install --location=global @apostrophecms/cli`

::: info 📌 You can review more information about the Apostrophe CLI in the doc [here](https://www.npmjs.com/package/@apostrophecms/cli)
:::

## Creating a project

If you are running your MongoDB server locally, make sure that it has been started before creating a project. MongoDB can be configured to run all the time or started as needed, but it must be up and running to provide a storage option for 

The easiest way to get started with Apostrophe is to use one of the official starter kit projects. If you have the CLI installed, go into your normal projects directory and use the command:

``` bash
apos create apos-app
```

This will install the ["Essentials"](https://github.com/apostrophecms/starter-kit-essentials) starter kit.

::: tip
💡 To install other starter kits, pass the `--starter` flag, along with the short name of one of our [starter kits](https://github.com/orgs/apostrophecms/repositories?q=starter-kit&type=all&language=&sort=). For example:

``` bash
apos create apos-app --starter=ecommerce
```
:::

The CLI will take care of installing dependencies and walk you through creating the first user. You can then skip down to the ["Finishing touches"](#finishing-touches) section. *If you don't want to use the CLI*, or if you want to see other things it does for you, continue on.

To get started quickly without the CLI, clone the starter repository:

```bash
git clone https://github.com/apostrophecms/starter-kit-essentials apos-app
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

Excellent! Back in your terminal, we'll install dependencies:

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

Start the site with `npm run dev`. The app will then watch for changes in client-side code, rebuild the packages, then refresh the browser when it detects any. You can log in with the username and password you created at [http://localhost:3000/login](http://localhost:3000/login).

::: tip
If you are starting the site in a production environment or do not want the process to watch for changes, start the site with `node app.js`.
:::

## Next steps

Now that Apostrophe is installed, you're ready to start building. Check out the [guide](/guide/modules.html) to learn about essential features with plenty of code examples. To learn about building a site from scratch, jump to our [tutorial series](/tutorials/introduction.html). If you are looking to explore Apostrophe's inner workings peruse the [reference guide](/reference/glossary.md).
