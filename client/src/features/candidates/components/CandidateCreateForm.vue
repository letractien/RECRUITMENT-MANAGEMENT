<template>
  <div class="candidate-creation-form">
    <a-modal
      :visible="visible"
      :title="isEdit ? 'Edit Candidate' : 'Add Candidate'"
      width="800px"
      @update:visible="$emit('update:visible', $event)"
      @ok="handleOk"
    >
      <form @submit.prevent="handleOk">
        <!-- Basic Information -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="text-lg font-semibold">Candidate Information</h3>
            <p class="text-sm text-gray-500">Please fill in the following information about the candidate</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <a-input
                v-model:value="form.name"
                placeholder="Enter candidate's full name"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <a-input
                v-model:value="form.email"
                type="email"
                placeholder="Enter candidate's email"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <a-input
                v-model:value="form.phone"
                placeholder="Enter candidate's phone number"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Position</label>
              <a-select
                v-model:value="form.position"
                placeholder="Select position"
              >
                <a-select-option
                  v-for="job in availableJobs"
                  :key="job.value"
                  :value="job.value"
                >
                  {{ job.label }}
                </a-select-option>
              </a-select>
            </div>
            <div class="form-group">
              <label class="form-label">Experience (years)</label>
              <a-input-number
                v-model:value="form.experience"
                :min="0"
                :max="50"
                style="width: 100%"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <a-select
                v-model:value="form.status"
                placeholder="Select status"
              >
                <a-select-option value="New">New</a-select-option>
                <a-select-option value="Screening">Screening</a-select-option>
                <a-select-option value="Interview">Interview</a-select-option>
                <a-select-option value="Hired">Hired</a-select-option>
                <a-select-option value="Rejected">Rejected</a-select-option>
              </a-select>
            </div>
          </div>
        </div>

        <!-- Resume Section -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="text-lg font-semibold">Resume</h3>
            <p class="text-sm text-gray-500">Upload candidate's resume and additional documents</p>
          </div>
          <div class="form-group">
            <a-upload
              action="#"
              :multiple="false"
              :showUploadList="true"
              class="upload-area"
            >
              <a-button class="upload-button">
                <template #icon><upload-outlined /></template>
                Select File
              </a-button>
            </a-upload>
          </div>
        </div>

        <!-- Evaluation Scores -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="text-lg font-semibold">Evaluation Scores</h3>
            <p class="text-sm text-gray-500">Enter candidate's evaluation scores</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="form-label">Background Score</label>
              <a-input-number
                v-model:value="form.background_score"
                :min="0"
                :max="100"
                style="width: 100%"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Project Score</label>
              <a-input-number
                v-model:value="form.project_score"
                :min="0"
                :max="100"
                style="width: 100%"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Skill Score</label>
              <a-input-number
                v-model:value="form.skill_score"
                :min="0"
                :max="100"
                style="width: 100%"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Certificate Score</label>
              <a-input-number
                v-model:value="form.certificate_score"
                :min="0"
                :max="100"
                style="width: 100%"
              />
            </div>
          </div>
        </div>
      </form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, watch } from 'vue'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import candidatesService from '../api/candidates.service'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  candidate: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'saved'])

const store = useStore()

const form = reactive({
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

const handleOk = async () => {
  try {
    // Validate form
    if (!form.name || !form.email || !form.position) {
      message.error('Please fill in all required fields')
      return
    }

    // Prepare data for API
    const candidateData = {
      name: form.name,
      email: form.email,
      phone: form.phone || '',
      position: form.position,
      department: form.department || 'General',
      experience: form.experience || 0,
      status: form.status.toLowerCase(),
      skills: form.skills || [],
      notes: form.notes || '',
      resume_url: form.resume_url || null,
      salary_expectation: form.salary_expectation || null,
      background_score: form.background_score || 0,
      project_score: form.project_score || 0,
      skill_score: form.skill_score || 0,
      certificate_score: form.certificate_score || 0,
      total_score: form.total_score || 0
    }

    if (props.isEdit && form.id) {
      // Update existing candidate
      await candidatesService.updateCandidate(form.id, candidateData)
      message.success('Candidate updated successfully')
    } else {
      // Create new candidate
      await candidatesService.createCandidate(candidateData)
      message.success('Candidate added successfully')
    }

    // Close dialog and emit saved event
    emit('update:visible', false)
    emit('saved')
    resetForm()
  } catch (error) {
    console.error('Error saving candidate:', error)
    message.error('Failed to save candidate')
  }
}

const resetForm = () => {
  Object.assign(form, {
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

// Watch for changes in props.candidate to update form when editing
watch(() => props.candidate, (newCandidate) => {
  if (newCandidate && props.isEdit) {
    Object.assign(form, {
      id: newCandidate.id,
      name: newCandidate.name,
      email: newCandidate.email,
      phone: newCandidate.phone,
      position: newCandidate.position,
      experience: newCandidate.experience,
      status: newCandidate.status,
      appliedDate: newCandidate.appliedDate,
      resume: newCandidate.resume,
      skills: newCandidate.skills || [],
      notes: newCandidate.notes || '',
      background_score: newCandidate.background_score || 0,
      project_score: newCandidate.project_score || 0,
      skill_score: newCandidate.skill_score || 0,
      certificate_score: newCandidate.certificate_score || 0,
      total_score: newCandidate.total_score || 0
    })
  }
}, { immediate: true })
</script>

<style scoped>
.candidate-creation-form {
  max-width: 1200px;
  margin: 0 auto;
}

/* Target Ant Design modal body */
:global(.ant-modal-body) {
  padding: 0 !important;
}

:global(.ant-modal-content) {
  padding: 0 !important;
}

:global(.ant-modal-header .ant-modal-title) {
  font-size: 24px !important;
  font-weight: 700 !important;
  text-align: center !important;
}

.form-section {
  background: var(--card-bg, white);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px var(--shadow-color, rgba(0, 0, 0, 0.1));
  border: 1px solid var(--border-color, #f0f0f0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 20px;
}

.form-section:hover {
  box-shadow: 0 8px 16px var(--shadow-color, rgba(0, 0, 0, 0.1));
}

.section-header {
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color, #f0f0f0);
  padding-bottom: 12px;
}

.section-header h3 {
  color: var(--text-color, rgba(0, 0, 0, 0.85));
  margin-bottom: 4px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.section-header p {
  color: var(--text-color, rgba(0, 0, 0, 0.45));
  font-size: 14px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color, rgba(0, 0, 0, 0.85));
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}

/* Grid layout */
.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.md\:grid-cols-2 {
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.gap-6 {
  gap: 1.5rem;
}

/* Text utilities */
.text-lg {
  font-size: 1.125rem;
}

.font-semibold {
  font-weight: 600;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-500 {
  color: var(--text-color, rgba(0, 0, 0, 0.45));
}

/* Override Ant Design default styles */
:deep(.ant-input) {
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 6px;
  height: 40px;
  background-color: var(--input-bg, white);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-input:hover) {
  border-color: #1890ff !important;
}

:deep(.ant-input:focus) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1) !important;
}

:deep(.ant-input-number) {
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 6px;
  width: 100%;
  height: 40px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-input-number-input) {
  height: 38px !important;
  border-radius: 6px !important;
  padding: 4px 12px !important;
}

:deep(.ant-input-number-handler-wrap) {
  border-radius: 6px !important;
}

:deep(.ant-input-number-handler) {
  border-radius: 6px !important;
}

:deep(.ant-input-number-handler-up) {
  border-top-right-radius: 6px !important;
}

:deep(.ant-input-number-handler-down) {
  border-bottom-right-radius: 6px !important;
}

:deep(.ant-input-number-focused) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1) !important;
}

:deep(.ant-input-number:hover) {
  border-color: #1890ff !important;
}

:deep(.ant-select) {
  width: 100%;
  height: 40px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 6px;
  height: 40px !important;
  padding: 4px 12px !important;
  background-color: var(--input-bg, white);
  display: flex !important;
  align-items: center !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-select:not(.ant-select-disabled):hover .ant-select-selector) {
  border-color: #1890ff !important;
}

:deep(.ant-select-focused:not(.ant-select-disabled) .ant-select-selector) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1) !important;
}

:deep(.ant-select-single:not(.ant-select-customize-input) .ant-select-selector .ant-select-selection-search-input) {
  height: 38px;
}

:deep(.ant-select-single .ant-select-selector .ant-select-selection-item),
:deep(.ant-select-single .ant-select-selector .ant-select-selection-placeholder) {
  line-height: 38px;
  color: var(--text-color, rgba(0, 0, 0, 0.85));
}

:deep(.ant-select-arrow) {
  color: var(--text-color, rgba(0, 0, 0, 0.45));
}

:deep(.ant-select-dropdown) {
  border-radius: 6px;
  box-shadow: 0 4px 12px var(--shadow-color, rgba(0, 0, 0, 0.1));
  border: 1px solid var(--border-color, #f0f0f0);
  background-color: var(--card-bg, white);
}

:deep(.ant-select-item) {
  color: var(--text-color, rgba(0, 0, 0, 0.85));
  padding: 8px 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.ant-select-item:hover) {
  background-color: var(--hover-bg, #f5f5f5);
}

:deep(.ant-select-item-option-selected) {
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

:deep(.ant-select-item-option-active) {
  background-color: var(--hover-bg, #f5f5f5);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --text-color: rgba(255, 255, 255, 0.85);
    --border-color: #303030;
    --card-bg: #1f1f1f;
    --input-bg: #141414;
    --hover-bg: #303030;
    --shadow-color: rgba(0, 0, 0, 0.3);
  }
}

/* Light mode variables */
:root {
  --text-color: rgba(0, 0, 0, 0.85);
  --border-color: #f0f0f0;
  --card-bg: white;
  --input-bg: white;
  --hover-bg: #f5f5f5;
  --shadow-color: rgba(0, 0, 0, 0.1);
}
</style> 