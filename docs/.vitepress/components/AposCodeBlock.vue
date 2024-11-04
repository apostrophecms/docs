<template>
  <div class="code-block-container" ref="container">
    <div v-if="hasBothVersions" class="module-switch">
      <label class="switch-label">
        <span :class="{ active: moduleType === 'cjs' }">CJS</span>
        <div class="switch">
          <input
            type="checkbox"
            :checked="moduleType === 'esm'"
            @change="toggleModuleType"
          />
          <span class="slider round"></span>
        </div>
        <span :class="{ active: moduleType === 'esm' }">ESM</span>
      </label>
    </div>

    <figure>
      <slot v-if="!hasBothVersions"></slot>
      <div v-else v-html="currentCode"></div>
      <figcaption v-if="hasCaption">
        <slot name="caption"></slot>
      </figcaption>
    </figure>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { eventBus } from '../theme'

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
const hasCaption = ref(false);

let unsubscribe;

const hasBothVersions = computed(() => {
  return Boolean(cjsCode.value && esmCode.value);
});

const currentCode = computed(() => {
  return moduleType.value === 'cjs' ? cjsCode.value : esmCode.value;
});

function toggleModuleType(event) {
  const newType = event.target.checked ? 'esm' : 'cjs';
  eventBus.setPreference(newType);
}

onMounted(() => {
  // Subscribe to preference changes
  unsubscribe = eventBus.subscribe((newValue) => {
    moduleType.value = newValue;
  });

  hasCaption.value = !!container.value?.querySelector('[name="caption"]');

  if (container.value) {
    const codeBlock = container.value.querySelector('.module-code-block');
    if (codeBlock) {
      const cjs = codeBlock.dataset.cjs;
      const esm = codeBlock.dataset.esm;

      if (cjs && esm) {
        cjsCode.value = decodeURIComponent(cjs);
        esmCode.value = decodeURIComponent(esm);
        codeBlock.innerHTML = '';
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
.code-block-container {
  position: relative;
}

.module-switch {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  user-select: none;
}

.switch-label span {
  color: var(--vp-c-text-2);
}

.switch-label span.active {
  color: var(--vp-c-text-1);
}

/* Switch container */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  flex-shrink: 0;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

/* Only change the position when checked */
input:checked + .slider:before {
  transform: translateX(24px);
}

/* Focus states */
input:focus-visible + .slider {
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

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
  font-family: Hack, monospace;
  font-size: 0.85rem;
  text-align: center;
}

:deep(.vp-code-group) {
  margin: 0;
}

:deep(.shiki) {
  font-family: var(--vp-font-family-mono);
  font-size: var(--vp-code-font-size);
  line-height: var(--vp-code-line-height);
}
</style>