<template>
  <div class="job-applications">
    <div class="applications-header">
      <div class="header-actions">
        <a-input
          v-model:value="searchText"
          placeholder="Search applications..."
          class="search-input"
          @change="onSearch"
        >
          <template #prefix><search-outlined /></template>
        </a-input>
        <a-select
          v-model:value="statusFilter"
          placeholder="Status"
          class="status-filter"
          allowClear
          @change="onStatusFilterChange"
        >
          <a-select-option value="Pending">
            <span class="status-option">
              <span class="status-dot pending"></span>
              Pending
            </span>
          </a-select-option>
          <a-select-option value="Hired">
            <span class="status-option">
              <span class="status-dot hired"></span>
              Hired
            </span>
          </a-select-option>
          <a-select-option value="Rejected">
            <span class="status-option">
              <span class="status-dot rejected"></span>
              Rejected
            </span>
          </a-select-option>
          <a-select-option value="Interviewing">
            <span class="status-option">
              <span class="status-dot interviewing"></span>
              Interviewing
            </span>
          </a-select-option>
        </a-select>
        <a-button type="primary" class="refresh-btn" @click="refreshApplications">
          <template #icon><ReloadOutlined /></template>
          Refresh
        </a-button>
      </div>
    </div>

    <div class="applications-content">
      <a-spin :spinning="loading">
        <a-table
          :columns="columns"
          :data-source="filteredApplications"
          :pagination="pagination"
          @change="handleTableChange"
          class="applications-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)" class="status-tag">
                {{ record.status }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="view" @click="viewApplicationDetails(record)">
                      <template #icon><eye-outlined /></template>
                      View Details
                    </a-menu-item>
                    <a-menu-item 
                      key="hire" 
                      :disabled="record.status === 'Hired'"
                      @click="updateApplicationStatus(record, 'Hired')"
                    >
                      <template #icon><check-outlined /></template>
                      Hire
                    </a-menu-item>
                    <a-menu-item 
                      key="reject" 
                      danger
                      :disabled="record.status === 'Rejected'"
                      @click="updateApplicationStatus(record, 'Rejected')"
                    >
                      <template #icon><close-outlined /></template>
                      Reject
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="primary" size="small">
                  Actions <down-outlined />
                </a-button>
              </a-dropdown>
            </template>
          </template>
        </a-table>
      </a-spin>
    </div>

    <!-- Application Details Modal -->
    <a-modal
      v-model:visible="showDetailsModal"
      :title="'Application Details - ' + (selectedApplication?.candidateName || '')"
      width="800px"
      @cancel="closeDetailsModal"
      class="details-modal"
    >
      <template v-if="selectedApplication">
        <div class="details-content">
          <a-descriptions bordered>
            <a-descriptions-item label="Candidate Name" :span="3">
              {{ selectedApplication.candidateName }}
            </a-descriptions-item>
            <a-descriptions-item label="Email" :span="3">
              {{ selectedApplication.email }}
            </a-descriptions-item>
            <a-descriptions-item label="Phone" :span="3">
              {{ selectedApplication.phone }}
            </a-descriptions-item>
            <a-descriptions-item label="Current Status" :span="3">
              <a-tag :color="getStatusColor(selectedApplication.status)">
                {{ selectedApplication.status }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="Applied Date" :span="3">
              {{ formatDate(selectedApplication.appliedDate) }}
            </a-descriptions-item>
            <a-descriptions-item label="Resume" :span="3">
              <a-button type="link" @click="downloadResume(selectedApplication)">
                Download Resume
              </a-button>
            </a-descriptions-item>
            <a-descriptions-item label="Cover Letter" :span="3">
              {{ selectedApplication.coverLetter }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { 
  ReloadOutlined, 
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  DownOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useStore } from 'vuex';

const store = useStore();
const loading = computed(() => store.state.jobs.loading);
const showDetailsModal = ref(false);
const selectedApplication = ref(null);
const searchText = ref('');
const statusFilter = ref(null);

const columns = [
  {
    title: 'Candidate Name',
    dataIndex: 'candidateName',
    key: 'candidateName',
    sorter: (a, b) => a.candidateName.localeCompare(b.candidateName),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    sorter: (a, b) => a.email.localeCompare(b.email),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    filters: [
      { text: 'Pending', value: 'Pending' },
      { text: 'Hired', value: 'Hired' },
      { text: 'Rejected', value: 'Rejected' },
      { text: 'Interviewing', value: 'Interviewing' },
    ],
    onFilter: (value, record) => record.status === value,
  },
  {
    title: 'Applied Date',
    dataIndex: 'appliedDate',
    key: 'appliedDate',
    sorter: (a, b) => new Date(a.appliedDate) - new Date(b.appliedDate),
  },
  {
    title: 'Action',
    key: 'action',
  },
];

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
});

const props = defineProps({
  jobId: {
    type: String,
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  }
});

watch(() => props.jobId, (newJobId) => {
  loadJobApplications(newJobId);
});

onMounted(() => {
  loadJobApplications(props.jobId);
});

const loadJobApplications = (jobId) => {
  if (jobId) {
    try {
      store.dispatch('jobs/fetchJobApplications', jobId)
    } catch (error) {
      console.error('Error loading jobs:', error)
      message.error('Failed to load jobs. Please try again later.')
    }
  }
};

const filteredApplications = computed(() => {
  let applications = store.getters['jobs/jobApplications'];
  
  if (searchText.value) {
    const searchTerm = searchText.value.toLowerCase();
    applications = applications.filter(app => 
      app.candidateName.toLowerCase().includes(searchTerm) ||
      app.email.toLowerCase().includes(searchTerm) ||
      app.phone.toLowerCase().includes(searchTerm)
    );
  }
  
  if (statusFilter.value) {
    applications = applications.filter(app => app.status === statusFilter.value);
  }
  
  return applications;
});

const getStatusColor = (status) => {
  const colors = {
    'Pending': 'orange',
    'Hired': 'green',
    'Rejected': 'red',
    'Interviewing': 'blue'
  };
  return colors[status] || 'default';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const handleTableChange = (pag, filters, sorter) => {
  pagination.value = pag;
};

const onSearch = (value) => {
  searchText.value = value;
  store.dispatch('jobs/setApplicationFilters', { search: value });
};

const onStatusFilterChange = (value) => {
  statusFilter.value = value;
  store.dispatch('jobs/setApplicationFilters', { status: value });
};

const viewApplicationDetails = (application) => {
  selectedApplication.value = application;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedApplication.value = null;
};

const updateApplicationStatus = async (application, newStatus) => {
  try {
    await store.dispatch('jobs/updateApplicationStatus', {
      jobId: props.jobId,
      applicationId: application.id,
      status: newStatus
    });
    message.success(`Application status updated to ${newStatus}`);
  } catch (error) {
    message.error('Failed to update application status');
    console.error(error);
  }
};

const downloadResume = (application) => {
  message.info('Downloading resume...');
};

const refreshApplications = () => {
  loadJobApplications(props.jobId);
};
</script>

<style scoped>
.job-applications {
  padding: 24px;
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.applications-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 250px;
}

.status-filter {
  width: 150px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.applications-content {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 16px;
}

.applications-table {
  background-color: var(--card-bg);
}

.status-tag {
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.details-modal {
  border-radius: 12px;
}

.details-content {
  padding: 24px;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.pending {
  background-color: #faad14;
}

.status-dot.hired {
  background-color: #52c41a;
}

.status-dot.rejected {
  background-color: #ff4d4f;
}

.status-dot.interviewing {
  background-color: #1890ff;
}

:deep(.ant-table-thead > tr > th) {
  background-color: var(--card-bg);
  color: var(--text-color);
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
}

:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: var(--hover-color);
}

:deep(.ant-descriptions-item-label) {
  color: var(--text-color);
  font-weight: 500;
}

:deep(.ant-descriptions-item-content) {
  color: var(--text-color);
}

:deep(.ant-modal-content) {
  background-color: var(--card-bg);
  border-radius: 12px;
}

:deep(.ant-modal-header) {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

:deep(.ant-modal-title) {
  color: var(--text-color);
}

:deep(.ant-modal-footer) {
  background-color: var(--card-bg);
  border-top: 1px solid var(--border-color);
}

:deep(.ant-input) {
  background-color: var(--input-bg);
  border-color: var(--border-color);
  color: var(--text-color);
}

:deep(.ant-select-selector) {
  background-color: var(--input-bg);
  border-color: var(--border-color);
}

:deep(.ant-select-selection-item) {
  color: var(--text-color);
}

:deep(.ant-pagination-item) {
  background-color: var(--card-bg);
  border-color: var(--border-color);
}

:deep(.ant-pagination-item a) {
  color: var(--text-color);
}

:deep(.ant-pagination-item-active) {
  border-color: #1890ff;
}

:deep(.ant-pagination-item-active a) {
  color: #1890ff;
}
</style> 