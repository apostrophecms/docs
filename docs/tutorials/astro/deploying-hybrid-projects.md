---
title: "Deploying ApostropheCMS-Astro Projects"
detailHeading: "Astro"
url: "/tutorials/astro/deploying-hybrid-projects.html"
content: "Make your ApostropheCMS + Astro project public. Learn deployment options, environment configuration, and hosting best practices for your integrated application."
tags:
  topic: "Core Concepts"
  type: astro
  effort: beginner
order: 6
excludeFromFilters: true
---
# Deploying ApostropheCMS + Astro Projects

Now that you've built your site with ApostropheCMS and Astro, it's time to deploy it for the world to see. The Apollo project's two-application structure (backend + frontend) offers flexibility but also requires special considerations for deployment.

## Understanding Deployment Options

There are two main approaches to deploying your ApostropheCMS + Astro project:

1. **Unified Deployment** (via Apostrophe Hosting or hosting that supports Node.js)
   - Deploy both frontend and backend together
   - Simplest option with minimal configuration
   - Managed infrastructure and automatic updates with Apostrophe Hosting

2. **Split Deployment**
   - Deploy backend and frontend to separate services
   - More flexibility and control
   - Requires more configuration and coordination

Start with unified deployment unless you have a reason not to. It has one thing to deploy, the backend stays private, and requests between the two applications never leave the machine. Split deployment makes sense when your backend platform can't run both applications, or when production is a [static build](/tutorials/astro/static-builds-with-apostrophecms-astro.md) served as plain files.

## Prerequisites for Production Deployment

Regardless of your deployment method, you'll need:

- A database - MongoDB is the default, but SQLite or PostgreSQL can be used instead. See [Using SQLite or PostgreSQL Instead of MongoDB](/guide/using-sqlite-and-postgres.html)
- Environment variables properly configured
- Asset storage solution like AWS S3 or a persistent folder that doesn't get erased during each deployment (for uploaded images/files)

If you prefer, we can handle all of those details for you via our [Managed Hosting](https://apostrophecms.com/hosting).

## Configuring Astro for Production

Before deploying your Astro frontend, you'll need to adjust the `astro.config.mjs` file for production. Let's look at key configuration options:

```mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import apostrophe from '@apostrophecms/apostrophe-astro';

export default defineConfig({
  output: "server",  // Required for SSR
  security: {
    // The public origin(s) of your site. Without this, Astro rejects
    // logout, file uploads, and other form-like requests in production
    allowedDomains: [
      { protocol: 'https', hostname: 'www.example.com' }
    ]
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4321,
    // Uncomment for hosting platforms like Heroku that need this
    // host: true
  },
  adapter: node({
    mode: 'standalone'  // For most deployment scenarios
  }),
  integrations: [apostrophe({
    // Overridden by the APOS_HOST environment variable at build time
    aposHost: 'http://localhost:3000',
    widgetsMapping: './src/widgets',
    templatesMapping: './src/templates',
    
    // Security headers to pass from backend to frontend
    includeResponseHeaders: [
      'content-security-policy',
      'strict-transport-security',
      'x-frame-options',
      'referrer-policy',
      'cache-control'
    ],
    
    // For split deployment (separate servers), uncomment:
    // excludeRequestHeaders: ['host']
  })],
  
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true
        }
      }
    }
  },
  
  // SCSS configuration if using Sass
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      }
    }
  }
});
```

### Key Configuration Areas

1. **Port Configuration**
   - The `server.port` setting defaults to 4321 but reads from the `PORT` environment variable if set
   - Some platforms (Heroku, Railway) require `host: true` to listen on all interfaces

2. **Allowed Domains**
   - `security.allowedDomains` must list every public hostname of the site
   - Without it, a production build rejects logout, file uploads, and similar requests with `403 Cross-site POST form submissions are forbidden`
   - See [Configuring Astro for your domain](/guide/hosting-astro.md#configuring-astro-for-your-domain) for the reverse proxy headers this depends on

3. **Integration Settings**
   - `aposHost` must point to your production backend URL in production
   - Set it with the `APOS_HOST` environment variable rather than hardcoding it
   - `APOS_HOST` is read when `astro build` runs and written into the build output, so it must be set in your build environment. Changing it later requires a rebuild

4. **Header Configuration**
   - `includeResponseHeaders` determines which response headers from ApostropheCMS are preserved
   - Essential for maintaining security settings between backend and frontend

5. **Split Deployment Settings**
   - When deploying to separate servers, exclude the `host` header
   - Uncomment `excludeRequestHeaders: ['host']`. Without it, requests to an HTTPS backend fail with a certificate error


## Deploying with ApostropheCMS Hosting

Apostrophe offers a straightforward hosting solution specifically designed for ApostropheCMS projects, including those with Astro frontends.

### Benefits

- Zero configuration for ApostropheCMS + Astro integration
- Database provisioning and management handled automatically
- Built-in asset storage and delivery
- SSL certificate management
- Automatic backups
- Security updates

### Getting Started with Apostrophe Hosting

Contact the Apostrophe team through their [website](https://apostrophecms.com/hosting) to set up your hosting. The team will provide detailed instructions for connecting your repository for automatic deployment.

## Unified Deployment on Your Own Server

The unified approach also works on a server you manage yourself. Both applications run on one machine, NGINX forwards public traffic to Astro, and ApostropheCMS listens on a private port that only Astro can reach. [Hosting ApostropheCMS + Astro in production](/guide/hosting-astro.md) explains each part of this setup. The example below puts the parts together in order.

### Example: Deploying to a DigitalOcean Droplet

This example uses SQLite, so there is no database server to install. Only the first step is specific to DigitalOcean. The rest applies to any Ubuntu server.

1. **Create the Droplet and point your domain at it.** Choose Ubuntu 24.04 LTS with at least 2 GB of RAM, and add your SSH key. Then add a DNS `A` record for your hostname that points to the Droplet's IP address. Do this first, because the HTTPS step needs the hostname to resolve.
2. **Install the server packages.** Connect with `ssh root@your-droplet-ip` and run:
   ```sh
   apt-get update && apt-get -y upgrade
   apt-get install -y nginx git build-essential certbot python3-certbot-nginx

   # Node.js from NodeSource, not Ubuntu's own nodejs package
   curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
   apt-get install -y nodejs

   npm install -g pm2

   # A non-root user to run the site
   useradd nodeapps -d /home/nodeapps -m -s /bin/bash
   ```
3. **Clone the project and install dependencies** as the new user. The starter kits install the `backend` and `frontend` dependencies from the project root:
   ```sh
   su - nodeapps
   git clone https://github.com/your-organization/your-project.git
   cd your-project
   npm install
   ```
4. **Create the environment files.** The two applications share one key, so generate it once and write it to both files:
   ```sh
   mkdir -p ~/data
   KEY=$(openssl rand -hex 32)

   cat > backend/.env <<EOF
   APOS_DB_URI=sqlite:///home/nodeapps/data/your-project.db
   APOS_EXTERNAL_FRONT_KEY=$KEY
   APOS_SESSION_SECRET=$(openssl rand -hex 32)
   APOS_BASE_URL=https://www.example.com
   EOF

   cat > frontend/.env <<EOF
   APOS_EXTERNAL_FRONT_KEY=$KEY
   EOF
   ```
   The database file lives in `~/data`, outside the project directory, so it survives redeploys.
5. **Add your domain to `security.allowedDomains`** in `frontend/astro.config.mjs`, as shown in [Configuring Astro for Production](#configuring-astro-for-production). Commit this to your repository so every deployment includes it.
6. **Build both applications, run migrations, and create an admin user:**
   ```sh
   cd ~/your-project/backend
   npm run build
   npm run migrate

   cd ~/your-project/frontend
   APOS_HOST=http://127.0.0.1:3000 npm run build

   cd ~/your-project/backend
   NODE_ENV=production node app @apostrophecms/user:add admin admin
   ```
   `APOS_HOST` is written into the Astro build, so it must be set on the build command. Because the project is a git checkout, ApostropheCMS takes its release ID from the current commit, and you don't need to set `APOS_RELEASE_ID`.
7. **Start both applications with PM2.** Save the `ecosystem.config.cjs` file from [Running the processes](/guide/hosting-astro.md#running-the-processes) in the project root, then:
   ```sh
   cd ~/your-project
   pm2 start ecosystem.config.cjs
   pm2 save
   exit
   ```
   Back in the root shell, have PM2 start the site whenever the server boots:
   ```sh
   env PATH=$PATH:/usr/bin pm2 startup systemd -u nodeapps --hp /home/nodeapps
   ```
8. **Configure NGINX.** Remove the default site, save the configuration from [Configuring the reverse proxy](/guide/hosting-astro.md#configuring-the-reverse-proxy) as `/etc/nginx/conf.d/your-project.conf` with your own hostname, and reload:
   ```sh
   rm -f /etc/nginx/sites-enabled/default
   nginx -t && systemctl reload nginx
   ```
9. **Add HTTPS.** Certbot obtains a certificate, adds it to the NGINX configuration, and redirects HTTP to HTTPS:
   ```sh
   certbot --nginx -d www.example.com
   ```
10. **Turn on the firewall** so that only SSH, HTTP, and HTTPS are reachable. Allow SSH before enabling it, or you will lock yourself out:
    ```sh
    ufw allow OpenSSH
    ufw allow 'Nginx Full'
    ufw enable
    ```
11. **Check the result.** Open the site over HTTPS, log in, upload an image larger than 1 MB, and log out. Then reboot the server and confirm the site comes back by itself.

To deploy an update, pull the new code, run `npm install`, repeat step 6 without the last command, and run `pm2 reload ecosystem.config.cjs`.

## Split Deployment (Separate Backend and Frontend)

For more control or to leverage specific platform features, you can deploy the backend and frontend separately. Compared with a unified deployment, expect these costs:

- The backend must be reachable from the internet, with its own hostname and HTTPS certificate
- Every uncached page view makes a network round trip from Astro to ApostropheCMS
- There are two deployments to keep in sync, with a shared key and a backend URL that is fixed when the frontend is built
- On serverless frontend hosts, uploads from the admin UI are subject to the platform's request size limit

### Backend (ApostropheCMS) Deployment

Your ApostropheCMS backend requires:

- Node.js 22.19 or newer
- A database connection - MongoDB by default, or SQLite/PostgreSQL via the `@apostrophecms/db-connect` adapter (see [Using SQLite or PostgreSQL Instead of MongoDB](/guide/using-sqlite-and-postgres.html))
- Asset storage solution (S3 or equivalent cloud storage)

#### Common Backend Hosting Options

1. **Traditional VPS/Dedicated Servers** (DigitalOcean, Linode, AWS EC2)
   - Complete control over the environment
   - Requires server management knowledge
   - Good for high-performance requirements

2. **Platform as a Service** (Heroku, Render, Railway)
   - Simpler deployment with less configuration
   - Often includes easy database integration
   - Automatic scaling options

#### Example: Deploying to Render

1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Configure build settings:
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm run serve`
4. Set environment variables:
   ```
   NODE_ENV=production
   APOS_DB_URI=your_database_connection_string
   APOS_EXTERNAL_FRONT_KEY=your_shared_secret_key
   APOS_S3_BUCKET=your-bucket-name
   APOS_S3_SECRET=your-s3-secret
   APOS_S3_KEY=your-s3-key
   APOS_S3_REGION=your-chosen-region
   ```
   `APOS_DB_URI` accepts a `mongodb://`, `sqlite://`, or `postgres://` connection string, so it works regardless of which database you choose. See [Using SQLite or PostgreSQL Instead of MongoDB](/guide/using-sqlite-and-postgres.html) for connection string formats.

There are several guides for other [deployment options](/guide/hosting.html) and configuring [storage services](/cookbook/using-s3-storage.html) in the main ApostropheCMS documentation.

### Frontend (Astro) Deployment

Your Astro frontend can be deployed to any service, including our [managed hosting](https://apostrophecms.com/hosting), that supports SSR (Server-Side Rendering). Depending on the hosting provider you may also need to make changes to your `astro.config.mjs` file. The [Astro.build](https://docs.astro.build/en/guides/deploy/#deployment-guides) site has a number of guides for deployment. The only extra consideration is that we are deploying a monorepo, so you need to take the extra steps to identify the `frontend' folder as the root for your Astro deployment.

#### Common Frontend Hosting Options

1. **ApostropheCMS**
  - Hosts the combined Astro + ApostropheCMS monorepo in one step
  - Astro and ApostropheCMS run on the same server, so requests between them never leave the machine
  - Configures your database and S3 storage automatically
  - Provides `APOS_EXTERNAL_FRONT_KEY` automatically

2. **Netlify**
   - Excellent Astro integration
   - Easy setup with continuous deployment
   - Great for sites with moderate traffic

3. **Vercel**
   - Strong Node.js support
   - Optimized for SSR applications
   - Robust edge network

4. **Cloudflare Pages**
   - Global CDN with edge computing
   - Strong caching capabilities
   - Good for high-traffic sites

#### Example: Deploying to Netlify

Netlify runs Astro's server-rendered pages as serverless functions, so the frontend needs Netlify's adapter instead of the Node adapter shown earlier.

1. Add the adapter from the `frontend` directory:
   ```bash
   npx astro add netlify
   ```
   This installs `@astrojs/netlify` and sets `adapter: netlify()` in `astro.config.mjs`.
2. Add `'host'` to the integration's `excludeRequestHeaders` option in `astro.config.mjs`. Astro and ApostropheCMS run on different hosts here, and without this change every page fails with a `500` error. See [Certificate Errors](#certificate-errors).
   ```mjs
   excludeRequestHeaders: [
     'host'
   ]
   ```
3. Commit and push both changes, then log in to your [Netlify](https://www.netlify.com/) account and create a new site by connecting your GitHub repository
4. Configure build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. Set environment variables. Netlify makes them available during the build, which is when `APOS_HOST` is read. The backend must be reachable from the internet at this URL:
   ```
   APOS_EXTERNAL_FRONT_KEY=your_shared_secret_key
   APOS_HOST=https://your-backend-url.com
   ```
6. On the backend, set `APOS_BASE_URL` to the Netlify site's public URL and restart it. Otherwise logging in sends editors to whatever URL the backend was configured with.
7. Open the site in a browser where you are not logged in to Netlify. If it asks for a Netlify login or a password, change the site's visitor access setting to public in the Netlify project configuration.

::: warning
On Netlify, uploads from the admin UI pass through a serverless function, and Netlify limits the size of a request to a function. The limit is 6 MB, and less for binary files such as images. In practice, editors can upload files up to about 4 MB. If editors need to upload larger files, host the Astro frontend on a platform without this limit.
:::

The adapter generates the function and routing configuration during the build, so you don't need a `netlify.toml` file or redirect rules. You also don't need to add the Netlify hostname to `security.allowedDomains`. Logging out and uploading files work on Netlify without it.

## Environment Configuration for Production

The [environment variables table](/guide/hosting-astro.md#environment-variables) in the hosting guide lists every variable, which application it belongs to, and whether it is read at build time or at runtime. Whichever platform you choose, set at least these:

- **Backend:** `NODE_ENV=production`, `APOS_DB_URI`, `APOS_EXTERNAL_FRONT_KEY`, `APOS_SESSION_SECRET`, and `APOS_BASE_URL`, which is the public URL of the site, not the backend URL. Add `APOS_RELEASE_ID` if the deployment is not a git checkout.
- **Frontend:** the same `APOS_EXTERNAL_FRONT_KEY` as the backend, and `APOS_HOST` in the build environment.
- **Platform-specific:** some hosts assign a `PORT`, or need `HOST=0.0.0.0` so the application listens on all interfaces.

`APOS_DB_URI` accepts `mongodb://`, `sqlite://`, and `postgres://` connection strings. See [Using SQLite or PostgreSQL Instead of MongoDB](/guide/using-sqlite-and-postgres.html) for the formats, including the `multipostgres://` format for multisite deployments.

If uploads go to cloud storage, the backend also needs the storage variables. See [Using S3 storage](/cookbook/using-s3-storage.md) for the full set of options:

```bash
APOS_S3_BUCKET=your-bucket-name
APOS_S3_SECRET=your-s3-secret
APOS_S3_KEY=your-s3-key
APOS_S3_REGION=your-chosen-region
```

## Best Practices for Production

1. **Always use HTTPS** for both frontend and backend
2. **Test the production build locally** before deploying. From the project root, build both applications, then start each one in its own terminal:
   ```bash
   npm run build
   npm run serve-backend
   npm run serve-frontend
   ```
3. **Keep your `APOS_EXTERNAL_FRONT_KEY` secret** - it's your security link between frontend and backend

For topology, deployment order, process management, and caching recommendations, see [Hosting ApostropheCMS + Astro in production](/guide/hosting-astro.md). Its [production checklist](/guide/hosting-astro.md#production-checklist) is worth running through before you go live.

## Troubleshooting Common Issues

### Connection Problems
If your frontend can't connect to the backend:
1. Verify the `APOS_HOST` environment variable was set correctly when the frontend was built. Changing it on a running server has no effect until you rebuild
2. Ensure `APOS_EXTERNAL_FRONT_KEY` matches between frontend and backend. A mismatch makes ApostropheCMS respond with `403 forbidden` and log an `externalFrontKeyInvalid` error
3. Check network access between your frontend and backend servers

### Certificate Errors
If every page returns a `500` error and the response or the frontend logs mention the certificate, the browser's `Host` header is being forwarded to the backend:

```text
Server error: Hostname/IP does not match certificate's altnames:
Host: your-site.netlify.app. is not in the cert's altnames: DNS:your-backend-url.com
```

Add `'host'` to the integration's `excludeRequestHeaders` option and redeploy the frontend. This applies whenever the two applications run on different hosts.

### Login Redirects to the Wrong Site
If logging in sends editors to a different URL, or images load from a different hostname, `APOS_BASE_URL` on the backend doesn't match the public URL of the Astro site. Set it to the frontend's public URL and restart the backend.

### Header Issues
If security headers aren't propagating properly, check your `includeResponseHeaders` configuration in the Astro config.


## Detailed Deployment Guides

The sections above cover the concepts and configuration common to all ApostropheCMS + Astro deployments. For more complete, step-by-step guidance, see the following guides:

### Static Builds with ApostropheCMS + Astro

If you want to generate a fully static frontend at build time — outputting plain HTML, CSS, and JS that can be deployed to any static hosting platform — this guide covers everything you need to configure on both the backend and frontend.

[Static Builds with ApostropheCMS + Astro](/tutorials/astro/static-builds-with-apostrophecms-astro.html)

### Full Static Deployment with Railway and Vercel

A complete worked example of a two-tier deployment: ApostropheCMS on Railway as the backend, Astro SSR on Vercel as a always-on editorial environment, and a static production site triggered by a Vercel Deploy Hook. Covers environment variables, attachment storage, admin user creation, and a publish workflow that gives content managers deliberate control over what goes live.

[ApostropheCMS + Astro: Full Static Deployment with Railway and Vercel](/tutorials/astro/full-apostrophecms-astro-static-deployment.html)

## Conclusion

Deploying an ApostropheCMS + Astro project requires careful consideration of how the two parts interact. Whether you choose unified deployment through Apostrophe Hosting or split your frontend and backend across specialized services, the key is ensuring they can communicate securely and efficiently.

For further assistance, consider:
- Joining the [ApostropheCMS Discord community](http://chat.apostrophecms.org)
- Consulting the [Astro deployment documentation](https://docs.astro.build/en/guides/deploy/)
- Reaching out to the Apostrophe team for hosting solutions