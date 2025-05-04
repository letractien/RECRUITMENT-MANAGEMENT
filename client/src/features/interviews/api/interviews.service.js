import apiClient from '../../../core/api/apiClient';

const RESOURCE = '/interviews';

export default {
  /**
   * Get all interviews
   * @param {Object} params - Optional query parameters
   * @returns {Promise} - Promise with response data
   */
  getAllInterviews(params = {}) {
    return apiClient.get(RESOURCE, { params });
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
    console.log("interviewData", interviewData);
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
   * Add result to an interview
   * @param {string|number} id - The interview ID
   * @param {Object} resultData - The result data
   * @returns {Promise} - Promise with response data
   */
  addInterviewResult(id, resultData) {
    return apiClient.post(`${RESOURCE}/${id}/result`, resultData);
  },

  /**
   * Get upcoming interviews
   * @param {number} days - Number of days to look ahead
   * @param {number} limit - Maximum number of interviews to return
   * @returns {Promise} - Promise with response data
   */
  getUpcomingInterviews(days = 7, limit = 5) {
    return apiClient.get(`${RESOURCE}/upcoming`, {
      params: { days, limit }
    });
  },
  
  /**
   * Get today's interviews
   * @returns {Promise} - Promise with response data
   */
  getTodayInterviews() {
    return apiClient.get(`${RESOURCE}/today`);
  },

  /**
   * Get interviews by date range
   * @param {string} startDate - The start date in YYYY-MM-DD format
   * @param {string} endDate - The end date in YYYY-MM-DD format
   * @returns {Promise} - Promise with response data
   */
  getInterviewsByDate(startDate, endDate) {
    return apiClient.get(`${RESOURCE}/by-date-range/${startDate}/${endDate}`);
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
   * Get interviews statistics
   * @param {string} timeRange - Time range for the statistics (week, month, quarter, year)
   * @returns {Promise} - Promise with response data
   */
  getInterviewsStatistics(timeRange = 'month') {
    return apiClient.get(`${RESOURCE}/statistics`, { 
      params: { time_range: timeRange } 
    });
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
   * Reschedule an interview
   * @param {string|number} id - The interview ID
   * @param {Object} scheduleData - The new schedule data
   * @returns {Promise} - Promise with response data
   */
  rescheduleInterview(id, scheduleData) {
    return apiClient.patch(`${RESOURCE}/${id}/reschedule`, scheduleData);
  },

  /**
   * Cancel an interview
   * @param {string|number} id - The interview ID
   * @param {Object} cancelData - The cancellation data
   * @returns {Promise} - Promise with response data
   */
  cancelInterview(id, cancelData = {}) {
    return apiClient.patch(`${RESOURCE}/${id}/cancel`, cancelData);
  },

  /**
   * Add notes to an interview
   * @param {string|number} id - The interview ID
   * @param {Object} noteData - The note data
   * @returns {Promise} - Promise with response data
   */
  addInterviewNote(id, noteData) {
    return apiClient.post(`${RESOURCE}/${id}/notes`, noteData);
  },

  /**
   * Get interview notes
   * @param {string|number} id - The interview ID
   * @returns {Promise} - Promise with response data
   */
  getInterviewNotes(id) {
    return apiClient.get(`${RESOURCE}/${id}/notes`);
  }
};
