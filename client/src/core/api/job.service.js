import apiService from './apiClient';

// Get all jobs with optional filtering
export const getAllJobs = async (params = {}) => {
  try {
    const response = await apiService.get('/jobs', { params });
    return { data: response.data };
  } catch (error) {
    console.error('Get jobs error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch jobs');
  }
};

// Get a specific job by ID
export const getJob = async (id) => {
  try {
    const response = await apiService.get(`/jobs/${id}`);
    return { data: response.data };
  } catch (error) {
    console.error(`Get job ${id} error:`, error);
    throw new Error(error.response?.data?.detail || `Job with ID ${id} not found`);
  }
};

// Create a new job
export const createJob = async (jobData) => {
  try {
    const response = await apiService.post('/jobs', jobData);
    return { data: response.data };
  } catch (error) {
    console.error('Create job error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create job');
  }
};

// Update an existing job
export const updateJob = async (id, jobData) => {
  try {
    const response = await apiService.put(`/jobs/${id}`, jobData);
    return { data: response.data };
  } catch (error) {
    console.error(`Update job ${id} error:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to update job');
  }
};

// Delete a job
export const deleteJob = async (id) => {
  try {
    await apiService.delete(`/jobs/${id}`);
    return { data: { success: true, message: 'Job deleted successfully' } };
  } catch (error) {
    console.error(`Delete job ${id} error:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to delete job');
  }
};

// Update a job's status
export const updateJobStatus = async (id, status) => {
  try {
    const response = await apiService.patch(`/jobs/${id}/status`, { status });
    return { data: response.data };
  } catch (error) {
    console.error(`Update job ${id} status error:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to update job status');
  }
};

// Get all candidates for a specific job
export const getJobApplicants = async (id) => {
  try {
    const response = await apiService.get(`/jobs/${id}/candidates`);
    return { data: response.data };
  } catch (error) {
    console.error(`Get job ${id} applicants error:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch job applicants');
  }
};

// Get all jobs for a specific department
export const getJobsByDepartment = async (department) => {
  try {
    const response = await apiService.get(`/jobs/department/${department}`);
    return { data: response.data };
  } catch (error) {
    console.error(`Get jobs for department ${department} error:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch jobs by department');
  }
}; 