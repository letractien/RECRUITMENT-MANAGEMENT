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

      <a-table
        :dataSource="paginatedCandidates"
        :columns="columns"
        :pagination="false"
        size="middle"
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

      <div class="pagination-container">
        <a-pagination
          v-model:current="currentPage"
          v-model:pageSize="pageSize"
          :total="filteredCandidates.length"
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
import { ref, reactive, computed } from 'vue'
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

const candidates = ref(
  Array.from({ length: 1000 }, (_, index) => ({
    key: index + 1,
    id: index + 1,
    name: `Candidate ${index + 1}`,
    email: `candidate${index + 1}@example.com`,
    phone: `+84 ${Math.floor(Math.random() * 900000000) + 100000000}`,
    position: ['Senior Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Product Manager'][Math.floor(Math.random() * 4)],
    experience: Math.floor(Math.random() * 10) + 1,
    status: ['New', 'Screening', 'Interview', 'Hired', 'Rejected'][Math.floor(Math.random() * 5)],
    appliedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    avatar: ''
  }))
)

const currentPage = ref(1)
const pageSize = ref(10)

const availableJobs = [
  { label: 'Senior Frontend Developer', value: 'Senior Frontend Developer' },
  { label: 'Backend Developer', value: 'Backend Developer' },
  { label: 'UI/UX Designer', value: 'UI/UX Designer' },
  { label: 'Product Manager', value: 'Product Manager' }
]

const filteredCandidates = computed(() => {
  return candidates.value.filter(candidate => {
    const matchesSearch = search.value === '' || 
      candidate.name.toLowerCase().includes(search.value.toLowerCase()) ||
      candidate.email.toLowerCase().includes(search.value.toLowerCase())
    
    const matchesStatus = statusFilter.value === '' || 
      candidate.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

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
  status: 'New'
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
    'Interview': 'geekblue',
    'Hired': 'green',
    'Rejected': 'red'
  }
  return colors[status] || 'blue'
}

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
    status: 'New'
  })
}

const viewCandidate = (candidate) => {
  // Implement view candidate details
  console.log('View candidate:', candidate)
}

const scheduleInterview = (candidate) => {
  // Implement interview scheduling
  console.log('Schedule interview for:', candidate)
}

const updateStatus = (candidate) => {
  // Implement status update
  console.log('Update status for:', candidate)
}

const deleteCandidate = (candidate) => {
  Modal.confirm({
    title: 'Warning',
    content: 'Are you sure you want to delete this candidate?',
    okText: 'Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk() {
      candidates.value = candidates.value.filter(item => item.id !== candidate.id)
      message.success('Candidate deleted successfully')
    }
  })
}

const saveCandidate = () => {
  // Add validation here
  if (candidateDialog.isEdit) {
    const index = candidates.value.findIndex(c => c.id === candidateForm.id)
    if (index !== -1) {
      candidates.value[index] = { ...candidateForm, key: candidateForm.id }
    }
  } else {
    const newCandidate = {
      ...candidateForm,
      id: candidates.value.length + 1,
      key: candidates.value.length + 1,
      appliedDate: new Date().toISOString().split('T')[0],
      avatar: ''
    }
    candidates.value.push(newCandidate)
  }
  candidateDialog.visible = false
  message.success(`Candidate ${candidateDialog.isEdit ? 'updated' : 'added'} successfully`)
}

const handleSizeChange = (current, size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
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
  color: rgba(0, 0, 0, 0.85);
}

.candidate-email {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
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
</style> 