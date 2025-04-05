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
          </div>
          
          <div class="interviews-stats">
            <div class="stats-title">
              <bar-chart-outlined />
              <span>Thống kê phỏng vấn</span>
            </div>
            <div class="stats-container">
              <div 
                class="stat-card" 
                :class="{ active: activeFilter === 'all' }"
                @click="setInterviewFilter('all')"
              >
                <div class="stat-icon all">
                  <team-outlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ totalInterviews }}</div>
                  <div class="stat-label">Tổng số</div>
                </div>
              </div>
              
              <div 
                class="stat-card" 
                :class="{ active: activeFilter === 'current' }"
                @click="setInterviewFilter('current')"
              >
                <div class="stat-icon current">
                  <calendar-outlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ currentDisplayedInterviews }}</div>
                  <div class="stat-label">{{ getViewModeLabel() }}</div>
                </div>
              </div>
              
              <div 
                v-if="viewMode !== 'day'" 
                class="stat-card"
                :class="{ active: activeFilter === 'today' }"
                @click="setInterviewFilter('today')"
              >
                <div class="stat-icon today">
                  <clock-circle-outlined />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ getTodayInterviewsCount() }}</div>
                  <div class="stat-label">Hôm nay</div>
                </div>
              </div>
              
              <div class="stat-card type-stats">
                <div class="stat-breakdown">
                  <div 
                    v-for="(count, type) in interviewTypeStats" 
                    :key="type"
                    class="stat-type-item"
                    :class="{ active: activeFilter === type }"
                    @click="setInterviewFilter(type)"
                  >
                    <div class="type-color" :class="getInterviewClass(type)"></div>
                    <div class="type-name">{{ type }}</div>
                    <div class="type-count">{{ count }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="24" :lg="8">
        <a-card class="upcoming-interviews" :bordered="false">
          <template #title>
            <div class="card-header">
              <span>Upcoming Interviews</span>
            </div>
          </template>
          <a-timeline>
            <a-timeline-item
              v-for="interview in upcomingInterviews"
              :key="interview.id"
              :color="getStatusColor(interview.interviewType)"
            >
              <template #dot>
                <div :class="['custom-dot', getStatusType(interview.interviewType)]"></div>
              </template>
              <div class="timeline-content">
                <h4>{{ interview.candidate }}</h4>
                <p>{{ interview.position }}</p>
                <p class="interview-type">{{ interview.interviewType }}</p>
                <p class="interview-time">{{ interview.date + ' ' + interview.time }}</p>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row>

    <!-- Schedule Interview Dialog -->
    <a-modal
      v-model:visible="showScheduleDialog"
      title="Schedule Interview"
      width="550px"
      @ok="saveInterview"
    >
      <a-form :model="interviewForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="Candidate">
          <a-select
            v-model:value="interviewForm.candidate"
            placeholder="Select candidate"
            style="width: 100%"
          >
            <a-select-option
              v-for="candidate in candidates"
              :key="candidate.id"
              :value="candidate.name"
            >
              {{ candidate.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Position">
          <a-select
            v-model:value="interviewForm.position"
            placeholder="Select position"
            style="width: 100%"
          >
            <a-select-option
              v-for="job in jobs"
              :key="job.id"
              :value="job.title"
            >
              {{ job.title }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Interview Type">
          <a-select
            v-model:value="interviewForm.interviewType"
            placeholder="Select type"
            style="width: 100%"
          >
            <a-select-option value="Phone Screen">Phone Screen</a-select-option>
            <a-select-option value="Technical">Technical</a-select-option>
            <a-select-option value="HR">HR</a-select-option>
            <a-select-option value="Final">Final</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Date">
          <a-date-picker
            v-model:value="interviewForm.date"
            style="width: 100%"
            placeholder="Select date"
          />
        </a-form-item>
        <a-form-item label="Time">
          <a-time-picker
            v-model:value="interviewForm.time"
            format="HH:mm"
            placeholder="Select time"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="Interviewer">
          <a-input v-model:value="interviewForm.interviewer" />
        </a-form-item>
        <a-form-item label="Notes">
          <a-textarea
            v-model:value="interviewForm.notes"
            :rows="4"
            placeholder="Additional notes about the interview"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { message } from 'ant-design-vue'
import { 
  PlusOutlined, 
  LeftOutlined, 
  RightOutlined,
  CalendarOutlined,
  UserOutlined,
  BarChartOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'
import { formatDate } from '../../../shared/utils/dateHelpers.js'

const store = useStore()
const viewMode = ref('month')
const currentDate = ref(new Date())
const showScheduleDialog = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const activeFilter = ref('all')

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Fetch interviews on component mount
onMounted(async () => {
  await store.dispatch('interviews/fetchInterviews')
})

// Computed properties for interviews data
const interviews = computed(() => store.getters['interviews/allInterviews'])
const loading = computed(() => store.getters['interviews/isLoading'])
const error = computed(() => store.getters['interviews/errorMessage'])

// Filter interviews based on active filter
const filteredInterviews = computed(() => {
  if (activeFilter.value === 'all') return interviews.value
  if (activeFilter.value === 'current') {
    const startDate = new Date(currentDate.value)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(currentDate.value)
    endDate.setHours(23, 59, 59, 999)
    return interviews.value.filter(interview => {
      const interviewDate = new Date(interview.scheduledAt)
      return interviewDate >= startDate && interviewDate <= endDate
    })
  }
  if (activeFilter.value === 'today') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return interviews.value.filter(interview => {
      const interviewDate = new Date(interview.scheduledAt)
      return interviewDate >= today && interviewDate < tomorrow
    })
  }
  return interviews.value.filter(interview => interview.interviewType === activeFilter.value)
})

// Get interviews for a specific date
const getInterviewsForDate = (date) => {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  
  return filteredInterviews.value.filter(interview => {
    const interviewDate = new Date(interview.scheduledAt)
    return interviewDate >= startOfDay && interviewDate <= endOfDay
  })
}

// Get total interviews count
const totalInterviews = computed(() => interviews.value.length)

// Get current displayed interviews count
const currentDisplayedInterviews = computed(() => filteredInterviews.value.length)

// Get today's interviews count
const getTodayInterviewsCount = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return interviews.value.filter(interview => {
    const interviewDate = new Date(interview.scheduledAt)
    return interviewDate >= today && interviewDate < tomorrow
  }).length
}

// Get interview type statistics
const interviewTypeStats = computed(() => {
  const stats = {}
  interviews.value.forEach(interview => {
    stats[interview.interviewType] = (stats[interview.interviewType] || 0) + 1
  })
  return stats
})

// Get upcoming interviews
const upcomingInterviews = computed(() => {
  const now = new Date()
  return interviews.value
    .filter(interview => new Date(interview.scheduledAt) > now)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    .slice(0, 5)
})

// Interview form data
const interviewForm = ref({
  candidate: '',
  position: '',
  interviewType: '',
  date: null,
  time: null,
  interviewer: '',
  notes: ''
})

// Methods
const setInterviewFilter = (filter) => {
  activeFilter.value = filter
}

const getViewModeLabel = () => {
  const labels = {
    month: {
      en: 'This Month',
      vi: 'Trong tháng'
    },
    week: {
      en: 'This Week',
      vi: 'Trong tuần'
    },
    day: {
      en: 'Today',
      vi: 'Trong ngày'
    }
  }
  
  // You can change 'en' to 'vi' to switch to Vietnamese
  const lang = 'en'
  return labels[viewMode.value]?.[lang] || ''
}

const getStatusColor = (type) => {
  switch (type) {
    case 'Phone Screen': return 'blue'
    case 'Technical': return 'green'
    case 'HR': return 'purple'
    case 'Final': return 'orange'
    default: return 'default'
  }
}

const getStatusType = (type) => {
  return type.toLowerCase().replace(' ', '-')
}

const getInterviewClass = (type) => {
  return `interview-type-${type.toLowerCase().replace(' ', '-')}`
}

const showMoreInterviews = (date) => {
  viewMode.value = 'day'
  currentDate.value = new Date(date)
}

const showAllInterviews = (date) => {
  viewMode.value = 'day'
  currentDate.value = new Date(date)
}

const saveInterview = async () => {
  try {
    const interviewData = {
      ...interviewForm.value,
      scheduledAt: new Date(
        interviewForm.value.date.getFullYear(),
        interviewForm.value.date.getMonth(),
        interviewForm.value.date.getDate(),
        interviewForm.value.time.getHours(),
        interviewForm.value.time.getMinutes()
      ).toISOString()
    }
    
    await store.dispatch('interviews/createInterview', interviewData)
    message.success('Interview scheduled successfully')
    showScheduleDialog.value = false
    resetForm()
  } catch (error) {
    message.error('Failed to schedule interview')
  }
}

const resetForm = () => {
  interviewForm.value = {
    candidate: '',
    position: '',
    interviewType: '',
    date: null,
    time: null,
    interviewer: '',
    notes: ''
  }
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

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1
  )
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

const visibleInterviewCounts = ref({})
const initialVisibleCount = 5
const incrementVisibleCount = 5

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
  return formatDate(date, 'YYYY-MM-DD');
}

const viewInterview = (interview) => {
  // Implement view interview details logic
  console.log('View interview:', interview)
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
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('default', options);
}

const getDayInterviewsCount = () => {
  if (!currentDate.value) return 0
  
  return interviews.value.filter(interview => {
    const interviewDate = new Date(interview.date)
    return (
      interviewDate.getDate() === currentDate.value.getDate() &&
      interviewDate.getMonth() === currentDate.value.getMonth() &&
      interviewDate.getFullYear() === currentDate.value.getFullYear()
    )
  }).length
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

.interview-event.phone-screen {
  border-left-color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
}

.interview-event.technical {
  border-left-color: #faad14;
  background-color: rgba(250, 173, 20, 0.1);
}

.interview-event.hr {
  border-left-color: #52c41a;
  background-color: rgba(82, 196, 26, 0.1);
}

.interview-event.final {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  opacity: 0.8;
}

.timeline-content .interview-type {
  color: #1890ff;
  font-weight: 500;
}

.timeline-content .interview-time {
  color: var(--text-color);
  opacity: 0.6;
}

.custom-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.custom-dot.info {
  background-color: #1890ff;
}

.custom-dot.warning {
  background-color: #faad14;
}

.custom-dot.primary {
  background-color: #1890ff;
}

.custom-dot.success {
  background-color: #52c41a;
}

.custom-dot.danger {
  background-color: #f5222d;
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

/* View day specific styles */
.view-day .calendar-cell {
  min-height: 500px;
  padding: 16px;
  overflow-y: auto;
}

.interviews-stats {
  margin-top: 16px;
  padding: 0;
  border-top: 1px solid var(--border-color);
}

.stats-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  padding: 12px 16px;
  border-bottom: 1px dashed var(--border-color);
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  padding: 16px;
}

.stat-card {
  display: flex;
  padding: 12px;
  background-color: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #40a9ff;
}

.stat-card.active {
  border-color: #1890ff;
  background-color: rgba(24, 144, 255, 0.05);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-right: 12px;
  color: white;
  font-size: 20px;
}

.stat-icon.all {
  background-color: #1890ff;
}

.stat-icon.current {
  background-color: #52c41a;
}

.stat-icon.today {
  background-color: #fa8c16;
}

.stat-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
}

.stat-label {
  font-size: 13px;
  color: var(--text-color);
  opacity: 0.7;
}

.type-stats {
  grid-column: 1 / -1;
  flex-direction: column;
}

.stat-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  width: 100%;
}

.stat-type-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.stat-type-item:hover {
  background-color: var(--hover-color);
}

.stat-type-item.active {
  background-color: rgba(24, 144, 255, 0.1);
}

.type-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.type-name {
  flex: 1;
  font-size: 13px;
}

.type-count {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color);
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr 1fr;
  }
  
  .stat-type-item {
    padding: 8px 4px;
  }
  
  .type-name {
    font-size: 12px;
  }
}

.interviews-view-more {
  margin-top: 8px;
  padding: 8px;
  border-top: 1px dashed var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.interviews-count-info {
  color: var(--text-color);
  opacity: 0.7;
  font-size: 11px;
}

.view-buttons {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.view-more-link, .view-all-link {
  color: #1890ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 4px 0;
}

.view-more-link:hover, .view-all-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* Day view specific styles for view more */
.view-day .interviews-view-more {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  padding: 12px;
  margin: 16px 0;
}

.view-day .view-buttons {
  margin-top: 8px;
}

.view-day .view-more-link, .view-day .view-all-link {
  font-size: 14px;
}

@media (max-width: 768px) {
  .view-buttons {
    flex-direction: column;
    gap: 8px;
  }
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
</style> 