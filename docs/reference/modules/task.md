# `@apostrophecms/task`

**Alias:** `apos.task`

This module allows support modules in creating command line tasks. It also provides utilities for generating request objects when one is not available and is needed.

Command line tasks are invoked with the general structure:

```bash
node app module-name:task-name --arguments

# Example
node app @apostrophecms/migration:migrate
node app article:generate --total=20
```

Apostrophe is fully initialized before a task is run, except that it does not listen for connections. We may access all general Apostrophe features in a task.

## Related documentation

- [Module task configuration](/reference/module-api/module-overview.md#tasks-self)

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/task/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

::: danger
`getReq` and the related methods below should be used very carefully. It is easy to accidentally grant admin-level (or other higher role) access when lower level permissions are better applied. Those methods are primarily meant for writing unit tests and CLI tasks.

It is almost always the case that an existing request object should be used instead when available (e.g., in an API route handler or event handler such as `beforeInsert`).
:::

### `invoke(name, args, options)`

For use when you wish to execute an Apostrophe command line task from server-side code and continue with other work. This avoids using the command line directly or using the Node.js `child_process` module. The method runs asynchronously (returns a Promise).

**The `name` argument** is the only one that is required. It must be the name of a task, including the name of the module where it was registered, e.g., `'@apostrophecms/user:add'`.

If present, **the `args` argument should be an array of positional arguments** that would be provided to the task in a CLI, *not including* the task name.

If present, **the `options` argument contains the optional parameters** that would normally be hyphenated, i.e. at the command line you might write `--total=20`. This can be passed as the second argument if `args` is omitted.

```
# CLI equivalent: node app @apostrophecms/user:add 'alf' 'admin'
await self.apos.task.invoke('@apostrophecms/user:add', [ 'alf', 'admin' ])

# CLI equivalent: node app product:generate --total=20
await self.apos.task.invoke('product:generate', { total: 20 })
```

The `args` and `options` arguments may be completely omitted, though individual tasks should indicate whether arguments are required when they are run.

::: note
It is better to call module's method *directly* rather than invoking a task when possible. This method is for cases where that option is not readily available.

During the execution of the task, `self.apos.argv` will have a new, temporary value to accommodate tasks that inspect this property directly rather than examining their `argv` argument. `self.apos.argv` will be restored at the end of task execution.

Test carefully as some tasks may not be written to be "good neighbors." For instance, a task developer might assume they can exit the process directly.
:::


### `getReq(options)`

Return a `req` object suitable for command line tasks and unit tests. The `req` object returned is a mockup of a true Express `req` object.

The `options` argument should be an object. If `options.role` is set, it may be:
- `anon` (no user role and no `req.user`)
- `guest`
- `contributor`
- `editor`
- `admin` (the default)

The methods below provide quick access to create request objects for each role. See [the users guide](/guide/users.md#user-roles) for information about each role.

Other properties of `options` are assigned as properties of the returned `req` object before any initialization tasks (such as computing `req.absoluteUrl`).

### `getAnonReq(options)`

A convenience wrapper for `getReq`. This returns a request object simulating an anonymous site visitor, with no role and no `req.user`. See [`getReq`](#getreq-options) for information about the `options` argument.

### `getGuestReq(options)`

A convenience wrapper for `getReq`. This returns a request object simulating a user with the `guest` role. See [`getReq`](#getreq-options) for information about the `options` argument.

### `getContributorReq(options)`

A convenience wrapper for `getReq`. This returns a request object simulating a user with the `contributor` role. See [`getReq`](#getreq-options) for information about the `options` argument.

### `getEditorReq(options)`

A convenience wrapper for `getReq`. This returns a request object simulating a user with the `editor` role. See [`getReq`](#getreq-options) for information about the `options` argument.

### `getAdminReq(options)`

A convenience wrapper for `getReq`. This returns a request object simulating a user with the `admin` role. See [`getReq`](#getreq-options) for information about the `options` argument.

