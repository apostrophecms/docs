# Caching

## Express Cache on Demand

Apostrophe uses [express-cache-on-demand](https://www.npmjs.com/package/express-cache-on-demand) to cache content under high load. This feature allows for similar and concurrent requests to compute the result only once. If multiple visitors request the same information at the same time, we load the content once and send it to both visitors. This works for regular page requests, and also for REST API GET requests when no user or session are involved.

Enabled by default, this feature can be disabled by setting `enableCacheOnDemand` to `false` in the options of the [`@apostrophecms/express` module](/reference/modules/express.html#options).

## Specifying a Cache Lifetime

While cache-on-demand is enabled by default, Apostrophe also supports sending cache headers to retain pages and REST API GET request responses for a specified amount of time. Since this means a user could see outdated content, up to the specified cache lifetime, it is not enabled by default.

Just as with `express-cache-on-demand`, Apostrophe always sends `Cache-Control: no-store` in the case of a logged-in user or a user with a populated `req.session`.

To enable the feature for ordinary page responses, set the `cache` option of the `@apostrophecms/page` module:

<AposCodeBlock>

```javascript
options: {
  cache: {
    page: {
      maxAge: 6000
    }
  }
}
```
<template v-slot:caption>
modules/@apostrophecms/page/index.js
</template>
</AposCodeBlock>

To also enable it for GET REST API responses for pages, set the `api` subproperty as well:

<AposCodeBlock>

```javascript
options: {
  cache: {
    page: {
      // Specified in seconds
      maxAge: 6000
    },
    api: {
      // Specified in seconds
      maxAge: 3000
    }
  }
}
```
<template v-slot:caption>
modules/@apostrophecms/page/index.js
</template>
</AposCodeBlock>

To enable it for GET REST API responses for a particular piece type, you can set the `cache` option for that module. Here the example is a project-level module named `article`:

<AposCodeBlock>

```javascript
extend: '@apostrophecms/piece-type',
options: {
  cache: {
    api: {
      // Specified in seconds
      maxAge: 3000
    }
  }
}
```
<template v-slot:caption>
modules/article/index.js
</template>
</AposCodeBlock>

You can also enable it for all piece types by enabling it for `@apostrophecms/piece-type`:

<AposCodeBlock>

```javascript
options: {
  cache: {
    api: {
      // Specified in seconds
      maxAge: 3000
    }
  }
}
```
<template v-slot:caption>
modules/@apostrophecms/piece-type/index.js
</template>
</AposCodeBlock>

Since custom piece types extend this module, configuring it at project level configures all of them with a new default. It is still possible to override the `cache` option in the individual modules.

## Advanced Cache Invalidation

The purpose of this feature is to generate `ETag` headers that allow the browser to check whether a page or piece has changed, reducing the amount of work done on the server. The actual caching is not performed in ApostropheCMS itself. To gain the full benefit of this strategy, you must implement a cache at the CDN level via a service such as CloudFlare, or do so in your reverse proxy server, e.g. `nginx`. Otherwise caching will only take place in individual web browsers.

- The cache of ordinary page responses is automatically invalidated when corresponding pages are modified
- The cache of `getOne` REST API page and piece responses, as well as `show` and `index` piece pages responses is automatically invalidated when corresponding documents are modified
- Editing a related document or a reverse related one will also trigger a cache invalidation

To enable the feature for ordinary page responses, set the `etags` option of the `@apostrophecms/page` module:

<AposCodeBlock>

```javascript
options: {
  cache: {
    page: {
      // Specified in seconds
      maxAge: 6000,
      etags: true
    }
  }
}
```
<template v-slot:caption>
modules/@apostrophecms/page/index.js
</template>
</AposCodeBlock>

To also enable it for GET REST API responses for pages, set it in the `api` subproperty as well:

<AposCodeBlock>

```javascript
options: {
  cache: {
    page: {
      // Specified in seconds
      maxAge: 6000,
      etags: true
    },
    api: {
      // Specified in seconds
      maxAge: 3000,
      etags: true
    }
  }
}
```
<template v-slot:caption>
modules/@apostrophecms/page/index.js
</template>
</AposCodeBlock>

To enable it for GET REST API responses for a particular piece type, you can set the `etags` option for that module:

<AposCodeBlock>

```javascript
extend: '@apostrophecms/piece-type',
options: {
  cache: {
    api: {
      // Specified in seconds
      maxAge: 3000,
      etags: true
    }
  }
}
```
<template v-slot:caption>
modules/article/index.js
</template>
</AposCodeBlock>

You can also enable it for all piece types by enabling it for `@apostrophecms/piece-type`:

<AposCodeBlock>

```javascript
options: {
  cache: {
    api: {
      // Specified in seconds
      maxAge: 3000,
      etags: true
    }
  }
}
```
<template v-slot:caption>
modules/@apostrophecms/piece-type/index.js
</template>
</AposCodeBlock>

Please note that even with the advanced cache invalidation system there will always be situations where caching allows a website visitor to see old content. Page content might differ based on an async component that fetches modified documents, or API calls to a third party service, or even the time of day.  
For this reason `maxAge` should always be set to a reasonable value to ensure the served content is never too old. Content is never cached for logged-in users.