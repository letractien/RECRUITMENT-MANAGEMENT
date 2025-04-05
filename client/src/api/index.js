import apiClient from './apiClient';
import candidatesService from './candidates.service';
import jobsService from './jobs.service';
import interviewsService from './interviews.service';
import dashboardService from './dashboard.service';

// Determine whether to use mock API based on environment variable
const useMockApi = true; // Set to true to use mock API

// Export API services
export {
  apiClient,
  candidatesService,
  jobsService,
  interviewsService,
  dashboardService
};

// Export combined API service
export default {
  apiClient,
  candidatesService,
  jobsService,
  interviewsService,
  dashboardService
}; 