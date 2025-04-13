<template>
  <div class="job-details" v-if="job">
    <div class="job-details-header">
      <div class="job-meta">
        <span><environment-outlined /> {{ job.location }}</span>
        <span><fund-outlined /> {{ job.department }}</span>
        <span><calendar-outlined /> Posted {{ formatJobDate(job) }}</span>
        <a-tag :color="getStatusColor(job.status)">
        {{ formatStatus(job.status) }}
      </a-tag>
      </div>
    </div>
    
    <div class="job-section">
      <h4>Description</h4>
      <p>{{ job.description }}</p>
    </div>
    
    <div class="job-section">
      <h4>Requirements</h4>
      <div v-if="Array.isArray(job.requirements)">
        <ul>
          <li v-for="(req, index) in job.requirements" :key="index">{{ req }}</li>
        </ul>
      </div>
      <p v-else>{{ job.requirements }}</p>
    </div>

    <div class="job-section">
      <h4>Responsibilities</h4>
      <div v-if="Array.isArray(job.responsibilities)">
        <ul>
          <li v-for="(resp, index) in job.responsibilities" :key="index">{{ resp }}</li>
        </ul>
      </div>
      <p v-else-if="job.responsibilities">{{ job.responsibilities }}</p>
      <p v-else>Not specified</p>
    </div>

    <div class="job-section">
      <h4>Salary Range</h4>
      <p v-if="job.min_salary || job.salaryMin">
        {{ formatSalary(job.min_salary || job.salaryMin) }} - 
        {{ formatSalary(job.max_salary || job.salaryMax) }} VND
      </p>
      <p v-else>Competitive</p>
    </div>

    <div class="job-section">
      <h4>Applications</h4>
      <p>{{ job.applicants || job.applications || 0 }} candidates have applied</p>
    </div>
  </div>
</template>

<script setup>
import { 
  EnvironmentOutlined, 
  CalendarOutlined,
  FundOutlined
} from '@ant-design/icons-vue'
import { formatDate } from '../../../shared/utils/dateHelpers.js'
import { formatCurrency } from '../../../shared/utils/formatHelpers.js'

const props = defineProps({
  job: {
    type: Object,
    required: true
  }
})

const getStatusColor = (status) => {
  if (!status) return 'blue';
  
  const statusLower = status.toLowerCase();
  if (statusLower === 'open' || statusLower === 'active') return 'green';
  if (statusLower === 'paused') return 'orange';
  if (statusLower === 'closed') return 'red';
  if (statusLower === 'draft') return 'blue';
  
  return 'blue';
}

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

const formatJobDate = (job) => {
  return formatDate(job.postedDate || job.createdAt)
}

const formatSalary = (amount) => {
  return formatCurrency(amount)
}
</script>

<style scoped>
.job-details {
  padding: 20px;
}

.job-details-header {
  margin-bottom: 20px;
}

.job-meta {
  margin-top: 10px;
  display: flex;
  gap: 20px;
  color: #666;
}

.job-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.job-section {
  margin-bottom: 20px;
}

.job-section h4 {
  margin-bottom: 10px;
  color: #333;
}

.job-section p {
  color: #666;
  line-height: 1.6;
}

.job-section ul {
  padding-left: 20px;
  color: #666;
  line-height: 1.6;
}

.job-section li {
  margin-bottom: 5px;
}
</style> 