import apiClient from './apiClient';
import candidatesService from './candidates.service';
import jobsService from './jobs.service';
import interviewsService from './interviews.service';
import dashboardService from './dashboard.service';
import mockApiService from './mockApiService';

// Determine whether to use mock API based on environment variable
const useMockApi = true; // Changed to true to use mock API service

// Create service exports based on whether to use mock API
const candidatesServiceExport = useMockApi ? mockApiService : candidatesService;
const jobsServiceExport = useMockApi ? mockApiService : jobsService;
const interviewsServiceExport = useMockApi ? mockApiService : interviewsService;
const dashboardServiceExport = useMockApi ? mockApiService : dashboardService;

// Export API services
export {
  apiClient,
  candidatesServiceExport as candidatesService,
  jobsServiceExport as jobsService,
  interviewsServiceExport as interviewsService,
  dashboardServiceExport as dashboardService
};

// Export combined API service
export default {
  apiClient,
  candidatesService: candidatesServiceExport,
  jobsService: jobsServiceExport,
  interviewsService: interviewsServiceExport,
  dashboardService: dashboardServiceExport
}; 