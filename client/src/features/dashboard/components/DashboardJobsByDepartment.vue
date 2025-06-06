<template>
  <a-card :bordered="false" class="chart-card">
    <template #title>
      <div class="chart-header">
        <span>Jobs</span>
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { BarChartOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  jobsByDepartment: {
    type: Array,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const deptSortBy = ref('count')
const hoveredDept = ref(null)

// Calculate the maximum count for department chart scaling
const maxDeptCount = computed(() => {
  if (props.jobsByDepartment.length === 0) return 0
  return Math.max(...props.jobsByDepartment.map(dept => dept.count))
})

// Calculate total applications across all departments for percentage calculation
const totalDeptJobs = computed(() => {
  if (props.jobsByDepartment.length === 0) return 0
  return props.jobsByDepartment.reduce((total, dept) => total + dept.count, 0)
})

// Sort departments by count (descending) or alphabetically
const sortedDepartments = computed(() => {
  if (props.jobsByDepartment.length === 0) return []
  
  return [...props.jobsByDepartment].sort((a, b) => {
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
  return [...props.jobsByDepartment]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

// Calculate percentage for a department
const calculateDeptPercent = (count) => {
  if (totalDeptJobs.value === 0) return 0
  return ((count / totalDeptJobs.value) * 100).toFixed(1)
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
</style> 