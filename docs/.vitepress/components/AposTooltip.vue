<template>
  <div class="tooltip-container">
    <span class="tooltip-trigger" @mouseenter="showTooltip" @mouseleave="hideTooltip">
      <slot></slot>
      <div v-show="isVisible" class="tooltip-content" :class="position">
        {{ currentContent }}
      </div>
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  activeContent: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
  }
})

const isVisible = ref(false)
const isActive = ref(false)

const currentContent = computed(() => {
  return isActive.value && props.activeContent ? props.activeContent : props.content
})

const showTooltip = () => {
  isVisible.value = true
}

const hideTooltip = () => {
  isVisible.value = false
  isActive.value = false  // Reset to default content when hidden
}

// Expose method to parent
const setActive = (active = true) => {
  isActive.value = active
}

defineExpose({ setActive })
</script>

<style scoped>
.tooltip-container {
  display: inline-block;
  position: relative;
  z-index: 99;
}

.tooltip-trigger {
  display: inline-block;
}

.tooltip-content {
  position: absolute;
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 1;
  visibility: visible;
}

.tooltip-content.top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
}

.tooltip-content.bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(8px);
}

.tooltip-content.left {
  right: 100%;
  top: 50%;
  transform: translateX(-8px) translateY(-50%);
}

.tooltip-content.right {
  left: 100%;
  top: 50%;
  transform: translateX(8px) translateY(-50%);
}
</style>