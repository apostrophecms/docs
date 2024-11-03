<template>
  <figure>
    <div v-if="showToggle" class="code-header">
      <div class="toggle-container">
        <button 
          class="toggle-btn"
          :class="{ active: !isEsm }"
          @click="isEsm = false"
        >
          CommonJS
        </button>
        <button 
          class="toggle-btn"
          :class="{ active: isEsm }"
          @click="isEsm = true"
        >
          ESM
        </button>
      </div>
    </div>
    <div class="code-container">
      <!-- Original CJS version -->
      <div v-show="!isEsm" ref="cjsContainer">
        <slot></slot>
      </div>
      <!-- ESM version -->
      <div 
        v-show="isEsm" 
        ref="esmContainer"
      ></div>
      <figcaption v-if="hasCaption" class="code-caption">
        <slot name="caption"></slot>
      </figcaption>
    </div>
  </figure>
</template>

<script setup>
import { ref, onMounted, useSlots } from 'vue';
import { useData } from 'vitepress';

const hasCaption = ref(false);
const isEsm = ref(false);
const showToggle = ref(false);
const cjsContainer = ref(null);
const esmContainer = ref(null);
const slots = useSlots();

// Function to detect if code needs CJS/ESM toggle
const shouldShowToggle = (code, language) => {
  // Don't show toggle for Vue or Nunjucks
  if (['vue', 'html', 'njk'].includes(language.toLowerCase())) {
    return false;
  }

  // Check if code contains CommonJS patterns
  const hasCjsPatterns = code.includes('require(') || 
    code.includes('module.exports') || 
    code.includes('exports.');

  // Check if code contains ESM patterns
  const hasEsmPatterns = code.includes('import ') || 
    code.includes('export ');

  // Only show toggle if code contains CJS patterns (since we're converting from CJS)
  // and doesn't mix patterns
  return hasCjsPatterns && !hasEsmPatterns;
};

// Function to convert CJS to ESM
const convertToEsm = (code) => {
  return code
    // Convert require statements to imports
    .replace(/const\s+(\w+)\s*=\s*require\(['"](.+?)['"]\)/g, 'import $1 from "$2"')
    // Convert module.exports to export default
    .replace(/module\.exports\s*=\s*/g, 'export default ')
    // Convert exports.something to export const something
    .replace(/exports\.(\w+)\s*=\s*/g, 'export const $1 = ');
};

onMounted(() => {
  hasCaption.value = !!slots.caption;

  // Get the code element and its content
  const preEl = cjsContainer.value.querySelector('pre');
  const codeEl = preEl?.querySelector('code');
  if (!codeEl) return;

  // Get the language and original code
  const language = Array.from(codeEl.classList)
    .find(cls => cls.startsWith('language-'))
    ?.replace('language-', '') || 'javascript';
  
  const originalCode = codeEl.textContent;

  // Check if we should show the toggle
  showToggle.value = shouldShowToggle(originalCode, language);

  if (showToggle.value) {
    // Convert to ESM
    const esmCode = convertToEsm(originalCode);

    // Clone the original pre element and all its content
    const esmPre = preEl.cloneNode(true);
    
    // Update only the text content of the code element
    const esmCodeEl = esmPre.querySelector('code');
    const spans = Array.from(esmCodeEl.children);
    
    // Split both versions into lines
    const originalLines = originalCode.split('\n');
    const esmLines = esmCode.split('\n');
    
    // Update each line's content while preserving spans
    spans.forEach((span, i) => {
      if (esmLines[i] !== originalLines[i]) {
        span.textContent = esmLines[i];
      }
    });
    
    // Add to container
    esmContainer.value.appendChild(esmPre);
  }
});
</script>

<style lang="stylus" scoped>
figure {
  position: relative;
  margin: 0;
  padding: 0;
}

.code-container {
  position: relative;
}

.code-header {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem;
  margin: 0;
  background: #1e1e1e;
}

.toggle-container {
  display: flex;
  gap: 0.5rem;
  z-index: 2;
}

.toggle-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid #666;
  border-radius: 4px;
  background: transparent;
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #333;
  }

  &.active {
    background: #666;
    border-color: #888;
  }
}

.code-caption {
  position: absolute;
  top: 0.85rem;
  left: 3rem;
  right: 3rem;
  text-align: center;
  color: #fff;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  z-index: 1;
}

:deep(pre) {
  margin-top: 0;
}

:deep(.esm-container pre) {
  margin-top: 0;
}
</style>