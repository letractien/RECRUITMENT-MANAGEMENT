<template>
  <a-card class="recent-applications" :bordered="false">
    <template #title>
      <div class="card-header">
        <span>Recent Applications</span>
      </div>
    </template>
    
    <a-spin v-if="isLoading" class="centered-spinner" />
    <a-empty v-else-if="applications.length === 0" description="No recent applications" />
    <a-table
      v-else
      :columns="columns"
      :data-source="applications"
      :pagination="pagination"
      :loading="isLoading"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, text }">
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(text)">
            {{ text }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'appliedDate'">
          {{ formatDate(text, 'YYYY-MM-DD HH:mm') }}
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup>
import { formatDate } from '../../../shared/utils/dateHelpers.js'

const props = defineProps({
  applications: {
    type: Array,
    required: true,
    default: () => []
  },
  pagination: {
    type: Object,
    required: true,
    default: () => ({})
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['pageChange', 'sizeChange'])

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
  },
]

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

const handleTableChange = (pagination) => {
  if (pagination.current !== props.pagination.current) {
    emit('pageChange', pagination.current)
  }
  if (pagination.pageSize !== props.pagination.pageSize) {
    emit('sizeChange', pagination.current, pagination.pageSize)
  }
}
</script>

<style scoped>
.recent-applications {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-color);
  background-color: var(--card-bg);
}

.recent-applications :deep(.ant-card-head) {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.recent-applications :deep(.ant-card-body) {
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

.centered-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

:deep(.ant-table) {
  background-color: var(--card-bg);
}

:deep(.ant-table-thead > tr > th) {
  background-color: var(--card-bg);
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
}

:deep(.ant-table-tbody > tr > td) {
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: var(--hover-color);
}

:deep(.ant-pagination-item) {
  background-color: var(--card-bg);
  border-color: var(--border-color);
}

:deep(.ant-pagination-item a) {
  color: var(--text-color);
}

:deep(.ant-pagination-item-active) {
  background-color: #1890ff;
  border-color: #1890ff;
}

:deep(.ant-pagination-item-active a) {
  color: white;
}

:deep(.ant-pagination-prev button),
:deep(.ant-pagination-next button) {
  background-color: var(--card-bg);
  border-color: var(--border-color);
  color: var(--text-color);
}

:deep(.ant-pagination-options) {
  color: var(--text-color);
}

:deep(.ant-pagination-options-quick-jumper input) {
  background-color: var(--card-bg);
  border-color: var(--border-color);
  color: var(--text-color);
}
</style> 