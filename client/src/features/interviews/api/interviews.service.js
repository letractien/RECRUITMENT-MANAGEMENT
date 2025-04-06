import apiClient from '../../../core/api/apiClient';

const RESOURCE = '/interviews';

// Transform backend interview data to frontend format
const transformInterviewData = (interview) => {
  if (!interview) return null;
  
  return {
    id: interview.id,
    candidateId: interview.candidate_id,
    candidateName: interview.candidate_name || 'Unnamed Candidate',
    jobId: interview.job_id,
    jobTitle: interview.job_title || 'Unnamed Position',
    interviewType: mapInterviewType(interview.type),
    interviewerId: interview.interviewer_id,
    interviewer: interview.interviewer_name || 'Unnamed Interviewer',
    status: interview.status,
    scheduledAt: interview.scheduled_date,
    duration: interview.duration_minutes,
    location: interview.location || null,
    meetingLink: interview.meeting_link || null,
    description: interview.description || '',
    result: interview.result ? {
      rating: interview.result.rating,
      feedback: interview.result.feedback,
      strengths: interview.result.strengths || [],
      weaknesses: interview.result.weaknesses || [],
      recommendedNextSteps: interview.result.recommended_next_steps || null,
      hiringRecommendation: interview.result.hiring_recommendation
    } : null,
    createdAt: interview.created_at,
    updatedAt: interview.updated_at
  };
};

// Map backend interview type to frontend format
const mapInterviewType = (type) => {
  const typeMap = {
    'phone': 'Phone Screen',
    'video': 'Video',
    'onsite': 'Onsite',
    'technical': 'Technical',
    'hr': 'HR'
  };
  
  return typeMap[type] || type;
};

// Reverse map function to convert frontend type to backend
const reverseMapInterviewType = (frontendType) => {
  const reverseTypeMap = {
    'Phone Screen': 'phone',
    'Video': 'video',
    'Onsite': 'onsite',
    'Technical': 'technical',
    'HR': 'hr'
  };
  
  return reverseTypeMap[frontendType] || frontendType.toLowerCase();
};

// Transform an array of interview data
const transformInterviewsData = (interviews) => {
  if (!interviews || !Array.isArray(interviews)) return [];
  return interviews.map(transformInterviewData);
};

// Transform interviews data for calendar view
const transformInterviewsForCalendar = (interviews) => {
  if (!interviews || !Array.isArray(interviews)) return [];
  
  return interviews.map(interview => ({
    id: interview.id,
    title: `${interview.candidate_name} - ${interview.job_title}`,
    start: new Date(interview.scheduled_date),
    end: new Date(new Date(interview.scheduled_date).getTime() + interview.duration_minutes * 60000),
    allDay: false,
    type: interview.type,
    status: interview.status,
    interviewerId: interview.interviewer_id,
    interviewer: interview.interviewer_name,
    candidateId: interview.candidate_id,
    candidateName: interview.candidate_name,
    jobId: interview.job_id,
    jobTitle: interview.job_title,
    location: interview.location,
    meetingLink: interview.meeting_link
  }));
};

export default {
  /**
   * Get all interviews
   * @returns {Promise} - Promise with transformed response data
   */
  getAllInterviews() {
    return apiClient.get(RESOURCE)
      .then(response => {
        return {
          ...response,
          data: transformInterviewsData(response.data)
        };
      })
      .catch(error => {
        console.error("Error fetching interviews:", error);
        throw error;
      });
  },

  /**
   * Get interviews formatted for calendar view
   * @param {Object} params - Optional filter parameters (status, interviewer_id, etc.)
   * @returns {Promise} - Promise with transformed data for calendar
   */
  getInterviewsForCalendar(params = {}) {
    return apiClient.get(RESOURCE, { params })
      .then(response => {
        return {
          ...response,
          data: transformInterviewsForCalendar(response.data)
        };
      })
      .catch(error => {
        console.error("Error fetching interviews for calendar:", error);
        throw error;
      });
  },

  /**
   * Get a specific interview by ID
   * @param {string|number} id - The interview ID
   * @returns {Promise} - Promise with transformed response data
   */
  getInterview(id) {
    return apiClient.get(`${RESOURCE}/${id}`)
      .then(response => {
        return {
          ...response,
          data: transformInterviewData(response.data)
        };
      })
      .catch(error => {
        console.error(`Error fetching interview ${id}:`, error);
        throw error;
      });
  },

  /**
   * Create a new interview
   * @param {Object} interviewData - The interview data
   * @returns {Promise} - Promise with transformed response data
   */
  createInterview(interviewData) {
    // Transform frontend data to backend format
    const backendData = {
      candidate_id: interviewData.candidateId,
      job_id: interviewData.jobId,
      interviewer_id: interviewData.interviewerId,
      scheduled_date: interviewData.scheduledAt,
      duration_minutes: interviewData.duration || 60,
      status: interviewData.status || 'scheduled',
      type: reverseMapInterviewType(interviewData.interviewType),
      description: interviewData.description || '',
      location: interviewData.location || null,
      meeting_link: interviewData.meetingLink || null
    };
    
    return apiClient.post(RESOURCE, backendData)
      .then(response => {
        return {
          ...response,
          data: transformInterviewData(response.data)
        };
      })
      .catch(error => {
        console.error("Error creating interview:", error);
        throw error;
      });
  },

  /**
   * Update an interview
   * @param {string|number} id - The interview ID
   * @param {Object} interviewData - The updated interview data
   * @returns {Promise} - Promise with transformed response data
   */
  updateInterview(id, interviewData) {
    // Transform frontend data to backend format
    const backendData = {};
    
    if (interviewData.candidateId) backendData.candidate_id = interviewData.candidateId;
    if (interviewData.jobId) backendData.job_id = interviewData.jobId;
    if (interviewData.interviewerId) backendData.interviewer_id = interviewData.interviewerId;
    if (interviewData.scheduledAt) backendData.scheduled_date = interviewData.scheduledAt;
    if (interviewData.duration) backendData.duration_minutes = interviewData.duration;
    if (interviewData.status) backendData.status = interviewData.status;
    if (interviewData.interviewType) backendData.type = reverseMapInterviewType(interviewData.interviewType);
    if (interviewData.description) backendData.description = interviewData.description;
    if (interviewData.location) backendData.location = interviewData.location;
    if (interviewData.meetingLink) backendData.meeting_link = interviewData.meetingLink;
    
    return apiClient.put(`${RESOURCE}/${id}`, backendData)
      .then(response => {
        return {
          ...response,
          data: transformInterviewData(response.data)
        };
      });
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
   * @returns {Promise} - Promise with transformed response data
   */
  updateInterviewStatus(id, status) {
    return apiClient.patch(`${RESOURCE}/${id}/status`, { status })
      .then(response => {
        return {
          ...response,
          data: transformInterviewData(response.data)
        };
      });
  },

  /**
   * Search interviews
   * @param {Object} params - Search parameters
   * @returns {Promise} - Promise with transformed response data
   */
  searchInterviews(params) {
    return apiClient.get(RESOURCE, { params })
      .then(response => {
        return {
          ...response,
          data: transformInterviewsData(response.data)
        };
      });
  },

  /**
   * Get interviews by date range
   * @param {Date} startDate - The start date
   * @param {Date} endDate - The end date
   * @returns {Promise} - Promise with transformed response data
   */
  getInterviewsByDateRange(startDate, endDate) {
    return apiClient.get(`${RESOURCE}/range`, {
      params: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }
    }).then(response => {
      return {
        ...response,
        data: transformInterviewsData(response.data)
      };
    });
  },

  /**
   * Get upcoming interviews
   * @returns {Promise} - Promise with transformed response data
   */
  getUpcomingInterviews() {
    return apiClient.get(`${RESOURCE}/upcoming`)
      .then(response => {
        return {
          ...response,
          data: transformInterviewsData(response.data)
        };
      });
  },

  /**
   * Get interviews by candidate
   * @param {string|number} candidateId - The candidate ID
   * @returns {Promise} - Promise with transformed response data
   */
  getInterviewsByCandidate(candidateId) {
    return apiClient.get(`${RESOURCE}/candidate/${candidateId}`)
      .then(response => {
        return {
          ...response,
          data: transformInterviewsData(response.data)
        };
      });
  },

  /**
   * Get interviews by job
   * @param {string|number} jobId - The job ID
   * @returns {Promise} - Promise with transformed response data
   */
  getInterviewsByJob(jobId) {
    return apiClient.get(`${RESOURCE}/job/${jobId}`)
      .then(response => {
        return {
          ...response,
          data: transformInterviewsData(response.data)
        };
      });
  },

  /**
   * Add feedback to interview
   * @param {string|number} id - The interview ID
   * @param {Object} feedbackData - The feedback data
   * @returns {Promise} - Promise with transformed response data
   */
  addInterviewFeedback(id, feedbackData) {
    const backendData = {
      rating: feedbackData.rating,
      feedback: feedbackData.feedback,
      strengths: feedbackData.strengths || [],
      weaknesses: feedbackData.weaknesses || [],
      recommended_next_steps: feedbackData.recommendedNextSteps || null,
      hiring_recommendation: feedbackData.hiringRecommendation
    };

    return apiClient.post(`${RESOURCE}/${id}/result`, backendData)
      .then(response => {
        return {
          ...response,
          data: transformInterviewData(response.data)
        };
      });
  }
};