<template>
  <a-card>
    <div class="toolbar">
      <a-input
        v-model:value="searchText"
        placeholder="Search candidates..."
        style="max-width: 300px"
        @change="onSearch"
      >
        <template #prefix><search-outlined /></template>
      </a-input>
      <a-select
        v-model:value="statusFilter"
        placeholder="Status"
        style="width: 200px"
        allowClear
        @change="onStatusFilterChange"
      >
        <a-select-option value="">All</a-select-option>
        <a-select-option value="new">New</a-select-option>
        <a-select-option value="screening">Screening</a-select-option>
        <a-select-option value="interview">Interview</a-select-option>
        <a-select-option value="offer">Offer</a-select-option>
        <a-select-option value="hired">Hired</a-select-option>
        <a-select-option value="rejected">Rejected</a-select-option>
      </a-select>
    </div>

    <a-spin :spinning="loading">
      <a-table
        :dataSource="filteredApplications"
        :columns="columns"
        :pagination="false"
        size="middle"
        :scroll="{ y: 405 }"
        :rowKey="record => record.id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'candidate'">
            <div class="candidate-info" @click="viewCandidate(record)" style="cursor: pointer">
              <a-avatar :size="32">
                {{ record.candidateName ? record.candidateName.charAt(0).toUpperCase() : 'U' }}
              </a-avatar>
              <div class="candidate-details">
                <div class="candidate-name">{{ record.candidateName }}</div>
                <div class="candidate-email">{{ record.email }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ record.status }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'experience'">
            {{ record.experience }} years
          </template>
          <template v-else-if="column.key === 'total_score'">
            <div class="score-display">
              <span class="score-value">{{ record.totalScore || 0 }}</span>
              <span class="score-max">/100</span>
            </div>
          </template>
          <template v-else-if="column.key === 'applied_date'">
            {{ formatDate(record.appliedDate) }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-dropdown>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="view" @click="viewCandidate(record)">
                    <template #icon><eye-outlined /></template>
                    View Profile
                  </a-menu-item>
                  <a-menu-item key="score" @click="updateScores(record)">
                    <template #icon><trophy-outlined /></template>
                    Update Scores
                  </a-menu-item>
                  <a-menu-item key="schedule" @click="scheduleInterview(record)">
                    <template #icon><calendar-outlined /></template>
                    Schedule Interview
                  </a-menu-item>
                  <a-menu-item key="status" @click="updateStatus(record)">
                    <template #icon><edit-outlined /></template>
                    Update Status
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="delete" danger @click="deleteApplication(record)">
                    <template #icon><delete-outlined /></template>
                    Delete
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

    <div class="pagination-container">
      <a-pagination
        v-model:current="pagination.current"
        v-model:pageSize="pagination.pageSize"
        :total="filteredApplications.length"
        :pageSizeOptions="['10', '20', '50', '100']"
        showSizeChanger
        showQuickJumper
        :showTotal="total => `Total ${total} items`"
        @change="handleCurrentChange"
        @showSizeChange="handleSizeChange"
      />
    </div>
  </a-card>

  <!-- View Profile Dialog -->
  <CandidateViewProfile
    v-model:visible="viewProfileDialog.visible"
    :candidate="viewProfileDialog.candidate"
  />

  <!-- Add Score Dialog -->
  <UpdateScoresCandidate
    v-model:visible="scoreDialog.visible"
    :candidate="scoreDialog.candidate"
    @saved="loadJobApplications(props.jobId)"
  />

  <!-- Schedule Interview Dialog -->
  <CandidateMakeScheduleInterview
    v-model:visible="scheduleInterviewDialog.visible"
    :candidate="scheduleInterviewDialog.candidate"
    @saved="loadJobApplications(props.jobId)"
  />

  <!-- Update Status Dialog -->
  <CandidateUpdateStatus
    v-model:visible="updateStatusDialog.visible"
    :candidate="updateStatusDialog.candidate"
    @saved="loadJobApplications(props.jobId)"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { 
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
  TrophyOutlined,
  CalendarOutlined
} from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import { useStore } from 'vuex';

// Import the same components used in Candidates.vue
import CandidateViewProfile from '../../../features/candidates/components/CandidateViewProfile.vue';
import UpdateScoresCandidate from '../../../features/candidates/components/CandidateUpdateScores.vue';
import CandidateMakeScheduleInterview from '../../../features/candidates/components/CandidateMakeScheduleInterview.vue';
import CandidateUpdateStatus from '../../../features/candidates/components/CandidateUpdateStatus.vue';

const store = useStore();
const loading = computed(() => store.state.jobs.loading);
const searchText = ref('');
const statusFilter = ref('');
const showDetailsModal = ref(false);
const selectedApplication = ref(null);

// Pagination
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
});

// Use the same reactive dialogs as in Candidates.vue
const viewProfileDialog = reactive({
  visible: false,
  candidate: null
});

const scoreDialog = reactive({
  visible: false,
  candidate: null
});

const scheduleInterviewDialog = reactive({
  visible: false,
  candidate: null
});

const updateStatusDialog = reactive({
  visible: false,
  candidate: null
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

// Table columns
const columns = [
  {
    title: 'Candidate',
    dataIndex: 'candidate',
    key: 'candidate',
    width: 250,
    sorter: (a, b) => (a.candidateName || '').localeCompare(b.candidateName || ''),
  },
  {
    title: 'Total Score',
    key: 'total_score',
    width: 120,
    sorter: (a, b) => (a.totalScore || 0) - (b.totalScore || 0),
  },
  {
    title: 'Status',
    key: 'status',
    width: 120,
    sorter: (a, b) => a.status.localeCompare(b.status),
  },
  {
    title: 'Applied Date',
    key: 'applied_date',
    width: 120,
    sorter: (a, b) => new Date(a.appliedDate) - new Date(b.appliedDate),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
];

// Get applications from store with filters applied
const filteredApplications = computed(() => {
  let applications = store.getters['jobs/jobApplications'];
  
  if (searchText.value) {
    const searchTerm = searchText.value.toLowerCase();
    applications = applications.filter(app => 
      (app.candidateName && app.candidateName.toLowerCase().includes(searchTerm)) ||
      (app.email && app.email.toLowerCase().includes(searchTerm))
    );
  }
  
  if (statusFilter.value) {
    applications = applications.filter(app => 
      app.status && app.status.toLowerCase() === statusFilter.value.toLowerCase()
    );
  }
  
  return applications;
});

watch(() => props.jobId, (newJobId) => {
  if (newJobId) {
    loadJobApplications(newJobId);
  }
});

onMounted(() => {
  if (props.jobId) {
    loadJobApplications(props.jobId);
  }
});

const loadJobApplications = (jobId) => {
  if (jobId) {
    try {
      store.dispatch('jobs/fetchJobApplications', jobId);
    } catch (error) {
      console.error('Error loading applications:', error);
      message.error('Failed to load applications. Please try again later.');
    }
  }
};

const onSearch = () => {
  store.dispatch('jobs/setApplicationFilters', { search: searchText.value });
  pagination.value.current = 1;
};

const onStatusFilterChange = () => {
  store.dispatch('jobs/setApplicationFilters', { status: statusFilter.value });
  pagination.value.current = 1;
};

const handleTableChange = (pag, filters, sorter) => {
  // Handle sorting if needed
};

const handleCurrentChange = (page) => {
  pagination.value.current = page;
};

const handleSizeChange = (current, size) => {
  pagination.value.pageSize = size;
  pagination.value.current = 1;
};

const getStatusColor = (status) => {
  if (!status) return 'default';
  
  const statusLower = status.toLowerCase();
  const colors = {
    'new': 'blue',
    'screening': 'orange',
    'interview': 'purple',
    'offer': 'geekblue',
    'hired': 'green',
    'rejected': 'red'
  };
  
  return colors[statusLower] || 'default';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

// Use the same method names and structure as in Candidates.vue
const viewCandidate = (application) => {
  // Map application fields to candidate fields expected by CandidateViewProfile
  viewProfileDialog.candidate = {
    id: application.id,
    name: application.candidateName,
    email: application.email,
    phone: application.phone,
    status: application.status,
    applied_date: application.appliedDate,
    experience: application.experience,
    skills: application.skills,
    resume_url: application.resumeUrl,
    department: application.department,
    background_score: application.backgroundScore,
    project_score: application.projectScore,
    skill_score: application.skillScore,
    certificate_score: application.certificateScore,
    total_score: application.totalScore
  };
  viewProfileDialog.visible = true;
};

const updateScores = (application) => {
  // Map application fields to candidate fields expected by UpdateScoresCandidate
  scoreDialog.candidate = {
    id: application.id,
    name: application.candidateName,
    email: application.email,
    background_score: application.backgroundScore || 0,
    project_score: application.projectScore || 0,
    skill_score: application.skillScore || 0,
    certificate_score: application.certificateScore || 0,
    total_score: application.totalScore || 0
  };
  scoreDialog.visible = true;
};

const scheduleInterview = (application) => {
  // Map application fields to candidate fields expected by CandidateMakeScheduleInterview
  scheduleInterviewDialog.candidate = {
    id: application.id,
    name: application.candidateName,
    email: application.email,
    phone: application.phone,
    status: application.status
  };
  scheduleInterviewDialog.visible = true;
};

const updateStatus = (application) => {
  // Map application fields to candidate fields expected by CandidateUpdateStatus
  updateStatusDialog.candidate = {
    id: application.id,
    name: application.candidateName,
    email: application.email,
    status: application.status
  };
  updateStatusDialog.visible = true;
};

const deleteApplication = (application) => {
  Modal.confirm({
    title: 'Are you sure you want to delete this application?',
    content: `This will permanently remove ${application.candidateName}'s application for this job.`,
    okText: 'Yes, Delete',
    okType: 'danger',
    cancelText: 'No, Cancel',
    onOk: async () => {
      try {
        // Implement delete logic
        message.success('Application deleted successfully');
        loadJobApplications(props.jobId);
      } catch (error) {
        console.error('Error deleting application:', error);
        message.error('Failed to delete application');
      }
    }
  });
};
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.candidate-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.candidate-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.candidate-name {
  font-size: 13px;
  font-weight: 600;
  color: #1890ff;
  transition: color 0.3s;
}

.candidate-name:hover {
  color: #40a9ff;
}

.candidate-email {
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.45;
}

.pagination-container {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  padding: 12px;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.score-value {
  color: var(--text-color);
  font-weight: 600;
}

.score-max {
  color: var(--text-color);
  opacity: 0.45;
  font-size: 0.9em;
}

:deep(.ant-table-thead > tr > th) {
  background-color: var(--card-bg);
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
}

:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

:deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
  background-color: var(--hover-color);
}
</style> 