---
title: "Getting Started"
---

## System Requirements

While Apostrophe 3 introduces a number of new features and APIs, we still rely on the same tools. However, you do need more modern versions of a few of them. As always, we recommend installing the following with [Homebrew](https://brew.sh/) on macOS. If you're on Linux, you should use your package manager (`apt` or `yum`). If you're on Windows, we recommend the Windows Subsystem for Linux.

| Software | Minimum Version | Notes
| ------------- | ------------- | -----
| Git  | Any
| Xcode  | Current | Only needed on macOS
| Node.js | 10.x | Or better 
| npm  | 6.x  | Or better
| MongoDB  | 3.6  | Or better
| Imagemagick (optional.md)  | Any | GIF support, faster image uploads

## A3 Boilerplate

To get started, clone the Apostrophe 3 Boilerplate project and give your project a name of its own. Legal names consist of letters, digits and dashes. We're assuming **myproject** as a name here. When prompted, set a password for the admin user.

```bash
git clone https://github.com/apostrophecms/a3-boilerplate myproject
cd myproject
node app @apostrophecms/user:add admin
```

Now run:

```bash
npm install
npm run dev
```

Once installed, the application will run at [http://localhost:3000/](http://localhost:3000/), and you will be able to login with the admin credentials you provided in the previous step at [http://localhost:3000/login](http://localhost:3000/login).

::: tip Note:
When you make changes, the boilerplate project will automatically restart and refresh the browser. If you get a "port in use" error in your terminal, press control-C and start npm run dev again. We're tracking down how to reliably reproduce this issue.*
:::