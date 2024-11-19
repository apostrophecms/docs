# Using Apostrophe as a headless CMS

Apostrophe is fully featured as a traditional CMS. It is also immediately ready for use as a headless CMS. There are many scenarios where Apostrophe works well in a decoupled architecture, including:

- We may want to use Apostrophe to serve webpages normally, but also use the website data in another context, such as a mobile app.
- We may want to go fully headless with a front end like Gatsby or Gridsome while also allowing editors to use Apostrophe's in-context editing.
- We may have an app that handles features such as e-commerce but need a CMS to create and pipe content into the app.

Regardless of the reason or the layers involved there are some common concepts to understand.

## Accessing data using the REST APIs

Before going further, keep in mind that there is an [API route reference section](/reference/api/README) that will include much of the following information in a more direct format. One section there that will not be fully covered in this guide will be the [authentication APIs](/reference/api/authentication.md). There are a few options for authentication discussed there.

One of the more common use cases for a headless CMS is to simply get data from the CMS for a public website built with React, Vue.js or some other framework. Since the certain data is publicly available in the front-end application, we can simply make that data publicly available directly through the REST API using [a `publicApiProjection` option](/reference/api/authentication.md#allowing-public-access) on the doc type. This will only apply to `GET` requests.

<AposCodeBlock>

```javascript
module.exports = {
  // ...
  options: {
    publicApiProjection: {
      title: 1,
      slug: 1,
      _url: 1,
      _author: 1,
      main: 1,
      thumbnail: 1
    }
  }
};
```
  <template v-slot:caption>
    modules/article/index.js
  </template>
</AposCodeBlock>

We would add a `publicApiProjection` object for each piece type or page type that the front end app accesses. Since the REST APIs for Apostrophe content are immediately ready there is no other configuration needed inside Apostrophe for a basic one-way data flow.

## Getting piece data from the REST API

Requesting and using [piece](/guide/pieces.md) data should seem familiar to developers who have used a headless data source before. It is returned from the API request as an array of objects, each of which is an individual piece. Those results are paginated to send a limited number from any single request.

REST API routes are automatically constructed using the application's base URL, an API prefix (`/api/v1/`), the name of a content type module, and possibly a document ID. If using an API key for authentication, that would be added at the end in a query parameter as normal. For example, making a request for an *`article`* piece type from a website at `https://example.rocks` would use a URL like:

```
https://example.rocks/api/v1/article
```

When using Apostrophe as a headless CMS, we will most frequently be making `GET` requests from the Apostrophe app (see the [pieces API reference](/reference/api/pieces.md) for more on other request types). There are two main types of `GET` requests we should think about: a "get all" request and a "get one" request.

### Get all the pieces!

To make a **"get all"** request, hit the URL as described above. Using the Node.js `node-fetch` utility, such a request in a front end application might look like:

```javascript
async function getArticles() {
  const response = await fetch('http://example.rocks/api/v1/article', {
    method: 'GET'
  });

  return response.results;
}

try {
  const articles = await getArticles();
  // Do something with the articles!
} catch (error) {
  // Handle the error
}
```

Assuming the request goes through well, it will return an object with three properties:

- `results`: an array of piece objects, limited to 10 pieces by default
- `pages`: the total number of possible "pages" of results for this request
- `currentPage`: the page number for that request (`1` for this first request)

With that information we can make additional requests for more pages of results until we have as much data as we need.

### Get one piece

The **"get one"** type of request works similarly. Following the standard REST pattern, we add a document ID to the end of the previous request route URL to get only one result back. Each "get all" result object will include an `_id` property. Let's say that one `_id` was `j8e6n7n5y309:en:published`. We would make the request to:

```
GET https://example.rocks/api/v1/article/j8e6n7n5y309:en:published
```

The response to that successful request will be [a single piece object](/reference/api/pieces.md#piece-document-response-example).

## Getting page data from the REST API

Page REST API requests look very similar to piece requests. They follow the same REST API pattern:

```
# The home page and first-level children
GET https://example.rocks/api/v1/@apostrophecms/page

# A single page with document _id `903y5n76e8j:en:published`
GET https://example.rocks/api/v1/@apostrophecms/page/903y5n76e8j:en:published
```

The module name used for these requests is always `@apostrophecms/page`, the module that manages pages in Apostrophe. The response for a "get one" request is also similar to a single piece `GET` request. It is a single page object with the page data properties immediate at the top level.

The response for page "get all" requests work differently by default. This is because it reflects that pages have a hierarchical structure. The home page is the "parent" of the top-level pages, which then have additional "child" pages, and so on. As such, the response to a "get all" route as written above looks something like this:

``` json
{
    "_id": "ckhdscx5900054z9k88uqs16w",
    "title": "Home Page",
    "slug": "/",
    // ... additional properties
    "_url": "http://localhost:3000/",
    "_ancestors": [],
    // Child pages 👇
    "_children": [
        {
            "_id": "ckhfen8ls0005mq9k8p9izkjt",
            "title": "Blog",
            "slug": "/blog",
            // ... additional properties
            "_url": "http://localhost:3000/blog",
            "_children": []
        },
        {
            "_id": "ckhurshqd00088v9k6pfnqpjz",
            "title": "About us",
            "slug": "/about-us",
            // ... additional properties
            "_url": "http://localhost:3000/about-us",
            "_children": []
        }
    ]
}
```

The home page object is returned with a `_children` array with the first-level pages.

**We can get all pages**, with limited data on child pages, by adding the `?all=1` query parameter.

```
GET https://example.rocks/api/v1/@apostrophecms/page?all=1
```

**We can request this data as a flat array** by adding the `?flat=1` query parameter.

```
GET https://example.rocks/api/v1/@apostrophecms/page?all=1&flat=1
```

## Getting rendered HTML in responses

Using an object of JSON-like data from a REST API is common with a headless CMS. Traditionally the application's "head" (such as a single page Vue.js, React, Angular or native application) would use that structured data to display product, event, or similar content information. It is less common for a headless CMS to deliver page content that is tied to particular HTML markup and layout. More often, landing page text and images might be coded directly into the app code or otherwise not be from the same data source.

Apostrophe supports both approaches. The in-context editing features and [widget areas](/guide/areas-and-widgets.md) give editors more control over content, but in its default form areas are data objects mainly useful in an editing context and for native apps. When areas are rendered as HTML from widget template files they are fully realized and easier to use in contexts that utilize HTML.

### "Just give me the HTML:" `?render-areas=1` parameter

**If you just want the HTML for each area, include the `?render-areas=1` query parameter in your API request.** This will return the page document as JSON. Each area field in the response will have a `_rendered` property with a string of HTML, in place of the `items` array of widget objects. This is useful if we just want to insert the rendered area HTML into an existing template system or utilize an iOS `WKWebView` or Android `WebView`.

```
GET https://example.rocks/api/v1/@apostrophecms/page/_ID-OF-A-PAGE-GOES-HERE?render-areas=1
```

### "I want both:" `?render-areas=inline` parameter

If you prefer to maintain access to the data properties of each individual widget *in addition* to rendered HTML, try:

```
GET https://example.rocks/api/v1/@apostrophecms/page/_ID-OF-A-PAGE-GOES-HERE?render-areas=inline
```

A `_rendered` property containing HTML will be added to each individual widget in each area's `items` array, *in addition to* all of the usual properties provided by the API.

### "I just want the whole page:" fetching the page URL directly

If we wanted to get the full page as HTML rendered using the page templates, we could make a `GET` request to the page URL (basically what browsers do). This is only good if we are not trying to insert it into the midst of a larger HTML document.

```
GET https://example.rocks/about-us
```

### "I want the *content* of the page:" leveraging the `aposRefresh=1` parameter

 More likely we would only want the unique page content (without the `head` tag and outer wrapper elements), which we can get by adding the `aposRefresh=1` query parameter. It will include only the HTML markup for the page template. This is great for using Apostrophe page templates inside an external page wrapper (e.g., `head` tag, site header, and site footer).

```
GET https://example.rocks/about-us?aposRefresh=1
```

This technique is quite effective. It can be extended by passing additional custom query parameters and checking `data.query.parameterName` inside page and layout templates to decide how to further adjust the response.

## Headless integrations

As official platform-specific plugins are made available they will be added here. These are meant to make it even easier to use Apostrophe REST APIs with certain popular front end systems.

### Astro plugin

[Astro](https://astro.build/) is a powerful framework for content-driven websites. The [apostrophe-astro](https://apostrophecms.com/extensions/astro-integration)
plugin provides a bridge that allows Astro to act as an "external front end" for Apostrophe. Note that Astro allows sites to be built with any mix of React, Vue, SvelteJS and other frontend frameworks which is highly effective when combined with Apostrophe as a back end.

### Gatsby source plugin

[Gatsby](https://gatsbyjs.com/) is a static site generator using React. The [Apostrophe source plugin](https://www.npmjs.com/package/gatsby-source-apostrophe) bridges the gap between the REST APIs and the GraphQL query language that Gatsby uses.

::: info
Direct GraphQL support is on the product roadmap for Apostrophe. If you are interested in that feature, [please indicate that on the product roadmap card](https://portal.productboard.com/apostrophecms/1-product-roadmap/c/44-graphql-api) so we can properly prioritize it.
:::
