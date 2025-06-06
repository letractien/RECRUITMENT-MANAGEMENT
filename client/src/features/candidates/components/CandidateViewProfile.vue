<template>
  <div class="candidate-profile-form">
    <a-modal
      :visible="visible"
      :title="candidate ? `${candidate.name}'s Profile` : 'Candidate Profile'"
      width="800px"
      :footer="null"
      @update:visible="$emit('update:visible', $event)"
    >
      <a-spin :spinning="loading">
        <div class="candidate-profile" v-if="candidate">
          <!-- Basic Information Section -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="text-lg font-semibold">Basic Information</h3>
              <p class="text-sm text-gray-500">Candidate's personal and contact details</p>
            </div>
            <div class="profile-header">
              <a-avatar :size="64" class="profile-avatar">
                {{ candidate.name ? candidate.name.charAt(0).toUpperCase() : 'U' }}
              </a-avatar>
              <div class="profile-info">
                <h2 class="candidate-name">{{ candidate.name }}</h2>
                <div class="candidate-email">{{ candidate.email }}</div>
                <div class="candidate-status">
                  <a-tag :color="getStatusColor(candidate.status)">
                    {{ candidate.status }}
                  </a-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Details Section -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="text-lg font-semibold">Contact Details</h3>
              <p class="text-sm text-gray-500">Candidate's contact information</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label class="form-label">Phone</label>
                <div class="form-value">{{ candidate.phone || 'N/A' }}</div>
              </div>
              <div class="form-group">
                <label class="form-label">Sex</label>
                <div class="form-value">
                  <span v-if="candidate.sex">
                    <man-outlined v-if="candidate.sex.toLowerCase() === 'male'" />
                    <woman-outlined v-if="candidate.sex.toLowerCase() === 'female'" />
                    {{ candidate.sex.charAt(0).toUpperCase() + candidate.sex.slice(1).toLowerCase() }}
                  </span>
                  <span v-else>N/A</span>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Position Applied</label>
                <div class="form-value">{{ candidate.position || 'N/A' }}</div>
              </div>
              <div class="form-group">
                <label class="form-label">Address</label>
                <div class="form-value">{{ candidate.address || 'N/A' }}</div>
              </div>
              <div class="form-group">
                <label class="form-label">External Links</label>
                <div class="form-value">
                  <ul class="external-links-list" v-if="candidate.external_links && candidate.external_links.length > 0">
                    <li v-for="link in candidate.external_links" :key="link" class="external-link-item">
                      <a :href="link.split(': ')[1]" target="_blank" rel="noopener noreferrer" class="external-link">
                        <link-outlined /> {{ link }}
                      </a>
                    </li>
                  </ul>
                  <span v-else>N/A</span>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Career Goal</label>
                <div class="form-value">{{ candidate.career_goal || 'N/A' }}</div>
              </div>
              <div class="form-group">
                <label class="form-label">Education</label>
                <div class="form-value">
                  <ul class="education-list" v-if="candidate.educations && candidate.educations.length > 0">
                    <li v-for="education in candidate.educations" :key="education" class="education-item">
                      {{ education }}
                    </li>
                  </ul>
                  <span v-else>N/A</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Applied Date</label>
                <div class="form-value">{{ formatDate(candidate.applied_date) }}</div>
              </div>
            </div>
          </div>

          <!-- Skills Section -->
          <div class="form-section" v-if="candidate.skills && candidate.skills.length">
            <div class="section-header">
              <h3 class="text-lg font-semibold">Skills</h3>
              <p class="text-sm text-gray-500">Candidate's technical and professional skills</p>
            </div>
            <div class="skills-list">
              <a-tag v-for="skill in candidate.skills" :key="skill">
                {{ skill }}
              </a-tag>
            </div>
          </div>

          <!-- Resume Section -->
          <div class="form-section" v-if="candidate.resume_url">
            <div class="section-header">
              <h3 class="text-lg font-semibold">Resume</h3>
              <p class="text-sm text-gray-500">Candidate's resume</p>
            </div>
            <div class="resume-content">
              <iframe
                :src="candidate.resume_drive_url ? candidate.resume_drive_url.replace('/view', '/preview') : ''"
                width="100%"
                height="500"
                class="pdf-frame"
              />
              <div class="resume-actions">
                <a :href="candidate.resume_drive_url" target="_blank" class="view-button">
                  <eye-outlined /> View Resume
                </a>
                <a :href="candidate.resume_download_url" download class="download-button">
                  <download-outlined /> Download
                </a>
              </div>
            </div>
          </div>

          <!-- Evaluation Scores Section -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="text-lg font-semibold">Evaluation Scores</h3>
              <p class="text-sm text-gray-500">Candidate's performance evaluation</p>
            </div>
            <a-spin :spinning="jobLoading">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-group">
                  <label class="form-label">Background Score</label>
                  <div class="score-display">
                    <span class="score-value">{{ candidate.background_score || 0 }}</span>
                    <span class="score-max">/{{ job ? (job.background_criteria.importance_ratio || 0) : 0 }}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Project Score</label>
                  <div class="score-display">
                    <span class="score-value">{{ candidate.project_score || 0 }}</span>
                    <span class="score-max">/{{ job ? (job.project_criteria.importance_ratio || 0) : 0 }}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Skill Score</label>
                  <div class="score-display">
                    <span class="score-value">{{ candidate.skill_score || 0 }}</span>
                    <span class="score-max">/{{ job ? (job.skill_criteria.importance_ratio || 0) : 0 }}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Certificate Score</label>
                  <div class="score-display">
                    <span class="score-value">{{ candidate.certificate_score || 0 }}</span>
                    <span class="score-max">/{{ job ? (job.certification_criteria.importance_ratio || 0) : 0 }}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Total Score</label>
                  <div class="score-display total-score">
                    <span class="score-value">{{ candidate.total_score || 0 }}</span>
                    <span class="score-max">/{{ totalImportanceRatio }}</span>
                  </div>
                </div>
              </div>
            </a-spin>
          </div>

          <!-- Notes Section -->
          <div class="form-section" v-if="candidate.notes">
            <div class="section-header">
              <h3 class="text-lg font-semibold">Notes</h3>
              <p class="text-sm text-gray-500">Additional information about the candidate</p>
            </div>
            <div class="notes-content">
              {{ candidate.notes }}
            </div>
          </div>

          <!-- Timeline Section -->
          <div class="form-section">
            <div class="section-header">
              <h3 class="text-lg font-semibold">Application Timeline</h3>
              <p class="text-sm text-gray-500">Candidate's application progress</p>
            </div>
            <a-timeline>
              <a-timeline-item color="green">
                <template #dot>
                  <check-circle-outlined style="font-size: 16px" />
                </template>
                <div class="timeline-item">
                  <div class="timeline-title">Application Submitted</div>
                  <div class="timeline-date">{{ formatDate(candidate.applied_date) }}</div>
                  <div class="timeline-description">Candidate applied for {{ candidate.position || 'this' }} position</div>
                </div>
              </a-timeline-item>
              
              <a-timeline-item :color="getTimelineColor('screening', candidate.status)">
                <template #dot>
                  <file-search-outlined style="font-size: 16px" />
                </template>
                <div class="timeline-item">
                  <div class="timeline-title">Screening</div>
                  <div class="timeline-date" v-if="candidate.screening_date">{{ formatDate(candidate.screening_date) }}</div>
                  <div class="timeline-description">Initial resume and application review</div>
                </div>
              </a-timeline-item>

              <a-timeline-item :color="getTimelineColor('interview', candidate.status)">
                <template #dot>
                  <team-outlined style="font-size: 16px" />
                </template>
                <div class="timeline-item">
                  <div class="timeline-title">Interview</div>
                  <div class="timeline-date" v-if="candidate.interview_date">{{ formatDate(candidate.interview_date) }}</div>
                  <div class="timeline-description">Technical and cultural fit assessment</div>
                </div>
              </a-timeline-item>

              <a-timeline-item :color="getTimelineColor('offer', candidate.status)">
                <template #dot>
                  <gift-outlined style="font-size: 16px" />
                </template>
                <div class="timeline-item">
                  <div class="timeline-title">Offer</div>
                  <div class="timeline-date" v-if="candidate.offer_date">{{ formatDate(candidate.offer_date) }}</div>
                  <div class="timeline-description">Job offer extended</div>
                </div>
              </a-timeline-item>

              <a-timeline-item :color="getTimelineColor('hired', candidate.status)">
                <template #dot>
                  <user-add-outlined style="font-size: 16px" />
                </template>
                <div class="timeline-item">
                  <div class="timeline-title">Hired</div>
                  <div class="timeline-date" v-if="candidate.hired_date">{{ formatDate(candidate.hired_date) }}</div>
                  <div class="timeline-description">Candidate joined the team</div>
                </div>
              </a-timeline-item>

              <a-timeline-item v-if="candidate.status && candidate.status.toLowerCase() === 'rejected'" color="red">
                <template #dot>
                  <close-circle-outlined style="font-size: 16px" />
                </template>
                <div class="timeline-item">
                  <div class="timeline-title">Rejected</div>
                  <div class="timeline-date" v-if="candidate.rejected_date">{{ formatDate(candidate.rejected_date) }}</div>
                  <div class="timeline-description">{{ candidate.rejection_reason || 'Application was not successful' }}</div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </div>
        </div>
        <div v-else class="empty-state">
          <a-empty description="No candidate data available" />
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { formatDate as formatDateUtil } from '../../../shared/utils/dateHelpers'
import candidatesService from '../api/candidates.service'
import { 
  CheckCircleOutlined, 
  FileSearchOutlined, 
  TeamOutlined, 
  GiftOutlined, 
  UserAddOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  LinkOutlined,
  ManOutlined,
  WomanOutlined
} from '@ant-design/icons-vue'

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

const emit = defineEmits(['update:visible'])

const loading = ref(false)
const job = ref(null)
const jobLoading = ref(false)

const totalImportanceRatio = computed(() => {
  if (!job.value) return 100
  const ratios = [
    job.value.background_criteria.importance_ratio || 0,
    job.value.project_criteria.importance_ratio || 0,
    job.value.skill_criteria.importance_ratio || 0,
    job.value.certification_criteria.importance_ratio || 0
  ]
  return ratios.reduce((sum, ratio) => sum + ratio, 0)
})

watch(() => props.visible, (newVisible) => {
  if (newVisible && props.candidate && props.candidate.id) {
    fetchJobInfo(props.candidate.id)
  }
})

const fetchJobInfo = async (candidateId) => {
  jobLoading.value = true
  try {
    const response = await candidatesService.getCandidateJob(candidateId)
    job.value = response.data
  } catch (error) {
    console.error('Error fetching job information:', error)
  } finally {
    jobLoading.value = false
  }
}

onMounted(() => {
  if (props.visible && props.candidate && props.candidate.id) {
    fetchJobInfo(props.candidate.id)
  }
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return formatDateUtil(dateString, 'YYYY-MM-DD HH:mm')
}

const capitalizeFirstLetter = (string) => {
  if (!string) return 'N/A'
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

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

// Hàm xác định màu sắc cho timeline đã được cải tiến
const getTimelineColor = (step, currentStatus) => {
  // Standardize status strings to lowercase for reliable comparison
  step = step.toLowerCase();
  currentStatus = currentStatus ? currentStatus.toLowerCase() : '';
  
  // Định nghĩa thứ tự các bước trong quy trình tuyển dụng
  const stepsOrder = {
    'new': 0,
    'screening': 1,
    'interview': 2,
    'offer': 3,
    'hired': 4
  }
  
  // Trường hợp đặc biệt: nếu đang ở trạng thái rejected
  if (currentStatus === 'rejected') {
    // Xác định giai đoạn bị từ chối dựa trên thông tin trong dữ liệu ứng viên
    // Mặc định là 'interview' nếu thông tin này không có
    const rejectionStage = determineRejectionStage(step);
    
    // Các bước trước khi bị từ chối vẫn hiển thị màu xanh lá (hoàn thành)
    if (rejectionStage[step] === 'completed') {
      return 'green';
    } 
    // Bước bị từ chối hiển thị màu đỏ
    else if (rejectionStage[step] === 'rejected') {
      return 'red';
    } 
    // Các bước sau khi bị từ chối hiển thị màu xám
    else {
      return 'gray';
    }
  }
  
  // Nếu là bước hiện tại
  if (step === currentStatus) {
    return 'blue';
  }
  
  // Nếu bước đã hoàn thành
  if (stepsOrder[step] !== undefined && stepsOrder[currentStatus] !== undefined && 
      stepsOrder[step] < stepsOrder[currentStatus]) {
    return 'green';
  }
  
  // Các bước còn lại (chưa đến) hiển thị màu xám
  return 'gray';
}

// Hàm phụ trợ để xác định giai đoạn bị từ chối một cách an toàn
const determineRejectionStage = (currentStep) => {
  // Convert to lowercase for consistency
  currentStep = currentStep.toLowerCase();
  
  // Define the rejection stage based on each step
  // This assumes a default rejection after interview, but can be changed
  const defaultStages = {
    'new': 'completed',
    'screening': 'completed',
    'interview': 'rejected',
    'offer': 'pending',
    'hired': 'pending'
  };
  
  // Create a result object with the current step's status
  // This approach allows for future enhancements to handle more complex cases
  const result = {};
  result[currentStep] = defaultStages[currentStep] || 'pending';
  
  return result;
}

const isPdf = (url) => {
  return url.endsWith('.pdf');
}
</script>

<style scoped>
.candidate-profile-form {
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

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.profile-info {
  flex: 1;
}

.candidate-name {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

.candidate-email {
  color: var(--text-color);
  opacity: 0.65;
  margin: 4px 0;
}

.candidate-status {
  margin-top: 8px;
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

.form-value {
  color: var(--text-color);
  font-weight: 500;
  padding: 8px 12px;
  background-color: var(--hover-color);
  border-radius: 6px;
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

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background-color: var(--hover-color);
  border-radius: 6px;
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

.total-score {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
}

.notes-content {
  padding: 12px;
  background-color: var(--hover-color);
  border-radius: 6px;
  color: var(--text-color);
  white-space: pre-wrap;
}

.timeline-section {
  margin-top: 24px;
}

.timeline-item {
  padding: 4px 0;
}

.timeline-title {
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 4px;
}

.timeline-date {
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.65;
  margin-bottom: 4px;
}

.timeline-description {
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.8;
}

:deep(.ant-timeline-item-tail) {
  border-left: 2px solid var(--border-color);
}

:deep(.ant-timeline-item-head) {
  background-color: var(--card-bg);
  border-color: var(--border-color);
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

/* Resume section styles */
.pdf-viewer {
  margin-bottom: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.pdf-frame {
  border: none;
}

.resume-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.view-button, .download-button {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
}

.view-button {
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.download-button {
  background-color: #1890ff;
  color: white;
  border: 1px solid #1890ff;
}

.view-button:hover {
  background-color: var(--hover-bg);
}

.download-button:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.view-button :deep(svg), .download-button :deep(svg) {
  margin-right: 8px;
}

.education-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.education-item {
  padding: 4px 0;
  border-bottom: 1px solid var(--border-color);
}

.education-item:last-child {
  border-bottom: none;
}

.external-links-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.external-link-item {
  padding: 4px 0;
  border-bottom: 1px solid var(--border-color);
}

.external-link-item:last-child {
  border-bottom: none;
}

.external-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1890ff;
  text-decoration: none;
  transition: color 0.3s ease;
}

.external-link:hover {
  color: #40a9ff;
}

.external-link :deep(svg) {
  font-size: 14px;
}
</style>