# Spec: `code-block-widget`

**Repo:** `apostrophecms-website-next`  
**Module name:** `code-block-widget`  
**Purpose:** Replace the VitePress `AposCodeBlock.vue` component with a native ApostropheCMS widget that supports CJS/ESM toggling, syntax highlighting, copy-to-clipboard, and an optional filename caption. Output is rendered by an Astro frontend.

---

## Background

The current docs site uses a custom Vue component (`AposCodeBlock.vue`) in VitePress that wraps code fences and provides:
- A CJS/ESM toggle that syncs across all blocks on the page via an event bus
- A language label and optional filename caption in a custom header
- A copy-to-clipboard button

The new site is headless ApostropheCMS with an Astro frontend. Code blocks will be widgets rather than inline rich text content.

---

## Back end — ApostropheCMS widget module

### File structure

```
modules/
  code-block-widget/
    index.js
```

No template is needed — this is a headless setup and the data is delivered via the REST API.

### `index.js`

```js
export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Code Block'
  },
  fields: {
    add: {
      language: {
        type: 'select',
        label: 'Language',
        def: 'javascript',
        choices: [
          { label: 'JavaScript', value: 'javascript' },
          { label: 'TypeScript', value: 'typescript' },
          { label: 'Vue', value: 'vue' },
          { label: 'Nunjucks', value: 'njk' },
          { label: 'Astro', value: 'astro' },
          { label: 'HTML', value: 'html' },
          { label: 'CSS', value: 'css' },
          { label: 'JSON', value: 'json' },
          { label: 'Bash', value: 'bash' },
          { label: 'Text', value: 'text' }
        ]
      },
      caption: {
        type: 'string',
        label: 'Filename / Caption',
        help: 'Optional. Shown in the code block header (e.g. "app.js").'
      },
      esmCode: {
        type: 'string',
        label: 'Code (ESM)',
        textarea: true,
        help: 'ES Modules version of the code. If both ESM and CJS are provided, a toggle appears.'
      },
      cjsCode: {
        type: 'string',
        label: 'Code (CJS)',
        textarea: true,
        help: 'CommonJS version. Leave blank for a single-format block (no toggle shown).'
      }
    },
    group: {
      main: {
        label: 'Content',
        fields: [ 'language', 'caption', 'esmCode', 'cjsCode' ]
      }
    }
  }
};
```

### Notes

- `esmCode` is the primary field. If `cjsCode` is empty, no toggle is shown — the block renders as a standard single-format code block.
- Language choices cover all languages used in the docs: JS, TS, Vue, Nunjucks, Astro, HTML, CSS, JSON, Bash, and plain text.
- No server-side syntax highlighting is needed — Shiki runs in Astro at build/request time.
- `njk` is not a built-in Shiki language ID. Use `'jinja-xml'` as the Shiki lang value while keeping `'njk'` as the stored field value and the display label. Map field value → Shiki lang in the Astro component (see below).

### Registration

Add to `app.js` (or equivalent module registration):

```js
modules: {
  'code-block-widget': {},
  // ...
}
```

Add `code-block-widget` to any area that should support it:

```js
main: {
  type: 'area',
  options: {
    widgets: {
      '@apostrophecms/rich-text': {},
      'code-block-widget': {},
      // ...
    }
  }
}
```

---

## Front end — Astro component

### File structure

```
src/
  components/
    CodeBlock.astro
  scripts/
    codeBlockPreference.js   ← shared client-side module
```

### `CodeBlock.astro`

Receives a widget object from the API and pre-renders syntax-highlighted HTML using Shiki at build time. The toggle and copy button are handled by a small inline script.

```astro
---
import { codeToHtml } from 'shiki';

const { widget } = Astro.props;
const { language, caption, esmCode, cjsCode } = widget;

const hasBoth = Boolean(esmCode && cjsCode);
const theme = 'dracula-at-night';

// Map stored field values to Shiki language IDs where they differ
const SHIKI_LANG = { njk: 'jinja-xml', text: 'plaintext' };
const shikiLang = SHIKI_LANG[language] ?? language;

const esmHtml = esmCode
  ? await codeToHtml(esmCode, { lang: shikiLang, theme })
  : null;

const cjsHtml = cjsCode
  ? await codeToHtml(cjsCode, { lang: shikiLang, theme })
  : null;
---

<div class="code-block" data-has-both={hasBoth ? 'true' : 'false'}>
  <div class="code-block__header">
    <span class="code-block__lang">{language}</span>
    {caption && <span class="code-block__caption">{caption}</span>}
    <div class="code-block__controls">
      {hasBoth && (
        <div class="code-block__toggles">
          <button class="code-block__toggle" data-format="esm">ESM</button>
          <button class="code-block__toggle" data-format="cjs">CJS</button>
        </div>
      )}
      <button class="code-block__copy" aria-label="Copy code">
        <!-- copy icon SVG here -->
      </button>
    </div>
  </div>

  {esmHtml && (
    <div class="code-block__body" data-format="esm" set:html={esmHtml} />
  )}
  {cjsHtml && (
    <div class="code-block__body" data-format="cjs" set:html={cjsHtml} />
  )}
</div>

<script>
  import { initCodeBlock } from '../scripts/codeBlockPreference.js';
  document.querySelectorAll('.code-block').forEach(initCodeBlock);
</script>
```

### `codeBlockPreference.js`

Handles the global CJS/ESM preference via `localStorage`, synced across all blocks on the page (and across navigations).

```js
const STORAGE_KEY = 'codeModulePreference';
const DEFAULT = 'esm';

function getPreference() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT;
}

function setPreference(format) {
  localStorage.setItem(STORAGE_KEY, format);
  // Notify other blocks on the same page
  window.dispatchEvent(
    new StorageEvent('storage', { key: STORAGE_KEY, newValue: format })
  );
}

export function initCodeBlock(block) {
  const hasBoth = block.dataset.hasBoth === 'true';

  function applyFormat(format) {
    block.querySelectorAll('.code-block__body').forEach(body => {
      body.hidden = body.dataset.format !== format;
    });
    block.querySelectorAll('.code-block__toggle').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.format === format);
    });
  }

  if (hasBoth) {
    applyFormat(getPreference());

    block.querySelectorAll('.code-block__toggle').forEach(btn => {
      btn.addEventListener('click', () => setPreference(btn.dataset.format));
    });

    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) applyFormat(e.newValue);
    });
  }

  // Copy button
  const copyBtn = block.querySelector('.code-block__copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const visibleBody = block.querySelector('.code-block__body:not([hidden])') 
        || block.querySelector('.code-block__body');
      const text = visibleBody?.querySelector('pre')?.textContent || '';
      await navigator.clipboard.writeText(text);
      copyBtn.classList.add('copied');
      setTimeout(() => copyBtn.classList.remove('copied'), 2000);
    });
  }
}
```

### Usage in a page component

When mapping area content from the ApostropheCMS API, route `code-block-widget` types to the `CodeBlock` component:

```astro
---
import CodeBlock from '../components/CodeBlock.astro';

// widget comes from iterating area.items
---

{area.items.map(widget => {
  if (widget.type === 'code-block-widget') {
    return <CodeBlock widget={widget} />;
  }
  // ... other widget types
})}
```

---

## Migration from existing markdown

The current docs use `<AposCodeBlock>` with slotted content in `.md` files. A migration script would need to:

1. Parse each `.md` file for `<AposCodeBlock>` usage
2. Extract the CJS slot (`<template #cjs>`) and ESM slot (default slot or `<template #esm>`) content
3. Strip fenced code block wrappers to get raw code strings
4. `POST` to the ApostropheCMS REST API to create documents with `code-block-widget` items in the appropriate area

This is a one-time batch operation. Scope depends on how many docs pages use `AposCodeBlock` — worth auditing before starting.

---

## Resolved decisions

| Topic | Decision |
|---|---|
| Shiki theme | `dracula-at-night` |
| Languages | JS, TS, Vue, Nunjucks (`jinja-xml` in Shiki), Astro, HTML, CSS, JSON, Bash, Text |
| Astro rendering | SSR when editing/previewing; static build for public output. Shiki works identically in both — no conditional logic needed. |

## Open questions

- **Area placement:** Confirm which page types and areas should allow `code-block-widget`. Documentation pages likely need it; blog/marketing pages may not.
- **Nunjucks highlighting:** `jinja-xml` is the closest Shiki grammar for Nunjucks. Verify the output is acceptable — if not, a custom TextMate grammar can be registered via `shiki.loadLanguage()`.
