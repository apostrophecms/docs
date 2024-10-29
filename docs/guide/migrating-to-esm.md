# Migrating to ESM in ApostropheCMS

Starting with version 4.9.0, ApostropheCMS supports ECMAScript Modules (ESM). This guide will help you convert your existing project to use ESM.

## Understanding ESM vs CommonJS

Before beginning the migration, it's important to understand a few key points:

- At the project level, you must choose either CommonJS (CJS) or ESM - they cannot be mixed
- Node packages can support both ESM and CJS through dual packaging
- All new ApostropheCMS starter kits and extension packages will use ESM going forward

## Migration Steps

### 1. Update Package Configuration

Add the following to your `package.json`:

```json
{
  "type": "module"
}
```

### 2. Modify App Configuration

In your `app.js`, update the root configuration:

```javascript
// Before
module.exports = {
  // ... configuration
};

// After
export default {
  root: import.meta,
  // ... configuration
};
```

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
const { apos } = require('@apostrophecms/apostrophe');
const { existsSync } = require('fs');

// After
import { apos } from '@apostrophecms/apostrophe';
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
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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