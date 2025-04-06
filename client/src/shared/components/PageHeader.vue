<template>
  <div class="page-header">
    <h2>{{ title }}</h2>
    <div class="header-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border-color, #f0f0f0);
}

.page-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color, rgba(0, 0, 0, 0.85));
  position: relative;
  padding-bottom: 12px;
  letter-spacing: 0.5px;
  display: inline-block;
}

.page-header h2::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  height: 4px;
  width: 40px;
  background: linear-gradient(90deg, #1890ff, #52c41a);
  border-radius: 2px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style> 