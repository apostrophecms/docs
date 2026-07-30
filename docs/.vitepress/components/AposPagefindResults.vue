<template>
  <ul
    ref="resultsEl"
    :id="results.length ? 'localsearch-list' : undefined"
    :role="results.length ? 'listbox' : undefined"
    :aria-labelledby="results.length ? 'localsearch-label' : undefined"
    class="results"
    @mousemove="disableMouseOver = false"
  >
    <li
      v-for="(p, index) in results"
      :key="p.url"
      role="option"
      :aria-selected="selectedIndex === index ? 'true' : 'false'"
    >
      <a
        :href="p.url"
        class="result"
        :class="{ selected: selectedIndex === index }"
        :aria-label="p.title"
        @mouseenter="!disableMouseOver && (selectedIndex = index)"
        @focusin="selectedIndex = index"
        @click="onResultClick($event, p)"
      >
        <div>
          <div class="titles">
            <span class="title-icon">#</span>
            <span class="title main">
              <span class="text" v-html="p.title" />
            </span>
          </div>

          <div v-if="showDetailedList" class="excerpt-wrapper">
            <div v-if="p.excerpt" class="excerpt" inert>
              <div class="vp-doc" v-html="p.excerpt" />
            </div>
            <div class="excerpt-gradient-bottom" />
            <div class="excerpt-gradient-top" />
          </div>
        </div>
      </a>
    </li>
    <li
      v-if="filterText && !loading && !results.length && localEnableNoResults"
      class="no-results"
    >
      No results for "<strong>{{ filterText }}</strong>"
    </li>
    <li v-if="unavailable" class="no-results">
      Search is unavailable right now.
    </li>
  </ul>
</template>

<script setup>
/**
 * Renders search results sourced from a Pagefind index (docs.apostrophecms.com/pagefind),
 * built by `npm run build:search-index` after `vitepress build` (see package.json and
 * docs/.vitepress/README-pagefind.md for the full pipeline).
 *
 * This mirrors the pattern used on the marketing site (see
 * frontend/src/components/navigation/navigationClient.js -> loadPagefind/runPagefindSearch
 * in the apostrophecms-website-next repo): the pagefind.js runtime is fetched dynamically
 * at query time (it does not exist in the source tree, only in the built dist/), and results
 * are rendered with our own markup rather than Pagefind's bundled UI, so both sites present a
 * consistent, hand-styled results list.
 *
 * Pagefind's build-time excerpt generation already includes <mark> highlighting around
 * matched terms, so unlike the previous MiniSearch-based implementation this component does
 * not need to fetch each matched page's compiled component or run Mark.js client-side.
 */
import { ref, shallowRef, watch, nextTick } from 'vue'
import { useRouter, withBase } from 'vitepress'
import { debouncedWatch, onKeyStroke } from '@vueuse/core'

const MIN_SEARCH_QUERY_LENGTH = 2
const SEARCH_DEBOUNCE_MS = 200
const MAX_RESULTS = 16

const props = defineProps({
  filterText: String,
  enableNoResults: Boolean,
  showDetailedList: Boolean
})
const emit = defineEmits(['close', 'update:resultsLength'])

const localEnableNoResults = ref(props.enableNoResults)
const results = ref([])
const resultsEl = shallowRef()
const loading = ref(false)
const unavailable = ref(false)

let pagefindApi = null
let pagefindLoadFailed = false
let searchRequestId = 0

// Caches the in-flight load, not just the finished result: without this, two searches fired
// close together (e.g. two debounced keystrokes before the first import+probe resolves) would
// both see `pagefindApi` still unset and race into duplicate import()/mergeIndex() work —
// harmless but noisy (duplicate network requests and duplicate console messages).
let pagefindLoadPromise = null

function loadPagefind() {
  if (pagefindApi || pagefindLoadFailed) return Promise.resolve(pagefindApi)
  if (pagefindLoadPromise) return pagefindLoadPromise
  pagefindLoadPromise = loadPagefindOnce().finally(() => {
    pagefindLoadPromise = null
  })
  return pagefindLoadPromise
}

async function loadPagefindOnce() {
  try {
    // Built by `npm run build:search-index` (scripts/build-search-index.mjs) into
    // dist/pagefind/, which is served at `withBase('/pagefind/pagefind.js')` (i.e.
    // /docs/pagefind/pagefind.js in prod, since `base: '/docs/'`). It does not exist until
    // after a full build + index step, so this import will fail (and search will report
    // itself unavailable) in `vitepress dev` and in any build where
    // `npm run build:search-index` hasn't run yet.
    const pagefindEntryUrl = withBase('/pagefind/pagefind.js')
    const api = await import(/* @vite-ignore */ pagefindEntryUrl)

    // Intentionally docs-only: unlike the marketing site (which merges this site's index in via
    // `mergeIndex()` — see navigationClient.js), docs search does not merge in the marketing
    // site's index. Per product decision, docs search should only ever return docs results;
    // marketing search should return both. See SEARCH.md (repo root) for the full write-up.
    pagefindApi = api
    return pagefindApi
  } catch (error) {
    console.error('Failed to load Pagefind index:', error)
    pagefindLoadFailed = true
    return null
  }
}

async function runSearch(query) {
  const requestId = ++searchRequestId
  loading.value = true
  unavailable.value = false

  const pf = await loadPagefind()
  if (requestId !== searchRequestId) return

  if (!pf) {
    results.value = []
    localEnableNoResults.value = false
    unavailable.value = true
    loading.value = false
    emit('update:resultsLength', 0)
    return
  }

  let searchResult
  try {
    searchResult = await pf.search(query)
  } catch (error) {
    console.error('Pagefind search failed:', error)
    if (requestId !== searchRequestId) return
    results.value = []
    unavailable.value = true
    loading.value = false
    emit('update:resultsLength', 0)
    return
  }
  if (requestId !== searchRequestId) return

  const topResults = (searchResult && searchResult.results) || []
  const dataResults = await Promise.all(
    topResults.slice(0, MAX_RESULTS).map((r) => r.data())
  )
  if (requestId !== searchRequestId) return

  results.value = dataResults.map((r) => ({
    url: r.url,
    title: r.meta?.title || r.url,
    excerpt: r.excerpt
  }))
  localEnableNoResults.value = !results.value.length
  loading.value = false
  emit('update:resultsLength', results.value.length)

  await nextTick()
  resultsEl.value?.firstElementChild?.scrollIntoView({ block: 'start' })
}

debouncedWatch(
  () => props.filterText,
  (filterTextValue) => {
    const query = filterTextValue?.trim() || ''

    if (query.length < MIN_SEARCH_QUERY_LENGTH) {
      searchRequestId += 1
      results.value = []
      localEnableNoResults.value = false
      unavailable.value = false
      loading.value = false
      emit('update:resultsLength', 0)
      return
    }

    runSearch(query)
  },
  { debounce: SEARCH_DEBOUNCE_MS, immediate: true }
)

const selectedIndex = ref(-1)
const disableMouseOver = ref(false)

watch(results, (r) => {
  selectedIndex.value = r.length ? 0 : -1
  scrollToSelectedResult()
})

function scrollToSelectedResult() {
  nextTick(() => {
    const selectedEl = document.querySelector('.result.selected')
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' })
      if (disableMouseOver.value) {
        selectedEl.focus()
      }
    }
  })
}

onKeyStroke('ArrowUp', (event) => {
  event.preventDefault()
  selectedIndex.value--
  if (selectedIndex.value < 0) {
    selectedIndex.value = results.value.length - 1
  }
  disableMouseOver.value = true
  scrollToSelectedResult()
})

onKeyStroke('ArrowDown', (event) => {
  event.preventDefault()
  selectedIndex.value++
  if (selectedIndex.value >= results.value.length) {
    selectedIndex.value = 0
  }
  disableMouseOver.value = true
  scrollToSelectedResult()
})

const router = useRouter()

function onResultClick(event, result) {
  event.preventDefault()
  router.go(result.url)
  emit('close')
}

onKeyStroke('Enter', (e) => {
  if (e.isComposing) return

  const target = e.target
  if (target.tagName === 'BUTTON' && target.type !== 'submit') {
    return
  }

  const selectedResult = results.value[selectedIndex.value]
  if (target.tagName === 'INPUT' && !selectedResult) {
    e.preventDefault()
    return
  }

  if (selectedResult) {
    router.go(selectedResult.url)
    emit('close')
  }
})

onKeyStroke('Escape', () => {
  emit('close')
})
</script>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 20px 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.result {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 4px;
  transition: none;
  line-height: 1rem;
  border: solid 2px var(--vp-local-search-result-border);
  outline: none;
}

.result > div {
  margin: 12px;
  width: 100%;
  overflow: hidden;
}

@media (max-width: 767px) {
  .result > div {
    margin: 8px;
  }
}

.titles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  position: relative;
  z-index: 1001;
  padding: 2px 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 4px;
}

.title.main {
  font-weight: 500;
}

.title-icon {
  opacity: 0.5;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

.result.selected {
  --vp-local-search-result-bg: var(--vp-local-search-result-selected-bg);
  border-color: var(--vp-local-search-result-selected-border);
}

.excerpt-wrapper {
  position: relative;
}

.excerpt {
  opacity: 75%;
  pointer-events: none;
  max-height: 140px;
  overflow: hidden;
  position: relative;
  opacity: 0.5;
  margin-top: 4px;
}

.result.selected .excerpt {
  opacity: 1;
}

.excerpt :deep(*) {
  font-size: 0.8rem !important;
  line-height: 130% !important;
}

.titles :deep(mark),
.excerpt :deep(mark) {
  background-color: var(--vp-local-search-highlight-bg);
  color: var(--vp-local-search-highlight-text);
  border-radius: 2px;
  padding: 0 2px;
}

.excerpt-gradient-bottom {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 8px;
  background: linear-gradient(transparent, var(--vp-local-search-result-bg));
  z-index: 1000;
}

.excerpt-gradient-top {
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  height: 8px;
  background: linear-gradient(var(--vp-local-search-result-bg), transparent);
  z-index: 1000;
}

.result.selected .titles,
.result.selected .title-icon {
  color: var(--vp-c-brand-1) !important;
}

.no-results {
  font-size: 0.9rem;
  text-align: center;
  padding: 12px;
}

svg {
  flex: none;
}
</style>
