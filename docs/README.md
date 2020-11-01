---
title: 'A3 Docs Home'
---

> Apostrophe 3 is currently in its alpha 1 release. You should build production projects with [Apostrophe 2](https://docs.apostrophecms.org).

# Introduction

This document is for Apostrophe 2.x developers who wish to try out Apostrophe 3.x and give feedback. We look forward to your input!

## Getting Started

Grab the boilerplate project and give your project a name of its own. We're assuming `myproject` here. Replace that with your own project name wherever you see it. Use a short name with only letters, digits and dashes.

```
git clone https://github.com/apostrophecms/a3-boilerplate myproject
cd myproject
npm install
node app @apostrophecms/user:add admin
npm run dev
```

> Be sure to give the admin user a password when prompted.

Now you can [view the site here on your own computer](http://localhost:3000).

To edit the site, [log in here](http://localhost:3000/login). Click on the text on the page to start editing.

> You don't have to "save" anything because your changes are saved right away. However we plan to introduce a more intentional save button in alpha 2.

## Making your project your own

First **edit `app.js` and change `shortName` to `myproject`** (replace with the folder name of your own project).

Then, to push your project to your own github, cut it loose from ours:

```
git remote rm origin
```

Now create a `myproject` repo on your own github account and follow their directions to "push an existing repository from the command line."
