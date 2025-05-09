import jobsService from './api/jobs.service.js';

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
  },
  applications: [],
  currentApplication: null,
  applicationFilters: {
    status: '',
    search: ''
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
  },
  jobApplications: state => state.applications,
  currentApplication: state => state.currentApplication,
  filteredApplications: state => {
    let result = [...state.applications];
    
    // Apply status filter
    if (state.applicationFilters.status) {
      result = result.filter(app => app.status === state.applicationFilters.status);
    }
    
    // Apply search filter
    if (state.applicationFilters.search) {
      const searchTerm = state.applicationFilters.search.toLowerCase();
      result = result.filter(app => 
        app.candidateName.toLowerCase().includes(searchTerm) ||
        app.email.toLowerCase().includes(searchTerm)
      );
    }
    
    return result;
  }
};

const actions = {
  async fetchJobs({ commit }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to fetch jobs
      const response = await jobsService.getAllJobs();
      
      if (response.data) {
        // Map any necessary fields or transformations here if needed
        const jobs = response.data.map(job => {
          // Create a default posted date if none exists
          const postedDate = job.posted_date || job.postedDate || job.created_at || new Date().toISOString();
          
          return {
            ...job,
            id: job.id || job._id, // Handle both id formats
            postedDate: postedDate, // Use the determined posted date
            posted_date: postedDate, // Set both formats for consistency
            applications: job.applications || job.applicants || 0 // Default to 0 if not provided
          };
        });
        
        commit('SET_JOBS', jobs);
        commit('SET_ERROR', null);
        
        console.log('Successfully fetched jobs:', jobs.length);
        return jobs;
      } else {
        commit('SET_JOBS', []);
        commit('SET_ERROR', 'No data received from server');
        return [];
      }
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
        // Use API service to fetch a single job
        const response = await jobsService.getJob(id);
        job = response.data;
      }
      
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
      
      // Ensure job data has a posted date
      const jobWithDate = {
        ...jobData,
        posted_date: jobData.posted_date || new Date().toISOString(),
        postedDate: jobData.postedDate || new Date().toISOString()
      };
      console.log(jobWithDate); // Kiểm tra dữ liệu gửi đến backend
      // Use API service to create a job
      const response = await jobsService.createJob(jobWithDate);
      const newJob = response.data;
      
      // Add to state with consistent date format
      commit('ADD_JOB', {
        ...newJob,
        posted_date: newJob.posted_date || newJob.postedDate || newJob.created_at || new Date().toISOString(),
        postedDate: newJob.posted_date || newJob.postedDate || newJob.created_at || new Date().toISOString()
      });
      
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
  
  async updateJob({ commit, dispatch, state }, { id, data }) {
    try {
      commit('SET_LOADING', true);
      
      // Ensure we have a valid job ID
      const jobId = id || data.id;
      if (!jobId) {
        throw new Error('Job ID is required for update');
      }
      
      // Clean up the data before sending
      const updateData = {
        ...data,
        id: undefined // Remove id from update data as it's in the URL
      };
      
      console.log("Updating job with ID:", jobId, "Data:", updateData);
      const response = await jobsService.updateJob(jobId, updateData);
      commit('SET_ERROR', null);
      
      // Update the current job in state if it's the one being updated
      if (state.currentJob && state.currentJob.id === jobId) {
        commit('SET_CURRENT_JOB', response);
      }
      
      // Refresh the jobs list to show updated data
      await dispatch('fetchJobs');
      
      return response;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to update job');
      console.error('Error updating job:', error);
      throw error;
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
  },
  
  async fetchJobApplications({ commit }, jobId) {
    try {
      commit('SET_LOADING', true);
      const response = await jobsService.getJobApplications(jobId);
      
      if (response.data) {
        const applications = response.data.map(app => ({
          // Basic info
          id: app.id,
          candidateName: app.name,
          email: app.email,
          phone: app.phone,
          status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
          appliedDate: app.applied_date || app.applied_date,
          department: app.department,
          
          // Position and experience
          position: app.position,
          experience: app.experience,
          
          // Personal info
          address: app.address,
          career_goal: app.career_goal,
          current_company: app.current_company,
          current_position: app.current_position,
          notice_period: app.notice_period,
          
          // Education and skills
          educations: app.educations || [],
          skills: app.skills || [],
          external_links: app.external_links || [],
          
          // Documents
          resumeUrl: app.resume_url,
          resume_drive_url: app.resume_drive_url,
          resume_download_url: app.resume_download_url,
          
          // Additional info
          notes: app.notes,
          salary_expectation: app.salary_expectation,
          sourceOfApplication: app.source,
          
          // Scores
          totalScore: app.total_score,
          backgroundScore: app.background_score,
          projectScore: app.project_score,
          skillScore: app.skill_score,
          certificateScore: app.certificate_score,
          
          // Status dates
          rejected_date: app.rejected_date,
          rejection_reason: app.rejection_reason,
          interview_date: app.interview_date,
          offer_date: app.offer_date,
          hired_date: app.hired_date,
          screening_date: app.screening_date
        }));
        commit('SET_APPLICATIONS', applications);
      }
      else {
        commit('SET_APPLICATIONS', []);        
      }
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async updateApplicationStatus({ commit }, { jobId, applicationId, status }) {
    try {
      commit('SET_LOADING', true);
      await jobsService.updateApplicationStatus(jobId, applicationId, status);
      commit('UPDATE_APPLICATION_STATUS', { applicationId, status });
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  setApplicationFilters({ commit }, filters) {
    commit('SET_APPLICATION_FILTERS', filters);
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
  },
  
  SET_APPLICATIONS(state, applications) {
    state.applications = applications;
  },
  
  SET_CURRENT_APPLICATION(state, application) {
    state.currentApplication = application;
  },
  
  SET_APPLICATION_FILTERS(state, filters) {
    state.applicationFilters = { ...state.applicationFilters, ...filters };
  },
  
  UPDATE_APPLICATION_STATUS(state, { applicationId, status }) {
    const application = state.applications.find(app => app.id === applicationId);
    if (application) {
      application.status = status;
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}; 