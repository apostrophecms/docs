# Introduction

## Heading Two

### Heading Three

#### Heading Four

#### Heading Four with an Ordinal {data-ordinal=02.}

Body copy: When COVID-19 shut last season down, the NBA had a golden opportunity to reevaluate problems that were bubbling beneath the surface. Ratings were dropping, the regular season was becoming a boring farce, and injuries—especially to star players—were increasing to the point of inevitability. 

Body copy large: When COVID-19 shut last season down, the NBA had a golden opportunity to reevaluate problems that were bubbling beneath the surface. [`GET /api/v1/@apostrophecms/page`](https://duckduckgo.com) Ratings were dropping, the regular season was becoming a boring farce, and injuries—especially to star players—were increasing to the point of inevitability. {.large}

`GET /api/v1/@apostrophecms/page`

```javascript code-light
const path = require('path');

require('apostrophe')({
  shortName: 'a3-demo',

  // See lib/modules for basic project-level configuration of our modules
  // responsible for serving static assets, managing page templates and
  // configuring user accounts.

  modules: {
    // Custom CSS classes for standard apostrophe widgets
    '@apostrophecms/rich-text-widget': {
      options: {
        className: 'demo-rte'
      }
    }
  }
});
```