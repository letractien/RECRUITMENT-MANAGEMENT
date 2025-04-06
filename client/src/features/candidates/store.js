import candidatesService from './api/candidates.service';
import { ElNotification } from 'element-plus';

export default {
  namespaced: true,
  
  state: {
    candidates: [],
    currentCandidate: null,
    candidateInterviews: [],
    loading: false,
    error: null,
    filters: {
      status: null,
      department: null,
      search: ''
    }
  },
  
  getters: {
    allCandidates: state => state.candidates,
    candidateById: state => id => state.candidates.find(candidate => candidate.id === id),
    currentCandidate: state => state.currentCandidate,
    candidateInterviews: state => state.candidateInterviews,
    isLoading: state => state.loading,
    hasError: state => !!state.error,
    errorMessage: state => state.error,
    filters: state => state.filters
  },
  
  actions: {
    async fetchCandidates({ commit, state }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const { data } = await candidatesService.searchCandidates(state.filters);
        commit('SET_CANDIDATES', data);
        return data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        ElNotification({
          title: 'Error',
          message: error.message,
          type: 'error'
        });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchCandidate({ commit }, id) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const { data } = await candidatesService.getCandidate(id);
        commit('SET_CURRENT_CANDIDATE', data);
        return data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        ElNotification({
          title: 'Error',
          message: error.message,
          type: 'error'
        });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async createCandidate({ commit, dispatch }, candidateData) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const { data } = await candidatesService.createCandidate(candidateData);
        ElNotification({
          title: 'Success',
          message: 'Candidate created successfully',
          type: 'success'
        });
        
        // Refresh candidate list
        dispatch('fetchCandidates');
        
        return data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        ElNotification({
          title: 'Error',
          message: error.message,
          type: 'error'
        });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateCandidate({ commit, dispatch }, { id, candidateData }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const { data } = await candidatesService.updateCandidate(id, candidateData);
        ElNotification({
          title: 'Success',
          message: 'Candidate updated successfully',
          type: 'success'
        });
        
        // Update current candidate if it's the one being edited
        if (id === this.state.candidates.currentCandidate?.id) {
          commit('SET_CURRENT_CANDIDATE', data);
        }
        
        // Refresh candidate list
        dispatch('fetchCandidates');
        
        return data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        ElNotification({
          title: 'Error',
          message: error.message,
          type: 'error'
        });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async deleteCandidate({ commit, dispatch }, id) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        await candidatesService.deleteCandidate(id);
        ElNotification({
          title: 'Success',
          message: 'Candidate deleted successfully',
          type: 'success'
        });
        
        // Refresh candidate list
        dispatch('fetchCandidates');
      } catch (error) {
        commit('SET_ERROR', error.message);
        ElNotification({
          title: 'Error',
          message: error.message,
          type: 'error'
        });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateCandidateStatus({ commit, dispatch }, { id, status }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const { data } = await candidatesService.updateCandidateStatus(id, status);
        ElNotification({
          title: 'Success',
          message: `Candidate status updated to ${status}`,
          type: 'success'
        });
        
        // Update current candidate if it's the one being edited
        if (id === this.state.candidates.currentCandidate?.id) {
          commit('SET_CURRENT_CANDIDATE', data);
        }
        
        // Refresh candidate list
        dispatch('fetchCandidates');
        
        return data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        ElNotification({
          title: 'Error',
          message: error.message,
          type: 'error'
        });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchCandidateInterviews({ commit }, id) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const { data } = await candidatesService.getCandidateInterviews(id);
        commit('SET_CANDIDATE_INTERVIEWS', data);
        return data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        ElNotification({
          title: 'Error',
          message: error.message,
          type: 'error'
        });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    setFilters({ commit, dispatch }, filters) {
      commit('SET_FILTERS', filters);
      dispatch('fetchCandidates');
    }
  },
  
  mutations: {
    SET_CANDIDATES(state, candidates) {
      state.candidates = candidates;
    },
    
    SET_CURRENT_CANDIDATE(state, candidate) {
      state.currentCandidate = candidate;
    },
    
    SET_CANDIDATE_INTERVIEWS(state, interviews) {
      state.candidateInterviews = interviews;
    },
    
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    
    SET_ERROR(state, error) {
      state.error = error;
    },
    
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters };
    }
  }
}; 