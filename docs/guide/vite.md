# Vite

[Vite](https://vite.dev/) is a modern build tool that significantly improves the development experience. Unlike traditional bundlers like webpack, Vite leverages native ES modules in the browser to enable lightning-fast hot module reloading (HMR) and on-demand compilation. During development, this means your changes appear instantly in the browser without rebuilding the entire bundle. When building for production, Vite uses Rollup to create highly optimized assets.

For ApostropheCMS projects, this translates to faster development cycles, improved debugging with better source maps, and a more streamlined build process that requires less configuration. The dev server starts up instantly regardless of your application size, and HMR updates happen in milliseconds rather than seconds.

Using Vite in an ApostropheCMS project, rather than the default webpack build, is currently in beta. However, moving forward, webpack will slowly be deprecated. At this time we encourage you to test the new build in your `dev` environment.

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

The Vite bundler for ApostropheCMS comes with sensible defaults while remaining highly configurable. Hot Module Reloading (HMR) is enabled out of the box for project UI code, allowing you to see your changes instantly without a full page refresh.

### Hot Module Reloading

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
If you use the `hmr: 'apos'` option, you don't need to pass the `APOS_DEV` flag when editing components of the Admin UI. The Vite build will selectively update altered code leading to a better development experience than `APOS_DEV=1`, which will rebuild the entirety of the Admin UI code.
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

::: tip
Source maps slightly increase your build size but are invaluable for debugging production issues. Consider your specific needs when enabling this option.
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
        },
        optimizeDeps: {
          // Dependencies optimization options
          include: ['lodash', 'moment']
        },
        server: {
          // Development server options
          https: true,
          port: 3000
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

For project-wide Vite settings, create either `apos.vite.config.js` (ESM) or `apos.vite.config.mjs` (CJS) in your project root:

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
  resolve: {
    alias: {
      '@components': '/src/components',
      '@styles': '/src/styles'
    }
  },
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
- **resolve.alias**: Create import aliases for cleaner imports
- **css**: Configure CSS processing and preprocessors
- **build**: Customize build output and bundling behavior
- **server**: Configure development server settings
- **optimizeDeps**: Control dependency pre-bundling

For a complete list of available options, refer to the [Vite Configuration Documentation](https://vitejs.dev/config/).

::: warning
When creating aliases that reference ApostropheCMS core or module code, the proper syntax for referencing the compiled apos-build directory is still being developed. For now:

* Use the built-in alias `Modules/module-name/components/...` for accessing ApostropheCMS module components
* Project-specific aliases (pointing to your own source code) work as normal using standard Vite alias syntax
:::

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

The `when` option controls when your component appears:

```javascript
when: 'hmr'   // Only visible when HMR is active
when: 'dev'   // Visible in any development mode
when: 'prod'  // Only visible in production
```

You can combine these with `bundler: 'vite'` to ensure your component only appears when using the Vite bundler.

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

### Known Limitations and Solutions

### HMR Directory Watching
- **Limitation**: HMR only watches existing `anyModule/ui` directories
- **Solution**: After adding new `ui` directories, restart your development server:
  ```bash
  # If using nodemon (default)
  # Type 'rs' and press Enter in your terminal
  rs
  ```

### Static Assets in `ui/public`
- **Limitation**: Changes to `ui/public` don't trigger HMR/page reload
- **Workaround**: Add these directories to your `nodemon` watch list:
  ```json
  {
    "watch": [
      "app.js",
      "./modules/**/*",
      "./lib/**/*",
      "./src/**/*",
      "**/ui/public/**/*"
    ]
  }
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
rm -rf apos-build
npm run build

# Restart your development server
npm run dev
```

### Source Map Issues
If you're not seeing proper source maps in development:
1. Clear your browser's DevTools cache
2. Verify no source-map-related browser extensions are interfering
3. Check that the file paths in your imports are correct
