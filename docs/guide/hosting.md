# Hosting ApostropheCMS in production

::: tip
If your project uses an Astro frontend, read this page for the backend, then see [Hosting ApostropheCMS + Astro in production](/guide/hosting-astro.md) for the frontend and how the two work together.
:::

## Server requirements

We recommend hosting Apostrophe in self-hosted production environments with the following minimum specifications:

| Software | Minimum Version |
| ------------- | ------------- |
| Ubuntu | 22.04+ (24.04 recommended) |
| [NGINX](https://www.nginx.com/) (or another reverse proxy like Caddy, Traefik) | Latest |
| [Node.js](https://nodejs.org/en/) | 22.x+ (24.x recommended) |
| Database (choose one, via the `db-connect` layer) | See below |

ApostropheCMS supports three database backends through the [`db-connect`](https://github.com/apostrophecms/apostrophe/blob/main/packages/db-connect/README.md) layer: MongoDB, PostgreSQL, and SQLite. See [Choosing a Database](/guide/choosing-a-database.md) for guidance on which is the best fit for your project, and [Using SQLite and PostgreSQL](/guide/using-sqlite-and-postgres.md) for setup and switching details.

| Database | Minimum Version |
| ------------- | ------------- |
| [MongoDB](https://docs.mongodb.com/manual/administration/install-community/) | 7.0+ (tested through 8.0) |
| [PostgreSQL](https://www.postgresql.org/) | Recent stable release |
| [SQLite](https://www.sqlite.org/) | N/A (file-based, bundled via `better-sqlite3`) |

| Hardware specification | Minimum recommendation |
| ------------- | ------------- |
| RAM | **2GB** (to support the application and database) |
| Disk space | **20GB** (see note below) |

1GB of RAM may be sufficient if you use a remote database service (e.g., MongoDB Atlas or a managed PostgreSQL provider) or SQLite, since neither runs a separate database server on the same machine. Sites running in a multicore configuration will require additional 2G or more RAM and, of course, CPU cores.

::: info
If using MongoDB, it requires a minimum of 5GB free disk space at all times. Small websites may not need much more additional space than that. We have found that 20GB is sufficient for most Apostrophe applications, but more space may be necessary to handle an especially large number of file uploads or especially large uploaded files. SQLite and PostgreSQL have different storage profiles; see [Choosing a Database](/guide/choosing-a-database.md) for details.
:::

## Deployment basics

Deployment processes will vary depending on the hosting environment, technical requirements, and team preferences. There are a few steps that all deployment processes should include.

1. **Run the data migration task: `node app @apostrophecms/migration:migrate`.** This runs both core and project-level migrations. Migrations also run automatically whenever ApostropheCMS starts, but running them as a separate deploy step means a failed migration stops the deployment before the running site is affected, and the new processes start without waiting on migration work.
2. **Run the build process: `node app @apostrophecms/asset:build`.** This runs automatically in development environments, but not if `NODE_ENV=production` or if the `autoBuild: false` option is set on the application. That is to ensure that the build is an intentional part of deployment and that developers can execute it along with other production build tasks as necessary.

   In production, the build is stored under a release ID, and the running site must use the same ID. ApostropheCMS detects it from the current git commit if the deployment is a git checkout, or from `HEROKU_RELEASE_VERSION` or `PLATFORM_TREE_ID`. Otherwise, set the `APOS_RELEASE_ID` environment variable to a short, URL-friendly string that is unique to each release, or write it to a `release-id` file in the project root, and make it available both to the build and to the running site. Without a release ID, every page fails with an error asking you to set `APOS_RELEASE_ID`.
3. If Apostrophe has been running on the server already, **stop the application process(es).**
4. **Start (or restart) the application process(es).**

## Best practices

### Set the `NODE_ENV` variable for production

Apostrophe includes performance enhancements when in "production mode." In production environments, or staging environments that replicate production, set the `NODE_ENV` to `production`. Be aware that this will disable the automatic user interface build. See the section above for more about running the build process.

### Set a session secret

ApostropheCMS signs session cookies with a secret. Without one, it falls back to a placeholder that is the same in every project and logs a warning at startup. In production, set the `APOS_SESSION_SECRET` environment variable to a long random value, or set the `secret` property of the [`session` option](/reference/modules/express.md#session) of `@apostrophecms/express`. The environment variable takes precedence and keeps the secret out of your code. All processes serving the site must use the same value, and changing it logs everyone out.

### Run multiple processes

Running the website on multiple server processes is always a good idea in the production environment. You should run at least two processes to guarantee availability if one process is restarting, even if you only have one CPU core. If you have more than two CPU cores, you may run additional processes, one per additional core. If you have a lot of capacity and are self-hosting a database on the same server (MongoDB or PostgreSQL), you might want to reserve a core for it.

We recommend using a utility such as [PM2](https://pm2.keymetrics.io/) to start and run these processes. PM2 will also restart the processes in the rare case of a crash.

### Minifying assets

Apostrophe concatenates [project-level front end code](/guide/front-end-assets.md#placing-client-side-code) and, when a user is logged in, delivers it to browsers with the user interface code as well. There is no advanced minification applied. If needed, apply any advanced minification prior to running the production build task.

## Scheduled tasks

Some ApostropheCMS command line tasks need to run on a schedule rather than once. For example, the task that publishes and unpublishes documents at their scheduled times, or a cleanup task of your own. These run as ordinary command line tasks, such as `node app @apostrophecms/scheduled-publishing:update`. How you schedule them depends on where the project is hosted.

### With ApostropheCMS hosting

Add a file named `crontab` to the root of your repository. On each deploy, ApostropheCMS hosting reads the file and installs its entries for that environment. Each line is a schedule followed by the command to run:

```sh
# Publish and unpublish scheduled documents every 15 minutes
*/15 * * * * node app @apostrophecms/scheduled-publishing:update

# Run a project cleanup task every day at 03:00 UTC
0 3 * * * node app my-module:cleanup
```

Commands run from the root of your repository. In a project where ApostropheCMS lives in a subdirectory, such as an ApostropheCMS + Astro project, include that directory in the command, for example `node backend/app.js my-module:cleanup`. It isn't added for you.

**Times are UTC.** `0 3 * * *` runs at 03:00 UTC, whatever timezone your editors or visitors are in.

**Each job runs once per environment**, not once per application server, so you don't need to add locking to stop several servers running the same task at the same moment. Each run starts in a fresh container with your project's configured environment variables.

#### Supported syntax

Each entry must start with either five schedule fields or a shortcut:

* **Five fields** (minute, hour, day of month, month, day of week) using only digits, `*`, `,`, `-` and `/`. For example `*/15 * * * *` or `30 2 * * 1-5`.
* **A shortcut:** `@hourly`, `@midnight`, `@daily`, `@weekly`, `@monthly` or `@annually`.

The following are **not** supported:

* Day and month names such as `MON` or `JAN`. Use numbers instead: `1` for Monday, `1` for January.
* `@yearly` (use `@annually`) and `@reboot`.
* Environment variable lines such as `MAILTO=…` or `NODE_ENV=…`. Set environment variables in your project's hosting configuration instead. They are passed to every job.

A comment at the end of an entry line is removed before the entry is installed. Lines that aren't valid entries, including comment-only lines, are skipped. Each skipped line produces an `Ignoring unsupported crontab line` message in the deploy log. For comment lines this is expected and harmless. For an entry you meant to run, it means the line needs fixing.

#### Removing a scheduled task

To stop a task, delete its line or comment it out, then deploy.

::: warning
Don't delete the `crontab` file itself to remove your tasks. Hosting only updates the installed entries when the file exists, so deleting it leaves the last set of entries running. A file with no active entries, such as one that contains only comments, removes them.
:::

#### Multisite projects

In a multisite project every task must say which site or sites it applies to, with `--site=…`, `--sites=…` or `--all-sites`. An entry without one of these fails when it runs. See [Scheduling tasks in Assembly projects](/starters/assembly.md#scheduled-tasks) for examples.

### Self-hosting

ApostropheCMS itself doesn't read the `crontab` file. It is a feature of ApostropheCMS hosting. When you host the project yourself, use your platform's scheduler instead: for example a cron job service on Render, a cron schedule on a Railway service, Heroku Scheduler, or the system `cron` on your own server.

Whichever scheduler you use, check these points:

* **Working directory.** The task has to run from the project root (or the `backend` directory in an ApostropheCMS + Astro project). System `cron` starts in the user's home directory, so change directory in the entry itself.
* **Environment variables.** The task needs the same environment variables as your application, such as `NODE_ENV` and your database connection string. System `cron` runs with a minimal environment, so load them in the entry or in a wrapper script.
* **Run each task once.** If your application runs on several servers, schedule the task on only one of them, or use a scheduler that runs a single copy for the whole application.
* **Timezone.** Many platforms evaluate schedules in UTC. Check yours before relying on a particular time of day.

For example, an entry in the system crontab on a single server might look like this:

```sh
*/15 * * * * cd /var/www/my-project && . ./production.env && node app @apostrophecms/scheduled-publishing:update >> /var/log/my-project/cron.log 2>&1
```

## Hosting recipes

The information here applies to most all hosting platforms. Implementation will vary depending on the platform. To help get started on specific platforms, [we provide hosting recipes for popular options](/cookbook/index.md#hosting).

