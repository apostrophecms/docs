---
title: "Passing Dashboard Data to Sites in the Multisite Pro extension"
detailHeading: "Pro"
url: "/tutorials/passing-site-data-in-multisite.html"
content: "Learn how to configure site-specific settings through the dashboard that automatically flow to individual sites, giving content managers control over site behavior without requiring code changes."
tags:
  topic: extensions
  type: pro
  effort: beginner
excludeFromFilters: true
---

# Passing Dashboard Data to Sites in the Multisite Pro extension

<!-- INSERT VIDEO HERE-->

## Why This Matters & Core Principles

Content managers shouldn't need developers to change basic site settings like email addresses, API keys, or feature toggles. In a multisite environment, the dashboard becomes your configuration interface - any field you add to the dashboard's `site` piece automatically becomes available when individual sites initialize.

This transforms routine configuration tasks from code deployments into simple form updates, reducing support tickets while giving content managers the autonomy they need.

When implementing dashboard-to-site data flow, prioritize:
- **Self-service configuration**: Enable site settings through familiar CMS interfaces
- **Reduced deployment overhead**: Configuration changes shouldn't require code releases
- **Consistent patterns**: Use predictable approaches for passing data to modules
- **Clear editor guidance**: Write helpful field labels and provide sensible defaults

## Understanding Multisite Project Structure

A multisite project has two key areas that work together:

- **`dashboard/`** - Contains the admin interface where editors manage all sites. The `dashboard/modules/site/index.js` file defines what fields editors see when configuring individual sites.
- **`sites/`** - Contains the configuration that generates individual sites. The `sites/index.js` file receives the data editors entered and uses it to configure modules and features.

The data flow is straightforward: editors fill out forms in the dashboard → that data gets passed to the sites configuration function → individual sites launch with the specified settings.

## How Data Flows from Dashboard to Sites

The multisite module passes the entire `site` object as a parameter to your sites configuration function. Any fields you add to the dashboard's `site` module become immediately available:

<AposCodeBlock>

```javascript
// At the dashboard level add configuration fields
export default {
  fields: {
    add: {
      fromAddress: {
        type: 'email',
        label: 'From Email Address',
        help: 'Default sender address for outgoing emails'
      },
      theme: {
        type: 'select',
        label: 'Site Theme',
        choices: [
          { label: 'Default', value: 'default' },
          { label: 'Demo', value: 'demo' }
        ]
      }
    }
  }
};
```
  <template v-slot:caption>
    dashboard/modules/site/index.js
  </template>
</AposCodeBlock>

<AposCodeBlock>

```javascript
// At the site level use the data to configure modules
export default async function (site) {
  const config = {
    theme: site.theme,
    modules: {
      '@apostrophecms/email': {
        options: {
          from: site.fromAddress || ''
        }
      },
      '@apostrophecms/form': {
        options: {
          email: {
            from: site.fromAddress
          }
        }
      }
    }
  };

  // Load theme-specific configuration
  const { default: theme } = await import(`./lib/theme-${site.theme}.js`);
  theme(site, config);

  return config;
};
```
  <template v-slot:caption>
    sites/index.js
  </template>
</AposCodeBlock>

## Theme-Based Module Loading

Using separate theme files keeps your main configuration clean while allowing themes to enable different module sets. Each theme function receives the site data and the base configuration object, then adds theme-specific modules and settings:

<AposCodeBlock>

```javascript
// Simple theme with minimal modules
export default function(site, config) {
  // The theme function modifies the config object by adding modules
  config.modules = {
    ...config.modules,
    'theme-default': {}
  };
};
```
  <template v-slot:caption>
    sites/lib/theme-default.js
  </template>
</AposCodeBlock>

<AposCodeBlock>

```javascript
// Feature-rich theme with additional modules
export default function (site, config) {
  config.modules = {
    ...config.modules,
    'theme-demo': {
      options: {
        shortName: site.shortName
      }
    },
    'advanced-gallery': {},
    'portfolio-showcase': {},
    'animation-widgets': {}
  };
};
```
  <template v-slot:caption>
    sites/lib/theme-demo.js
  </template>
</AposCodeBlock>

## Practical Configuration Examples

**API Keys and Service Configuration:**
```javascript
// Dashboard field
mailchimpApiKey: {
  type: 'string',
  label: 'Mailchimp API Key',
  help: 'Used for newsletter signups'
}

// Site usage
'newsletter-signup': {
  options: {
    apiKey: site.mailchimpApiKey
  }
}
```

**Feature Toggles:**
```javascript
// Dashboard field
enableBlog: {
  type: 'boolean',
  label: 'Enable Blog Features'
}

// Site usage
// Conditionally add blog modules if enabled
...(site.enableBlog && {
  article: {},
  'article-page': {},
  'blog-widget': {}
})
```

**Conditional Module Loading:**
```javascript
// Theme file can check site properties
export default function (site, config) {
  config.modules = {
    ...config.modules,
    'theme-corporate': {},

    // Only enable e-commerce for premium sites
    ...(site.planLevel === 'premium' && {
      'shopping-cart': {},
      'payment-processor': {}
    })
  };
};
```

## Site Updates and Reinitialization

When content managers update site settings in the dashboard, the affected site automatically reinitializes on the next request with the new configuration. No server restart required - changes take effect immediately.

## Conclusion

Dashboard-to-site data passing transforms the multisite management experience from a developer-centric workflow to a content manager-empowered system. By thoughtfully designing your site piece schema in the dashboard with clear labels, helpful guidance, and sensible defaults, you create powerful self-service capabilities that reduce support overhead while maintaining the security and consistency your applications require.

---

**Related Resources:**
- [ApostropheCMS Multisite Extension Documentation](https://apostrophecms.com/extensions/multisite-apostrophe-assembly)
- [ApostropheCMS Multisite Dashboard Documentation](https://apostrophecms.com/extensions/multisite-dashboard)