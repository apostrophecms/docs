# Hosting Apostrophe on an Unbuntu server

- Unbuntu 16, 18, 20
- Install stuff
  - as `root`
  - Create the non-root user `adduser nodeapps`
  - Update packages `apt-get update -y`
  - Upgrade packages `apt-get upgrade -y`
  - Install nginx `apt-get install -y nginx`
  - Install Node.js and additional utilities `apt-get install -y gcc automake autoconf libtool make nodejs imagemagick npm`
  - Install MongoDB `apt-get install -y mongodb-server mongodb`