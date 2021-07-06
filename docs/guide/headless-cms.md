# Using Apostrophe as a headless CMS

Apostrophe is fully featured as a traditional CMS (with some non-traditional features). It is also immediately ready for use as a headless CMS. There are many scenarios where Apostrophe works well as a headless CMS, including:

- We may want to use Apostrophe to serve webpages normally, but also use the website data in another context, such as a mobile app.
- We may want to go fully headless with a front end like Gatsby or Gridsome while also allowing editors to use Apostrophe's in-context editing.
- We may have an app that handles features such as e-commerce but need a CMS to create and pipe content into the app.

Regardless of the reason or the layers involved there are some common concepts to understand.

## Accessing data using the REST APIs

Before going further, keep in mind that there is an [API route reference section](/reference/api/) that will include much of the following information in a more direct format. One section there that will not be fully covered in this guide will be the [authentication APIs](/reference/api/authentication.md). There are a few options for authentication discussed there.

For the sake of simplicity we can use the example of authentication using an API key. The key could be defined in the `@apostrophecms/express` module in a project like this:

```javascript
// modules/@apostrophecms/express/index.js
module.exports = {
  options: {
    apiKeys: {
      // Use your own strong, randomly generated key. Not like this one.
      '000apikey123': {
        // The user role associated with this key
        role: 'admin'
      }
    }
  }
};
```

## Getting piece data from the REST API

Requesting and using [piece](/guide/pieces.md) data should seem familiar to developers who have used a headless data source before. It is returned from the API request as an array of objects, each of which is an individual piece. Those results are paginated to send a limited number from any single request.

REST API routes are automatically constructed using the application's base URL, an API prefix (`/api/v1/`), the name of a content type module, and possibly a document ID. If using an API key for authentication, that would be added at the end in a query parameter as normal. For example, making a request for an *`article`* piece type from a website at `https://example.rocks` would use a URL like:

```
https://example.rocks/api/v1/article?apikey=000apikey123
```

When using Apostrophe as a headless CMS, we will most frequently be making `GET` requests from the Apostrophe app (see the [pieces API reference](/reference/api/pieces.md) for more on other request types). There are two main types of `GET` requests we should think about: a "get all" request and a "get one" request.

### Get all the pieces!

To make a **"get all"** request, hit the URL as described above. Using the native Node.js `fetch` utility, that might look like:

```javascript
async function getArticles() {
  const response = await fetch('http://example.rocks/api/v1/article?apikey=000apikey123', {
    method: 'GET'
  });

  return response;
}

try {
  getArticles()
    .then(response => {
      const articles = response.results;
      // Do something with the articles!
    });
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
GET https://example.rocks/api/v1/article/j8e6n7n5y309:en:published?apikey=000apikey123
```

The response to that successful request will be [a single piece object](/reference/api/pieces.md#piece-document-response-example).

## Getting page data from the REST API

Page REST API requests look very similar to piece requests. They follow the same REST API pattern:

```
# All pages
GET https://example.rocks/api/v1/@apostrophecms/page?apikey=000apikey123

# A single page with document _id `903y5n76e8j:en:published`
GET https://example.rocks/api/v1/@apostrophecms/page/903y5n76e8j:en:published?apikey=000apikey123
```

The module name used for these requests is always `@apostrophecms/page`, the module that manages pages in Apostrophe. The response for a "get one" request is also similar to a single piece `GET` request. It is a single page object with the page data properties immediate at the top level.

The response for page "get all" requests work differently by default. This is because it reflects that pages have a hierarchical structure. The home page is the "parent" of the top-level pages, which then have additional "child" pages, and so on. As such, the response to a "get all" route as written above looks something like this:

```json
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

**We can request this data as a flat array** by adding the `?flat=1` query parameter.

```
GET https://example.rocks/api/v1/@apostrophecms/page?flat=1&apikey=000apikey123
```

**And expand the results to include all pages, regardless of page tree depth** by using the `?all=1` query parameter. This also works with the nested object format.

```
GET https://example.rocks/api/v1/@apostrophecms/page?flat=1&all=1apikey=000apikey123
```

## Getting rendered HTML in responses

Using an object of JSON-like data from a REST API is very normal from a headless CMS. Traditionally the application's "head" (such as a single page Vue.js, React, or Angular application) would use that structured data to display product, event, or similar content information. It is less common for a headless CMS to deliver page content that is tied to particular HTML markup and layout. More often, landing page text and images might be coded directly into the app code or otherwise not be from the same data source.

Apostrophe support both approaches. The in-context editing features and [widget areas](/guide/areas-and-widgets.md) give editors more control over content, but in it's default form areas are fairly incomprehensible data objects. It is when they are rendered with the widget template files that they are fully realized.

**In any Apostrophe REST API single-document `GET` ("get one") request, include the `?render-areas=1` query parameter.** Each area field in the response will have a `_rendered` property with a string of HTML instead of the `items` array of widget objects.

```
GET https://example.rocks/api/v1/@apostrophecms/page/903y5n76e8j:en:published?apikey=000apikey123&render-areas=1
```

If we wanted to get the full page as HTML rendered using the page templates, we could make a `GET` request to the page URL (basically what browsers do).

```
GET https://example.rocks/about-us
```

 More likely we would only want the unique page content (without the `head` tag and outer wrapper elements), which we can get by adding the `aposRefresh=1` query parameter. It will include only the HTML markup for the page template.

```
GET https://example.rocks/about-us?aposRefresh=1
```

## Headless integrations

As official platform-specific plugins are made available they will be added here. These are meant to make it even easier to use Apostrophe REST APIs with certain popular front end systems.

### Gatsby source plugin

[Gatsby](https://gatsbyjs.com/) is a very popular static site generator using React. The [Apostrophe source plugin](https://www.npmjs.com/package/gatsby-source-apostrophe) bridges the gap between the REST APIs and the GraphQL query language that Gatsby uses.
