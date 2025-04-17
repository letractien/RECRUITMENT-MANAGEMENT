<template>
  <div class="jobs-page">
    <div class="page-header">
      <h2>Job Postings</h2>
      <a-button type="primary" @click="showCreateJobDialog">
        <template #icon><plus-outlined /></template>
        Create New Job
      </a-button>
    </div>

    <a-card>
      <div class="toolbar">
        <a-input
          v-model:value="search"
          placeholder="Search jobs..."
          style="max-width: 300px"
        >
          <template #prefix><search-outlined /></template>
        </a-input>
        <a-select
          v-model:value="departmentFilter"
          placeholder="Department"
          style="width: 200px"
          allowClear
        >
          <a-select-option value="">All</a-select-option>
          <a-select-option
            v-for="dept in uniqueDepartments"
            :key="dept"
            :value="dept"
          >
            {{ dept }}
          </a-select-option>
        </a-select>
        <a-select
          v-model:value="statusFilter"
          placeholder="Status"
          style="width: 150px"
          allowClear
        >
          <a-select-option value="">All</a-select-option>
          <a-select-option
            v-for="status in uniqueStatuses"
            :key="status"
            :value="status"
          >
            {{ formatStatus(status) }}
          </a-select-option>
        </a-select>
      </div>

      <a-spin :spinning="isLoading">
        <a-table
          :dataSource="paginatedJobs"
          :columns="columns"
          :pagination="false"
          size="middle"
          :scroll="{ y: 405 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'title'">
              <div class="job-title">
                <a-button type="link" @click="viewJobDetails(record)">
                  {{ record.title }}
                </a-button>
                <a-tag :color="getStatusColor(record.status)">
                  {{ formatStatus(record.status) }}
                </a-tag>
              </div>
            </template>
            <template v-else-if="column.key === 'applications'">
              <a-button type="link" @click="viewApplications(record)">
                {{ record.applicants || record.applications || 0 }} candidates
              </a-button>
            </template>
            <template v-else-if="column.key === 'postedDate'">
              {{ formatJobDate(record) }}
            </template>
            <template v-else-if="column.key === 'actions'">
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="view" @click="viewJobDetails(record)">
                      <template #icon><eye-outlined /></template>
                      View Details
                    </a-menu-item>
                    <a-menu-item key="edit" @click="editJob(record)">
                      <template #icon><edit-outlined /></template>
                      Edit Job
                    </a-menu-item>
                    <a-menu-item key="applications" @click="viewApplications(record)">
                      <template #icon><file-outlined /></template>
                      View Applications ({{ record.applications }})
                    </a-menu-item>
                    <a-menu-item key="applications" @click="showChangeStatusDialog(record)">
                      <template #icon><swap-outlined /></template>
                      Change Status
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="delete" danger @click="deleteJob(record)">
                      <template #icon><delete-outlined /></template>
                      Delete Job
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
          v-model:current="currentPage"
          v-model:pageSize="pageSize"
          :total="totalJobs"
          :pageSizeOptions="['10', '20', '50', '100']"
          showSizeChanger
          showQuickJumper
          :showTotal="total => `Total ${total} items`"
          @change="handleCurrentChange"
          @showSizeChange="handleSizeChange"
        />
      </div>
    </a-card>

    <!-- Create/Edit Job Dialog -->
    <a-modal
      v-model:visible="jobDialog.visible"
      :title="jobDialog.isEdit ? 'Edit Job' : 'Create New Job'"
      width="1000px"
      :okText="jobDialog.isEdit ? 'Update' : 'Create'"
      :cancelText="'Cancel'"
      :okButtonProps="{ type: 'primary', size: 'large' }"
      :cancelButtonProps="{ size: 'large' }"
      @ok="handleSubmitClick"
    >
      <JobCreationForm
        ref="jobFormRef"
        :initial-data="jobForm"
        :is-edit="jobDialog.isEdit"
        @success="handleFormSuccess"
      />
    </a-modal>

    <!-- Job Details Dialog -->
    <a-modal
      v-model:visible="jobDetailsDialog.visible"
      :title="jobDetailsDialog.job?.title"
      width="700px"
      :footer="null"
    >
      <JobViewDetail v-if="jobDetailsDialog.job" :job="jobDetailsDialog.job" />
    </a-modal>

    <!-- Applications Dialog -->
    <a-modal
      v-model:visible="applicationsDialog.visible"
      :title="'Applications for ' + (applicationsDialog.job?.title || '')"
      width="1200px"
      :footer="null"
      @cancel="applicationsDialog.visible = false"
    >
      <JobApplications
        v-if="applicationsDialog.visible"
        :job-id="applicationsDialog.job?.id"
        :job-title="applicationsDialog.job?.title"
      />
    </a-modal>

    <!-- Job Change Status Dialog -->
    <JobChangeStatus
      v-model:visible="changeStatusDialog.visible"
      :job="changeStatusDialog.job"
      @statusChanged="handleStatusChanged"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  SearchOutlined,
  DownOutlined,
  FileOutlined,
  SwapOutlined,
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import JobCreationForm from '../components/JobCreationForm.vue'
import { formatDate } from '../../../shared/utils/dateHelpers.js'
import JobApplications from '../components/JobApplications.vue'
import JobViewDetail from '../components/JobViewDetail.vue'
import JobChangeStatus from '../components/JobChangeStatus.vue'

const store = useStore()
const search = ref('')
const departmentFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const jobFormRef = ref(null)
const DEFAULT_USER_ID = "admin123"

// Computed
const jobs = computed(() => store.getters['jobs/allJobs'])
const isLoading = computed(() => store.getters['jobs/isLoading'])

// Add computed property for unique departments
const uniqueDepartments = computed(() => {
  const deptSet = new Set(jobs.value.map(job => job.department))
  return Array.from(deptSet).filter(dept => dept) // Filter out any null/undefined values
})

// Table columns
const columns = [
  {
    title: 'Job Title',
    dataIndex: 'title',
    key: 'title',
    width: 250,
    sorter: (a, b) => a.title.localeCompare(b.title),
  },
  {
    title: 'Department',
    dataIndex: 'department',
    key: 'department',
    width: 150,
    sorter: (a, b) => a.department.localeCompare(b.department),
  },
  {
    title: 'Location',
    dataIndex: 'location',
    key: 'location',
    width: 150,
    sorter: (a, b) => a.location.localeCompare(b.location),
  },
  {
    title: 'Applications',
    key: 'applications',
    width: 150,
    sorter: (a, b) => (a.applications || 0) - (b.applications || 0)
  },
  {
    title: 'Posted Date',
    key: 'postedDate',
    dataIndex: 'postedDate',
    width: 150,
    sorter: (a, b) => new Date(a.postedDate) - new Date(b.postedDate),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// Initialize job form with default values including required fields
const jobForm = reactive({
  title: '',
  department: '',
  location: '',
  description: '',
  requirements: '',
  min_salary: null,
  max_salary: null,
  status: 'draft',
  is_remote: false,
  employment_type: 'full-time',
  created_by: DEFAULT_USER_ID, // Set default user ID
  hiring_manager: DEFAULT_USER_ID, // Set default hiring manager
  background_criteria: {
    importance_ratio: 25,
    required: '',
    criteria: [{
      description: '',
      max_score: 10
    }]
  },
  project_criteria: {
    importance_ratio: 25,
    required: '',
    criteria: [{
      description: '',
      max_score: 10
    }]
  },
  skill_criteria: {
    importance_ratio: 25,
    required: '',
    criteria: [{
      description: '',
      max_score: 10
    }]
  },
  certification_criteria: {
    importance_ratio: 25,
    required: '',
    criteria: [{
      description: '',
      max_score: 10
    }]
  }
})

// Load jobs from API on component mount
onMounted(async () => {
  try {
    await store.dispatch('jobs/fetchJobs')
  } catch (error) {
    console.error('Error loading jobs:', error)
    message.error('Failed to load jobs. Please try again later.')
  }
})

const filteredJobs = computed(() => {
  return jobs.value.filter(job => {
    const matchesSearch = search.value === '' || 
      (job.title && job.title.toLowerCase().includes(search.value.toLowerCase())) ||
      (job.department && job.department.toLowerCase().includes(search.value.toLowerCase())) ||
      (job.location && job.location.toLowerCase().includes(search.value.toLowerCase()))
    
    const matchesDepartment = departmentFilter.value === '' || 
      job.department === departmentFilter.value
    
    const matchesStatus = statusFilter.value === '' || 
      job.status === statusFilter.value

    return matchesSearch && matchesDepartment && matchesStatus
  })
})

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredJobs.value.slice(start, end)
})

const jobDialog = reactive({
  visible: false,
  isEdit: false
})

const jobDetailsDialog = reactive({
  visible: false,
  job: null
})

const applicationsDialog = reactive({
  visible: false,
  job: null
})

const totalJobs = computed(() => filteredJobs.value.length)

const uniqueStatuses = computed(() => {
  const statusSet = new Set(jobs.value.map(job => job.status))
  return Array.from(statusSet).filter(status => status) // Filter out any null/undefined values
})

const changeStatusDialog = reactive({
  visible: false,
  job: null
})

const showCreateJobDialog = () => {
  jobDialog.isEdit = false
  jobDialog.visible = true
  
  // Reset form with all required nested properties
  Object.assign(jobForm, {
    title: '',
    department: '',
    location: '',
    description: '',
    requirements: '',
    min_salary: null,
    max_salary: null,
    status: 'draft',
    is_remote: false,
    employment_type: 'full-time',
    created_by: DEFAULT_USER_ID,
    hiring_manager: DEFAULT_USER_ID,
    background_criteria: {
      importance_ratio: 25,
      required: '',
      criteria: [{
        description: '',
        max_score: 10
      }]
    },
    project_criteria: {
      importance_ratio: 25,
      required: '',
      criteria: [{
        description: '',
        max_score: 10
      }]
    },
    skill_criteria: {
      importance_ratio: 25,
      required: '',
      criteria: [{
        description: '',
        max_score: 10
      }]
    },
    certification_criteria: {
      importance_ratio: 25,
      required: '',
      criteria: [{
        description: '',
        max_score: 10
      }]
    }
  })
}

const editJob = (job) => {
  jobDialog.isEdit = true
  jobDialog.visible = true
  
  // Set form data with all required nested properties
  Object.assign(jobForm, {
    title: job.title,
    department: job.department,
    location: job.location,
    description: job.description,
    requirements: job.requirements,
    min_salary: job.min_salary,
    max_salary: job.max_salary,
    status: job.status,
    is_remote: job.is_remote,
    employment_type: job.employment_type,
    created_by: job.created_by,
    hiring_manager: job.hiring_manager,
    background_criteria: job.background_criteria || {
      importance_ratio: 25,
      required: '',
      criteria: [{
        description: '',
        max_score: 10
      }]
    },
    project_criteria: job.project_criteria || {
      importance_ratio: 25,
      required: '',
      criteria: [{
        description: '',
        max_score: 10
      }]
    },
    skill_criteria: job.skill_criteria || {
      importance_ratio: 25,
      required: '',
      criteria: [{
        description: '',
        max_score: 10
      }]
    },
    certification_criteria: job.certification_criteria || {
      importance_ratio: 25,
      required: '',
      criteria: [{
        description: '',
        max_score: 10
      }]
    }
  })
  
  // Store job for reference
  jobDetailsDialog.job = job
}

const viewJobDetails = async (job) => {
  try {
    // Fetch job details from API if not already loaded
    if (!job.description || !job.requirements) {
      await store.dispatch('jobs/fetchJob', job.id)
      job = store.getters['jobs/currentJob']
    }
    
    jobDetailsDialog.job = job
    jobDetailsDialog.visible = true
  } catch (error) {
    console.error('Error loading job details:', error)
    message.error('Failed to load job details. Please try again later.')
  }
}

// Update viewApplications function
const viewApplications = (job) => {
  applicationsDialog.job = job;
  applicationsDialog.visible = true;
}

// Replace toggleJobStatus with showChangeStatusDialog
const showChangeStatusDialog = (job) => {
  changeStatusDialog.job = job
  changeStatusDialog.visible = true
}

const handleStatusChanged = () => {
  // Refresh jobs list or handle status change
  store.dispatch('jobs/fetchJobs')
}

const deleteJob = (job) => {
  Modal.confirm({
    title: 'Are you sure you want to delete this job?',
    content: `This will permanently delete the job posting "${job.title}"`,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk: async () => {
      try {
        await store.dispatch('jobs/deleteJob', job.id)
        message.success('Job deleted successfully')
      } catch (error) {
        console.error('Error deleting job:', error)
        message.error('Failed to delete job. Please try again later.')
      }
    }
  })
}

const handleSubmitClick = () => {
  // Trigger the form's submit method when the modal's OK button is clicked
  if (jobFormRef.value) {
    jobFormRef.value.handleSubmit();
  } else {
    message.error('Form reference not found. Please try again.')
  }
}

// Add a new function to handle form success
const handleFormSuccess = () => {
  // Close the dialog
  jobDialog.visible = false
  
  // Refresh the job list
  store.dispatch('jobs/fetchJobs')
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const handleSizeChange = (current, size) => {
  pageSize.value = size
  currentPage.value = 1
}

const getStatusColor = (status) => {
  if (!status) return 'blue';
  
  const statusLower = status.toLowerCase();
  if (statusLower === 'open' || statusLower === 'active') return 'green';
  if (statusLower === 'paused') return 'orange';
  if (statusLower === 'closed') return 'red';
  if (statusLower === 'draft') return 'blue';
  
  return 'blue'; // Default color
}

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  
  // Convert first letter to uppercase and the rest to lowercase
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

const formatJobDate = (job) => {
  // Try different field names in priority order
  const dateValue = job.posted_date || job.postedDate || job.created_at;
  
  if (!dateValue) {
    return 'N/A'; // Return N/A if no date is available
  }
  
  // Use a format that includes date and time (hours and minutes)
  return formatDate(dateValue, 'YYYY-MM-DD HH:mm');
}
</script>

<style scoped>
.jobs-page {
  padding: 4px;
  padding-bottom: 24px;
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

/* Adjust table styles for scrolling */
:deep(.ant-table-wrapper) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.ant-table-body) {
  overflow-y: auto !important;
}

:deep(.ant-table-thead > tr > th) {
  position: sticky;
  top: 0;
  z-index: 2;
}

.job-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.pagination-container {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  padding: 12px;
}

.text-center {
  text-align: center;
  line-height: 32px;
}

.job-details {
  padding: 24px;
}

.job-details-header {
  margin-bottom: 16px;
}

.job-meta {
  margin-top: 12px;
  display: flex;
  gap: 16px;
  color: var(--text-color);
  opacity: 0.65;
  font-size: 13px;
  font-weight: 500;
}

.job-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.job-section {
  margin-bottom: 16px;
}

.job-section h4 {
  margin: 0 0 6px 0;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 700;
}

.job-section p {
  margin: 0;
  color: var(--text-color);
  opacity: 0.65;
  line-height: 1.5;
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .jobs-page {
    padding: 4px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .toolbar {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }

  .toolbar .ant-input,
  .toolbar .ant-select {
    width: 100%;
    max-width: none;
  }

  .job-meta {
    flex-direction: column;
    gap: 12px;
  }

  .pagination-container {
    justify-content: center;
  }
}

a-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
  background-color: var(--card-bg);
}

:deep(.ant-card-head) {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

:deep(.ant-card-body) {
  background-color: var(--card-bg);
}

:deep(.ant-modal-content) {
  background-color: var(--card-bg);
}

:deep(.ant-modal-header) {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

:deep(.ant-modal-title) {
  color: var(--text-color);
}

:deep(.ant-form-item-label > label) {
  color: var(--text-color);
}

:deep(.ant-select-dropdown) {
  background-color: var(--card-bg);
}

:deep(.ant-empty-description) {
  color: var(--text-color);
}

.ant-table {
  background-color: var(--card-bg);
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
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

:deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
  background-color: var(--hover-color);
}
</style> 