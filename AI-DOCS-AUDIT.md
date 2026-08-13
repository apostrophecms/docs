# AI engine — documentation gap audit

Source: [ApostropheCMS AI - developer documentation draft](https://linear.app/apostrophecms/document/apostrophecms-ai-developer-documentation-draft-e2aaa7f07bad) (Linear, edited 12 Aug 2026), §1–§9.

Scope of this audit: everything in this repo that the AI engine and its related core changes make **wrong, incomplete, or newly discoverable**. Pro modules (SEO Assistant 2.x, Automatic Translation) are treated as out of scope per their own READMEs, except where a change of theirs lands on a core page.

Nothing below has been written yet. Files created in this pass are listed under [Done](#done-in-this-pass).

---

## Done in this pass

| File | Covers |
|---|---|
| `docs/reference/modules/ai.md` | §1–§4, §6, plus errors and logging |
| `docs/reference/modules/ai-adapter-anthropic.md` | §5.1, §5.4 |
| `docs/reference/modules/ai-adapter-openai.md` | §5.1, §5.2 |
| `docs/reference/modules/ai-adapter-openai-compatible.md` | §5.1–§5.3, §5.5 |
| `docs/reference/modules/ai-adapter-google.md` | §5.1 |

These are picked up by the sidebar automatically: `sidebarGuide.js` builds **Config & API Reference → Core Modules** from `getItemRefs([ '_template' ], '@apostrophecms/', 'reference', 'modules')`, which globs `reference/modules/*.md`. No sidebar edit is required.

---

## Priority 1 — undocumented core surface the AI engine depends on

These are the draft's §7 "related core changes." They are cited from the new AI pages, so until they exist those pages point at nothing. They are also useful entirely on their own, which is the argument for documenting them properly rather than as an AI footnote.

### 1.1 `apos.schema.extract` — no page exists

**New file: `docs/reference/modules/schema.md`.** There is no reference page for the schema module at all today. `apos.schema` is currently only mentioned in passing in `guide/custom-schema-field-types.md`, `cookbook/reusing-standard-fields.md` and `tutorials/reusing-standard-fields.md`.

Must cover (draft §7.1):

- The `extract(req, schema, doc, options)` signature and the flat item array it returns.
- The item shape: `path`, `schemaPath`, `type`, `label`, `tags`, `text`, `image`, `metaOnly`. Worth stating loudly that `path` anchors on the nearest `_id` (`@xyz.field`) rather than array indexes, so paths survive reordering.
- Options: `include`, `exclude` (wins over `include`), `extend`, `maxLength`, and the sub-walk trio `path` / `schemaPath` / `tags`.
- The `extractable` policy and its two levels: the field type is the gate (`extractable` defaults to `!!type.extract`; declaring it without an `extract` method fails the boot), and the field instance may narrow or extend but never force.
- Which types extract out of the box: `string` and everything extending it such as `slug`; the containers `array`, `object`, `area`; `password` is a hard `extractable: false`.
- Tag merging: `[ 'seo' ]` on a string field resolves to `[ 'text', 'seo' ]`; a subtype's tags union with its parent's.

**Risk if skipped:** this is the seam three separate features now share (AI context, SEO Assistant, translation). Leaving it undocumented pushes users to read Pro READMEs to understand a core API.

### 1.2 The job module — no page exists

**New file: `docs/reference/modules/job.md`.** `@apostrophecms/job` has no reference page. It is currently only taught inline in `guide/batch-operations.md`, which documents `runBatch` and nothing else.

Must cover (draft §7.2):

- Cooperative cancellation: `reporting.isCanceling()` inside `doTheWork(req, reporting, info)`; ending status `cancelled` with partial results preserved. The SIGTERM analogy is the right framing — a job that never checks simply runs to completion.
- The non-obvious bit: `isCanceling()` also returns `true` when the job document is **gone or already ended**, so an expired or externally deleted record winds down its own orphaned run.
- `self.requestCancel(jobId)` and `POST /api/v1/@apostrophecms/job/:_id/cancel`. The flag travels through the database, so it works across processes.
- New options: `expireAfter` (TTL counts from **creation, not completion** — a genuine footgun worth calling out), `userId` ownership restricting the status and cancel routes, `notifications: false`.
- `info.jobId` now passed to `doTheWork`; `job.error` recorded as `{ name, message, data? }`; `startedAt` / `endedAt` superseding the legacy `when`; `cancelled` joining `running` / `completed` / `failed`.

**Also update `guide/batch-operations.md`** to link the new page rather than remaining the de facto job documentation.

### 1.3 Notification bus carriers

**Edit `docs/reference/modules/notification.md`.** The page describes `apos.notify` as a way to "display notifications" and mentions that they "can also emit bus events." Draft §7.3 adds a mode where nothing is displayed at all.

Add a section covering:

- `bus: true` — the notification is never rendered; the browser emits its event on `apos.bus` in exactly one tab, then dismisses it.
- In that mode `event` is **required**, the `message` argument becomes optional, and the options object may be passed in its place. That signature change is the part most likely to trip people up.
- A cross-reference noting this is the transport behind `generateJob` progress events.

`guide/custom-ui.md` and `cookbook/creating-webhooks.md` also reference `apos.notify` and should link the new section rather than duplicate it.

---

## Priority 2 — existing pages made incomplete by the `extractable` policy

`extractable` is a new **universal field setting**, and this repo documents field settings per field type. This is the largest mechanical change set in the audit.

### 2.1 Field type pages

Add `extractable` to the **Optional** settings table of each page below, with a shared anchor section explaining values (`true`, `false`, or an array of tag strings) and the narrow-or-extend rule.

| File | Note |
|---|---|
| `reference/field-types/string.md` | The canonical case. Extracts by default, tagged `text`. |
| `reference/field-types/slug.md` | Extends `string`, so it inherits both the `extract` method and the tags. |
| `reference/field-types/array.md` | Container; recurses into its sub-schema. |
| `reference/field-types/object.md` | Container; recurses into its sub-schema. |
| `reference/field-types/area.md` | Container; recurses into widgets. Also the home of the per-area `widgets: { name: { extractable } }` form. |
| `reference/field-types/password.md` | Hard `extractable: false`. Worth stating explicitly so nobody tries to override it. |

Consider a single shared partial — the repo already uses that pattern for `_choices-setting.md` — rather than six divergent copies.

### 2.2 `reference/field-types/index.md`

The intro table lists every field type. If `extractable` becomes a cross-cutting setting, this page is the natural place for a short "settings common to extracting field types" note pointing at the schema module page.

### 2.3 `guide/custom-schema-field-types.md`

The guide walks through `self.apos.schema.addFieldType({ name, convert, … })`. Draft §7.1 adds two properties to that call: `extractable` and `extract(req, field, value, path)`. Without them, a custom field type built by following this guide is invisible to AI context and to translation — and, per §9.4, a custom type **extending `string` is now translated by default**, which is a behavior change a reader of this page would not expect.

### 2.4 `reference/modules/widget-type.md`

Two additions:

- **Options table:** `extractable` as a widget module option, and the note that per-area widget configuration only *adds* tags — to undo a widget module's opt-out you must override the module option. That asymmetry is the single most confusing rule in §7.1 and belongs in prose, not a table cell.
- **Featured methods:** `extract(req, widget, options)`. The default implementation walks the widget's own schema; overriding it lets a widget contribute content only it knows about. `options` carries the walk's `path` / `schemaPath` / `tags` context and **must travel to the recursive call unchanged**.

Mention that two core widgets already contribute directly: rich text emits its HTML as one text item, and the image widget emits the image URL ahead of a schema walk that still covers the caption.

### 2.5 `reference/module-api/module-options.md`

The "Options for widget modules" section enumerates widget module options (`className`, `contextual`, `icon`, `label`, …). Add `extractable` there for consistency with §2.4.

---

## Priority 3 — pages that should point at the new material

None of these are *wrong* today; they become incomplete once AI ships.

| File | Change |
|---|---|
| `reference/server-events.md` | The page enumerates core events module by module. Add an `@apostrophecms/ai` section: `beforeGenerate` / `afterGenerate`, `beforeGenerateImage` / `afterGenerateImage`, `beforeToolCall` / `afterToolCall`, with the shared-mutable-`context` payload and the caveat that a hard-stopping tool error means `afterToolCall` does not fire. |
| `reference/modules/log.md` | The `filter` section is the right place for a cross-reference to the AI event types (`retry`, `failure`, `imagePartial`, `notify`, `hook`) as a worked filtering example. |
| `guide/logging.md` | Same, from the guide side. AI is the first core subsystem whose primary observability story *is* structured logging, which makes it a strong example for this page. |
| `reference/glossary.md` | Add entries for the three terms the AI docs rely on and nothing else in Apostrophe defines: **engine**, **adapter**, **provider**. Arguably **effort level** and **tool** too. |
| `guide/technical-overview.md`, `guide/core-concepts.md` | A sentence placing `apos.ai` among the core subsystems, so readers discover it exists. Currently nothing outside `reference/modules/` would tell them. |
| `reference/index.md` | Check whether it hand-lists reference sections; if so, add the AI modules. |

---

## Priority 4 — localization, where a Pro change lands on a core page

`guide/localization/dynamic.md` is the only existing page that mentions `@apostrophecms-pro/automatic-translation`. Draft §9.3 deprecates the `translate: true` / `translate: false` flags in favor of `extractable`, and §9.4 lists behavior changes.

The flags do not currently appear anywhere in this repo's markdown (`grep` finds no `translate:` in any `.md`), so there is **nothing to correct** — but there is something to add, and the decision is yours:

- **Minimum:** a note in `guide/localization/dynamic.md` that field-level control of translation now runs through `extractable` and the `notranslate` tag, linking the schema module page.
- **The behavior change worth surfacing regardless of scope** (§9.4): fields opted out of translation are **now visible to other consumers**. Previously they were hidden everywhere as a side effect of the old coupling; a `notranslate` field can now appear as AI-generated SEO context. Anyone upgrading needs to know that `extractable: false` is the setting that restores the old behavior. This is a data-exposure change, not a cosmetic one.

---

## Open questions from the draft's own preamble

The draft flags three decisions before publishing. Two are resolved in this pass; one is not.

1. **Model tables go stale.** *Resolved.* Each adapter page carries an info callout stating the table is what this version declares, not a contract, and pointing at `apos.ai.modelCatalog()` for the live answer.
2. **Streaming is not shipped.** *Resolved.* Adapters declare a `stream` capability but there is no streaming method, so the new pages omit `stream` from the capabilities tables entirely rather than implying it works. Revisit when a streaming method lands.
3. **Option tables drift.** *Open.* The option tables in these pages are transcribed by hand from the draft. Generating them from the JSDoc on the module's public surface would keep them honest. Worth raising as a separate issue against the docs tooling — it would apply to every module reference page, not just AI.

## Items I could not verify

- **Adapter module options beyond `timeout`.** The draft gives a full option list only for `ai-adapter-anthropic` (`timeout`, `version`, `thinkingBudgets`, `adaptiveModels`). The `openai`, `openai-compatible` and `google` pages document `timeout` alone. If those adapters carry dialect-specific options, their pages are currently incomplete.
- **`apos.ai.logError` signature.** Referenced in the draft as the way adapters log through the engine, but its arguments are never given. The AI page lists it as `logError(req, type, message, data)` by analogy with other Apostrophe logging methods — please confirm against the source.
- **`apos.permission.can`.** Has no reference page anywhere in this repo, so `apos.ai.can` links to `guide/permissions-and-workflow.md` instead. A gap that predates AI, but AI makes it more visible.
