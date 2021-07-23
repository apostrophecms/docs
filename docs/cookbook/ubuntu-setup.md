# Ubuntu hosting setup

## Setting up the Ubuntu VPS

We'll start off by creating an Ubuntu VPS on AWS Lightsail. There are many services to use for hosting an Ubuntu VPS and the rest of the recipe is platform-agnostic.

1. In an [AWS Lightsail account](https://lightsail.aws.amazon.com), log in and  create an **Ubuntu 20.04 LTS** ("OS Only") instance. You need at least 1GB of RAM. We suggest 2GB to be safe.
   - There is a step on this first page to select or add an SSH key to connect securely from your computer. Follow Lightsail's directions to do this.
2. Completely any additional configurations you want, then **create the instance**. Once the instance is created, click on it to continue configuration.
3. On the "Networking" tab, you should see that the SSH and HTTP ports are already open. In addition, **open the HTTPS port** by clicking "Add rule" and selecting "HTTPS." You need this for `https://` connections.
   - Wait a couple minutes even after it says it's ready, to be sure it will accept your SSH connection.
4. SSH to your server's `ubuntu` account, according to the Lightsail instructions. This account has `sudo` privileges so you can take care of tasks that require root access.
5. **Install MongoDB Community Edition.**  Instead follow the [official instructions for installing MongoDB Community Edition on Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/).
   - **Be sure not to miss the command `sudo systemctl enable mongod`** which ensures it starts up on every reboot.
   - Don't use an Ubuntu package for this since they may be outdated.
6. **Install Node.js 16.x.** Don't use an obsolete Ubuntu package. Instead follow the [official instructions for installing Node.js 16.x on Ubuntu](https://github.com/nodesource/distributions/blob/master/README.md#debinstall)
   - Again, it's best to not use an Ubuntu package for this.
7. **Install nginx.** This one is up to date in nginx, so it's one line:

```sh
sudo apt-get install nginx
```

8. **Install `nano`.** This is a basic text editor we can use when configuring `nginx`.
   - If you prefer `vim`, or have remote editing support in your favorite visual text editor, that's fine too.

```sh
sudo apt-get install nano
```

9. **Install `pm2`.** This is a tool to start and restart the site for you and keep it running:

```sh
sudo npm install -g pm2
```

10. We shouldn't use an account with sudo privileges to run the site. So **create a *non-root* user** to manage your Apostrophe site:

```sh
sudo useradd nodeapps -d /home/nodeapps -m -s /bin/bash
```

::: note
The Apostrophe convention is to name this user `nodeapps`. This name is not required, but we will continue to use it in this recipe.

We're specifying the `bash` shell here because the default `sh` shell is no one's favorite, but you can change this.
:::

11.  We're almost ready to use the account, but first **let's make sure `pm2` can restart our site** if the server reboots:

```sh
sudo su -c "pm2 startup ubuntu -u nodeapps --hp /home/nodeapps/var/www"
```

12. If there are no errors, we're ready to continue. **Now switch to that new user in your shell**:

```sh
sudo su - nodeapps
```

From here on out we never run a command as root, except as explicitly noted. This `nodeapps` account doesn't have sudo privileges, and that's a good thing for security.

## Deploying a site for the first time

::: note
You can do this series of steps each time you want to add a new site to the VPS. You can run more than one site on a server, but for security and performance you might prefer to run them on separate servers in production.
:::

1. If you didn't already, SSH to the `ubuntu` user on your server (the last step of the previous section). Then run `sudo su - nodeapps` to switch users.
2. **Deploy the Apostrophe site code to the VPS.** We'll use the `a3-boilerplate` project as an example.
   - We'll `git clone` a project in the home directory as a simple way to deploy it. You may use a CI/CD tool or some other method for regular deployments. You will also likely want to put the code in another location (e.g., `/var/www`).

```sh
git clone https://github.com/apostrophecms/a3-boilerplate

cd a3-boilerplate

npm install
```

3. **Build production front end assets** (including the Apostrophe user interface code):

```sh
npm run build
# This script in the boilerplate is an alias for the Apostrophe task
# `NODE_ENV=production node app @apostrophecms/asset:build`
```

4. **Now we instruct `pm2` to launch the site and to keep it running.** Substitute the shortname of your own project for `a3-boilerplate` below.

```sh
pm2 --name=a3-boilerplate start npm -- run serve
pm2 save
# The second command saves our `pm2` configuration for future reboots.
```

At this point Apostrophe is running on port `3000`. We need to configure nginx as a proxy server to handle HTTP and HTTPS connections on port `80` and `443` and forward them.

## Adding your site to nginx

1. SSH to the `ubuntu` user shell where you have sudo access. If you followed the instructions above and are on the `nodeapps` user, simply type `exit` and submit.
2. Create the nginx configuration file, `/etc/nginx/conf.d/your-project-shortname-here.conf`.
   - Replace `your.host.name` with the DNS hostname you have pointed to your server's IP address for your site.

```sh
sudo nano /etc/nginx/conf.d/your-project-shortname-here.conf
```

3. In the editor, **paste the following, replacing `your.host.name` and `a3-boilerplate` as directed**:
   - To save, press CTL+x, then follow the steps to confirm.

```nginx
server {
  listen *:80;
  # Replace `your.host.name` with your actual hostname
  server_name your.host.name;
  location @proxy {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  location / {
    # Remember to replace `a3-boilerplate` with your project directory name
    root /home/nodeapps/a3-boilerplate/public;
    try_files $uri @proxy;
    expires 7d;
  }
}
```

::: note
The `proxy_set_header` statements pass information to Apostrophe so it can still see the visitor's IP address.

The `root` and `try_files` statements let nginx serve static files directly, for
the best speed; if the URL isn't a static file, it is passed to Apostrophe. `expires 7d` allows the browser to cache the static files, for performance.
:::

4. You'll want to **add SSL for HTTPS connections**, too. For that, follow the LetsEncrypt [Certbot documentation](https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx.html). Certbot will make the necessary nginx configuration changes for you.

5. Now instruct `nginx` to restart:

```
sudo systemctl reload nginx
```

Your site is up! Visit `http://your.host.name` to see it. If you didn't add it to your DNS yet, or it hasn't propagated, you won't be able to reach it yet. You can try `http://your.server.ip.address` until DNS is set up.

## Adding a user to a brand-new site

A newly-created site won't have a database yet, and you need an admin user to start editing. Here's how to add an admin user with the name `admin`:

```
node app @apostrophecms/user:add admin admin
```

You will be prompted for a password.

After that your account will be stored in the MongoDB database.

## Updating your site

To update your site later, follow these steps:

* If you didn't already, `ssh` to the `ubuntu` user on your server. Then run `sudo su - nodeapps` to switch users.

* Run these commands to update the code, install any new or updated npm packages, run any new database migrations and build new production assets:

```
cd a3-boilerplate
git pull
npm run release
```

> In projects based on `a3-boilerplate`, `release` takes care of `npm install`, Apostrophe migrations, and the production asset build in one step.

* Instruct `pm2` to restart the site:

```
pm2 restart a3-boilerplate
```

Your site will restart after a few seconds. You can check `pm2 logs a3-boilerplate` to see whether it has started up yet.

## Viewing the Node.js console

Your site's console log messages are available from `pm2`:

```
pm2 logs a3-boilerplate
```

## Copying content from development to production

TODO: instructions for a simple mongodump / mongorestore pipeline. This can be a one-liner with modern mongodb. Also a one-line rsync command for the media.

## Copying content from production to development

TODO: instructions for a simple mongodump / mongorestore pipeline. This can be a one-liner with modern mongodb. Also a one-line rsync command for the media.

## Recommended enhancements

This is a simple, unopinionated production example. There are many things you can do to improve on this recipe.

One important step is to run at least two Apostrophe processes, in order to guarantee a second process can respond if the first has crashed and is restarting.

One way to do that is to start two separate processes with `pm2`, using two `--name` settings and two `PORT` environment variable settings, and configure [nginx round-robin load balancing](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/#choosing-a-load-balancing-method) to balance between them.

If you need more capacity, you can run as many processes as you have CPU cores on the server, possibly reserving one for MongoDB.

## If you don't deploy with git

Just a heads up: in this example, Apostrophe uses the current git commit ID to identify the current bundle of frontend assets. If your preferred recipe does not involve running `git clone` on the server, then you'll need to set the `APOS_RELEASE_ID` environment variable to a consistent value of your own both when running the asset build task and when starting up Apostrophe. Change that value for both purposes with each new deployment.

## If you don't want to use `npm run update`

For those who want to know, the complete commands for a release are:

```bash
npm install && npm run build && node app @apostrophecms/migration:migrate
```
