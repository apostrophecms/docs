---
title: "Starting Your Project"
---

# Starting Your Project

To get started, clone the Apostrophe 3 Boilerplate project and give your project a name of its own. Legal names consist of letters, digits and dashes. We're assuming **myproject** as a name here.

```bash
git clone https://github.com/apostrophecms/a3-boilerplate myproject
cd myproject
node app @apostrophecms/user:add admin
```

::: tip Note: 
When prompted, be sure to set a password for the admin user.
:::

Now run:

```bash
npm install
npm run dev
```

Once installed, the application will run at [http://localhost:3000/](http://localhost:3000/), and you will be able to login with the admin credentials you provided in the previous step at [http://localhost:3000/login](http://localhost:3000/login).

When you make code changes the boilerplate project will automatically restart and refresh the browser. If you get a "port in use" error, press control-C and start `npm run dev` again. We're tracking down how to reliably reproduce this issue.* 

::: tip Note:
If you want to push this project to your own github repository, first create the new repository on github. Then remove ours from your project and create your own:

```bash
rm -rf .git
git init
```

Now you can follow github's instructions to "push an existing repository."
:::
