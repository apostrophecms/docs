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
      :key="p.id"
      role="option"
      :aria-selected="selectedIndex === index ? 'true' : 'false'"
    >
      <a
        :href="p.id"
        class="result"
        :class="{ selected: selectedIndex === index }"
        :aria-label="[...p.titles, p.title].join(' > ')"
        @mouseenter="!disableMouseOver && (selectedIndex = index)"
        @focusin="selectedIndex = index"
        @click="$emit('close')"
      >
        <div>
          <div class="titles">
            <span class="title-icon">#</span>
            <span
              v-for="(t, tIndex) in p.titles"
              :key="tIndex"
              class="title"
            >
              <span class="text" v-html="t" />
              <span class="local-search-icon">➔</span>
            </span>
            <span class="title main">
              <span class="text" v-html="p.title" />
            </span>
          </div>

          <div v-if="showDetailedList" class="excerpt-wrapper">
            <div v-if="p.text" class="excerpt" inert>
              <div class="vp-doc" v-html="p.text" />
            </div>
            <div class="excerpt-gradient-bottom" />
            <div class="excerpt-gradient-top" />
          </div>
        </div>
      </a>
    </li>
    <li
      v-if="filterText && !results.length && localEnableNoResults"
      class="no-results"
    >
      No results for "<strong>{{ filterText }}</strong>"
    </li>
  </ul>
</template>

<script setup>
import { ref, watch, shallowRef, nextTick,  markRaw, createApp } from 'vue'
import MiniSearch from 'minisearch'
import localSearchIndex from '@localSearchIndex'
import { LRUCache } from 'vitepress/dist/client/theme-default/support/lru'
import Mark from 'mark.js/src/vanilla.js'
import { useRouter, useData, dataSymbol } from 'vitepress'
import { debouncedWatch, onKeyStroke, computedAsync } from '@vueuse/core'
import { pathToFile } from 'vitepress/dist/client/app/utils'
import { escapeRegExp } from 'vitepress/dist/client/shared'

const props = defineProps({
  filterText: String,
  enableNoResults: Boolean,
  showDetailedList: Boolean
})
const emit = defineEmits(['close', 'update:resultsLength'])

const localEnableNoResults = ref(props.enableNoResults)

const results = ref([])
const resultsEl = shallowRef()

const searchIndexData = shallowRef(localSearchIndex)

if (import.meta.hot) {
  import.meta.hot.accept('/@localSearchIndex', (m) => {
    if (m) {
      searchIndexData.value = m.default
    }
  })
}

const vitePressData = useData()

const { localeIndex, theme } = vitePressData
const searchIndex = computedAsync(async () => {
  try {
    return markRaw(
      MiniSearch.loadJSON(
        (await searchIndexData.value[localeIndex.value]?.())?.default,
        {
          fields: ['title', 'titles', 'text'],
          storeFields: ['title', 'titles'],
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            boost: { title: 4, text: 2, titles: 1 },
            ...(theme.value.search?.provider === 'local' &&
              theme.value.search.options?.miniSearch?.searchOptions)
          },
          ...(theme.value.search?.provider === 'local' &&
            theme.value.search.options?.miniSearch?.options)
        }
      )
    )
  } catch (error) {
    console.error('Failed to load search index:', error)
    return null
  }
})

watch(
  () => props.filterText,
  (newFilter) => {
    if (searchIndex.value && newFilter !== undefined) {
      if (newFilter) {
        results.value = searchIndex.value.search(newFilter)
      } else {
        results.value = []
      }
      emit('update:resultsLength', results.value.length)
      localEnableNoResults.value = !results.value.length
    }
  }
)

const mark = computedAsync(async () => {
  if (!resultsEl.value) return
  return markRaw(new Mark(resultsEl.value))
}, null)

const cache = new LRUCache(16)

debouncedWatch(
  () => [searchIndex.value, props.filterText, props.showDetailedList],
  async ([index, filterTextValue, showDetailedListValue], old, onCleanup) => {
    if (old && old[0] !== index) {
      // in case of hmr
      cache.clear()
    }

    let canceled = false
    onCleanup(() => {
      canceled = true
    })

    if (!index) return

    // Search
    results.value = index
      .search(filterTextValue)
      .slice(0, 16)
    localEnableNoResults.value = !results.value.length

    // Highlighting
    const mods = showDetailedListValue
      ? await Promise.all(results.value.map((r) => fetchExcerpt(r.id)))
      : []
    if (canceled) return
    for (const { id, mod } of mods) {
      const mapId = id.slice(0, id.indexOf('#'))
      let map = cache.get(mapId)
      if (map) continue
      map = new Map()
      cache.set(mapId, map)
      const comp = mod.default ?? mod
      if (comp && (comp.render || comp.setup)) {
        const app = createApp(comp)
        // Silence warnings about missing components
        app.config.warnHandler = () => {}
        app.provide(dataSymbol, vitePressData)
        Object.defineProperties(app.config.globalProperties, {
          $frontmatter: {
            get() {
              return vitePressData.frontmatter.value
            }
          },
          $params: {
            get() {
              return vitePressData.page.value.params
            }
          }
        })
        const div = document.createElement('div')
        app.mount(div)
        const headings = div.querySelectorAll('h1, h2, h3, h4, h5, h6')
        headings.forEach((el) => {
          const href = el.querySelector('a')?.getAttribute('href')
          const anchor = href?.startsWith('#') && href.slice(1)
          if (!anchor) return
          let html = ''
          let nextEl = el.nextElementSibling
          while (nextEl && !/^h[1-6]$/i.test(nextEl.tagName)) {
            html += nextEl.outerHTML
            nextEl = nextEl.nextElementSibling
          }
          map.set(anchor, html)
        })
        app.unmount()
      }
      if (canceled) return
    }

    const terms = new Set()

    results.value = results.value.map((r) => {
      const [id, anchor] = r.id.split('#')
      const map = cache.get(id)
      const text = map?.get(anchor) ?? ''
      for (const term in r.match) {
        terms.add(term)
      }
      return { ...r, text }
    })

    await nextTick()
    if (canceled) return

    await new Promise((resolve) => {
      mark.value?.unmark({
        done: () => {
          mark.value?.markRegExp(formMarkRegex(terms), { done: resolve })
        }
      })
    })

    const excerpts = resultsEl.value?.querySelectorAll('.result .excerpt') ?? []
    for (const excerpt of excerpts) {
      excerpt
        .querySelector('mark[data-markjs="true"]')
        ?.scrollIntoView({ block: 'center' })
    }
    // FIXME: without this whole page scrolls to the bottom
    resultsEl.value?.firstElementChild?.scrollIntoView({ block: 'start' })
  },
  { debounce: 200, immediate: true }
)

async function fetchExcerpt(id) {
  const file = pathToFile(id.slice(0, id.indexOf('#')))
  try {
    if (!file) throw new Error(`Cannot find file for id: ${id}`)
    return { id, mod: await import(/* @vite-ignore */ file) }
  } catch (e) {
    console.error(e)
    return { id, mod: {} }
  }
}

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
      // Only focus the selected result if using arrow keys
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

onKeyStroke('Enter', (e) => {
  if (e.isComposing) return

  const target = e.target
  if (target.tagName === 'BUTTON' && target.type !== 'submit') {
    return
  }

  const selectedPackage = results.value[selectedIndex.value]
  if (target.tagName === 'INPUT' && !selectedPackage) {
    e.preventDefault()
    return
  }

  if (selectedPackage) {
    router.go(selectedPackage.id)
    emit('close')
  }
})


onKeyStroke('Escape', () => {
  emit('close')
})

function formMarkRegex(terms) {
  return new RegExp(
    [...terms]
      .sort((a, b) => b.length - a.length)
      .map((term) => `(${escapeRegExp(term)})`)
      .join('|'),
    'gi'
  )
}
</script>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.title svg {
  opacity: 0.5;
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

.excerpt :deep(.vp-code-group) .tabs {
  display: none;
}

.excerpt :deep(.vp-code-group) div[class*='language-'] {
  border-radius: 8px !important;
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
