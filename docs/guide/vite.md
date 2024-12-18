# Vite

[Vite](https://vite.dev/) is a modern build tool that significantly improves the development experience. Unlike traditional bundlers like webpack, Vite leverages native ES modules in the browser to enable faster builds and updates. During development, when using UI frameworks that support Hot Module Replacement (HMR) like Vue, React, or Svelte, your changes appear instantly in the browser without rebuilding the entire bundle or refreshing the page. For vanilla JavaScript or frameworks without HMR support, Vite still provides fast page reloads on changes. When building for production, Vite uses Rollup to create highly optimized assets.

For ApostropheCMS projects, this translates to faster development cycles, improved debugging with better source maps, and a more streamlined build process that requires less configuration. The dev server starts up instantly regardless of your application size, and HMR updates happen in milliseconds rather than seconds.

Using Vite in an ApostropheCMS project, rather than the default webpack build, is currently in beta. However, moving forward, webpack will slowly be deprecated. At this time we encourage you to test the new build in your `dev` environment. If you want to take advantage of HMR in your project-level non-Admin UI code, we recommend you start any new project using ESM modules in your frontend code. You can see the steps to begin this migration in our [documentation](/guide/migrating-to-esm). While HMR will work out of the box for the Admin UI with `hmr: 'apos'`, project-level code will need to use ESM syntax to get the full benefits of using Vite. Using CommonJS (e.g., require or module.exports) will break Vite builds due to incompatibility with Rollup, so it’s essential to switch to ESM syntax before using `hrm: 'public'`.

## Installation
Moving forward, all of our starter kits will have the Vite build option available. If you are creating a project from scratch without a starter kit, or want to enable Vite builds in an existing project you can install the package from npm.

```bash
npm install @apostrophecms/vite
```

The package then needs to be added to the `app.js` file:

<AposCodeBlock>

```javascript
require('apostrophe')({
  shortName: 'my-project',
  modules: {
    '@apostrophecms/vite': {},
  }
});
```
  <template v-slot:caption>
    app.js
  </template>

</AposCodeBlock>

## Core Features and Configuration

The Vite bundler for ApostropheCMS comes with sensible defaults while remaining highly configurable. Hot Module Replacement (HMR) is enabled out of the box for ESM project code, allowing you to see your changes instantly without a full page refresh.

### Hot Module Replacement

HMR can be configured in three modes using the `@apostrophecms/asset` options:

<AposCodeBlock>

```javascript
// in app.js
require('apostrophe')({
  shortName: 'my-project',
  modules: {
    '@apostrophecms/vite': {},
    '@apostrophecms/asset': {
      options: {
        // Choose one of these HMR options:
        hmr: 'public',  // Default - enables HMR for project UI
        hmr: 'apos',    // Enables HMR for Admin UI
        hmr: false      // Disables HMR completely
      }
    }
  }
});
```
 <template v-slot:caption>
    app.js
  </template>

</AposCodeBlock>

::: info
If you use the `hmr: 'apos'` option, we recommend you do not pass the `APOS_DEV` flag. The Vite build will selectively update altered code leading to a better development experience than `APOS_DEV=1`, which upon process reload will force rebuilding of the `apos` build. Vite is not using the build assets, so this doesn't make sense.
:::

### WebSocket Configuration

By default, the HMR WebSocket server runs on your ApostropheCMS server port, typically port 3000. For cases where you need a separate port (like running behind certain proxy configurations), you can configure a custom port:

<AposCodeBlock>

```javascript
'@apostrophecms/asset': {
  options: {
    hmrPort: 3001  // Sets a custom WebSocket server port
  }
}
```
  <template v-slot:caption>
    app.js
  </template>
</AposCodeBlock>

### Source Maps in Production

For debugging production builds, you can enable source maps to see the original source code in your browser's developer tools:

<AposCodeBlock>

```javascript
'@apostrophecms/asset': {
  options: {
    productionSourceMaps: true  // Exposes source maps in production
  }
}
```
  <template v-slot:caption>
    app.js
  </template>
</AposCodeBlock>

### Default Public Build Configuration

While the `apos` build (code in `/ui/apos/` directories) is fully preconfigured, the `public` build (code in `/ui/src/`) comes with minimal configuration to give you more flexibility. Here's what's included by default:

1. **Core Features**:
   - PostCSS plugin for essential ApostropheCMS features (e.g., "Breakpoint Preview" when enabled)
   - `Modules/` alias for simplified module imports within `/ui/src/`
   - `@/` alias for cross-module and cross-build access

2. **Everything Else**:
   For additional features or frameworks, you'll need to configure them yourself. Common examples include:

   ```javascript
   // apos.vite.config.js
   import { defineConfig } from '@apostrophecms/vite/vite';
   import vue from '@vitejs/plugin-vue';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [
       // Add framework support
       vue(),
       // or
       react(),

       // Add other Vite plugins as needed
       imagemin({
         // image optimization options
       })
     ],
     css: {
       // Additional PostCSS plugins
       postcss: {
         plugins: [
           autoprefixer(),
           tailwindcss()
         ]
       },
       // Preprocessor options
       preprocessorOptions: {
         scss: {
           additionalData: `$theme: "light";`
         }
       }
     }
   });
   ```

### Framework-Specific Configuration

When adding UI frameworks to your project, you'll need to:

1. Install the framework and its Vite plugin:
   ```bash
   # For Vue
   npm install vue @vitejs/plugin-vue
   
   # For React
   npm install react react-dom @vitejs/plugin-react
   ```

2. Configure the plugin in your Vite config
3. Follow the framework's best practices for file organization within your `ui/src/` directory

::: tip
Remember that while you have full control over the public build configuration, it's best to start minimal and add only what you need to keep your build process efficient.
:::

## Built-in Aliases

ApostropheCMS's Vite integration provides two powerful path aliases to simplify imports in your project:

### The `Modules/` Alias

The `Modules/` alias is available for both public and admin UI builds. It allows you to import modules without worrying about relative paths, but restricts you to sources inside `ui/src/` directories.

```javascript
// Current file: modules/another-module/ui/src/index.js
// Actual import path: modules/some-module/ui/src/lib/utils.js
import utils from 'Modules/some-module/lib/utils.js';
```

### The `@/` Alias

The `@/` alias is available for both public and admin UI builds and provides access to your entire project's source code. It follows the same path as your original source code but skips the `ui/` part of the path.

```javascript
// Current file: any file in any module inside of the `ui/` folder
// Actual path: modules/some-module/ui/src/lib/utils.js
import utils from '@/some-module/src/lib/utils.js';

// Actual path: modules/some-module/ui/apos/mixins/SomeMixin.js
import SomeMixin from '@/some-module/apos/mixins/SomeMixin.js';
```

### Important Considerations

When using the `@/` alias:
- You can access `public` builds from within the `apos` build, and vice versa
- Use with caution as it might lead to import resolution issues if:
  - The imported file contains `Modules/` aliased imports
  - Deep imports within the imported file contain `Modules/` aliased imports
- Benefits of using `@/`:
  - More developer-friendly
  - Enables auto-completion in supported editors
  - More intuitive and readable paths
- Best practices:
  - Include mostly sources from your current build
  - Ensure imported sources don't contain `Modules/` aliased imports when cross-importing

### Editor Configuration

To enable proper path resolution and autocompletion in your code editor, add a `jsconfig.json` file to your project root:

```json
{
  "compilerOptions": {
    "baseUrl": "./apos-build/@apostrophecms/vite/default",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Note:** If you've changed your project asset namespace from the default, adjust the `baseUrl` and `exclude` paths accordingly. For example, with a namespace of `my-namespace`:
- `baseUrl` should be `./apos-build/@apostrophecms/vite/my-namespace`
- `exclude` should include `apos-build/@apostrophecms/vite/my-namespace/dist`

:::warning
When following imports in your editor (e.g., Ctrl + Click in VSCode), you'll be taken to the `apos-build` directory rather than the original source code. This is because the `apos-build` directory contains a complete copy of your project's source code (including Admin UI) from all modules (local and npm) and serves as Vite's actual source directory for building the project.
:::

## Asset Handling

The Vite integration allows direct imports of static assets like images, fonts, and other files, as well as Sass files, in both public and admin UI builds.

### Importing Static Assets

You can import assets directly in your JavaScript/framework code:

```javascript
// Using aliases or relative paths
// Actual path: modules/some-module/ui/assets/logo.svg
import logo from '@/some-module/assets/logo.svg';
// The logo variable now contains the normalized path to the image
```

#### Framework-Specific Asset Imports

**Vue**
```vue
<template>
  <!-- Direct template imports -->
  <img src="@/some-module/assets/logo.svg" alt="My logo" />
</template>
```

**React**
```jsx
import logo from '@/some-module/assets/logo.svg';

function MyComponent() {
  return <img src={logo} alt="My logo" />;
}
```

### Importing Sass

You can import Sass files using standard import syntax:

```scss
/* Using aliases or relative paths */
/* Actual path: modules/some-module/ui/scss/_styles.scss */
@use '@/some-module/scss/styles';
```

### CSS URL Resolution

There are two ways to resolve URLs in your CSS:

1. **Using the Public Folder**
```css
/* File location: ./modules/some-module/public/font.ttf */
@font-face {
  font-family: MyFont;
  src: url("/modules/some-module/font.ttf") format("truetype");
}
```

2. **Using Source Root Path**
```css
/* File location: ./modules/some-module/ui/fonts/font.ttf */
@font-face {
  font-family: Inter;
  src: url("/src/some-module/fonts/font.ttf") format("truetype");
}
```

::: tip
You can inspect the sources in the `apos-build/@apostrophecms/vite/default` directory to understand how Vite resolves these paths when building your project.
:::

## Extending Vite Configuration

ApostropheCMS's Vite integration provides two methods to customize your Vite configuration. You can either configure it through your module's code or via a dedicated configuration file in your project root.

### Method 1: Module Configuration

Use the `build.vite` property in your module to extend Vite's configuration:
<AposCodeBlock>

```javascript
module.exports = {
  build: {
    vite: {
      myViteConfig: {
        // Vite configuration options
        define: {
          __API_URL__: JSON.stringify('https://api.example.com'),
          __ANALYTICS_ENDPOINT__: JSON.stringify(process.env.ANALYTICS_URL)
        },
        css: {
          // CSS configuration options
          preprocessorOptions: {
            scss: {
              additionalData: `$injectedColor: orange;`
            }
          }
        }
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/analytics/index.js
  </template>
</AposCodeBlock>

### Method 2: Project Configuration File

For project-wide Vite settings, create either apos.vite.config.js (if your project uses ESM with "type": "module" in package.json) or apos.vite.config.mjs (if your project uses CommonJS) in your project root. The configuration code inside the file should always use ESM syntax regardless of your project type:

<AposCodeBlock>

```javascript
import { defineConfig } from '@apostrophecms/vite/vite';

export default defineConfig({
  // All standard Vite configuration options are supported
  plugins: [
    // Add Vite plugins
    svgLoader({
      svgoConfig: {/* custom SVG optimization options */}
    })
  ],
  build: {
    rollupOptions: {
      // Customize underlying Rollup bundle
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
});
```
  <template v-slot:caption>
    apos.vite.config.js
  </template>

</AposCodeBlock>

## Common Configuration Options

Here are some frequently used Vite configuration options:

- **define**: Replace constants in your code during build time
- **plugins**: Add Vite plugins for additional functionality
- **css**: Configure CSS processing and preprocessors
- **build**: Customize build output and bundling behavior
- **optimizeDeps**: Control dependency pre-bundling

In most cases, any **server** options shouldn't be touched in the Vite config. For a complete list of available options, refer to the [Vite Configuration Documentation](https://vitejs.dev/config/).

## Development-Specific Features

### Conditional Code Injection

When building UI components, you may want certain elements to appear only during development or when HMR is active. ApostropheCMS's Nunjucks components system makes this easy to manage.

### Component Setup

First, create your component template:

<AposCodeBlock>

```njk
<div class="dev-tools">
  <!-- Your development-only UI here -->
  <div class="dev-tools__status">HMR Active</div>
  <div class="dev-tools__reload">Force Refresh</div>
</div>
```
  <template v-slot:caption>
    modules/devTools/views/devTools.html
  </template>

</AposCodeBlock>

Then, register and configure the component in your module:

<AposCodeBlock>

```javascript
module.exports = {
  components(self) {
    return {
      devTools(req, data) {
        return {
          // Component data here
          status: 'connected'
        };
      }
    };
  },
  init(self) {
    // Insert the component into the page
    self.apos.template.prepend({
      where: 'head',  // or 'body', 'footer', etc.
      when: 'hmr',    // Show only when HMR is active
      bundler: 'vite', // Ensure Vite is the active bundler
      component: 'my-module:devTools'
    });
  }
};
```
  <template v-slot:caption>
    modules/devTools/index.js
  </template>

</AposCodeBlock>

### Visibility Options

The when option controls when your component appears:

```javascript
when: 'hmr'   // Only visible when HMR is active
when: 'dev'   // Visible in any development mode
when: 'prod'  // Only visible in production
```

The bundler option allows you to specify which bundler must be active for the component to appear:

```javascript
bundler: 'vite'    // Only visible when using Vite
bundler: 'webpack' // Only visible when using webpack
```

You can combine these options to precisely control when your component appears. For example, to show a component only when using Vite with HMR active, you would use both `when: 'hmr'` and `bundler: 'vite'`.

### Common Use Cases

- Development toolbars
- Debug information
- Performance monitoring
- Asset reload buttons

::: warning
Remember that components marked with `when: 'dev'` or `when: 'hmr'` will never appear in production, regardless of other settings.
:::

## Migration and Technical Considerations

### Moving from Webpack to Vite

When migrating your ApostropheCMS project to use Vite, you'll need to make a few code adjustments:

1. **Update CSS/Sass Imports**
   ```scss
   // Old webpack style
   @import "~normalize.css";
   
   // New Vite style - remove the ~ prefix
   @import "normalize.css";
   ```

2. **Update Module Import Paths**
   ```javascript
   // Not recommended
   import Component from 'apostrophe/modules/module-name/ui/apos/components/Component.vue';
   
   // Recommended - use the alias
   import Component from 'Modules/module-name/components/Component.vue';
   ```

3. **Convert to ESM Syntax**
   ```javascript
   // Remove CommonJS syntax
   const myComponent = require('./component');
   module.exports = myComponent;
   
   // Use ESM instead
   import myComponent from './component.js';  // Note: File extension required
   export default myComponent;

   // When importing your own modules, always include the file extension
   import { helper } from './utils.js';
   import styles from './styles.css';
   import template from './template.html';
   ```

::: info
ESM requires file extensions in import paths. Always include `.js`, `.css`, `.vue`, etc. when importing your own modules. This is different from webpack, which allowed omitting extensions.
:::
## Known Limitations and Solutions

### HMR Limitations

1. **New UI Directories**
   - **Issue**: HMR only watches existing `anyModule/ui` directories
   - **Solution**: After adding new `ui` directories, restart your development server:
     ```bash
     # Using nodemon (default setup)
     rs
     ```

2. **Vue and Admin UI**
   - **Issue**: Admin UI HMR (`hmr: 'apos'`) won't work when the public build contains Vue sources
   - **Solution**: Use separate pages for Vue development, or stick to `hmr: 'public'` when working with Vue components
   - **Note**: Public build HMR continues to work as expected

### Public Assets

- **Issue**: Changes to `ui/public` directories don't trigger HMR or page reloads
- **Solution**: Add the directories to your nodemon watch list in `package.json`:
  ```json
  {
    "nodemonConfig": {
      "watch": [
        "./app.js",
        "./modules/**/*",
        "./lib/**/*.js",
        "./views/**/*.html",
        "./modules/*/ui/public/**/*"
      ]
    }
  }
  ```

### Build and Performance

1. **Source Map Issues**
   - **Issue**: Source maps not working correctly in development
   - **Solutions**:
     - Clear your browser's DevTools cache
     - Disable source-map-related browser extensions
     - Verify file paths in your imports are correct

2. **Build Errors**
   - If you encounter build errors, try clearing your build cache:
     ```bash
     node app @apostrophecms/asset:reset
     npm run build
     ```

### Common Workarounds

- For most issues, try these steps in order:
  1. Clear your browser cache
  2. Reset the asset build
  3. Restart your development server
  4. Check the browser console for specific error messages

::: tip
Remember to check the terminal output and browser console for specific error messages. Most HMR issues will show clear error messages indicating the problem.
:::