<template>
  <a-card class="upcoming-interviews" :bordered="false">
    <template #title>
      <div class="card-header">
        <span>Upcoming Interviews</span>
      </div>
    </template>
    <a-spin v-if="loading" class="centered-spinner" />
    <a-empty v-else-if="interviews.length === 0" description="No upcoming interviews" />
    <a-timeline v-else>
      <a-timeline-item
        v-for="interview in interviews"
        :key="interview.id"
        :color="getStatusColor(interview.interviewType)"
      >
        <template #dot>
          <div :class="['custom-dot', getStatusType(interview.interviewType)]"></div>
        </template>
        <div class="timeline-content">
          <h4>{{ interview.candidate }}</h4>
          <p>{{ interview.position }}</p>
          <p class="interview-type">{{ interview.interviewType }}</p>
          <p class="interview-time">{{ formatInterviewDate(interview.date) }}</p>
        </div>
      </a-timeline-item>
    </a-timeline>
  </a-card>
</template>

<script setup>

const props = defineProps({
  interviews: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const getStatusColor = (type) => {
  switch (type) {
    case 'Phone Screen': return 'blue'
    case 'Video': return 'cyan'
    case 'Onsite': return 'gold'
    case 'Technical': return 'green'
    case 'HR': return 'purple'
    default: return 'default'
  }
}

const getStatusType = (type) => {
  return type.toLowerCase().replace(/\s+/g, '-')
}

const formatInterviewDate = (dateInput) => {
  if (!dateInput) return '';
  
  try {
    let dateString;
    
    if (dateInput instanceof Date) {
      dateString = dateInput.toISOString();
    } else {
      dateString = dateInput;
    }
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date:', error, dateInput);
    return typeof dateInput === 'object' ? 
      dateInput.toLocaleString() : 
      String(dateInput);
  }
}
</script>

<style scoped>
.upcoming-interviews {
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
  background-color: var(--card-bg);
}

.upcoming-interviews :deep(.ant-card-head) {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.upcoming-interviews :deep(.ant-card-body) {
  background-color: var(--card-bg);
  padding: 16px 24px;
  max-height: unset;
  overflow-y: initial;
}

.centered-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
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

.custom-dot.info, .custom-dot.primary, .custom-dot.phone-screen, .custom-dot.phone {
  background-color: #1890ff;
}

.custom-dot.warning, .custom-dot.technical {
  background-color: #faad14;
}

.custom-dot.success, .custom-dot.hr {
  background-color: #52c41a;
}

.custom-dot.danger {
  background-color: #f5222d;
}

.custom-dot.video {
  background-color: #13c2c2;
}

.custom-dot.onsite {
  background-color: #722ed1;
}
</style> 