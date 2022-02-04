---
extends: '@apostrophecms/module'
---

# `@apostrophecms/db`

<AposRefExtends :module="$frontmatter.extends" />

This module establishes `apos.db`, the MongoDB driver database object.

::: note
`apos.db` is the MongoDB database object, not an alias to this module. You shouldn't need to talk to this module after startup, but you can access it as `apos.modules['@apostrophecms/db']` if needed. You can also access `apos.dbClient` if you need the MongoClient object.
:::

## Options

|  Property | Type | Description |
|---|---|---|
|`uri` | String | The MongoDB connection URI. See the [MongoDB URI documentation](https://docs.mongodb.com/manual/reference/connection-string/). |
|`connect` | Object | If present, this object is passed on as options to MongoDB's "connect" method, along with the uri. See the [MongoDB connect settings documentation](http://mongodb.github.io/node-mongodb-native/2.2/reference/connecting/connection-settings/). |
|`user` | String | Used to construct a database URI (with the `password` option) if the `uri` option is not used. |
|`password` | String |  Used to construct a database URI (with the `user` option) if the `uri` option is not used. |
|`host` | String | A hostname to use in the database URI if the `uri` option is not used. This falls back to `localhost`. |
|`port` | Integer | A port to use in the database URI if the `uri` option is not used. This falls back to `27017`. |
|`name` | String | The project's database name. This falls back to the project [shortname](/reference/glossary.md#shortname). |
|`client` | String |An existing MongoDB connection (MongoClient) object. If present, it is used and `uri`, `host`, `connect`, etc. are ignored. |
|`versionCheck` | Boolean | If `true`, Apostrophe checks the database and exits if it belongs to an older, incompatible major version of Apostrophe. Defaults to `true`. Set to `false` to avoid an extra query at startup. |

::: note
In addition to the `uri` option and the `host`, `port`, and other options that build a MongoDB connection URI, we can pass a connection URI using the `APOS_MONGODB_URI` environment variable.

```bash
APOS_MONGODB_URI=mongodb://db_user:D1fficultP%40ssw0rd@mongodb0.example.com:27017/?authSource=apos-site-db node app
```
:::

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/db/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

Because this module has an alias, you can call these from another module from the alias path. For example, `self.apos.db.connectToMongo()`.

### `connectToMongo()`

Open the database connection. Always uses `mongo.MongoClient` with its sensible defaults. Build a URI if necessary, so we can call it in a consistent way. One default we override: if the connection is lost, we keep attempting to reconnect forever. This is sensible behavior for a persistent process that requires MongoDB in order to operate.

If you need to change the way MongoDB connections are made, override `connectToMongo` in your project. In many cases it is easier to just use the `client` option.

## Module tasks

### `reset`

Full command: `node app @apostrophecms/db:reset`

This task command fully resets the database. It drops *all* collections (other than system collections) and **destroys *all* project content**. Useful in local development. Very terrible in production.

