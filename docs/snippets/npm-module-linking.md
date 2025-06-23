---
title: "Local Development of ApostropheCMS Extensions"
detailHeading: "Tutorial"
url: "/tutorials/local-extension-development.html"
content: "Learn how to develop and test ApostropheCMS extensions locally without running into ES Module import resolution problems. This guide covers reliable approaches that work with Vite bundling and provides troubleshooting tips for common issues."
tags:
  topic: "development"
  type: tutorial
  effort: intermediate
---
# Local Development of ApostropheCMS Extensions

## Why This Matters

When building custom extensions for ApostropheCMS, you need a reliable way to develop and test them locally before publishing to npm. However, ES Modules in Node.js handle symlinks differently than CommonJS, and ApostropheCMS's use of Vite for bundling creates additional complexity that breaks many traditional local development approaches.

This guide shows you proven methods for local extension development that work reliably with the modern ApostropheCMS toolchain.

## The Problem 🔍

ES Modules have stricter rules for resolving module paths through symlinks compared to CommonJS. Additionally, Vite's dependency resolution system can fail when:
- Extensions are linked using traditional `npm link`
- File-based dependencies create circular resolution paths
- Symlinks don't properly resolve nested dependencies

These issues manifest as import errors, missing dependencies, or build failures that can be frustrating to debug.

## Recommended Solutions ✅

### 1. Manual Symbolic Links (Most Reliable)

Based on extensive testing with ApostropheCMS projects, manual symbolic links provide the most reliable development experience with Vite:

#### For Published Extensions

When working on an extension that's already published to npm:

<AposCodeBlock>

```bash
# In your ApostropheCMS project directory
# First, install the extension normally
npm install @your-org/your-extension

# Create symbolic link (use absolute path)
ln -s /absolute/path/to/your/local/extension node_modules/@your-org/your-extension
```

</AposCodeBlock>

#### For New (Unpublished) Extensions

When developing a brand-new extension:

<AposCodeBlock>

```bash
# In your extension directory
npm install

# In your ApostropheCMS project
mkdir -p node_modules/@your-org

# Create the symbolic link
ln -s /absolute/path/to/your/extension node_modules/@your-org/your-extension

# Install any peerDependencies listed in your extension's package.json
npm install dependency-a dependency-b
```

</AposCodeBlock>

> [!IMPORTANT]
> Always use absolute paths when creating symbolic links. Relative paths can cause resolution issues with Vite's dependency scanning.

**After linking, restart your ApostropheCMS development server** to ensure all changes are properly detected.

### 2. npm Workspaces (For Monorepos)

Workspaces work well when both your project and extension live in the same repository, but may require Vite configuration adjustments for complex setups:

<AposCodeBlock>

```
apostrophe-monorepo/
├── package.json              # Workspace root
├── my-website/               # Your ApostropheCMS project
│   ├── package.json
│   └── app.js
└── packages/
    └── your-extension/       # Your extension
        ├── package.json
        └── index.js
```
  <template v-slot:caption>
    Project Structure
  </template>
</AposCodeBlock>

Configure the root package.json:

<AposCodeBlock>

```json
{
  "name": "apostrophe-monorepo",
  "private": true,
  "workspaces": [
    "my-website",
    "packages/*"
  ]
}
```
  <template v-slot:caption>
    package.json (root)
  </template>
</AposCodeBlock>

Reference the extension in your website's package.json:

<AposCodeBlock>

```json
{
  "dependencies": {
    "@your-org/your-extension": "workspace:*"
  }
}
```
  <template v-slot:caption>
    my-website/package.json
  </template>
</AposCodeBlock>

## Approaches to Avoid ❌

### `npm link`

Standard `npm link` typically fails with ApostropheCMS and Vite due to:
- Dependency resolution conflicts
- Vite unable to properly scan linked dependencies
- Import path resolution errors in ES Modules

### `file:` Dependencies

Using `file:` references often causes Vite build errors:
```
Rollup failed to resolve import "[dependency]" from "[path]"
```

### `--preserve-symlinks` Flag

This Node.js flag doesn't resolve the Vite-specific dependency scanning issues in ApostropheCMS.

## Troubleshooting Tips

### Extension Not Found After Linking

1. Verify the symbolic link was created correctly:
   ```bash
   ls -la node_modules/@your-org/
   ```

2. Check that your extension's `package.json` has the correct `name` field

3. Restart the ApostropheCMS development server

### Vite Build Errors

If you encounter Vite build errors after linking:

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   # Recreate your symbolic links
   ```

2. Check for conflicting dependency versions between your extension and main project

3. Ensure your extension's dependencies are also installed in the main project

### Module Resolution Issues

If imports fail to resolve:

1. Verify your extension exports are properly defined in `package.json`:
   ```json
   {
     "type": "module",
     "main": "index.js",
     "exports": {
       ".": "./index.js"
     }
   }
   ```

2. Check that file extensions are included in import statements if required

## Best Practices

**Use Absolute Paths**: Always use absolute paths when creating symbolic links to avoid resolution ambiguity.

**Restart Development Server**: After linking or unlinking extensions, restart your ApostropheCMS development server to ensure proper module resolution.

**Version Alignment**: Keep dependency versions aligned between your extension and main project to avoid conflicts.

**Test Before Publishing**: Always test your extension in a clean environment before publishing to npm to catch dependency issues early.

## Conclusion

Manual symbolic links provide the most reliable approach for local ApostropheCMS extension development. While workspaces can work for monorepo setups, the symbolic link approach gives you the flexibility to develop extensions independently while maintaining compatibility with Vite's build system.

Remember to restart your development server after making linking changes, and always test in a clean environment before publishing your extensions.
