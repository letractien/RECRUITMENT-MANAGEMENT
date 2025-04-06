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
          <a-select-option value="">All</a-select-option>
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
          :dataSource="candidates"
          :columns="columns"
          :pagination="pagination"
          size="middle"
          :rowKey="record => record.id"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.key === 'candidate'">
              <div class="candidate-info">
                <a-avatar :size="32">
                  {{ record.name ? record.name.charAt(0).toUpperCase() : 'U' }}
                </a-avatar>
                <div class="candidate-details">
                  <div class="candidate-name">{{ record.name }}</div>
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
    </a-card>

    <!-- Add/Edit Candidate Dialog -->
    <a-modal
      v-model:visible="candidateDialog.visible"
      :title="candidateDialog.isEdit ? 'Edit Candidate' : 'Add Candidate'"
      width="600px"
      @ok="saveCandidate"
    >
      <a-form
        :model="candidateForm"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="Full Name" required>
          <a-input v-model:value="candidateForm.name" />
        </a-form-item>
        <a-form-item label="Email" required>
          <a-input v-model:value="candidateForm.email" type="email" />
        </a-form-item>
        <a-form-item label="Phone">
          <a-input v-model:value="candidateForm.phone" />
        </a-form-item>
        <a-form-item label="Position" required>
          <a-select v-model:value="candidateForm.position" style="width: 100%">
            <a-select-option
              v-for="job in availableJobs"
              :key="job.value"
              :value="job.value"
            >
              {{ job.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Experience">
          <a-input-number v-model:value="candidateForm.experience" :min="0" :max="50" />
          <span class="ml-2">years</span>
        </a-form-item>
        <a-form-item label="Status">
          <a-select v-model:value="candidateForm.status" style="width: 100%">
            <a-select-option value="New">New</a-select-option>
            <a-select-option value="Screening">Screening</a-select-option>
            <a-select-option value="Interview">Interview</a-select-option>
            <a-select-option value="Hired">Hired</a-select-option>
            <a-select-option value="Rejected">Rejected</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Resume">
          <a-upload
            action="#"
            :multiple="false"
            :showUploadList="true"
          >
            <a-button>
              <template #icon><upload-outlined /></template>
              Select File
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Add Score Dialog -->
    <a-modal
      v-model:visible="scoreDialog.visible"
      title="Update Candidate Scores"
      width="600px"
      @ok="saveScores"
    >
      <a-form
        :model="scoreForm"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="Background Score">
          <a-input-number 
            v-model:value="scoreForm.background_score" 
            :min="0" 
            :max="100" 
            style="width: 100%"
          />
          <div class="score-hint">Evaluate candidate's work history and education</div>
        </a-form-item>
        
        <a-form-item label="Project Score">
          <a-input-number 
            v-model:value="scoreForm.project_score" 
            :min="0" 
            :max="100" 
            style="width: 100%"
          />
          <div class="score-hint">Evaluate candidate's past projects and accomplishments</div>
        </a-form-item>
        
        <a-form-item label="Skill Score">
          <a-input-number 
            v-model:value="scoreForm.skill_score" 
            :min="0" 
            :max="100" 
            style="width: 100%"
          />
          <div class="score-hint">Evaluate candidate's technical and soft skills</div>
        </a-form-item>
        
        <a-form-item label="Certificate Score">
          <a-input-number 
            v-model:value="scoreForm.certificate_score" 
            :min="0" 
            :max="100" 
            style="width: 100%"
          />
          <div class="score-hint">Evaluate candidate's certifications and qualifications</div>
        </a-form-item>
        
        <a-form-item label="Total Score">
          <a-input-number 
            v-model:value="scoreForm.total_score" 
            :min="0" 
            :max="100" 
            style="width: 100%"
          />
          <a-button type="link" @click="calculateTotalScore">Calculate Average</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
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
  UploadOutlined,
  TrophyOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import candidatesService from '../api/candidates.service'
import { formatDate as formatDateUtil } from '../../../shared/utils/dateHelpers'

const store = useStore()

const search = ref('')
const statusFilter = ref('')
const isLoading = ref(false)
const candidates = ref([])
const total = ref(0)

// Pagination settings
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  showTotal: (total) => `Total ${total} items`
})

// Table columns
const columns = [
  {
    title: 'Candidate',
    key: 'candidate',
    width: 250
  },
  {
    title: 'Applied For',
    dataIndex: 'position',
    key: 'position',
    width: 150
  },
  {
    title: 'Experience',
    key: 'experience',
    width: 100
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
    width: 120
  },
  {
    title: 'Applied Date',
    key: 'applied_date',
    width: 120
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
    const params = {}
    if (statusFilter.value) params.status = statusFilter.value
    if (search.value) params.search = search.value
    
    const response = await candidatesService.searchCandidates(params)
    candidates.value = response.data
    pagination.total = response.data.length
    
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
  pagination.current = 1 // Reset to first page
  fetchCandidates()
}

// Handle table pagination and sorting
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
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
  status: 'New',
  appliedDate: new Date().toISOString().split('T')[0],
  resume: '',
  education: '',
  skills: [],
  interviewNotes: '',
  evaluation: {
    technicalScore: 0,
    softSkillsScore: 0,
    experienceScore: 0,
    overallScore: 0,
    feedback: ''
  }
})

const availableJobs = [
  { 
    label: 'Senior Frontend Developer', 
    value: 'Senior Frontend Developer',
    department: 'Engineering',
    requirements: ['React', 'Vue.js', 'TypeScript', '5+ years experience']
  },
  { 
    label: 'Backend Developer', 
    value: 'Backend Developer',
    department: 'Engineering',
    requirements: ['Node.js', 'Python', 'SQL', '3+ years experience']
  },
  { 
    label: 'UI/UX Designer', 
    value: 'UI/UX Designer',
    department: 'Design',
    requirements: ['Figma', 'Adobe XD', 'User Research', '3+ years experience']
  },
  { 
    label: 'Product Manager', 
    value: 'Product Manager',
    department: 'Product',
    requirements: ['Agile', 'Product Strategy', 'User Stories', '5+ years experience']
  }
]

const showCreateCandidateDialog = () => {
  candidateDialog.isEdit = false
  candidateDialog.visible = true
  
  // Reset form
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
    // Initialize score fields
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
  
  // Copy candidate data to form
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
    // Include score fields
    background_score: candidate.background_score || 0,
    project_score: candidate.project_score || 0,
    skill_score: candidate.skill_score || 0,
    certificate_score: candidate.certificate_score || 0,
    total_score: candidate.total_score || 0
  })
}

const viewCandidate = (candidate) => {
  // Navigate to candidate detail page or show a detailed modal
  // For now, we'll just show a message
  message.info(`Viewing ${candidate.name}'s profile`)
}

const scheduleInterview = (candidate) => {
  // For now, just show a message
  message.info(`Scheduling interview for ${candidate.name}`)
}

const updateStatus = (candidate) => {
  Modal.confirm({
    title: `Update status for ${candidate.name}`,
    content: h('div', {}, [
      h('p', 'Select new status:'),
      h('a-select', {
        style: { width: '100%' },
        value: candidate.status,
        onChange: (value) => {
          updateCandidateStatus(candidate.id, value)
          Modal.destroyAll()
        }
      }, [
        h('a-select-option', { value: 'new' }, 'New'),
        h('a-select-option', { value: 'screening' }, 'Screening'),
        h('a-select-option', { value: 'interview' }, 'Interview'),
        h('a-select-option', { value: 'offer' }, 'Offer'),
        h('a-select-option', { value: 'hired' }, 'Hired'),
        h('a-select-option', { value: 'rejected' }, 'Rejected')
      ])
    ])
  })
}

const updateCandidateStatus = async (id, status) => {
  try {
    await candidatesService.updateCandidateStatus(id, status)
    message.success(`Status updated to ${status}`)
    fetchCandidates()
  } catch (error) {
    console.error('Error updating status:', error)
    message.error('Failed to update status')
  }
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

const saveCandidate = async () => {
  try {
    // Validate form
    if (!candidateForm.name || !candidateForm.email || !candidateForm.position) {
      message.error('Please fill in all required fields')
      return
    }

    // Prepare data for API
    const candidateData = {
      name: candidateForm.name,
      email: candidateForm.email,
      phone: candidateForm.phone || '',
      position: candidateForm.position,
      department: candidateForm.department || 'General',
      experience: candidateForm.experience || 0,
      status: candidateForm.status.toLowerCase(),
      skills: candidateForm.skills || [],
      notes: candidateForm.notes || '',
      resume_url: candidateForm.resume_url || null,
      salary_expectation: candidateForm.salary_expectation || null,
      // Include score fields
      background_score: candidateForm.background_score || 0,
      project_score: candidateForm.project_score || 0,
      skill_score: candidateForm.skill_score || 0,
      certificate_score: candidateForm.certificate_score || 0,
      total_score: candidateForm.total_score || 0
    }

    if (candidateDialog.isEdit && candidateForm.id) {
      // Update existing candidate
      await candidatesService.updateCandidate(candidateForm.id, candidateData)
      message.success('Candidate updated successfully')
    } else {
      // Create new candidate
      await candidatesService.createCandidate(candidateData)
      message.success('Candidate added successfully')
    }

    // Close dialog and refresh list
    candidateDialog.visible = false
    fetchCandidates()
  } catch (error) {
    console.error('Error saving candidate:', error)
    message.error('Failed to save candidate')
  }
}

const scoreDialog = reactive({
  visible: false,
  candidateId: null
})

const scoreForm = reactive({
  background_score: 0,
  project_score: 0,
  skill_score: 0,
  certificate_score: 0,
  total_score: 0
})

const updateScores = (candidate) => {
  scoreDialog.visible = true
  scoreDialog.candidateId = candidate.id
  
  // Initialize form with existing scores
  scoreForm.background_score = candidate.background_score || 0
  scoreForm.project_score = candidate.project_score || 0
  scoreForm.skill_score = candidate.skill_score || 0
  scoreForm.certificate_score = candidate.certificate_score || 0
  scoreForm.total_score = candidate.total_score || 0
}

const calculateTotalScore = () => {
  // Calculate average of all scores
  const scores = [
    scoreForm.background_score,
    scoreForm.project_score,
    scoreForm.skill_score,
    scoreForm.certificate_score
  ]
  const sum = scores.reduce((acc, score) => acc + (score || 0), 0)
  scoreForm.total_score = Math.round(sum / scores.length)
}

const saveScores = async () => {
  try {
    if (!scoreDialog.candidateId) return
    
    await candidatesService.updateCandidate(scoreDialog.candidateId, {
      background_score: scoreForm.background_score,
      project_score: scoreForm.project_score,
      skill_score: scoreForm.skill_score, 
      certificate_score: scoreForm.certificate_score,
      total_score: scoreForm.total_score
    })
    
    message.success('Candidate scores updated successfully')
    scoreDialog.visible = false
    fetchCandidates()
  } catch (error) {
    console.error('Error updating scores:', error)
    message.error('Failed to update scores')
  }
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
  color: var(--text-color);
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
</style> 