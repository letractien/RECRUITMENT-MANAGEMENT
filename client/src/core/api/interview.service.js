import apiService from './apiClient';

// Get all interviews with optional filtering
export const getAllInterviews = async (params = {}) => {
  try {
    const response = await apiService.get('/interviews', { params });
    return { data: response.data };
  } catch (error) {
    console.error('Get interviews error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch interviews');
  }
};

// Get a specific interview by ID
export const getInterview = async (id) => {
  try {
    const response = await apiService.get(`/interviews/${id}`);
    return { data: response.data };
  } catch (error) {
    console.error(`Get interview ${id} error:`, error);
    throw new Error(error.response?.data?.detail || `Interview with ID ${id} not found`);
  }
};

// Create a new interview
export const createInterview = async (interviewData) => {
  try {
    const response = await apiService.post('/interviews', interviewData);
    console.log("response", response);
    return { data: response.data };
  } catch (error) {
    console.error('Create interview error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create interview');
  }
};

// Update an existing interview
export const updateInterview = async (id, interviewData) => {
  try {
    const response = await apiService.put(`/interviews/${id}`, interviewData);
    return { data: response.data };
  } catch (error) {
    console.error(`Update interview ${id} error:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to update interview');
  }
};

// Delete an interview
export const deleteInterview = async (id) => {
  try {
    await apiService.delete(`/interviews/${id}`);
    return { data: { success: true, message: 'Interview deleted successfully' } };
  } catch (error) {
    console.error(`Delete interview ${id} error:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to delete interview');
  }
};

// Update an interview's status
export const updateInterviewStatus = async (id, status) => {
  try {
    const response = await apiService.patch(`/interviews/${id}/status`, { status });
    return { data: response.data };
  } catch (error) {
    console.error(`Update interview ${id} status error:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to update interview status');
  }
};

// Add result to an interview
export const addInterviewResult = async (id, resultData) => {
  try {
    const response = await apiService.post(`/interviews/${id}/result`, resultData);
    return { data: response.data };
  } catch (error) {
    console.error(`Add result to interview ${id} error:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to add interview result');
  }
};

// Get upcoming interviews
export const getUpcomingInterviews = async () => {
  try {
    const now = new Date().toISOString();
    const response = await apiService.get('/interviews', { 
      params: { 
        status: 'scheduled',
        // In a real API, we would have a parameter for filtering by date
        // scheduled_after: now
      } 
    });
    
    // Filter on client side since our API doesn't support date filtering yet
    const upcomingInterviews = response.data.filter(interview => 
      new Date(interview.scheduled_date) > new Date() && 
      interview.status === 'scheduled'
    );
    
    return { data: upcomingInterviews };
  } catch (error) {
    console.error('Get upcoming interviews error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch upcoming interviews');
  }
}; 