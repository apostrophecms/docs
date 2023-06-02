# Using pnpm

pnpm and npm are both package managers for JavaScript projects, but they have different approaches to managing dependencies. Node comes pre-packaged with npm, but PnPm presents a number of advantages such as better security, and monorepo support.

When creating a project from scratch, Apostrophe will attempt to automatically detect the use of 


When using the Apostrophe CLI tool to create a new project npm will be used by default to install your dependencies. This means that if you create a project using the CLI you will need to convert it to utilize pnpm

Be sure to install with peer dependencies - `pnpm install --config.auto-install-peers=true`.