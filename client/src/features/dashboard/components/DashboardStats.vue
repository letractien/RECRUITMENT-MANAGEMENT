<template>
  <div class="stats-grid">
    <a-card class="stat-card" :bordered="false" hoverable>
      <div class="stat-content primary">
        <div class="stat-header">Active Jobs</div>
        <div class="stat-value">{{ stats.activeJobs }}</div>
        <div :class="['stat-change', stats.activeJobsChange >= 0 ? 'positive' : 'negative']">
          <arrow-up-outlined v-if="stats.activeJobsChange >= 0" />
          <arrow-down-outlined v-else />
          {{ Math.abs(stats.activeJobsChange) }} this {{ timeRange }}
        </div>
      </div>
    </a-card>
    
    <a-card class="stat-card" :bordered="false" hoverable>
      <div class="stat-content success">
        <div class="stat-header">New Applications</div>
        <div class="stat-value">{{ formatNumber(stats.newApplications) }}</div>
        <div :class="['stat-change', stats.applicationsChange >= 0 ? 'positive' : 'negative']">
          <arrow-up-outlined v-if="stats.applicationsChange >= 0" />
          <arrow-down-outlined v-else />
          {{ Math.abs(stats.applicationsChange) }}% from last period
        </div>
      </div>
    </a-card>
    
    <a-card class="stat-card" :bordered="false" hoverable>
      <div class="stat-content warning">
        <div class="stat-header">Interviews</div>
        <div class="stat-value">{{ formatNumber(stats.scheduledInterviews) }}</div>
        <div :class="['stat-change', stats.interviewsChange >= 0 ? 'positive' : 'negative']">
          <arrow-up-outlined v-if="stats.interviewsChange >= 0" />
          <arrow-down-outlined v-else />
          {{ Math.abs(stats.interviewsChange) }}% from last period
        </div>
      </div>
    </a-card>
    
    <a-card class="stat-card" :bordered="false" hoverable>
      <div class="stat-content danger">
        <div class="stat-header">Positions Filled</div>
        <div class="stat-value">{{ formatNumber(stats.positionsFilled) }}</div>
        <div :class="['stat-change', stats.filledChange >= 0 ? 'positive' : 'negative']">
          <arrow-up-outlined v-if="stats.filledChange >= 0" />
          <arrow-down-outlined v-else />
          {{ Math.abs(stats.filledChange) }}% from last period
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue'
import { formatNumber } from '../../../shared/utils/formatHelpers.js'

defineProps({
  stats: {
    type: Object,
    required: true
  },
  timeRange: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
  width: 100%;
  max-width: 100%;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--shadow-color);
  background-color: var(--card-bg);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px var(--shadow-color);
}

.stat-content {
  display: flex;
  flex-direction: column;
  padding: 16px;
  position: relative;
  border-radius: 10px;
}

.stat-content.primary {
  background: linear-gradient(45deg, rgba(24, 144, 255, 0.05), rgba(24, 144, 255, 0.1));
  border-left: 4px solid #1890ff;
}

.stat-content.success {
  background: linear-gradient(45deg, rgba(82, 196, 26, 0.05), rgba(82, 196, 26, 0.1));
  border-left: 4px solid #52c41a;
}

.stat-content.warning {
  background: linear-gradient(45deg, rgba(250, 173, 20, 0.05), rgba(250, 173, 20, 0.1));
  border-left: 4px solid #faad14;
}

.stat-content.danger {
  background: linear-gradient(45deg, rgba(245, 34, 45, 0.05), rgba(245, 34, 45, 0.1));
  border-left: 4px solid #f5222d;
}

.stat-header {
  font-size: 15px;
  color: var(--text-color);
  opacity: 0.85;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.stat-value {
  font-size: 34px;
  font-weight: 700;
  color: var(--text-color);
  margin: 4px 0;
  transition: color 0.3s ease;
}

.stat-card:hover .stat-value {
  color: #1890ff;
}

.stat-change {
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.75;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive {
  color: #52c41a;
  font-weight: 600;
}

.stat-change.negative {
  color: #f5222d;
  font-weight: 600;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style> 