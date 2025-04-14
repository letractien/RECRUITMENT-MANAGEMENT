<template>
  <a-card class="calendar-card" :bordered="false">
    <template #title>
      <div class="calendar-header">
        <div class="calendar-controls">
          <a-button-group>
            <a-button @click="navigatePrevious">
              <template #icon><left-outlined /></template>
            </a-button>
            <a-button>{{ currentPeriodLabel }}</a-button>
            <a-button @click="navigateNext">
              <template #icon><right-outlined /></template>
            </a-button>
          </a-button-group>
          <a-button class="today-btn" type="link" @click="goToday">Today</a-button>
        </div>
        <div class="view-controls">
          <a-radio-group v-model:value="viewMode" button-style="solid" size="small">
            <a-radio-button value="month">Month</a-radio-button>
            <a-radio-button value="week">Week</a-radio-button>
            <a-radio-button value="day">Day</a-radio-button>
          </a-radio-group>
        </div>
      </div>
    </template>
    
    
    <div class="calendar-grid" :class="[`view-${viewMode}`]">
      <!-- Add loading spinner when interviews are loading -->
      <a-spin v-if="loading" class="full-calendar-spinner" />
      <template v-else>
        <!-- Calendar Days Header - Hide for day view -->
        <div v-if="viewMode !== 'day'" class="calendar-days">
          <div v-for="day in days" :key="day" class="calendar-day-header">
            {{ day }}
          </div>
        </div>
        
        <!-- Day view header -->
        <div v-else class="day-view-header">
          <div class="day-date">
            <calendar-outlined />
            <span>{{ formatFullDate(currentDate) }}</span>
          </div>
          <div class="day-info">
            <span class="interviews-count">{{ getDayInterviewsCount() }} interviews</span>
          </div>
        </div>
        
        <div class="calendar-cells" :style="getCalendarGridStyle()">
          <div
            v-for="date in calendarDates"
            :key="date"
            class="calendar-cell"
            :class="{ 
              'other-month': !isCurrentMonth(date), 
              'today': isToday(date),
              'full-width': viewMode === 'day'
            }"
          >
            <div v-if="viewMode !== 'day'" class="date-number">
              <span>{{ getDateNumber(date) }}</span>
            </div>
            
            <div class="interview-events" :class="{ 'day-view-events': viewMode === 'day' }">
              <div v-if="viewMode === 'day'" class="time-slots">
                <div class="time-label">Morning</div>
                <div class="time-range">9:00 AM - 12:00 PM</div>
              </div>
              
              <div v-if="isDateLoading(date)" class="loading-spinner">
                <a-spin />
              </div>
              <div v-else-if="getInterviewsForDate(date).length === 0" class="no-interviews">
                No interviews
              </div>
              
              <div
                v-for="interview in getInterviewsForDate(date)"
                :key="interview.id"
                class="interview-event"
                :class="[getInterviewClass(interview.interviewType), {'day-view-event': viewMode === 'day'}]"
                @click="viewInterview(interview)"
              >
                <div class="interview-time">{{ interview.time }}</div>
                <div class="interview-title">{{ interview.candidate }}</div>
                <div v-if="viewMode === 'day'" class="interview-details">
                  <div class="interview-position">{{ interview.position }}</div>
                  <div class="interview-interviewer">
                    <user-outlined />
                    <span>{{ interview.interviewer }}</span>
                  </div>
                </div>
              </div>
              
              <div v-if="shouldShowViewMoreButton(date)" class="interviews-view-more">
                <div class="interviews-count-info">
                  Hiển thị {{ getInterviewsForDate(date).length }} / {{ getTotalInterviewsForDate(date) }}
                </div>
                <div class="view-buttons">
                  <a @click="showMoreInterviews(date)" class="view-more-link">
                    <plus-outlined />
                    <span>5</span>
                  </a>
                  <a @click="showAllInterviews(date)" class="view-all-link">
                    <eye-outlined />
                    <span>Full</span>
                  </a>
                </div>
              </div>
              
              <div v-if="viewMode === 'day'" class="time-slots">
                <div class="time-label">Afternoon</div>
                <div class="time-range">1:00 PM - 5:00 PM</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </a-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
import { 
  LeftOutlined, 
  RightOutlined,
  CalendarOutlined,
  UserOutlined,
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'

const store = useStore()
const viewMode = ref('month')
const currentDate = ref(new Date())
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const loadingDates = ref({})
const visibleInterviewCounts = ref({})
const initialVisibleCount = 5
const incrementVisibleCount = 5

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['viewInterview'])

// Computed properties for interviews data
const interviews = computed(() => store.getters['interviews/allInterviews'])
const loading = computed(() => store.getters['interviews/isLoading'])

// Get interviews for a specific date
const getInterviewsForDate = (date) => {
  // Format date as YYYY-MM-DD for store lookup
  const formattedDate = formatDate(date, 'YYYY-MM-DD')
  
  // Get interviews from store using the calendarInterviews getter
  const dateInterviews = store.getters['interviews/calendarInterviews'](formattedDate)
  
  // Format interviews for display
  return formatInterviewsForCalendar(dateInterviews || [])
}

// Helper to check if a date is loading
const isDateLoading = (date) => {
  const formattedDate = formatDate(date, 'YYYY-MM-DD')
  return loadingDates.value[formattedDate] === true
}

// Format interviews for calendar display
const formatInterviewsForCalendar = (interviews) => {
  return interviews.map(interview => {
    let interviewTime = ''
    let interviewDate
    
    try {
      if (interview.scheduledAt) {
        interviewDate = new Date(interview.scheduledAt)
        // Change from toLocaleTimeString to a custom format with only hours and minutes
        const hours = String(interviewDate.getHours()).padStart(2, '0')
        const minutes = String(interviewDate.getMinutes()).padStart(2, '0')
        interviewTime = `${hours}:${minutes}`
      }
    } catch (error) {
      console.error("Error formatting interview time:", error)
    }
    
    return {
      id: interview.id,
      candidate: interview.candidateName,
      position: interview.jobTitle,
      interviewer: interview.interviewer,
      interviewType: interview.interviewType || interview.type,
      time: interviewTime,
      date: interviewDate ? interviewDate.toLocaleDateString() : '',
      status: interview.status
    }
  })
}

const getTotalInterviewsForDate = (date) => {
  return interviews.value.filter(interview => {
    const interviewDate = new Date(interview.date)
    return (
      interviewDate.getDate() === date.getDate() &&
      interviewDate.getMonth() === date.getMonth() &&
      interviewDate.getFullYear() === date.getFullYear()
    )
  }).length
}

const shouldShowViewMoreButton = (date) => {
  const totalCount = getTotalInterviewsForDate(date)
  const dateKey = formatDateKey(date)
  const visibleCount = visibleInterviewCounts.value[dateKey] || initialVisibleCount
  return totalCount > visibleCount
}

const formatDateKey = (date) => {
  return formatDate(date, 'YYYY-MM-DD')
}

const viewInterview = (interview) => {
  emit('viewInterview', interview)
}

const getCalendarGridStyle = () => {
  if (viewMode.value === 'month') {
    return { 
      gridTemplateColumns: 'repeat(7, 1fr)',
      width: '100%' 
    }
  } else if (viewMode.value === 'week') {
    return { 
      gridTemplateColumns: 'repeat(7, 1fr)',
      width: '100%'
    }
  } else if (viewMode.value === 'day') {
    return { gridTemplateColumns: '1fr' }
  }
  return {}
}

const formatFullDate = (date) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString('default', options)
}

const getDayInterviewsCount = () => {
  if (!currentDate.value) return 0
  
  const formattedDate = formatDate(currentDate.value, 'YYYY-MM-DD')
  const interviews = store.getters['interviews/calendarInterviews'](formattedDate)
  
  return interviews ? interviews.length : 0
}

const currentPeriodLabel = computed(() => {
  const options = { year: 'numeric' }
  
  if (viewMode.value === 'month') {
    return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' })
  } else if (viewMode.value === 'week') {
    const startOfWeek = new Date(currentDate.value)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - day)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    const startMonth = startOfWeek.toLocaleString('default', { month: 'short' })
    const endMonth = endOfWeek.toLocaleString('default', { month: 'short' })
    
    return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`
  } else if (viewMode.value === 'day') {
    return currentDate.value.toLocaleString('default', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }
  
  return ''
})

const calendarDates = computed(() => {
  if (viewMode.value === 'month') {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const dates = []
    // Add days from previous month
    for (let i = 0; i < startingDay; i++) {
      const date = new Date(year, month, -i)
      dates.unshift(date)
    }
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(year, month, i))
    }
    // Add days from next month
    const remainingDays = 42 - dates.length
    for (let i = 1; i <= remainingDays; i++) {
      dates.push(new Date(year, month + 1, i))
    }

    return dates
  } else if (viewMode.value === 'week') {
    // Get the current week's dates
    const dates = []
    const current = new Date(currentDate.value)
    const day = current.getDay()
    const diff = current.getDate() - day
    
    // Start with Sunday of the week
    current.setDate(diff)
    
    // Add 7 days for the week
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  } else if (viewMode.value === 'day') {
    // Just return today
    return [new Date(currentDate.value)]
  }
  
  return []
})

const navigatePrevious = () => {
  if (viewMode.value === 'month') {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() - 1,
      currentDate.value.getDate()
    )
  } else if (viewMode.value === 'week') {
    const newDate = new Date(currentDate.value)
    newDate.setDate(newDate.getDate() - 7)
    currentDate.value = newDate
  } else if (viewMode.value === 'day') {
    const newDate = new Date(currentDate.value)
    newDate.setDate(newDate.getDate() - 1)
    currentDate.value = newDate
  }
}

const navigateNext = () => {
  if (viewMode.value === 'month') {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() + 1,
      currentDate.value.getDate()
    )
  } else if (viewMode.value === 'week') {
    const newDate = new Date(currentDate.value)
    newDate.setDate(newDate.getDate() + 7)
    currentDate.value = newDate
  } else if (viewMode.value === 'day') {
    const newDate = new Date(currentDate.value)
    newDate.setDate(newDate.getDate() + 1)
    currentDate.value = newDate
  }
}

const goToday = () => {
  currentDate.value = new Date()
}

const isCurrentMonth = (date) => {
  return date.getMonth() === currentDate.value.getMonth()
}

const isToday = (date) => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}

const getDateNumber = (date) => {
  return date.getDate()
}

const getInterviewClass = (type) => {
  return `interview-type-${type.toLowerCase().replace(/\s+/g, '-')}`
}

const showMoreInterviews = (date) => {
  viewMode.value = 'day'
  currentDate.value = new Date(date)
}

const showAllInterviews = (date) => {
  viewMode.value = 'day'
  currentDate.value = new Date(date)
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

// Update the functions to refresh the calendar when view or date changes
watch([viewMode, currentDate], () => {
  fetchInterviewsForCurrentView();
});
</script>

<style scoped>
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

@media (max-width: 768px) {
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
}
</style> 