---
extends: '@apostrophecms/module'
---

# `@apostrophecms/ai-adapter-openai`

<AposRefExtends :module="$frontmatter.extends" />

The adapter for OpenAI's Responses API and Images API. It registers itself at startup and is configured in core's `defaults.js` — there is nothing to install and nothing to add to `app.js`.

An adapter is a thin translator for one service dialect: it turns the engine's normalized request into that service's HTTP body and its response back into the normalized shape. Routing, retries, the agent loop, validation, caching policy and mock mode all belong to [`@apostrophecms/ai`](/reference/modules/ai.md).

## Related documentation

- [`@apostrophecms/ai`](/reference/modules/ai.md) — the engine, and where providers are configured
- [`@apostrophecms/ai-adapter-openai-compatible`](/reference/modules/ai-adapter-openai-compatible.md) — Chat Completions, and adding a service with no adapter code

## Using it

Name a provider that uses this adapter, and set its key in the environment. An empty entry is a complete configuration.

```bash
export APOS_OPENAI_KEY=sk-...
```

<AposCodeBlock>

```javascript
'@apostrophecms/ai': {
  options: {
    providers: {
      openai: {}
    }
  }
}
```
  <template v-slot:caption>
    app.js
  </template>
</AposCodeBlock>

The entry's own key doubles as the adapter name, which is why `openai: {}` resolves to this adapter. See [`providers`](/reference/modules/ai.md#providers) for the full entry shape.

| | |
|---|---|
| **Adapter name** | `openai` |
| **Label** | OpenAI |
| **Default env key** | `APOS_OPENAI_KEY` |
| **Capabilities** | `text`, `tools`, `structured`, `imageInput`, `caching`, `image` |

## `openai` or `openai-compatible`?

Both adapters can talk to `api.openai.com`, and they are not interchangeable.

**For OpenAI proper, prefer `openai`.** It speaks OpenAI's first-class Responses API and supports `reasoning` alongside `tools`.

[`openai-compatible`](/reference/modules/ai-adapter-openai-compatible.md) speaks Chat Completions, the de facto wire standard of the whole ecosystem — that is what makes it the universal adapter. It works against `api.openai.com` too, but there a `tools` request drops `reasoning`, because the service rejects the combination in that dialect. Aliased entries describe other services, which accept it, and pass through untouched.

## Options

| Property | Type | Default | Description |
|---|---|---|---|
| [`timeout`](#timeout) | integer | `600000` | Per-request milliseconds. |

```javascript
'@apostrophecms/ai-adapter-openai': {
  options: {
    timeout: 600000
  }
}
```

### `timeout`

Milliseconds one request to the service may take. A timeout is a *retryable* failure: it normalizes to `aiRetry` with `kind: 'timeout'`, and the engine's [retry policy](/reference/modules/ai.md#error-codes) decides what happens next. Image generation is the slow case worth tuning for.

## Models and effort

::: info
Model lineups move with provider releases. The tables below are what this version of the adapter declares, not a permanent contract. For the live answer in a running project, call [`apos.ai.modelCatalog()`](/reference/modules/ai.md#modelcatalog).
:::

Default effort table as shipped:

| Level | Model | Reasoning |
|---|---|---|
| `low` | `gpt-5.6-luna` | — |
| `medium` | `gpt-5.6-terra` | — |
| `high` | `gpt-5.6-sol` | `high` |

Image models declared: `gpt-image-2` and `gpt-image-1`.

These rows are the base of the project's [effort table](/reference/modules/ai.md#effort) whenever an `openai` entry is the default provider — which is why a bare `providers: { openai: {} }` gives you working `low` / `medium` / `high` levels.

## Image generation

This adapter declares the `image` capability, so it can serve the engine's [image route](/reference/modules/ai.md#image).

```javascript
'@apostrophecms/ai': {
  options: {
    provider: 'anthropic',
    providers: {
      anthropic: {},
      openai: {}
    },
    image: {
      provider: 'openai',
      model: 'gpt-image-2',
      aspect: 'landscape',
      quality: 'medium'
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
        body.metadata = { project: 'my-project' };
        return body;
      }
    };
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/ai-adapter-openai/index.js
  </template>
</AposCodeBlock>

::: warning
Reasoning artifacts round-trip through transcripts as opaque content parts so a model keeps its thinking continuity across turns. An override of `buildBody` must skip part types it does not recognize rather than choke on them or drop them.
:::
