<template>
  <div class="og-card-wrapper">
    <a :href="url" class="og-card__link" rel="noopener noreferrer" @click="$emit('close')">
      <p class="og-card__url">{{ url }}</p>
    </a>
  </div>
</template>

<script setup>
defineProps({
  url: {
    type: String,
    required: true
  }
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
  width: 100%;
}

.og-card__url {
  margin: 0;
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
</style>
