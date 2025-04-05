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
            v-for="dept in departments"
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
          <a-select-option value="Active">Active</a-select-option>
          <a-select-option value="Inactive">Inactive</a-select-option>
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
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.key === 'title'">
              <div class="job-title">
                <a-button type="link" @click="viewJobDetails(record)">
                  {{ record.title }}
                </a-button>
                <a-tag :color="record.status === 'Active' ? 'green' : 'blue'">
                  {{ record.status }}
                </a-tag>
              </div>
            </template>
            <template v-else-if="column.key === 'applications'">
              <a-button type="link">
                {{ record.applications }} candidates
              </a-button>
            </template>
            <template v-else-if="column.key === 'postedDate'">
              {{ formatDate(record.postedDate) }}
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
                    <a-menu-item key="toggle" @click="toggleJobStatus(record)">
                      <template #icon><swap-outlined /></template>
                      {{ record.status === 'Active' ? 'Deactivate' : 'Activate' }}
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
      @ok="saveJob"
    >
      <JobCreationForm
        ref="jobFormRef"
        :initial-data="jobForm"
        @submit="handleJobFormSubmit"
      />
    </a-modal>

    <!-- Job Details Dialog -->
    <a-modal
      v-model:visible="jobDetailsDialog.visible"
      :title="jobDetailsDialog.job?.title"
      width="700px"
      :footer="null"
    >
      <div class="job-details" v-if="jobDetailsDialog.job">
        <div class="job-details-header">
          <a-tag :color="jobDetailsDialog.job.status === 'Active' ? 'green' : 'blue'">
            {{ jobDetailsDialog.job.status }}
          </a-tag>
          <div class="job-meta">
            <span><environment-outlined /> {{ jobDetailsDialog.job.location }}</span>
            <span><fund-outlined /> {{ jobDetailsDialog.job.department }}</span>
            <span><calendar-outlined /> Posted {{ formatDate(jobDetailsDialog.job.postedDate) }}</span>
          </div>
        </div>
        
        <div class="job-section">
          <h4>Description</h4>
          <p>{{ jobDetailsDialog.job.description }}</p>
        </div>
        
        <div class="job-section">
          <h4>Requirements</h4>
          <p>{{ jobDetailsDialog.job.requirements }}</p>
        </div>

        <div class="job-section">
          <h4>Salary Range</h4>
          <p>{{ formatSalary(jobDetailsDialog.job.salaryMin) }} - {{ formatSalary(jobDetailsDialog.job.salaryMax) }} VND</p>
        </div>

        <div class="job-section">
          <h4>Applications</h4>
          <p>{{ jobDetailsDialog.job.applications }} candidates have applied</p>
        </div>
      </div>
    </a-modal>
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
  EnvironmentOutlined, 
  CalendarOutlined, 
  SearchOutlined,
  DownOutlined,
  FileOutlined,
  SwapOutlined,
  FundOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import JobCreationForm from '@/components/JobCreationForm.vue'

const store = useStore()

// Constants
const departments = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations'
]

// Table columns
const columns = [
  {
    title: 'Job Title',
    dataIndex: 'title',
    key: 'title',
    width: 250
  },
  {
    title: 'Department',
    dataIndex: 'department',
    key: 'department',
    width: 150
  },
  {
    title: 'Location',
    dataIndex: 'location',
    key: 'location',
    width: 150
  },
  {
    title: 'Applications',
    key: 'applications',
    width: 150
  },
  {
    title: 'Posted Date',
    key: 'postedDate',
    width: 150
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// State
const search = ref('')
const departmentFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const jobFormRef = ref(null)

// Load jobs from API on component mount
onMounted(async () => {
  try {
    await store.dispatch('jobs/fetchJobs')
  } catch (error) {
    console.error('Error loading jobs:', error)
    message.error('Failed to load jobs. Please try again later.')
  }
})

// Computed
const jobs = computed(() => store.getters['jobs/allJobs'])
const isLoading = computed(() => store.getters['jobs/isLoading'])

const filteredJobs = computed(() => {
  return jobs.value.filter(job => {
    const matchesSearch = search.value === '' || 
      job.title.toLowerCase().includes(search.value.toLowerCase()) ||
      job.department.toLowerCase().includes(search.value.toLowerCase()) ||
      job.location.toLowerCase().includes(search.value.toLowerCase())
    
    const matchesDepartment = departmentFilter.value === '' || 
      job.department === departmentFilter.value
    
    const matchesStatus = statusFilter.value === '' || 
      job.status === statusFilter.value

    return matchesSearch && matchesDepartment && matchesStatus
  })
})

const totalJobs = computed(() => filteredJobs.value.length)

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredJobs.value.slice(start, end)
})

// Dialogs
const jobDialog = reactive({
  visible: false,
  isEdit: false
})

const jobDetailsDialog = reactive({
  visible: false,
  job: null
})

const jobForm = reactive({
  title: '',
  department: '',
  location: '',
  description: '',
  requirements: '',
  salaryMin: 0,
  salaryMax: 0,
  status: 'Active'
})

// Form rules
const jobRules = {
  title: [
    { required: true, message: 'Please input job title', trigger: 'blur' },
    { min: 3, message: 'Length should be at least 3 characters', trigger: 'blur' }
  ],
  department: [
    { required: true, message: 'Please select department', trigger: 'change' }
  ],
  location: [
    { required: true, message: 'Please input location', trigger: 'blur' }
  ],
  description: [
    { required: true, message: 'Please input job description', trigger: 'blur' },
    { min: 50, message: 'Description should be at least 50 characters', trigger: 'blur' }
  ],
  requirements: [
    { required: true, message: 'Please input job requirements', trigger: 'blur' }
  ]
}

// Add this at an appropriate location in the script setup, before the jobs definition:
const isJobActive = computed({
  get: () => jobForm.status === 'Active',
  set: (value) => {
    jobForm.status = value ? 'Active' : 'Inactive'
  }
})

// Methods
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatSalary = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

const showCreateJobDialog = () => {
  jobDialog.isEdit = false
  jobDialog.visible = true
  
  // Reset form
  Object.assign(jobForm, {
    title: '',
    department: '',
    location: '',
    description: '',
    requirements: '',
    salaryMin: 0,
    salaryMax: 0,
    status: 'Active'
  })
}

const editJob = (job) => {
  jobDialog.isEdit = true
  jobDialog.visible = true
  
  // Set form data
  Object.assign(jobForm, {
    title: job.title,
    department: job.department,
    location: job.location,
    description: job.description,
    requirements: job.requirements,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    status: job.status
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

const viewApplications = (job) => {
  // Navigate to applications page with job filter
  // This would be implemented in a real app
  message.info('Viewing applications for job: ' + job.title)
}

const toggleJobStatus = (job) => {
  const newStatus = job.status === 'Active' ? 'Inactive' : 'Active'
  
  Modal.confirm({
    title: `Are you sure you want to ${newStatus.toLowerCase()} this job?`,
    content: `This will ${newStatus.toLowerCase()} the job posting "${job.title}"`,
    okText: 'Yes',
    cancelText: 'No',
    onOk: async () => {
      try {
        await store.dispatch('jobs/updateJobStatus', { id: job.id, status: newStatus })
        message.success(`Job ${newStatus.toLowerCase()} successfully`)
      } catch (error) {
        console.error('Error updating job status:', error)
        message.error('Failed to update job status. Please try again later.')
      }
    }
  })
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

const saveJob = async () => {
  try {
    if (jobDialog.isEdit) {
      await store.dispatch('jobs/updateJob', { id: jobDetailsDialog.job.id, data: jobForm })
      message.success('Job updated successfully')
    } else {
      await store.dispatch('jobs/createJob', jobForm)
      message.success('Job created successfully')
    }
    
    jobDialog.visible = false
  } catch (error) {
    console.error('Error saving job:', error)
    message.error('Failed to save job. Please try again later.')
  }
}

const handleJobFormSubmit = (formData) => {
  Object.assign(jobForm, formData)
  saveJob()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const handleSizeChange = (current, size) => {
  pageSize.value = size
  currentPage.value = 1
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
  padding: 0 12px;
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