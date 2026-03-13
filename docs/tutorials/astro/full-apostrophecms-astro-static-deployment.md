---
title: "ApostropheCMS + Astro: Full Static Deployment with Railway and Vercel"
detailHeading: "Astro"
url: "/tutorials/astro/full-apostrophecms-astro-static-deployment.html"
content: "A complete guide to deploying your ApostropheCMS + Astro project using Railway for the backend and Vercel for both a live SSR editorial environment and a static production site."
tags:
  topic: "Deployment"
  type: astro
  effort: intermediate
order: 8
excludeFromFilters: true
---
# ApostropheCMS + Astro: Full Static Deployment with Railway and Vercel

This is a detailed implementation guide for one specific deployment approach. If you are still deciding on a hosting strategy or want an overview of your options, start with [Deploying ApostropheCMS-Astro Projects](/tutorials/astro/deploying-hybrid-projects.html) first.

This guide covers deploying an ApostropheCMS + Astro hybrid project using:
- **ApostropheCMS** hosted on [Railway](https://railway.app) (backend)
- **Astro SSR** hosted on [Vercel](https://vercel.com) (staging/editorial frontend)
- **Static site** built and deployed via Vercel Deploy Hook (production)

Railway and Vercel are the recommended platforms for this stack, but they are not the only options. ApostropheCMS can run on any Node-capable host with a persistent process and outbound access to MongoDB — Lightsail, Render, and Fly.io are all viable alternatives. The Vercel-specific steps in Parts 2 and 3 would need to be adapted for other static or SSR hosts, but the overall architecture and environment variable requirements remain the same.

> **Managed hosting:** If you are starting a new project, ApostropheCMS offers its own managed hosting that handles both the backend and the Astro SSR frontend together, which sidesteps the Railway/Vercel setup entirely. The static build and Deploy Hook workflow described in Part 3 applies regardless of where the staging tier is hosted.

## Prerequisites

- An ApostropheCMS + Astro project using [`@apostrophecms/apostrophe-astro`](https://github.com/apostrophecms/apostrophe-astro) in a GitHub repository
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster with a connection URI
- [Railway CLI](https://docs.railway.app/develop/cli) installed and authenticated
- [Vercel CLI](https://vercel.com/docs/cli) installed globally and authenticated
- Node.js and npm available locally

---

## Architecture Overview

This setup uses a two-tier publishing model:

```
┌─────────────────────────────────────────────────────┐
│ STAGING TIER (always-on)                            │
│                                                     │
│  ApostropheCMS ──────────► Astro SSR                │
│  (Railway / Atlas)  proxied  (Vercel project A)     │
│                            ↑                        │
│                       Editors work here             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ PRODUCTION TIER (on-demand)                         │
│                                                     │
│  Deploy Hook ──► Vercel build ──► static output     │
│  (button/script)  fetches from    (Vercel project B)│
│                   Railway at                        │
│                   build time                        │
└─────────────────────────────────────────────────────┘
```

Content managers work entirely within the Astro SSR frontend — they never interact directly with the ApostropheCMS admin panel. Astro proxies the full Apostrophe editing experience.

When content is ready to publish, a Deploy Hook triggers a static build on a second Vercel project. This gives the team deliberate control over what goes to production without requiring CI/CD infrastructure, and without taking the staging environment offline.

---

## Part 1: ApostropheCMS on Railway

### 1.1 MongoDB Atlas

Before deploying to Railway, make sure you have a MongoDB Atlas cluster running and have your connection URI ready. It will look like:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
```

> **Special characters in passwords:** If your Atlas password contains special characters (such as `@`, `/`, `:`, or `!`), they must be percent-encoded in the connection URI or the connection will fail silently. For example, `p@ssword!` becomes `p%40ssword%21`. Use a [percent-encoding tool](https://www.urlencoder.org/) if needed, or set a password that uses only alphanumeric characters to avoid this entirely.

### 1.2 Initialize the Railway Project

From your `backend/` directory, initialize a new Railway project:

```bash
cd backend
railway init
```

When prompted, create a new project and give it a name (e.g. `my-project-backend`).

### 1.3 Connect to GitHub

Linking Railway to your GitHub repository enables automatic redeployments when you push to `main`. Run:

```bash
railway link
```

Then in the [Railway dashboard](https://railway.app/dashboard), open your project, go to **Settings → Source**, and connect the GitHub repository. Set the **Root Directory** to `backend` so Railway only installs and runs the backend service.

### 1.4 Configure `railway.json`

In your `backend/` directory, create a `railway.json` file to explicitly set the install and start commands:

```json
{
  "build": {
    "installCommand": "npm install"
  },
  "deploy": {
    "startCommand": "node app.js"
  }
}
```

> **Note on package managers:** `npm install` is the recommended install command for Railway regardless of what you use locally. If you are working in a monorepo with pnpm, Railway only needs to install the `backend/` dependencies — it does not need to understand the full workspace. Using `npm install` here avoids pnpm version mismatch issues on Railway's build servers.

Commit this file to your repository.

### 1.5 Set Environment Variables

In the Railway dashboard, open your backend service and go to **Variables**. Add the following:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | Atlas connection URI (mark sensitive) | `mongodb+srv://...` |
| `APOS_EXTERNAL_FRONT_KEY` | Shared auth secret — must match the Vercel frontend | `a-long-random-string` |
| `APOS_BASE_URL` | Astro staging frontend URL (set after Part 2) | `https://your-project.vercel.app` |
| `NODE_ENV` | Sets production mode | `production` |
| `APOS_RELEASE_ID` | Unique ID per deploy for cache busting | `${{RAILWAY_GIT_COMMIT_SHA}}` |
| `APOS_STATIC_BASE_URL` | Public origin for static production URLs | `https://your-project-production.vercel.app` |

> **`APOS_EXTERNAL_FRONT_KEY`:** Generate a long random string for this value. It authenticates the Astro frontend with ApostropheCMS. Both Railway and Vercel must use the exact same value or requests will be rejected. Treat it like a password.

> **`APOS_RELEASE_ID`:** Setting this to `${{RAILWAY_GIT_COMMIT_SHA}}` uses Railway's built-in reference variable to automatically generate a unique value from the git commit hash on every deploy. This is preferable to a static random string, which would remain the same across redeployments.

> **`APOS_BASE_URL` and `APOS_STATIC_BASE_URL` — chicken-and-egg:** Both of these point to Vercel URLs that do not exist yet. `APOS_BASE_URL` requires the staging URL from Part 2, and `APOS_STATIC_BASE_URL` requires the production URL from Part 3. Set the other three variables now and come back to add these after each project is deployed.

### 1.6 Deploy to Railway

Trigger the first deployment:

```bash
railway up
```

Railway will install dependencies, start the app, and assign a public URL to the service. It will look like:

```
https://your-app.railway.app
```

Note this URL — you will need it when setting `APOS_HOST` in Part 2.

### 1.7 Create an Admin User

Once the service is running, connect to it via the Railway CLI to run the user creation command.

First, make sure you are logged in:

```bash
railway login
```

Then get the SSH command from the Railway dashboard — right-click your backend service block and select **Copy SSH Command**. Paste and run it in your terminal. Once connected, run:

```bash
node app.js @apostrophecms/user:add --username=admin --role=admin
```

You will be prompted to set a password. This account is used to log into the editorial interface in Part 2.

### 1.8 Attachment Storage

By default, ApostropheCMS stores uploaded files (images, PDFs, etc.) on the local filesystem. This is **not suitable for production** — Railway's filesystem is ephemeral and files will not survive redeployments.

Before adding media to your project, configure a cloud storage provider. ApostropheCMS supports AWS S3 and S3-compatible services (Backblaze B2, Cloudflare R2, DigitalOcean Spaces, etc.) via the [`@apostrophecms/uploadfs`](https://github.com/apostrophecms/uploadfs) module.

For AWS S3, add these four variables to your Railway backend service:

| Variable | Description |
|----------|-------------|
| `APOS_S3_BUCKET` | Your S3 bucket name |
| `APOS_S3_REGION` | AWS region (e.g. `us-east-1`) |
| `APOS_S3_KEY` | AWS access key ID |
| `APOS_S3_SECRET` | AWS secret access key |

For full setup instructions, see the [ApostropheCMS uploadfs documentation](https://github.com/apostrophecms/uploadfs).

> **Static builds and attachments:** During a static build, attachment files are copied into the `dist/` output by default. If your project has many large files, see `APOS_SKIP_ATTACHMENTS` and `APOS_ATTACHMENT_SCOPE` in the environment variable reference to control this behavior.

---

## Part 2: Astro SSR on Vercel (Staging)

### 2.1 Install the Vercel Adapter

From your `frontend/` directory:

```bash
npm install @astrojs/vercel@8
```

> **Note:** As of this writing, `@astrojs/vercel@10` requires Astro v6, which is still in alpha. Pin to version 8 for Astro v5 compatibility. Once Astro v6 is stable, upgrade both together.

### 2.2 Update `astro.config.mjs`

The config needs to switch adapters based on environment — `@astrojs/vercel` when building on Vercel, `@astrojs/node` for local development. This means `astro dev` is completely unaffected; adapters only apply during `astro build`.

```js
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';
import apostrophe from '@apostrophecms/apostrophe-astro';

const isStatic = process.env.APOS_BUILD === 'static';
const isVercel = process.env.ASTRO_ADAPTER === 'vercel';

export default defineConfig({
  output: isStatic ? 'static' : 'server',
  base: process.env.APOS_PREFIX || undefined,
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4321,
    host: process.env.HOST || false
  },
  adapter: isStatic ? undefined : (isVercel ? vercel() : node({ mode: 'standalone' })),
  integrations: [
    apostrophe({
      aposHost: process.env.APOS_HOST || 'http://localhost:3000',
      widgetsMapping: './src/widgets',
      templatesMapping: './src/templates',
      includeResponseHeaders: [
        'content-security-policy',
        'strict-transport-security',
        'x-frame-options',
        'referrer-policy',
        'cache-control'
      ],
      excludeRequestHeaders: [
        'host'  // Required for cross-host proxy (Vercel → Railway)
      ]
    })
  ],
  vite: {
    ssr: {
      noExternal: ['@apostrophecms/apostrophe-astro'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `$base-path: "${process.env.APOS_PREFIX || ''}";`,
          silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin'],
        }
      }
    }
  }
});
```

Key points:

- `isVercel` uses an explicit `ASTRO_ADAPTER` env var rather than relying on Vercel's injected `VERCEL` system variable, which is not reliably available when `astro.config.mjs` is evaluated
- `'host'` is included in `excludeRequestHeaders` — **required** when Astro and Apostrophe are on separate hosts, or the proxy will fail
- Adapter selection is conditional so local dev is unchanged

### 2.3 Add `.vercel` to `.gitignore`

The `.vercel/` folder contains local metadata linking your machine to a specific Vercel project. It should not be committed to the repository:

```bash
echo ".vercel" >> .gitignore
```

### 2.4 Create the Staging Vercel Project

If you have an existing `vercel.json` or `.vercel/` folder from a previous deployment, remove them first:

```bash
rm -f vercel.json
rm -rf .vercel
```

From your `frontend/` directory, run the Vercel setup wizard:

```bash
vercel
```

Answer the prompts as follows:

| Prompt | Answer |
|--------|--------|
| Set up and deploy? | `Y` |
| Which scope? | Your account |
| Link to existing project? | `N` |
| Project name | e.g. `my-project-staging` |
| Directory where code is located | `.` |
| Build command | `npm run build` |
| Output directory | *(leave blank)* |
| Development command | *(leave blank)* |
| Modify additional settings? | `N` |

> **Output directory:** Leave this blank for the SSR staging project. The `@astrojs/vercel` adapter outputs to `.vercel/output` in Vercel's Build Output API format — Vercel handles this automatically. The `dist` output directory only applies to Project B, where Astro writes plain static files with no adapter.

### 2.5 Connect to GitHub

In the [Vercel dashboard](https://vercel.com/dashboard), open `my-project-staging` and go to **Settings → Git**. Connect the project to your GitHub repository. Once connected, every push to `main` will automatically trigger a new staging deployment — no CLI needed for day-to-day work.

> Your local `.vercel/` folder stays linked to `my-project-staging` permanently. There is no reason to switch it to another project.

### 2.6 Set Environment Variables

```bash
vercel env add APOS_HOST
```

Value: your Railway backend URL, **including `https://`** (e.g. `https://your-app.railway.app`)  
Environments: Production, Preview, Development

```bash
vercel env add APOS_EXTERNAL_FRONT_KEY
```

Value: the shared secret key — must match exactly what is set on the Railway backend  
Environments: Production, Preview *(mark as sensitive — cannot be set for Development when sensitive)*

> This key authenticates the Astro frontend with ApostropheCMS. Treat it like a password.

```bash
vercel env add ASTRO_ADAPTER
```

Value: `vercel`  
Environments: Production, Preview

### 2.7 Deploy

```bash
vercel --prod --force
```

Use `--force` to skip build cache on the initial deploy. After this, subsequent staging deployments happen automatically on every push to `main`.

### 2.8 Set `APOS_BASE_URL` on Railway

Now that the staging URL is known, go back to the Railway dashboard and add the final backend variable:

```
APOS_BASE_URL=https://your-project-staging.vercel.app
```

> **Gotcha:** `APOS_BASE_URL` must point to the **Astro frontend URL** (not the Railway URL itself), and must include the `https://` protocol. Getting either wrong causes redirect loops or broken navigation after login.

### 2.9 Editorial Workflow

#### Logging in

Navigate to your Vercel staging URL and go to `/login`. Use the admin credentials created in step 1.7.

The full ApostropheCMS admin UI is proxied through Astro — content managers work entirely within the Vercel staging URL and never need to access Railway directly.

#### Editing content

In-context editing works as it does in a standard ApostropheCMS installation:

- Click the edit button on any page to enter edit mode
- Add, remove, and reorder widgets inline
- Changes are saved to the ApostropheCMS backend on Railway
- Content is live in the staging environment immediately

#### What editors see vs. what is published

Changes made in the editorial environment are **staging only**. The public production site is a separate static build and is not updated until a deliberate publish step is taken (see Part 3).

---

## Part 3: Static Production Site on Vercel

The production site is a second Vercel project connected to the same GitHub repository. It builds in static mode, fetching all content from the Railway backend at build time and outputting plain HTML, CSS, and JS. The staging project is completely unaffected — editors keep working while a publish is in progress.

Each publish is a full rebuild: a fresh snapshot of whatever content is in Atlas at that moment. There is no incremental update — if content changed, the whole site rebuilds. This is intentional; it makes the production site a deliberate, auditable point-in-time capture.

Project B is set up and managed entirely from the Vercel dashboard. Your local `.vercel/` folder stays linked to the staging project — there is no need to touch it.

### 3.1 Create the Production Vercel Project

1. In the [Vercel dashboard](https://vercel.com/dashboard), click **Add New → Project**
2. Import the same GitHub repository used for the staging project
3. Name the project e.g. `my-project-production`
4. Set the following build settings:

| Setting | Value |
|---------|-------|
| Framework Preset | Astro |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

5. Click **Deploy** — the first build will likely fail since environment variables are not set yet. That is expected.

### 3.2 Disable Automatic Deployments

Project B should only build when explicitly triggered, not on every push to `main`. To disable automatic deployments:

1. In the Vercel dashboard, open `my-project-production`
2. Go to **Settings → Git**
3. Under **Ignored Build Step**, enter:

```bash
exit 1
```

> This tells Vercel to skip any build triggered by a Git push. Builds triggered by a Deploy Hook bypass this check and still run normally.

### 3.3 Set Environment Variables

In the Vercel dashboard, open `my-project-production` and go to **Settings → Environment Variables**. Add the following:

| Variable | Value | Environments |
|----------|-------|--------------|
| `APOS_HOST` | Your Railway backend URL | Production, Preview |
| `APOS_EXTERNAL_FRONT_KEY` | Shared secret key (mark sensitive) | Production, Preview |
| `APOS_BUILD` | `static` | Production, Preview |

> Do **not** add `ASTRO_ADAPTER` to this project. Without it, the config will correctly select no adapter, which is required for static output.

### 3.4 Create a Deploy Hook

A Deploy Hook is a webhook URL that triggers a production build when called. This is how content managers publish without touching code or the CLI.

1. In the Vercel dashboard, open `my-project-production`
2. Go to **Settings → Git → Deploy Hooks**
3. Create a hook named e.g. `Publish` targeting the `main` branch
4. Copy the generated URL — it will look like:

```
https://api.vercel.com/v1/integrations/deploy/prj_xxxx/yyyyyyyy
```

To trigger a publish, send a POST request to that URL:

```bash
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_xxxx/yyyyyyyy"
```

A successful response returns `{"job":{"id":"...","state":"PENDING"}}`. The build will appear in the Vercel dashboard under `my-project-production` deployments.

> **Making this content-manager friendly:** the `curl` command above can be wrapped in a shell script, a Makefile target, or a button in an internal tool. The content manager never needs to know what is happening under the hood — they trigger the URL and the site updates within a few minutes.

### 3.5 Verify the Production Build

Navigate to your production Vercel URL (e.g. `https://my-project-production.vercel.app`). Before triggering the first real publish, go back to the Railway dashboard and set the final backend variable:

```
APOS_STATIC_BASE_URL=https://my-project-production.vercel.app
```

This tells ApostropheCMS the public origin of the static site so it can generate correct absolute URLs for links, canonical tags, and sitemaps during a static build.

Then confirm the following:

- Pages load without calling back to Railway (check the browser network tab — there should be no requests to `railway.app`)
- Internal links resolve correctly
- If attachment storage is configured, images load from your S3/R2/B2 bucket

---

## Environment Variable Reference

### ApostropheCMS Backend (Railway)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | Atlas connection URI | `mongodb+srv://...` |
| `APOS_EXTERNAL_FRONT_KEY` | Shared auth secret (must match frontend) | `a-long-random-string` |
| `APOS_BASE_URL` | Astro staging frontend URL | `https://your-project.vercel.app` |
| `NODE_ENV` | Sets production mode | `production` |
| `APOS_RELEASE_ID` | Unique ID per deploy for cache busting | `${{RAILWAY_GIT_COMMIT_SHA}}` |
| `APOS_STATIC_BASE_URL` | Public origin for static production URLs | `https://your-project-production.vercel.app` |

### Astro Frontend — Staging (Vercel Project A)

| Variable | Description | Example |
|----------|-------------|---------|
| `APOS_HOST` | Railway backend URL | `https://your-app.railway.app` |
| `APOS_EXTERNAL_FRONT_KEY` | Shared auth secret (sensitive) | `a-long-random-string` |
| `ASTRO_ADAPTER` | Tells config to use Vercel adapter | `vercel` |

### Astro Frontend — Production (Vercel Project B)

| Variable | Description | Example |
|----------|-------------|---------|
| `APOS_HOST` | Railway backend URL | `https://your-app.railway.app` |
| `APOS_EXTERNAL_FRONT_KEY` | Shared auth secret (sensitive) | `a-long-random-string` |
| `APOS_BUILD` | Switches output to static mode | `static` |

---

## Troubleshooting

**`ECONNREFUSED 127.0.0.1:3000` during static build**  
`APOS_HOST` is missing or not saved in the production Vercel project environment variables. Verify the value is set and trigger the Deploy Hook again.

**Site loads but shows no content / 500 error**  
Check Vercel function logs with `vercel logs --prod` immediately after triggering a page load. Most likely causes: wrong `APOS_HOST` value, missing `https://` protocol, or mismatched `APOS_EXTERNAL_FRONT_KEY`.

**Redirects to a malformed URL after login**  
`APOS_BASE_URL` on the Railway backend is missing `https://` or is still set to the Railway URL instead of the Vercel staging URL.

**Build uses wrong adapter / falls back to static on staging**  
Confirm `ASTRO_ADAPTER=vercel` is set in Vercel environment variables for the staging project and redeploy with `--force`.

**Static build runs on every GitHub push to production project**  
The **Ignored Build Step** command was not saved. Go to **Settings → Git** in `my-project-production` and confirm `exit 1` is set.

**Atlas connection fails on Railway**  
Check that special characters in the Atlas password are percent-encoded in the `MONGODB_URI` value. See the note in section 1.1.

**`@astrojs/vercel` peer dependency warning during install**  
Pin to `@astrojs/vercel@8` for Astro v5 compatibility. See version note in section 2.1.