---
videoList:
  - id: 'nTjDATerqEg'
    title: 'Setup for MacOS'
    link: '#setting-up-your-environment'
  - id: 'Ep_FvRt8thI'
    title: 'Setup for Windows and Linux'
    link: '#setting-up-your-environment'
---

# Setting Up Your Environment

::: tip Howdy! 👋🏻
This documentation is available in textual and video forms. Watch the video for your operating system, or continue reading if you prefer. Of course, you can also do both!

**Note:** The videos cover installing Node.js and getting a terminal ready on each OS. The project-creation walkthrough below reflects the current installer, which has changed since these videos were recorded — follow the text for that part. Updated videos are coming.
:::

<iframe src="https://www.youtube.com/embed/nTjDATerqEg?si=ItkK3gz4-CJmI1WI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
<iframe src="https://www.youtube.com/embed/Ep_FvRt8thI?si=XEThrEvtaNyTdKo7" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Overview
This article covers the first steps to get started. We're going to make sure your workstation is ready for development and walk through creating a project with the guided installer. ApostropheCMS development works on Windows, macOS, and Linux.

::: info 📌 Windows Development Options
Windows developers have two options:

**Direct Windows Development (Git Bash + NVM for Windows)**
- Works directly on Windows with Git Bash (included with [Git for Windows](https://git-scm.com/download/win)) as your terminal
- Quick to set up and familiar if you're used to Windows
- All instructions on this page apply unless specifically noted
- We strongly recommend using Git Bash - npm does not work out of the box in PowerShell (this is not an ApostropheCMS issue, but a general npm limitation on Windows). You can pursue PowerShell if you strongly prefer it, but Git Bash ensures the best compatibility.

**Windows Subsystem for Linux (WSL 2)**
- Provides a Linux environment within Windows
- More similar to typical production server environments
- May have better compatibility with some native Node modules
- More predictable behavior with `npm link` and shell scripts
- [Installation guide](https://learn.microsoft.com/en-us/windows/wsl/install)

Both approaches are fully supported. Choose based on your preference and workflow.
:::

## Requirements

Let's get started with what you will need to have installed on your machine to run a project locally:

### Node.js 22+

ApostropheCMS requires Node.js 22 or later. We recommend running the current Active LTS release — Node 24 at the time of writing — rather than the minimum. Node 22 is in maintenance support until April 2027, so it still works, but new projects should start on the current LTS.

Node.js is a JavaScript runtime and it runs server-side JS, including the Apostrophe app. npm is automatically included with Node. While you can download and install these directly from https://nodejs.org, we highly encourage using a Node Version Manager to allow you to switch easily between Node and npm versions.

**For macOS, Linux, and WSL:**
Use NVM (Node Version Manager). You can find the installation instructions [here](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating).

**For Windows (native):**
Use NVM for Windows. Installation instructions are available [here](https://github.com/coreybutler/nvm-windows#installation--upgrades).

Once installed for any operating system, you can switch between different versions of Node and npm:

```bash
$ nvm install 22
# and
$ nvm use 22
```

### Choosing your database

The installer will ask you to pick a database when you create a project — SQLite, MongoDB, or PostgreSQL. [Read about the tradeoffs](./choosing-a-database.md) if you're not sure which to choose.

::: tip
If you're not sure, don't worry about it. SQLite is the installer's recommended default and needs nothing installed locally — the database lives in a file inside your project.
:::

If you'd rather use MongoDB or PostgreSQL, install it locally first ([MongoDB instructions](./installing-mongodb-locally.md)), or point the installer at a managed/cloud instance (for example MongoDB Atlas) — you'll be asked for a connection string.

### A quick note on frontends

Every Apostrophe project needs the Apostrophe backend, but you get to choose how pages are rendered:

- **Apostrophe + Astro** — an [Astro](https://astro.build/) frontend consumes Apostrophe as a headless CMS over REST, while editors still get in-context editing. This is the installer's recommended default. See the [Astro essentials overview](./astro-essentials-overview.md) or the [Astro demo overview](./astro-demo-overview.md), and the [Astro tutorial series](/tutorials/astro/apostrophecms-and-astro.html) for a full walkthrough.
- **Apostrophe Standalone** — a traditional full-stack Apostrophe project, rendering [Nunjucks](./templating.md) or [JSX](./jsx-templates.md) templates directly, no separate frontend process.

Both are first-class, fully-supported paths. The installer asks which one you want as its very first real decision — see [Creating a project](#creating-a-project) below. The rest of this guide (modules, content types, schemas, and most of the backend Guide) applies identically either way; only templating and the front-end asset build differ between them.

## Creating a project

The easiest way to get started with Apostrophe is the guided installer. It asks a short series of questions, then clones a starter kit, installs dependencies, sets up your database, and creates your first admin user — all in one run. If you are not using SQLite or a managed instance like Atlas, make sure your local database server has been started before creating a project.

Run it with npm — no global install required:

```bash
npm create apostrophe@latest
```

If you already have the [Apostrophe CLI](https://www.npmjs.com/package/@apostrophecms/cli) installed globally (`npm install --location=global @apostrophecms/cli`), the same guided installer is available as `apos create`. The CLI also gives you shorter commands for other project tasks (adding module boilerplate, and more) once you're inside a project — it isn't required, but it's convenient.

::: warning
`apos add` scaffolds its templates as **Nunjucks** — you will get a `views/widget.html` or `views/page.html`. In a project using [JSX templates](/guide/jsx-templates.md), rename the generated file to `.jsx` and rewrite it as a function component before going further. Everything else the command generates — the module folder, `index.js`, and its registration — is unaffected.
:::

### What the installer asks

The installer walks through these steps, showing your progress as it goes (for example "Step 2/6"):

1. **Project name** — becomes both the folder name and the project's database short name. Letters, numbers, hyphens, and underscores only.
2. **How would you like to build?** — **Apostrophe + Astro** (recommended) or **Apostrophe Standalone**. This is the frontend decision described above.
3. **Choose a starting point** — **Essentials** (a clean slate with no sample content) or **Demo** (a working blog, widgets, and components already in place). Picking Demo asks one more question: whether to pre-fill the database with sample content.
4. **Choose a database** — SQLite, MongoDB, or PostgreSQL. Choosing MongoDB or PostgreSQL prompts for a connection string, which the installer verifies by actually connecting before moving on.
5. **Create your admin account** — a username or email and a password. This becomes your first login.
6. **Help us improve Apostrophe?** — an optional, anonymous telemetry opt-in (which starters and databases people choose, OS and Node version, and whether installs succeed — no content, no personal info). You can preview the exact payload before deciding, and change your answer later with `npm create apostrophe@latest -- telemetry on|off`. This step only appears the first time you run the installer; after that your preference is remembered. Set `APOS_TELEMETRY=0` to disable it outright.

The build type and starting point together resolve to one of four starter repositories — two Astro, two standalone:

| Build | Starting point | Repository | Overview guide |
|---|---|---|---|
| Apostrophe + Astro | Essentials | `starter-kit-astro-essentials` | [Astro essentials overview](./astro-essentials-overview.md) |
| Apostrophe + Astro | Demo | `astro-public-demo` | [Astro demo overview](./astro-demo-overview.md) |
| Apostrophe Standalone | Essentials | `starter-kit-essentials` | [Standalone essentials overview](./apostrophe-standalone-essentials-overview.md) |
| Apostrophe Standalone | Demo | `public-demo` | [Apostrophe demo overview](./apostrophe-demo-overview.md) |

("With sample content" reuses the same Demo repository with its database pre-seeded — it isn't a fifth repository.)

Before doing anything, the installer shows a summary of all your answers and asks **"Ready to create?"**. Answering no takes you back through the questions with your previous answers pre-filled, so you can adjust one thing without starting over.

### After it finishes

On success, the installer prints your next steps:

```bash
cd my-project
npm run dev
```

Then open the site (`http://localhost:4321` for Astro projects, `http://localhost:3000` for Standalone projects) and log in at `/login` with the admin account you just created.

### Running it without prompts

For CI or scripting, pass `--unattended` along with the required flags instead of answering prompts interactively:

```bash
npm create apostrophe@latest -- --unattended \
  --project-name=my-site --password=secret --telemetry=off
```

`--kit` (default `apostrophe-astro-demo`), `--db` (default `sqlite`), `--db-uri`, and `--username` (default `admin`) are all optional overrides. Run `npm create apostrophe@latest -- --help` for the full flag list.

::: info 📌 More detail on the installer, including its full architecture and telemetry payload, is documented [here](https://www.npmjs.com/package/create-apostrophe).
:::

## Creating a project without the installer

If you'd rather set things up by hand, or want to see what the installer does for you, you can clone a starter repository directly and skip the guided flow. Pick whichever of the four repositories from the table above matches what you want to build — this example uses the Astro Essentials kit:

```bash
git clone https://github.com/apostrophecms/starter-kit-astro-essentials apos-app
```

If you want to change the project directory name, please do so. We will continue referring to `apos-app`.

Open the `app.js` file in the root project directory. Find the `shortName` setting and change it to match your project (only letters, digits, hyphens and/or underscores). This will be used as the name of your database.

<AposCodeBlock>

```javascript
import apostrophe from 'apostrophe';

apostrophe({
  root: import.meta,
  shortName: 'apos-app', // 👈
  modules: {
  // ...
```
<template v-slot:caption>
app.js
</template>
</AposCodeBlock>

Excellent! Back in your terminal, we'll install dependencies:

```bash
npm install
```

Before starting up you'll need to create an admin-level user, either in your Atlas instance or local database, so that you can log in. After running the following command, Apostrophe will ask you to enter a password for this user.

Atlas Database
```bash
APOS_DB_URI="mongodb+srv://username:pa%24%24word@mycluster.1234x.mongodb.net/YOUR-PROJECT-NAME?retryWrites=true&w=majority" node app @apostrophecms/user:add my-user admin
# Replace `my-user` with the name you want for your first user.
```

OR

Local Database
```bash
node app @apostrophecms/user:add my-user admin
# Replace `my-user` with the name you want for your first user.
```

::: tip
* When using MongoDB Atlas, it's a good practice to enclose your entire connection string in quotes to prevent any issues with special characters. Also, use percent-encoding for special characters in your password.

* Consider exporting your `APOS_DB_URI` environment variable to make it available throughout your session. This approach helps in avoiding the repetition of the connection string and reduces the risk of errors.
:::

### Finishing touches

You should also update the [session secret for Express.js](https://github.com/expressjs/session?tab=readme-ov-file#secret) to a unique, random string. The starter project has a placeholder for this option already. If you do not update this, you will see a warning each time the app starts up.

<AposCodeBlock>

```javascript
export default {
  options: {
    session: {
      // If this still says `undefined`, set a real secret!
      secret: undefined
    }
  }
};
```
<template v-slot:caption>
modules/@apostrophecms/express/index.js
</template>
</AposCodeBlock>

### Starting up the website

Start the site with `npm run dev`. If you are using an Atlas instance you need to pass the connection string through the `APOS_DB_URI` environment variable or set the `uri` or other options of the `@apostrophecms/db` at project level. The app will then watch for changes in server code, rebuild as needed, then refresh the browser when it detects any. Astro-based starters serve the site on `http://localhost:4321`; Standalone starters serve it on `http://localhost:3000`. Log in with the username and password you created at `/login` on that same host and port.

::: tip
If you are starting the site in a production environment or do not want the process to watch for changes, start the site with `node app.js`.
:::

## Next steps

Now that Apostrophe is installed, you're ready to start building. Check out the [guide](/guide/modules.html) to learn about essential features with plenty of code examples — nearly all of it applies whether you chose Astro or Standalone. If you chose Astro, the [Astro essentials overview](./astro-essentials-overview.md) or [Astro demo overview](./astro-demo-overview.md) is the best next read, and the [Astro tutorial series](/tutorials/astro/apostrophecms-and-astro.html) walks through building pages, pieces, and widgets from scratch in that architecture. If you chose Standalone, jump to our general [tutorial series](/tutorials/introduction.html) to build a site from scratch. If you are looking to explore Apostrophe's inner workings peruse the [reference guide](/reference/glossary.md).
