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
          
          <div class="interviews-stats">
            <div class="stats-title">
              <bar-chart-outlined />
              <span>Thống kê phỏng vấn</span>
            </div>
            <a-spin v-if="loading" class="stats-spinner" />
            <div v-else class="stats-container">
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
                class="stat-card stat-info-only" 
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
                class="stat-card stat-info-only"
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
          <a-spin v-if="loading" class="centered-spinner" />
          <a-empty v-else-if="upcomingInterviews.length === 0" description="No upcoming interviews" />
          <a-timeline v-else>
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
                <p class="interview-time">{{ formatInterviewDate(interview.date) }}</p>
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
            <a-select-option value="Video">Video</a-select-option>
            <a-select-option value="Onsite">Onsite</a-select-option>
            <a-select-option value="Technical">Technical</a-select-option>
            <a-select-option value="HR">HR</a-select-option>
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
import { ref, computed, onMounted, watch } from 'vue'
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

const store = useStore()
const viewMode = ref('month')
const currentDate = ref(new Date())
const showScheduleDialog = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const activeFilter = ref('all')
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
  // Format date as YYYY-MM-DD for store lookup
  const formattedDate = formatDate(date, 'YYYY-MM-DD')
  
  // Get interviews from store using the calendarInterviews getter
  const dateInterviews = store.getters['interviews/calendarInterviews'](formattedDate)
  
  // Format interviews for display
  return formatInterviewsForCalendar(dateInterviews || [])
}

// Helper to check if we've already fetched interviews for a date
const hasInterviewsForDate = (date) => {
  const formattedDate = formatDate(date, 'YYYY-MM-DD')
  return store.state.interviews.calendarInterviews[formattedDate] !== undefined
}

// Add refs for tracking loading state for calendar cells
const loadingDates = ref({});

// Update the fetchInterviewsForDate method to track loading state
const fetchInterviewsForDate = async (date) => {
  try {
    const formattedDate = formatDate(date, 'YYYY-MM-DD')
    
    // Only fetch if we haven't already fetched this date
    if (!hasInterviewsForDate(date)) {
      // Set loading state for this date
      loadingDates.value[formattedDate] = true
      
      await store.dispatch('interviews/fetchCalendarInterviews', formattedDate)
    }
  } catch (error) {
    console.error(`Error fetching interviews for date ${date}:`, error)
  } finally {
    // Clear loading state for this date
    const formattedDate = formatDate(date, 'YYYY-MM-DD')
    loadingDates.value[formattedDate] = false
  }
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
  // Get all interviews from the store
  const allInterviews = store.getters['interviews/upcomingInterviews'];
  
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
    case 'Video': return 'cyan'
    case 'Onsite': return 'gold'
    case 'Technical': return 'green'
    case 'HR': return 'purple'
    default: return 'default'
  }
}

const getStatusType = (type) => {
  return type.toLowerCase().replace(/\s+/g, '-')
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

const saveInterview = async () => {
  try {
    // Check if form is valid
    if (!interviewForm.value.candidate || !interviewForm.value.position || 
        !interviewForm.value.interviewType || !interviewForm.value.date || 
        !interviewForm.value.time) {
      message.warning('Please fill out all required fields');
      return;
    }
    
    // Format datetime from separate date and time inputs
    const scheduledAt = new Date(
      interviewForm.value.date.getFullYear(),
      interviewForm.value.date.getMonth(),
      interviewForm.value.date.getDate(),
      interviewForm.value.time.getHours(),
      interviewForm.value.time.getMinutes()
    ).toISOString();
    
    // Find selected candidate and job from selectors
    const selectedCandidate = candidates.value.find(c => c.name === interviewForm.value.candidate || c.fullName === interviewForm.value.candidate);
    const selectedJob = jobs.value.find(j => j.title === interviewForm.value.position);
    
    if (!selectedCandidate || !selectedJob) {
      message.warning('Invalid candidate or job selection');
      return;
    }
    
    // Create interview data object
    const interviewData = {
      candidateId: selectedCandidate.id,
      candidateName: selectedCandidate.name || selectedCandidate.fullName,
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      interviewType: interviewForm.value.interviewType,
      scheduledAt,
      duration: 60, // Default duration in minutes
      notes: interviewForm.value.notes,
      interviewer: interviewForm.value.interviewer,
      status: 'scheduled'
    };
    
    console.log('Creating interview with data:', interviewData)
    const result = await store.dispatch('interviews/createInterview', interviewData);
    
    if (result) {
      message.success('Interview scheduled successfully');
      showScheduleDialog.value = false;
      resetForm();
      
      // Refresh upcoming interviews list
      fetchUpcomingInterviews();
    } else {
      message.error('Failed to schedule interview');
    }
  } catch (error) {
    message.error('Failed to schedule interview: ' + (error.message || 'Unknown error'));
    console.error('Error scheduling interview:', error);
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
  // Interviews will be fetched by the watcher
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
  // Interviews will be fetched by the watcher
}

const goToday = () => {
  currentDate.value = new Date()
  // Interviews will be fetched by the watcher
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
  
  const formattedDate = formatDate(currentDate.value, 'YYYY-MM-DD')
  const interviews = store.getters['interviews/calendarInterviews'](formattedDate)
  
  return interviews ? interviews.length : 0
}

// Format interview date using the shared date helper
const formatInterviewDate = (dateInput) => {
  if (!dateInput) return '';
  
  try {
    let dateString;
    
    // Convert Date object to ISO string
    if (dateInput instanceof Date) {
      dateString = dateInput.toISOString();
    } else {
      // Assume it's already a string
      dateString = dateInput;
    }
    
    // Format date as YYYY-MM-DD HH:mm
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date:', error, dateInput);
    // Fallback format
    return typeof dateInput === 'object' ? 
      dateInput.toLocaleString() : 
      String(dateInput);
  }
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

.custom-dot.info, .custom-dot.primary, .custom-dot.phone-screen {
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

.stat-card.stat-info-only {
  cursor: default;
}

.stat-card.stat-info-only:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--border-color);
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