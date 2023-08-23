---
prev: false
next: false
---
# Windows development environment

## Installing Windows Subsystem for Linux

As Microsoft says, ["When working with JavaScript-based frameworks in a professional capacity, we recommend WSL..."](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/windows-or-wsl#install-on-windows-subsystem-for-linux) So we'll start by installing WSL (Windows Subsystem for Linux). WSL allows us to run many Linux applications without change on any up-to-date Windows 10 or Windows 11 system. Crucially, we can follow most Linux- and Mac-oriented ApostropheCMS documentation without change. There are just a few things to note, which we'll cover here.

::: warning
We recommend that you use WSL2. If you have WSL1, here are [Microsoft's upgrade instructions.](https://docs.microsoft.com/en-us/windows/wsl/install#upgrade-version-from-wsl-1-to-wsl-2) As described in that article, you may need to take care of several steps including a kernel update and enabling virtualization in your BIOS. The correct steps to enable virtualization depend on your machine.

If you have never installed WSL before, WSL2 will be the default. The rest of this article assumes a first-time install of WSL2.
:::

First, you must [install WSL according to the documentation](https://docs.microsoft.com/en-us/windows/wsl/install). In particular we strongly recommend that you [install Ubuntu 20.04 LTS, which can also be done from the Windows app store](https://apps.microsoft.com/store/detail/ubuntu-2004/9N6SVWS3RX71?hl=en-us&gl=US). This method was tested for this article. Newer versions of Ubuntu might not support everything covered here, and 20.04 is supported until 2030.

Second, launch Ubuntu 20.04 from the Start menu to access the Linux shell prompt. If you did not install Ubuntu via the Windows Store, you might need to access the prompt a different way, for instance by launching Powershell and typing `wsl`.

::: info
From here on out, all commands are intended to be typed at the Ubuntu 20.04 shell prompt, not the regular Windows command or Powershell prompt.
:::

Next, install [nvm](https://github.com/nvm-sh/nvm). `nvm` is a great little utility that lets us run any version of Node.js we want without fussing with operating system packages. The correct command for installation changes over time, so [follow the official nvm installation guide](https://github.com/nvm-sh/nvm#installing-and-updating). **Do not** follow nvm installation guides meant for the Windows command prompt. We want the plain vanilla instructions.

::: warning
You will need to exit the Ubuntu 20.04 window and open a new one after you complete the `nvm` installation step above. Otherwise, the `nvm install` command in the next step will cause a Command Not Found error.
:::

Now, install and start Node.js 16.x with this command:

```bash
nvm install 16
```

In the future, you can just type:

```bash
nvm use 16
```

::: warning
If this produces a "command not found" error, you most likely did not install `nvm` yet, or you did not restart your Ubuntu 20.04 window after installing `nvm`.
:::

Now we'll need to install the MongoDB database. While MongoDB does not officially support this, it works fine for development purposes, and you'll be deploying to Linux in production later anyway. The easiest way to do this is to skip the official MongoDB Community Edition (tricky to install) and Ubuntu packages (out of date), and instead install the convenient `m` utility. `m` lets you access any version of MongoDB any time you need it:

```bash
npm install -g m
```

When that command completes, possibly with a harmless warning or two, it's time to activate the version of MongoDB we want:

```bash
m 5.0
```

You'll be asked to confirm. If you see this message at the end:

```
Installation to /home/apostrophe/.local/bin complete!

==> WARNING: $PATH does not include /home/apostrophe/.local/bin
```

Then you should edit your `~/.bashrc` file, like this:

```bash
code ~/.bashrc
```

::: warning
If you get a `command not found` error, make sure you have Visual Studio Code installed on your Windows machine. Then launch Visual Studio Code, click on the Extensions icon, and click any "reload required" icon that appears. Then restart your Ubuntu shell window and try the command again. Alternatively, feel free to use the Linux command line editor of your choice.
:::

At the end of `~/.bashrc`, add this line:

```bash
export PATH=$PATH:~/.local/bin
```

And be sure to save and close the file.

Then just **exit your Ubuntu shell window and open a new one.** This is the simplest way to reload `~/.bashrc`, which contains commands to be run on every shell launch.

If you do restart your shell window, make sure you run `m` again:

```bash
m 5.0
```

## Creating a data folder for MongoDB

MongoDB needs a place to store your database, and the default is a system folder. For development purposes, we want to leave system folders alone. So let's create our own place for it:

```bash
mkdir -p ~/mongodb-data/5.0
```

## Launching MongoDB (every time you start work)

Now we're ready to launch MongoDB. We'll do this at the start of every session of work with ApostropheCMS:

```bash
mongod --dbpath=/home/apostrophe/mongodb-data/5.0
```

::: warning
Since `--dbpath` doesn't understand `~` as a shortcut for "my home directory" in WSL2, we've used the full path to our home directory here. In this case, we chose the username `apostrophe` when we set up Ubuntu 20.04. If you're not sure what username you created when you installed Ubuntu 20.04, type `echo $HOME` to find out.
:::

You'll see quite a bit of output, and the command prompt should **not** return. It should just keep running — and that's exactly what we want. You should **leave it running in this window for as long as you're working with ApostropheCMS, and open another, separate Ubuntu Window** to continue your work.

::: warning
If the command prompt does return, and you see a message like `fatal assertion`, then `mongod` was unable to start. Most likely you previously tried to run MongoDB in another way, and you need to fix a permissions problem and try again, like this:

```bash
sudo rm /tmp/mongodb-27017.sock
mongod --dbpath=/home/apostrophe/mongodb-data/5.0
```

You should only have to do this once to clean up the mess. In the future, **just remember: don't use `sudo`, you don't need it and it only makes a mess.** If there's an exception we'll explicitly show that in our tutorials.

Another possibility is that you tried to write `--dbpath=~/mongodb-data/5.0`. Again, you'll need to substitute your home directory name manually for the `~`. Use `echo $HOME` to find your home directory.

Finally, one more possibility: You might already be running MongoDB for Windows! It should actually be OK to do that, in which case you don't need to run it under WSL — Apostrophe running under WSL should still connect to MongoDB for Windows just fine — but if you have any difficulties with that version, shut down or uninstall MongoDB for Windows and follow the steps above.
:::

::: info
If typing this every time seems like a pain, try adding this line to your `.bashrc` file:

```bash
alias start-mongo="mongod --dbpath=/home/apostrophe/mongodb-data/5.0"
```

Save and close the file, restart your shell, and you can just type:

```bash
start-mongo
```
:::

## Installing ApostropheCMS

Now we're ready to install the Apostrophe CLI (Command Line Interface)! To get started, **open a second Ubuntu 20.04 window**, and in that Window type:

```bash
nvm use 16
```

Now you're ready to use the current stable version of Node.js in this shell.

And from here, we can [follow the regular ApostropheCMS setup guide, just like MacOS and Linux users do](https://v3.docs.apostrophecms.org/guide/setting-up.html). **You can skip the part about requirements, we already have MongoDB and Node.js.** Everything else is the same — just remember to keep `mongod` running and do your work inside the Ubuntu shell prompt, and you'll be good to go.
