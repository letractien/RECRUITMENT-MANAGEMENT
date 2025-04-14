<template>
  <a-card class="upcoming-interviews" :bordered="false">
    <template #title>
      <div class="card-header">
        <span>Upcoming Interviews</span>
      </div>
    </template>
    
    <a-spin v-if="isLoading" class="centered-spinner" />
    <a-empty v-else-if="interviews.length === 0" description="No upcoming interviews" />
    <a-timeline v-else>
      <a-timeline-item
        v-for="interview in interviews"
        :key="interview.id"
        :color="getStatusColor(interview.type)"
      >
        <template #dot>
          <div :class="['custom-dot', getStatusType(interview.type)]"></div>
        </template>
        <div class="timeline-content">
          <h4>{{ interview.candidateName }}</h4>
          <p>{{ interview.jobTitle }}</p>
          <p class="interview-type">{{ interview.type }}</p>
          <p class="interview-time">{{ formatInterviewDate(interview.scheduledAt) }}</p>
        </div>
      </a-timeline-item>
    </a-timeline>
  </a-card>
</template>

<script setup>
import { formatDate } from '../../../shared/utils/dateHelpers.js'

const props = defineProps({
  interviews: {
    type: Array,
    required: true,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const getStatusType = (status) => {
  const types = {
    'Pending': 'info',
    'Interview': 'primary',
    'Rejected': 'danger',
    'Hired': 'success',
    'Phone Screen': 'info',
    'Technical': 'warning',
    'HR': 'primary',
    'Final': 'success'
  }
  return types[status] || 'info'
}

const getStatusColor = (status) => {
  const colors = {
    'Pending': 'blue',
    'Interview': 'geekblue',
    'Rejected': 'red',
    'Hired': 'green',
    'Phone Screen': 'cyan',
    'Technical': 'orange',
    'HR': 'geekblue',
    'Final': 'green'
  }
  return colors[status] || 'blue'
}

const formatInterviewDate = (dateString) => {
  return formatDate(dateString, 'YYYY-MM-DD HH:mm')
}
</script>

<style scoped>
.upcoming-interviews {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-color);
  background-color: var(--card-bg);
}

.upcoming-interviews :deep(.ant-card-head) {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.upcoming-interviews :deep(.ant-card-body) {
  background-color: var(--card-bg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.timeline-content h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.timeline-content p {
  margin: 3px 0;
  color: var(--text-color);
  opacity: 0.75;
  font-size: 12px;
}

.timeline-content .interview-type {
  color: #1890ff;
  font-weight: 500;
}

.timeline-content .interview-time {
  color: var(--text-color);
  opacity: 0.65;
  font-size: 12px;
}

.custom-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.custom-dot.info, .custom-dot.primary {
  background-color: #1890ff;
}

.custom-dot.warning {
  background-color: #faad14;
}

.custom-dot.success {
  background-color: #52c41a;
}

.custom-dot.danger {
  background-color: #f5222d;
}

.centered-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style> 