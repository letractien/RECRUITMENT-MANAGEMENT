<template>
  <div class="interviews">
    <div class="page-header">
      <h2>Interviews</h2>
      <a-button type="primary" @click="showScheduleDialog = true">
        <template #icon><plus-outlined /></template>
        Schedule Interview
      </a-button>
    </div>

    <a-row :gutter="16">
      <a-col :span="24" :lg="16">
        <InterviewCalendar 
          :loading="loading"
          @viewInterview="viewInterview"
        />
      </a-col>
      <a-col :span="24" :lg="8">
        <InterviewUpcomingInterviews 
          :interviews="upcomingInterviews"
          :loading="loading"
        />
      </a-col>
    </a-row>

    <!-- Schedule Interview Dialog -->
    <InterviewScheduleForm
      v-model:visible="showScheduleDialog"
      :candidates="candidates"
      :jobs="jobs"
      @saved="fetchUpcomingInterviews"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import InterviewScheduleForm from '../components/InterviewScheduleForm.vue'
import InterviewUpcomingInterviews from '../components/InterviewUpcomingInterviews.vue'
import InterviewCalendar from '../components/InterviewCalendar.vue'

const store = useStore()
const viewMode = ref('month')
const currentDate = ref(new Date())
const showScheduleDialog = ref(false)

// Candidates and jobs lists for the interview form
const candidates = ref([])
const jobs = ref([])

// Load candidates and jobs data
const loadFormData = async () => {
  try {
    // Load candidates
    const candidatesResponse = await store.dispatch('candidates/fetchCandidates')
    if (candidatesResponse) {
      candidates.value = candidatesResponse
    }
    
    // Load jobs
    const jobsResponse = await store.dispatch('jobs/fetchJobs')
    if (jobsResponse) {
      jobs.value = jobsResponse
    }

    console.log('Loaded candidates:', candidates.value.length)
    console.log('Loaded jobs:', jobs.value.length)
  } catch (error) {
    console.error('Error loading form data:', error)
    message.error('Failed to load candidates or jobs data')
  }
}

// Fetch interviews on component mount
onMounted(async () => {
  console.log("Fetching interviews...")
  try {
    // Fetch global interviews for filtering (this will be used as a backup)
    await store.dispatch('interviews/fetchInterviews')
    
    // Fetch current month's interviews for the calendar
    await fetchInterviewsForCurrentView()
    
    // Fetch upcoming interviews for the sidebar (not mocked, from API)
    await fetchUpcomingInterviews()
    
    // Load candidates and jobs data for the form
    await loadFormData()
    
    console.log("Interview data loaded successfully")
  } catch (error) {
    console.error("Error fetching interviews:", error)
    message.error("Failed to load interview data")
  }
})

// Update the functions to refresh the calendar when view or date changes
watch([viewMode, currentDate], () => {
  fetchInterviewsForCurrentView();
});

// Computed properties for interviews data
const loading = computed(() => store.getters['interviews/isLoading'])

// Get upcoming interviews
const upcomingInterviews = computed(() => {
  // Get all interviews from the store
  const allInterviews = store.getters['interviews/upcomingInterviews'];
  console.log('All interviews:', allInterviews);
  
  // Create date range: today and the next 6 days
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 6); // End of 6 days from today
  endDate.setHours(23, 59, 59, 999); // End of the day
  
  // Filter interviews to include only those within the date range
  const filteredInterviews = allInterviews.filter(interview => {
    const interviewDate = new Date(interview.scheduledAt);
    return interviewDate >= today && interviewDate <= endDate;
  });
  
  // Map and return the filtered interviews
  return filteredInterviews.map(interview => {
    const interviewDate = new Date(interview.scheduledAt);
    return {
      id: interview.id,
      candidate: interview.candidateName,
      position: interview.jobTitle,
      interviewType: interview.type,
      date: interviewDate,
      time: interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  });
})

// Fetch upcoming interviews using the store action
const fetchUpcomingInterviews = async () => {
  try {
    await store.dispatch('interviews/fetchUpcomingInterviews');
  } catch (error) {
    console.error('Error fetching upcoming interviews:', error);
    message.error('Failed to load upcoming interviews');
  }
}

const viewInterview = (interview) => {
  // Implement view interview details logic
  console.log('View interview:', interview)
}

// Format date in YYYY-MM-DD format for API
const formatDateForApi = (date) => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date for API:', error);
    return '';
  }
}

// Helper to replace formatDate calls for calendar endpoints
const formatDate = (date, format) => {
  if (!date) return '';
  
  if (format === 'YYYY-MM-DD') {
    return formatDateForApi(date);
  }
  
  // For other formats, use existing helper if available
  if (typeof window.formatDate === 'function') {
    return window.formatDate(date, format);
  }
  
  // Fallback formatting
  const d = new Date(date);
  return d.toLocaleDateString();
}

// Add a new function to fetch interviews for the current view (month, week, or day)
const fetchInterviewsForCurrentView = async () => {
  let startDate, endDate;
  
  if (viewMode.value === 'month') {
    // For month view, get the first and last dates displayed in the calendar
    const dates = getMonthViewDateRange();
    startDate = dates.startDate;
    endDate = dates.endDate;
  } else if (viewMode.value === 'week') {
    // For week view, get the first and last dates of the current week
    const dates = getWeekViewDateRange();
    startDate = dates.startDate;
    endDate = dates.endDate;
  } else {
    // For day view, use the current date
    startDate = formatDate(currentDate.value, 'YYYY-MM-DD');
    endDate = startDate;
  }
  
  try {
    // Fetch interviews for the date range
    await store.dispatch('interviews/fetchCalendarInterviews', { 
      startDate: startDate, 
      endDate: endDate 
    });
    
    console.log(`Fetched interviews for date range: ${startDate} to ${endDate}`);
  } catch (error) {
    console.error(`Error fetching interviews for date range:`, error);
    message.error('Failed to load interviews for the calendar');
  }
}

// Get the date range for the month view
const getMonthViewDateRange = () => {
  // This should return the first and last dates displayed in the calendar for month view
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  // Get the first date displayed (may be from previous month)
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate the actual first date shown in the calendar (can be from previous month)
  const firstDateShown = new Date(year, month, 1 - startingDayOfWeek);
  
  // Calculate the last date shown (can be from next month)
  // Month view typically shows 6 weeks (42 days)
  const lastDateShown = new Date(firstDateShown);
  lastDateShown.setDate(firstDateShown.getDate() + 41); // 42 days - 1
  
  return {
    startDate: formatDate(firstDateShown, 'YYYY-MM-DD'),
    endDate: formatDate(lastDateShown, 'YYYY-MM-DD')
  };
}

// Get the date range for the week view
const getWeekViewDateRange = () => {
  const current = new Date(currentDate.value);
  const day = current.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate the first day of the week (Sunday)
  const firstDayOfWeek = new Date(current);
  firstDayOfWeek.setDate(current.getDate() - day);
  
  // Calculate the last day of the week (Saturday)
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
  
  return {
    startDate: formatDate(firstDayOfWeek, 'YYYY-MM-DD'),
    endDate: formatDate(lastDayOfWeek, 'YYYY-MM-DD')
  };
}

</script>

<style scoped>
.interviews {
  padding: 4px;
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

.calendar-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
  background-color: var(--card-bg);
  max-width: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.today-btn {
  margin-left: 8px;
}

.calendar-grid {
  margin-top: 16px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 14px;
  max-width: 100%;
  box-sizing: border-box;
  gap: 4px;
  padding: 0 1px;
}

.calendar-day-header {
  padding: 4px;
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
  border: 1px solid transparent;
}

.calendar-cells {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0 1px;
}

.calendar-cell {
  min-height: 100px;
  border: 1px solid var(--border-color);
  padding: 6px;
  position: relative;
  background-color: var(--card-bg);
  transition: all 0.2s;
  border-radius: 4px;
  min-width: 0;
  width: 100%;
}

.calendar-cell:hover {
  background-color: var(--hover-color);
}

.calendar-cell.other-month {
  background-color: var(--hover-color);
  opacity: 0.7;
}

.calendar-cell.today {
  border: 2px solid #1890ff;
}

.date-number {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.date-number small {
  font-weight: normal;
  opacity: 0.7;
}

.interview-events {
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.interview-event {
  padding: 4px 6px;
  border-radius: 4px;
  background-color: rgba(24, 144, 255, 0.1);
  border-left: 3px solid #1890ff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.interview-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.interview-time {
  font-weight: 600;
  font-size: 11px;
}

.interview-title {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.interview-event.interview-type-phone-screen {
  border-left-color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
}

.interview-event.interview-type-video {
  border-left-color: #13c2c2;
  background-color: rgba(19, 194, 194, 0.1);
}

.interview-event.interview-type-onsite {
  border-left-color: #faad14;
  background-color: rgba(250, 173, 20, 0.1);
}

.interview-event.interview-type-technical {
  border-left-color: #52c41a;
  background-color: rgba(82, 196, 26, 0.1);
}

.interview-event.interview-type-hr {
  border-left-color: #722ed1;
  background-color: rgba(114, 46, 209, 0.1);
}

/* Week view styles */
.view-week .calendar-cell {
  min-height: 150px;
}

/* Day view styles */
.view-day .calendar-days {
  grid-template-columns: 1fr;
}

.view-day .calendar-cell {
  min-height: 400px;
  padding: 12px;
}

.view-day .interview-event {
  padding: 8px 12px;
  margin-bottom: 8px;
}

.view-day .date-number {
  font-size: 18px;
  margin-bottom: 16px;
}

.view-day .interview-time {
  font-size: 13px;
}

.view-day .interview-title {
  font-size: 14px;
}

.full-width {
  grid-column: 1 / -1;
}

.upcoming-interviews {
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
  background-color: var(--card-bg);
}

.upcoming-interviews :deep(.ant-card-head) {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.upcoming-interviews :deep(.ant-card-body) {
  background-color: var(--card-bg);
  padding: 16px 24px;
  max-height: unset;
  overflow-y: initial;
}

.centered-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-header span {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.timeline-content h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.timeline-content p {
  margin: 3px 0;
  color: var(--text-color);
  opacity: 0.75;
  font-size: 12px;
}

.timeline-content .interview-type {
  color: #1890ff;
  font-weight: 500;
}

.timeline-content .interview-time {
  color: var(--text-color);
  opacity: 0.65;
  font-size: 12px;
}

.custom-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.custom-dot.info, .custom-dot.primary, .custom-dot.phone-screen, .custom-dot.phone {
  background-color: #1890ff;
}

.custom-dot.warning, .custom-dot.technical {
  background-color: #faad14;
}

.custom-dot.success, .custom-dot.hr {
  background-color: #52c41a;
}

.custom-dot.danger {
  background-color: #f5222d;
}

.custom-dot.video {
  background-color: #13c2c2;
}

.custom-dot.onsite {
  background-color: #722ed1;
}

.interviews-total {
  margin-top: 16px;
  padding: 8px 16px;
  text-align: right;
  font-size: 14px;
  color: var(--text-color);
  font-weight: 500;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 16px;
  }

  .calendar-days {
    font-size: 12px;
  }
  
  .calendar-cell {
    min-height: 80px;
    padding: 4px;
  }
  
  .view-week .calendar-cell,
  .view-day .calendar-cell {
    min-height: 120px;
  }
  
  .interview-event {
    padding: 2px 4px;
    font-size: 10px;
  }

  .view-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .a-row {
    flex-direction: column;
  }

  .a-col {
    width: 100%;
  }
}

/* Enhanced Day view styles */
.day-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 12px;
  padding: 0 8px;
}

.day-date {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.day-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.interviews-count {
  background-color: #1890ff;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.day-view-events {
  padding: 8px 0;
}

.time-slots {
  margin: 16px 0 8px 0;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--border-color);
}

.time-label {
  font-weight: 600;
  margin-bottom: 2px;
  color: var(--text-color);
}

.time-range {
  font-size: 12px;
  opacity: 0.7;
  color: var(--text-color);
}

.day-view-event {
  padding: 12px;
  margin: 12px 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.day-view-event .interview-time {
  font-size: 14px;
  margin-bottom: 6px;
}

.day-view-event .interview-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  white-space: normal;
}

.interview-details {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.interview-position {
  margin-bottom: 6px;
  font-size: 13px;
}

.interview-interviewer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.8;
}

/* Day view specific styles */
.view-day .calendar-cell {
  min-height: 500px;
  padding: 16px;
  overflow-y: auto;
}

:deep(.ant-card-head) {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

:deep(.ant-card-body) {
  background-color: var(--card-bg);
  overflow-x: auto;
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

:deep(.ant-timeline-item-content) {
  color: var(--text-color);
}

:deep(.ant-select-dropdown) {
  background-color: var(--card-bg);
}

:deep(.ant-empty-description) {
  color: var(--text-color);
}

.no-interviews {
  font-size: 11px;
  color: #888;
  text-align: center;
  padding: 8px 0;
  font-style: italic;
}

.full-calendar-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  width: 100%;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 15px 0;
}

.stats-spinner {
  display: flex;
  justify-content: center;
  padding: 15px 0;
}
</style>