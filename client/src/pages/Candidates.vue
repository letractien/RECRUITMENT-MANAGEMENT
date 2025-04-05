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
        >
          <template #prefix><search-outlined /></template>
        </a-input>
        <a-select
          v-model:value="statusFilter"
          placeholder="Status"
          style="width: 200px"
          allowClear
        >
          <a-select-option value="">All</a-select-option>
          <a-select-option value="New">New</a-select-option>
          <a-select-option value="Screening">Screening</a-select-option>
          <a-select-option value="Interview">Interview</a-select-option>
          <a-select-option value="Hired">Hired</a-select-option>
          <a-select-option value="Rejected">Rejected</a-select-option>
        </a-select>
      </div>

      <a-spin :spinning="isLoading">
        <a-table
          :dataSource="paginatedCandidates"
          :columns="columns"
          :pagination="false"
          size="middle"
          :scroll="{ y: 405 }"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.key === 'candidate'">
              <div class="candidate-info">
                <a-avatar :size="32">
                  {{ record.name.charAt(0) }}
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
            <template v-else-if="column.key === 'actions'">
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="view" @click="viewCandidate(record)">
                      <template #icon><eye-outlined /></template>
                      View Profile
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
          :total="totalCandidates"
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
  UploadOutlined
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

const store = useStore()

const search = ref('')
const statusFilter = ref('')

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
    dataIndex: 'experience',
    key: 'experience',
    width: 100,
    customRender: ({ text }) => `${text} years`
  },
  {
    title: 'Score',
    key: 'score',
    width: 100,
    customRender: ({ record }) => {
      const score = record.score || 0
      return `${score}/100`
    }
  },
  {
    title: 'Status',
    key: 'status',
    width: 120
  },
  {
    title: 'Applied Date',
    dataIndex: 'appliedDate',
    key: 'appliedDate',
    width: 120
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// Load candidates from API on component mount
onMounted(async () => {
  try {
    await store.dispatch('candidates/fetchCandidates')
  } catch (error) {
    console.error('Error loading candidates:', error)
    message.error('Failed to load candidates. Please try again later.')
  }
})

// Computed
const candidates = computed(() => store.getters['candidates/allCandidates'])
const isLoading = computed(() => store.getters['candidates/isLoading'])

const currentPage = ref(1)
const pageSize = ref(10)

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

const filteredCandidates = computed(() => {
  return candidates.value.filter(candidate => {
    const matchesSearch = search.value === '' || 
      candidate.name.toLowerCase().includes(search.value.toLowerCase()) ||
      candidate.email.toLowerCase().includes(search.value.toLowerCase()) ||
      candidate.position.toLowerCase().includes(search.value.toLowerCase())
    
    const matchesStatus = statusFilter.value === '' || 
      candidate.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

const totalCandidates = computed(() => filteredCandidates.value.length)

const paginatedCandidates = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCandidates.value.slice(start, end)
})

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

const getStatusType = (status) => {
  const types = {
    'New': 'info',
    'Screening': 'warning',
    'Interview': 'primary',
    'Hired': 'success',
    'Rejected': 'danger'
  }
  return types[status] || 'info'
}

const getStatusColor = (status) => {
  const colors = {
    'New': 'blue',
    'Screening': 'orange',
    'Interview': 'purple',
    'Hired': 'green',
    'Rejected': 'red'
  }
  return colors[status] || 'default'
}

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
    education: candidate.education,
    skills: candidate.skills || [],
    interviewNotes: candidate.interviewNotes || '',
    evaluation: {
      technicalScore: candidate.evaluation?.technicalScore || 0,
      softSkillsScore: candidate.evaluation?.softSkillsScore || 0,
      experienceScore: candidate.evaluation?.experienceScore || 0,
      overallScore: candidate.evaluation?.overallScore || 0,
      feedback: candidate.evaluation?.feedback || ''
    }
  })
}

const viewCandidate = async (candidate) => {
  try {
    // Fetch candidate details from API if not already loaded
    if (!candidate.education || !candidate.skills) {
      await store.dispatch('candidates/fetchCandidate', candidate.id)
      candidate = store.getters['candidates/currentCandidate']
    }
    
    // Show candidate details dialog
    Modal.info({
      title: candidate.name,
      width: 700,
      content: h('div', { class: 'candidate-details' }, [
        h('div', { class: 'candidate-header' }, [
          h('a-avatar', { size: 64, style: 'margin-right: 16px' }, candidate.name.charAt(0)),
          h('div', { class: 'candidate-info' }, [
            h('h3', candidate.name),
            h('p', candidate.email),
            h('p', candidate.phone)
          ])
        ]),
        h('div', { class: 'candidate-section' }, [
          h('h4', 'Position'),
          h('p', candidate.position)
        ]),
        h('div', { class: 'candidate-section' }, [
          h('h4', 'Experience'),
          h('p', `${candidate.experience} years`)
        ]),
        h('div', { class: 'candidate-section' }, [
          h('h4', 'Education'),
          h('p', candidate.education)
        ]),
        h('div', { class: 'candidate-section' }, [
          h('h4', 'Skills'),
          h('div', { class: 'skills-list' }, 
            candidate.skills.map(skill => h('a-tag', { style: 'margin: 4px' }, skill))
          )
        ]),
        h('div', { class: 'candidate-section' }, [
          h('h4', 'Evaluation'),
          h('div', { class: 'evaluation-scores' }, [
            h('div', { class: 'score-item' }, [
              h('span', 'Technical: '),
              h('span', { style: 'font-weight: bold' }, `${candidate.evaluation?.technicalScore || 0}/100`)
            ]),
            h('div', { class: 'score-item' }, [
              h('span', 'Soft Skills: '),
              h('span', { style: 'font-weight: bold' }, `${candidate.evaluation?.softSkillsScore || 0}/100`)
            ]),
            h('div', { class: 'score-item' }, [
              h('span', 'Experience: '),
              h('span', { style: 'font-weight: bold' }, `${candidate.evaluation?.experienceScore || 0}/100`)
            ]),
            h('div', { class: 'score-item' }, [
              h('span', 'Overall: '),
              h('span', { style: 'font-weight: bold' }, `${candidate.evaluation?.overallScore || 0}/100`)
            ])
          ]),
          h('div', { class: 'feedback' }, [
            h('h5', 'Feedback'),
            h('p', candidate.evaluation?.feedback || 'No feedback available')
          ])
        ])
      ]),
      okText: 'Close'
    })
  } catch (error) {
    console.error('Error loading candidate details:', error)
    message.error('Failed to load candidate details. Please try again later.')
  }
}

const scheduleInterview = (candidate) => {
  // This would be implemented in a real app
  message.info(`Schedule interview for ${candidate.name}`)
}

const updateStatus = (candidate) => {
  const statuses = ['New', 'Screening', 'Interview', 'Hired', 'Rejected']
  const currentIndex = statuses.indexOf(candidate.status)
  const nextIndex = (currentIndex + 1) % statuses.length
  const newStatus = statuses[nextIndex]
  
  Modal.confirm({
    title: 'Update Candidate Status',
    content: `Are you sure you want to update ${candidate.name}'s status to ${newStatus}?`,
    okText: 'Yes',
    cancelText: 'No',
    onOk: async () => {
      try {
        await store.dispatch('candidates/updateCandidateStatus', { id: candidate.id, status: newStatus })
        message.success(`Status updated to ${newStatus}`)
      } catch (error) {
        console.error('Error updating candidate status:', error)
        message.error('Failed to update candidate status. Please try again later.')
      }
    }
  })
}

const deleteCandidate = (candidate) => {
  Modal.confirm({
    title: 'Delete Candidate',
    content: `Are you sure you want to delete ${candidate.name}?`,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk: async () => {
      try {
        await store.dispatch('candidates/deleteCandidate', candidate.id)
        message.success('Candidate deleted successfully')
      } catch (error) {
        console.error('Error deleting candidate:', error)
        message.error('Failed to delete candidate. Please try again later.')
      }
    }
  })
}

const saveCandidate = async () => {
  try {
    if (candidateDialog.isEdit) {
      await store.dispatch('candidates/updateCandidate', {
        id: candidateForm.id,
        data: candidateForm
      })
      message.success('Candidate updated successfully')
    } else {
      await store.dispatch('candidates/createCandidate', candidateForm)
      message.success('Candidate created successfully')
    }
    
    candidateDialog.visible = false
  } catch (error) {
    console.error('Error saving candidate:', error)
    message.error('Failed to save candidate. Please try again later.')
  }
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
</style> 