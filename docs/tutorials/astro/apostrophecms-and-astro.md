---
next:
  text: 'Introducing Apollo'
  link: '/tutorials/astro/introducing-apollo.html'
title: "ApostropheCMS and Astro"
detailHeading: "Astro"
url: "/tutorials/astro/apostrophecms-and-astro.html"
content: "ApostropheCMS and Astro work seamlessly together through the `apostrophe-astro` extension. Learn who this integration is for and what makes it a powerful choice for building modern websites."
tags:
  topic: "Core Concepts"
  type: astro
  effort: beginner
order: 1
excludeFromFilters: true
---
# Building Websites with ApostropheCMS and Astro

## Introduction

The tutorials in this section will guide you through building modern websites using ApostropheCMS as your content management system with Astro powering your frontend. This combination offers powerful advantages for different types of developers:

### Who Is This For?

**Astro Developers**
- You need a robust CMS backend for your Astro projects
- You want more than just a headless CMS - you need full in-context editing
- You're looking for a flexible content management system that works with your existing components

**Current ApostropheCMS Developers**
- You're experienced with ApostropheCMS and ready to explore additional frontend options
- You're interested in expanding your stack to include modern frontend frameworks alongside ApostropheCMS's powerful content management
- You want to enhance your sites while preserving the intuitive in-context editing experience your clients value

**Teams Building Modern Websites**
- You're looking for a modern, flexible CMS solution
- You want to build high-performance sites with excellent developer experience
- You need a system that scales well for building multiple client sites

### What Makes This Integration Special?

1. **Content Management + Modern Frontend**
   - ApostropheCMS provides an intuitive, powerful interface for content management
   - Astro enables you to use modern frontend frameworks while maintaining excellent performance
   - Unlike typical headless CMS setups, you maintain full in-context editing capabilities

2. **Developer Experience**
   - Clear separation between backend and frontend codebases
   - Familiar development patterns for both systems
   - Freedom to use your preferred frontend frameworks (React, Vue, Svelte) through Astro

3. **Agency-Ready Features**
   - Streamlined project setup for multiple sites
   - Flexible content modeling
   - Built-in image optimization
   - Strong security features
   - Efficient development workflow

## How These Tutorials Are Organized

This section is divided into two paths. You don't need to complete one before starting the other, but if you are new to the integration the build series is the best place to start.

### Path 1: Build a Site

A step-by-step series that starts from the [Astro Essentials starter kit](https://github.com/apostrophecms/starter-kit-astro-essentials) and builds it up into the [Astro public demo](https://github.com/apostrophecms/astro-public-demo), a complete ApostropheCMS + Astro site. Each chapter adds one part of the demo and explains the concepts behind it:

- **Getting started:** create a project, run the two servers, and see how a request flows from ApostropheCMS to Astro
- **Site chrome:** global settings, the header, navigation, footer, and breadcrumbs
- **Pages:** page types, areas, and template mapping
- **Widgets:** custom widgets with shared link fields, nested areas, and arrays
- **Styling:** widget styles, site-wide design tokens, and dark mode
- **Core widgets:** customizing the image, rich text, and video widgets
- **Pieces:** articles, categories, and authors, with index and show pages, filters, and pagination
- **Fetching data:** widgets that load content from the REST API and from external services, plus client-side behavior with web components
- **Localization:** locales, translated strings, and a locale switcher
- **SEO and extensions:** SEO fields, Open Graph, sitemaps, favicons, and import/export

<AposCtaButton
  detail-heading="Series"
  title="Start Building"
  content="Set up your development environment, explore core concepts, and learn the fundamental patterns for building with ApostropheCMS and Astro."
  url="introducing-apollo.html"
/>

### Path 2: Deploy Your Project

Guides covering how to get your ApostropheCMS + Astro project live — from a general overview of deployment options to a complete walkthrough of a two-tier SSR + static deployment workflow.

<AposCtaButton
  detail-heading="Guides"
  title="Deployment Overview and Guides"
  content="Understand your deployment options, configure static builds, and follow a complete worked example using Railway and Vercel."
  url="deploying-hybrid-projects.html"
/>

### Getting Help

If you get stuck:
- Join our [Discord community](http://chat.apostrophecms.org)
- Check the [ApostropheCMS documentation](https://apostrophecms.com/docs)
- Review the [Astro documentation](https://docs.astro.build)
- Visit the [`apostrophe-astro` package on GitHub](https://github.com/apostrophecms/apostrophe/tree/main/packages/apostrophe-astro)