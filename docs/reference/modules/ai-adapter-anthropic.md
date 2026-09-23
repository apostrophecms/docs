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
import apostrophe from 'apostrophe';

apostrophe({
  root: import.meta,
  shortName: 'example-site',
  modules: {
    // 👇 The engine, with one provider entry naming this adapter
    '@apostrophecms/ai': {
      options: {
        providers: {
          anthropic: {}
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

The entry's own key doubles as the adapter name, which is why `anthropic: {}` resolves to this adapter. See [`providers`](/reference/modules/ai.md#providers) for the full entry shape.

| | |
|---|---|
| **Adapter name** | `anthropic` |
| **Label** | Anthropic (Claude) |
| **Default env key** | `APOS_ANTHROPIC_KEY` |
| **Capabilities** | `text`, `tools`, `structured`, `imageInput`, `caching` |

Image generation is not among them, so an [`image` route](/reference/modules/ai.md#image) must name a different provider.

## Adapter settings

Beyond the standard entry keys, this adapter declares one **setting** — an extra provider-entry key carrying a service fact only the Anthropic dialect knows.

| Setting | Env variable | What it is |
|---|---|---|
| `workspaceId` | `APOS_ANTHROPIC_WORKSPACE_ID` | The workspace requests act in, sent as the `anthropic-workspace-id` header. |

**When you need it.** An identity-linked API key that is *not* scoped to a single workspace must say which workspace it is acting in on every request, or the API answers `400 … anthropic-workspace-id is required`. A workspace-scoped key never needs it and ignores it.

```javascript
providers: {
  anthropic: {
    workspaceId: 'wrkspc_01...' // or export APOS_ANTHROPIC_WORKSPACE_ID
  }
}
```

Settings follow the same rules as the key: the environment variable wins over the configured value, and the value must be a string. An entry key that is neither standard nor declared fails the boot and is named in the message — so `workspaceID` is caught as the typo it is rather than being silently ignored until the provider rejects the request.

::: warning
Unlike the key, a setting's variable name cannot be renamed with `envKey`. To read the value from a variable of your own, either assign it in the configuration (`workspaceId: process.env.MY_CLAUDE_WORKSPACE`, which only works when `APOS_ANTHROPIC_WORKSPACE_ID` is absent) or rename the declared variable by extending [`adapter()`](#renaming-the-declared-variable). Both routes are compared in [A setting with your own environment variable](/reference/modules/ai.md#a-setting-with-your-own-environment-variable).
:::

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

The value sent in the `anthropic-version` header — Anthropic's own dated API contract, not a model version and not an Apostrophe version. It is required on every request, and `2023-06-01` is the current one. See [Anthropic's versioning documentation](https://docs.claude.com/en/api/versioning) for the available values and their deprecation status.

**Its main use is pinning.** If a future Apostrophe release ships a newer default, this option lets a project stay on the contract it was built and tested against until it is ready to move — so which API version you send stays a deployment decision rather than a side effect of upgrading the CMS.

::: warning
The version fixes the request and response *shape* this adapter translates to and from, and [`buildBody` and `parseResponse`](#adjusting-the-adapter) are written against the shipped default's contract. Setting a version whose contract differs may mean overriding those seams too — in either direction, whether you are pinning back or moving ahead.
:::

### `thinkingBudgets`

Maps a `reasoning` level onto an absolute thinking token budget, for the models that take one. Raise a level's budget when a task needs more deliberation than the default allows; the cost of a call rises with it. Anthropic's floor for a budget is 1024.

::: warning
`maxTokens` must **exceed** the budget — the thinking has to leave room for the answer. A call that violates this throws `invalid` before reaching the provider.
:::

### `adaptiveModels`

A list of model names, nothing more:

```javascript
adaptiveModels: [ 'claude-opus-5', 'claude-sonnet-5' ]
```

Claude models fall into two groups when you ask them to think harder.

- **Newer models manage their own thinking.** You say how much effort you want — `low`, `medium`, `high`, `xhigh` or `max` — and the model decides how deeply to go. Anthropic calls these *adaptive*.
- **Older models need a number.** You have to tell them how many tokens they may spend thinking, which is what [`thinkingBudgets`](#thinkingbudgets) supplies.

Ask for the wrong one and Anthropic rejects the request, so the adapter has to know which group a model belongs to before it can send anything. This list is how it knows. Names in it are treated as the first group; everything else as the second.

#### When you would change it

Only when you configure a model that the shipped list has never heard of. The default covers the models Apostrophe ships with, so most projects never touch this.

Say Anthropic releases Opus 6 and you want to use it before Apostrophe ships support. That takes two edits in two different places, and both are needed:

1. Describe the model and route to it, on the **provider entry**.
2. Add its name to this list, on the **adapter module**.

<AposCodeBlock>

```javascript
import apostrophe from 'apostrophe';

apostrophe({
  root: import.meta,
  shortName: 'example-site',
  modules: {
    // 1. Describe the model, and send the `high` level to it
    '@apostrophecms/ai': {
      options: {
        providers: {
          anthropic: {
            models: {
              'claude-opus-6': {
                label: 'Opus 6',
                contextWindow: 1000000,
                maxOutputTokens: 64000
              }
            },
            effort: {
              high: { model: 'claude-opus-6', reasoning: 'xhigh' }
            }
          }
        }
      }
    },
    // 2. Say that it manages its own thinking. Keep the models that
    //    were already in the list — see the warning below
    '@apostrophecms/ai-adapter-anthropic': {
      options: {
        adaptiveModels: [ 'claude-opus-5', 'claude-sonnet-5', 'claude-opus-6' ]
      }
    }
  }
});
```
  <template v-slot:caption>
    app.js
  </template>
</AposCodeBlock>

Do only the first step and every call to Opus 6 is refused, because the adapter would be giving a token budget to a model that does not take one.

::: warning
This list replaces the shipped one — it does not add to it. Writing `adaptiveModels: [ 'claude-opus-6' ]` on its own would quietly break Opus 5 and Sonnet 5, which are no longer in the list. Always include the names that were already there.
:::

::: info
Listing `reasoning` values in a model's [metadata](#models-and-effort) does *not* put it in this group. That metadata only labels pickers in the UI. This list is the setting that changes how the model is called.
:::

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

Declared model metadata:

| Model | Label | Context window | `maxOutputTokens` | `reasoning` accepts |
|---|---|---|---|---|
| `claude-haiku-4-5` | Haiku 4.5 | 200,000 | 32,000 | `low`, `medium`, `high` — the [`thinkingBudgets`](#thinkingbudgets) keys |
| `claude-sonnet-5` | Sonnet 5 | 1,000,000 | 64,000 | `low`, `medium`, `high`, `xhigh`, `max` — effort levels |
| `claude-opus-5` | Opus 5 | 1,000,000 | 64,000 | `low`, `medium`, `high`, `xhigh`, `max` — effort levels |

::: info
`maxOutputTokens` here is the **default cap a call inherits**, not the model's ceiling. It is set where one response comfortably completes inside the adapter's `timeout`, since this adapter posts and waits for a whole answer. The published ceilings are higher — 128k for the Claude 5 models, 64k for Haiku 4.5 — so raise a call's `maxTokens` explicitly when you need a long answer, and raise `timeout` with it.
:::

The `reasoning` column tracks [`adaptiveModels`](#adaptivemodels): the two adaptive models take effort levels, the rest take budget names. Both are read back by [`apos.ai.modelCatalog()`](/reference/modules/ai.md#modelcatalog) for building pickers, and neither is enforced by the engine — the provider still rejects what it rejects.

To use a model newer than your Apostrophe version, describe it on the provider entry and point an effort row at it:

```javascript
providers: {
  anthropic: {
    models: {
      'claude-opus-6': {
        label: 'Opus 6',
        contextWindow: 1000000,
        maxOutputTokens: 64000,
        reasoning: [ 'low', 'medium', 'high', 'xhigh', 'max' ]
      }
    },
    effort: {
      high: { model: 'claude-opus-6', reasoning: 'high' }
    }
  }
}
```

::: warning
If the new model is an adaptive one, this is only half the job — it must also be added to [`adaptiveModels`](#adaptivemodels), or the adapter sends it a token budget and the provider refuses every call. The `reasoning` values above are metadata for pickers; they do not affect what is sent.
:::

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
        body.metadata = { user_id: 'example-site' };
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

### Renaming the declared variable

The adapter definition itself is built by the module's `adapter()` method, which is an ordinary override seam too. Extending it renames a setting's environment variable for real — the adapter then reads yours and never looks at its default:

<AposCodeBlock>

```javascript
export default {
  extendMethods(self) {
    return {
      adapter(_super) {
        const definition = _super();
        definition.settings.workspaceId.envKey = 'MY_CLAUDE_WORKSPACE';
        return definition;
      }
    };
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/ai-adapter-anthropic/index.js
  </template>
</AposCodeBlock>

Prefer this over assigning `process.env.MY_CLAUDE_WORKSPACE` in the provider entry when `APOS_ANTHROPIC_WORKSPACE_ID` might legitimately exist in your environment for something else, or when you cannot guarantee its absence — the declared variable always wins over a configured value.
