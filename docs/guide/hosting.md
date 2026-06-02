# Hosting Apostrophe in production

## Server requirements

We recommend hosting Apostrophe in self-hosted production environments with the following minimum specifications:

| Software | Minimum Version |
| ------------- | ------------- |
| Ubuntu (or Debian, or another actively supported LTS Linux distro) | Latest LTS release |
| [NGINX](https://www.nginx.com/) | Latest |
| [Node.js](https://nodejs.org/en/) | 22.x+ (use an LTS release) |
| [MongoDB](https://docs.mongodb.com/manual/administration/install-community/)  | 7.0+ (tested through 8.0) |
| [pm2](https://pm2.keymetrics.io/) | Latest (if not using containers) |
| [certbot](https://certbot.eff.org/) | Latest (for easy HTTPS certificate management) |

::: info
While any Linux distribution and reverse proxy should be fine, [the community can answer questions more easily](https://chat.apostrophecms.com/) if you stick with Ubuntu or Debian and use Nginx as your reverse proxy. While it is technically possible to directly send traffic to ApostropheCMS, `nginx` improves security, handles HTTPS easily, serves static files quickly and resists several Denial-Of-Service attacks with its default settings. So you should use `nginx`, or comparable software like Caddy or Traefik.
:::

| Hardware specification | Minimum recommendation |
| ------------- | ------------- |
| RAM | **2GB** (to support the application and database on one machine) |
| Disk space | **20GB** (see note below) |

1GB of RAM may be sufficient if using a remote database service (e.g., MongoDB Atlas). However we recommend 2GB for a better experience.

::: info
MongoDB requires a minimum of 5GB free disk space at all times. Small websites may not need much more additional space than that. We have found that 20GB is sufficient for most Apostrophe applications, but more space may be necessary to handle an especially large number of file uploads or especially large uploaded files.
:::

## Deployment basics

Deployment processes will vary depending on the hosting environment, technical requirements, and team preferences. There are a few steps that all deployment processes should include.

1. **Run the data migration task:** This will run both core data migrations as well as project-level migrations. This should happen once in each deployment. As far as migrations written by our own team are concerned, it is safe to run while existing processes are still up, which minimizes downtime:

```bash
npm run migrate
```

::: note
This relies on the `migrate` script already provided in `package.json`. If you don't have it now,
set it to: `NODE_ENV=production node app @apostrophecms/migrations:migrate`
:::

2. **Run the asset build process.** Tis runs automatically in development environments, but not in production. This is to ensure that the build is an intentional part of deployment and won't result in unexpected race conditions and broken styles.

```bash
npm run build
```

::: note
This relies on the `build` script already provided in `package.json`. If you don't have it now,
set it to: `NODE_ENV=production node app @apostrophecms/asset:build`
:::

3. If Apostrophe has been running on the server already, **stop the application process(es).** If using `pm2` to manage them:

```bash
pm2 stop app || echo "Not already running, may be the first time"
```

4. **Start the application process(es).** For high availability, always run at least two processes, even on a single-core server. Otherwise a bug that momentarily takes down one process will result in errors for all requests until it restarts.

```bash
# Rather than just "node app"
APOS_CLUSTER_PROCESSES=2 pm2 start "npm run serve"
```

::: info
This relies on the `migrate` script already provided in `package.json`. If you don't have it now,
set it to: `NODE_ENV=production node app`

If your server actually does have more than two cores, and you are also hosting mongodb on it, you can set `APOS_CLUSTER_PROCESSES` higher, but consider reserving one core for mongodb. If you are load-balancing across multiple separate servers and each has only one core, you can skip `APOS_CLUSTER_PROCESSES=2`.
:::

### Minifying assets

Apostrophe's asset build task (see above) already concatenates [project-level front end code](/guide/front-end-assets.md#placing-client-side-code) and, when a user is logged in, delivers it to browsers with the user interface code as well. Make sure that on-the-fly compression of `.js` and `.css` files is enabled in your proxy server configuration. Further minification yields little benefit.

## Detailed hosting recipes

The information here applies in a general way to almost all hosting platforms. Implementation will vary depending on the platform. To help get started on specific platforms, [we provide hosting recipes for popular options](/cookbook/index.md#hosting).
