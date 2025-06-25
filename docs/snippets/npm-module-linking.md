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

> [!TIP]
> This guide is for developers creating reusable ApostropheCMS extensions (npm packages) that can be installed across multiple projects. If you're just adding custom modules to a single ApostropheCMS project, you don't need this - simply create your modules directly in the project's `modules/` folder.

## Why This Matters

ApostropheCMS extensions are standalone npm packages that add functionality to multiple sites. When building these extensions, you need a reliable way to develop and test them locally before publishing to npm. However, ES Modules in Node.js handle symlinks differently than CommonJS, and ApostropheCMS's use of Vite for bundling creates additional complexity that breaks many traditional local development approaches.

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

When working on an extension that's already published to npm, you'll need to clone the extension's repository and link to your local git checkout:

**Step 1: Clone and prepare the extension repository**

<AposCodeBlock>

```bash
# Clone the extension's repository
git clone https://github.com/your-org/your-extension.git
cd your-extension

# Install the extension's dependencies
npm install
```

</AposCodeBlock>

**Step 2: Link to your ApostropheCMS project**

<AposCodeBlock>

```bash
# In your ApostropheCMS project directory
# Install the extension normally to add it as a dependency
npm install @your-org/your-extension

# Remove the installed npm version
rm -rf node_modules/@your-org/your-extension

# Create symbolic link to your git checkout
ln -s /absolute/path/to/your-extension-repo node_modules/@your-org/your-extension
```

</AposCodeBlock>

> [!IMPORTANT]
> Always use absolute paths when creating symbolic links. Relative paths are resolved from the symlink's location, not your current directory. For example, if you use `ln -s ../form node_modules/@apostrophecms/form`, the symlink will look for `../form` relative to `node_modules/@apostrophecms/`, which would be `node_modules/form` (likely non-existent). This creates a broken symlink that appears as an empty file icon.

**After linking, restart your ApostropheCMS development server** to ensure all changes are properly detected.

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

Workspaces work well when both your project and extension live in the same repository, providing automatic dependency linking without manual symlink management. You *may* require Vite configuration adjustments for complex setups::

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

**Step 1: Configure the workspace root**

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
    package.json
  </template>
</AposCodeBlock>

**Step 2: Reference the extension in your ApostropheCMS project**

<AposCodeBlock>

```json
{
  "name": "my-website",
  "dependencies": {
    "apostrophe": "^4.0.0",
    "@your-org/your-extension": "*"
  }
}
```
  <template v-slot:caption>
    my-website/package.json
  </template>
</AposCodeBlock>

**Step 3: Install and run**

<AposCodeBlock>

```bash
# From the workspace root
npm install

# Start your ApostropheCMS project
cd my-website
npm run dev
```

</AposCodeBlock>

npm workspaces automatically creates symbolic links between your extension and ApostropheCMS project, eliminating the need for manual linking. Changes to your extension code are immediately available in your project without restarting the development server.

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
