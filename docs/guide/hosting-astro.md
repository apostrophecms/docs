# Hosting ApostropheCMS + Astro in production

An ApostropheCMS + Astro project runs as two cooperating Node.js applications: the ApostropheCMS backend, which stores content and serves the editing UI, and the Astro frontend, which renders every page a visitor sees. Everything in [Hosting ApostropheCMS in production](/guide/hosting.md) still applies to the backend. This page covers what changes when Astro sits in front of it.

For step-by-step walkthroughs on specific platforms, see [Deploying ApostropheCMS + Astro projects](/tutorials/astro/deploying-hybrid-projects.md) and the other [Astro tutorials](/tutorials/astro/apostrophecms-and-astro.md).

## How requests flow

Visitors and editors only ever talk to Astro. The [`@apostrophecms/apostrophe-astro`](https://github.com/apostrophecms/apostrophe/tree/main/packages/apostrophe-astro) integration fetches page data from ApostropheCMS for each request and proxies a set of reserved routes straight through to the backend:

- `/api/v1/...` and `/[locale]/api/v1/...` for REST API calls
- `/login` and `/[locale]/login` for the login page
- `/apos-frontend/...` for the admin UI assets
- `/uploads/...` for uploaded media
- Literal content files declared by ApostropheCMS modules, such as `robots.txt` and `sitemap.xml`

Because of this, ApostropheCMS does not need to be reachable from the public internet. Only Astro does.

::: info
These proxy routes exist only when Astro runs with `output: 'server'`. A static build contains none of them, so the published site has no login page or admin UI. Editing happens against a separate server-rendered environment. See [Choosing an output mode](#choosing-an-output-mode).
:::

## Choosing a topology

### Both applications on one server

The simplest production setup runs both processes on the same machine. Astro listens on the public-facing port behind your reverse proxy, and ApostropheCMS listens on a private port that only Astro can reach.

- Set `ADDRESS=127.0.0.1` for the ApostropheCMS process so it only accepts local connections. By default it listens on all interfaces.
- Point Astro at the backend with `APOS_HOST=http://127.0.0.1:3000`.
- Size the server for both processes. Start from the [server requirements](/guide/hosting.md#server-requirements) for ApostropheCMS and add memory for the Astro processes.

This is also the model [ApostropheCMS hosting](https://apostrophecms.com/hosting) uses, so traffic between the two applications never leaves the machine.

### Separate servers or services

You can host the backend and frontend on different platforms, for example ApostropheCMS on a VPS or container platform and Astro on a serverless host. This gives you independent scaling and lets you use platform-specific Astro adapters, at the cost of a network hop on every page request.

- Place the two services in the same region, and on a private network if your platform supports it. Every uncached page view waits for a round trip to ApostropheCMS.
- For single-site projects, add `'host'` to the integration's `excludeRequestHeaders` option. Otherwise the browser's `Host` header, which names the Astro site, is forwarded to the ApostropheCMS server.
- Restrict direct public access to the backend where you can. Astro is the only client that needs it.

::: info
Multisite projects built with [Assembly](/starters/assembly.md) have additional hosting considerations, because each site is served from its own hostname. [Contact us](https://apostrophecms.com/contact-us) for advice on hosting a multisite project with an Astro frontend.
:::

## Choosing an output mode

The integration supports both Astro output modes:

| Mode | Astro setting | Needs a running backend | Use it when |
|---|---|---|---|
| Server-side rendering | `output: 'server'` with an SSR adapter | At request time | Editors need in-context editing on the live site, or content changes must appear immediately |
| Static | `output: 'static'` | At build time only | You want the published site served as plain files, and can rebuild whenever content is published |

Server-side rendering is the default in the starter kits and the right choice for most projects. Any Astro adapter that supports `output: 'server'` works. The starter kits ship with [`@astrojs/node`](https://docs.astro.build/en/guides/integrations-guide/node/) in `standalone` mode. For serverless hosts, swap in that platform's adapter.

A static site still needs an SSR environment for editing. The usual pattern is an SSR staging site that editors work in, plus a static production build that is triggered when content is ready to publish. See [Static builds with ApostropheCMS + Astro](/tutorials/astro/static-builds-with-apostrophecms-astro.md) and [Full static deployment with Railway and Vercel](/tutorials/astro/full-apostrophecms-astro-static-deployment.md).

## Configuring Astro for your domain

Astro checks the origin of every `POST`, `PUT`, `PATCH`, and `DELETE` request to a server-rendered site that has a form-like body or no body at all, and rejects cross-site requests with `403 Cross-site POST form submissions are forbidden`. To build the site's origin, Astro only trusts the `Host` and `X-Forwarded-*` headers when they match the `security.allowedDomains` option. With the default empty list, a production build treats every request as coming from `http://localhost`, so requests from your real domain fail the check.

The admin UI sends several requests of this kind through Astro's proxy, including logging out and uploading files. Editors can still log in and edit, but these actions fail. The development server builds the origin from the incoming request, so the problem typically appears only after you deploy a production build.

List the public origin of each environment in `astro.config.mjs`:

<AposCodeBlock>

```mjs
export default defineConfig({
  output: 'server',
  security: {
    allowedDomains: [
      { protocol: 'https', hostname: 'www.example.com' }
    ]
  },
  // ...adapter, integrations, and other options
});
```

<template v-slot:caption>
frontend/astro.config.mjs
</template>
</AposCodeBlock>

- **Include every hostname the site answers on,** such as the bare domain and `www`, and a staging domain if staging uses the same build.
- **Forward the original protocol and host from your reverse proxy.** When NGINX terminates HTTPS, Astro receives plain HTTP. Set `proxy_set_header Host $host;` and `proxy_set_header X-Forwarded-Proto $scheme;` so that Astro sees `https://www.example.com`, which matches the `protocol` in the pattern.
- **Include the port for non-standard ports,** for example `{ protocol: 'http', hostname: 'localhost', port: '4321' }` when testing a production build locally.
- **Apply the option only to server-rendered builds.** With Astro 6 and later, it produces a warning for every prerendered page in a static build. See [Upgrading apostrophe-astro](/guide/migration/upgrading-apostrophe-astro.md#static-builds-guard-security-alloweddomains-to-ssr-only) for a pattern that applies it conditionally.

## Environment variables

| Variable | Set on | Read at | Purpose |
|---|---|---|---|
| `APOS_EXTERNAL_FRONT_KEY` | Both | Runtime (and build time for static builds) | Shared secret that authorizes Astro to request page data. Must be identical on both sides. |
| `APOS_HOST` | Astro | **Build time** | Base URL of the ApostropheCMS backend, including the port if it isn't 80 or 443. Overrides the `aposHost` integration option. |
| `APOS_PREFIX` | Astro | **Build time** | URL prefix, if the backend uses the `prefix` option. Overrides the `aposPrefix` integration option. |
| `APOS_BASE_URL` | ApostropheCMS | Runtime | The public URL of the site, which is the Astro URL, not the backend URL. Used when ApostropheCMS generates absolute URLs. |
| `APOS_RELEASE_ID` | ApostropheCMS | Build time **and** runtime | Short, unique string that identifies the release. Must have the same value for the asset build and the running site. Not needed if the deployment is a git checkout. See [Deployment basics](/guide/hosting.md#deployment-basics). |
| `APOS_SESSION_SECRET` | ApostropheCMS | Runtime | Secret used to sign session cookies. See [Set a session secret](/guide/hosting.md#set-a-session-secret). |
| `NODE_ENV` | ApostropheCMS | Runtime | Set to `production`. See [Hosting ApostropheCMS in production](/guide/hosting.md#set-the-node-env-variable-for-production). |
| `APOS_DB_URI` | ApostropheCMS | Runtime | Database connection string. See [Choosing a database](/guide/choosing-a-database.md). |
| `PORT` | Each process | Runtime | Listening port. Both applications read this variable, so give each process its own value. |

::: warning
The integration writes `APOS_HOST` and `APOS_PREFIX` into the build output when `astro build` runs. Setting them only when starting the server has no effect. If the backend URL changes, rebuild the frontend.
:::

### Managing the external front key

`APOS_EXTERNAL_FRONT_KEY` is what prevents other sites from pulling unlimited data out of your backend while posing as your frontend.

- Generate a long random value and keep it in your platform's secret store, not in the repository.
- Use a different value in each environment, such as staging and production.
- To rotate it, update both applications and restart them together. While the values differ, ApostropheCMS answers Astro's page requests with `403 forbidden` and logs an `externalFrontKeyInvalid` error.

You can set the backend value with the `externalFrontKey` option of `@apostrophecms/express` instead of the environment variable, but the environment variable takes precedence and keeps the secret out of code.

## Deploying a release

Extend the [deployment basics](/guide/hosting.md#deployment-basics) for ApostropheCMS with the Astro build. For a server-rendered site, deploy in this order:

1. **Install dependencies** in both the `backend` and `frontend` directories.
2. **Build the backend:** `NODE_ENV=production node app @apostrophecms/asset:build`. Unless the deployment is a git checkout, set `APOS_RELEASE_ID` for this step and give the running site the same value.
3. **Run migrations:** `NODE_ENV=production node app @apostrophecms/migration:migrate`. Migrations also run when ApostropheCMS starts, but a separate step stops a failed migration from reaching the running site.
4. **Build the frontend:** `astro build`, with `APOS_HOST` set to the production backend URL.
5. **Restart ApostropheCMS, then Astro.**

The starter kits include scripts for each step. From the project root, `npm run build` builds both halves and `npm run migrate` runs migrations. `npm run serve-backend` and `npm run serve-frontend` start them in production mode.

A static build is different: the backend must be running and populated **before** `astro build` starts, because Astro fetches every page and attachment during the build. If `APOS_HOST` or `APOS_EXTERNAL_FRONT_KEY` is missing, the integration silently skips copying attachments and literal content files.

## Running the processes

Follow the advice in [Run multiple processes](/guide/hosting.md#run-multiple-processes) for both applications, using a process manager such as PM2 to keep them running. On a single server, one PM2 ecosystem file can manage both:

<AposCodeBlock>

```cjs
module.exports = {
  apps: [
    {
      name: 'apostrophe',
      cwd: './backend',
      script: 'app.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        ADDRESS: '127.0.0.1',
        PORT: 3000
      }
    },
    {
      name: 'astro',
      cwd: './frontend',
      script: 'dist/server/entry.mjs',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: 4321
      }
    }
  ]
};
```

<template v-slot:caption>
ecosystem.config.cjs
</template>
</AposCodeBlock>

::: warning
Write this file in CommonJS, with `module.exports`, even if your project uses ES modules, as the starter kits do. PM2 loads its configuration file with `require()`, and the `.cjs` extension tells Node.js to treat the file as CommonJS whatever the `"type"` setting in `package.json` says. An ESM version fails before any process starts:

```text
[PM2][ERROR] File ecosystem.config.cjs malformated
SyntaxError: Unexpected token 'export'
```

Because of this, the example above has no CJS/ESM toggle. It always displays as CommonJS whichever format you've selected elsewhere in the documentation.
:::

Save the file in the project root, next to the `backend` and `frontend` directories. Each app's `cwd` is relative to that location. Keep secrets such as `APOS_EXTERNAL_FRONT_KEY` and `APOS_DB_URI` in the server environment rather than in this file. Point your reverse proxy at the Astro port. The Astro process binds to `127.0.0.1` here because the reverse proxy runs on the same machine. Use `0.0.0.0` on platforms that route traffic to the container from outside.

## Media and caching

- **Store uploads outside the server.** Use cloud storage such as [Amazon S3](/cookbook/using-s3-storage.md) so that uploads survive redeploys and every backend process sees the same files. This matters most when Astro runs on a serverless host with no persistent disk.
- **Serve media from storage or a CDN, not through Astro.** When uploads are in cloud storage, image URLs point at the storage service directly. Otherwise, every image request travels through Astro's `/uploads` proxy to the backend.
- **Pass through caching headers.** Include `'cache-control'` in the integration's `includeResponseHeaders` option so that the cache headers ApostropheCMS sets reach browsers and CDNs. See [Caching](/guide/caching.md) for configuring them. The starter kits include this header by default.
- **Pass through security headers.** If you use `@apostrophecms/security-headers`, list its headers in `includeResponseHeaders` too. The integration removes the `nonce` from the `content-security-policy` header's `script-src` value because Astro does not support it.

## Production checklist

- Both applications run on Node.js 22.19 or newer, as the Astro integration requires.
- `APOS_EXTERNAL_FRONT_KEY` is a strong secret, identical on both sides, and different in each environment.
- `APOS_HOST` is set when `astro build` runs.
- `security.allowedDomains` in `astro.config.mjs` lists the site's public origin, and the reverse proxy forwards `Host` and `X-Forwarded-Proto`. Test by logging out on the production site.
- `APOS_SESSION_SECRET` is set to a long random value on the backend, not left at the built-in placeholder.
- `APOS_BASE_URL` on the backend is the public Astro URL.
- The backend has the same `APOS_RELEASE_ID` at build time and at runtime, unless the deployment is a git checkout.
- The backend is not publicly reachable, or at least is not linked from anywhere public.
- For single-site projects, `excludeRequestHeaders` includes `'host'` if the two applications run on different hosts.
- Uploads are stored in persistent or cloud storage.
- Each application runs at least two processes under a process manager.
- Test the production build locally with `npm run build` followed by `npm run serve-backend` and `npm run serve-frontend` before deploying.
