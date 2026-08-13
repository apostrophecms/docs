---
extends: '@apostrophecms/module'
---

# `@apostrophecms/ai-adapter-google`

<AposRefExtends :module="$frontmatter.extends" />

The adapter for Google Gemini's `generateContent` API. It registers itself at startup and is configured in core's `defaults.js` — there is nothing to install and nothing to add to `app.js`.

An adapter is a thin translator for one service dialect: it turns the engine's normalized request into that service's HTTP body and its response back into the normalized shape. Routing, retries, the agent loop, validation, caching policy and mock mode all belong to [`@apostrophecms/ai`](/reference/modules/ai.md).

## Related documentation

- [`@apostrophecms/ai`](/reference/modules/ai.md) — the engine, and where providers are configured
- [`@apostrophecms/ai-adapter-openai-compatible`](/reference/modules/ai-adapter-openai-compatible.md) — adding a service with no adapter code

## Using it

Name a provider that uses this adapter, and set its key in the environment. An empty entry is a complete configuration.

```bash
export APOS_GEMINI_KEY=...
```

<AposCodeBlock>

```javascript
'@apostrophecms/ai': {
  options: {
    providers: {
      google: {}
    }
  }
}
```
  <template v-slot:caption>
    app.js
  </template>
</AposCodeBlock>

The entry's own key doubles as the adapter name, which is why `google: {}` resolves to this adapter. See [`providers`](/reference/modules/ai.md#providers) for the full entry shape.

| | |
|---|---|
| **Adapter name** | `google` |
| **Label** | Google (Gemini) |
| **Default env key** | `APOS_GEMINI_KEY` |
| **Capabilities** | `text`, `tools`, `structured`, `imageInput`, `caching`, `image` |

## Options

| Property | Type | Default | Description |
|---|---|---|---|
| [`timeout`](#timeout) | integer | `600000` | Per-request milliseconds. |

```javascript
'@apostrophecms/ai-adapter-google': {
  options: {
    timeout: 600000
  }
}
```

### `timeout`

Milliseconds one request to the service may take. A timeout is a *retryable* failure: it normalizes to `aiRetry` with `kind: 'timeout'`, and the engine's [retry policy](/reference/modules/ai.md#error-codes) decides what happens next.

## Models and effort

::: info
Model lineups move with provider releases. The tables below are what this version of the adapter declares, not a permanent contract. For the live answer in a running project, call [`apos.ai.modelCatalog()`](/reference/modules/ai.md#modelcatalog).
:::

Default effort table as shipped:

| Level | Model | Reasoning |
|---|---|---|
| `low` | `gemini-3.1-flash-lite` | — |
| `medium` | `gemini-3.5-flash` | — |
| `high` | `gemini-3.5-flash` | `high` |

Image models declared: `gemini-3.1-flash-image`, `gemini-3-pro-image` and `gemini-3.1-flash-lite-image`.

These rows are the base of the project's [effort table](/reference/modules/ai.md#effort) whenever a `google` entry is the default provider — which is why a bare `providers: { google: {} }` gives you working `low` / `medium` / `high` levels.

## Image generation

This adapter declares the `image` capability, so it can serve the engine's [image route](/reference/modules/ai.md#image) — a common pairing when text comes from another service.

```javascript
'@apostrophecms/ai': {
  options: {
    provider: 'anthropic',
    providers: {
      anthropic: {},
      google: {}
    },
    image: {
      provider: 'google',
      model: 'gemini-3-pro-image',
      aspect: 'landscape'
    }
  }
}
```

A requested `aspect` resolves to the nearest ratio the routed model declares, and the resolved ratio comes back on the result. See [`generateImage`](/reference/modules/ai.md#async-generateimage-req-prompt-options).

## Adjusting the adapter

Adapters are ordinary Apostrophe modules, so the dialect seams are overridable at project level. The three seams every adapter exposes are `buildBody(request)`, `parseResponse(response, request)` and `normalizeError(error)`.

<AposCodeBlock>

```javascript
export default {
  options: {
    timeout: 120000
  },
  extendMethods(self) {
    return {
      buildBody(_super, request) {
        const body = _super(request);
        // amend the dialect body here
        return body;
      }
    };
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/ai-adapter-google/index.js
  </template>
</AposCodeBlock>

::: warning
Reasoning artifacts round-trip through transcripts as opaque content parts so a model keeps its thinking continuity across turns. An override of `buildBody` must skip part types it does not recognize rather than choke on them or drop them.
:::
