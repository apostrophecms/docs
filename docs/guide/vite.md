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

### Known Limitations and Solutions

### HMR Directory Watching
- **Limitation**: HMR only watches existing `anyModule/ui` directories
- **Solution**: After adding new `ui` directories, restart your development server:
  ```bash
  # If using nodemon (default)
  # Type 'rs' and press Enter in your terminal
  rs
  ```

### Troubleshooting Common Issues

### Missing Hot Updates
If changes aren't reflecting immediately:
1. Check your browser console for HMR connection errors
2. Verify the module's `ui` directory is being watched
3. Ensure you're using ESM syntax in affected files

### Build Errors
```bash
# Clear your build cache
node app @apostrophecms/asset:reset
npm run build

# Restart your development server
npm run dev
```

### Source Map Issues
If you're not seeing proper source maps in development:
1. Clear your browser's DevTools cache
2. Verify no source-map-related browser extensions are interfering
3. Check that the file paths in your imports are correct
