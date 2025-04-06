import apiClient from '../../../core/api/apiClient';

const RESOURCE = '/interviews';

// Mock data for development
const MOCK_INTERVIEWS = [
  {
    id: '12345',
    candidate_id: 'candidate-1',
    candidate_name: 'John Doe',
    job_id: 'job-1',
    job_title: 'Frontend Developer',
    type: 'phone',
    interviewer_id: 'interviewer-1',
    interviewer_name: 'Sarah Johnson',
    status: 'scheduled',
    scheduled_date: new Date().toISOString(),
    duration_minutes: 60,
    location: 'Video call',
    description: 'Initial screening interview',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '12346',
    candidate_id: 'candidate-2',
    candidate_name: 'Jane Smith',
    job_id: 'job-2',
    job_title: 'Backend Developer',
    type: 'technical',
    interviewer_id: 'interviewer-2',
    interviewer_name: 'Michael Brown',
    status: 'scheduled',
    scheduled_date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 90,
    location: 'Office',
    description: 'Technical assessment',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '12347',
    candidate_id: 'candidate-3',
    candidate_name: 'Robert Johnson',
    job_id: 'job-3',
    job_title: 'UX Designer',
    type: 'hr',
    interviewer_id: 'interviewer-3',
    interviewer_name: 'Emily Jones',
    status: 'scheduled',
    scheduled_date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 60,
    location: 'Video call',
    description: 'HR interview',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Flag to use mock data instead of API calls
const USE_MOCK_DATA = false;

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

export default {
  /**
   * Get all interviews
   * @returns {Promise} - Promise with transformed response data
   */
  getAllInterviews() {
    if (USE_MOCK_DATA) {
      console.log("Using mock interviews data");
      return Promise.resolve({
        data: transformInterviewsData(MOCK_INTERVIEWS)
      });
    }
    
    return apiClient.get(RESOURCE)
      .then(response => {
        return {
          ...response,
          data: transformInterviewsData(response.data)
        };
      })
      .catch(error => {
        console.error("Error fetching interviews:", error);
        console.log("Falling back to mock data");
        return {
          data: transformInterviewsData(MOCK_INTERVIEWS)
        };
      });
  },

  /**
   * Get a specific interview by ID
   * @param {string|number} id - The interview ID
   * @returns {Promise} - Promise with transformed response data
   */
  getInterview(id) {
    if (USE_MOCK_DATA) {
      const mockInterview = MOCK_INTERVIEWS.find(i => i.id === id);
      if (mockInterview) {
        return Promise.resolve({
          data: transformInterviewData(mockInterview)
        });
      }
    }
    
    return apiClient.get(`${RESOURCE}/${id}`)
      .then(response => {
        return {
          ...response,
          data: transformInterviewData(response.data)
        };
      })
      .catch(error => {
        console.error(`Error fetching interview ${id}:`, error);
        const mockInterview = MOCK_INTERVIEWS.find(i => i.id === id);
        if (mockInterview) {
          console.log("Falling back to mock data");
          return {
            data: transformInterviewData(mockInterview)
          };
        }
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
    
    if (USE_MOCK_DATA) {
      // Create a new mock interview
      const newMockInterview = {
        ...backendData,
        id: String(Math.floor(Math.random() * 10000) + 20000),
        candidate_name: backendData.candidate_id === 'candidate-1' ? 'John Doe' : 
                        backendData.candidate_id === 'candidate-2' ? 'Jane Smith' : 
                        backendData.candidate_id === 'candidate-3' ? 'Robert Johnson' : 
                        'New Candidate',
        job_title: backendData.job_id === 'job-1' ? 'Frontend Developer' : 
                   backendData.job_id === 'job-2' ? 'Backend Developer' : 
                   backendData.job_id === 'job-3' ? 'UX Designer' : 
                   'New Position',
        interviewer_name: backendData.interviewer_id === 'interviewer-1' ? 'Sarah Johnson' : 
                          backendData.interviewer_id === 'interviewer-2' ? 'Michael Brown' : 
                          backendData.interviewer_id === 'interviewer-3' ? 'Emily Jones' : 
                          'New Interviewer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to mock interviews array
      MOCK_INTERVIEWS.push(newMockInterview);
      
      return Promise.resolve({
        data: transformInterviewData(newMockInterview)
      });
    }
    
    return apiClient.post(RESOURCE, backendData)
      .then(response => {
        return {
          ...response,
          data: transformInterviewData(response.data)
        };
      })
      .catch(error => {
        console.error("Error creating interview:", error);
        
        // Create a fallback mock interview on error
        const newMockInterview = {
          ...backendData,
          id: String(Math.floor(Math.random() * 10000) + 30000),
          candidate_name: 'Fallback Candidate',
          job_title: 'Fallback Position',
          interviewer_name: 'Fallback Interviewer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log("Creating fallback mock interview");
        
        return {
          data: transformInterviewData(newMockInterview)
        };
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