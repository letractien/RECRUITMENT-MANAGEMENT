import { jobsService } from '@/utils/api';
import { generateJobs } from '@/utils/mockData';

const state = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    department: '',
    search: ''
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0
  }
};

const getters = {
  allJobs: state => state.jobs,
  currentJob: state => state.currentJob,
  isLoading: state => state.loading,
  hasError: state => !!state.error,
  errorMessage: state => state.error,
  filteredJobs: state => {
    let result = [...state.jobs];
    
    // Apply status filter
    if (state.filters.status) {
      result = result.filter(job => job.status === state.filters.status);
    }
    
    // Apply department filter
    if (state.filters.department) {
      result = result.filter(job => job.department === state.filters.department);
    }
    
    // Apply search filter (case insensitive)
    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.department.toLowerCase().includes(searchTerm)
      );
    }
    
    return result;
  },
  paginatedJobs: (state, getters) => {
    const start = (state.pagination.currentPage - 1) * state.pagination.pageSize;
    const end = start + state.pagination.pageSize;
    
    return getters.filteredJobs.slice(start, end);
  },
  totalJobs: (state, getters) => getters.filteredJobs.length,
  jobsByStatus: state => status => {
    return state.jobs.filter(job => job.status === status);
  },
  jobsByDepartment: state => department => {
    return state.jobs.filter(job => job.department === department);
  },
  departmentsList: state => {
    const departments = new Set(state.jobs.map(job => job.department));
    return Array.from(departments).sort();
  }
};

const actions = {
  async fetchJobs({ commit }) {
    try {
      commit('SET_LOADING', true);
      
      // Generate random jobs data instead of API call
      // This simulates a successful API response
      const randomJobs = generateJobs(12);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      commit('SET_JOBS', randomJobs);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched jobs:', randomJobs.length);
      return randomJobs;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to fetch jobs');
      console.error('Error fetching jobs:', error);
      return [];
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchJob({ commit, state }, id) {
    try {
      commit('SET_LOADING', true);
      
      // Check if we already have this job in state
      let job = state.jobs.find(j => j.id === Number(id));
      
      if (!job) {
        // Generate a random job if we need to fetch one
        job = generateJobs(1)[0];
        job.id = Number(id); // Ensure ID matches requested ID
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      commit('SET_CURRENT_JOB', job);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched job:', job.title);
      return job;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to fetch job with ID ${id}`);
      console.error(`Error fetching job ${id}:`, error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async createJob({ commit, dispatch }, jobData) {
    try {
      commit('SET_LOADING', true);
      
      // Generate a new job with the provided data plus random fields
      const randomJob = generateJobs(1)[0];
      const newJob = {
        ...randomJob,
        ...jobData,
        id: Date.now(), // Generate a unique ID
        postedDate: new Date().toISOString().split('T')[0], // Today's date
        applicants: 0,
        interviews: 0
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Add to state
      commit('ADD_JOB', newJob);
      commit('SET_ERROR', null);
      
      console.log('Successfully created job:', newJob.title);
      return newJob;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to create job');
      console.error('Error creating job:', error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async updateJob({ commit, dispatch }, { id, data }) {
    try {
      commit('SET_LOADING', true);
      const response = await jobsService.updateJob(id, data);
      commit('SET_ERROR', null);
      
      // If the current job is being updated, update it in the state
      if (state.currentJob && state.currentJob.id === id) {
        commit('SET_CURRENT_JOB', response.data);
      }
      
      dispatch('fetchJobs'); // Refresh list after updating
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to update job with ID ${id}`);
      console.error(`Error updating job ${id}:`, error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async deleteJob({ commit, dispatch }, id) {
    try {
      commit('SET_LOADING', true);
      await jobsService.deleteJob(id);
      commit('SET_ERROR', null);
      
      // If the current job is being deleted, clear it
      if (state.currentJob && state.currentJob.id === id) {
        commit('SET_CURRENT_JOB', null);
      }
      
      dispatch('fetchJobs'); // Refresh list after deleting
      return true;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to delete job with ID ${id}`);
      console.error(`Error deleting job ${id}:`, error);
      return false;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async updateJobStatus({ commit, dispatch }, { id, status }) {
    try {
      commit('SET_LOADING', true);
      const response = await jobsService.updateJobStatus(id, status);
      commit('SET_ERROR', null);
      
      // If the current job is being updated, update it in the state
      if (state.currentJob && state.currentJob.id === id) {
        commit('SET_CURRENT_JOB', { ...state.currentJob, status });
      }
      
      dispatch('fetchJobs'); // Refresh list after updating status
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || `Failed to update status for job with ID ${id}`);
      console.error(`Error updating status for job ${id}:`, error);
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
  SET_JOBS(state, jobs) {
    state.jobs = jobs;
    state.pagination.total = jobs.length;
  },
  
  ADD_JOB(state, job) {
    state.jobs.unshift(job); // Add to beginning of array
    state.pagination.total = state.jobs.length;
  },
  
  SET_CURRENT_JOB(state, job) {
    state.currentJob = job;
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