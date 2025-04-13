<template>
  <a-modal
    :visible="visible"
    :title="`Change Job Status - ${job?.title}`"
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
            <a-tag :color="getStatusColor(job?.status)" class="status-tag">
              {{ formatStatus(job?.status) }}
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
            <a-select-option value="Open">
              <span class="status-option">
                <span class="status-dot open"></span>
                Open
              </span>
            </a-select-option>
            <a-select-option value="Paused">
              <span class="status-option">
                <span class="status-dot paused"></span>
                Paused
              </span>
            </a-select-option>
            <a-select-option value="Closed">
              <span class="status-option">
                <span class="status-dot closed"></span>
                Closed
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
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'

const props = defineProps({
  job: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'statusChanged'])

const store = useStore()

const formState = reactive({
  status: ''
})

watch(() => props.job, (newJob) => {
  if (newJob) {
    formState.status = newJob.status
  }
}, { immediate: true })

const handleOk = async () => {
  try {
    await store.dispatch('jobs/updateJobStatus', { 
      id: props.job.id, 
      status: formState.status 
    })
    message.success('Job status updated successfully')
    emit('statusChanged')
    handleCancel()
  } catch (error) {
    console.error('Error updating job status:', error)
    message.error('Failed to update job status. Please try again later.')
  }
}

const handleCancel = () => {
  emit('update:visible', false)
}

const getStatusColor = (status) => {
  if (!status) return 'blue'
  
  const statusLower = status.toLowerCase()
  if (statusLower === 'open' || statusLower === 'active') return 'green'
  if (statusLower === 'paused') return 'orange'
  if (statusLower === 'closed') return 'red'
  if (statusLower === 'draft') return 'blue'
  
  return 'blue' // Default color
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  
  // Convert first letter to uppercase and the rest to lowercase
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

.status-dot.open {
  background-color: #52c41a;
}

.status-dot.paused {
  background-color: #faad14;
}

.status-dot.closed {
  background-color: #ff4d4f;
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