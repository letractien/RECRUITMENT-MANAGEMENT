import apiClient from './apiClient';

const RESOURCE = '/interviews';

export default {
  /**
   * Get all interviews
   * @returns {Promise} - Promise with response data
   */
  getAllInterviews() {
    return apiClient.get(RESOURCE);
  },

  /**
   * Get a specific interview by ID
   * @param {string|number} id - The interview ID
   * @returns {Promise} - Promise with response data
   */
  getInterview(id) {
    return apiClient.get(`${RESOURCE}/${id}`);
  },

  /**
   * Create a new interview
   * @param {Object} interviewData - The interview data
   * @returns {Promise} - Promise with response data
   */
  createInterview(interviewData) {
    return apiClient.post(RESOURCE, interviewData);
  },

  /**
   * Update an interview
   * @param {string|number} id - The interview ID
   * @param {Object} interviewData - The updated interview data
   * @returns {Promise} - Promise with response data
   */
  updateInterview(id, interviewData) {
    return apiClient.put(`${RESOURCE}/${id}`, interviewData);
  },

  /**
   * Delete an interview
   * @param {string|number} id - The interview ID
   * @returns {Promise} - Promise with response data
   */
  deleteInterview(id) {
    return apiClient.delete(`${RESOURCE}/${id}`);
  },

  /**
   * Update interview status
   * @param {string|number} id - The interview ID
   * @param {string} status - The new status
   * @returns {Promise} - Promise with response data
   */
  updateInterviewStatus(id, status) {
    return apiClient.patch(`${RESOURCE}/${id}/status`, { status });
  },

  /**
   * Search interviews
   * @param {Object} params - Search parameters
   * @returns {Promise} - Promise with response data
   */
  searchInterviews(params) {
    return apiClient.get(RESOURCE, { params });
  },

  /**
   * Get interviews by date range
   * @param {Date} startDate - The start date
   * @param {Date} endDate - The end date
   * @returns {Promise} - Promise with response data
   */
  getInterviewsByDateRange(startDate, endDate) {
    return apiClient.get(`${RESOURCE}/range`, {
      params: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }
    });
  },

  /**
   * Get upcoming interviews
   * @returns {Promise} - Promise with response data
   */
  getUpcomingInterviews() {
    return apiClient.get(`${RESOURCE}/upcoming`);
  },

  /**
   * Get interviews by candidate
   * @param {string|number} candidateId - The candidate ID
   * @returns {Promise} - Promise with response data
   */
  getInterviewsByCandidate(candidateId) {
    return apiClient.get(`${RESOURCE}/candidate/${candidateId}`);
  },

  /**
   * Get interviews by job
   * @param {string|number} jobId - The job ID
   * @returns {Promise} - Promise with response data
   */
  getInterviewsByJob(jobId) {
    return apiClient.get(`${RESOURCE}/job/${jobId}`);
  },

  /**
   * Add feedback to interview
   * @param {string|number} id - The interview ID
   * @param {Object} feedbackData - The feedback data
   * @returns {Promise} - Promise with response data
   */
  addInterviewFeedback(id, feedbackData) {
    return apiClient.post(`${RESOURCE}/${id}/feedback`, feedbackData);
  },

  /**
   * Get interview feedback
   * @param {string|number} id - The interview ID
   * @returns {Promise} - Promise with response data
   */
  getInterviewFeedback(id) {
    return apiClient.get(`${RESOURCE}/${id}/feedback`);
  }
}; 