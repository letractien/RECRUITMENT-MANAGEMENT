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

    <div class="stats-grid">
      <a-card class="stat-card" :bordered="false" hoverable>
        <div class="stat-content primary">
          <div class="stat-header">Active Jobs</div>
          <div class="stat-value">{{ dashboardStats.activeJobs }}</div>
          <div :class="['stat-change', dashboardStats.activeJobsChange >= 0 ? 'positive' : 'negative']">
            <arrow-up-outlined v-if="dashboardStats.activeJobsChange >= 0" />
            <arrow-down-outlined v-else />
            {{ Math.abs(dashboardStats.activeJobsChange) }} this {{ timeRange }}
          </div>
        </div>
      </a-card>
      
      <a-card class="stat-card" :bordered="false" hoverable>
        <div class="stat-content success">
          <div class="stat-header">New Applications</div>
          <div class="stat-value">{{ formatNumber(dashboardStats.newApplications) }}</div>
          <div :class="['stat-change', dashboardStats.applicationsChange >= 0 ? 'positive' : 'negative']">
            <arrow-up-outlined v-if="dashboardStats.applicationsChange >= 0" />
            <arrow-down-outlined v-else />
            {{ Math.abs(dashboardStats.applicationsChange) }}% from last period
          </div>
        </div>
      </a-card>
      
      <a-card class="stat-card" :bordered="false" hoverable>
        <div class="stat-content warning">
          <div class="stat-header">Interviews</div>
          <div class="stat-value">{{ formatNumber(dashboardStats.scheduledInterviews) }}</div>
          <div :class="['stat-change', dashboardStats.interviewsChange >= 0 ? 'positive' : 'negative']">
            <arrow-up-outlined v-if="dashboardStats.interviewsChange >= 0" />
            <arrow-down-outlined v-else />
            {{ Math.abs(dashboardStats.interviewsChange) }}% from last period
          </div>
        </div>
      </a-card>
      
      <a-card class="stat-card" :bordered="false" hoverable>
        <div class="stat-content danger">
          <div class="stat-header">Positions Filled</div>
          <div class="stat-value">{{ formatNumber(dashboardStats.positionsFilled) }}</div>
          <div :class="['stat-change', dashboardStats.filledChange >= 0 ? 'positive' : 'negative']">
            <arrow-up-outlined v-if="dashboardStats.filledChange >= 0" />
            <arrow-down-outlined v-else />
            {{ Math.abs(dashboardStats.filledChange) }}% from last period
          </div>
        </div>
      </a-card>
    </div>

    <div class="chart-section">
      <a-row :gutter="16">
        <a-col :xs="24" :md="16">
          <a-card :bordered="false" class="chart-card">
            <template #title>
              <div class="chart-header">
                <span>Jobs by Department</span>
                <div class="chart-actions">
                  <a-radio-group 
                    v-model:value="deptSortBy" 
                    size="small" 
                    buttonStyle="solid"
                  >
                    <a-radio-button value="count">Count</a-radio-button>
                    <a-radio-button value="alphabetical">A-Z</a-radio-button>
                  </a-radio-group>
                </div>
              </div>
            </template>
            <div v-if="isLoading" class="chart-loading">
              <a-spin />
            </div>
            <div v-else-if="jobsByDepartment.length === 0" class="chart-placeholder">
              <bar-chart-outlined />
              <p>No department data available</p>
            </div>
            <div v-else class="department-chart">
              <div class="dept-total">Total: {{ totalDeptJobs }} Jobs</div>
              <div 
                v-for="dept in sortedDepartments" 
                :key="dept.department" 
                class="dept-bar-container"
                :class="{ 'highlight': hoveredDept === dept.department }"
                @mouseenter="hoveredDept = dept.department"
                @mouseleave="hoveredDept = null"
              >
                <div class="dept-label">{{ dept.department }}</div>
                <div class="dept-bar-wrapper">
                  <div 
                    class="dept-bar" 
                    :style="{ width: `${Math.min(100, (dept.count / maxDeptCount) * 100)}%` }"
                    :class="getDepartmentColorClass(dept.department)"
                  ></div>
                  <div class="dept-stats">
                    <span class="dept-count">{{ dept.count }}</span>
                    <span class="dept-percent">{{ calculateDeptPercent(dept.count) }}%</span>
                  </div>
                </div>
              </div>
              <div class="dept-legend">
                <div 
                  v-for="(dept, index) in topDepartments" 
                  :key="dept.department" 
                  class="legend-item"
                >
                  <div 
                    class="legend-color" 
                    :class="`dept-color-${index % 8}`"
                  ></div>
                  <span class="legend-label">{{ dept.department }}</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :xs="24" :md="8">
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
        </a-col>
      </a-row>
    </div>

    <div class="dashboard-grid">
      <a-card class="recent-applications" :bordered="false">
        <template #title>
          <div class="card-header">
            <span>Recent Applications</span>
          </div>
        </template>
        
        <a-table 
          :dataSource="recentApplications" 
          :columns="columns" 
          :pagination="false"
          size="middle"
          :rowClassName="() => 'table-row'"
          :loading="isLoading"
        />
        
        <div class="pagination-container">
          <a-pagination
            v-model:current="pagination.currentPage"
            v-model:pageSize="pagination.pageSize"
            :total="pagination.total"
            :pageSizeOptions="['10', '20', '50', '100']"
            showSizeChanger
            showQuickJumper
            :showTotal="total => `Total ${total} items`"
            @change="handlePageChange"
            @showSizeChange="handleSizeChange"
          />
        </div>
      </a-card>

      <a-card class="upcoming-interviews" :bordered="false">
        <template #title>
          <div class="card-header">
            <span>Upcoming Interviews</span>
          </div>
        </template>
        
        <a-spin v-if="isLoading" />
        <a-empty v-else-if="upcomingInterviews.length === 0" description="No upcoming interviews" />
        <a-timeline v-else>
          <a-timeline-item
            v-for="interview in upcomingInterviews"
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, h } from 'vue'
import { resolveComponent } from 'vue'
import { useStore } from 'vuex'
import { 
  BarChartOutlined, 
  PieChartOutlined, 
  LineChartOutlined, 
  DownloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FundOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { formatNumber } from '../../../shared/utils/formatHelpers.js'
import { formatDate } from '../../../shared/utils/dateHelpers.js'

const store = useStore()
const timeRange = ref('month')
const deptSortBy = ref('count')
const hoveredDept = ref(null)

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

// Calculate the maximum count for department chart scaling
const maxDeptCount = computed(() => {
  if (jobsByDepartment.value.length === 0) return 0
  return Math.max(...jobsByDepartment.value.map(dept => dept.count))
})

// Calculate total applications across all departments for percentage calculation
const totalDeptJobs = computed(() => {
  if (jobsByDepartment.value.length === 0) return 0
  return jobsByDepartment.value.reduce((total, dept) => total + dept.count, 0)
})

// Sort departments by count (descending) or alphabetically
const sortedDepartments = computed(() => {
  if (jobsByDepartment.value.length === 0) return []
  
  return [...jobsByDepartment.value].sort((a, b) => {
    if (deptSortBy.value === 'alphabetical') {
      return a.department.localeCompare(b.department)
    } else {
      // Default sort by count in descending order
      return b.count - a.count
    }
  })
})

// Get top 5 departments for the legend
const topDepartments = computed(() => {
  return [...jobsByDepartment.value]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

// Calculate percentage for a department
const calculateDeptPercent = (count) => {
  if (totalDeptJobs.value === 0) return 0
  return ((count / totalDeptJobs.value) * 100).toFixed(1)
}

// Handler for time range changes
const handleTimeRangeChange = (value) => {
  store.dispatch('dashboard/setTimeRange', value)
}

const columns = [
  {
    title: 'Candidate',
    dataIndex: 'candidate',
    key: 'candidate',
  },
  {
    title: 'Position',
    dataIndex: 'position',
    key: 'position',
  },
  {
    title: 'Applied Date',
    dataIndex: 'appliedDate',
    key: 'appliedDate',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    customRender: ({ text }) => {
      const color = getStatusColor(text);
      return h(resolveComponent('a-tag'), { color }, () => text);
    }
  },
]

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

// Format interview date using the shared date helper
const formatInterviewDate = (dateString) => {
  return formatDate(dateString, 'YYYY-MM-DD HH:mm');
}

// Department color generator
const getDepartmentColorClass = (department) => {
  const departments = [
    'Engineering', 'Product', 'Design', 'Marketing', 
    'Sales', 'HR', 'Finance', 'Operations'
  ]
  const index = departments.indexOf(department)
  return `dept-color-${index % 8}`
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
  .stat-card,
  .chart-card,
  .recent-applications,
  .upcoming-interviews {
    forced-color-adjust: none;
  }
  
  .dept-bar,
  .funnel-bar,
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

/* Enhanced Department chart styles */
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.department-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 300px;
  padding: 16px 0;
  position: relative;
}

.dept-total {
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.7;
  text-align: right;
  margin-bottom: 8px;
  font-weight: 500;
}

.dept-bar-container {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.dept-bar-container.highlight {
  background-color: var(--hover-color);
}

.dept-label {
  min-width: 120px;
  font-weight: 500;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dept-bar-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dept-bar {
  height: 24px;
  border-radius: 4px;
  transition: width 0.5s ease, box-shadow 0.3s ease;
  background-color: #1890ff;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dept-bar-container.highlight .dept-bar {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

.dept-stats {
  display: flex;
  flex-direction: column;
  min-width: 80px;
}

.dept-count {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-color);
}

.dept-percent {
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.6;
}

.dept-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--border-color);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-label {
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.8;
}

/* Department color classes */
.dept-color-0 { background-color: #1890ff; }
.dept-color-1 { background-color: #52c41a; }
.dept-color-2 { background-color: #faad14; }
.dept-color-3 { background-color: #f5222d; }
.dept-color-4 { background-color: #722ed1; }
.dept-color-5 { background-color: #13c2c2; }
.dept-color-6 { background-color: #eb2f96; }
.dept-color-7 { background-color: #fa8c16; }

/* Funnel chart styles */
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

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.recent-applications, .upcoming-interviews {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-color);
  background-color: var(--card-bg);
}

.recent-applications :deep(.ant-card-head),
.upcoming-interviews :deep(.ant-card-head) {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.recent-applications :deep(.ant-card-body),
.upcoming-interviews :deep(.ant-card-body) {
  background-color: var(--card-bg);
}

.recent-applications :deep(.ant-table) {
  background-color: var(--card-bg);
}

.recent-applications :deep(.ant-table-thead > tr > th) {
  background-color: var(--card-bg);
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
}

.recent-applications :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
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

.pagination-container {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  padding: 12px;
}

.table-row:hover {
  background-color: var(--hover-color) !important;
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
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
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