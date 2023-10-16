# **Apostrophe Core Concepts**

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
