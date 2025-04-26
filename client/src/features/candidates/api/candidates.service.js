import apiClient from '../../../core/api/apiClient';

const RESOURCE = '/candidates';

export default {
  /**
   * Get all candidates
   * @returns {Promise} - Promise with response data
   */
  getAllCandidates() {
    return apiClient.get(RESOURCE);
  },

  /**
   * Get a specific candidate by ID
   * @param {string|number} id - The candidate ID
   * @returns {Promise} - Promise with response data
   */
  getCandidate(id) {
    return apiClient.get(`${RESOURCE}/${id}`);
  },

  /**
   * Create a new candidate
   * @param {Object} candidateData - The candidate data
   * @returns {Promise} - Promise with response data
   */
  createCandidate(candidateData) {
    return apiClient.post(RESOURCE, candidateData);
  },

  /**
   * Update a candidate
   * @param {string|number} id - The candidate ID
   * @param {Object} candidateData - The updated candidate data
   * @returns {Promise} - Promise with response data
   */
  updateCandidate(id, candidateData) {
    return apiClient.put(`${RESOURCE}/${id}`, candidateData);
  },

  /**
   * Delete a candidate
   * @param {string|number} id - The candidate ID
   * @returns {Promise} - Promise with response data
   */
  deleteCandidate(id) {
    return apiClient.delete(`${RESOURCE}/${id}`);
  },

  /**
   * Update candidate status
   * @param {string|number} id - The candidate ID
   * @param {string} status - The new status
   * @returns {Promise} - Promise with response data
   */
  updateCandidateStatus(id, status) {
    return apiClient.patch(`/candidates/${id}/status?status=${status}`);
  },

  /**
   * Search candidates
   * @param {Object} params - Search parameters
   * @returns {Promise} - Promise with response data
   */
  searchCandidates(params) {
    return apiClient.get(RESOURCE, { params });
  },

  /**
   * Upload candidate resume
   * @param {string|number} id - The candidate ID
   * @param {FormData} formData - The form data with resume file
   * @returns {Promise} - Promise with response data
   */
  uploadResume(id, formData) {
    return apiClient.post(`${RESOURCE}/${id}/resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  /**
   * Create a new interview
   * @param {Object} interviewData - The interview data
   * @returns {Promise} - Promise with response data
   */
  scheduleInterview(interviewData) {
    console.log("interviewData", interviewData);
    return apiClient.post(`${RESOURCE}/interviews`, interviewData);
  },
  /**
   * Get candidate interviews
   * @param {string|number} id - The candidate ID
   * @returns {Promise} - Promise with response data
   */
  getCandidateInterviews(id) {
    return apiClient.get(`${RESOURCE}/${id}/interviews`);
  },

  /**
   * Add note to candidate
   * @param {string|number} id - The candidate ID
   * @param {Object} noteData - The note data
   * @returns {Promise} - Promise with response data
   */
  addCandidateNote(id, noteData) {
    return apiClient.post(`${RESOURCE}/${id}/notes`, noteData);
  },

  /**
   * Get candidate notes
   * @param {string|number} id - The candidate ID
   * @returns {Promise} - Promise with response data
   */
  getCandidateNotes(id) {
    return apiClient.get(`${RESOURCE}/${id}/notes`);
  }
}; 