import interviewsService from './api/interviews.service.js';

const state = {
  interviews: [],
  currentInterview: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    candidateId: null,
    jobId: null,
    date: null,
    startDate: null,
    endDate: null,
    search: ''
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0
  },
  upcomingInterviews: [],
  calendarInterviews: {}
};

const getters = {
  allInterviews: state => state.interviews,
  currentInterview: state => state.currentInterview,
  isLoading: state => state.loading,
  hasError: state => !!state.error,
  errorMessage: state => state.error,
  filteredInterviews: state => {
    let result = [...state.interviews];
    
    // Apply status filter
    if (state.filters.status) {
      result = result.filter(interview => interview.status === state.filters.status);
    }
    
    // Apply candidate filter
    if (state.filters.candidateId) {
      result = result.filter(interview => interview.candidateId === state.filters.candidateId);
    }
    
    // Apply job filter
    if (state.filters.jobId) {
      result = result.filter(interview => interview.jobId === state.filters.jobId);
    }
    
    // Apply date filter
    if (state.filters.date) {
      const filterDate = new Date(state.filters.date);
      filterDate.setHours(0, 0, 0, 0); // Start of day
      
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1); // End of day
      
      result = result.filter(interview => {
        const interviewDate = new Date(interview.scheduledAt);
        return interviewDate >= filterDate && interviewDate < nextDay;
      });
    } else if (state.filters.startDate && state.filters.endDate) {
      // Apply date range filter
      const startDate = new Date(state.filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(state.filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      result = result.filter(interview => {
        const interviewDate = new Date(interview.scheduledAt);
        return interviewDate >= startDate && interviewDate <= endDate;
      });
    }
    
    // Apply search filter (case insensitive)
    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      result = result.filter(interview => 
        interview.candidateName?.toLowerCase().includes(searchTerm) ||
        interview.jobTitle?.toLowerCase().includes(searchTerm) ||
        interview.notes?.toLowerCase().includes(searchTerm)
      );
    }
    
    return result;
  },
  paginatedInterviews: (state, getters) => {
    const start = (state.pagination.currentPage - 1) * state.pagination.pageSize;
    const end = start + state.pagination.pageSize;
    
    return getters.filteredInterviews.slice(start, end);
  },
  totalInterviews: (state, getters) => getters.filteredInterviews.length,
  interviewsByStatus: state => status => {
    return state.interviews.filter(interview => interview.status === status);
  },
  upcomingInterviews: state => {
    // First try to use our stored upcoming interviews from the dashboard endpoint
    if (state.upcomingInterviews && state.upcomingInterviews.length > 0) {
      return state.upcomingInterviews;
    }
    
    // Fallback to filtering from all interviews if we don't have upcoming data
    const now = new Date();
    return state.interviews
      .filter(interview => new Date(interview.scheduledAt) > now && interview.status !== 'cancelled')
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  },
  todaysInterviews: state => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow
    
    return state.interviews
      .filter(interview => {
        const interviewDate = new Date(interview.scheduledAt);
        return interviewDate >= today && interviewDate < tomorrow && interview.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  },
  calendarInterviews: state => dateStr => {
    // Try to get interviews from calendar cache first
    if (state.calendarInterviews[dateStr]) {
      return state.calendarInterviews[dateStr];
    }
    
    // Fallback to filtering from all interviews
    const date = new Date(dateStr);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return state.interviews.filter(interview => {
      const interviewDate = new Date(interview.scheduledAt);
      return interviewDate >= startOfDay && interviewDate <= endOfDay;
    });
  }
};

const actions = {
  async fetchInterviews({ commit, rootState }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to fetch interviews
      const response = await interviewsService.getAllInterviews();
      
      commit('SET_INTERVIEWS', response.data);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched interviews:', response.data.length);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to fetch interviews');
      console.error('Error fetching interviews:', error);
      return [];
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchInterview({ commit, state }, id) {
    try {
      commit('SET_LOADING', true);
      
      // Check if we already have this interview in state
      let interview = state.interviews.find(i => i.id === Number(id));
      
      if (!interview) {
        // Use API service to fetch a single interview
        const response = await interviewsService.getInterview(id);
        interview = response.data;
      }
      
      commit('SET_CURRENT_INTERVIEW', interview);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched interview for:', interview.candidateName);
      return interview;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to fetch interview with ID ${id}`);
      console.error(`Error fetching interview ${id}:`, error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async createInterview({ commit, dispatch }, interviewData) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to create an interview
      const response = await interviewsService.createInterview(interviewData);
      const newInterview = response.data;
      
      // Add to state
      commit('ADD_INTERVIEW', newInterview);
      commit('SET_ERROR', null);
      
      console.log('Successfully scheduled interview for:', newInterview.candidateName);
      return newInterview;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to create interview');
      console.error('Error creating interview:', error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async updateInterview({ commit, state }, { id, data }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to update interview
      const response = await interviewsService.updateInterview(id, data);
      const updatedInterview = response.data;
      
      // Update in state
      commit('UPDATE_INTERVIEW', updatedInterview);
      
      // If the current interview is being updated, update it in the state
      if (state.currentInterview && state.currentInterview.id === Number(id)) {
        commit('SET_CURRENT_INTERVIEW', updatedInterview);
      }
      
      commit('SET_ERROR', null);
      
      console.log('Successfully updated interview for:', updatedInterview.candidateName);
      return updatedInterview;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to update interview with ID ${id}`);
      console.error(`Error updating interview ${id}:`, error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async deleteInterview({ commit, state }, id) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to delete interview
      await interviewsService.deleteInterview(id);
      
      // Remove from state
      commit('REMOVE_INTERVIEW', id);
      
      // If the current interview is being deleted, clear it
      if (state.currentInterview && state.currentInterview.id === Number(id)) {
        commit('SET_CURRENT_INTERVIEW', null);
      }
      
      commit('SET_ERROR', null);
      
      console.log('Successfully deleted interview with ID:', id);
      return true;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to delete interview with ID ${id}`);
      console.error(`Error deleting interview ${id}:`, error);
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async updateInterviewStatus({ commit, state }, { id, status }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to update interview status
      const response = await interviewsService.updateInterviewStatus(id, status);
      const updatedInterview = response.data;
      
      // Update in state
      commit('UPDATE_INTERVIEW', updatedInterview);
      
      // If the current interview is being updated, update it in the state
      if (state.currentInterview && state.currentInterview.id === Number(id)) {
        commit('SET_CURRENT_INTERVIEW', updatedInterview);
      }
      
      commit('SET_ERROR', null);
      
      console.log('Successfully updated interview status to:', status);
      return updatedInterview;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to update status for interview with ID ${id}`);
      console.error(`Error updating status for interview ${id}:`, error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchUpcomingInterviews({ commit }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to fetch upcoming interviews from the dashboard endpoint
      const response = await interviewsService.getUpcomingInterviews();
      
      // Store the upcoming interviews for the getter to access
      const upcomingData = response.data || [];
      commit('SET_UPCOMING_INTERVIEWS', upcomingData);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched upcoming interviews:', upcomingData.length);
      return upcomingData;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to fetch upcoming interviews');
      console.error('Error fetching upcoming interviews:', error);
      return [];
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchInterviewsByDate({ commit }, date) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to fetch interviews by date
      const response = await interviewsService.getInterviewsByDate(date);
      
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched interviews for date:', date);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to fetch interviews for date ${date}`);
      console.error(`Error fetching interviews for date ${date}:`, error);
      return [];
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchTodayInterviews({ commit }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to fetch today's interviews
      const response = await interviewsService.getTodayInterviews();
      
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched today\'s interviews:', response.data.length);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to fetch today\'s interviews');
      console.error('Error fetching today\'s interviews:', error);
      return [];
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async addInterviewNote({ commit, state }, { id, noteData }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to add note to interview
      const response = await interviewsService.addInterviewNote(id, noteData);
      const updatedInterview = response.data;
      
      // Update in state
      commit('UPDATE_INTERVIEW', updatedInterview);
      
      // If the current interview is being updated, update it in the state
      if (state.currentInterview && state.currentInterview.id === Number(id)) {
        commit('SET_CURRENT_INTERVIEW', updatedInterview);
      }
      
      commit('SET_ERROR', null);
      
      console.log('Successfully added note to interview:', id);
      return updatedInterview;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to add note to interview with ID ${id}`);
      console.error(`Error adding note to interview ${id}:`, error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async rescheduleInterview({ commit, state }, { id, scheduleData }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to reschedule interview
      const response = await interviewsService.rescheduleInterview(id, scheduleData);
      const updatedInterview = response.data;
      
      // Update in state
      commit('UPDATE_INTERVIEW', updatedInterview);
      
      // If the current interview is being updated, update it in the state
      if (state.currentInterview && state.currentInterview.id === Number(id)) {
        commit('SET_CURRENT_INTERVIEW', updatedInterview);
      }
      
      commit('SET_ERROR', null);
      
      console.log('Successfully rescheduled interview:', id);
      return updatedInterview;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to reschedule interview with ID ${id}`);
      console.error(`Error rescheduling interview ${id}:`, error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  setFilters({ commit, state }, filters) {
    commit('SET_FILTERS', filters);
    commit('SET_PAGINATION', { ...state.pagination, currentPage: 1 }); // Reset to first page when filters change
  },
  
  setPagination({ commit }, pagination) {
    commit('SET_PAGINATION', pagination);
  },
  
  async fetchCalendarInterviews({ commit }, { startDate, endDate }) {
    try {
      commit('SET_LOADING', true);
      
      // Format dates as YYYY-MM-DD for API
      const formattedStartDate = typeof startDate === 'string' ? startDate : 
        startDate.toISOString().split('T')[0];
      const formattedEndDate = typeof endDate === 'string' ? endDate : 
        endDate.toISOString().split('T')[0];
      
      // Use the API service to fetch interviews for this date range
      const response = await interviewsService.getInterviewsByDate(formattedStartDate, formattedEndDate);
      const interviews = response.data || [];
      
      // Store interviews in calendar cache
      interviews.forEach(interview => {
        const interviewDate = new Date(interview.scheduledAt).toISOString().split('T')[0];
        if (!state.calendarInterviews[interviewDate]) {
          state.calendarInterviews[interviewDate] = [];
        }
        
        // Check if interview is already in the cache
        const existingIndex = state.calendarInterviews[interviewDate].findIndex(i => i.id === interview.id);
        if (existingIndex === -1) {
          commit('ADD_CALENDAR_INTERVIEW', { date: interviewDate, interview });
        }
      });
      
      commit('SET_ERROR', null);
      
      console.log(`Successfully fetched interviews for calendar date range: ${formattedStartDate} to ${formattedEndDate}`, interviews.length);
      return interviews;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to fetch calendar interviews for date range`);
      console.error(`Error fetching calendar interviews:`, error);
      return [];
    } finally {
      commit('SET_LOADING', false);
    }
  }
};

const mutations = {
  SET_INTERVIEWS(state, interviews) {
    state.interviews = interviews;
    state.pagination.total = interviews.length;
  },
  
  ADD_INTERVIEW(state, interview) {
    state.interviews.unshift(interview); // Add to beginning of array
    state.pagination.total = state.interviews.length;
  },
  
  UPDATE_INTERVIEW(state, updatedInterview) {
    const index = state.interviews.findIndex(i => i.id === updatedInterview.id);
    if (index !== -1) {
      state.interviews.splice(index, 1, updatedInterview);
    }
  },
  
  REMOVE_INTERVIEW(state, id) {
    state.interviews = state.interviews.filter(i => i.id !== Number(id));
    state.pagination.total = state.interviews.length;
  },
  
  SET_CURRENT_INTERVIEW(state, interview) {
    state.currentInterview = interview;
  },
  
  SET_LOADING(state, isLoading) {
    state.loading = isLoading;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters };
  },
  
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination };
  },
  
  SET_UPCOMING_INTERVIEWS(state, interviews) {
    state.upcomingInterviews = interviews;
  },
  
  SET_CALENDAR_INTERVIEWS(state, { date, interviews }) {
    state.calendarInterviews = { 
      ...state.calendarInterviews, 
      [date]: interviews 
    };
  },
  
  ADD_CALENDAR_INTERVIEW(state, { date, interview }) {
    if (!state.calendarInterviews[date]) {
      state.calendarInterviews[date] = [];
    }
    state.calendarInterviews[date].push(interview);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}; 