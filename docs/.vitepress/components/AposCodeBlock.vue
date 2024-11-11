<template>
  <div class="code-block-container" ref="container">
    <div v-if="hasBothVersions" class="code-block-wrapper">
      <div class="custom-header">
        <span class="lang">{{ detectedLanguage }}</span>
        <span v-if="$slots.caption" class="file-name">
          <slot name="caption"></slot>
        </span>
        <div class="right-section">
          <div class="module-toggles">
            <AposTooltip content="CommonJS format" position="top">
              <button 
                class="module-btn"
                :class="{ active: moduleType === 'cjs' }"
                @click="setModuleType('cjs')"
              >
                CJS
              </button>
            </AposTooltip>
            <AposTooltip content="ES Modules format" position="top">
              <button 
                class="module-btn"
                :class="{ active: moduleType === 'esm' }"
                @click="setModuleType('esm')"
              >
                ESM
              </button>
            </AposTooltip>
          </div>
          <AposTooltip ref="copyTooltip" content="Copy code" active-content="Copied!" position="top">
            <button class="copy" @click="copyCode" aria-label="Copy code"></button>
          </AposTooltip>
        </div>
      </div>
      <div class="code-content language-javascript" v-html="currentCode"></div>
    </div>
    <!-- Regular code block layout -->
    <figure v-else>
      <slot></slot>
      <figcaption v-if="$slots.caption">
        <slot name="caption"></slot>
      </figcaption>
    </figure>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { eventBus } from '../theme';
import AposTooltip from './AposTooltip.vue';

const props = defineProps({
  language: {
    type: String,
    default: 'javascript'
  }
});

const container = ref(null);
const moduleType = ref(eventBus.preference.value);
const cjsCode = ref('');
const esmCode = ref('');
const copyTooltip = ref(null);
let unsubscribe;

const hasBothVersions = computed(() => {
  return Boolean(cjsCode.value && esmCode.value)
});

const currentCode = computed(() => {
  return moduleType.value === 'cjs' ? cjsCode.value : esmCode.value
});

const detectedLanguage = computed(() => {
  if (container.value) {
    const codeBlock = container.value.querySelector('.module-code-block');
    if (codeBlock) {
      return codeBlock.dataset.lang || 'text';
    }
    const pre = container.value.querySelector('pre');
    if (pre) {
      const classes = Array.from(pre.classList);
      const langClass = classes.find(cls => cls.startsWith('language-'));
      if (langClass) {
        return langClass.replace('language-', '');
      }
    }
  }
  return props.language;
});

async function copyCode() {
  const code = container.value?.querySelector('pre')?.textContent || '';
  if (code) {
    await navigator.clipboard.writeText(code);
    copyTooltip.value?.setActive(true)
    // Reset tooltip after a delay
    setTimeout(() => {
      copyTooltip.value?.setActive(false)
    }, 2000)
  }
};

function setModuleType(type) {
  eventBus.setPreference(type)
};

onMounted(() => {
  const codeBlock = container.value?.querySelector('.module-code-block');
  unsubscribe = eventBus.subscribe((newValue) => {
    moduleType.value = newValue;
  });
  if (container.value) {
    const codeBlock = container.value.querySelector('.module-code-block');
    if (codeBlock) {
      const cjs = codeBlock.dataset.cjs;
      const esm = codeBlock.dataset.esm;
      if (cjs && esm) {
        cjsCode.value = decodeURIComponent(cjs);
        esmCode.value = decodeURIComponent(esm);
      }
    }
  }
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<style scoped>
/* Base container styles */
.code-block-container {
  position: relative;
}

/* Figure styles for non-switchable code */
figure {
  position: relative;
  margin: 0;
  padding: 0;
}

figcaption {
  z-index: 1;
  position: absolute;
  top: 0.85em;
  left: 3em;
  width: calc(100% - 6em);
  color: #fff;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  text-align: center;
}

/* Switchable code block styles */
.code-block-wrapper {
  border-radius: 8px;
  overflow: visible; /* Allow tooltips to show */
}

.code-block-wrapper :deep(pre) {
  border-radius: 0 0 8px 8px !important;
  margin-top: 0 !important;
  padding: 16px !important;
}

.code-block-wrapper div[class*='language-javascript'] {
  border-radius: 0 0 8px 8px;
  margin-top: 0;
}

/* Header styles */
.custom-header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: rgb(0, 0, 0);
  border-bottom: 1px solid rgba(84, 84, 84, .48);
  height: 40px;
  border-radius: 8px 8px 0 0;
  position: relative;
}

.lang {
  color: #FEF100;
  font-family: var(--vp-font-family-mono);
  font-size: 0.9em;
}

.file-name {
  margin: 0 auto 0 16px;
  color: #fff;
  font-family: var(--vp-font-family-mono);
  font-size: 0.9em;
}

/* Right section with buttons */
.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
  position: relative;
}

.module-toggles {
  display: flex;
  gap: 8px;
  margin-right: 16px;
}

/* Button styles */
.module-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px 8px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.9em;
}

.module-btn.active {
  color: #FEF100;
  border-bottom: 2px solid #FEF100;
}

.copy {
  width: 24px;
  height: 24px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'%3E%3C/path%3E%3C/svg%3E") center no-repeat;
  border: none;
  opacity: 0.6;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;
}

.copy:hover {
  opacity: 1;
}

/* VitePress overrides */
:deep(.language-javascript),
:deep(.language-js) {
  margin: 0;
}

:deep(.vp-code-header) {
  display: none !important;
}
</style>