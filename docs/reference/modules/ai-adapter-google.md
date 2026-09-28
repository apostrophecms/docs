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
import apostrophe from 'apostrophe';

apostrophe({
  root: import.meta,
  shortName: 'example-site',
  modules: {
    // 👇 The engine, with one provider entry naming this adapter
    '@apostrophecms/ai': {
      options: {
        providers: {
          google: {}
        }
      }
    }
  }
});
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
| [`imageStagger`](#imagestagger) | integer | `500` | Milliseconds between the starts of the requests a multi-image call fans out. |

```javascript
'@apostrophecms/ai-adapter-google': {
  options: {
    timeout: 600000,
    imageStagger: 500
  }
}
```

### `timeout`

Milliseconds one request to the service may take. A timeout is a *retryable* failure: it normalizes to `aiRetry` with `kind: 'timeout'`, and the engine's [retry policy](/reference/modules/ai.md#error-codes) decides what happens next.

### `imageStagger`

The Gemini dialect returns **one image per call** — it has no count knob — so a `generateImage` call asking for more than one image becomes that many concurrent requests. `imageStagger` spaces their starts, jittered per request, so the burst does not trip the provider's rate limit.

Raise it if you see `rateLimit` retries on multi-image calls; lower it if latency matters more than smoothness and your quota is generous.

::: info
A partial failure does not scrap the batch: whatever generated is delivered — possibly fewer images than `count` — and each lost request is logged as an [`image-partial` record](/reference/modules/ai.md#the-event-types) carrying `requested` and `delivered`. Only losing every request throws. Check `result.images.length` when the count matters.
:::

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

These rows are the base of the project's [effort table](/reference/modules/ai.md#effort) whenever a `google` entry is the default provider — which is why a bare `providers: { google: {} }` gives you working `low` / `medium` / `high` levels.

Declared model metadata:

| Model | Label | Context window | `maxOutputTokens` | `reasoning` accepts |
|---|---|---|---|---|
| `gemini-3.1-flash-lite` | Gemini 3.1 Flash-Lite | 1,048,576 | 65,536 | `minimal`, `low`, `medium`, `high` |
| `gemini-3.5-flash` | Gemini 3.5 Flash | 1,048,576 | 65,536 | `minimal`, `low`, `medium`, `high` |

`reasoning` is the dialect's `thinkingLevel` vocabulary, shared by both text models. Note **`minimal`**, which has no counterpart in the other adapters' vocabularies — a routing table that pins `reasoning: 'minimal'` is Google-specific.

Image models declared: `gemini-3.1-flash-image`, `gemini-3-pro-image` and `gemini-3.1-flash-lite-image`. All three declare the same ratio set:

`1:1`, `3:2`, `2:3`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`

That is a wider set than the OpenAI image models declare, so a shape request is more likely to resolve to exactly what was asked for here.

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

**`quality` has only two distinct outcomes here.** It maps to the dialect's output resolution:

| `quality` | Resolution |
|---|---|
| `low` | 1K |
| `medium` | 1K |
| `high` | 2K |

`low` and `medium` are the same request. Omitting `quality` sends nothing and leaves the provider's own default in place.

This dialect works in ratios rather than pixels, so an image result from Google carries no `size` — only the resolved `aspect`.

Note also that a `count` above 1 fans out into concurrent requests; see [`imageStagger`](#imagestagger).

## Errors and log records

Errors normalize through the engine's [shared status ladder](/reference/modules/ai-adapter-openai-compatible.md#writing-a-new-adapter), with one dialect-specific addition: when no `Retry-After` header arrives, the retry delay is read from the `google.rpc.RetryInfo` detail Gemini puts in the error body. So a throttled call still honors the provider's own backoff rather than falling back to the computed curve.

::: info
**This API issues no request id.** The `requestId` field documented on the engine's [`retry` and `failure` records](/reference/modules/ai.md#the-fields-on-retry-and-failure) is therefore absent for Google, where the other three adapters populate it. A support ticket with Google needs to be correlated some other way — the envelope's Apostrophe `requestId` still ties the record to the editor action that caused it.
:::

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
