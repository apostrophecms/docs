<template>
  <div v-if="isLoading">Loading...</div>
  <div v-if="error">Error: {{ error.message }}</div>
  <div v-if="ogData" class="og-card-wrapper">
    <a :href="ogData.url" class="og-card__link" rel="noopener noreferrer" @click="$emit('close')">
      <div class="og-card__content">
        <p class="og-card__title">{{ ogData.ogTitle }}</p>
        <p class="og-card__description">{{ ogData.ogDescription }}</p>
        <p class="og-card__url">{{ ogData.url }}</p>
      </div>
      <div class="og-card__image-container" v-if="ogData.ogImage">
        <img :src="ogData.ogImage" alt="og image" class="og-card__image" />
      </div>
    </a>
  </div>
  <div v-else>
    <a :href="url" @click="$emit('close')">{{ url }}</a>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useOgData } from '../composables/useOgData'

const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

const { isLoading, error, ogData, fetchOgData } = useOgData()

onMounted(() => {
  fetchOgData(props.url)
})
</script>

<style scoped>
.og-card-wrapper {
  position: relative;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: calc(100% + 40px);
  left: -40px;
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.dark .og-card-wrapper {
  border-color: #333;
}

.og-card__link {
  display: flex;
  margin: 0 auto;
  padding: 16px;
  box-sizing: border-box;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.3s ease;
}

.og-card__url {
  font-size: 13px;
  color: var(--vp-c-brand);
}

.og-card__link:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

.dark .og-card__link:hover {
  background-color: #333;
}

.og-card__content {
  flex: 3;
  padding-right: 16px;
}

.answer-container .content .og-card__title {
  color: var(--vp-c-brand);
  font-size: 1em;
  font-weight: 600;
  margin-bottom: 10px;
}

.og-card__description {
  margin: 0;
  color: #62676A;
  font-size: 13px;
  line-height: 1.3;
  font-weight: 500;
}

.dark .og-card__description {
  color: #ccc;
}

.og-card__image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.og-card__image {
  max-width: 100%;
  border-radius: 8px;
}
</style>
