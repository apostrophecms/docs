<template>
  <Teleport to="body">
    <div ref="el" role="button" :aria-owns="resultsLength ? 'localsearch-list' : undefined" aria-expanded="true" aria-haspopup="listbox" aria-labelledby="query-label" class="VPLocalSearchBox">
      <div class="backdrop" @click="handleClose" />
      <div class="shell">
        <form class="search-bar" @pointerup="onSearchBarClick" @submit.prevent="">
          <label :title="dynamicLabel" id="query-label" for="query-input">
            <span :class="searchType === 'MiniSearch' ? 'vpi-search' : 'vpi-ai'" class="search-icon local-search-icon" />
          </label>
          <div class="search-actions before">
            <button class="back-button" :title="translate('modal.backButtonTitle')" @click="$emit('close')">
              <span class="vpi-arrow-left local-search-icon" />
            </button>
          </div>
          <input ref="searchInput" v-model="filterText" :placeholder="buttonText" id="query-input" aria-labelledby="query-label" class="search-input" autocomplete="off" />
          <div class="search-actions">
            <button class="toggle-search-type-button" type="button" :title="dynamicLabel" @click="toggleSearchType">
              <span :class="searchType === 'MiniSearch' ? 'vpi-ai' : 'vpi-search'" class="search-icon" />
              {{ dynamicLabel }}
            </button>
            <button v-if="!disableDetailedView" class="toggle-layout-button" type="button" :class="{ 'detailed-list': showDetailedList }" :title="translate('modal.displayDetails')" @click="toggleDetailedList">
              <span class="vpi-layout-list local-search-icon" />
            </button>
            <button class="clear-button" type="reset" :disabled="disableReset" :title="translate('modal.resetButtonTitle')" @click="resetSearch">
              <span class="vpi-delete local-search-icon" />
            </button>
          </div>
        </form>

        <MiniSearchResults v-if="searchType === 'MiniSearch'" :filterText="filterText" :enableNoResults="enableNoResults" :showDetailedList="showDetailedList" @update:resultsLength="updateResultsLength" @close="$emit('close')" />
        <AISearchResults v-else :filterText="filterText" :enableNoResults="enableNoResults" @close="$emit('close')" />

        <div class="search-keyboard-shortcuts">
          <span v-if="searchType === 'MiniSearch'" class="navigation-arrows">
            <kbd :aria-label="translate('modal.footer.navigateUpKeyAriaLabel')">
              <span class="vpi-arrow-up navigate-icon" />
            </kbd>
            <kbd :aria-label="translate('modal.footer.navigateDownKeyAriaLabel')">
              <span class="vpi-arrow-down navigate-icon" />
            </kbd>
            {{ translate('modal.footer.navigateText') }}
          </span>
          <span v-if="searchType === 'MiniSearch'" class="navigation-select">
            <kbd :aria-label="translate('modal.footer.selectKeyAriaLabel')">
              <span class="vpi-corner-down-left navigate-icon" />
            </kbd>
            {{ translate('modal.footer.selectText') }}
          </span>
          <span>
            <kbd :aria-label="translate('modal.footer.closeKeyAriaLabel')">esc</kbd>
            {{ translate('modal.footer.closeText') }}
          </span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, provide, onMounted, nextTick } from 'vue'
import MiniSearchResults from './AposMiniSearchResults.vue'
import AISearchResults from './AposAISearchResults.vue'
import { useLocalStorage, useSessionStorage } from '@vueuse/core'
import { createSearchTranslate } from 'vitepress/dist/client/theme-default/support/translation'

const emit = defineEmits(['close'])

const searchInput = ref(null)

// Initialize the search type from session storage or default to 'MiniSearch'
const searchType = useSessionStorage('vitepress:search-type', 'MiniSearch')
const isAISearchActive = computed(() => searchType.value === 'AISearch')
provide('isAISearchActive', isAISearchActive)

const filterText = useSessionStorage('vitepress:local-search-filter', '')
const enableNoResults = ref(false)
const showDetailedList = useLocalStorage('vitepress:local-search-detailed-list', false)
const disableDetailedView = ref(false)
const resultsLength = ref(0)

const dynamicLabel = computed(() => {
  if (filterText.value.length > 0) {
    const truncatedText = filterText.value.length > 10 ? filterText.value.substring(0, 10) + '...' : filterText.value
    return searchType.value === 'MiniSearch' ? `Ask AI about "${truncatedText}"` : `Search documentation for "${truncatedText}"`
  }
  return searchType.value === 'MiniSearch' ? 'Ask AI about Apostrophe Documentation' : 'Switch to documentation search'
})

const buttonText = computed(() => getDefaultButtonText(searchType.value))

function getDefaultButtonText(searchType) {
  return searchType === 'MiniSearch' ? 'Search' : 'Ask AI about Apostrophe documentation'
}

function toggleSearchType() {
  searchType.value = searchType.value === 'MiniSearch' ? 'AISearch' : 'MiniSearch'
  sessionStorage.setItem('vitepress:search-type', searchType.value)  // Save the current search type to session storage
}


function resetSearch() {
  filterText.value = ''
}

function toggleDetailedList() {
  showDetailedList.value = !showDetailedList.value
}

const translate = createSearchTranslate({
  modal: {
    displayDetails: 'Display detailed list',
    resetButtonTitle: 'Reset search',
    backButtonTitle: 'Close search',
    noResultsText: 'No results for',
    footer: {
      selectText: 'to select',
      selectKeyAriaLabel: 'enter',
      navigateText: 'to navigate',
      navigateUpKeyAriaLabel: 'up arrow',
      navigateDownKeyAriaLabel: 'down arrow',
      closeText: 'to close',
      closeKeyAriaLabel: 'escape'
    }
  }
})

function updateResultsLength(length) {
  resultsLength.value = length
}

const disableReset = computed(() => {
  return filterText.value?.length <= 0
})

onMounted(() => {
  searchInput.value?.focus()
  searchInput.value?.setSelectionRange(searchInput.value.value.length, searchInput.value.value.length);
})

function handleClose() {
  if (isAISearchActive.value) {
    filterText.value = '';
    sessionStorage.removeItem('vitepress:local-search-filter')
  }
  emit('close')
}
</script>

<style scoped>
.VPLocalSearchBox {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: flex;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: var(--vp-backdrop-bg-color);
  transition: opacity 0.5s;
}

.shell {
  position: relative;
  padding: 12px;
  margin: 64px auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--vp-local-search-bg);
  width: min(100vw - 60px, 900px);
  height: min-content;
  max-height: min(100vh - 128px, 900px);
  border-radius: 6px;
}

@media (max-width: 767px) {
  .shell {
    margin: 0;
    width: 100vw;
    height: 100vh;
    max-height: none;
    border-radius: 0;
  }
}

.search-bar {
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  cursor: text;
}

@media (max-width: 767px) {
  .search-bar {
    padding: 0 8px;
  }
}

.search-bar:focus-within {
  border-color: var(--vp-c-brand-1);
}

.local-search-icon {
  display: block;
  font-size: 18px;
}

.navigate-icon {
  display: block;
  font-size: 14px;
}

.search-icon {
  margin: 8px;
}

@media (max-width: 767px) {
  .search-icon {
    display: none;
  }
}

.search-input {
  padding: 6px 12px;
  font-size: inherit;
  width: 100%;
}

@media (max-width: 767px) {
  .search-input {
    padding: 6px 4px;
  }
}

.search-actions {
  display: flex;
  gap: 4px;
}

@media (any-pointer: coarse) {
  .search-actions {
    gap: 8px;
  }
}

@media (min-width: 769px) {
  .search-actions.before {
    display: none;
  }
}

.search-actions button {
  padding: 8px;
}

.search-actions button:not([disabled]):hover,
.toggle-layout-button.detailed-list {
  color: var(--vp-c-brand-1);
}

.search-actions button.clear-button:disabled {
  opacity: 0.37;
}

.search-keyboard-shortcuts {
  font-size: 0.8rem;
  opacity: 75%;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  line-height: 14px;
}

.search-keyboard-shortcuts span {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 767px) {
  .search-keyboard-shortcuts {
    display: none;
  }
}

.search-keyboard-shortcuts kbd {
  background: rgba(128, 128, 128, 0.1);
  border-radius: 4px;
  padding: 3px 6px;
  min-width: 24px;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  border: 1px solid rgba(128, 128, 128, 0.15);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.1);
}

.toggle-search-type-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.toggle-search-type-button .search-icon {
  display: inline-block;
}

.dark .vpi-ai {
  color: greenyellow;
}

.vpi-ai {
  color: #88da09;
  --icon: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27%3E %3Cdefs%3E %3ClinearGradient id=%27apos-translation-gradient%27 x1=%270%27 x2=%270%27 y1=%270%27 y2=%271%27%3E %3Cstop class=%27stop1%27 offset=%270%25%27/%3E %3Cstop class=%27stop2%27 offset=%27100%25%27/%3E %3C/linearGradient%3E %3C/defs%3E %3Cpath id=%27svg-path%27 d=%27M19,1L17.74,3.75L15,5L17.74,6.26L19,9L20.25,6.26L23,5L20.25,3.75M9,4L6.5,9.5L1,12L6.5,14.5L9,20L11.5,14.5L17,12L11.5,9.5M19,15L17.74,17.74L15,19L17.74,20.25L19,23L20.25,20.25L23,19L20.25,17.74%27 fill=%27url(%23apos-translation-gradient)%27/%3E %3C/svg%3E');
}
</style>
