<template>
  <div class="job-details" v-if="job">
    <div class="form-section">
      <div class="section-header">
        <h3 class="text-lg font-semibold">Basic Information</h3>
        <p class="text-sm text-gray-500">Job posting details and requirements</p>
      </div>
      <div class="profile-header">
        <a-avatar :size="64" class="profile-avatar">
          {{ job.title ? job.title.charAt(0).toUpperCase() : 'J' }}
        </a-avatar>
        <div class="profile-info">
          <h2 class="job-title">{{ job.title }}</h2>
          <div class="job-meta">
            <span><environment-outlined /> {{ job.location }}</span>
            <span><fund-outlined /> {{ job.department }}</span>
            <span><calendar-outlined /> Posted {{ formatJobDate(job) }}</span>
          </div>
          <div class="job-status">
            <a-tag :color="getStatusColor(job.status)">
              {{ formatStatus(job.status) }}
            </a-tag>
            <a-tag v-if="job.is_remote" color="blue">Remote</a-tag>
            <a-tag :color="getEmploymentTypeColor(job.employment_type)">
              {{ formatEmploymentType(job.employment_type) }}
            </a-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="section-header">
        <h3 class="text-lg font-semibold">Job Details</h3>
        <p class="text-sm text-gray-500">Detailed information about the position</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-group">
          <label class="form-label">Department</label>
          <div class="form-value">{{ job.department }}</div>
        </div>
        <div class="form-group">
          <label class="form-label">Location</label>
          <div class="form-value">{{ job.location }}</div>
        </div>
        <div class="form-group">
          <label class="form-label">Employment Type</label>
          <div class="form-value">{{ formatEmploymentType(job.employment_type) }}</div>
        </div>
        <div class="form-group">
          <label class="form-label">Remote Work</label>
          <div class="form-value">{{ job.is_remote ? 'Yes' : 'No' }}</div>
        </div>
        <div class="form-group">
          <label class="form-label">Salary Range</label>
          <div class="form-value">
            <span v-if="job.min_salary || job.max_salary">
              {{ formatSalary(job.min_salary) }} - {{ formatSalary(job.max_salary) }} VND
            </span>
            <span v-else>Competitive</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Applications</label>
          <div class="form-value">{{ job.applicants || 0 }} candidates have applied</div>
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="section-header">
        <h3 class="text-lg font-semibold">Description</h3>
        <p class="text-sm text-gray-500">Detailed job description</p>
      </div>
      <div class="description-content">
        {{ job.description }}
      </div>
    </div>

    <div class="form-section">
      <div class="section-header">
        <h3 class="text-lg font-semibold">Requirements</h3>
        <p class="text-sm text-gray-500">Required qualifications and skills</p>
      </div>
      <div class="requirements-content">
        <div v-if="Array.isArray(job.requirements)">
          <ul>
            <li v-for="(req, index) in job.requirements" :key="index">{{ req }}</li>
          </ul>
        </div>
        <p v-else>{{ job.requirements }}</p>
      </div>
    </div>

    <div class="form-section" v-if="job.background_criteria || job.project_criteria || job.skill_criteria || job.certification_criteria">
      <div class="section-header">
        <h3 class="text-lg font-semibold">Evaluation Criteria</h3>
        <p class="text-sm text-gray-500">Scoring criteria for candidate evaluation</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-group" v-if="job.background_criteria">
          <label class="form-label">Background Criteria | Weight: {{ job.background_criteria.importance_ratio }}%</label>
          <div class="criteria-content">
            <div class="criteria-header">
              <span class="criteria-required">{{ job.background_criteria.required }}</span>
            </div>
            <ul class="criteria-list">
              <li v-for="(criterion, index) in job.background_criteria.criteria" :key="index">
                {{ criterion.description }} (Max: {{ criterion.max_score }})
              </li>
            </ul>
          </div>
        </div>

        <div class="form-group" v-if="job.project_criteria">
          <label class="form-label">Project Criteria | Weight: {{ job.project_criteria.importance_ratio }}%</label>
          <div class="criteria-content">
            <div class="criteria-header">
              <span class="criteria-required">{{ job.project_criteria.required }}</span>
            </div>
            <ul class="criteria-list">
              <li v-for="(criterion, index) in job.project_criteria.criteria" :key="index">
                {{ criterion.description }} (Max: {{ criterion.max_score }})
              </li>
            </ul>
          </div>
        </div>

        <div class="form-group" v-if="job.skill_criteria">
          <label class="form-label">Skill Criteria | Weight: {{ job.skill_criteria.importance_ratio }}%</label>
          <div class="criteria-content">
            <div class="criteria-header">
              <span class="criteria-required">{{ job.skill_criteria.required }}</span>
            </div>
            <ul class="criteria-list">
              <li v-for="(criterion, index) in job.skill_criteria.criteria" :key="index">
                {{ criterion.description }} (Max: {{ criterion.max_score }})
              </li>
            </ul>
          </div>
        </div>

        <div class="form-group" v-if="job.certification_criteria">
          <label class="form-label">Certification Criteria | Weight: {{ job.certification_criteria.importance_ratio }}%</label>
          <div class="criteria-content">
            <div class="criteria-header">
              <span class="criteria-required">{{ job.certification_criteria.required }}</span>
            </div>
            <ul class="criteria-list">
              <li v-for="(criterion, index) in job.certification_criteria.criteria" :key="index">
                {{ criterion.description }} (Max: {{ criterion.max_score }})
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="section-header">
        <h3 class="text-lg font-semibold">Job Timeline</h3>
        <p class="text-sm text-gray-500">Job posting status and dates</p>
      </div>
      <a-timeline>
        <a-timeline-item :color="getTimelineColor('draft', job.status)">
          <template #dot>
            <file-outlined style="font-size: 16px" />
          </template>
          <div class="timeline-item">
            <div class="timeline-title">Draft</div>
            <div class="timeline-date" v-if="job.created_at">{{ formatDate(job.created_at) }}</div>
            <div class="timeline-description">Job posting created</div>
          </div>
        </a-timeline-item>

        <a-timeline-item :color="getTimelineColor('open', job.status)">
          <template #dot>
            <check-circle-outlined style="font-size: 16px" />
          </template>
          <div class="timeline-item">
            <div class="timeline-title">Open</div>
            <div class="timeline-date" v-if="job.posted_date">{{ formatDate(job.posted_date) }}</div>
            <div class="timeline-description">Job posting is now active and accepting applications</div>
          </div>
        </a-timeline-item>

        <a-timeline-item :color="getTimelineColor('paused', job.status)">
          <template #dot>
            <pause-circle-outlined style="font-size: 16px" />
          </template>
          <div class="timeline-item">
            <div class="timeline-title">Paused</div>
            <div class="timeline-date" v-if="job.paused_date">{{ formatDate(job.paused_date) }}</div>
            <div class="timeline-description">Job posting is temporarily paused</div>
          </div>
        </a-timeline-item>

        <a-timeline-item :color="getTimelineColor('closed', job.status)">
          <template #dot>
            <close-circle-outlined style="font-size: 16px" />
          </template>
          <div class="timeline-item">
            <div class="timeline-title">Closed</div>
            <div class="timeline-date" v-if="job.closed_date">{{ formatDate(job.closed_date) }}</div>
            <div class="timeline-description">Job posting is no longer accepting applications</div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </div>
  </div>
</template>

<script setup>
import { 
  EnvironmentOutlined, 
  CalendarOutlined,
  FundOutlined,
  PlusCircleOutlined,
  FileOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined
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

const getEmploymentTypeColor = (type) => {
  if (!type) return 'blue';
  
  const typeLower = type.toLowerCase();
  if (typeLower === 'full-time') return 'green';
  if (typeLower === 'part-time') return 'orange';
  if (typeLower === 'contract') return 'purple';
  if (typeLower === 'internship') return 'blue';
  
  return 'blue';
}

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

const formatEmploymentType = (type) => {
  if (!type) return 'Unknown';
  return type.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

const formatJobDate = (job) => {
  return formatDate(job.postedDate || job.createdAt)
}

const formatSalary = (amount) => {
  return formatCurrency(amount)
}

const getTimelineColor = (step, currentStatus) => {
  // Standardize status strings to lowercase for reliable comparison
  step = step.toLowerCase();
  currentStatus = currentStatus ? currentStatus.toLowerCase() : '';
  
  // Define the order of job status steps
  const stepsOrder = {
    'draft': 0,
    'open': 1,
    'paused': 2,
    'closed': 3
  }
  
  // If this is the current status
  if (step === currentStatus) {
    if (step === 'closed') return 'red';
    if (step === 'paused') return 'orange';
    if (step === 'open') return 'green';
    return 'blue';
  }
  
  // If this step has been completed
  if (stepsOrder[step] !== undefined && stepsOrder[currentStatus] !== undefined && 
      stepsOrder[step] < stepsOrder[currentStatus]) {
    return 'green';
  }
  
  // If this step is in the future
  if (stepsOrder[step] !== undefined && stepsOrder[currentStatus] !== undefined && 
      stepsOrder[step] > stepsOrder[currentStatus]) {
    return 'gray';
  }
  
  // Default color for unknown states
  return 'gray';
}
</script>

<style scoped>
.job-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-section {
  background: var(--card-bg, white);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px var(--shadow-color, rgba(0, 0, 0, 0.1));
  border: 1px solid var(--border-color, #f0f0f0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 20px;
}

.form-section:hover {
  box-shadow: 0 8px 16px var(--shadow-color, rgba(0, 0, 0, 0.1));
}

.section-header {
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color, #f0f0f0);
  padding-bottom: 12px;
}

.section-header h3 {
  color: var(--text-color, rgba(0, 0, 0, 0.85));
  margin-bottom: 4px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.section-header p {
  color: var(--text-color, rgba(0, 0, 0, 0.45));
  font-size: 14px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.profile-info {
  flex: 1;
}

.job-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

.job-meta {
  display: flex;
  gap: 20px;
  color: #666;
  margin: 8px 0;
}

.job-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.job-status {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color, rgba(0, 0, 0, 0.85));
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}

.form-value {
  color: var(--text-color);
  font-weight: 500;
  padding: 8px 12px;
  background-color: var(--hover-color);
  border-radius: 6px;
}

.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.md\:grid-cols-2 {
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.gap-6 {
  gap: 1.5rem;
}

.description-content,
.requirements-content {
  padding: 12px;
  background-color: var(--hover-color);
  border-radius: 6px;
  color: var(--text-color);
  white-space: pre-wrap;
}

.criteria-content {
  padding: 12px;
  background-color: var(--hover-color);
  border-radius: 6px;
}

.criteria-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.criteria-ratio {
  color: var(--text-color);
  font-weight: 500;
}

.criteria-required {
  color: var(--text-color);
  opacity: 0.65;
}

.criteria-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.criteria-list li {
  padding: 4px 0;
  border-bottom: 1px solid var(--border-color);
}

.criteria-list li:last-child {
  border-bottom: none;
}

.timeline-item {
  padding: 4px 0;
}

.timeline-title {
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 4px;
}

.timeline-date {
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.65;
  margin-bottom: 4px;
}

.timeline-description {
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.8;
}

:deep(.ant-timeline-item-tail) {
  border-left: 2px solid var(--border-color);
}

:deep(.ant-timeline-item-head) {
  background-color: var(--card-bg);
  border-color: var(--border-color);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --text-color: rgba(255, 255, 255, 0.85);
    --border-color: #303030;
    --card-bg: #1f1f1f;
    --input-bg: #141414;
    --hover-bg: #303030;
    --shadow-color: rgba(0, 0, 0, 0.3);
  }
}

/* Light mode variables */
:root {
  --text-color: rgba(0, 0, 0, 0.85);
  --border-color: #f0f0f0;
  --card-bg: white;
  --input-bg: white;
  --hover-bg: #f5f5f5;
  --shadow-color: rgba(0, 0, 0, 0.1);
}
</style> 