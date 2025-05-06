<template>
  <div class="update-notification">
    <span>Site update required. Content may not display correctly.</span>
    <button @click="refreshPage" class="refresh-button">Refresh Now</button>
  </div>
</template>

<script>
export default {
  name: 'UpdateNotification',
  methods: {
    refreshPage() {
      window.location.reload();
    }
  }
}
</script>

<style scoped>
.update-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #e74c3c;
  color: white;
  padding: 12px 20px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
}

.refresh-button {
  background-color: white;
  color: #e74c3c;
  border: none;
  padding: 8px 15px;
  border-radius: 3px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
</style>