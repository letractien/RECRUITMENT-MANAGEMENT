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
    search: ''
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0
  }
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
  
  async updateInterview({ commit, dispatch }, { id, data }) {
    try {
      commit('SET_LOADING', true);
      
      // Find current interview
      const interview = state.interviews.find(i => i.id === Number(id));
      
      if (!interview) {
        throw new Error(`Interview with ID ${id} not found`);
      }
      
      const updatedInterview = { ...interview, ...data };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Update in state
      commit('UPDATE_INTERVIEW', updatedInterview);
      
      // If the current interview is being updated, update it in the state
      if (state.currentInterview && state.currentInterview.id === id) {
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
  
  async deleteInterview({ commit }, id) {
    try {
      commit('SET_LOADING', true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
  
  async updateInterviewStatus({ commit }, { id, status }) {
    try {
      commit('SET_LOADING', true);
      
      // Find current interview
      const interview = state.interviews.find(i => i.id === Number(id));
      
      if (!interview) {
        throw new Error(`Interview with ID ${id} not found`);
      }
      
      const updatedInterview = { ...interview, status };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
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
  
  setFilters({ commit }, filters) {
    commit('SET_FILTERS', filters);
    commit('SET_PAGINATION', { ...state.pagination, currentPage: 1 }); // Reset to first page when filters change
  },
  
  setPagination({ commit }, pagination) {
    commit('SET_PAGINATION', pagination);
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
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}; 