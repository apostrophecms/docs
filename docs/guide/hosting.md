---
prev:
  text: 'Server-side events'
  link: 'guide/server-events.md'
next:
  text: 'Webpack'
  link: 'guide/webpack.md'
---
# Hosting Apostrophe in production

## Server requirements

We recommend hosting Apostrophe in self-hosted production environments with the following minimum specifications:

| Software | Minimum Version |
| ------------- | ------------- |
| Ubuntu | 16+ |
| [NGINX](https://www.nginx.com/) (or another proxy server) | Latest |
| [Node.js](https://nodejs.org/en/) | 16.x+ |
| [MongoDB](https://docs.mongodb.com/manual/administration/install-community/)  | 4.2+ |


| Hardware specification | Minimum recommendation |
| ------------- | ------------- |
| RAM | **2GB** (to support the application and database) |
| Disk space | **20GB** (see note below) |

1GB of RAM may be sufficient if using a remote database service (e.g., MongoDB Atlas). Sites running in a multicore configuration will require additional 2G or more RAM and, of course, CPU cores.

::: info
MongoDB requires a minimum of 5GB free disk space at all times. Small websites may not need much more additional space than that. We have found that 20GB is sufficient for most Apostrophe applications, but more space may be necessary to handle an especially large number of file uploads or especially large uploaded files.
:::

## Deployment basics

Deployment processes will vary depending on the hosting environment, technical requirements, and team preferences. There are a few steps that all deployment processes should include.

1. **Run the data migration task: `node app @apostrophecms/migration:migrate`.** This will run both core data migrations as well as project-level migrations.
2. **Run the build process: `node app @apostrophecms/asset:build`.** This runs automatically in development environments, but not if `NODE_ENV=production` or if the `autoBuild: false` option is set on the application. That is to ensure that the build is an intentional part of deployment and that developers can execute it along with other production build tasks as necessary.
3. If Apostrophe has been running on the server already, **stop the application process(es).**
4. **Start (or restart) the application process(es).**

## Best practices

### Set the `NODE_ENV` variable for production

Apostrophe includes performance enhancements when in "production mode." In production environments, or staging environments that replicate production, set the `NODE_ENV` to `production`. Be aware that this will disable the automatic user interface build. See the section above for more about running the build process.

### Run multiple processes

Running the website on multiple server processes is always a good idea in the production environment. You should run at least two processes to guarantee availability if one process is restarting, even if you only have one CPU core. If you have more than two CPU cores, you may run additional processes, one per additional core. If you have a lot of capacity, you might want to reserve a core for MongoDB.

We recommend using a utility such as [PM2](https://pm2.keymetrics.io/) to start and run these processes. PM2 will also restart the processes in the rare case of a crash.

### Minifying assets

Apostrophe concatenates [project-level front end code](/guide/front-end-assets.md#placing-client-side-code) and, when a user is logged in, delivers it to browsers with the user interface code as well. There is no advanced minification applied. If needed, apply any advanced minification prior to running the production build task.

## Hosting recipes

The information here applies to most all hosting platforms. Implementation will vary depending on the platform. To help get started on specific platforms, [we provide hosting recipes for popular options](/cookbook/index.md#hosting).

