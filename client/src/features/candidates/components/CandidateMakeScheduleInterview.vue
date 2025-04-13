<template>
  <div class="candidate-schedule-form">
    <a-modal
      :visible="visible"
      title="Schedule Interview"
      width="800px"
      @update:visible="$emit('update:visible', $event)"
      @ok="handleOk"
    >
      <form @submit.prevent="handleOk">
        <!-- Interview Details Section -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="text-lg font-semibold">Interview Details</h3>
            <p class="text-sm text-gray-500">Schedule an interview for {{ candidate.name }}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="form-label">Interview Type</label>
              <a-select v-model:value="formState.type" placeholder="Select interview type">
                <a-select-option value="technical">Technical Interview</a-select-option>
                <a-select-option value="hr">HR Interview</a-select-option>
                <a-select-option value="managerial">Managerial Interview</a-select-option>
                <a-select-option value="final">Final Interview</a-select-option>
              </a-select>
            </div>

            <div class="form-group">
              <label class="form-label">Date</label>
              <a-date-picker
                v-model:value="formState.date"
                style="width: 100%"
                :disabledDate="disabledDate"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Time</label>
              <a-time-picker
                v-model:value="formState.time"
                style="width: 100%"
                format="HH:mm"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Location/Meeting Link</label>
              <a-input
                v-model:value="formState.location"
                placeholder="Enter location or meeting link"
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
              v-model:value="formState.interviewers"
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
              v-model:value="formState.notes"
              placeholder="Add any additional notes"
              :rows="4"
            />
          </div>
        </div>
      </form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import candidatesService from '../api/candidates.service'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  candidate: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'saved'])

const formRef = ref(null)
const loading = ref(false)

// Mock interviewers data - in real app this would come from an API
const interviewers = ref([
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Mike Johnson' }
])

const formState = reactive({
  type: undefined,
  date: undefined,
  time: undefined,
  interviewers: [],
  location: '',
  notes: ''
})

const rules = {
  type: [{ required: true, message: 'Please select interview type' }],
  date: [{ required: true, message: 'Please select date' }],
  time: [{ required: true, message: 'Please select time' }],
  interviewers: [{ required: true, message: 'Please select at least one interviewer' }],
  location: [{ required: true, message: 'Please enter location or meeting link' }]
}

const disabledDate = (current) => {
  return current && current < dayjs().startOf('day')
}

const handleOk = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    const interviewData = {
      candidate_id: props.candidate.id,
      type: formState.type,
      date: formState.date.format('YYYY-MM-DD'),
      time: formState.time.format('HH:mm'),
      interviewers: formState.interviewers,
      location: formState.location,
      notes: formState.notes
    }

    await candidatesService.scheduleInterview(interviewData)
    message.success('Interview scheduled successfully')
    emit('saved')
    emit('update:visible', false)
  } catch (error) {
    console.error('Error scheduling interview:', error)
    message.error('Failed to schedule interview')
  } finally {
    loading.value = false
  }
}

// Reset form when modal is closed
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    formRef.value?.resetFields()
  }
})
</script>

<style scoped>
.candidate-schedule-form {
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