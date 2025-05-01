<template>
  <a-modal
    :visible="visible"
    :title="`Update Status - ${candidate?.name}`"
    @ok="handleOk"
    @cancel="handleCancel"
    @update:visible="(val) => $emit('update:visible', val)"
    width="600px"
    :okButtonProps="{ type: 'primary', size: 'large' }"
    :cancelButtonProps="{ size: 'large' }"
  >
    <div class="status-change-form">
      <a-form :model="formState" layout="vertical">
        <a-form-item label="Current Status" class="form-item">
          <div class="current-status">
            <a-tag :color="getStatusColor(candidate?.status)" class="status-tag">
              {{ formatStatus(candidate?.status) }}
            </a-tag>
          </div>
        </a-form-item>

        <a-form-item 
          label="New Status" 
          name="status"
          class="form-item"
          :rules="[{ required: true, message: 'Please select a new status' }]"
        >
          <a-select
            v-model:value="formState.status"
            placeholder="Select new status"
            class="status-select"
          >
            <a-select-option value="new">
              <span class="status-option">
                <span class="status-dot new"></span>
                New
              </span>
            </a-select-option>
            <a-select-option value="screening">
              <span class="status-option">
                <span class="status-dot screening"></span>
                Screening
              </span>
            </a-select-option>
            <a-select-option value="interview">
              <span class="status-option">
                <span class="status-dot interview"></span>
                Interview
              </span>
            </a-select-option>
            <a-select-option value="offer">
              <span class="status-option">
                <span class="status-dot offer"></span>
                Offer
              </span>
            </a-select-option>
            <a-select-option value="hired">
              <span class="status-option">
                <span class="status-dot hired"></span>
                Hired
              </span>
            </a-select-option>
            <a-select-option value="rejected">
              <span class="status-option">
                <span class="status-dot rejected"></span>
                Rejected
              </span>
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import candidatesService from '../api/candidates.service'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  candidate: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['update:visible', 'saved'])

const formState = reactive({
  status: ''
})

watch(() => props.candidate, (newVal) => {
  if (newVal) {
    formState.status = newVal.status
  }
}, { immediate: true })

const handleOk = async () => {
  try {

    await candidatesService.updateCandidateStatus(props.candidate.id, formState.status)
    message.success(`Status updated to ${formatStatus(formState.status)}`)
    emit('saved')
    handleCancel()
  } catch (error) {
    message.error('Failed to update status')
  }
}

const handleCancel = () => {
  emit('update:visible', false)
}

const getStatusColor = (status) => {
  const colors = {
    'New': 'blue',
    'Screening': 'orange',
    'Interview': 'purple',
    'Offer': 'geekblue',
    'Hired': 'green',
    'Rejected': 'red'
  }
  return colors[status] || 'default'
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}
</script>

<style scoped>
.status-change-form {
  padding: 24px;
}

.form-item {
  margin-bottom: 24px;
}

.current-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-tag {
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 4px;
}

.status-select {
  width: 100%;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.new {
  background-color: #1890ff;
}

.status-dot.screening {
  background-color: #faad14;
}

.status-dot.interview {
  background-color: #722ed1;
}

.status-dot.offer {
  background-color: #2f54eb;
}

.status-dot.hired {
  background-color: #52c41a;
}

.status-dot.rejected {
  background-color: #f5222d;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: var(--text-color);
}

:deep(.ant-select-selector) {
  height: 40px;
  border-radius: 6px;
}

:deep(.ant-select-selection-item) {
  display: flex;
  align-items: center;
}

:deep(.ant-modal-content) {
  border-radius: 8px;
}

:deep(.ant-modal-header) {
  border-bottom: 1px solid var(--border-color);
  padding: 16px 24px;
}

:deep(.ant-modal-body) {
  padding: 0;
}

:deep(.ant-modal-footer) {
  border-top: 1px solid var(--border-color);
  padding: 16px 24px;
}
</style> 