import { candidatesService } from '@/utils/api';
import { generateCandidates } from '@/utils/mockData';

const state = {
  candidates: [],
  currentCandidate: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    search: ''
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0
  }
};

const getters = {
  allCandidates: state => state.candidates,
  currentCandidate: state => state.currentCandidate,
  isLoading: state => state.loading,
  hasError: state => !!state.error,
  errorMessage: state => state.error,
  filteredCandidates: state => {
    let result = [...state.candidates];
    
    // Apply status filter
    if (state.filters.status) {
      result = result.filter(candidate => candidate.status === state.filters.status);
    }
    
    // Apply search filter (case insensitive)
    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      result = result.filter(candidate => 
        candidate.name.toLowerCase().includes(searchTerm) ||
        candidate.email.toLowerCase().includes(searchTerm) ||
        candidate.position.toLowerCase().includes(searchTerm)
      );
    }
    
    return result;
  },
  paginatedCandidates: (state, getters) => {
    const start = (state.pagination.currentPage - 1) * state.pagination.pageSize;
    const end = start + state.pagination.pageSize;
    
    return getters.filteredCandidates.slice(start, end);
  },
  totalCandidates: (state, getters) => getters.filteredCandidates.length,
  candidatesByStatus: state => status => {
    return state.candidates.filter(candidate => candidate.status === status);
  }
};

const actions = {
  async fetchCandidates({ commit }) {
    try {
      commit('SET_LOADING', true);
      
      // Generate random candidates data instead of API call
      // This simulates a successful API response
      const randomCandidates = generateCandidates(15);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      commit('SET_CANDIDATES', randomCandidates);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched candidates:', randomCandidates.length);
      return randomCandidates;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to fetch candidates');
      console.error('Error fetching candidates:', error);
      return [];
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchCandidate({ commit, state }, id) {
    try {
      commit('SET_LOADING', true);
      
      // Check if we already have this candidate in state
      let candidate = state.candidates.find(c => c.id === Number(id));
      
      if (!candidate) {
        // Generate a random candidate if we need to fetch one
        candidate = generateCandidates(1)[0];
        candidate.id = Number(id); // Ensure ID matches requested ID
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      commit('SET_CURRENT_CANDIDATE', candidate);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched candidate:', candidate.name);
      return candidate;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to fetch candidate with ID ${id}`);
      console.error(`Error fetching candidate ${id}:`, error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async createCandidate({ commit, dispatch }, candidateData) {
    try {
      commit('SET_LOADING', true);
      
      // Generate a new candidate with the provided data plus random fields
      const randomCandidate = generateCandidates(1)[0];
      const newCandidate = {
        ...randomCandidate,
        ...candidateData,
        id: Date.now(), // Generate a unique ID
        appliedDate: new Date().toISOString().split('T')[0] // Today's date
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Add to state
      commit('ADD_CANDIDATE', newCandidate);
      commit('SET_ERROR', null);
      
      console.log('Successfully created candidate:', newCandidate.name);
      return newCandidate;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to create candidate');
      console.error('Error creating candidate:', error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async updateCandidate({ commit, dispatch }, { id, data }) {
    try {
      commit('SET_LOADING', true);
      const response = await candidatesService.updateCandidate(id, data);
      commit('SET_ERROR', null);
      
      // If the current candidate is being updated, update it in the state
      if (state.currentCandidate && state.currentCandidate.id === id) {
        commit('SET_CURRENT_CANDIDATE', response.data);
      }
      
      dispatch('fetchCandidates'); // Refresh list after updating
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to update candidate with ID ${id}`);
      console.error(`Error updating candidate ${id}:`, error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async deleteCandidate({ commit, dispatch }, id) {
    try {
      commit('SET_LOADING', true);
      await candidatesService.deleteCandidate(id);
      commit('SET_ERROR', null);
      
      // If the current candidate is being deleted, clear it
      if (state.currentCandidate && state.currentCandidate.id === id) {
        commit('SET_CURRENT_CANDIDATE', null);
      }
      
      dispatch('fetchCandidates'); // Refresh list after deleting
      return true;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to delete candidate with ID ${id}`);
      console.error(`Error deleting candidate ${id}:`, error);
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async updateCandidateStatus({ commit, dispatch }, { id, status }) {
    try {
      commit('SET_LOADING', true);
      const response = await candidatesService.updateCandidateStatus(id, status);
      commit('SET_ERROR', null);
      
      // If the current candidate is being updated, update it in the state
      if (state.currentCandidate && state.currentCandidate.id === id) {
        commit('SET_CURRENT_CANDIDATE', { ...state.currentCandidate, status });
      }
      
      dispatch('fetchCandidates'); // Refresh list after updating status
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to update status for candidate with ID ${id}`);
      console.error(`Error updating status for candidate ${id}:`, error);
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
  SET_CANDIDATES(state, candidates) {
    state.candidates = candidates;
    state.pagination.total = candidates.length;
  },
  
  ADD_CANDIDATE(state, candidate) {
    state.candidates.unshift(candidate); // Add to beginning of array
    state.pagination.total = state.candidates.length;
  },
  
  SET_CURRENT_CANDIDATE(state, candidate) {
    state.currentCandidate = candidate;
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