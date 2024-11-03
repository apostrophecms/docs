<template>
  <div class="code-block-container" ref="container">
    <div v-if="hasBothVersions" class="module-switch">
      <button
        @click="moduleType = 'cjs'" 
        :class="{ active: moduleType === 'cjs' }"
      >CommonJS</button>
      <button
        @click="moduleType = 'esm'" 
        :class="{ active: moduleType === 'esm' }"
      >ES Modules</button>
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
import { ref, computed, onMounted, useSlots } from 'vue';

const props = defineProps({
  language: {
    type: String,
    default: 'javascript'
  }
});

const container = ref(null);
const moduleType = ref('cjs');
const cjsCode = ref('');
const esmCode = ref('');
const hasCaption = ref(false);
const slots = useSlots();

const hasBothVersions = computed(() => {
  return Boolean(cjsCode.value && esmCode.value);
});

const currentCode = computed(() => {
  return moduleType.value === 'cjs' ? cjsCode.value : esmCode.value;
});

onMounted(() => {
  hasCaption.value = !!slots.caption;

  // Find the code block within this component's container
  if (container.value) {
    const codeBlock = container.value.querySelector('.module-code-block');
    if (codeBlock) {
      const cjs = codeBlock.dataset.cjs;
      const esm = codeBlock.dataset.esm;

      if (cjs && esm) {
        cjsCode.value = decodeURIComponent(cjs);
        esmCode.value = decodeURIComponent(esm);
        // Remove the original code block since we're showing the switched version
        codeBlock.innerHTML = '';
      }
    }
  }
});
</script>

<style scoped>
.code-block-container {
  position: relative;
}

.module-switch {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.module-switch button {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
}

.module-switch button.active {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
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