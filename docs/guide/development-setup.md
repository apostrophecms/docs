# Setting Up Your Environment

## Overview
In this tutorial, we're going to make sure your workstation is ready for development and give an overview of the Apostrophe CLI. While these steps will work directly for Mac OS and many Linux distributions, Windows OS users will need to [install WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install) first. **Importantly**, for both WSL2 and other Linux users we recommend checking to make sure that the Linux distribution you are installing or using is supported by the [MongoDB Community Edition](https://www.mongodb.com/docs/v6.0/administration/install-on-linux/). Alternatively, you can also elect to install and use Docker for running the [MongoDB server](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-community-with-docker/), which is OS agnostic.

## Requirements

Let's get started with what you will need to have installed on your machine to run a project locally:


### 1. Node.js 18+/ npm<br>

Node.js is a JavaScript runtime and it runs server-side JS, including the Apostrophe app. npm is automatically included with Node. You can download and install these at https://nodejs.org. However, we (and indeed Microsoft) highly encourage the use of NVM to allow you to switch easily between Node and npm versions. You can find the installation instructions [here](https://github.com/nvm-sh/nvm#installing-and-updating).

⚠️ NVM is only available for Linux / Mac OS / Windows WSL.

Once installed, you can switch between different versions of Node and npm by using

```
$ nvm install 18
# and
$ nvm use 18
```
See the `nvm` page for more options.
