<template>
  <a-card title="Hiring Funnel" :bordered="false" class="chart-card">
    <div v-if="isLoading" class="chart-loading">
      <a-spin />
    </div>
    <div v-else-if="hiringFunnel.length === 0" class="chart-placeholder">
      <fund-outlined />
      <p>No funnel data available</p>
    </div>
    <div v-else class="funnel-chart">
      <div v-for="(stage, index) in hiringFunnel" :key="stage.stage" class="funnel-stage">
        <div 
          class="funnel-bar" 
          :style="{ width: `${Math.min(100, (stage.count / hiringFunnel[0].count) * 100)}%` }"
          :class="`funnel-color-${index}`"
        ></div>
        <div class="funnel-label">
          <span class="stage-name">{{ stage.stage }}</span>
          <span class="stage-count">{{ stage.count }}</span>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { FundOutlined } from '@ant-design/icons-vue'

defineProps({
  hiringFunnel: {
    type: Array,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.chart-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
  background-color: var(--card-bg);
  height: 100%;
}

.chart-card :deep(.ant-card-head) {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--card-bg);
}

.chart-card :deep(.ant-card-head-title) {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.chart-card :deep(.ant-card-body) {
  background-color: var(--card-bg);
}

.chart-loading {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-placeholder {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--card-bg);
  border-radius: 8px;
  color: var(--text-color);
  opacity: 0.5;
  max-width: 100%;
  overflow-x: hidden;
}

.chart-placeholder svg {
  font-size: 48px;
  margin-bottom: 12px;
  color: #1890ff;
}

.funnel-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 300px;
  padding: 16px 0;
}

.funnel-stage {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.funnel-bar {
  height: 30px;
  border-radius: 4px;
  transition: width 0.5s ease;
  background-color: #1890ff;
}

.funnel-label {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.stage-name {
  font-weight: 500;
}

.stage-count {
  font-weight: 600;
}

/* Funnel color classes */
.funnel-color-0 { background-color: #1890ff; }
.funnel-color-1 { background-color: #36a2ff; }
.funnel-color-2 { background-color: #69b8ff; }
.funnel-color-3 { background-color: #91caff; }
.funnel-color-4 { background-color: #bae0ff; }
</style> 