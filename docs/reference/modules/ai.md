---
extends: '@apostrophecms/module'
---

# `@apostrophecms/ai`

**Alias:** `apos.ai`

<AposRefExtends :module="$frontmatter.extends" />

`apos.ai` is a provider-agnostic AI engine that ships in ApostropheCMS core. Feature code — core modules, Pro extensions, project code and third-party modules — is written once against one normalized surface. Which AI service actually answers is a configuration decision, not a code decision.

```javascript
const result = await self.apos.ai.generate(req, 'Summarize this page in one sentence.');
console.log(result.text);
```

That call works against Anthropic, OpenAI, Google Gemini, or any OpenAI-compatible service, unchanged.

## Three words to keep straight

| Term | Meaning |
|---|---|
| **Engine** | The one `@apostrophecms/ai` module. Owns the API surface, routing, the tool loop, retries, validation, jobs and mock mode. |
| **Adapter** | A thin translator for one service dialect. Turns the normalized request into that service's HTTP body, and its response back into the normalized shape. Nothing else. |
| **Provider** | A configured entry in your project naming an adapter plus its key, base URL and model metadata. The thing a call routes to. |

One engine ← many adapters ← many providers. A provider named `openai` and a provider named `groq` can both use adapters that ship in core; the difference is configuration.

::: info
AI is opt-in. Out of the box the engine ships no provider and no key, and `apos.ai.active` is `false`. Nothing calls out to anything until you configure a provider.
:::

## Related documentation

- [`@apostrophecms/ai-adapter-anthropic`](/reference/modules/ai-adapter-anthropic.md)
- [`@apostrophecms/ai-adapter-openai`](/reference/modules/ai-adapter-openai.md)
- [`@apostrophecms/ai-adapter-openai-compatible`](/reference/modules/ai-adapter-openai-compatible.md)
- [`@apostrophecms/ai-adapter-google`](/reference/modules/ai-adapter-google.md)
- [`@apostrophecms/log`](/reference/modules/log.md) — where the engine's records go
- [`@apostrophecms/notification`](/reference/modules/notification.md) — the transport behind background job progress

All of these modules are registered in core's `defaults.js`. There is nothing to install and nothing to add to `app.js` to make them exist.

## Quick start

**1. Set a key in the environment.**

```bash
export APOS_ANTHROPIC_KEY=sk-ant-...
```

**2. Name the provider.**

<AposCodeBlock>

```javascript
import apostrophe from 'apostrophe';

apostrophe({
  root: import.meta,
  shortName: 'my-project',
  modules: {
    '@apostrophecms/ai': {
      options: {
        providers: {
          anthropic: {}
        }
      }
    },
    'my-module': {}
  }
});
```
  <template v-slot:caption>
    app.js
  </template>
</AposCodeBlock>

An empty entry is a complete configuration: the adapter supplies the base URL, the environment variable name, the model lineup and a three-level effort table.

**3. Call it.**

<AposCodeBlock>

```javascript
export default {
  apiRoutes(self) {
    return {
      post: {
        async summarize(req) {
          const result = await self.apos.ai.generate(req, {
            system: 'You write concise editorial summaries.',
            messages: [
              { role: 'user', content: req.body.text }
            ],
            effort: 'low'
          });

          return { summary: result.text };
        }
      }
    };
  }
};
```
  <template v-slot:caption>
    modules/my-module/index.js
  </template>
</AposCodeBlock>

**4. Develop offline.** Set `APOS_AI_MOCK=1` and every call is answered by a built-in mock through the real pipeline — no key, no network. See [Mock mode](#mock-mode-and-testing).

```bash
APOS_AI_MOCK=1 npm run dev
```

## Options

Everything lives under the `@apostrophecms/ai` module's options. Options are flat: tunables are scalars, and `providers`, `effort` and `image` are configuration data.

| Property | Type | Default | Description |
|---|---|---|---|
| [`providers`](#providers) | object | `{}` | The services that exist in this project. |
| [`provider`](#provider) | string | the only entry | The default provider, required when more than one is configured. |
| [`effort`](#effort) | object | the default provider's own rows | The routing table feature code selects with. |
| [`image`](#image) | object | none | The route image generation uses. |
| [`maxSteps`](#tunables) | integer | `5` | Cap on model turns in one tool-calling call. |
| [`retryAttempts`](#tunables) | integer | `5` | Attempts allowed for one adapter call. |
| [`retryBaseDelay`](#tunables) | integer | `1000` | Base milliseconds for the backoff curve. |
| [`retryMaxElapsed`](#tunables) | integer | `60000` | Total milliseconds one call may spend, retry waits included. |
| [`jobExpireAfter`](#tunables) | integer | `86400` | Seconds a background AI job record is kept. |
| [`jobPollInterval`](#tunables) | integer | `2000` | Milliseconds between cancellation checks on a background run. |
| [`mock`](#mock-mode-and-testing) | function | built-in | Answers chat calls under `APOS_AI_MOCK`. |
| [`mockImage`](#mock-mode-and-testing) | function | built-in | The same for image calls. |

```javascript
'@apostrophecms/ai': {
  options: {
    providers: { /* … */ },  // which services exist
    provider: 'anthropic',   // the default one
    effort: { /* … */ },     // the routing table
    image: { /* … */ },      // the image route
    maxSteps: 5,
    retryAttempts: 5,
    retryBaseDelay: 1000,
    retryMaxElapsed: 60000,
    jobExpireAfter: 86400,
    jobPollInterval: 2000
  }
}
```

### `providers`

`providers` maps a provider name you choose to an entry describing the service. Every field of an entry is optional.

```javascript
providers: {
  anthropic: {
    envKey: 'MY_CLAUDE_KEY',  // read the key from this environment variable
    baseUrl: 'https://…',     // override the adapter's default endpoint
    adapter: 'anthropic',     // which adapter speaks for it
    models: { /* … */ },      // add or amend model metadata
    effort: { /* … */ },      // this provider's own effort rows
    capabilities: { /* … */ } // override what the adapter declares
  }
}
```

| Field | Meaning |
|---|---|
| `adapter` | The registered adapter name. Omit it and the entry's own key is used as the adapter name — which is why `providers: { anthropic: {} }` works. Naming a different adapter makes the entry *aliased*; see [config-only providers](/reference/modules/ai-adapter-openai-compatible.md#a-new-provider-with-no-code-at-all). |
| `envKey` | The environment variable the key is read from. Defaults to the adapter's own. |
| `baseUrl` | Endpoint override — the whole point of pointing a standard adapter at a different host. |
| `models` | Per-model metadata, merged over the adapter's table, entry wins. See [Model metadata](#model-metadata). |
| `effort` | Effort rows for this provider, `{ level: { model, reasoning? } }`. No `provider` key — the entry is the provider. |
| `capabilities` | Booleans merged over the adapter's declaration, entry wins. Use it to say "this host cannot do images". |

::: warning
Keys belong in the environment. An entry may carry an `apiKey` directly — it exists for local experiments and for configuration assembled at runtime from a secrets manager — but **a literal key in a committed file is not acceptable in production**. The environment always wins: when the variable named by `envKey` is set and non-empty it overrides a configured `apiKey`, so a key left in code can never silently beat the one in the deployment environment.
:::

Already have the key in a variable of your own? Name that variable rather than renaming it or moving the key into code.

```javascript
providers: {
  openai: {
    envKey: 'OPENAI_API_KEY'
  }
}
```

**A key is required.** All four shipped adapters fail the boot when their provider entry resolves to no key. A local runtime with no authentication still needs one, so give it a project-defined variable holding any placeholder value.

```bash
export OLLAMA_KEY=ollama
```

```javascript
providers: {
  ollama: {
    adapter: 'openai-compatible',
    baseUrl: 'http://localhost:11434/v1',
    envKey: 'OLLAMA_KEY'
  }
}
```

### `provider`

With exactly one provider configured, it is the default automatically. With more than one, `provider` must name the default, or the boot fails.

```javascript
providers: {
  anthropic: {},
  openai: {}
},
provider: 'anthropic'
```

### `effort`

Effort levels are the everyday routing vocabulary: feature code says how much thinking a task deserves, and the project decides which model that is.

```javascript
effort: {
  default: 'medium', // the level an effortless call lands on; 'medium' by default
  levels: {
    low: { provider: 'anthropic', model: 'claude-haiku-4-5' },
    medium: { provider: 'anthropic', model: 'claude-sonnet-5', reasoning: 'medium' },
    high: { provider: 'openai', model: 'gpt-5.6-sol', reasoning: 'high' }
  }
}
```

How the table is built:

- The default provider's own effort rows — the adapter's, merged with the entry's — are the base. That is why `providers: { anthropic: {} }` alone gives you working `low` / `medium` / `high` levels.
- `effort.levels` then replaces the table level by level. Each row there must carry `provider` and `model`, and may carry `reasoning`.

The level names are yours. `low` / `medium` / `high` are what the shipped adapters declare, but a project is free to define `draft`, `review` and `flagship` instead — just remember to point `effort.default` at one that exists.

A level naming an unconfigured provider fails the boot, and so does a default level that resolves to no row.

### `image`

Image generation is routed separately, because the model that writes your copy is rarely the one that draws your pictures.

```javascript
image: {
  provider: 'openai',
  model: 'gpt-image-2',
  aspect: 'landscape', // default shape for calls that don't say
  quality: 'medium'    // default spend for calls that don't say
}
```

The named provider must be configured and declare the `image` capability, or the boot fails. `aspect` accepts `square`, `portrait`, `landscape` or a `W:H` ratio; `quality` accepts `low`, `medium` or `high`.

### Model metadata

Adapters declare what they know about their models. A provider entry can amend or extend that table — useful the day a provider ships a model newer than your Apostrophe version.

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

| Field | Meaning |
|---|---|
| `label` | Human name for pickers and receipts. The id stays the wire truth. |
| `contextWindow` | Total token window. Informational. |
| `maxOutputTokens` | The default output cap a call inherits when it sets no `maxTokens`. |
| `reasoning` | The values a call may pass as `reasoning` for this model, in the provider's own vocabulary. Informational — read back by [`modelCatalog()`](#modelcatalog) for building pickers, never enforced by the engine. The provider still rejects what it rejects. |
| `aspects` | Image models only: the `W:H` ratios the model supports. A requested `aspect` resolves to the nearest declared one. |

Metadata is optional. An unknown model is not an error — the call still runs; you simply get no defaults and no introspection data for it.

### Capabilities

Each adapter declares what its service offers. A provider entry can override any of them.

| Capability | Gated by the engine? |
|---|---|
| `text` | Yes — `generate` requires it. |
| `tools` | Yes — a call passing `tools` requires it. |
| `structured` | Yes — a call passing `schema` requires it. |
| `image` | Yes — `generateImage` requires it, and the image route is checked at boot. |
| `imageInput`, `caching` | No — declarative metadata, readable via `modelCatalog()`. |

Routing a call to a provider that lacks the capability it needs is a clear `invalid` error, never a silent re-route to another provider.

### Tunables

| Option | Default | Meaning |
|---|---|---|
| `maxSteps` | `5` | Cap on model turns in one tool-calling call. Any call may override it. |
| `retryAttempts` | `5` | How many times one adapter call may be attempted before a transient failure gives up. |
| `retryBaseDelay` | `1000` | Base milliseconds for the exponential backoff curve. |
| `retryMaxElapsed` | `60000` | Total milliseconds one call may spend including its retry waits. A delay that would land past this stops the call. |
| `jobExpireAfter` | `86400` | Seconds a background AI job record is kept before the database expires it. `0` keeps records forever. Overridable per call. |
| `jobPollInterval` | `2000` | Milliseconds between checks of a background run's cancellation flag. |

### Environment variables

| Variable | Effect |
|---|---|
| `APOS_AI_MOCK` | `'1'` turns on mock mode. Read once at startup. |
| `APOS_ANTHROPIC_KEY` | Default key variable for the `anthropic` adapter. |
| `APOS_OPENAI_KEY` | Default for `openai` and `openai-compatible`. |
| `APOS_GEMINI_KEY` | Default for `google`. |

Boolean flags follow the Apostrophe convention: the value is compared to the string `'1'`, not tested for truthiness.

### Configuration recipes

**One provider, defaults for everything**

```javascript
'@apostrophecms/ai': {
  options: {
    providers: { openai: {} }
  }
}
```

**Cheap by default, a flagship for the hard level**

```javascript
'@apostrophecms/ai': {
  options: {
    provider: 'anthropic',
    providers: {
      anthropic: {},
      openai: {}
    },
    effort: {
      default: 'low',
      levels: {
        high: { provider: 'openai', model: 'gpt-5.6-sol', reasoning: 'high' }
      }
    }
  }
}
```

**Text from one service, images from another**

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

For a gateway or a local runtime with no adapter code at all, see [the `openai-compatible` adapter](/reference/modules/ai-adapter-openai-compatible.md).

### What fails the boot

Configuration mistakes are startup failures with a message naming the offending entry, prefixed `@apostrophecms/ai:`. Nothing waits until an editor clicks a button.

- an option of the wrong shape (`"providers.groq.envKey" must be a string`)
- a provider naming an unknown adapter
- several providers with no `provider` naming the default
- an effort level or an image route naming an unconfigured provider
- an image route whose provider does not declare the `image` capability
- a default effort level that resolves to no routing row
- an adapter whose `validate()` rejects the entry — a missing key above all
- a malformed tool registration

## Properties

### `active`

`true` when AI is usable — a provider is configured, or mock mode is on. Check it before offering an AI feature in the UI.

```javascript
if (!self.apos.ai.active) {
  return;
}
```

### `mockMode`

`true` when `APOS_AI_MOCK` is `'1'`. Resolved once at startup and never re-read per call, so it is a stable boolean, not a live check of the environment. Use it to label placeholder output in the UI.

## Featured methods

Every method takes `req` first. The engine never invents an identity: the request you pass is the one that reaches events, adapters and tool handlers.

### `async generate(req, prompt | options, [options])`

The language method. Plain text, multi-turn chat, structured output and the tool-calling agent loop are all this one method with different options.

```javascript
// Prompt string
const a = await self.apos.ai.generate(req, 'Write a headline about spring gardening.');

// Prompt string plus options
const b = await self.apos.ai.generate(req, 'Write a headline.', { effort: 'low' });

// Options alone (no second argument is accepted then)
const c = await self.apos.ai.generate(req, {
  system: 'You are an editorial assistant.',
  messages: [ { role: 'user', content: 'Write a headline.' } ]
});
```

A prompt string is the final user turn: it is the whole conversation when there are no `messages`, and is appended as the latest turn when there are.

#### Options

| Option | Type | Meaning |
|---|---|---|
| `system` | string | The system prompt. A top-level option, never a message. |
| `messages` | array | The conversation so far. See [Messages](#messages). |
| `tools` | string[] | Registered tool names the model may call. See [Tools](#tools). |
| `maxSteps` | integer | Cap on model turns for this call. Defaults to the module option. |
| `pending` | `'refuse'` \| `'execute'` | What to do with a transcript ending in unanswered tool calls. See [Suspension](#suspension-asking-the-user-mid-run). |
| `toolInput` | object | Answers for suspended tool calls, keyed by tool call id. Requires `pending: 'execute'`. |
| `schema` | object | JSON Schema (object root) for structured output. |
| `effort` | string | The routing level to resolve. Defaults to `effort.default`. |
| `provider` + `model` | string | Pin one model, bypassing the routing table. Required together. |
| `reasoning` | string | Override the resolved row's reasoning, in the provider's vocabulary. |
| `maxTokens` | integer | Output cap. Defaults to the routed model's declared `maxOutputTokens`. |
| `cache` | `false` \| `'short'` \| `'long'` | Prompt-cache policy the adapter translates for its provider. `'short'` by default. |
| `signal` | AbortSignal | Cancels the call. See [Cancellation](#cancellation). |
| `onMessage` | function | Called and awaited with each intermediate assistant turn, before its tools run. |
| `onToolCall` | function | Called and awaited twice around every tool handler — `phase: 'start'` and `'end'`. |

An unknown option name is an `invalid` error. Bad input is rejected before any provider is touched.

#### The return value

One shape, always. Which fields are populated is what tells you what happened.

```javascript
{
  text: 'The final assistant text; may be an empty string.',
  object: { /* structured output, when `schema` was passed and the call finished 'stop' */ },
  messages: [ /* the full transcript, resumable as the next call's `messages` */ ],
  steps: [ /* what the tool loop executed, in model order; present when the call carried tools */ ],
  toolCalls: [ /* unexecuted tool requests you must handle yourself */ ],
  suspended: [ /* the asks of handlers that paused the run */ ],
  finishReason: 'stop',
  usage: { inputTokens: 1200, outputTokens: 310 },
  model: 'claude-sonnet-5',
  provider: 'anthropic'
}
```

| `finishReason` | Meaning |
|---|---|
| `stop` | The model answered. |
| `length` | The output token budget cut the answer off. |
| `maxSteps` | The step budget cut the loop off. The last turn's requests are on `toolCalls`, unexecuted. |
| `cancel` | The call's `signal` fired. Partial `text`, `steps` and `usage` are preserved. |
| `input` | A tool handler paused the run waiting for outside input. The asks are on `suspended`. |

`usage` is aggregated across every model turn of the call.

#### Messages

A message is `{ role, content }` where `role` is `'user'`, `'assistant'` or `'tool'`, and `content` is an array of content parts — or a plain string, which is shorthand for a single text part.

```javascript
messages: [
  { role: 'user', content: 'What is in this picture?' },
  {
    role: 'user',
    content: [
      { type: 'text', text: 'And this one?' },
      { type: 'image', image: { url: 'https://example.com/photo.jpg' } }
    ]
  }
]
```

| Part | Shape | Valid in |
|---|---|---|
| text | `{ type: 'text', text }` | `user`, `assistant` |
| image | `{ type: 'image', image: { url } }` or `{ type: 'image', image: { data, mediaType } }` | `user`, `assistant` |
| tool call | `{ type: 'toolCall', id, name, input }` | `assistant` |
| tool result | `{ type: 'toolResult', toolCallId, output }` or `{ …, error }` | `tool` |

::: warning
An image `url` is fetched server-side by the adapter. Vetting and authorizing a user-supplied URL is the caller's job before it reaches this surface.
:::

Transcripts round-trip. Hand `result.messages` straight back as the next call's `messages` and the conversation continues — including through a provider's own reasoning artifacts, which travel verbatim so a model keeps its thinking continuity across turns.

```javascript
let messages = [];

async function ask(req, question) {
  const result = await self.apos.ai.generate(req, question, { messages });
  messages = result.messages;
  return result.text;
}
```

#### Routing a single call

```javascript
// By effort level - the normal way
await self.apos.ai.generate(req, prompt, { effort: 'high' });

// Pinned to one model - bypasses the routing table entirely
await self.apos.ai.generate(req, prompt, {
  provider: 'anthropic',
  model: 'claude-opus-5',
  reasoning: 'max'
});
```

`provider` and `model` must be given together. Resolution order: explicit `provider` + `model`, else the call's `effort` level, else the default level.

#### Tool calling

```javascript
const result = await self.apos.ai.generate(req, {
  system: 'You help editors find and audit content.',
  messages: [ { role: 'user', content: 'Which pages have no meta description?' } ],
  tools: [ 'find_pages', 'get_page' ],
  maxSteps: 8,
  onToolCall(event) {
    if (event.phase === 'start') {
      self.apos.util.log(`running ${event.call.name}`);
    }
  }
});

for (const step of result.steps) {
  // step.toolCall, and either step.result or step.error
}
```

The engine drives the whole loop: it sends the model the tools it may call, validates the arguments the model produces, runs the handlers, feeds the results back, and asks again until the model answers or the step budget runs out. See [Tools](#tools).

`maxSteps: 1` is manual mode: one model turn, no execution. The requests come back on `toolCalls` for you to run yourself.

#### Structured output

Pass a JSON Schema with an object root and the engine constrains the provider's native structured mode to it. The validated result comes back on `object`.

```javascript
const result = await self.apos.ai.generate(req, {
  messages: [ { role: 'user', content: article } ],
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      tags: {
        type: 'array',
        items: { type: 'string' },
        maxItems: 5
      },
      tone: { type: 'string', enum: [ 'formal', 'casual' ] }
    },
    required: [ 'title', 'tags' ]
  }
});

result.object.title; // typed, validated
```

- Capability-gated on `structured`.
- Combines with `tools`: the schema constrains only the final answer; tool turns run the loop normally.
- The engine validates the returned object as a backstop. A response that does not conform is treated as a bad answer and retried, not returned short.
- On a `length` finish there is no `object` — the finish reason tells you why.

#### Cancellation

Pass an `AbortSignal`. When it fires the loop winds down rather than failing:

- the in-flight step is waited out — a running tool handler is never abandoned, and its completed work stays recorded;
- the aborted provider call is not retried;
- the call returns normally with `finishReason: 'cancel'`, partial `text`, `steps` and `usage` preserved, and unexecuted requests on `toolCalls`.

```javascript
const controller = new AbortController();
setTimeout(() => controller.abort(), 30000);

const result = await self.apos.ai.generate(req, prompt, {
  tools: [ 'find_pages' ],
  signal: controller.signal
});

if (result.finishReason === 'cancel') {
  // partial, but usable
}
```

The signal also reaches every tool handler, on `args._context.signal`.

#### Suspension: asking the user mid-run

A tool handler that cannot finish without outside input — a confirmation, a choice, a missing value — throws `aiInput` with the ask riding the error's `data`. The run does not fail; it pauses.

```javascript
// In a tool handler
if (!args.confirmed) {
  throw self.apos.error('aiInput', 'confirmation required', {
    question: 'Publish 12 pages?',
    choices: [ 'yes', 'no' ]
  });
}
```

The call returns with:

```javascript
{
  finishReason: 'input',
  suspended: [
    { callId: 'call_abc', name: 'publish_pages', payload: { question: '…', choices: [ … ] } }
  ],
  toolCalls: [ /* the suspended calls and any actions that never started */ ],
  messages: [ /* the transcript, with everything that DID execute recorded */ ]
}
```

Store the transcript, ask the user, then continue by handing it back:

```javascript
const result = await self.apos.ai.generate(req, {
  messages: storedTranscript,
  tools: [ 'publish_pages' ],
  pending: 'execute',
  toolInput: {
    call_abc: { confirmed: true }
  }
});
```

The trailing calls run first — each handler reading its answer on `args._context.input` — their results complete the tool message, and only then is the model asked. The engine has no idea how long the transcript sat in your database; the request it builds looks exactly like an ordinary mid-loop step.

Rules worth stating explicitly:

- `pending` defaults to `'refuse'`: a transcript ending in unanswered tool calls throws a clear `invalid`, because no provider accepts that shape.
- Every `toolInput` key must name an unanswered trailing call.
- A prompt string cannot be combined with a suspended transcript.
- A handler may suspend again. There is no limit on re-suspension.
- Within a batch, queries all complete together (so several may suspend at once), and no action past the earliest suspended call ever starts.
- A cancellation observed at the suspension wins: the run ends `cancel`, no ask.

### `async generateImage(req, prompt, [options])`

Text → image, or image(s) + text → image when `images` sources are passed.

```javascript
const result = await self.apos.ai.generateImage(req, 'A watercolor of a harbour at dawn', {
  count: 2,
  aspect: 'landscape',
  quality: 'high'
});

result.images;   // [ { type: 'png', data: '<base64>' }, … ]
result.provider;
result.model;
result.aspect;   // the resolved native ratio, e.g. '3:2'
result.size;     // native pixel size, when the provider works in pixels
result.usage;
```

| Option | Meaning |
|---|---|
| `count` | How many images. `1` by default. |
| `aspect` | `square`, `portrait`, `landscape` or a `W:H` ratio. Resolved to the nearest ratio the routed model declares. |
| `quality` | `low`, `medium`, `high`. Mapped to the provider's own knob; providers without one ignore it. |
| `images` | Source images (`{ url }` or `{ data, mediaType }`). Their presence is what makes the call an edit — the prompt then instructs the edit. |
| `provider` + `model` | Pin one model, bypassing the image route. The route's default dials do not apply then. |
| `signal` | Aborts the in-flight call. |

An omitted dial is not sent at all, leaving the provider's own default in place.

Editing an existing image:

```javascript
const edited = await self.apos.ai.generateImage(req, 'Make the sky stormy', {
  images: [ { url: self.apos.attachment.url(attachment, { size: 'full' }) } ]
});
```

Storing the result as an [attachment](/reference/modules/attachment.md):

```javascript
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

const [ image ] = result.images;
const file = path.join(os.tmpdir(), `${self.apos.util.generateId()}.${image.type}`);

await fs.writeFile(file, Buffer.from(image.data, 'base64'));

const attachment = await self.apos.attachment.insert(req, {
  name: `harbour.${image.type}`,
  path: file
});

await fs.unlink(file);
```

### `async generateJob(req, prompt | options, [options])`

The non-blocking form of `generate`. The `await` covers job creation only: the method returns as soon as the record exists, and the run continues in the background.

```javascript
const { jobId, cancel } = await self.apos.ai.generateJob(req, {
  messages,
  tools: [ 'find_pages', 'update_page' ],
  maxSteps: 20,
  async onEnd(error, result) {
    if (error) {
      return self.logError(req, 'assistant-failed', error.message);
    }
    await self.saveTranscript(req, result.messages);
  }
});
```

It accepts everything `generate` accepts, plus:

| Option | Meaning |
|---|---|
| `onEnd(error, result)` | Called once when the run ends. A cancelled run is a *result* with `finishReason: 'cancel'`, not an error. A throw from `onEnd` is logged, never recorded on the job. |
| `expireAfter` | Seconds the job record is kept. Defaults to `jobExpireAfter`; `0` keeps it forever. |
| `notify` | Publish progress to the caller's browser. `true` by default. |

Invalid options throw synchronously — a job record is created only for a run that can actually start.

The exact object `generate` would have returned is stored on the job record as `results`; a failure stores its error instead. Read it through the job module's status route.

#### Progress in the browser

With `notify` on, the run publishes four stages over the notification channel. Each arrives as a one-shot `apos.bus` event named `ai-generate-job`, emitted in exactly one tab.

```javascript
apos.bus.$on('ai-generate-job', (data) => {
  if (data.jobId !== myJobId) {
    return;
  }
  switch (data.stage) {
    case 'started': break;
    case 'message': /* data.message is the intermediate assistant turn, data.step its number */ break;
    case 'tool': /* data.phase, data.name, data.id, data.step, data.chars | data.error */ break;
    case 'ended': /* data.status: 'completed' | 'cancelled' | 'failed', plus finishReason or error */ break;
  }
});
```

- The `tool` stage is a *progress line, not the work*: it carries the result's size in characters, never the result itself. The transcript carries that.
- Correlate by `jobId` and read the stored result from the status route — the record may flip to its terminal status moments after the `ended` event.
- Notifications reach logged-in users only. A `req` without a user is a silent no-op.

Set `notify: false` when you have your own transport; the hooks (`onMessage`, `onToolCall`, `onEnd`) then own it entirely. Cancellation stays on the job layer either way.

#### Cancelling

`generateJob` resolves with the job's id and a `cancel` function — the two things the caller needs to follow the run it just started.

```javascript
const { jobId, cancel } = await self.apos.ai.generateJob(req, options);

// Later, in the same process: stop that run
await cancel();
```

Or, cross-process and from the browser, by `jobId`:

```
POST /api/v1/@apostrophecms/job/:jobId/cancel
GET  /api/v1/@apostrophecms/job/:jobId        // status, results, error
```

Either way the flag travels through the job record, the abort signal reaches the in-flight provider call and every handler, the run winds down per `generate`'s cancellation semantics with the partial result stored, and the job ends `cancelled`.

::: warning
Tool handlers may not start jobs. A subagent's work is blocking by design; `generateJob` from inside a handler throws `invalid`.
:::

### `modelInfo(options)`

Resolves exactly as a call would — including its `invalid` errors, so a routing that cannot resolve here would fail the same way for real. An unknown model is the exception: no error, just undefined limits.

```javascript
const info = self.apos.ai.modelInfo({ effort: 'high' });
// { provider, model, reasoning?, contextWindow, maxOutputTokens, capabilities }

const imageInfo = self.apos.ai.modelInfo({ capability: 'image' });
// … plus `aspects`
```

### `modelCatalog()`

The whole configuration, shaped for building pickers. Returns copies, safe to serialize or amend. Nothing reaches the browser unless you send it there.

```javascript
const catalog = self.apos.ai.modelCatalog();
// {
//   effort: { default: 'medium', levels: { low: { provider, model }, … } },
//   providers: {
//     anthropic: {
//       label: 'Anthropic (Claude)',
//       capabilities: { text: true, tools: true, … },
//       models: { 'claude-sonnet-5': { label, contextWindow, maxOutputTokens, reasoning } }
//     }
//   }
// }
```

`active` answers "is AI usable"; `modelCatalog` answers "what is configured". Under mock mode with no providers, `active` is `true` and the catalog is empty.

### `can(req, action, docOrType)`

Same signature and semantics as `apos.permission.can`, and today a pure proxy to it. See [Permissions and workflow](/guide/permissions-and-workflow.md).

```javascript
if (!self.apos.ai.can(req, 'edit', 'article')) {
  throw self.apos.error('forbidden');
}
```

::: warning
AI feature code and tool handlers must use this one, not `apos.permission.can` directly, so that AI-specific policy — actions denied to the AI even for an admin's request — can be layered centrally later without touching a single handler. It can only ever be as restrictive as `apos.permission.can`, or more.
:::

## Tools

Tools are how a model does things: read content, search, write a draft, publish. The engine owns the loop; you own the handlers.

### `addTool(definition)`

Tools are registered in a module's `init`, from core, Pro, project or third-party code — the same call for everyone.

#### The smallest tool that works

Four required fields, plus the one option worth setting from the very first tool:

<AposCodeBlock>

```javascript
export default {
  init(self) {
    self.apos.ai.addTool({
      name: 'count_pages',
      description: 'Count the published pages on this site.',
      kind: 'query',
      input: { type: 'object' },
      async handler(req) {
        return { total: await self.apos.page.find(req).toCount() };
      }
    });
  }
};
```
  <template v-slot:caption>
    modules/page-tools/index.js
  </template>
</AposCodeBlock>

`input` is a JSON Schema describing the arguments the model may pass. This tool takes none, so `{ type: 'object' }` — an object with nothing in it — is the whole schema. The handler returns an object, and that object is what the model reads.

`kind: 'query'` says the tool only reads. Queries the model asks for together run in parallel; without it a tool defaults to `'action'` and runs serially, one after another. Tag your read-only tools and a model that asks for six of them at once gets its answer in the time of the slowest, not the sum. See [Kinds and scheduling](#kinds-and-scheduling).

Use it by name:

```javascript
await self.apos.ai.generate(req, 'How many pages does this site have?', {
  tools: [ 'count_pages' ]
});
```

#### Giving the model arguments

Describe them in `input` and they arrive on `args`, already validated — a call whose arguments do not fit never reaches your handler.

```javascript
self.apos.ai.addTool({
  name: 'find_pages',
  description: 'Search pages by title. Returns matching pages with their ids and slugs.',
  kind: 'query',
  input: {
    type: 'object',
    properties: {
      search: { type: 'string', description: 'Words to match against the title' },
      limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 }
    },
    required: [ 'search' ]
  },
  async handler(req, args) {
    const pages = await self.apos.page
      .find(req, { title: new RegExp(self.apos.util.regExpQuote(args.search), 'i') })
      .project({ title: 1, slug: 1 })
      .limit(args.limit)
      .toArray();

    return {
      pages: pages.map(({ _id, title, slug }) => ({ _id, title, slug }))
    };
  }
});
```

Two things this buys you beyond validation: the `description` on each property is read by the model, so it is worth writing, and a `default` is filled in when the model omits the argument — `args.limit` is `10` here even when the model never mentions it.

#### The definition

| Field | Required | Meaning |
|---|---|---|
| `name` | ✓ | 1–64 letters, digits, `_` or `-`, starting with a letter — the intersection of the provider naming rules. Unique; re-registering overrides (last wins), so a project can replace a standard tool. |
| `description` | ✓ | What the model chooses the tool by. Treat it as part of the prompt. |
| `input` | ✓ | JSON Schema (draft 2020-12) with an object root. Sent to the provider. Declared `default` values are written into the arguments the handler receives when the model omits them — the transcript still records the call as the model made it. |
| `handler` | ✓ | An `async (req, args)` function, or a `'moduleName:methodName'` string resolved at activation. |
| `schema` | | JSON Schema for the handler's *result*. Internal: never sent to the model. Validated on every call; the result is serialized for the model verbatim either way, never coerced. |
| `kind` | | `'query'`, `'action'` (default) or `'agent'`. See [Kinds and scheduling](#kinds-and-scheduling). |
| `tags` | | Strings to query the registry by. |
| `label` | | Human-facing name for chat logs and activity trails; may be an i18n key. Defaults from the name (`find_pages` → `Find Pages`). Never sent to the model. |
| `maxResultChars` | | Result-size budget in serialized characters. See [Errors in handlers](#errors-in-handlers). |

A fuller registration:

```javascript
self.apos.ai.addTool({
  name: 'find_pages',
  description: 'Search pages by title. Returns matching pages with their ids and slugs.',
  kind: 'query',
  input: { /* as above */ },

  // Human-facing name for a chat log or activity trail. Never sent to the
  // model. Defaults to 'Find Pages', derived from the name
  label: 'Find Pages',

  // Query the registry by these; a feature can then assemble its toolset
  // with getTools({ tags: [ 'content' ] }) instead of naming tools one by one
  tags: [ 'content', 'read' ],

  // A safety net on YOUR result: a size budget, so a broad search cannot
  // flood the context window. Over budget, the model is told the size and
  // asked for less rather than being handed the payload
  maxResultChars: 20000,

  // Optional result schema. It is NOT sent to the model - it is an internal
  // check that your handler returns what you think it returns. A mismatch is
  // treated as a bug in your code, so add it once a tool matters, not to get
  // started
  schema: {
    type: 'object',
    properties: {
      pages: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' }
          },
          required: [ '_id', 'title', 'slug' ]
        }
      }
    },
    required: [ 'pages' ]
  },

  // Instead of an inline function: a method on any module, resolved at
  // startup. Handy when the handler is long or already exists
  handler: 'page-tools:findPages'
});
```

#### The registry is static and frozen

- Register in `init`, which is early enough for any module. Registration must happen before `apostrophe:ready` — `init` always is. Registering later, from a route or a handler on a later event, throws.
- Only registered tools can participate in a call. `generate` selects them **by name**; definitions never travel through a call.
- Everything but the name is validated at activation, and any problem **fails the boot** with a message naming the tool.
- `'moduleName:methodName'` handlers resolve at activation, so registration order and module overrides do not matter.
- Registering an existing name overrides it, last module wins — how a project replaces a tool it did not write.

### `hasTool(name)` · `getTool(name)` · `getTools([options])`

```javascript
self.apos.ai.hasTool('find_pages');            // boolean
self.apos.ai.getTool('find_pages');            // the activated definition, or undefined
self.apos.ai.getTools();                       // all of them
self.apos.ai.getTools({ tags: 'content' });    // by tag (a single tag may be a string)
self.apos.ai.getTools({ tags: [ 'read', 'write' ] }); // union
```

::: warning
Treat the returned array and definitions as read-only — the registry hands out the objects it holds, not copies.
:::

This is how a feature builds its toolset:

```javascript
const tools = self.apos.ai.getTools({ tags: [ 'content' ] }).map(tool => tool.name);
await self.apos.ai.generate(req, { messages, tools });
```

### Kinds and scheduling

`kind` declares a tool's consequence class, and scheduling follows from it.

| Kind | Meaning | Scheduling |
|---|---|---|
| `query` | Effect-free. | All queries in a batch run in parallel. |
| `action` (default) | Has effects. | Actions run serially, in the order the model requested them. Never re-run, never reordered. |
| `agent` | The handler makes its own `generate` call — a subagent with its own budgets. | Serial, like an action. |

When a model turn requests several tools, queries all run first and together, then actions follow in model order.

**Nesting is one level deep.** A handler may run a subagent; the subagent's tools may not `generate` further. At the allowed depth, `agent` tools are silently dropped from the set rather than rejected — so a toolset needs no curating per depth — and a `generate` call below that level throws `invalid`.

### The handler contract

```javascript
async function handler(req, args) {
  // args: the model's arguments, validated against `input`, with declared
  // defaults filled in, plus args._context
  return { /* an object */ };
}
```

- `req` is the caller's request, cloned and stamped with the AI nesting depth. The original is untouched, so concurrent calls sharing it are unaffected.
- The handler **must return an object**. Returning anything else is a bug and stops the call.
- With a declared result `schema`, the result is validated but never mutated.

`args._context` is injected by the engine *after* argument validation, so a model-provided property can never pose as core injection.

| `_context` property | Meaning |
|---|---|
| `call` | `{ id, name }` — the request this handler is answering, so a handler that records what it did can say which call it was. |
| `depth` | The nesting depth of this batch. |
| `signal` | The call's abort signal, when it has one. |
| `input` | This call's entry from `toolInput`, on a continued run only. Never the whole map — a handler sees only its own answer. |

### Permissions in handlers

The engine never checks permissions for you. A tool handler is ordinary server code and must authorize its own work against `req`.

```javascript
async function publishPage(req, args) {
  const page = await self.apos.page.find(req, { _id: args._id }).toObject();

  if (!page) {
    throw self.apos.error('aiToolError', 'no page with that id');
  }
  if (!self.apos.ai.can(req, 'publish', page)) {
    throw self.apos.error('forbidden', 'you may not publish this page');
  }
  // …
}
```

Note the difference in the two throws — which brings us to:

### Errors in handlers

There are exactly two outcomes for a failure, and the error code alone decides which.

**Recoverable — `aiToolError`.** The message is fed back to the model as this call's result, siblings are unaffected, and the loop continues. Use it for anything the model can correct: a bad id, an empty search, a value out of range.

```javascript
throw self.apos.error('aiToolError', 'no page with that id; call find_pages first');
```

**Hard stop — anything else.** The throw propagates and ends the whole call, and no trace of it ever reaches a model-bound message. Use it for authorization failures, infrastructure failures and bugs.

Two more failures the engine generates for you, both recoverable:

- **Invalid arguments.** Arguments that do not satisfy `input` never reach the handler; the validation message goes back to the model.
- **Oversized results.** A result over `maxResultChars` is withheld, and the model is told the actual size, the budget and the largest properties, so it can ask for less. A result that violates the declared result `schema`, by contrast, is a handler bug: it stops the call, and nothing about it is fed back.

And one that pauses instead of failing: `aiInput`, covered in [Suspension](#suspension-asking-the-user-mid-run). In a nested run it converts to `aiToolError` — a delegated run has no one to ask.

### A subagent tool

```javascript
self.apos.ai.addTool({
  name: 'draft_section',
  description: 'Write a section of body copy on a given topic.',
  kind: 'agent',
  input: {
    type: 'object',
    properties: {
      topic: { type: 'string' },
      words: { type: 'integer', default: 200 }
    },
    required: [ 'topic' ]
  },
  async handler(req, args) {
    const result = await self.apos.ai.generate(req, {
      system: 'You write clean, plain body copy. No headings.',
      messages: [ { role: 'user', content: `Write ~${args.words} words about: ${args.topic}` } ],
      effort: 'low'
    });

    return { text: result.text };
  }
});
```

The subagent inherits the stamped `req`, so its own tools cannot `generate` further.

## Adapter helpers

These exist for adapter authors. See [writing a new adapter](/reference/modules/ai-adapter-openai-compatible.md#writing-a-new-adapter).

| Method | Meaning |
|---|---|
| `addAdapter(adapter)` | Register an adapter. Called from the adapter module's `init`. |
| `normalizeHttpError(error, [options])` | Map a transport error onto an apos error code, with `status`, `kind`, `retryAfter` and `requestId` hints on `error.data`. |
| `parseRetryAfter(value)` | A `Retry-After` count or HTTP date → seconds. |
| `requireApiKey(adapter)` | The boot-time key check nearly every `validate()` is. |
| `logError` | Emit a record under `@apostrophecms/ai`, so adapter failures land in the same log stream rather than under the adapter's own module name. |

## Server events

| Event | Payload |
|---|---|
| `beforeGenerate` / `afterGenerate` | `(req, context)` — one shared mutable object carrying `provider`, `request` and, afterwards, `result`. Handlers can enrich the request and correlate the two. |
| `beforeGenerateImage` / `afterGenerateImage` | The same, around an image call. |
| `beforeToolCall` / `afterToolCall` | `(req, payload)` — `call`, `tool`, and afterwards `result`, `error` or `suspended`. |

<AposCodeBlock>

```javascript
export default {
  handlers(self) {
    return {
      '@apostrophecms/ai:beforeGenerate': {
        addHouseStyle(req, context) {
          context.request.system = `${context.request.system || ''}\nHouse style: British English.`;
        }
      }
    };
  }
};
```
  <template v-slot:caption>
    modules/my-module/index.js
  </template>
</AposCodeBlock>

Because every AI call passes through these events, they are the one place to audit AI usage project-wide — no feature has to opt in.

<AposCodeBlock>

```javascript
export default {
  handlers(self) {
    return {
      '@apostrophecms/ai:afterGenerate': {
        // Who spent what, on which model
        async recordSpend(req, context) {
          await self.db.insertOne({
            at: new Date(),
            userId: req.user?._id,
            provider: context.result.provider,
            model: context.result.model,
            usage: context.result.usage,
            finishReason: context.result.finishReason
          });
        }
      },
      '@apostrophecms/ai:afterToolCall': {
        // What the AI actually did, tool by tool
        async recordAction(req, payload) {
          if (payload.tool.kind === 'query') {
            return;
          }
          await self.db.insertOne({
            at: new Date(),
            userId: req.user?._id,
            tool: payload.tool.name,
            input: payload.call.input,
            outcome: payload.error ? 'error' : 'ok'
          });
        }
      }
    };
  }
};
```
  <template v-slot:caption>
    modules/ai-audit/index.js
  </template>
</AposCodeBlock>

What makes this a real trail: the events fire for every call, background jobs and subagents included, and `afterToolCall` sees the arguments as validated, so what you record is what the handler actually ran with. Skipping `kind: 'query'` keeps the trail to actions that changed something.

::: info
One gap to know about: a handler that fails with a hard-stopping error propagates immediately, so `afterToolCall` does not fire for it. Pair with `beforeToolCall` — which always fires — when the trail must show attempts as well as outcomes.
:::

## Error codes

| Code | HTTP | When |
|---|---|---|
| `invalid` | 400 | The caller's mistake — thrown before any provider is touched. |
| `aiRetry` | 503 | A transient provider failure that outlasted the retry budget. |
| `aiRefusal` | 422 | The model refused. Never retried. |
| `aiToolError` | 422 | A recoverable tool failure. See [Errors in handlers](#errors-in-handlers). |
| `aiInput` | 422 | A tool handler needs outside input. See [Suspension](#suspension-asking-the-user-mid-run). |
| `forbidden` | 403 | Standard, from adapter error normalization of a 401 or 403. |
| `notfound` | 404 | Standard, from adapter error normalization of a 404. |

**Retry policy.** Only `aiRetry` is retried. The provider's `Retry-After` (in seconds) replaces the computed backoff; otherwise the delay is exponential from `retryBaseDelay`, scaled by a random factor so synchronized clients spread out. `retryAttempts` and `retryMaxElapsed` bound the whole thing.

**A bad answer is a retry, not a short success.** A malformed assistant turn, an empty image batch, or structured output that does not conform to the schema all travel the retry path rather than returning truncated.

Every failure is logged, whether it is thrown or swallowed.

## Logging

The engine's observability is structured logging, not a collection you have to fetch: every retry decision, every stop and every non-fatal failure emits one record through [Apostrophe's standard logging](/reference/modules/log.md). There is no debug mode to switch on — the records are there in production, at `warn` and `error`, which the default filter keeps.

**One module to filter on.** Every record is emitted by `@apostrophecms/ai`, including the ones adapters raise (an adapter logs through `apos.ai.logError`). So one filter catches everything AI, whichever provider was involved.

**The envelope.** Records carry the standard Apostrophe log fields — `module`, `type`, `severity` and a message prefixed `@apostrophecms/ai: <type>:` — plus the request fields, because `req` is always passed: `url`, `path`, `method`, `ip`, `query` and `requestId`. That last one is Apostrophe's per-request id, so every record of one editor action correlates.

### The event types

| `type` | Severity | Emitted when |
|---|---|---|
| `retry` | `warn` | One transient provider failure, about to be retried. |
| `failure` | `error` | A call stopped — the error is being thrown to the caller. |
| `imagePartial` | `error` | An image batch delivered fewer images than requested: some of the parallel provider requests failed, but not all, so the call still succeeds with what arrived. |
| `notify` | `error` | A background job's progress event could not be delivered to the browser. |
| `hook` | `error` | A caller hook threw where its throw must not replace what is already happening — `onEnd`, or the end report of a tool call that is already failing. |

### The fields on `retry` and `failure`

These two share one data shape, so a rate limit, an overload, a timeout and a bad configuration are all tellable apart from a single record.

| Field | Meaning |
|---|---|
| `provider`, `model` | The resolved route the call was using. |
| `code` | The normalized apos error code: `aiRetry`, `aiRefusal`, `forbidden`, `invalid`, … |
| `status` | The provider's HTTP status, when there was one. |
| `kind` | `rateLimit`, `overload`, `timeout` or `network` — on transient failures. |
| `requestId` | The provider's own request id, when it issues one. This is what a support ticket with the provider needs. Distinct from the envelope's Apostrophe `requestId`. |
| `retryAfter` | Seconds the provider asked us to wait, when it said so. |
| `attempt` | Which attempt this was, counting from 1. |
| `elapsed` | Milliseconds since the first attempt of this call. |
| `action` | `'retry'` or `'stop'` — what the engine did about it. |
| `delay` | Milliseconds waited before the next attempt (`retry`), or the delay that would have overrun the budget (`failure`, budget stop). |
| `reason` | On `failure` only: `'attempts'` (the attempt cap was reached) or `'budget'` (the next delay would land past `retryMaxElapsed`). Absent means the code was simply not retryable — retrying was never on the table. |
| `stack` | On `failure` only: the stack of the original throw, which is the useful trace when an adapter wrapped a client error. |

`imagePartial` carries `provider`, `model`, `code`, `status`, `kind`, plus `requested` and `delivered`. `notify` carries `jobId`, `stage` and `stack`. `hook` carries `stack` plus `jobId` and `hook: 'onEnd'`, or the tool name.

### Reading them

| What you see | What it means |
|---|---|
| A run of `retry` with `kind: 'rateLimit'` | The provider is throttling you. `retryAfter` is what it asked for. |
| `failure` with `reason: 'attempts'` or `'budget'` | Transient failures outlasted the retry budget. Raising `retryAttempts` or `retryMaxElapsed` is the lever. |
| `failure` with no `reason`, `code: 'forbidden'` or `'invalid'` | Credentials or configuration. Retrying would never have helped, and the engine did not try. |
| `failure` with `code: 'aiRetry'` and a malformed message | The provider answered, but broke its contract. Usually an adapter or a model-behavior problem, not an outage. |

**The swallowed failures matter most.** `notify`, `hook` and `imagePartial` all record something that did *not* fail the run: a broken progress transport, a throwing hook and a partial image batch are all survivable by design. That is exactly why they are logged — without the record they would be invisible. If a user reports "the progress bar froze but the job finished", `notify` is the first thing to look at.

### Configuring

Standard [Apostrophe log filtering](/reference/modules/log.md#filter). The production default (`warn` and `error`) keeps every AI record, so usually there is nothing to do. To keep AI records while quieting everything else:

```javascript
'@apostrophecms/log': {
  options: {
    filter: {
      '*': { severity: [ 'error' ] },
      '@apostrophecms/ai': { events: [ 'retry', 'failure', 'imagePartial' ] }
    }
  }
}
```

The same through the environment, which overrides the option:

```bash
APOS_FILTER_LOGS='*:severity:error;@apostrophecms/ai:events:retry,failure'
```

::: warning For adapter authors
Everything an adapter puts on a normalized error's `data` — `status`, `kind`, `retryAfter`, `requestId` — is written verbatim into these records. Treat `error.data` as log-bound: **never put keys, credentials or personal data there.**
:::

## Mock mode and testing

`APOS_AI_MOCK=1` answers every AI call offline, through the real pipeline — routing, validation, the tool loop, retries and error normalization all still run. The environment variable is read once at startup.

```bash
APOS_AI_MOCK=1 npm run dev
```

- With providers configured, real routing still applies, so the configuration stays exercised.
- With no providers at all, placeholder routing stands in and `apos.ai.active` is still `true` — features work with no key anywhere.
- `apos.ai.mockMode` tells feature code it is in mock mode, for a UI that wants to label placeholder output as such.
- Chat calls return `[mock] <the last user text>`; a structured call returns a deterministic object conforming to its schema; image calls return placeholder pixels.

Script the mock for tests:

```javascript
'@apostrophecms/ai': {
  options: {
    // Return a full assistant turn, a { text } shorthand, or undefined to
    // fall through to the built-in default. req comes first, like every AI
    // surface, so a mock can answer per current user.
    mock(req, request) {
      if (request.messages.at(-1).content[0].text.includes('headline')) {
        return { text: 'Spring Gardening Made Simple' };
      }
    },
    mockImage(req, request) {
      return [ { type: 'png', data: myFixtureBase64 } ];
    }
  }
}
```

Two things this enables that are worth calling out:

- A scripted mock turn may request tools, and the loop then runs your **real handlers** — so tool code is fully testable offline.
- A mock that throws normalized codes exercises the real error paths, retries included, because errors pass through the mock's normalization untouched.




