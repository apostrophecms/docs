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

Now that you've built your site with ApostropheCMS and Astro, it's time to deploy it for the world to see. The Apollo project's dual-repository structure (backend + frontend) offers flexibility but also requires special considerations for deployment.

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

## Prerequisites for Production Deployment

Regardless of your deployment method, you'll need:

- A MongoDB database - Atlas or host-specific
- Environment variables properly configured
- Asset storage solution like AWS S3 or a persistent folder that doesn't get erased during each deployment (for uploaded images/files)

If you prefer, we can handle all of those details for you via our [Managed Hosting](https://apostrohecms.com/hosting).

## Configuring Astro for Production

Before deploying your Astro frontend, you'll need to adjust the `astro.config.mjs` file for production. Let's look at key configuration options:

```javascript
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import apostrophe from '@apostrophecms/apostrophe-astro';

export default defineConfig({
  output: "server",  // Required for SSR
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4321,
    // Uncomment for hosting platforms like Heroku that need this
    // host: true
  },
  adapter: node({
    mode: 'standalone'  // For most deployment scenarios
  }),
  integrations: [apostrophe({
    // In production, this should be set via the APOS_HOST env variable
    aposHost: process.env.APOS_HOST || 'http://localhost:3000',
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
    
    // For split deployment (separate servers), you may need to uncomment:
    // excludeRequestHeaders: ['host']
  })],
  
  // Required to handle virtual URLs in the integration
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true
        }
      }
    },
    ssr: {
      noExternal: ['@apostrophecms/apostrophe-astro']
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

2. **Integration Settings**
   - `aposHost` must point to your production backend URL in production
   - Set via the `APOS_HOST` environment variable rather than hardcoding

3. **Header Configuration**
   - `includeResponseHeaders` determines which response headers from ApostropheCMS are preserved
   - Essential for maintaining security settings between backend and frontend

4. **Split Deployment Settings**
   - When deploying to separate servers, you may need to exclude the `host` header
   - Uncomment `excludeRequestHeaders: ['host']` to prevent hostname conflicts


## Deploying with Apostrophe Hosting

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

## Split Deployment (Separate Backend and Frontend)

For more control or to leverage specific platform features, you can deploy the backend and frontend separately.

### Backend (ApostropheCMS) Deployment

Your ApostropheCMS backend requires:

- Node.js environment (v18 or better, at least v20 recommended)
- MongoDB database connection
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
   APOS_MONGODB_URI=your_mongodb_connection_string
   APOS_EXTERNAL_FRONT_KEY=your_shared_secret_key
   APOS_S3_BUCKET=your-bucket-name
   APOS_S3_SECRET=your-s3-secret
   APOS_S3_KEY=your-s3-key
   APOS_S3_REGION=your-chosen-region
   ```
There are several guides for other [deployment options](/guide/hosting.html) and configuring [storage services](/cookbook/using-s3-storage.html) in the main ApostropheCMS documentation.

### Frontend (Astro) Deployment

Your Astro frontend can be deployed to any service, including our [managed hosting](https://www.apostrophecms/hosting), that supports SSR (Server-Side Rendering). Depending on the hosting provider you may also need to make changes to your `astro.config.mjs` file. The [Astro.build](https://docs.astro.build/en/guides/deploy/#deployment-guides) site has a number of guides for deployment. The only extra consideration is that we are deploying a monorepo, so you need to take the extra steps to identify the `frontend' folder as the root for your Astro deployment.

#### Common Frontend Hosting Options

1. **ApostropheCMS**
  - Hosts the combined Astro + ApostropheCMS monorepo in one step
  - Zero latency when Astro communicates with ApostropheCMS
  - Configures MongoDB and S3 automatically
  - Provides `APOS_EXTERNAL_FRONTEND_KEY` automatically

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

1. Log in to your [Netlify](https://www.netlify.com/) account
2. Create a new site by connecting your GitHub repository
3. Configure build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
4. Set environment variables:
   ```
   APOS_EXTERNAL_FRONT_KEY=your_shared_secret_key
   APOS_HOST=https://your-backend-url.com
   ```

You can also use a `netlify.toml` file at the root of your project for configuration:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/entry"
  status = 200
```

## Environment Configuration for Production

### Critical Environment Variables

#### Backend Environment Variables

```bash
# Required
NODE_ENV=production
APOS_MONGODB_URI=your_mongodb_connection_string
APOS_EXTERNAL_FRONT_KEY=your_shared_secret_key

# For cloud asset storage (e.g., AWS S3)
APOS_S3_BUCKET=your-bucket-name
APOS_S3_SECRET=your-s3-secret
APOS_S3_KEY=your-s3-key
APOS_S3_REGION=your-chosen-region

# For identifying releases (if not using Git-based deployment)
APOS_RELEASE_ID=unique-random-string
```

#### Frontend Environment Variables

```bash
# Required
APOS_EXTERNAL_FRONT_KEY=your_shared_secret_key  # Must match backend
APOS_HOST=https://your-backend-url.com

# Optional for specific hosts
PORT=8080  # If your host requires a specific port
HOST=0.0.0.0  # For hosts that need to listen on all interfaces
```

## Best Practices for Production

1. **Always use HTTPS** for both frontend and backend
2. **Test your build locally** before deploying:
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```
3. **Keep your `APOS_EXTERNAL_FRONT_KEY` secret** - it's your security link between frontend and backend

## Troubleshooting Common Issues

### Connection Problems
If your frontend can't connect to the backend:
1. Verify the `APOS_HOST` environment variable is set correctly
2. Ensure `APOS_EXTERNAL_FRONT_KEY` matches between frontend and backend
3. Check network access between your frontend and backend servers

### Header Issues
If security headers aren't propagating properly, check your `includeResponseHeaders` configuration in the Astro config.


## Conclusion

Deploying an ApostropheCMS + Astro project requires careful consideration of how the two parts interact. Whether you choose unified deployment through Apostrophe Hosting or split your frontend and backend across specialized services, the key is ensuring they can communicate securely and efficiently.

For further assistance, consider:
- Joining the [ApostropheCMS Discord community](http://chat.apostrophecms.org)
- Consulting the [Astro deployment documentation](https://docs.astro.build/en/guides/deploy/)
- Reaching out to the Apostrophe team for hosting solutions