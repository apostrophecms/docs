# Installing MongoDB locally

For those who [choose to use MongoDB](./choosing-a-database.md), here are instructions to set up MongoDB for local development use.

::: tip
Most people don't need to install MongoDB! You can also use SQLite, which requires **no installation**, or install Postgres if that's your preference.
:::

**Option 1: MongoDB Atlas**

Consider skipping local installation altogether. MongoDB offers a hosted version of the server, [MongoDB Atlas](https://www.mongodb.com/atlas/database), that offers a free tier and doesn't require any local software installation. You can set a connection string for a hosted instance using the `APOS_MONGODB_URI` environment variable or by setting the options of the [`@apostrophecms/db` module](/reference/modules/db.html) at the project level.

For example:
```bash
export APOS_MONGODB_URI="mongodb+srv://username:pa%24%24word@mycluster.1234x.mongodb.net/YOUR-PROJECT-NAME?retryWrites=true&w=majority"
```

**Option 2: Docker**

For offline local development, you can use Docker to host the server. You can follow our instructions [here](/guide/dockerized-mongodb.md) and then skip to the next [section](/guide/development-setup.md#installing-the-apostrophe-cli). By default, Apostrophe attempts to connect to the database using the connection string `mongodb://localhost:27017/<project-shortName>` where the `shortName` is set in the project `app.js` file. The Docker tutorial sets the MongoDB container up to use this port, so no changes are needed.

**Option 3: MongoDB Community Edition (Local Installation)**

The final option, also for local development, is to install the MongoDB Community Edition server. As with the Docker container, the Community Edition server uses port 27017 and Apostrophe will connect to the MongoDB instance without any additional changes.

**The following steps are only required if you intend to develop on a locally hosted MongoDB instance.**

Installation of the MongoDB Community Edition is slightly different for each OS. We advise that you follow the [instructions](https://www.mongodb.com/docs/v8.0/administration/install-community/) on the MongoDB website for your OS.

For Windows users developing directly on Windows (not using WSL), the MongoDB Community Edition installer provides a straightforward graphical installation process that's as simple as using Atlas.

- **Windows users**: Follow the [Windows installation guide](https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-windows/)
- **macOS users**: Follow the [macOS installation guide](https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-os-x/)
- **Linux users**: Follow the guide for your [specific distribution](https://www.mongodb.com/docs/v8.0/installation/#mongodb-installation-tutorials)
- **WSL users**: Install from within WSL and follow the [Ubuntu installation guide](https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-ubuntu/)

::: info 📌 When using Ubuntu 22.04, the minimum supported MongoDB version is 8.0. If your production environment requires that you use an earlier version of MongoDB for development, we advise you to use Ubuntu 20.04.
:::

In addition to installing MongoDB Community Edition, there are options in the instructions for restarting MongoDB following a system reboot. You can opt to either follow these instructions or manually start MongoDB each time you reboot.

To check for successful installation of these tools, try the following commands:

```bash
# This will display your Node.js version and npm version (installed with Node),
# if installed successfully.
node -v && npm -v

# This will display your MongoDB version, if installed successfully.
mongod --version
```