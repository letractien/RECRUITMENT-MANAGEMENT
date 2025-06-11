<template>
  <div class="application-delete-form">
    <a-modal
      :visible="visible"
      title="Delete Application"
      width="500px"
      @update:visible="$emit('update:visible', $event)"
      @ok="handleOk"
    >
      <div class="form-section">
        <div class="section-header">
          <h3 class="text-lg font-semibold">Confirm Deletion</h3>
          <p class="text-sm text-gray-500">Are you sure you want to delete this application?</p>
        </div>
        
        <div class="delete-content">
          <a-alert
            type="warning"
            show-icon
            :message="`This will permanently remove ${application?.candidateName}'s application from the system.`"
            description="This action cannot be undone. All application data including scores, interviews, and related documents will be permanently deleted."
          />
          
          <div class="delete-details">
            <div class="detail-item">
              <span class="label">Candidate:</span>
              <span class="value">{{ application?.candidateName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Status:</span>
              <span class="value">{{ formatStatus(application?.status) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Applied Date:</span>
              <span class="value">{{ formatDate(application?.appliedDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { message } from 'ant-design-vue'
import { formatDate } from '../../../shared/utils/dateHelpers'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  application: {
    type: Object,
    required: true
  },
  onDelete: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'saved'])

const formatStatus = (status) => {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

const handleOk = async () => {
  try {
    await props.onDelete(props.application)
    message.success('Application deleted successfully')
    emit('saved')
    emit('update:visible', false)
  } catch (error) {
    console.error('Error deleting application:', error)
    message.error('Failed to delete application')
  }
}
</script>

<style scoped>
.application-delete-form {
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

.delete-content {
  margin-top: 20px;
}

.delete-details {
  margin-top: 20px;
  padding: 16px;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 8px;
}

.detail-item {
  display: flex;
  margin-bottom: 8px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  color: var(--text-color, rgba(0, 0, 0, 0.85));
  width: 120px;
}

.value {
  color: var(--text-color, rgba(0, 0, 0, 0.65));
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