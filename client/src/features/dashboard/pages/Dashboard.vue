<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>Recruitment Dashboard</h2>
      <div class="actions">
        <a-select
          v-model:value="timeRange"
          style="width: 150px"
          @change="handleTimeRangeChange"
        >
          <a-select-option value="week">This Week</a-select-option>
          <a-select-option value="month">This Month</a-select-option>
          <a-select-option value="quarter">This Quarter</a-select-option>
          <a-select-option value="year">This Year</a-select-option>
        </a-select>
      </div>
    </div>

    <dashboard-stats :stats="dashboardStats" :time-range="timeRange" />

    <div class="chart-section">
      <a-row :gutter="16">
        <a-col :xs="24" :md="16">
          <dashboard-jobs-by-department 
            :jobs-by-department="jobsByDepartment"
            :is-loading="isLoading"
          />
        </a-col>
        <a-col :xs="24" :md="8">
          <dashboard-hiring-funnel 
            :hiring-funnel="hiringFunnel"
            :is-loading="isLoading"
          />
        </a-col>
      </a-row>
    </div>

    <div class="dashboard-grid">
      <dashboard-recent-applications
        :applications="recentApplications"
        :pagination="pagination"
        :is-loading="isLoading"
        @pageChange="handlePageChange"
        @sizeChange="handleSizeChange"
      />

      <dashboard-upcoming-interviews
        :interviews="upcomingInterviews"
        :is-loading="isLoading"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
import DashboardStats from '../components/DashboardStats.vue'
import DashboardJobsByDepartment from '../components/DashboardJobsByDepartment.vue'
import DashboardHiringFunnel from '../components/DashboardHiringFunnel.vue'
import DashboardRecentApplications from '../components/DashboardRecentApplications.vue'
import DashboardUpcomingInterviews from '../components/DashboardUpcomingInterviews.vue'

const store = useStore()
const timeRange = ref('month')

// Load dashboard data on mount
onMounted(async () => {
  try {
    await store.dispatch('dashboard/fetchDashboardData')
    // Also load interviews for the upcoming interviews section
    await store.dispatch('interviews/fetchInterviews')
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    // Show error message to user
    message.error('Failed to load dashboard data. Please check your connection or try again later.')
  }
})

// Get data from Vuex store
const dashboardStats = computed(() => store.getters['dashboard/dashboardStats'])
const jobsByDepartment = computed(() => store.getters['dashboard/jobsByDepartment'])
const hiringFunnel = computed(() => store.getters['dashboard/hiringFunnel'])
const isLoading = computed(() => store.getters['dashboard/isLoading'])
const recentApplications = computed(() => store.getters['dashboard/recentApplications'])
const pagination = computed(() => store.getters['dashboard/pagination'])
const upcomingInterviews = computed(() => store.getters['dashboard/upcomingInterviews'])

// Handler for time range changes
const handleTimeRangeChange = (value) => {
  store.dispatch('dashboard/setTimeRange', value)
}

// Pagination handlers
const handlePageChange = (page) => {
  store.dispatch('dashboard/setPage', page)
}

const handleSizeChange = (current, size) => {
  store.dispatch('dashboard/setPageSize', size)
}
</script>

<style scoped>
/* Override deprecated -ms-high-contrast */
@media (forced-colors: active) {
  .chart-card,
  .upcoming-interviews {
    forced-color-adjust: none;
  }
  
  .custom-dot {
    forced-color-adjust: none;
  }
}

.dashboard {
  padding: 4px;
  animation: fadeIn 0.3s ease-in-out;
  height: calc(100vh - 64px);
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--bg-color);
  color: var(--text-color);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 12px;
}

.chart-section {
  margin-bottom: 24px;
}

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

.centered-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
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

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

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

/* Responsive */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 16px;
  }

  .chart-section {
    margin-bottom: 24px;
  }

  .chart-section :deep(.ant-row) {
    margin: 0 !important;
  }

  .chart-section :deep(.ant-col) {
    margin-bottom: 24px;
  }

  .chart-section :deep(.ant-col:last-child) {
    margin-bottom: 0;
  }
}
</style> 