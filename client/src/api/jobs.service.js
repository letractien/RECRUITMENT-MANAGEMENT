import apiClient from './apiClient';

const RESOURCE = '/jobs';

export default {
  /**
   * Get all jobs
   * @returns {Promise} - Promise with response data
   */
  getAllJobs() {
    return apiClient.get(RESOURCE);
  },

  /**
   * Get a specific job by ID
   * @param {string|number} id - The job ID
   * @returns {Promise} - Promise with response data
   */
  getJob(id) {
    return apiClient.get(`${RESOURCE}/${id}`);
  },

  /**
   * Create a new job
   * @param {Object} jobData - The job data
   * @returns {Promise} - Promise with response data
   */
  createJob(jobData) {
    return apiClient.post(RESOURCE, jobData);
  },

  /**
   * Update a job
   * @param {string|number} id - The job ID
   * @param {Object} jobData - The updated job data
   * @returns {Promise} - Promise with response data
   */
  updateJob(id, jobData) {
    return apiClient.put(`${RESOURCE}/${id}`, jobData);
  },

  /**
   * Delete a job
   * @param {string|number} id - The job ID
   * @returns {Promise} - Promise with response data
   */
  deleteJob(id) {
    return apiClient.delete(`${RESOURCE}/${id}`);
  },

  /**
   * Update job status
   * @param {string|number} id - The job ID
   * @param {string} status - The new status
   * @returns {Promise} - Promise with response data
   */
  updateJobStatus(id, status) {
    return apiClient.patch(`${RESOURCE}/${id}/status`, { status });
  },

  /**
   * Search jobs
   * @param {Object} params - Search parameters
   * @returns {Promise} - Promise with response data
   */
  searchJobs(params) {
    return apiClient.get(RESOURCE, { params });
  },

  /**
   * Get job applicants
   * @param {string|number} id - The job ID
   * @returns {Promise} - Promise with response data
   */
  getJobApplicants(id) {
    return apiClient.get(`${RESOURCE}/${id}/applicants`);
  },

  /**
   * Get job by department
   * @param {string} department - The department name
   * @returns {Promise} - Promise with response data
   */
  getJobsByDepartment(department) {
    return apiClient.get(`${RESOURCE}/department/${department}`);
  },

  /**
   * Get job statistics
   * @returns {Promise} - Promise with response data
   */
  getJobStatistics() {
    return apiClient.get(`${RESOURCE}/statistics`);
  },

  /**
   * Add note to job
   * @param {string|number} id - The job ID
   * @param {Object} noteData - The note data
   * @returns {Promise} - Promise with response data
   */
  addJobNote(id, noteData) {
    return apiClient.post(`${RESOURCE}/${id}/notes`, noteData);
  },

  /**
   * Get job notes
   * @param {string|number} id - The job ID
   * @returns {Promise} - Promise with response data
   */
  getJobNotes(id) {
    return apiClient.get(`${RESOURCE}/${id}/notes`);
  }
}; 