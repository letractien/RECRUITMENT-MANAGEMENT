<template>
  <div class="candidate-scores-form">
    <a-modal
      :visible="visible"
      title="Update Candidate Scores"
      width="800px"
      @update:visible="$emit('update:visible', $event)"
      @ok="handleOk"
    >
      <form @submit.prevent="handleOk">
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
                v-model:value="formState.background_score" 
                :min="0" 
                :max="100" 
                style="width: 100%"
              />
              <div class="score-hint">Evaluate candidate's work history and education</div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Project Score</label>
              <a-input-number 
                v-model:value="formState.project_score" 
                :min="0" 
                :max="100" 
                style="width: 100%"
              />
              <div class="score-hint">Evaluate candidate's past projects and accomplishments</div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Skill Score</label>
              <a-input-number 
                v-model:value="formState.skill_score" 
                :min="0" 
                :max="100" 
                style="width: 100%"
              />
              <div class="score-hint">Evaluate candidate's technical and soft skills</div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Certificate Score</label>
              <a-input-number 
                v-model:value="formState.certificate_score" 
                :min="0" 
                :max="100" 
                style="width: 100%"
              />
              <div class="score-hint">Evaluate candidate's certifications and qualifications</div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Total Score</label>
              <a-input-number 
                v-model:value="formState.total_score" 
                :min="0" 
                :max="100" 
                style="width: 100%"
              />
              <a-button type="link" @click="calculateTotalScore">Calculate Average</a-button>
            </div>
          </div>
        </div>
      </form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
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

const formState = reactive({
  background_score: 0,
  project_score: 0,
  skill_score: 0,
  certificate_score: 0,
  total_score: 0
})

// Watch for changes in candidate prop to update form
watch(() => props.candidate, (newCandidate) => {
  if (newCandidate) {
    formState.background_score = newCandidate.background_score || 0
    formState.project_score = newCandidate.project_score || 0
    formState.skill_score = newCandidate.skill_score || 0
    formState.certificate_score = newCandidate.certificate_score || 0
    formState.total_score = newCandidate.total_score || 0
  }
}, { immediate: true })

const calculateTotalScore = () => {
  const scores = [
    formState.background_score,
    formState.project_score,
    formState.skill_score,
    formState.certificate_score
  ]
  const sum = scores.reduce((acc, score) => acc + (score || 0), 0)
  formState.total_score = Math.round(sum / scores.length)
}

const handleOk = async () => {
  try {
    await candidatesService.updateCandidate(props.candidate.id, {
      background_score: formState.background_score,
      project_score: formState.project_score,
      skill_score: formState.skill_score,
      certificate_score: formState.certificate_score,
      total_score: formState.total_score
    })
    
    message.success('Candidate scores updated successfully')
    emit('saved')
    emit('update:visible', false)
  } catch (error) {
    console.error('Error updating scores:', error)
    message.error('Failed to update scores')
  }
}
</script>

<style scoped>
.candidate-scores-form {
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

.score-hint {
  color: var(--text-color, rgba(0, 0, 0, 0.45));
  font-size: 12px;
  margin-top: 4px;
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