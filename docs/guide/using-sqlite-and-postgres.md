# Using SQLite or PostgreSQL Instead of MongoDB

ApostropheCMS has historically required MongoDB, and MongoDB remains the default. In addition to MongoDB, projects can now run on **SQLite** or **PostgreSQL** through the `@apostrophecms/db-connect` adapter layer. The adapter is transparent to application code: the same models, queries, cursors and aggregations work identically across all three backends.

This guide is intended for developers who already know *why* they want to use SQLite or PostgreSQL — for example, to avoid running a database server entirely in local development by using SQLite, or to consolidate on an existing PostgreSQL infrastructure. It does not try to convince you to switch. If you are happy with MongoDB, there is no reason to change.

::: info
A future version of the Apostrophe CLI will prompt for your preferred database when creating a new project. Until that lands, the simplest way to try a non-MongoDB backend is to clone the public demo and point it at a different database by setting one environment variable.
:::

::: warning Pre-merge note (remove before publication)
All links to the `@apostrophecms/db-connect` module on this page currently point to the `postgres` branch of `apostrophecms/apostrophe` for QA convenience. Before this page is published, every `…/blob/postgres/packages/db-connect/…` and `…/tree/postgres/packages/db-connect/…` URL on this page must be re-pointed to `main`.
:::

## Prerequisites

- Node.js and a working Apostrophe development environment (see [Development Setup](development-setup.md)).
- For PostgreSQL: a running PostgreSQL 14+ server you can connect to (local, Docker, or managed).
- For SQLite: no server. A file on disk is the entire database.

No changes to your project's `package.json` or module code are required. Apostrophe loads the right adapter based on the protocol in your connection URI.

## Starting from the public demo

The quickest way to try this out is the [public demo project](https://github.com/apostrophecms/public-demo):

```bash
git clone https://github.com/apostrophecms/public-demo.git
cd public-demo
npm install
```

Apostrophe reads the database connection string from the `APOS_DB_URI` environment variable. By setting it to a non-`mongodb://` URI, you switch backends without editing a single line of project code.

## Using SQLite

SQLite is the easiest option for local development and small sites: the database is a single file, there is no server to run, and backups are a file copy.

Point `APOS_DB_URI` at a file path using the `sqlite://` protocol:

```bash
export APOS_DB_URI=sqlite:///absolute/path/to/apos-demo.db
npm run dev
```

The triple slash is intentional — `sqlite://` is the protocol, and the path that follows is absolute. Use a relative path with a double slash if you prefer:

```bash
export APOS_DB_URI=sqlite://./data/apos-demo.db
```

The file is created on first run, along with all tables and indexes. To start over, stop the process and delete the file.

::: warning
In-memory SQLite (`sqlite://:memory:`) is not supported. Apostrophe opens multiple connections to the database, and an in-memory database is only visible to the connection that created it. Use a real file on disk — even a file in `/tmp` works fine for throwaway experiments.
:::

## Using PostgreSQL

PostgreSQL is a good choice when you want to consolidate on infrastructure that already runs PostgreSQL, or to use the operational tooling (backups, monitoring, replication) your team is already familiar with.

Create an empty database and point `APOS_DB_URI` at it using the `postgres://` protocol:

```bash
# Create the database (once)
createdb apos_demo

# Run Apostrophe against it
export APOS_DB_URI=postgres://user:password@localhost:5432/apos_demo
npm run dev
```

On first run, Apostrophe creates the tables and indexes it needs inside that database. It does not touch other databases or schemas on the same server.

If you prefer not to embed credentials in the URI, PostgreSQL's standard environment variables (`PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`) are honored:

```bash
export PGUSER=apos
export PGPASSWORD=...
export APOS_DB_URI=postgres://localhost:5432/apos_demo
```

## Switching a project between backends

Because the three URI formats are fully interchangeable, you can experiment with different backends on the same codebase by changing `APOS_DB_URI` alone. Each URI targets an independent database — there is no automatic migration between them.

To migrate content between backends, use the `apos-db-dump` and `apos-db-restore` tools shipped with `@apostrophecms/db-connect`. They produce and consume a portable JSONL format that works across all three adapters.

Because `@apostrophecms/db-connect` is already a transitive dependency of every Apostrophe project, the simplest way to run these tools is from inside your project directory with `npx` — no global install required:

```bash
cd /path/to/your/apostrophe/project
npx apos-db-dump mongodb://localhost:27017/mydb --output=backup.jsonl
npx apos-db-restore postgres://localhost:5432/mydb --input=backup.jsonl
```

If you prefer them on your `PATH` for use across many projects, install globally instead:

```bash
npm install -g @apostrophecms/db-connect
apos-db-dump mongodb://localhost:27017/mydb --output=backup.jsonl
```

See the [db-connect dump/restore documentation](https://github.com/apostrophecms/apostrophe/blob/postgres/packages/db-connect/docs/dump-restore.md) for the full set of options, including piping dump output straight into restore for cross-backend migration.

## Multi-tenant PostgreSQL with the multisite module

If you are using the [multisite module](https://apostrophecms.com/extensions/multisite-2) to host many Apostrophe sites from a single codebase, PostgreSQL is supported through a dedicated `multipostgres://` protocol. It maps each site to its own **schema** inside a single shared PostgreSQL database, rather than provisioning a separate database per site:

```bash
export DB_URI=multipostgres://user:password@localhost:5432/shareddb-dashboard
```

A `multipostgres://` URI must include both a database name and a schema name, separated by the **last hyphen** in the path. Ending the URI with `-dashboard` is a good choice because multisite always has a dashboard site, so that schema is guaranteed to exist. Multisite derives each tenant site's schema name from this template, substituting the site's short name for `dashboard` at runtime.

Each tenant's tables live in their own schema inside `shareddb`, isolating tenants while keeping operations — backups, monitoring, connection pooling — pointed at a single database. This is usually the right shape for a PostgreSQL-backed multisite deployment; managing hundreds of separate databases is rarely practical.

Everything else about multisite configuration is unchanged. Refer to the [multisite extension page](https://apostrophecms.com/extensions/multisite-2) for installation and tenant-management documentation.

## Compatibility notes

All three adapters are provided by the [`@apostrophecms/db-connect`](https://github.com/apostrophecms/apostrophe/tree/postgres/packages/db-connect) module. `db-connect` implements a large subset of the MongoDB API — enough to support ApostropheCMS core and the extensions and patterns it relies on — but it does **not** attempt to cover 100% of the MongoDB API surface. Application code that sticks to the queries, cursors, aggregations, and index definitions Apostrophe itself uses will work across all three backends; code that reaches for less-common MongoDB features (obscure aggregation stages, server-side JavaScript, change streams, geospatial operators, and so on) may not.

If you are writing modules intended to run across MongoDB, PostgreSQL, and SQLite, treat the db-connect API as authoritative rather than the full MongoDB driver API. See the [`db-connect` README](https://github.com/apostrophecms/apostrophe/blob/postgres/packages/db-connect/README.md) for the complete list of supported query operators, cursor methods, aggregation stages, and connection-URL formats, and the [db-connect docs folder](https://github.com/apostrophecms/apostrophe/tree/postgres/packages/db-connect/docs) for deeper material on the dump/restore format and adapter internals.
