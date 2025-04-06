import apiService from './apiClient';

// Get all candidates with optional filtering
export const getAllCandidates = async (params = {}) => {
  try {
    const response = await apiService.get('/candidates', { params });
    return { data: response.data };
  } catch (error) {
    console.error('Get candidates error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch candidates');
  }
};

// Get a specific candidate by ID
export const getCandidate = async (id) => {
  try {
    const response = await apiService.get(`/candidates/${id}`);
    return { data: response.data };
  } catch (error) {
    console.error(`Get candidate ${id} error:`, error);
    throw new Error(error.response?.data?.detail || `Candidate with ID ${id} not found`);
  }
};

// Create a new candidate
export const createCandidate = async (candidateData) => {
  try {
    const response = await apiService.post('/candidates', candidateData);
    return { data: response.data };
  } catch (error) {
    console.error('Create candidate error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create candidate');
  }
};

// Update an existing candidate
export const updateCandidate = async (id, candidateData) => {
  try {
    const response = await apiService.put(`/candidates/${id}`, candidateData);
    return { data: response.data };
  } catch (error) {
    console.error(`Update candidate ${id} error:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to update candidate');
  }
};

// Delete a candidate
export const deleteCandidate = async (id) => {
  try {
    await apiService.delete(`/candidates/${id}`);
    return { data: { success: true, message: 'Candidate deleted successfully' } };
  } catch (error) {
    console.error(`Delete candidate ${id} error:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to delete candidate');
  }
};

// Update a candidate's status
export const updateCandidateStatus = async (id, status) => {
  try {
    const response = await apiService.patch(`/candidates/${id}/status`, { status });
    return { data: response.data };
  } catch (error) {
    console.error(`Update candidate ${id} status error:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to update candidate status');
  }
};

// Get all interviews for a specific candidate
export const getCandidateInterviews = async (id) => {
  try {
    const response = await apiService.get(`/candidates/${id}/interviews`);
    return { data: response.data };
  } catch (error) {
    console.error(`Get candidate ${id} interviews error:`, error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch candidate interviews');
  }
}; 