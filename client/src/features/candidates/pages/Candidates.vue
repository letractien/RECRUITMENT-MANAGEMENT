<template>
  <div class="candidates-page">
    <div class="page-header">
      <h2>Candidates</h2>
      <a-button type="primary" @click="showCreateCandidateDialog">
        <template #icon><plus-outlined /></template>
        Add Candidate
      </a-button>
    </div>

    <a-card>
      <div class="toolbar">
        <a-input
          v-model:value="search"
          placeholder="Search candidates..."
          style="max-width: 300px"
          @change="handleFilterChange"
        >
          <template #prefix><search-outlined /></template>
        </a-input>
        <a-select
          v-model:value="statusFilter"
          placeholder="Status"
          style="width: 200px"
          allowClear
          @change="handleFilterChange"
        >
          <a-select-option value="">All Status</a-select-option>
          <a-select-option value="new">New</a-select-option>
          <a-select-option value="screening">Screening</a-select-option>
          <a-select-option value="interview">Interview</a-select-option>
          <a-select-option value="offer">Offer</a-select-option>
          <a-select-option value="hired">Hired</a-select-option>
          <a-select-option value="rejected">Rejected</a-select-option>
        </a-select>
      </div>

      <a-spin :spinning="isLoading">
        <a-table
          :dataSource="paginatedCandidates"
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
                  {{ record.name ? record.name.charAt(0).toUpperCase() : 'U' }}
                </a-avatar>
                <div class="candidate-details">
                  <div class="candidate-name">{{ record.name }}</div>
                  <div class="candidate-email">{{ record.email }}</div>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'gender'">
              <div class="gender-display">
                <template v-if="record.sex === 'Man'">
                  <man-outlined class="gender-icon male" />
                  <span>Man</span>
                </template>
                <template v-else-if="record.sex === 'Woman'">
                  <woman-outlined class="gender-icon female" />
                  <span>Woman</span>
                </template>
                <template v-else>
                  <span>{{ record.sex ? record.sex.charAt(0).toUpperCase() + record.sex.slice(1) : 'N/A' }}</span>
                </template>
              </div>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ capitalizeStatus(record.status) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'experience'">
              {{ record.experience }} years
            </template>
            <template v-else-if="column.key === 'total_score'">
              <div class="score-display">
                <span class="score-value">{{ record.total_score || 0 }}</span>
                <span class="score-max">/100</span>
              </div>
            </template>
            <template v-else-if="column.key === 'applied_date'">
              {{ formatDate(record.applied_date || record.created_at) }}
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
                    <a-menu-item key="delete" danger @click="deleteCandidate(record)">
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
          v-model:current="currentPage"
          v-model:pageSize="pageSize"
          :total="total"
          :pageSizeOptions="['10', '20', '50', '100']"
          showSizeChanger
          showQuickJumper
          :showTotal="total => `Total ${total} items`"
          @change="handleCurrentChange"
          @showSizeChange="handleSizeChange"
        />
      </div>
    </a-card>

    <!-- Add/Edit Candidate Dialog -->
    <CreateCandidateForm
      v-model:visible="candidateDialog.visible"
      :is-edit="candidateDialog.isEdit"
      :candidate="candidateForm"
      @saved="fetchCandidates"
    />

    <!-- View Profile Dialog -->
    <CandidateViewProfile
      v-model:visible="viewProfileDialog.visible"
      :candidate="viewProfileDialog.candidate"
    />

    <!-- Add Score Dialog -->
    <UpdateScoresCandidate
      v-model:visible="scoreDialog.visible"
      :candidate="scoreDialog.candidate"
      @saved="fetchCandidates"
    />

    <!-- Schedule Interview Dialog -->
    <CandidateMakeScheduleInterview
      v-model:visible="scheduleInterviewDialog.visible"
      :candidate="scheduleInterviewDialog.candidate"
      @saved="fetchCandidates"
    />

    <!-- Update Status Dialog -->
    <CandidateUpdateStatus
      v-model:visible="updateStatusDialog.visible"
      :candidate="updateStatusDialog.candidate"
      @saved="fetchCandidates"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, h, onMounted } from 'vue'
import { useStore } from 'vuex'
import { 
  PlusOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  CalendarOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  DownOutlined,
  TrophyOutlined,
  ManOutlined,
  WomanOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { formatDate as formatDateUtil } from '../../../shared/utils/dateHelpers'
import candidatesService from '../api/candidates.service'
import CreateCandidateForm from '../components/CandidateCreateForm.vue'
import CandidateViewProfile from '../components/CandidateViewProfile.vue'
import UpdateScoresCandidate from '../components/CandidateUpdateScores.vue'
import CandidateMakeScheduleInterview from '../components/CandidateMakeScheduleInterview.vue'
import CandidateUpdateStatus from '../components/CandidateUpdateStatus.vue'

const store = useStore()

const search = ref('')
const statusFilter = ref('')
const isLoading = ref(false)
const candidates = ref([])
const total = ref(0)

// Pagination settings
const currentPage = ref(1)
const pageSize = ref(10)

// Add computed property for paginated candidates
const paginatedCandidates = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return candidates.value.slice(startIndex, endIndex)
})

// Table columns
const columns = [
  {
    title: 'Candidate',
    dataIndex: 'candidate',
    key: 'candidate',
    width: 250,
    sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
  },
  {
    title: 'Gender',
    key: 'gender',
    width: 100,
    sorter: (a, b) => (a.gender || '').localeCompare(b.gender || ''),
  },
  {
    title: 'Applied For',
    dataIndex: 'department',
    key: 'department',
    width: 150,
    sorter: (a, b) => a.department.localeCompare(b.department),
  },
  {
    title: 'Total Score',
    key: 'total_score',
    width: 120,
    sorter: (a, b) => (a.total_score || 0) - (b.total_score || 0),
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
    sorter: (a, b) => new Date(a.applied_date) - new Date(b.applied_date),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return formatDateUtil(dateString, 'YYYY-MM-DD HH:mm')
}

// Load candidates from API
const fetchCandidates = async () => {
  isLoading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    if (statusFilter.value) params.status = statusFilter.value
    if (search.value) params.search = search.value
    
    const response = await candidatesService.searchCandidates(params)
    candidates.value = response.data
    total.value = response.data.length
    
    // Update store
    store.commit('candidates/SET_CANDIDATES', response.data)
  } catch (error) {
    console.error('Error loading candidates:', error)
    message.error('Failed to load candidates. Please try again later.')
  } finally {
    isLoading.value = false
  }
}

// Load candidates on component mount
onMounted(fetchCandidates)

// Handle filter changes
const handleFilterChange = () => {
  currentPage.value = 1 // Reset to first page
  fetchCandidates()
}

// Handle table pagination and sorting
const handleTableChange = (pag) => {
  fetchCandidates()
}

// Add these new pagination methods
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchCandidates()
}

const handleSizeChange = (current, size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchCandidates()
}

// Status helpers
const getStatusColor = (status) => {
  const colors = {
    'new': 'blue',
    'screening': 'orange',
    'interview': 'purple',
    'offer': 'geekblue',
    'hired': 'green',
    'rejected': 'red'
  }
  return colors[status] || 'default'
}

const capitalizeStatus = (status) => {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const candidateDialog = reactive({
  visible: false,
  isEdit: false
})

const candidateForm = reactive({
  id: null,
  name: '',
  email: '',
  phone: '',
  position: '',
  experience: 0,
  status: 'new',
  applied_date: new Date().toISOString().split('T')[0],
  resume_url: '',
  skills: [],
  notes: '',
  background_score: 0,
  project_score: 0,
  skill_score: 0,
  certificate_score: 0,
  total_score: 0
})

const showCreateCandidateDialog = () => {
  candidateDialog.isEdit = false
  candidateDialog.visible = true
  Object.assign(candidateForm, {
    id: null,
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: 0,
    status: 'new',
    applied_date: new Date().toISOString().split('T')[0],
    resume_url: '',
    skills: [],
    notes: '',
    background_score: 0,
    project_score: 0,
    skill_score: 0,
    certificate_score: 0,
    total_score: 0
  })
}

const editCandidate = (candidate) => {
  candidateDialog.isEdit = true
  candidateDialog.visible = true
  Object.assign(candidateForm, {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    position: candidate.position,
    experience: candidate.experience,
    status: candidate.status,
    appliedDate: candidate.appliedDate,
    resume: candidate.resume,
    skills: candidate.skills || [],
    notes: candidate.notes || '',
    background_score: candidate.background_score || 0,
    project_score: candidate.project_score || 0,
    skill_score: candidate.skill_score || 0,
    certificate_score: candidate.certificate_score || 0,
    total_score: candidate.total_score || 0
  })
}

const viewProfileDialog = reactive({
  visible: false,
  candidate: null
})

const viewCandidate = (candidate) => {
  viewProfileDialog.candidate = candidate
  viewProfileDialog.visible = true
}

const scheduleInterviewDialog = reactive({
  visible: false,
  candidate: null
})

const scheduleInterview = (candidate) => {
  scheduleInterviewDialog.candidate = candidate
  scheduleInterviewDialog.visible = true
}

const updateStatusDialog = reactive({
  visible: false,
  candidate: null
})

const updateStatus = (candidate) => {
  updateStatusDialog.candidate = candidate
  updateStatusDialog.visible = true
}

const deleteCandidate = (candidate) => {
  Modal.confirm({
    title: 'Are you sure you want to delete this candidate?',
    content: `This will permanently remove ${candidate.name} from the system.`,
    okText: 'Yes, Delete',
    okType: 'danger',
    cancelText: 'No, Cancel',
    onOk: async () => {
      try {
        await candidatesService.deleteCandidate(candidate.id)
        message.success('Candidate deleted successfully')
        fetchCandidates()
      } catch (error) {
        console.error('Error deleting candidate:', error)
        message.error('Failed to delete candidate')
      }
    }
  })
}

const scoreDialog = reactive({
  visible: false,
  candidate: null
})

const updateScores = (candidate) => {
  scoreDialog.visible = true
  scoreDialog.candidate = candidate
}
</script>

<style scoped>
.candidates-page {
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

.candidate-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.candidate-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #f0f2f5;
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

.action-column {
  text-align: right;
}

.pagination-container {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  padding: 12px;
}

/* Table scrolling styles */
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
  background-color: var(--card-bg);
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .candidates-page {
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

  .pagination-container {
    justify-content: center;
  }
}

:deep(.ant-card-head) {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

:deep(.ant-card-body) {
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

.score-hint {
  color: var(--text-color);
  opacity: 0.65;
  font-size: 0.8em;
  margin-top: 2px;
}

/* Add score color classes */
:deep(.score-high) {
  color: #52c41a;
}

:deep(.score-medium) {
  color: #faad14;
}

:deep(.score-low) {
  color: #f5222d;
}

.gender-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gender-icon {
  font-size: 16px;
}

.gender-icon.male {
  color: #1890ff;
}

.gender-icon.female {
  color: #eb2f96;
}
</style> 