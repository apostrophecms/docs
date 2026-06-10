# Choosing a Database for ApostropheCMS

When a new project is created via the ApostropheCMS CLI, you'll be asked which database you wish to use: SQLite, PostgreSQL, or MongoDB.

::: tip
Trying ApostropheCMS for the first time? Don't have MongoDB or PostgreSQL installed? **Just pick SQLite** and start evaluating without installing anything! You can always switch later.
:::

## When to choose SQLite

SQLite is ideal for evaluating ApostropheCMS. Because a SQLite database is just a file on disk, you don't have to install anything. It "just works." SQLite is also 100% open source.

While SQLite is also good for small projects in production, SQLite will not be the best choice in production if your needs grow beyond a single server. However, you can easily switch at any time.

## When to choose PostgresSQL

If you, your organization or your customer already use and prefer PostgreSQL, you should use it.  PostgreSQL is also the right choice for larger deployments when you have a strong preference for 100% open source.

Managed PostgreSQL hosting is available from most hosting providers, including DigitalOcean, AWS Lightsail, AWS RDS and many more. You can also install it yourself.

## When to choose MongoDB

The ApostropheCMS `db-connect` layer supports a large API, but it does not cover every feature that is offered by MongoDB. So if you want to mix in advanced MongoDB query syntax that goes beyond what we include in `db-connect`, MongoDB is the right choice. [You can check the level of support for non-MongoDB databases in `db-connect` here.](https://github.com/apostrophecms/apostrophe/blob/main/packages/db-connect/README.md) See also our [SQLite and Postgres guide](./using-sqlite-and-postgres.md).

Like PostgreSQL, MongoDB is a solid production choice, and [managed hosting is available via MongoDB Atlas](https://mongodb.com/).

## What if I make the wrong choice?

Don't worry. [Tools are provided](./using-sqlite-and-postgres.md#switching-a-project-between-backends) to "dump and restore" databases in a universal format, so that you can save your data from one type of database and restore it to another.
