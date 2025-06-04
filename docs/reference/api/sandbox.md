---
title: ApostropheCMS API Reference - Interactive Explorer
description: Interactive OpenAPI documentation for ApostropheCMS REST API
---

# Interactive API Reference

> **💡 Sandbox Testing**: This online explorer can connect to a project running at `localhost:3000` on your workstation to test standard API routes. You can test with API key or bearer token authentication, but not session cookies.

<AposApiExplorer />

## Testing Against Your Own Site

1. **Download**: Get our [OpenAPI specification](/openapi.yaml){download="apostrophecms-openapi.yaml"}
2. **Import**: Load it into Postman, Insomnia, or similar tools
3. **Configure**: Set your server URL and authentication token
    - Server URL (change `https://your-site.com` to your actual domain)  
    - Session cookie name (change `project-shortname.sid` to `yourproject.sid`)
4. **Test**: Make live API calls to your ApostropheCMS instance, either locally or your hosted site


## About This Reference

This interactive documentation is generated from our [OpenAPI specification](/openapi.yaml). You can:

- **Test endpoints live**: Make real API calls to your locally running project (with authentication)
- **View request/response examples**: See exactly what data to send and expect
- **Understand schemas**: Explore all data models and field requirements
- **Copy code samples**: Get ready-to-use code

## Need the Raw Specification?

- [Download YAML format](/openapi.yaml) - For human reading and editing

## Start learning about the ApostropheCMS API
[Learn more about API authentication →](/reference/api/authentication)
