# Windows development environment

## Installing Windows Subsystem for Linux

As Microsoft says, ["When working with JavaScript-based frameworks in a professional capacity, we recommend WSL..."](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/windows-or-wsl#install-on-windows-subsystem-for-linux) So we'll start by installing WSL (Windows Subsystem for Linux). WSL allows us to run many Linux applications without change on any up-to-date Windows 10 or Windows 11 system. Crucially, we can follow most Linux- and Mac-oriented ApostropheCMS documentation without change. There are just a few things to note, which we'll cover here.

::: warning
We recommend that you use WSL2. If you have WSL1, here are [Microsoft's upgrade instructions.](https://docs.microsoft.com/en-us/windows/wsl/install#upgrade-version-from-wsl-1-to-wsl-2) As described in that article, you may need to take care of several steps including a kernel update and enabling virtualization in your BIOS. The correct steps to enable virtualization depend on your machine.

If you have never installed WSL before, WSL2 will be the default. The rest of this article assumes a first-time install of WSL2.
:::

First, you must [install WSL according to the documentation](https://docs.microsoft.com/en-us/windows/wsl/install). In particular we strongly recommend that you [install Ubuntu 22.04 LTS, which can also be done from the Windows app store](https://apps.microsoft.com/store/detail/ubuntu-2004/9N6SVWS3RX71?hl=en-us&gl=US). This method was tested for this article. Newer versions of Ubuntu might not support everything covered here, and 22.04 is supported without charge until 2027.

Second, launch Ubuntu 22.04 from the Start menu to access the Linux shell prompt. If you did not install Ubuntu via the Windows Store, you might need to access the prompt a different way, for instance by launching Powershell and typing `wsl`.

::: note
From here on out, all commands are intended to be typed at the Ubuntu 22.04 shell prompt, not the regular Windows command or Powershell prompt.
:::

Next, install [nvm](https://github.com/nvm-sh/nvm). `nvm` is a great little utility that lets us run any version of Node.js we want without fussing with operating system packages. The correct command for installation changes over time, so [follow the official nvm installation guide](https://github.com/nvm-sh/nvm#installing-and-updating). **Do not** follow nvm installation guides meant for the Windows command prompt. We want the plain vanilla instructions.

::: warning
You will need to exit the Ubuntu 22.04 window and open a new one after you complete the `nvm` installation step above. Otherwise, the `nvm install` command in the next step will cause a Command Not Found error.
:::

Now, install and start Node.js 18.x with this command:

```bash
nvm install 18
```

In the future, you can just type:

```bash
nvm use 18
```

::: warning
If this produces a "command not found" error, you most likely did not install `nvm` yet, or you did not restart your Ubuntu 22.04 window after installing `nvm`.
:::

Now we'll need to install the MongoDB database. While MongoDB is not officially supported on WSL,
the regular Linux install commands work fine for development purposes.

Because we'll be running several commands as root, we'll use `sudo bash` to switch to the root user first:

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc |  gpg --dearmor | sudo tee /usr/share/keyrings/mongodb.gpg > /dev/null
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install mongodb-org
```

These commands will install MongoDB 6.x.

When that command completes, possibly with a harmless warning or two, it's time to start MongoDB
and ensure it always runs when restarting WSL:

```
systemctl enable mongod
systemctl start mongod
```

## Installing ApostropheCMS

Now we're ready to install the Apostrophe CLI (Command Line Interface)! To get started, **open a second Ubuntu 22.04 window**, and in that Window type:

```bash
nvm use 18
```

Now you're ready to use the current stable version of Node.js in this shell.

And from here, we can [follow the regular ApostropheCMS setup guide, just like MacOS and Linux users do](https://v3.docs.apostrophecms.org/guide/setting-up.html). **You can skip the part about requirements, we already have MongoDB and Node.js.** Everything else is the same — just remember to keep `mongod` running and do your work inside the Ubuntu shell prompt, and you'll be good to go.
