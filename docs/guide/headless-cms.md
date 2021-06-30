# Using Apostrophe as a headless CMS

Apostrophe is fully featured as a traditional CMS (with some non-traditional features). It is also immediately ready for use as a headless CMS. There are many scenarios where Apostrophe works well as a headless CMS, including:

- We may want to use Apostrophe to serve webpages normally, but also use the website data in another context, such as a mobile app.
- We may want to go fully headless with a front end like Gatsby or Gridsome while also allowing editors to use Apostrophe's in-context editing.

Regardless of the reason or the layers involved there are some common concepts to understand.

## Accessing data using the REST APIs

Before going further, keep in mind that there is an [API route reference section](/reference/api/) that will include much of the following information in a more direct format. One section there that will not be covered in this guide will be the [authentication APIs](/reference/api/authentication.md). There are a few options for authentication discussed there.

- Using the REST APIs
  - Using piece data
  - Using page data
  - Pushing document changes
- Platform solutions
  - Gatsby source plugin
