---
extends: '@apostrophecms/module'
---

# `@apostrophecms/ai-adapter-openai-compatible`

<AposRefExtends :module="$frontmatter.extends" />

The adapter for the Chat Completions dialect — the ecosystem's de facto wire standard. It registers itself at startup and is configured in core's `defaults.js` — there is nothing to install and nothing to add to `app.js`.

This is the universal adapter. Point it at any Chat Completions host — a gateway, an aggregator, a local runtime — and describe the service in a provider entry. No adapter code, no module, no subclass.

## Related documentation

- [`@apostrophecms/ai`](/reference/modules/ai.md) — the engine, and where providers are configured
- [`@apostrophecms/ai-adapter-openai`](/reference/modules/ai-adapter-openai.md) — the Responses API adapter, preferred for OpenAI proper

## Using it

| | |
|---|---|
| **Adapter name** | `openai-compatible` |
| **Label** | OpenAI Completions |
| **Default env key** | `APOS_OPENAI_KEY` |
| **Capabilities** | `text`, `tools`, `structured`, `imageInput`, `caching`, `image` |

Default effort table as shipped: `low` → `gpt-5.6-luna`, `medium` → `gpt-5.6-terra`, `high` → `gpt-5.6-sol`. Image models declared: `gpt-image-2` and `gpt-image-1`.

::: info
Model lineups move with provider releases. Those rows are what this version of the adapter declares, not a permanent contract — and they describe OpenAI, the adapter's *native* service. For the live answer in a running project, call [`apos.ai.modelCatalog()`](/reference/modules/ai.md#modelcatalog).
:::

## `openai` or `openai-compatible`?

**For OpenAI proper, prefer [`openai`](/reference/modules/ai-adapter-openai.md).** It speaks OpenAI's first-class Responses API and supports `reasoning` alongside `tools`.

`openai-compatible` speaks Chat Completions, which is what makes it universal. It works against `api.openai.com` too, but there a `tools` request drops `reasoning`, because the service rejects the combination in that dialect. Aliased entries describe other services, which accept it, and pass through untouched.

## A new provider with no code at all

Point this adapter at any compatible host and describe the service in the entry: its models, its effort rows, its capabilities.

::: warning Aliased entries bring their own tables
An **aliased** entry — one whose `adapter` differs from its own name — describes a different service than the adapter's native one, so the adapter's native effort rows and model table **do not apply to it**. Supply your own `effort` rows, and your own `models` to get metadata and defaults.

If an aliased entry is the default provider and declares no effort rows, the default level resolves to nothing and the boot fails with a message saying exactly that.
:::

### Groq

<AposCodeBlock>

```javascript
'@apostrophecms/ai': {
  options: {
    provider: 'groq',
    providers: {
      groq: {
        adapter: 'openai-compatible',
        baseUrl: 'https://api.groq.com/openai/v1',
        envKey: 'GROQ_API_KEY',
        capabilities: { image: false },
        models: {
          'llama-3.3-70b-versatile': { label: 'Llama 3.3 70B', contextWindow: 128000, maxOutputTokens: 32768 },
          'llama-3.1-8b-instant': { label: 'Llama 3.1 8B', contextWindow: 128000, maxOutputTokens: 8192 }
        },
        effort: {
          low: { model: 'llama-3.1-8b-instant' },
          medium: { model: 'llama-3.3-70b-versatile' },
          high: { model: 'llama-3.3-70b-versatile' }
        }
      }
    }
  }
}
```
  <template v-slot:caption>
    app.js
  </template>
</AposCodeBlock>

### A local Ollama runtime

There is no authentication, but [a key is still required](/reference/modules/ai.md#providers), so point `envKey` at a project-defined variable holding a placeholder.

```bash
export OLLAMA_KEY=ollama
```

```javascript
providers: {
  ollama: {
    adapter: 'openai-compatible',
    baseUrl: 'http://localhost:11434/v1',
    envKey: 'OLLAMA_KEY',
    capabilities: { image: false, caching: false },
    models: {
      'qwen3:8b': { label: 'Qwen3 8B', contextWindow: 32768, maxOutputTokens: 8192 }
    },
    effort: {
      low: { model: 'qwen3:8b' },
      medium: { model: 'qwen3:8b' },
      high: { model: 'qwen3:8b' }
    }
  }
}
```

### One extra provider beside a standard one

```javascript
provider: 'anthropic',
providers: {
  anthropic: {},
  openrouter: {
    adapter: 'openai-compatible',
    baseUrl: 'https://openrouter.ai/api/v1',
    envKey: 'OPENROUTER_API_KEY',
    capabilities: { image: false },
    models: { 'mistralai/mistral-large': { label: 'Mistral Large' } }
  }
},
effort: {
  levels: {
    low: { provider: 'openrouter', model: 'mistralai/mistral-large' }
  }
}
```

## Options

| Property | Type | Default | Description |
|---|---|---|---|
| [`timeout`](#timeout) | integer | `600000` | Per-request milliseconds. |

### `timeout`

Milliseconds one request to the service may take. A timeout is a *retryable* failure: it normalizes to `aiRetry` with `kind: 'timeout'`, and the engine's [retry policy](/reference/modules/ai.md#error-codes) decides what happens next. Worth raising for a local runtime on modest hardware.

Note that this is a module option, so it applies to every provider entry using this adapter.

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
    modules/@apostrophecms/ai-adapter-openai-compatible/index.js
  </template>
</AposCodeBlock>

## Writing a new adapter

Write one when a service's dialect is genuinely not Chat Completions. Otherwise use [a config-only provider](#a-new-provider-with-no-code-at-all).

**The thin-adapter principle.** An adapter owns exactly five things: request-body translation, response parsing, finish-reason mapping, error normalization, and its provider's model / effort / capability metadata. Routing, retries, the agent loop, validation, caching policy and mock mode are the engine's, always.

<AposCodeBlock>

```javascript
export default {
  options: {
    timeout: 600000
  },
  init(self) {
    self.apos.ai.addAdapter(self.adapter());
  },
  methods(self) {
    return {
      adapter() {
        return {
          name: 'my-service',
          label: 'My Service',
          baseUrl: 'https://api.example.com/v1',
          envKey: 'MY_SERVICE_KEY',
          capabilities: {
            text: true,
            tools: true,
            structured: false,
            imageInput: false,
            image: false,
            caching: false
          },
          effort: {
            low: { model: 'small' },
            medium: { model: 'medium' },
            high: { model: 'large', reasoning: 'high' }
          },
          models: {
            small: { label: 'Small', contextWindow: 128000, maxOutputTokens: 8192 },
            medium: { label: 'Medium', contextWindow: 256000, maxOutputTokens: 16384 },
            large: { label: 'Large', contextWindow: 256000, maxOutputTokens: 32768 }
          },

          // Fail the boot on a configuration this adapter cannot work with.
          // `this` is the instantiated adapter: the engine has assigned
          // `provider`, `baseUrl` and the resolved `apiKey` - read from the
          // entry's environment variable - from the configured entry.
          validate() {
            self.apos.ai.requireApiKey(this);
          },

          // ONE model turn. The engine drives the loop.
          async chat(req, request) {
            const response = await self.apos.http.post(`${this.baseUrl}/chat`, {
              headers: { authorization: `Bearer ${this.apiKey}` },
              body: self.buildBody(request),
              timeout: self.options.timeout,
              ...(request.signal && { signal: request.signal })
            });

            return self.parseResponse(response, request);
          },

          normalizeError(error) {
            return self.normalizeError(error);
          }
        };
      },
      buildBody(request) { /* normalized → dialect */ },
      parseResponse(response, request) { /* dialect → normalized turn */ },
      normalizeError(error) {
        return self.apos.ai.normalizeHttpError(error, { requestIdHeader: 'x-request-id' });
      }
    };
  }
};
```
  <template v-slot:caption>
    modules/my-ai-adapter/index.js
  </template>
</AposCodeBlock>

Register the module in `app.js`, then configure a provider entry naming it.

### What `chat` receives

```javascript
{
  system,     // optional
  messages,   // normalized messages
  tools,      // optional: [ { name, description, input } ] - handlers never reach here
  schema,     // optional: JSON Schema for structured output
  model,
  maxTokens,  // optional
  reasoning,  // optional, in your own vocabulary
  cache,      // false | { ttl: 'short' | 'long' }
  signal      // optional
}
```

Optional fields are present only when they resolved to a value, so an unset dial leaves the provider's own default in place.

### What `chat` must return

```javascript
{
  content: [ /* text / toolCall parts */ ],
  finishReason: 'stop' | 'toolCalls' | 'length' | 'refusal',
  usage: { inputTokens, outputTokens },
  model,   // optional: what actually answered
  object   // optional: the structured answer, if the request carried a schema
}
```

The engine validates this. A missing or unknown finish reason, malformed content or missing `usage` is treated as a truncated response and **retried** — never returned as a short success. So an unknown finish reason should map to nothing, not to `stop`.

### `image(req, request)` — optional

Receives `{ prompt, count, aspect?, quality?, images?, model, signal? }` and returns `{ images: [ { type, data } ], model?, usage?, size? }`. `aspect` is already resolved against the model's declared ratios and is always a `W:H` string, never a named token.

### `normalizeError(error)` — required

Map whatever the transport threw onto an apos error code. **The engine reacts to codes alone** — it never sniffs raw errors. Usually one call to the shared helper:

```javascript
self.apos.ai.normalizeHttpError(error, {
  requestIdHeader: 'x-request-id',
  retryHint: (error) => error.body?.retry_in_seconds
});
```

The helper's ladder:

| Condition | Result |
|---|---|
| An abort | passes through untouched |
| Timeout or unreachable host | `aiRetry`, `kind: 'timeout'` / `'network'` |
| 429 | `aiRetry`, `kind: 'rateLimit'` |
| 5xx | `aiRetry`, `kind: 'overload'` |
| 401 / 403 | `forbidden` |
| 404 | `notfound` |
| anything else | `invalid` |

The provider's own message wins over the transport's when the error body carries one.

Two more public helpers: [`apos.ai.parseRetryAfter(value)`](/reference/modules/ai.md#adapter-helpers) turns a `Retry-After` count or HTTP date into seconds, and `apos.ai.requireApiKey(adapter)` is the boot-time key check nearly every `validate()` is.

Hints ride on the error's `data`: `status`, `kind`, `retryAfter` in seconds, `requestId`. They shape the delay and the log records, never the routing.

::: warning
Everything on `error.data` is written verbatim into [the engine's log records](/reference/modules/ai.md#logging). Never put keys, credentials or personal data there.
:::

### Two rules that are easy to get wrong

- **Transport is `apos.http`, never a provider SDK.** Adapters are thin enough not to need one, and a dependency per provider is a dependency per provider.
- **Skip content parts you do not own.** Provider reasoning artifacts round-trip through transcripts as opaque parts with dialect-distinct names, replayed verbatim so a model keeps its thinking continuity. `buildBody` must skip part types it does not recognize rather than choke on them or drop them.
