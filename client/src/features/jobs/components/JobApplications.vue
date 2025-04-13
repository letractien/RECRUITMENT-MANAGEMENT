<template>
  <div class="job-applications">
    <a-card class="applications-card">
      <template #extra>
        <a-space>
          <a-input-search
            v-model:value="searchText"
            placeholder="Search applications..."
            style="width: 200px"
            @search="onSearch"
          />
          <a-select
            v-model:value="statusFilter"
            style="width: 120px"
            placeholder="Status"
            allowClear
            @change="onStatusFilterChange"
          >
            <a-select-option value="Pending">Pending</a-select-option>
            <a-select-option value="Hired">Hired</a-select-option>
            <a-select-option value="Rejected">Rejected</a-select-option>
            <a-select-option value="Interviewing">Interviewing</a-select-option>
          </a-select>
          <a-button type="primary" @click="refreshApplications">
            <template #icon><ReloadOutlined /></template>
            Refresh
          </a-button>
        </a-space>
      </template>

      <a-spin :spinning="loading">
        <a-table
          :columns="columns"
          :data-source="filteredApplications"
          :pagination="pagination"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ record.status }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" @click="viewApplicationDetails(record)">
                  View Details
                </a-button>
                <a-button 
                  type="link" 
                  :disabled="record.status === 'Hired'"
                  @click="updateApplicationStatus(record, 'Hired')"
                >
                  Hire
                </a-button>
                <a-button 
                  type="link" 
                  danger
                  :disabled="record.status === 'Rejected'"
                  @click="updateApplicationStatus(record, 'Rejected')"
                >
                  Reject
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-spin>
    </a-card>

    <!-- Application Details Modal -->
    <a-modal
      v-model:visible="showDetailsModal"
      :title="'Application Details - ' + (selectedApplication?.candidateName || '')"
      width="800px"
      @cancel="closeDetailsModal"
    >
      <template v-if="selectedApplication">
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
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
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

// Function to load job applications
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

// Filter applications based on search text and status
const filteredApplications = computed(() => {
  let applications = store.getters['jobs/jobApplications'];
  
  // Apply search filter
  if (searchText.value) {
    const searchTerm = searchText.value.toLowerCase();
    applications = applications.filter(app => 
      app.candidateName.toLowerCase().includes(searchTerm) ||
      app.email.toLowerCase().includes(searchTerm) ||
      app.phone.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply status filter
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
  // TODO: Implement resume download functionality
  message.info('Downloading resume...');
};

// Refresh applications
const refreshApplications = () => {
  loadJobApplications(props.jobId);
};

</script>

<style scoped>
.job-applications {
  padding: 0;
}

.applications-card {
  margin-bottom: 0;
  border: none;
  box-shadow: none;
}

:deep(.ant-descriptions-item-label) {
  width: 200px;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.ant-table-row:hover) {
  background-color: #f5f5f5;
}

:deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

:deep(.ant-card-body) {
  padding: 24px;
}
</style> 