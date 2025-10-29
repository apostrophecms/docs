---
extends: '@apostrophecms/module'
---

# `@apostrophecms/task`

**Alias:** `apos.task`

<AposRefExtends :module="$frontmatter.extends" />

This module provides the functionality needed to create and run command line tasks. It also provides utilities for generating request objects when one is not available and is needed.

Command line tasks are invoked with the general structure:

```bash
node app module-name:task-name --arguments

# Example
node app @apostrophecms/migration:migrate
node app article:generate --total=20
```

Apostrophe is fully initialized before a task is run, except that it does not listen for connections. We may access all general Apostrophe features in a task.

::: info
**New to creating tasks?** See the [Creating Command-Line Tasks tutorial](/tutorials/creating-command-line-tasks.md) for a step-by-step guide with practical examples.
:::

## Related documentation

- [Module task configuration](/reference/module-api/module-overview.md#tasks-self) - How to define tasks in your module
- [Creating Command-Line Tasks tutorial](/tutorials/creating-command-line-tasks.html) - Complete guide to building tasks

## Featured methods

The following methods belong to this module and may be useful in project-level code. See the [source code](https://github.com/apostrophecms/apostrophe/blob/main/modules/%40apostrophecms/task/index.js) for all methods that belong to this module.
<!-- Some are used within the module and would just create noise here. -->

Because this module has an alias, you can call these from another module from the alias path. For example, `self.apos.task.invoke(...)`.

::: danger
`getReq` and the related methods below should be used very carefully. It is easy to accidentally grant admin-level (or other higher role) access when lower level permissions are better applied. Those methods are primarily meant for writing unit tests and CLI tasks.

It is almost always the case that an existing request object should be used instead when available (e.g., in an API route handler or event handler such as `beforeInsert`).
:::

### `invoke(name, args, options)`

For use when you wish to execute an Apostrophe command line task from server-side code and continue with other work. This avoids using the command line directly or using the Node.js `child_process` module. The method returns a Promise (it can be run with the `async/await` syntax).

**The `name` argument** is the only one that is required. It must be the name of a task, including the name of the module where it was registered, e.g., `'@apostrophecms/user:add'`.

If present, **the `args` argument should be an array of positional arguments** that would be provided to the task in a CLI, *not including* the task name.

If present, **the `options` argument is an object that contains optional parameters** that would normally be hyphenated, i.e. at the command line you might write `--total=20`. This can be passed as the second argument if `args` is omitted.

```javascript
// CLI equivalent: node app @apostrophecms/user:add 'alf' 'admin'
await self.apos.task.invoke('@apostrophecms/user:add', [ 'alf', 'admin' ]);

// CLI equivalent: node app product:generate --total=20
await self.apos.task.invoke('product:generate', { total: 20 });

// With both positional arguments and options
await self.apos.task.invoke('article:generate', [ 'technology' ], { total: 20 });
```

The `args` and `options` arguments may be completely omitted, though individual tasks should indicate whether arguments are required when they are run.

::: info
It is better to call a module's method *directly* rather than invoking a task when possible. This method is for cases where that option is not readily available.

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

#### Example: Using getReq in a task

```javascript
tasks(self) {
  return {
    'list-articles': {
      usage: 'List all articles in the database',
      async task(argv) {
        // Database queries require a request object
        const req = self.apos.task.getReq();

        // Now we can query the database with admin permissions
        const articles = await self.find(req).toArray();

        console.log(`Found ${articles.length} articles:`);
        for (const article of articles) {
          console.log(`- ${article.title} (${article.aposMode})`);
        }
      }
    }
  };
}
```

#### Example: Choosing the appropriate permission level

```javascript
tasks(self) {
  return {
    'compare-visibility': {
      usage: 'Compare what admins vs anonymous users can see',
      async task(argv) {
        // Get all content with admin permissions
        const adminReq = self.apos.task.getReq();
        const allArticles = await self.find(adminReq).toArray();

        // Get only published content (what anonymous users see)
        const anonReq = self.apos.task.getAnonReq();
        const publicArticles = await self.find(anonReq).toArray();

        console.log(`Admin can see: ${allArticles.length} articles`);
        console.log(`Public can see: ${publicArticles.length} articles`);
        console.log(`Unpublished: ${allArticles.length - publicArticles.length} articles`);
      }
    }
  };
}
```

#### Example: Specifying locale in a task

```javascript
tasks(self) {
  return {
    'list-french': {
      usage: 'List articles in the French locale',
      async task(argv) {
        // Create a request object with a specific locale
        const req = self.apos.task.getReq({
          locale: 'fr',
          mode: 'published'
        });

        const articles = await self.find(req).toArray();

        console.log(`Found ${articles.length} French articles`);
      }
    }
  };
}
```

### `getAnonReq(options)`

A convenience wrapper for `getReq`. This returns a request object simulating an anonymous site visitor, with no role and no `req.user`.

**When to use:** Use `getAnonReq` when you need to see content exactly as unauthenticated visitors would see it - typically only published content that has public visibility.

See [`getReq`](#getreq-options) for information about the `options` argument.

#### Example: Testing public visibility

```javascript
tasks(self) {
  return {
    'test-public-access': {
      usage: 'Test what anonymous users can access',
      async task(argv) {
        const req = self.apos.task.getAnonReq();

        // This will only return published, public content
        const articles = await self.find(req).toArray();

        console.log(`Anonymous users can see ${articles.length} articles`);

        // Test a specific article
        const slug = argv.slug || 'test-article';
        const article = await self.find(req, { slug }).toOne();

        if (article) {
          console.log(`✓ Article "${slug}" is publicly accessible`);
        } else {
          console.log(`✗ Article "${slug}" is NOT publicly accessible`);
        }
      }
    }
  };
}
```

### `getGuestReq(options)`

A convenience wrapper for `getReq`. This returns a request object simulating a user with the `guest` role.

**When to use:** Use this when you need to test how content appears to logged-in users with minimal permissions (guests can typically view more than anonymous users but cannot edit content).

See [`getReq`](#getreq-options) for information about the `options` argument.

### `getContributorReq(options)`

A convenience wrapper for `getReq`. This returns a request object simulating a user with the `contributor` role.

**When to use:** Contributors can typically create and edit their own content but cannot publish it. Use this to test workflows or content visibility at the contributor permission level.

See [`getReq`](#getreq-options) for information about the `options` argument.

#### Example: Simulating contributor permissions

```javascript
tasks(self) {
  return {
    'test-contributor-workflow': {
      usage: 'Test what contributors can do with content',
      async task(argv) {
        const req = self.apos.task.getContributorReq();

        // Try to create a draft article
        const article = {
          title: 'Contributor Test Article',
          aposMode: 'draft'
        };

        try {
          await self.insert(req, article);
          console.log('✓ Contributor can create draft articles');
        } catch (error) {
          console.log('✗ Contributor cannot create articles:', error.message);
        }

        // Try to publish (this should fail)
        article.aposMode = 'published';
        try {
          await self.update(req, article);
          console.log('✓ Contributor can publish articles');
        } catch (error) {
          console.log('✗ Contributor cannot publish articles (expected)');
        }
      }
    }
  };
}
```

### `getEditorReq(options)`

A convenience wrapper for `getReq`. This returns a request object simulating a user with the `editor` role.

**When to use:** Editors can create, edit, and publish content but typically cannot manage users or access admin-only features. Use this to test content management workflows at the editor permission level.

See [`getReq`](#getreq-options) for information about the `options` argument.

### `getAdminReq(options)`

A convenience wrapper for `getReq`. This returns a request object simulating a user with the `admin` role. This is the default behavior of `getReq()`.

**When to use:** Use this (or simply `getReq()`) for most tasks where you need full access to all content, including unpublished drafts, archived content, and admin-only features. This is the most common choice for maintenance tasks, data generation, and migrations.

See [`getReq`](#getreq-options) for information about the `options` argument.

#### Example: Admin-level maintenance task

```javascript
tasks(self) {
  return {
    'cleanup-old-drafts': {
      usage: 'Delete draft articles older than 90 days',
      async task(argv) {
        // Use admin permissions to access all drafts
        const req = self.apos.task.getAdminReq();

        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        // Find old drafts (admin can see drafts, others cannot)
        const oldDrafts = await self.find(req, {
          aposMode: 'draft',
          updatedAt: { $lt: ninetyDaysAgo }
        }).toArray();

        console.log(`Found ${oldDrafts.length} drafts older than 90 days`);

        if (!argv['dry-run']) {
          for (const draft of oldDrafts) {
            await self.delete(req, draft);
            console.log(`✓ Deleted: ${draft.title}`);
          }
        } else {
          console.log('DRY RUN - No articles were deleted');
        }
      }
    }
  };
}
```

## Common Patterns

### Pattern: Dry run option

Always include a `--dry-run` option for tasks that modify or delete data:

```javascript
tasks(self) {
  return {
    'dangerous-operation': {
      usage: 'Perform a destructive operation. Use --dry-run to preview changes.',
      async task(argv) {
        const req = self.apos.task.getReq();
        const dryRun = argv['dry-run'];

        // Find items to modify
        const items = await self.find(req, { /* criteria */ }).toArray();

        if (dryRun) {
          console.log(`DRY RUN: Would modify ${items.length} items`);
          return;
        }

        // Perform actual modifications
        for (const item of items) {
          await self.update(req, item);
        }
      }
    }
  };
}
```

### Pattern: Progress reporting

For long-running tasks, report progress to keep users informed:

```javascript
tasks(self) {
  return {
    'process-many': {
      usage: 'Process a large number of items',
      async task(argv) {
        const req = self.apos.task.getReq();
        const items = await self.find(req).toArray();
        const total = items.length;

        console.log(`Processing ${total} items...`);

        for (let i = 0; i < items.length; i++) {
          await processItem(items[i]);

          // Report progress every 10 items
          if ((i + 1) % 10 === 0) {
            console.log(`Progress: ${i + 1}/${total} (${Math.round((i + 1) / total * 100)}%)`);
          }
        }

        console.log('✓ Complete!');
      }
    }
  };
}
```

### Pattern: Validating required arguments

Always validate that required arguments are present:

```javascript
tasks(self) {
  return {
    'require-args': {
      usage: 'Task that requires arguments.\nUsage: node app module:require-args <filename> --format=json',
      async task(argv) {
        // Check positional argument
        const filename = argv._[1];
        if (!filename) {
          console.error('Error: filename argument is required');
          console.log(this.usage);
          process.exit(1);
        }

        // Check named option
        const format = argv.format;
        if (!format) {
          console.error('Error: --format option is required');
          console.log(this.usage);
          process.exit(1);
        }

        // Proceed with task
        console.log(`Processing ${filename} in ${format} format...`);
      }
    }
  };
}
```