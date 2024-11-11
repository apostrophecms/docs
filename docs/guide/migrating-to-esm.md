# Migrating to ESM in ApostropheCMS

Starting with version 4.9.0, ApostropheCMS supports ECMAScript Modules (ESM). This guide will help you convert your existing project to use ESM and understand why this transition is valuable for your development workflow.

::: info
If you are starting a new project, good news! You don't have to worry about modifying existing modules. Just fork the `vite-demo` branch of any starter kit. They are already setup as ESM projects.
:::

## Why Migrate to ESM?

The transition to ESM brings several significant advantages for ApostropheCMS developers:

ESM provides a modern, standardized module system that improves your development experience through better static analysis, enhanced debugging, and clearer dependency management. With ESM, you'll benefit from improved tree-shaking for smaller production builds and better code organization through explicit imports and exports.

Migrating to ESM enables Hot Module Replacement (HMR) when using ApostropheCMS's new Vite build system. HMR dramatically speeds up development by updating your modules in real-time without requiring a full page refresh, maintaining application state during code changes. This means you can modify your templates, components, or styles and see the changes instantly in your browser.

ESM is also the future of JavaScript modules. All major JavaScript frameworks and tools are moving towards ESM as the default module system, and new features in the JavaScript ecosystem are being built with ESM in mind. By migrating now, you're future-proofing your ApostropheCMS projects and ensuring compatibility with the latest development tools and practices.

## Understanding ESM vs CommonJS

When planning your migration, keep these key points in mind:

Your project must commit fully to either CommonJS (CJS) or ESM - they cannot be mixed at the project level. However, a project using either ESM or CJS may freely use node modules written with either ESM or CJS - there is compatibility at the npm level. Moving forward, all new ApostropheCMS starter kits and extension packages will use ESM as their default module system.

## Migration Steps

### 1. Update Package Configuration

Add the following to your `package.json` to enable ESM for your project:

```json
{
  "type": "module"
}
```

### 2. Modify App Configuration

Update your app.js configuration to use ESM syntax:

```javascript
// Before
require('apostrophe')({
  shortName: 'my-project',
  baseUrl: 'http://localhost:3000',
  modules: {
    // ... module configuration
  }
  // ... other configuration
});

// After
import apostrophe from 'apostrophe';

apostrophe ({
  root: import.meta,
  shortName: 'my-project',
  baseUrl: 'http://localhost:3000',
  modules: {
    // ... module configuration
  }
  // ... other configuration
});
```

The addition of `root: import.meta` is crucial for ESM support. This property helps ApostropheCMS correctly resolve file paths in an ESM context and enables features like HMR with Vite.

### 3. Update Import Statements

#### For Node Modules:
```javascript
// Before
const express = require('express');

// After
import express from 'express';
```

#### For Local Files:
```javascript
// Before
const myModule = require('./my-module');

// After
import myModule from './my-module.js';  // Note: .js extension is required
```

## Common Patterns and Examples

### Module Imports

```javascript
// Before
const { myModule } = require('@my/module');
const { existsSync } = require('fs');

// After
import { myModule } from '@my/module';
import { existsSync } from 'fs';
```

### Local Module Imports

```javascript
// Before
const myWidget = require('./modules/my-widget');
const config = require('./config/index');

// After
import myWidget from './modules/my-widget.js';
import config from './config/index.js';
```

## Best Practices

1. Always include the `.js` extension for local file imports
2. Use named exports where appropriate to improve code clarity
3. Consider updating your linting configuration to enforce ESM patterns
4. Test thoroughly after migration, especially custom modules and extensions

## Common Issues and Troubleshooting

### Missing File Extensions
If you encounter errors like `ERR_MODULE_NOT_FOUND`, ensure you've added `.js` extensions to all local file imports.

### __dirname and __filename
These CommonJS variables aren't available in ESM. Instead, use:

```javascript
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### Dynamic Imports
If you need to dynamically import modules:

```javascript
// Before
const module = require(`./modules/${moduleName}`);

// After
const module = await import(`./modules/${moduleName}.js`);
```

For example,
```javascript
// Instead of loading all locales upfront
import enTranslations from './locales/en.js';
import esTranslations from './locales/es.js';
import frTranslations from './locales/fr.js';

// You can load them dynamically based on user preference
async function loadTranslations(locale) {
  const translations = await import(`./locales/${locale}.js`);
  return translations.default;
}
```

## Next Steps

1. Update your CI/CD pipelines to account for ESM
2. Review and update any custom scripts or tools
3. Consider updating your development tools and IDE configurations
4. Test thoroughly in all environments

---

**Note**: While converting to ESM is recommended for new projects and updates, existing projects using CommonJS will continue to work. Choose the best time for your team to make this transition.