# Ubuntu hosting setup

## Setting up the Ubuntu VPS

We'll start off by creating an Ubuntu VPS on AWS Lightsail. There are many services to use for hosting an Ubuntu VPS and the rest of the recipe is platform-agnostic.

1. In an [AWS Lightsail account](https://lightsail.aws.amazon.com), log in and  create an **Ubuntu 20.04 LTS** ("OS Only") instance. You need at least 1GB of RAM. We suggest 2GB to be safe.
   - There is a step on this first page to select or add an SSH key to connect securely from your computer. Follow Lightsail's directions to do this.
2. Complete any additional configurations you want, then **create the instance**. Once the instance is created, click on it to continue configuration.
3. On the "Networking" tab, you should see that the SSH and HTTP ports are already open. In addition, **open the HTTPS port** by clicking "Add rule" and selecting "HTTPS." You need this for `https://` connections.
   - Wait a couple minutes even after it says it's ready, to be sure it will accept your SSH connection.
4. SSH to your server's `ubuntu` account, according to the Lightsail instructions. This account has `sudo` privileges so you can take care of tasks that require root access.
5. **Install MongoDB Community Edition.**  Instead follow the [official instructions for installing MongoDB Community Edition on Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/).
   - **Be sure not to miss the command `sudo systemctl enable mongod`** which ensures it starts up on every reboot.
   - Don't use an Ubuntu package for this since they may be outdated.
6. **Install Node.js 18.x.** Don't use an obsolete Ubuntu package. Instead follow the [official instructions for installing Node.js 18.x on Ubuntu](https://github.com/nodesource/distributions/blob/master/README.md#debinstall)
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

### Deploying a site for the first time

::: note
You can do this series of steps each time you want to add a new site to the VPS. You can run more than one site on a server, but for security and performance you might prefer to run them on separate servers in production.
:::

1. If you didn't already, SSH to the `ubuntu` user on your server (the last step of the previous section). Then run `sudo su - nodeapps` to switch users.
2. **Deploy the Apostrophe site code to the VPS.** We'll use the a3 essentials starter kit project as an example.
   - We'll `git clone` a project in the home directory as a simple way to deploy it. You may use a CI/CD tool or some other method for regular deployments. You will also likely want to put the code in another location (e.g., `/var/www`).

```sh
git clone https://github.com/apostrophecms/starter-kit-essentials

cd starter-kit-essentials

npm install
```

3. **Build production front end assets** (including the Apostrophe user interface code):

```sh
npm run build
# This script in the starter kit is an alias for the Apostrophe task
# `NODE_ENV=production node app @apostrophecms/asset:build`
```

4. **Now we instruct `pm2` to launch the site and to keep it running.** Substitute the shortname of your own project for `starter-kit-essentials` below.

```sh
pm2 --name=starter-kit-essentials start npm -- run serve
pm2 save
# The second command saves our `pm2` configuration for future reboots.
```

At this point Apostrophe is running on port `3000`. We need to configure nginx as a proxy server to handle HTTP and HTTPS connections on port `80` and `443` and forward them.

### Adding your site to nginx

1. SSH to the `ubuntu` user shell where you have sudo access. If you followed the instructions above and are on the `nodeapps` user, simply type `exit` and submit.
2. Create the nginx configuration file, `/etc/nginx/conf.d/your-project-shortname-here.conf`.
   - Replace `your.host.name` with the DNS hostname you have pointed to your server's IP address for your site.

```sh
sudo nano /etc/nginx/conf.d/your-project-shortname-here.conf
```

3. In the editor, **paste the following, replacing `your.host.name` and `starter-kit-essentials` as directed**:

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
    # Remember to replace `starter-kit-essentials` with your project directory name
    root /home/nodeapps/starter-kit-essentials/public;
    try_files $uri @proxy;
    expires 7d;
  }
}
# To save, press CTL+x, then follow the steps to confirm.
```

::: note
The `proxy_set_header` statements pass information to Apostrophe so it can still see the visitor's IP address.

The `root` and `try_files` statements let nginx serve static files directly, for
the best speed; if the URL isn't a static file, it is passed to Apostrophe. `expires 7d` allows the browser to cache the static files, for performance.
:::

1. You'll want to **add SSL for HTTPS connections**, too. For that, follow the LetsEncrypt [Certbot documentation](https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx.html). Certbot will make the necessary nginx configuration changes for you.

2. Now instruct `nginx` to restart:

```sh
sudo systemctl reload nginx
```

**Your site should be up!** Visit `http://your.host.name` to see it. If you didn't add it to your DNS yet, or it hasn't propagated, you won't be able to reach it yet.
<!-- You can try `http://your.server.ip.address` until DNS is set up. -->

## Working on the site after deployment

### Adding a user to a brand-new site

A newly-created site won't have much in the database yet, and **you need an admin user to start editing**.

1. **Make sure you are on the `nodeapps` user** (the non-sudo user). Any direct work on the Apostrophe site (as opposed to the server) should be done by `nodeapps`.
2.  Run the follow task to create a user with the name `lucy` to the "admin" group:

```sh
node app @apostrophecms/user:add lucy admin
# The command structure is:
# node app apostrophe-users:add userName groupName
```

3. When prompted, **enter a secure password.** And be sure to record it securely as well!

After that your account will be stored in the MongoDB database. Access it on the `/login` page of your website.

### Updating your site code

To update your site later, follow these steps using the `nodeapps` (non-sudo) user:

1. `cd` to the project root if you are not there already. Since we first deployed our code by cloning a git repository, we'll pull from that repo to update the code.

```sh
# Make sure we're in our project root directory.
cd && cd starter-kit-essentials
# Pull our code.
git pull
```

2. Now that we have the code updated, we will install any new or updated npm packages, build new production assets, and run any new database migrations:

```sh
npm install && npm run build && node app @apostrophecms/migration:migrate
```

::: tip
In projects based on the `starter-kit-essentials` code starter, the `npm run release` script takes care of all of this in one command. If your codebase does not include that script you will need to run each command directly.
:::

3. Instruct `pm2` to restart the site:

```sh
pm2 restart starter-kit-essentials
```

Your site will restart after a few seconds. You can check the process logs with `pm2 logs starter-kit-essentials` to see whether it has started up yet.

### Viewing the Node.js console

Your site's console log messages are available from `pm2`:

```sh
pm2 logs starter-kit-essentials
```

## Recommended enhancements

This recipe is a simple, unopinionated production example. There are many things you can do to improve on this recipe.

### Run on multiple processes

One important step is to run at least two Apostrophe processes, in order to guarantee a second process can respond if the first has crashed and is restarting.

One way to do that is to start two separate processes with `pm2`, using two `--name` settings and two `PORT` environment variable settings, and configure [nginx round-robin load balancing](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/#choosing-a-load-balancing-method) to balance between them.

If you need more capacity, you can run as many processes as you have CPU cores on the server, possibly reserving one for MongoDB.

### Specify the `APOS_RELEASE_ID` if not deploying with git

Just a heads up: in this example, Apostrophe uses the current git commit ID to identify the current bundle of frontend assets.

If your preferred deployment process does not involve running `git clone` on the server, **you'll need to set the `APOS_RELEASE_ID` environment variable to a consistent value of your own** when running the asset build task *and* when starting up Apostrophe. Change that release ID value for both purposes *with each new deployment*.

```sh
APOS_RELEASE_ID=myLatestReleaseID npm run build &&
APOS_RELEASE_ID=myLatestReleaseID pm2 restart starter-kit-essentials
# Remember, starter-kit-essentials is the name of the pm2 process from this example.
# Replace that with the name of your pm2 process.
```
