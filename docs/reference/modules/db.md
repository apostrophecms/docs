---
extends: '@apostrophecms/module'
---

# `@apostrophecms/db`

<AposRefExtends :module="$frontmatter.extends" />

This module establishes `apos.db`, the database object used throughout Apostrophe. It supports MongoDB, SQLite, and Postgres via pluggable adapters, using [`@apostrophecms/db-connect`](https://github.com/apostrophecms/db-connect) to select the right adapter based on the connection URI's protocol (`mongodb://`, `sqlite://`, or `postgres://`).

::: info
`apos.db` is the database object, not an alias to this module. You shouldn't need to talk to this module after startup, but you can access it as `apos.modules['@apostrophecms/db']` if needed. You can also access `apos.dbClient` if you need the underlying client object.
:::

## Options

|  Property | Type | Description |
|---|---|---|
|`uri` | String | The database connection URI. May use the `mongodb://`, `sqlite://`, or `postgres://` protocol. See the [MongoDB URI documentation](https://docs.mongodb.com/manual/reference/connection-string/) for the MongoDB format. |
|`defaultAdapter` | String | Which adapter to use when building a URI from `host`/`port`/`name`/etc. rather than supplying `uri` directly. One of `mongodb`, `sqlite`, `postgres`, or `multipostgres`. Defaults to `mongodb`. Can also be set via the `APOS_DEFAULT_DB_ADAPTER` environment variable. |
|`connect` | Object | If present, this object is passed on as options to the adapter's "connect" method, along with the uri. For MongoDB, see the [MongoDB connect settings documentation](http://mongodb.github.io/node-mongodb-native/2.2/reference/connecting/connection-settings/). |
|`adapters` | Array | An array of custom adapters, each providing `name`, `connect(uri, options)`, and `protocols` properties. `name` may match a core adapter name (such as `postgres` or `mongodb`) to override it. `connect` must resolve to a client object supporting a sufficient subset of the MongoDB driver API. |
|`user` | String | Used to construct a database URI (with the `password` option) if the `uri` option is not used. Not applicable to the `sqlite` adapter. |
|`password` | String |  Used to construct a database URI (with the `user` option) if the `uri` option is not used. Not applicable to the `sqlite` adapter. |
|`host` | String | A hostname to use in the database URI if the `uri` option is not used. Falls back to `localhost`. Not applicable to the `sqlite` adapter. |
|`port` | Integer | A port to use in the database URI if the `uri` option is not used. Falls back to `27017` for `mongodb`, or `5432` for `postgres`/`multipostgres`. Not applicable to the `sqlite` adapter. |
|`name` | String | The project's database name. This falls back to the project [shortname](/reference/glossary.md#shortname). For the `sqlite` adapter, this becomes the filename (as `data/<name>.sqlite`, relative to the project root). |
|`client` | Object | An existing, MongoDB-compatible client object. If present, it is used and `uri`, `host`, `connect`, etc. are ignored. |
|`versionCheck` | Boolean | If `true`, Apostrophe checks the database and exits if it belongs to an older, incompatible major version of Apostrophe. Defaults to `true`. Set to `false` to avoid an extra query at startup. |

::: info
In addition to the `uri` option and the `host`, `port`, and other options that build a connection URI, you can pass a connection URI using the `APOS_DB_URI` environment variable:

```bash
APOS_DB_URI=mongodb://db_user:D1fficultP%40ssw0rd@mongodb0.example.com:27017/?authSource=apos-site-db node app
```

The legacy `APOS_MONGODB_URI` environment variable is still supported for backward compatibility, but `APOS_DB_URI` is preferred and takes precedence if both are set.
:::

::: info
When neither `uri` nor a URI-related environment variable is set, `defaultAdapter` (or `APOS_DEFAULT_DB_ADAPTER`) determines which adapter's URI gets built from `host`, `port`, `name`, etc. For example, setting `defaultAdapter: 'sqlite'` will use a local SQLite file at `data/<shortname>.sqlite` with no additional configuration required.
:::

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/packages/apostrophe/modules/%40apostrophecms/db/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

Because this module has an alias, you can call these from another module from the alias path. For example, `self.apos.db.connectToDb()`.

### `connectToDb()`

Open the database connection using the appropriate adapter for the configured URI (or one built from `host`, `port`, `name`, etc.), and set `apos.db` and `apos.dbClient`. One default we override for MongoDB: if the connection is lost, we keep attempting to reconnect forever. This is sensible behavior for a persistent process that requires a database in order to operate.

If you need to change the way database connections are made, override `connectToDb` in your project. In many cases it is easier to just use the `client` option.

### `connectToAdapter(uri, options)`

Connect to a database using the adapter appropriate to the given URI's protocol, and return a client object compatible with the MongoDB driver interface. Unlike `connectToDb()`, this method has no side effects — it does not set `apos.db` or `apos.dbClient`. It's useful for making temporary connections, for example to drop a test database.

## Module tasks

### `reset`

Full command: `node app @apostrophecms/db:reset`

This task command fully resets the database. It drops *all* collections (other than system collections) and **destroys *all* project content**. Useful in local development. Very terrible in production.

