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
sudo bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc |  gpg --dearmor | sudo tee /usr/share/keyrings/mongodb.gpg > /dev/null
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install mongodb-org
# Stop being root! It's much safer not to be root all the time
exit
```

These commands will install MongoDB 6.x.

When that command completes, possibly with a harmless warning or two, we're ready to
set up a data folder and launch MongoDB.

## Creating a data folder for MongoDB

MongoDB needs a place to store your database, and the default is a system folder. For development purposes, we want to leave system folders alone. So let's create our own place for it:

```bash
mkdir -p ~/mongodb-data/6.0
```

## Launching MongoDB (every time you start work)

Now we're ready to launch MongoDB. We'll do this at the start of every session of work with ApostropheCMS:

```bash
mongod --dbpath=/home/apostrophe/mongodb-data/6.0
```

::: warning
Since `--dbpath` doesn't understand `~` as a shortcut for "my home directory" in WSL2, we've used the full path to our home directory here. In this case, we chose the username `apostrophe` when we set up Ubuntu 22.04. If you're not sure what username you created when you installed Ubuntu 22.04, type `echo $HOME` to find out.
:::

You'll see quite a bit of output, and the command prompt should **not** return. It should just keep running — and that's exactly what we want. You should **leave it running in this window for as long as you're working with ApostropheCMS, and open another, separate Ubuntu Window** to continue your work.

::: warning
If the command prompt does return, and you see a message like `fatal assertion`, then `mongod` was unable to start. Most likely you previously tried to run MongoDB in another way, and you need to fix a permissions problem and try again, like this:

```bash
sudo rm /tmp/mongodb-27017.sock
mongod --dbpath=/home/apostrophe/mongodb-data/6.0
```

You should only have to do this once to clean up the mess. In the future, **just remember: don't use `sudo`, you don't need it and it only makes a mess.** If there's an exception we'll explicitly show that in our tutorials.

Another possibility is that you tried to write `--dbpath=~/mongodb-data/6.0`. Again, you'll need to substitute your home directory name manually for the `~`. Use `echo $HOME` to find your home directory.
:::

::: note
If typing this every time seems like a pain, try adding this line to your `.bashrc` file:

```bash
alias start-mongo="mongod --dbpath=/home/apostrophe/mongodb-data/6.0"
```

Save and close the file, restart your shell, and you can just type:

```bash
start-mongo
```
:::

## Installing ApostropheCMS

Now we're ready to install the Apostrophe CLI (Command Line Interface)! To get started, **open a second Ubuntu 22.04 window**, and in that Window type:

```bash
nvm use 18
```

Now you're ready to use the current stable version of Node.js in this shell.

And from here, we can [follow the regular ApostropheCMS setup guide, just like MacOS and Linux users do](https://v3.docs.apostrophecms.org/guide/setting-up.html). **You can skip the part about requirements, we already have MongoDB and Node.js.** Everything else is the same — just remember to keep `mongod` running and do your work inside the Ubuntu shell prompt, and you'll be good to go.

::: warning
One more quick reminder: be sure to **leave `mongod` running in a separate Ubuntu window** while you work with Apostrophe.
:::
