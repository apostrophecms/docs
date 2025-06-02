---
title: ApostropheCMS API Documentation
description: Complete REST API reference for ApostropheCMS headless CMS
---

# ApostropheCMS REST API OpenAPI Specification

ApostropheCMS provides a comprehensive REST API for headless CMS functionality, perfect for agencies managing multiple client sites.

## What is the ApostropheCMS API?

The ApostropheCMS API is a RESTful interface that allows developers to:
- Create and manage content programmatically
- Build headless applications with any frontend framework
- Integrate with third-party services and tools
- Manage multisite configurations for agency workflows

## OpenAPI Specification

Our API follows OpenAPI 3.0 standards, making it compatible with modern development tools and AI assistants.

### What is OpenAPI?
OpenAPI (formerly Swagger) is a standardized way to describe REST APIs. Our specification includes:
- All available endpoints and methods
- Request/response schemas and examples
- Authentication requirements
- Error codes and responses

### Downloads
- [OpenAPI YAML Specification](/apostrophecms-openapi.yaml){download="apostrophecms-openapi.yaml"}

## How to Use This Specification

### For Developers
- **Import into Postman**: Use our spec to auto-generate API collections
- **Generate client libraries**: Create SDKs for JavaScript, Python, PHP, etc.
- **API exploration**: Browse all endpoints interactively in our [sandbox](/reference/api/sandbox)

### For AI Integration
Our OpenAPI spec enables:
- **ChatGPT plugins**: Compatible with OpenAI's plugin system
- **Documentation chatbots**: Use with RAG systems for automated API support
- **Code generation**: AI coding tools can generate accurate ApostropheCMS API code

[Continue to the API Sandbox →](/reference/api/sandbox) or start learning more:

<AposTwoColumns>
  <template #leftColumn>
    <AposCtaButton
      detail-heading="API"
      title="API Authentication"
      content="Learn about the various ways you can authenticate API requests to your ApostropheCMS project."
      url="/reference/api/authentication"
      hideEffort="true"
    />
  </template>
  <template #rightColumn>
    <AposCtaButton
      detail-heading="API"
      title="Field Formats"
      content="Examples of how each ApostropheCMS field type appears in REST API responses, from simple strings to complex areas and relationships."
      url="/reference/api/field-formats"
      hideEffort="true"
    />
  </template>
</AposTwoColumns>
<AposTwoColumns>
  <template #leftColumn>
    <AposCtaButton
      detail-heading="API"
      title="i18n REST Endpoints"
      content="Manage multilingual content with endpoints for locale information, cross-locale navigation, and document existence verification."
      url="/reference/api/i18n"
      hideEffort="true"
    />
  </template>
  <template #rightColumn>
    <AposCtaButton
      detail-heading="API"
      title="Media REST Endpoints"
      content="Upload, crop, and manage media files and attachments through dedicated endpoints for images, files, and the media library."
      url="/reference/api/media"
      hideEffort="true"
    />
  </template>
</AposTwoColumns>
<AposTwoColumns>
  <template #leftColumn>
    <AposCtaButton
      detail-heading="API"
      title="Page Type REST API"
      content="Complete CRUD operations for pages, including tree structure navigation, publishing workflows, and page hierarchy management."
      url="/reference/api/pages"
      hideEffort="true"
    />
  </template>
  <template #rightColumn>
    <AposCtaButton
      detail-heading="API"
      title="Piece Type REST API"
      content="Full REST API for piece types with pagination, search, filtering, draft/publish workflows, and relationship queries."
      url="/reference/api/pieces"
      hideEffort="true"
    />
  </template>
</AposTwoColumns>
<AposTwoColumns>
  <template #leftColumn>
    <AposCtaButton
      detail-heading="API"
      title="Working with Rich Text"
      content="Working with rich text content in the REST API, including HTML filtering, inline images, and importing external content."
      url="/reference/api/rich-text"
      hideEffort="true"
    />
  </template>
</AposTwoColumns>