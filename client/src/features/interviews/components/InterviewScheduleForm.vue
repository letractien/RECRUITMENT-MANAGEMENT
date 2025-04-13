<template>
  <a-modal
    :visible="visible"
    title="Schedule Interview"
    width="800px"
    @update:visible="$emit('update:visible', $event)"
    @ok="handleOk"
  >
    <div class="interview-creation-form">
      <form @submit.prevent="handleOk">
        <!-- Basic Interview Information -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="text-lg font-semibold">Interview Information</h3>
            <p class="text-sm text-gray-500">Please fill in the following information to schedule an interview</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="form-label">Candidate</label>
              <a-select
                v-model:value="form.candidate"
                placeholder="Select candidate"
              >
                <a-select-option
                  v-for="candidate in candidates"
                  :key="candidate.id"
                  :value="candidate.name"
                >
                  {{ candidate.name }}
                </a-select-option>
              </a-select>
            </div>
            <div class="form-group">
              <label class="form-label">Position</label>
              <a-select
                v-model:value="form.position"
                placeholder="Select position"
              >
                <a-select-option
                  v-for="job in jobs"
                  :key="job.id"
                  :value="job.title"
                >
                  {{ job.title }}
                </a-select-option>
              </a-select>
            </div>
            <div class="form-group">
              <label class="form-label">Interview Type</label>
              <a-select
                v-model:value="form.interviewType"
                placeholder="Select type"
              >
                <a-select-option value="Phone Screen">Phone Screen</a-select-option>
                <a-select-option value="Video">Video</a-select-option>
                <a-select-option value="Onsite">Onsite</a-select-option>
                <a-select-option value="Technical">Technical</a-select-option>
                <a-select-option value="HR">HR</a-select-option>
              </a-select>
            </div>
            <div class="form-group">
              <label class="form-label">Location/Meeting Link</label>
              <a-input
                v-model:value="form.location"
                placeholder="Enter location or meeting link"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Date</label>
              <a-date-picker
                v-model:value="form.date"
                placeholder="Select date"
                :disabledDate="disabledDate"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Time</label>
              <a-time-picker
                v-model:value="form.time"
                format="HH:mm"
                placeholder="Select time"
              />
            </div>
          </div>
        </div>

        <!-- Interviewers Section -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="text-lg font-semibold">Interviewers</h3>
            <p class="text-sm text-gray-500">Select interviewers for this session</p>
          </div>
          <div class="form-group">
            <a-select
              v-model:value="form.interviewers"
              mode="multiple"
              placeholder="Select interviewers"
              style="width: 100%"
            >
              <a-select-option v-for="interviewer in interviewers" :key="interviewer.id" :value="interviewer.id">
                {{ interviewer.name }}
              </a-select-option>
            </a-select>
          </div>
        </div>

        <!-- Notes Section -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="text-lg font-semibold">Additional Information</h3>
            <p class="text-sm text-gray-500">Add any notes or special instructions</p>
          </div>
          <div class="form-group">
            <a-textarea
              v-model:value="form.notes"
              :rows="4"
              placeholder="Additional notes about the interview"
            />
          </div>
        </div>
      </form>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { message } from 'ant-design-vue'
import { useStore } from 'vuex'
import dayjs from 'dayjs'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  candidates: {
    type: Array,
    required: true
  },
  jobs: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'saved'])

const store = useStore()

// Mock interviewers data - in real app this would come from an API
const interviewers = ref([
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Mike Johnson' }
])

const form = ref({
  candidate: '',
  position: '',
  interviewType: '',
  date: null,
  time: null,
  interviewers: [],
  location: '',
  notes: ''
})

const disabledDate = (current) => {
  return current && current < dayjs().startOf('day')
}

const handleOk = async () => {
  try {
    // Check if form is valid
    if (!form.value.candidate || !form.value.position || 
        !form.value.interviewType || !form.value.date || 
        !form.value.time || !form.value.location || 
        form.value.interviewers.length === 0) {
      message.warning('Please fill out all required fields');
      return;
    }
    
    // Format datetime from separate date and time inputs
    const scheduledAt = new Date(
      form.value.date.getFullYear(),
      form.value.date.getMonth(),
      form.value.date.getDate(),
      form.value.time.getHours(),
      form.value.time.getMinutes()
    ).toISOString();
    
    // Find selected candidate and job from selectors
    const selectedCandidate = props.candidates.find(c => c.name === form.value.candidate || c.fullName === form.value.candidate);
    const selectedJob = props.jobs.find(j => j.title === form.value.position);
    
    if (!selectedCandidate || !selectedJob) {
      message.warning('Invalid candidate or job selection');
      return;
    }
    
    // Create interview data object
    const interviewData = {
      candidateId: selectedCandidate.id,
      candidateName: selectedCandidate.name || selectedCandidate.fullName,
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      interviewType: form.value.interviewType,
      scheduledAt,
      duration: 60, // Default duration in minutes
      notes: form.value.notes,
      interviewers: form.value.interviewers,
      location: form.value.location,
      status: 'scheduled'
    };
    
    const result = await store.dispatch('interviews/createInterview', interviewData);
    
    if (result) {
      message.success('Interview scheduled successfully');
      emit('update:visible', false);
      emit('saved');
      resetForm();
    } else {
      message.error('Failed to schedule interview');
    }
  } catch (error) {
    message.error('Failed to schedule interview: ' + (error.message || 'Unknown error'));
    console.error('Error scheduling interview:', error);
  }
}

const resetForm = () => {
  form.value = {
    candidate: '',
    position: '',
    interviewType: '',
    date: null,
    time: null,
    interviewers: [],
    location: '',
    notes: ''
  }
}
</script>

<style scoped>
.interview-creation-form {
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

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: var(--input-bg, white);
  color: var(--text-color, rgba(0, 0, 0, 0.85));
  height: 40px;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.form-input::placeholder {
  color: var(--text-color, rgba(0, 0, 0, 0.45));
}

textarea.form-input {
  height: auto;
  min-height: 80px;
  resize: vertical;
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

/* Spacing utilities */
.mt-6 {
  margin-top: 1.5rem;
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

/* Custom styles for Ant Design Select */
:deep(.ant-select) {
  width: 100%;
  height: 40px;
}

:deep(.ant-select-selector) {
  height: 40px !important;
  padding: 4px 12px !important;
  border: 1px solid var(--border-color, #d1d5db) !important;
  border-radius: 6px !important;
  background-color: var(--input-bg, white) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: flex !important;
  align-items: center !important;
}

/* Custom styles for Input */
:deep(.ant-input) {
  height: 40px !important;
  padding: 4px 12px !important;
  border: 1px solid var(--border-color, #d1d5db) !important;
  border-radius: 6px !important;
  background-color: var(--input-bg, white) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.ant-input:hover) {
  border-color: #1890ff !important;
}

:deep(.ant-input:focus) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1) !important;
}

/* Custom styles for Date and Time pickers */
:deep(.ant-picker) {
  width: 100% !important;
  height: 40px !important;
  padding: 4px 12px !important;
  border: 1px solid var(--border-color, #d1d5db) !important;
  border-radius: 6px !important;
  background-color: var(--input-bg, white) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: flex !important;
  align-items: center !important;
}

/* Custom styles for Textarea */
:deep(.ant-input-textarea) {
  width: 100% !important;
}

:deep(.ant-input-textarea textarea) {
  padding: 8px 12px !important;
  border: 1px solid var(--border-color, #d1d5db) !important;
  border-radius: 6px !important;
  background-color: var(--input-bg, white) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  min-height: 80px !important;
}

:deep(.ant-input-textarea textarea:hover) {
  border-color: #1890ff !important;
}

:deep(.ant-input-textarea textarea:focus) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1) !important;
}

/* Custom styles for Ant Design Select */
:deep(.ant-select-selector) {
  height: 40px !important;
  padding: 4px 12px !important;
  border: 1px solid var(--border-color, #d1d5db) !important;
  border-radius: 6px !important;
  background-color: var(--input-bg, white) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.ant-select-selector:hover) {
  border-color: #1890ff !important;
}

:deep(.ant-select-focused .ant-select-selector) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1) !important;
}

:deep(.ant-select-selection-item) {
  line-height: 32px !important;
  color: var(--text-color, rgba(0, 0, 0, 0.85)) !important;
}

:deep(.ant-select-arrow) {
  color: var(--text-color, rgba(0, 0, 0, 0.45)) !important;
}

:deep(.ant-select-dropdown) {
  border-radius: 6px !important;
  box-shadow: 0 4px 12px var(--shadow-color, rgba(0, 0, 0, 0.1)) !important;
  border: 1px solid var(--border-color, #f0f0f0) !important;
  background-color: var(--card-bg, white) !important;
}

:deep(.ant-select-item) {
  color: var(--text-color, rgba(0, 0, 0, 0.85)) !important;
  padding: 8px 12px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.ant-select-item:hover) {
  background-color: var(--hover-bg, #f5f5f5) !important;
}

:deep(.ant-select-item-option-selected) {
  background-color: rgba(24, 144, 255, 0.1) !important;
  color: #1890ff !important;
}

:deep(.ant-select-item-option-active) {
  background-color: var(--hover-bg, #f5f5f5) !important;
}

/* Custom styles for Date and Time pickers */
:deep(.ant-picker) {
  width: 100% !important;
  height: 40px !important;
  padding: 4px 12px !important;
  border: 1px solid var(--border-color, #d1d5db) !important;
  border-radius: 6px !important;
  background-color: var(--input-bg, white) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.ant-picker:hover) {
  border-color: #1890ff !important;
}

:deep(.ant-picker-focused) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1) !important;
}

:deep(.ant-picker-input > input) {
  color: var(--text-color, rgba(0, 0, 0, 0.85)) !important;
}

:deep(.ant-picker-suffix) {
  color: var(--text-color, rgba(0, 0, 0, 0.45)) !important;
}

:deep(.ant-picker-dropdown) {
  border-radius: 6px !important;
  box-shadow: 0 4px 12px var(--shadow-color, rgba(0, 0, 0, 0.1)) !important;
  border: 1px solid var(--border-color, #f0f0f0) !important;
  background-color: var(--card-bg, white) !important;
}

:deep(.ant-picker-panel) {
  background-color: var(--card-bg, white) !important;
}

:deep(.ant-picker-cell) {
  color: var(--text-color, rgba(0, 0, 0, 0.85)) !important;
}

:deep(.ant-picker-cell:hover .ant-picker-cell-inner) {
  background-color: var(--hover-bg, #f5f5f5) !important;
}

:deep(.ant-picker-cell-selected .ant-picker-cell-inner) {
  background-color: #1890ff !important;
  color: white !important;
}

:deep(.ant-picker-time-panel-column > li.ant-picker-time-panel-cell-selected .ant-picker-time-panel-cell-inner) {
  background-color: rgba(24, 144, 255, 0.1) !important;
  color: #1890ff !important;
}
</style> 