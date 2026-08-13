---
extends: '@apostrophecms/module'
---

# `@apostrophecms/ai-adapter-anthropic`

<AposRefExtends :module="$frontmatter.extends" />

The adapter for Anthropic's Messages API (Claude). It registers itself at startup and is configured in core's `defaults.js` — there is nothing to install and nothing to add to `app.js`.

An adapter is a thin translator for one service dialect: it turns the engine's normalized request into that service's HTTP body and its response back into the normalized shape. Routing, retries, the agent loop, validation, caching policy and mock mode all belong to [`@apostrophecms/ai`](/reference/modules/ai.md).

## Related documentation

- [`@apostrophecms/ai`](/reference/modules/ai.md) — the engine, and where providers are configured
- [`@apostrophecms/ai-adapter-openai-compatible`](/reference/modules/ai-adapter-openai-compatible.md) — adding a service with no adapter code

## Using it

Name a provider that uses this adapter, and set its key in the environment. An empty entry is a complete configuration.

```bash
export APOS_ANTHROPIC_KEY=sk-ant-...
```

<AposCodeBlock>

```javascript
'@apostrophecms/ai': {
  options: {
    providers: {
      anthropic: {}
    }
  }
}
```
  <template v-slot:caption>
    app.js
  </template>
</AposCodeBlock>

The entry's own key doubles as the adapter name, which is why `anthropic: {}` resolves to this adapter. See [`providers`](/reference/modules/ai.md#providers) for the full entry shape.

| | |
|---|---|
| **Adapter name** | `anthropic` |
| **Label** | Anthropic (Claude) |
| **Default env key** | `APOS_ANTHROPIC_KEY` |
| **Capabilities** | `text`, `tools`, `structured`, `imageInput`, `caching` |

Image generation is not among them, so an [`image` route](/reference/modules/ai.md#image) must name a different provider.

## Options

| Property | Type | Default | Description |
|---|---|---|---|
| [`timeout`](#timeout) | integer | `600000` | Per-request milliseconds. |
| [`version`](#version) | string | `'2023-06-01'` | The `anthropic-version` header. |
| [`thinkingBudgets`](#thinkingbudgets) | object | `{ low: 1024, medium: 4096, high: 16384 }` | Thinking token budget per reasoning level. |
| [`adaptiveModels`](#adaptivemodels) | array | the reasoning-capable lineup | Which models accept a reasoning setting. |

```javascript
'@apostrophecms/ai-adapter-anthropic': {
  options: {
    timeout: 600000,
    version: '2023-06-01',
    thinkingBudgets: { low: 1024, medium: 4096, high: 16384 },
    adaptiveModels: [ 'claude-opus-5', 'claude-sonnet-5' ]
  }
}
```

### `timeout`

Milliseconds one request to the service may take. A timeout is a *retryable* failure: it normalizes to `aiRetry` with `kind: 'timeout'`, and the engine's [retry policy](/reference/modules/ai.md#error-codes) decides what happens next.

### `version`

The value sent in the `anthropic-version` header. Change it to move to a newer API revision without waiting on a core release.

### `thinkingBudgets`

Maps a `reasoning` level onto the thinking token budget the request carries. Raise a level's budget when a task needs more deliberation than the default allows; the cost of a call rises with it.

### `adaptiveModels`

The models that accept a reasoning setting. A model outside this list has its `reasoning` dropped rather than sent, which is what keeps a routing table portable across a lineup where only some models think. Extend the list when the provider ships a new reasoning-capable model ahead of your Apostrophe version.

## Models and effort

::: info
Model lineups move with provider releases. The table below is what this version of the adapter declares, not a permanent contract. For the live answer in a running project, call [`apos.ai.modelCatalog()`](/reference/modules/ai.md#modelcatalog).
:::

Default effort table as shipped:

| Level | Model | Reasoning |
|---|---|---|
| `low` | `claude-haiku-4-5` | — |
| `medium` | `claude-sonnet-5` | `medium` |
| `high` | `claude-opus-5` | `high` |

These rows are the base of the project's [effort table](/reference/modules/ai.md#effort) whenever an `anthropic` entry is the default provider — which is why a bare `providers: { anthropic: {} }` gives you working `low` / `medium` / `high` levels.

To use a model newer than your Apostrophe version, describe it on the provider entry and point an effort row at it. No adapter change is needed:

```javascript
providers: {
  anthropic: {
    models: {
      'claude-opus-6': {
        label: 'Opus 6',
        contextWindow: 1000000,
        maxOutputTokens: 64000,
        reasoning: [ 'low', 'medium', 'high', 'max' ]
      }
    },
    effort: {
      high: { model: 'claude-opus-6', reasoning: 'high' }
    }
  }
}
```

## Adjusting the adapter

Adapters are ordinary Apostrophe modules, so the dialect seams are overridable at project level. The three seams every adapter exposes are `buildBody(request)`, `parseResponse(response, request)` and `normalizeError(error)`.

<AposCodeBlock>

```javascript
export default {
  options: {
    timeout: 120000,
    adaptiveModels: [ 'claude-opus-5', 'claude-sonnet-5', 'claude-opus-6' ]
  },
  extendMethods(self) {
    return {
      buildBody(_super, request) {
        const body = _super(request);
        body.metadata = { user_id: 'my-project' };
        return body;
      }
    };
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/ai-adapter-anthropic/index.js
  </template>
</AposCodeBlock>

::: warning
Reasoning artifacts round-trip through transcripts as opaque content parts so a model keeps its thinking continuity across turns. An override of `buildBody` must skip part types it does not recognize rather than choke on them or drop them.
:::
