---
title: ApostropheCMS REST API Reference
description: Complete REST API documentation for ApostropheCMS headless CMS
next:
  text: 'Authentication'
  link: '/reference/api/authentication.html'
---

# ApostropheCMS REST API

ApostropheCMS provides a comprehensive REST API for headless CMS functionality, enabling you to build modern applications with any frontend framework while managing content through Apostrophe's intuitive editing experience.

## Getting Started

The REST API gives you programmatic access to all your content and media:

- **Content Management**: Create, read, update, and delete pages and pieces
- **Media Operations**: Upload, crop, and organize images and files
- **Multilingual Support**: Manage content across multiple locales
- **Flexible Authentication**: API keys for server-to-server, bearer tokens for client apps

### Quick Start

All API endpoints follow RESTful conventions and return JSON responses. Most operations require authentication:

```javascript
// Example: Fetch published articles
const response = await fetch('https://example.net/api/v1/article', {
  headers: {
    'Authorization': 'Bearer your-token-here'
  }
});
const articles = await response.json();
```

## Core API Documentation

<AposTwoColumns>
  <template #leftColumn>
    <AposCtaButton
      detail-heading="API"
      title="Authentication"
      content="Learn about API keys, bearer tokens, and session cookies for authenticating your REST API requests."
      url="/reference/api/authentication"
      hideEffort="true"
    />
  </template>
  <template #rightColumn>
    <AposCtaButton
      detail-heading="API"
      title="Field Formats"
      content="Examples of how each field type appears in API responses, from simple strings to complex areas and relationships."
      url="/reference/api/field-formats"
      hideEffort="true"
    />
  </template>
</AposTwoColumns>

### Content APIs

<AposTwoColumns>
  <template #leftColumn>
    <AposCtaButton
      detail-heading="API"
      title="Piece Type REST API"
      content="Full CRUD operations for piece types with pagination, search, filtering, draft/publish workflows, and relationship queries."
      url="/reference/api/pieces"
      hideEffort="true"
    />
  </template>
  <template #rightColumn>
    <AposCtaButton
      detail-heading="API"
      title="Page Type REST API"
      content="Complete page management including tree navigation, publishing workflows, and page hierarchy operations."
      url="/reference/api/pages"
      hideEffort="true"
    />
  </template>
</AposTwoColumns>

<AposTwoColumns>
  <template #leftColumn>
    <AposCtaButton
      detail-heading="API"
      title="Working with Rich Text"
      content="Handle rich text content including HTML filtering, inline images, and importing external content."
      url="/reference/api/rich-text"
      hideEffort="true"
    />
  </template>
  <template #rightColumn>
    <AposCtaButton
      detail-heading="API"
      title="Media REST Endpoints"
      content="Upload, crop, and manage media files through dedicated endpoints for images, files, and attachments."
      url="/reference/api/media"
      hideEffort="true"
    />
  </template>
</AposTwoColumns>

### Internationalization

<AposTwoColumns>
  <template #leftColumn>
    <AposCtaButton
      detail-heading="API"
      title="i18n REST Endpoints"
      content="Manage multilingual content with endpoints for locale information, cross-locale navigation, and document verification."
      url="/reference/api/i18n"
      hideEffort="true"
    />
  </template>
</AposTwoColumns>

## How to Use This Documentation

This REST API reference provides two complementary ways to work with the ApostropheCMS API:

### Written Documentation (This Section)

The guides on this page and in the navigation are your comprehensive reference for understanding the API:

- **Learn patterns and concepts** with explanations and context
- **Copy production-ready code** examples into your application  
- **Understand field formats** with detailed examples
- **Read offline or on mobile** when you need it

Start here if you're new to the API or building an integration.

### API Explorer (Interactive Testing)

Once you understand the basics, use the API Explorer to test endpoints with your own data:

- **Test live requests** against your local or deployed ApostropheCMS instance
- **Experiment with parameters** and see real-time responses
- **Validate your authentication** setup before writing code
- **Generate curl commands** for quick testing

[Open the API Explorer →](api-explorer)

> **Tip**: The written documentation and API Explorer show the same endpoints - use the written docs to learn, then the Explorer to test.

### OpenAPI Specification

For advanced workflows, download our complete OpenAPI 3.0 specification:

- Import into Postman, Insomnia, or other API clients
- Generate client libraries in any language
- Integrate with AI coding assistants
- Build custom tooling and automation

[Download OpenAPI Spec](docs/apostrophecms-openapi.yaml){download="apostrophecms-openapi.yaml"}

## Common Patterns

### Querying Content

Retrieve published content with pagination and filtering:

```javascript
const response = await fetch(
  'https://example.net/api/v1/article?page=1&perPage=10',
  {
    headers: { 'Authorization': 'Bearer your-token' }
  }
);
```

### Creating Documents

Post new content with required fields:

```javascript
const response = await fetch('https://example.net/api/v1/article', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    title: 'My New Article',
    slug: 'my-new-article'
  })
});
```

### Working with Locales

Access content in specific locales using the `aposLocale` query parameter:

```javascript
const response = await fetch(
  'https://example.net/api/v1/article?aposLocale=fr',
  {
    headers: { 'Authorization': 'Bearer your-token' }
  }
);
```

## Need Help?

- **Stack Overflow**: Tag questions with `apostrophe-cms`
- **Discord**: Join our [community chat](https://chat.apostrophecms.com)
- **GitHub**: Report issues or contribute at [apostrophecms/apostrophe](https://github.com/apostrophecms/apostrophe)

Ready to start building? Check out the [authentication guide](/reference/api/authentication) to set up your first API request.

