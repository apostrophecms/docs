---
title: "Creating Command-Line Tasks in ApostropheCMS"
detailHeading: "Tutorial"
url: "/tutorials/creating-command-line-tasks.html"
content: "Learn how to create custom command-line tasks in ApostropheCMS for data generation, maintenance operations, and automated workflows."
tags:
  topic: "Development"
  type: tutorial
  effort: beginner
---
# Creating Command-Line Tasks in ApostropheCMS

## Why This Matters

Command-line tasks are essential tools for any content management system. They allow you to automate repetitive operations, generate test data, perform maintenance, run migrations, and execute batch operations without tying up your web server. In ApostropheCMS, tasks have full access to your data models and business logic, making them powerful tools for developers and site administrators.

Common use cases for command-line tasks include:
- **Data generation**: Creating sample content for development and testing
- **Maintenance operations**: Cleaning up orphaned data or optimizing content
- **Reporting**: Generating analytics or export files
- **Batch operations**: Bulk updates to content or user accounts

## Understanding ApostropheCMS Tasks

Tasks in ApostropheCMS are defined in your module's configuration and can be invoked from the command line using this pattern:

```bash
node app module-name:task-name --arguments
```

When a task runs, Apostrophe fully initializes (connecting to the database, loading all modules, etc.) but doesn't start listening for web connections. This means you have complete access to all your module methods, database queries, and business logic.

## Creating Your First Task

Let's create a practical example: a task that generates sample article content for testing purposes. While ApostropheCMS already includes a basic version of this functionality for all piece types (`node app [piece-type-name]:generate --total=[integer]`), building our own version demonstrates the key concepts you'll use in any custom task.

### Step 1: Define the Task in Your Module

In your article module (or any piece-type module), add a `tasks` section:

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Article',
    pluralLabel: 'Articles'
  },
  fields: {
    add: {
      subtitle: {
        type: 'string',
        label: 'Subtitle'
      },
      body: {
        type: 'area',
        label: 'Body',
        options: {
          widgets: {
            '@apostrophecms/rich-text': {}
          }
        }
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [ 'title', 'subtitle', 'body' ]
      }
    }
  },
  tasks(self) {
    return {
      generate: {
        usage: 'Generate sample articles for testing.\nUsage: node app article:generate --total=20',
        async task(argv) {
          // Get a request object with admin privileges
          const req = self.apos.task.getReq();

          // Determine how many articles to create
          const total = argv.total || 10;

          console.log(`Generating ${total} sample articles...`);

          for (let i = 1; i <= total; i++) {
            const article = {
              title: `Sample Article ${i}`,
              subtitle: `This is subtitle number ${i}`,
              body: {
                items: [
                  {
                    _id: self.apos.util.generateId(),
                    type: '@apostrophecms/rich-text',
                    content: `<p>This is the body content for article ${i}. It contains sample text to demonstrate the article structure.</p>`
                  }
                ]
              }
            };

            try {
              await self.insert(req, article);
              console.log(`✓ Created: ${article.title}`);
            } catch (error) {
              console.error(`✗ Failed to create article ${i}:`, error.message);
            }
          }

          console.log(`\nCompleted! Generated ${total} articles.`);
        }
      }
    };
  }
};
```
<template v-slot:caption>
    modules/article/index.js
  </template>
</AposCodeBlock>

Let's break down this task structure:

**The `tasks(self)` function** returns an object where each property defines a task. In this example, we're defining a single task named `generate`. The property name becomes the task name, so this task is invoked as `article:generate` (module name + colon + task name).

Each task definition is an object with two key properties:
- **`usage`**: A string that describes the task and shows how to use it. This is displayed when someone runs `node app help article:generate`, making your task self-documenting.
- **`task`**: The async function that actually runs when the task is invoked. It receives an `argv` parameter containing all the command-line arguments and options.

You can define multiple tasks in a single module by adding more properties to the returned object:

```javascript
tasks(self) {
  return {
    generate: { /* ... */ },
    export: { /* ... */ },
    cleanup: { /* ... */ }
  };
}
```

### Step 2: Run Your Task

Once you've defined the task, you can run it from the command line:

```bash
# Generate 10 articles (the default)
node app article:generate

# Generate a specific number of articles
node app article:generate --total=50

# Get help about the task
node app help article:generate
```

The `usage` property you defined will be displayed when someone runs `node app help article:generate`, making your task self-documenting.

## Understanding Request Objects in Tasks

Notice the line `const req = self.apos.task.getReq()` in our example. This is a crucial concept for working with tasks.

**Why do tasks need request objects?** In ApostropheCMS, all database operations require a request object (`req`) to determine:
- **Permissions**: What content can be accessed or modified
- **Locale**: Which language/localization context to use
- **Context**: Additional request-specific data

When you're handling a web request, the `req` object comes from Express. But in a command-line task, there's no web request, so you need to create a mock request object.

### Choosing the Right Request Type

ApostropheCMS provides several methods for creating request objects with different permission levels:

<AposCodeBlock>

```javascript
tasks(self) {
  return {
    listAll: {
      usage: 'List all articles, including unpublished ones',
      async task(argv) {
        // getReq() or getAdminReq() - Full admin permissions
        // Use this when you need to access ALL content regardless of publish state
        const req = self.apos.task.getReq();
        const articles = await self.find(req).toArray();

        console.log(`Found ${articles.length} total articles (published and unpublished)`);
        for (const article of articles) {
          console.log(`- ${article.title} (${article.aposMode})`);
        }
      }
    },
    listPublished: {
      usage: 'List only published articles (what anonymous visitors see)',
      async task(argv) {
        // getAnonReq() - Anonymous visitor permissions
        // Use this to see content as an unauthenticated user would
        const req = self.apos.task.getAnonReq();
        const articles = await self.find(req).toArray();

        console.log(`Found ${articles.length} published articles`);
        for (const article of articles) {
          console.log(`- ${article.title}`);
        }
      }
    },
    simulateEditor: {
      usage: 'Demonstrate editor-level permissions',
      async task(argv) {
        // getEditorReq() - Editor role permissions
        // Useful for testing content visibility at different permission levels
        const req = self.apos.task.getEditorReq();
        const articles = await self.find(req).toArray();

        console.log(`Editor can see ${articles.length} articles`);
      }
    }
  };
}
```
  <template v-slot:caption>
    modules/article/index.js
  </template>
</AposCodeBlock>

**Rule of thumb**: Use `getReq()` (admin permissions) for most tasks unless you specifically need to test how content appears to users with lower permissions.

## Working with Task Arguments

Tasks can accept both positional arguments and named options. Let's enhance our article generator to demonstrate this:

<AposCodeBlock>

```javascript
tasks(self) {
  return {
    generate: {
      usage: 'Generate sample articles.\nUsage: node app article:generate [category] --total=20 --published=true',
      async task(argv) {
        const req = self.apos.task.getReq();

        // Access positional arguments from argv._
        // argv._ is an array: [0] is the task name, [1] is first positional arg, etc.
        const category = argv._[1] || 'general';

        // Access named options with -- syntax
        const total = parseInt(argv.total) || 10;
        const published = argv.published !== 'false'; // defaults to true

        console.log(`Generating ${total} articles in category "${category}"...`);

        for (let i = 1; i <= total; i++) {
          const article = {
            title: `${category} Article ${i}`,
            subtitle: `Sample article in ${category} category`,
            body: {
              items: [
                {
                  _id: self.apos.util.generateId(),
                  type: '@apostrophecms/rich-text',
                  content: `<p>Sample content for ${category} category.</p>`
                }
              ]
            },
            // Set publish state based on argument
            aposMode: published ? 'published' : 'draft'
          };

          try {
            await self.insert(req, article);
            console.log(`✓ Created: ${article.title} (${article.aposMode})`);
          } catch (error) {
            console.error(`✗ Failed to create article ${i}:`, error.message);
          }
        }

        console.log(`\nCompleted! Generated ${total} ${published ? 'published' : 'draft'} articles.`);
      }
    }
  };
}
```
  <template v-slot:caption>
    modules/article/index.js
  </template>
</AposCodeBlock>

Now you can run your task with more flexibility:

```bash
# Generate 20 published articles in the "technology" category
node app article:generate technology --total=20 --published=true

# Generate 5 draft articles in the "news" category
node app article:generate news --total=5 --published=false
```

## Advanced Example: Data Export and Cleanup Tasks

Let's create two more advanced tasks that demonstrate additional patterns you'll commonly need:

1. **Export task**: Demonstrates file system operations, CSV generation, query builders (like `sort()`), and the pattern of using different permission levels based on flags (`--published-only`).

2. **Cleanup task**: Shows how to perform destructive operations safely with database deletion, MongoDB query operators (regex), and the critical dry-run pattern for previewing changes before executing them.

Together, these examples show how tasks can both export data for external use and maintain your database by removing unwanted content.

<AposCodeBlock>

```javascript
import fs from 'fs';
import path from 'path';

export default {
  extend: '@apostrophecms/piece-type',
  // ... fields configuration ...
  tasks(self) {
    return {
      export: {
        usage: 'Export articles to CSV.\nUsage: node app article:export --output=articles.csv --published-only',
        async task(argv) {
          // Use getAnonReq if --published-only flag is set
          const req = argv['published-only']
            ? self.apos.task.getAnonReq()
            : self.apos.task.getReq();

          const outputPath = argv.output || 'articles.csv';

          console.log('Fetching articles...');
          const articles = await self.find(req)
            .sort({ createdAt: -1 })
            .toArray();

          console.log(`Found ${articles.length} articles. Creating CSV...`);

          // Create CSV content
          const headers = ['Title', 'Subtitle', 'Slug', 'Created', 'Modified', 'Status'];
          const rows = articles.map(article => [
            article.title,
            article.subtitle || '',
            article.slug,
            new Date(article.createdAt).toISOString(),
            new Date(article.updatedAt).toISOString(),
            article.aposMode
          ]);

          // Format as CSV
          const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
          ].join('\n');

          // Write to file
          const fullPath = path.join(process.cwd(), outputPath);
          fs.writeFileSync(fullPath, csvContent);

          console.log(`✓ Export complete! File saved to: ${fullPath}`);
        }
      },
      cleanup: {
        usage: 'Delete all articles with "Sample" in the title.\nUsage: node app article:cleanup --dry-run',
        async task(argv) {
          const req = self.apos.task.getReq();
          const dryRun = argv['dry-run'] || false;

          console.log('Searching for sample articles...');
          const articles = await self.find(req, {
            title: { $regex: /sample/i }
          }).toArray();

          console.log(`Found ${articles.length} sample articles.`);

          if (dryRun) {
            console.log('\nDRY RUN - No articles will be deleted:');
            for (const article of articles) {
              console.log(`- Would delete: ${article.title}`);
            }
            console.log('\nRun without --dry-run to actually delete these articles.');
          } else {
            console.log('\nDeleting articles...');
            for (const article of articles) {
              try {
                await self.delete(req, article);
                console.log(`✓ Deleted: ${article.title}`);
              } catch (error) {
                console.error(`✗ Failed to delete ${article.title}:`, error.message);
              }
            }
            console.log(`\nCompleted! Deleted ${articles.length} articles.`);
          }
        }
      }
    };
  }
};
```
  <template v-slot:caption>
    modules/article/index.js
  </template>
</AposCodeBlock>

Run these tasks like this:

```bash
# Export all articles
node app article:export --output=all-articles.csv

# Export only published articles
node app article:export --output=published.csv --published-only

# Preview what would be deleted (dry run)
node app article:cleanup --dry-run

# Actually delete the sample articles
node app article:cleanup
```

## Best Practices for Command-Line Tasks

### 1. Always Provide Clear Usage Strings

Your `usage` property should explain what the task does and show examples:

```javascript
usage: 'Generate sample articles for testing.\nUsage: node app article:generate --total=20'
```

### 2. Provide Meaningful Console Output

Keep users informed about progress:

```javascript
console.log(`Processing ${total} articles...`);
// During processing
console.log(`✓ Completed article ${i}/${total}`);
// On completion
console.log(`\nFinished! Processed ${total} articles.`);
```

### 3. Handle Errors Gracefully

Catch errors and provide helpful messages:

```javascript
try {
  await self.insert(req, article);
} catch (error) {
  console.error(`Failed to create article: ${error.message}`);
  // Continue processing other items or exit if critical
}
```

### 4. Include a Dry Run Option for Destructive Operations

For tasks that delete or modify data, add a `--dry-run` option:

```javascript
const dryRun = argv['dry-run'] || false;
if (dryRun) {
  console.log('DRY RUN - No changes will be made');
}
```

### 5. Use the Right Permission Level

Choose the appropriate `getReq` method based on what your task needs:
- `getReq()` or `getAdminReq()` - Most tasks (full access)
- `getAnonReq()` - Testing public visibility
- `getEditorReq()`, `getContributorReq()`, etc. - Testing specific permission levels

### 6. Validate Arguments

Check that required arguments are provided:

```javascript
if (!argv.filename) {
  console.error('Error: --filename argument is required');
  console.log(this.usage);
  process.exit(1);
}
```

## Invoking Tasks from Code

Sometimes you need to run a task from within your application code rather than from the command line. ApostropheCMS provides the `apos.task.invoke()` method for this:

<AposCodeBlock>

```javascript
// In an event handler or API route
async handler(req) {
  // Invoke a task with positional arguments
  await self.apos.task.invoke('@apostrophecms/user:add', [ 'username', 'admin' ]);

  // Invoke a task with options
  await self.apos.task.invoke('article:generate', { total: 50 });

  // Invoke with both positional arguments and options
  await self.apos.task.invoke('article:generate', [ 'technology' ], { total: 20 });
}
```
  <template v-slot:caption>
    Example of programmatic task invocation
  </template>
</AposCodeBlock>

::: info
While `invoke` is available, it's generally better to call the module's methods directly when possible. Use `invoke` only when you need to execute a task that's specifically designed as a CLI task or when you don't have direct access to the module's methods.
:::

## Conclusion

Command-line tasks are powerful tools that give you direct access to your ApostropheCMS data and business logic. By understanding how to create tasks, work with request objects, and handle arguments, you can automate maintenance operations, generate test data, perform migrations, and build custom tooling for your project.

The key concepts to remember:
- Define tasks in the `tasks(self)` section of your module
- Use `self.apos.task.getReq()` to create a request object with appropriate permissions
- Access arguments through the `argv` parameter
- Provide clear usage strings and helpful console output
- Handle errors gracefully and validate inputs

---

**Related Resources:**
- [Task Module Reference Documentation](/reference/modules/task.md)
- [Module Configuration - tasks(self) Section](/reference/module-api/module-overview.md#tasks-self)
- [Database Queries Guide](/guide/database-queries.md)