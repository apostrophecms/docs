---
title: "Upgrading"
---

# Upgrading from 3.0.0-alpha.1

Following version `3.0.0-alpha.1` we will use simply the npm tag for versions in the boilerplate for versions prior to the full release, e.g., `alpha`, `beta`. If you downloaded the boilerplate before the `3.0.0-alpha.2` release:

* Open `package.json`
* Change `"apostrophe": "3.0.0-alpha.1"` to `"apostrophe": "alpha"`
* Run `npm install`

This can be updated to `beta` when a beta release is available.

After the final release you'll be able to set your dependency to just `^3.0.0`, and then you will be able to use `npm update` normally.

# Upgrading from 2.x

Upgrading from 2.x will be possible in the final, stable release of A3. We will provide content migration tools, and eventually code migration tools as well. Certainly some effort will be required from developers to complete a migration from A2 to A3, however we are committed to making this process as smooth as possible. In the meantime, A2 is a long term support (LTS) release we are standing behind through 2023.
