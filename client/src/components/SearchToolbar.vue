<template>
  <div class="toolbar">
    <a-input
      v-model:value="searchModel"
      :placeholder="searchPlaceholder"
      style="max-width: 300px"
      @change="emitSearch"
    >
      <template #prefix><search-outlined /></template>
    </a-input>
    
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  search: {
    type: String,
    default: ''
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  }
});

const emit = defineEmits(['update:search']);

const searchModel = ref(props.search);

// Watch for prop changes to update the local model
watch(() => props.search, (newValue) => {
  searchModel.value = newValue;
});

// Emit the search value when it changes
const emitSearch = () => {
  emit('update:search', searchModel.value);
};
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
  
  .toolbar :deep(.ant-input),
  .toolbar :deep(.ant-select) {
    width: 100%;
    max-width: none;
  }
}
</style> 