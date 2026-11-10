---
title: "Sharing a local ApostropheCMS site with Cloudflare Tunnel"
description: "Give coworkers a temporary public URL for an ApostropheCMS or ApostropheCMS + Astro project running on your own computer, with no server setup."
---

# Sharing a local ApostropheCMS site with Cloudflare Tunnel

Once your project runs on your own computer, you'll often want to show it to someone else: a coworker reviewing a design, a product manager checking a prototype, or a client giving early feedback. Setting up a server just for that is a lot of work at an early stage.

A Cloudflare quick tunnel skips that step. It gives your locally running site a temporary public URL, such as `https://lunch-strip-cats-nimble.trycloudflare.com`, that anyone you share it with can open in their browser. The site keeps running on your computer, and the URL stops working as soon as you stop the tunnel. You don't need a Cloudflare account.

This is a way to share work in progress, not a way to host a site. When you're ready for a permanent home, see [Hosting ApostropheCMS in production](/guide/hosting.md) or, for Astro projects, [Hosting ApostropheCMS + Astro in production](/guide/hosting-astro.md).

## Installing `cloudflared`

The tunnel runs through `cloudflared`, a small command-line tool from Cloudflare. Install it once.

### macOS

Install [Homebrew](https://brew.sh/) if you don't already have it, then run:

```bash
brew install cloudflared
```

### Windows

In PowerShell or Command Prompt, run:

```bash
winget install --id Cloudflare.cloudflared
```

Open a new terminal window afterward so the `cloudflared` command is available.

### Linux

On Debian or Ubuntu, download and install the package from the latest release:

```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
```

For ARM machines or other distributions, see [Cloudflare's downloads page](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).

To confirm the install worked on any platform, run:

```bash
cloudflared --version
```

## Sharing an ApostropheCMS project

1. In your project folder, start the site as usual:

   ```bash
   npm run dev
   ```

2. Once the site is running at `http://localhost:3000`, open a **second** terminal window and run:

   ```bash
   cloudflared tunnel --url http://localhost:3000 --http-host-header localhost:3000
   ```

3. After a few seconds, `cloudflared` prints a box containing your public URL:

   ```
   +--------------------------------------------------------------------------------------------+
   |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
   |  https://lunch-strip-cats-nimble.trycloudflare.com                                         |
   +--------------------------------------------------------------------------------------------+
   ```

   Copy that URL and send it to the people you want to share the site with.

::: tip
If your `app.js` sets the `baseUrl` option, links on your pages point to that address instead of the tunnel. Follow the `APOS_BASE_URL` steps in the Astro section below to override it while you share.
:::

## Sharing an ApostropheCMS + Astro project

An ApostropheCMS + Astro project runs two applications, but the Astro starter kits start both with a single command. Visitors and editors only ever talk to the Astro frontend, so that's the one to tunnel. You don't need a separate tunnel for the ApostropheCMS backend. Astro passes logins, editing, API calls, and uploaded media through to it. See [How requests flow](/guide/hosting-astro.md#how-requests-flow) for details.

The Astro starter kits set `baseUrl` to `http://localhost:4321` in `backend/app.js`, and ApostropheCMS uses it to build the links on every page. For a viewer on another computer, those links would point at their own machine. To fix that, start the tunnel first, then start your site with the tunnel's URL in the `APOS_BASE_URL` environment variable, which overrides `baseUrl`.

1. In a terminal window, start the tunnel:

   ```bash
   cloudflared tunnel --url http://localhost:4321 --http-host-header localhost:4321
   ```

2. Copy the `trycloudflare.com` URL that `cloudflared` prints.

3. Open a **second** terminal window. In the root of your project, start both applications with that URL as `APOS_BASE_URL`. If your site is already running, stop it with `Control-C` first.

   On macOS or Linux:

   ```bash
   APOS_BASE_URL=https://lunch-strip-cats-nimble.trycloudflare.com npm run dev
   ```

   On Windows, in PowerShell:

   ```bash
   $env:APOS_BASE_URL="https://lunch-strip-cats-nimble.trycloudflare.com"; npm run dev
   ```

4. Once the site is running, share the `trycloudflare.com` URL.

Each new tunnel has a new URL, so repeat these steps every time you start one. When you go back to working only on your own computer, start the site with a plain `npm run dev` in a new terminal window.

## Why `--http-host-header`?

Without this option, your development server receives requests addressed to the `trycloudflare.com` hostname. Vite, which powers the development server in both kinds of project, rejects requests for hostnames it doesn't recognize. In an Astro project the whole page is blocked. In an ApostropheCMS project the page loads, but its scripts and stylesheets are blocked, so it appears unstyled and the editing interface doesn't work. `--http-host-header` tells `cloudflared` to present each request as if it were addressed to `localhost`, which the development server accepts.

## Stopping the tunnel

Press `Control-C` in the terminal window running `cloudflared` to close the tunnel. The URL stops working right away. Press `Control-C` in the other window to stop your site.

Each time you start a new tunnel, you get a new random URL, so you'll need to share the new one.

## Keeping it safe

A quick tunnel isn't password-protected. Anyone who has the URL can reach your site for as long as the tunnel is running. The URL is random and hard to guess, but treat it like a shared link to a private document:

- Share the URL only with people who should see the site, and stop the tunnel when you're done.
- Give every user account on the site, especially admin accounts, a strong password. Anyone with the URL can reach the login page.
- Use test content rather than real customer data or anything confidential.

## Limitations

Quick tunnels are meant for testing and sharing, so Cloudflare applies some limits:

- **Temporary URLs.** The URL changes every time you start `cloudflared`.
- **Your computer must stay on.** If your computer sleeps, loses its connection, or you stop `npm run dev`, the site goes offline for everyone.
- **Limited traffic.** A quick tunnel handles a limited number of simultaneous requests. It's fine for a few reviewers, not for load testing or a public launch.
- **No server-sent events.** Features that rely on server-sent events don't work through a quick tunnel.

If `cloudflared` reports that it can't start a quick tunnel, check for a `config.yaml` file in the `.cloudflared` folder in your home directory. Quick tunnels don't run while that file exists. Rename it temporarily, or run the tunnel from a configuration that doesn't use it.

For a stable URL with access controls, Cloudflare also offers named tunnels tied to a Cloudflare account and your own domain. See [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) in Cloudflare's documentation.
