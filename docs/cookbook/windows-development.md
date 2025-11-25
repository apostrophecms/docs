---
next:
  text: 'Code Organization - Modules'
  link: '/guide/modules.html'
---
# Windows Development with WSL 2 (Optional)

::: info 📌 Multiple Windows Development Options

This guide covers setup using Windows Subsystem for Linux (WSL 2). If you prefer to develop directly on Windows using Git Bash and NVM for Windows, see our main [development setup guide](/guide/development-setup.md) instead. Both approaches are fully supported.
:::

## Why Choose WSL 2?

WSL 2 provides a Linux environment within Windows that closely matches typical production deployment environments. Benefits include:

- Similar environment to Linux production servers
- Better compatibility with some native Node modules
- More predictable behavior with tools like `npm link`
- Easier to follow Linux-oriented documentation and tutorials

If these benefits align with your workflow, follow this guide for complete WSL 2 setup instructions.

## Installing Windows Subsystem for Linux

We'll start by installing WSL (Windows Subsystem for Linux). WSL allows you to run Linux applications without change on any up-to-date Windows 10 or Windows 11 system.

::: warning
We recommend that you use WSL2. If you have WSL1, here are [Microsoft's upgrade instructions.](https://docs.microsoft.com/en-us/windows/wsl/install#upgrade-version-from-wsl-1-to-wsl-2) As described in that article, you may need to take care of several steps including a kernel update and enabling virtualization in your BIOS. The correct steps to enable virtualization depend on your machine.

If you have never installed WSL before, WSL2 will be the default. The rest of this article assumes a first-time install of WSL2.
:::

First, you must [install WSL according to the documentation](https://docs.microsoft.com/en-us/windows/wsl/install). In particular, we strongly recommend that you [install Ubuntu 22.04 LTS, which can also be done from the Windows app store](https://apps.microsoft.com/store/detail/ubuntu-2004/9N6SVWS3RX71?hl=en-us&gl=US). This method was tested for this article. Newer versions of Ubuntu might not support everything covered here, and 22.04 is supported without charge until 2027.

Second, launch Ubuntu 22.04 from the Start menu to access the Linux shell prompt. If you did not install Ubuntu via the Windows Store, you might need to access the prompt a different way, for instance by launching Powershell and typing `wsl ~`.

::: info
From here on out, all commands are intended to be typed at the Ubuntu 22.04 shell prompt, not the regular Windows command or Powershell prompt.
:::

## Installing Node.js and npm

Next, install [nvm](https://github.com/nvm-sh/nvm). `nvm` is a great little utility that lets us run any version of Node.js we want without fussing with operating system packages. The correct command for installation changes over time, so [follow the official nvm installation guide](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating). **Do not** follow nvm installation guides meant for the Windows command prompt. We want the plain vanilla Linux instructions.

::: warning
You will need to exit the Ubuntu 22.04 window and open a new one after you complete the `nvm` installation step above. Otherwise, the `nvm install` command in the next step will cause a Command Not Found error.
:::

Now, install and start Node.js 18.x with this command:

```bash
nvm install 22
```

In the future, you can just type:

```bash
nvm use 22
```

::: warning
If this produces a "command not found" error, you most likely did not install `nvm` yet, or you did not restart your Ubuntu 22.04 window after installing `nvm`.
:::

## Installing MongoDB

Now we'll need to provide a connection to a MongoDB instance. We can either use Atlas, create a Docker container to serve our database by following these [instructions](/guide/dockerized-mongodb.md), or install the MongoDB community server.

::: info
Follow these instructions to install the community server locally. If using Atlas or Docker, skip to the next [section](/cookbook/windows-development.md#installing-apostrophecms).
:::

While MongoDB is not officially supported on WSL, the regular Linux install commands work fine for development purposes.

First, install the prerequisites if they're not already available:
```bash
sudo apt-get install gnupg curl
```

Now we'll import the MongoDB public GPG key and set up the repository:
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
  --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

sudo apt-get update
sudo apt-get install -y mongodb-org
```
These commands will install MongoDB 8.0.
When that command completes, possibly with a harmless warning or two, we're ready to set up a data folder and launch MongoDB.

### Creating a data folder for MongoDB

MongoDB needs a place to store your database, and the default is a system folder. For development purposes, we want to leave system folders alone. So let's create our own place for it:

```bash
mkdir -p ~/mongodb-data/8.0
```

### Launching MongoDB (every time you start work)

Now we're ready to launch MongoDB. We'll do this at the start of every session of work with ApostropheCMS:

```bash
mongod --dbpath=/home/apostrophe/mongodb-data/8.0
```

::: warning
Since `--dbpath` doesn't understand `~` as a shortcut for "my home directory" in WSL2, we've used the full path to our home directory here. In this case, we chose the username `apostrophe` when we set up Ubuntu 22.04. If you're not sure what username you created when you installed Ubuntu 22.04, type `echo $HOME` to find out.
:::

You'll see quite a bit of output, and the command prompt should **not** return. It should just keep running — and that's exactly what we want. You should **leave it running in this window for as long as you're working with ApostropheCMS, and open another, separate Ubuntu Window** to continue your work.

::: warning
If the command prompt does return, and you see a message like `fatal assertion`, then `mongod` was unable to start. Most likely you previously tried to run MongoDB in another way, and you need to fix a permissions problem and try again, like this:

```bash
sudo rm /tmp/mongodb-27017.sock
mongod --dbpath=/home/apostrophe/mongodb-data/8.0
```

You should only have to do this once to clean up the mess. In the future, **just remember: don't use `sudo`, you don't need it and it only makes a mess.** If there's an exception we'll explicitly show that in our tutorials.

Another possibility is that you tried to write `--dbpath=~/mongodb-data/8.0`. Again, you'll need to substitute your home directory name manually for the `~`. Use `echo $HOME` to find your home directory.
:::

::: info
If typing this every time seems like a pain, try adding this line to your `.bashrc` file:

```bash
alias start-mongo="mongod --dbpath=/home/apostrophe/mongodb-data/8.0"
```

Save and close the file, restart your shell, and you can just type:

```bash
start-mongo
```
:::

## Working in WSL: Best Practices

When developing ApostropheCMS and Node.js projects in WSL, it's crucial to choose the right location for your project files. Follow these best practices:

### 1. Use the Linux filesystem

Create and work on your projects within your WSL home directory (e.g., `/home/yourusername/`). This approach offers several benefits:

- Optimal performance for operations like `npm install`, `git` operations, and asset rebuilding
- Consistent line-ending format (LF), avoiding potential issues with mixed line endings
- Proper case-sensitivity, matching the behavior of most production environments
- Correct file permissions, preventing potential problems with script execution and file access

### 2. Avoid Windows-mounted drives

While it's possible to access Windows drives (e.g., `C:` or `D:`) through `/mnt/c` or `/mnt/d` in WSL, working directly from these locations can significantly slow down development tasks.

### 3. Starting in the right place

When beginning a new project or working on an existing one:

- Open your WSL terminal
- Navigate to your home directory: `cd ~`
- Create or access your project folder from here

### 4. Using Visual Studio Code

If you're using VS Code:

- Navigate to your project folder in the WSL terminal
- Type `code .` to open VS Code with the correct WSL context
- VS Code will handle the integration between Windows and WSL

### 5. Accessing Windows files when needed

You can still access your Windows files at `/mnt/c/`, `/mnt/d/`, etc., but use this for referencing files, not as your primary development location.

## Installing ApostropheCMS

Now we're ready to install the Apostrophe CLI (Command Line Interface)! To get started, **open a second Ubuntu 22.04 window**, and in that Window type:

```bash
nvm use 22
```

Now you're ready to use the current stable version of Node.js in this shell.

And from here, we can [follow the regular ApostropheCMS setup guide](/guide/development-setup.md#installing-the-apostrophe-cli). **You can skip the requirements section, since we already have MongoDB and Node.js installed.** Everything else is the same — just remember to keep `mongod` running and do your work inside the Ubuntu shell prompt, and you'll be good to go.

::: warning
One more quick reminder: be sure to **leave `mongod` running in a separate Ubuntu window** while you work with Apostrophe.
:::

## Next Steps

Continue with the main [development setup guide](/guide/development-setup.md#creating-a-project) to create your first ApostropheCMS project.