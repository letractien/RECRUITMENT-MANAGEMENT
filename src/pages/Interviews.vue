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
      <a-col :xs="24" :md="16">
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
                  <small v-if="viewMode === 'week'">{{ getDayName(date) }}</small>
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
                        <span>Xem thêm</span>
                      </a>
                      <a @click="showAllInterviews(date)" class="view-all-link">
                        <eye-outlined />
                        <span>Xem tất cả</span>
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
      <a-col :xs="24" :md="8">
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
import { ref, computed } from 'vue'
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

const viewMode = ref('month')
const currentDate = ref(new Date())
const showScheduleDialog = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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

const interviews = ref(
  Array.from({ length: 1000 }, (_, index) => ({
    id: index + 1,
    candidate: `Candidate ${index + 1}`,
    position: ['Senior Frontend Developer', 'UI/UX Designer', 'Product Manager', 'Backend Developer'][Math.floor(Math.random() * 4)],
    interviewType: ['Phone Screen', 'Technical', 'HR', 'Final'][Math.floor(Math.random() * 4)],
    date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: `${Math.floor(Math.random() * 8) + 9}:${Math.floor(Math.random() * 4) * 15}`,
    interviewer: ['Sarah Wilson', 'Mike Johnson', 'David Brown', 'Emily Davis'][Math.floor(Math.random() * 4)],
    notes: 'Interview notes and feedback will be added after the session.'
  }))
)

const candidates = ref([
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Mike Johnson' }
])

const jobs = ref([
  { id: 1, title: 'Senior Frontend Developer' },
  { id: 2, title: 'UI/UX Designer' },
  { id: 3, title: 'Product Manager' }
])

const interviewForm = ref({
  candidate: '',
  position: '',
  interviewType: '',
  date: '',
  time: '',
  interviewer: '',
  notes: ''
})

const upcomingInterviews = computed(() => {
  const today = new Date()
  return interviews.value
    .filter(interview => new Date(interview.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)
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

const getInterviewsForDate = (date) => {
  const interviewsForDate = interviews.value.filter(interview => {
    const interviewDate = new Date(interview.date)
    return (
      interviewDate.getDate() === date.getDate() &&
      interviewDate.getMonth() === date.getMonth() &&
      interviewDate.getFullYear() === date.getFullYear()
    )
  })
  
  const dateKey = formatDateKey(date)
  
  if (!visibleInterviewCounts.value[dateKey]) {
    visibleInterviewCounts.value[dateKey] = initialVisibleCount
  }
  
  return interviewsForDate.slice(0, visibleInterviewCounts.value[dateKey])
}

const formatDateKey = (date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
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

const showMoreInterviews = (date) => {
  const dateKey = formatDateKey(date)
  visibleInterviewCounts.value[dateKey] += incrementVisibleCount
}

const showAllInterviews = (date) => {
  const dateKey = formatDateKey(date)
  visibleInterviewCounts.value[dateKey] = Number.MAX_SAFE_INTEGER
}

const shouldShowViewMoreButton = (date) => {
  const totalCount = getTotalInterviewsForDate(date)
  const dateKey = formatDateKey(date)
  const visibleCount = visibleInterviewCounts.value[dateKey] || initialVisibleCount
  return totalCount > visibleCount
}

const getInterviewClass = (type) => {
  return type?.toLowerCase().replace(/\s+/g, '-') || 'default'
}

const viewInterview = (interview) => {
  // Implement view interview details logic
  console.log('View interview:', interview)
}

const saveInterview = () => {
  const newInterview = {
    id: interviews.value.length + 1,
    ...interviewForm.value,
    date: interviewForm.value.date ? interviewForm.value.date.format('YYYY-MM-DD') : '',
    time: interviewForm.value.time ? interviewForm.value.time.format('HH:mm') : ''
  }
  interviews.value.push(newInterview)
  message.success('Interview scheduled successfully')
  showScheduleDialog.value = false
  interviewForm.value = {
    candidate: '',
    position: '',
    interviewType: '',
    date: '',
    time: '',
    interviewer: '',
    notes: ''
  }
}

const totalInterviews = computed(() => interviews.value.length)

const paginatedInterviews = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return interviews.value.slice(start, end)
})

const handleSizeChange = (current, size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const getStatusType = (status) => {
  const types = {
    'Phone Screen': 'info',
    'Technical': 'warning',
    'HR': 'primary',
    'Final': 'success',
    'Completed': 'danger'
  }
  return types[status] || 'info'
}

const getStatusColor = (status) => {
  const colors = {
    'Phone Screen': 'blue',
    'Technical': 'orange',
    'HR': 'geekblue',
    'Final': 'green',
    'Completed': 'red'
  }
  return colors[status] || 'blue'
}

const navigatePrevious = () => {
  if (viewMode.value === 'month') {
    previousMonth()
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
    nextMonth()
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

const getDayName = (date) => {
  return date.toLocaleString('default', { weekday: 'short' })
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
  return date.toLocaleString('default', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
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

const currentDisplayedInterviews = computed(() => {
  if (viewMode.value === 'month') {
    return getMonthInterviewsCount()
  } else if (viewMode.value === 'week') {
    return getWeekInterviewsCount()
  } else {
    return getDayInterviewsCount()
  }
})

const getMonthInterviewsCount = () => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  return interviews.value.filter(interview => {
    const interviewDate = new Date(interview.date)
    return (
      interviewDate.getMonth() === month &&
      interviewDate.getFullYear() === year
    )
  }).length
}

const getWeekInterviewsCount = () => {
  const startOfWeek = new Date(currentDate.value)
  const day = startOfWeek.getDay()
  startOfWeek.setDate(startOfWeek.getDate() - day)
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return interviews.value.filter(interview => {
    const interviewDate = new Date(interview.date)
    return interviewDate >= startOfWeek && interviewDate <= endOfWeek
  }).length
}

const getTodayInterviewsCount = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return interviews.value.filter(interview => {
    const interviewDate = new Date(interview.date)
    return interviewDate >= today && interviewDate < tomorrow
  }).length
}

const getViewModeLabel = () => {
  if (viewMode.value === 'month') {
    return 'Trong tháng'
  } else if (viewMode.value === 'week') {
    return 'Trong tuần'
  } else {
    return 'Trong ngày'
  }
}

const activeFilter = ref('all')

const setInterviewFilter = (filter) => {
  activeFilter.value = filter
  console.log(`Lọc theo: ${filter}`)
}

const interviewTypeStats = computed(() => {
  const stats = {}
  
  interviews.value.forEach(interview => {
    const type = interview.interviewType
    if (!stats[type]) stats[type] = 0
    stats[type]++
  })
  
  return stats
})
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
  padding: 0 4px;
  box-sizing: border-box;
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