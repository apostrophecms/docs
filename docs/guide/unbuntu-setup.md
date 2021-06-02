# Hosting Apostrophe on an Unbuntu server
https://docs.apostrophecms.org/devops/deployment/deployment.html#configuring-your-linux-server-for-apostrophe

- Unbuntu 16, 18, 20
- Install stuff
  - as `root`
  - Create the non-root user `adduser nodeapps`
  - Update packages `apt-get update -y`
  - Upgrade packages `apt-get upgrade -y`
  - Install nginx `apt-get install -y nginx`
  - Add Node repository to the system `curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -`
  - Install Node.js and additional utilities `apt-get install -y gcc automake autoconf libtool make nodejs imagemagick npm`
  - Install MongoDB `apt-get install -y mongodb-server mongodb`
    - TODO: Update to community version for v4. Includes repository command.
    - Still need to `systemctl enable mongod.service`??? Is Mongo running after install and reboot
  - Allow non-root users to run command line applications installed with "npm install -g", otherwise it is not very useful `chmod -R a+r /usr/local/lib/node_modules` - DOUBLE CHECK


Notes:
  - adjust firewall settings if you can't connect from the outside