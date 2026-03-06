# PRO-9191 Cross-Repo Follow-On Plan

## Goal

Align documentation across related repositories after the docs-site static build work, so Astro static-build behavior is consistently documented in:

1. `docs` (already implemented in this branch)
2. `apostrophe-astro`
3. Apostrophe core (`apostrophe`)

## Repositories and Deliverables

## 1) `apostrophe-astro` repository

### Primary deliverables

1. Update README/docs for static build mode:
   - `APOS_BUILD=static` behavior
   - `output: 'static'` integration expectations
   - `getAllStaticPaths` usage
2. Document helper APIs:
   - `buildPageUrl`
   - `getFilterBaseUrl`
   - `getAposHost`
   - `aposFetch`
3. Document integration static options and env precedence:
   - `staticBuild.attachments`
   - `staticBuild.attachmentSizes`
   - `staticBuild.attachmentSkipSizes`
   - `staticBuild.attachmentScope`
   - `APOS_HOST`, `APOS_PREFIX`, `APOS_EXTERNAL_FRONT_KEY`, `APOS_ATTACHMENT_*`
4. Add explicit static widget guidance:
   - browser `/api/v1/...` calls in static output
   - build-time/server-side data fetch pattern
5. Add non-root hosting guidance:
   - Astro `base` and Apostrophe `prefix` alignment

### Acceptance criteria

1. README/docs include at least one end-to-end static config example.
2. Helper API docs include signatures and minimal examples.
3. Env var override order is stated clearly.
4. Docs include at least one static build caveat section.

## 2) Apostrophe core (`apostrophe`) repository

### Primary deliverables

1. Add or expand docs for `@apostrophecms/url` static behavior:
   - `options.static`
   - effect on filter/pagination URL format
2. Document URL metadata extension points:
   - `getUrlMetadata(req, doc)`
   - `getUrlMetadataQuery(req)`
   - `@apostrophecms/url:getAllUrlMetadata` event
3. Document metadata entry contract:
   - document entries vs literal content entries
   - `contentType` semantics
   - relative prefix-free `url` requirement
4. Document sitemap exclusion behavior:
   - `sitemap: false`

### Acceptance criteria

1. Official core docs cover URL metadata APIs and event usage.
2. At least one literal-content example appears in core docs.
3. Static URL mode caveat is explicit (global URL behavior impact).

## 3) `docs` repository follow-up wiring

### Primary deliverables

1. Replace any temporary wording with links to newly published upstream docs.
2. Verify no stale links to unpublished upstream sections remain.
3. Add release-note-style changelog entry if your team process requires it.

### Acceptance criteria

1. All upstream links resolve.
2. `npm run docs:build` passes after link updates.

## Execution Order

1. Open `apostrophe-astro` PR with static-mode docs updates.
2. Open Apostrophe core PR for `@apostrophecms/url`/metadata docs.
3. After both merge, open small docs-site PR to refresh cross-links.

## Suggested PR Breakdown

1. PR A (`apostrophe-astro`): integration + helper + env + static caveats.
2. PR B (`apostrophe` core): URL module + metadata/event contract.
3. PR C (`docs`): upstream link sync and wording cleanup only.

## Risks and Mitigations

1. Risk: Terminology drift between repos.
   - Mitigation: Reuse one shared glossary block for `static`, `literal content`, `prefix`, `staticBaseUrl`.
2. Risk: API naming mismatches in examples.
   - Mitigation: Validate examples against current package exports before merge.
3. Risk: Non-root hosting confusion.
   - Mitigation: Include one canonical example in every repo using identical values.

## Hand-off Checklist

1. Confirm target default branches for all repos.
2. Confirm docs owners/reviewers for each repo.
3. Open three tracked tasks linked to `PRO-9191`.
4. Merge in sequence: PR A -> PR B -> PR C.
