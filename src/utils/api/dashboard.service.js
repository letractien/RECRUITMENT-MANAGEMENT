import apiClient from './apiClient';

const RESOURCE = '/dashboard';

export default {
  /**
   * Get all dashboard data
   * @param {string} timeRange - Time range for the data (week, month, quarter, year)
   * @returns {Promise} - Promise with response data
   */
  getDashboardData(timeRange = 'month') {
    return apiClient.get(RESOURCE, { params: { timeRange } });
  },

  /**
   * Get dashboard statistics
   * @param {string} timeRange - Time range for the stats (week, month, quarter, year)
   * @returns {Promise} - Promise with response data
   */
  getStats(timeRange = 'month') {
    return apiClient.get(`${RESOURCE}/stats`, { params: { timeRange } });
  },

  /**
   * Get recent activity
   * @param {number} limit - Number of activities to return
   * @returns {Promise} - Promise with response data
   */
  getRecentActivity(limit = 10) {
    return apiClient.get(`${RESOURCE}/activity`, { params: { limit } });
  },

  /**
   * Get jobs by department data
   * @param {string} timeRange - Time range for the data (week, month, quarter, year)
   * @returns {Promise} - Promise with response data
   */
  getJobsByDepartment(timeRange = 'month') {
    return apiClient.get(`${RESOURCE}/jobs-by-department`, { params: { timeRange } });
  },

  /**
   * Get hiring funnel data
   * @param {string} timeRange - Time range for the data (week, month, quarter, year)
   * @returns {Promise} - Promise with response data
   */
  getHiringFunnel(timeRange = 'month') {
    return apiClient.get(`${RESOURCE}/hiring-funnel`, { params: { timeRange } });
  },

  /**
   * Get application trend data
   * @param {string} timeRange - Time range for the data (week, month, quarter, year)
   * @returns {Promise} - Promise with response data
   */
  getApplicationTrend(timeRange = 'month') {
    return apiClient.get(`${RESOURCE}/application-trend`, { params: { timeRange } });
  },

  /**
   * Get top performing departments
   * @param {string} timeRange - Time range for the data (week, month, quarter, year)
   * @param {number} limit - Number of departments to return
   * @returns {Promise} - Promise with response data
   */
  getTopPerformingDepartments(timeRange = 'month', limit = 5) {
    return apiClient.get(`${RESOURCE}/top-departments`, { 
      params: { timeRange, limit } 
    });
  },

  /**
   * Get time-to-hire metrics
   * @param {string} timeRange - Time range for the data (week, month, quarter, year)
   * @returns {Promise} - Promise with response data
   */
  getTimeToHireMetrics(timeRange = 'month') {
    return apiClient.get(`${RESOURCE}/time-to-hire`, { params: { timeRange } });
  },

  /**
   * Get upcoming interviews
   * @param {number} days - Number of days to look ahead
   * @param {number} limit - Maximum number of interviews to return
   * @returns {Promise} - Promise with response data
   */
  getUpcomingInterviews(days = 7, limit = 5) {
    return apiClient.get(`${RESOURCE}/upcoming-interviews`, {
      params: { days, limit }
    });
  }
}; 