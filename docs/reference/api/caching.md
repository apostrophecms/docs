# Caching

## Express Cache on Demand

Implementation of [express-cache-on-demand](https://www.npmjs.com/package/express-cache-on-demand). It allows for similar and concurrent requests to compute the result only once. If multiple users request the same route at the same time, we load the content once, and send it to users instead of loading it for each request. It works for pages and pieces get requests when no user or session are involved.
Enabled by default, it can be disabled by setting `enableCacheOnDemand` to `false` in [express module options](/reference/modules/express.html#options).