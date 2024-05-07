# **Apostrophe Core Concepts**

<iframe src="https://www.youtube.com/embed/0YSvNb2rMto?si=Zws1VF1XMMdh5x1a" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Overview

In this section, we'll discuss the key concepts to understand in order to architect and build your applications efficiently. We will discuss each concept more deeply in other guides. This is simply an overview to become familiar with the terms.

## Modules

Apostrophe is built using a system of **modules**. We'll get into a more detailed technical review of Apostrophe's module system later in this training, but for now, just understand that everything in Apostrophe comes from a module.

If you're familiar with JavaScript modules, the module concept should already be familiar to you. But if not, a module is self-contained code that defines a specific set of functionality. In other words, each module is responsible for providing one feature, such as a type of widget, a type of customized page, or a service. This could be anything from defining fields for a blog post content type to integrating with third-party services. In short, modules are the building blocks of your application.

One important concept regarding modules in Apostrophe is how they work within the project's ecosystem. The majority of modules inherit the functionality of the core Apostrophe modules and then extend or improve that functionality. Later in this training, we will provide a more detailed technical review of Apostrophe's module system.

## Schemas

The field schema of a piece, page, or widget defines a set of input fields that are presented to the end user. Not only do these fields create an editing interface, but they also sanitize and save the data on the server side. Commonly used field types include strings, integers, floats, select elements, and "relationship" fields, which allow editors to define connections to other docs.

A module schema is built according to what is defined in its `fields` property configuration via the `add`, `remove`, and `group` properties, as well as to what is inherited from the fields configuration of the parent module. 

For instance, every module that extends `@apostrophecms/widget-type` will by default have the same schema inherited from the parent module and will be able to add, remove, or edit the grouping of the fields inherited.

## Pages

**Pages** in Apostrophe are used for content that is typically edited less frequently and should be organized hierarchically within a page tree rather than by date or taxonomy. Pages are always viewed as a page and are rarely reused for content in other contexts. Pages are (typically) for less structured content so are generally more free-form. Pages can be made as editable as needed or can purely serve static content.

Page types are created by extending the `@apostrophecms/page-type` module and can be configured using schemas. Each page type module created is assigned a page type, such as `blog-page`. This page type enables developers to establish a consistent template that matches the desired layout and functionality for that particular type of page.

Out of the box, Apostrophe defines a `home-page` type for you that is "parked" at the top of the page tree. Other pages are typically sub-pages of the home page.

::: info
📌 For additional information on configuring pages, see [Page Templates](https://docs.apostrophecms.org/guide/pages.html) in the Apostrophe docs.
:::

## Pieces

**["Piece types"](https://docs.apostrophecms.org/guide/pieces.html)** in Apostrophe are collections of structured content, often referred to as "content types" in other systems. Each item created from a piece type is a **"piece."** Pieces are typically organized by date or taxonomy.

[**Field schemas**](https://docs.apostrophecms.org/guide/content-schema.html) are used to define the data modal of a particular piece type. When you define a piece type by extending the `@apostrophecms/piece-type` module, Apostrophe will include basic required schema fields out of the box, such as the title and slug fields. You can then configure your schema with more fields to fit your requirements.

Pieces can be displayed using pieces pages, which are specialized page types, or widgets. Pieces pages can show a collection of pieces through the `index.html` template page, or an individual piece using the `show.html` template page. Using widgets to display pieces allows you to show pieces in the context of other relevant content, like related articles. We'll explore this later, just know for now that there are different ways to display pieces.

Common examples of pieces are articles, events, or products.

::: info
📌 For additional information on schema field types, see the [Schema Field Type reference](https://docs.apostrophecms.org/reference/field-types/) in the Apostrophe docs.
:::

## Widgets

**Widgets** in Apostrophe are blocks of editable content that can be added to `area` schema fields within pieces or pages. The developer has control over which and how many widgets can be added to an individual area. Pieces and pages are stored in the database as individual documents within a collection. Widgets are part of a piece or page document, not individual documents themselves. This means any data entered into a widget is associated with the piece or page where that widget was added and can't be retrieved independently from the database.

Widgets are configurable using field schemas, and they can also include options. By providing widget options, you can create variations of widgets that might contain similar content but are visualized differently on the front end.

Apostrophe provides several simple widgets to help you get started building your site. You are free to customize these widgets and add your own completely custom widgets as you see fit.

Common examples of widgets are Rich Text Widgets, Image Widgets, Slideshow Widgets, or an Article Widget.

::: info
📌 For a list of the included widgets, see [Standard (Included) Widgets](https://docs.apostrophecms.org/guide/core-widgets.html) in the Apostrophe docs.
:::
