# Piece pages in A3

:::  tip Note:
**"What's a piece page?"**
<!-- I realize that for alpha 1 our audience is more familiar with Apostrophe, but this is a topic that comes up even among people who know a lot about Apostrophe, so I'd like this note to stay in. Let's work on making it as clear as possible. Tom -->

The most intuitive example is a blog: if the individual [piece](piece.md) is one blog post, then the piece page is the blog's home page, where all of the posts can be discovered, paginated, filtered and explored.

In addition, in Apostrophe, "piece pages" are responsible for serving the individual webpage for each piece. If our project has a piece module called `product`, then that module provides a way to create, edit, manage and query pieces. If our project has a piece page module called `product-page`, then that module provides a way to browse and view the pieces.

In general piece modules are concerned with *editing*, while piece page modules are concerned with *browsing.* For developers familiar with the "model / view / controller" pattern: **piece modules are the model layer for your content type, while piece page modules are the view layer.**

Some sites just need a widget module for each piece, but most will want to let users view a full-blown webpage for each one, or at least browse and paginate through a complete list. And that's where piece pages shine.
:::

TODO
