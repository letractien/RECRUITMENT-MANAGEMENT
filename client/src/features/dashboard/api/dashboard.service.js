import apiClient from '../../../core/api/apiClient';

const RESOURCE = '/dashboard';

export default {
  /**
   * Get all dashboard data
   * @param {string} timeRange - Time range for the data (week, month, quarter, year)
   * @returns {Promise} - Promise with response data
   */
  async getDashboardData(timeRange = 'month') {
    // Fetch all required dashboard data in parallel
    const [
      stats,
      recentActivity,
      jobsByDepartment,
      hiringFunnel,
      applicationTrend
    ] = await Promise.all([
      this.getStats(timeRange),
      this.getRecentActivity(),
      this.getJobsByDepartment(timeRange),
      this.getHiringFunnel(timeRange),
      this.getApplicationTrend(timeRange)
    ]);

    // Combine all data into one object
    return {
      data: {
        stats: stats.data,
        recentActivity: recentActivity.data,
        jobsByDepartment: jobsByDepartment.data,
        hiringFunnel: hiringFunnel.data,
        applicationTrend: applicationTrend.data
      }
    };
  },

  /**
   * Get dashboard statistics
   * @param {string} timeRange - Time range for the stats (week, month, quarter, year)
   * @returns {Promise} - Promise with response data
   */
  getStats(timeRange = 'month') {
    return apiClient.get(`${RESOURCE}/stats`, { params: { time_range: timeRange } });
  },

  /**
   * Get jobs by department data
   * @param {string} timeRange - Time range for the data (week, month, quarter, year)
   * @returns {Promise} - Promise with response data
   */
  getJobsByDepartment(timeRange = 'month') {
    return apiClient.get(`${RESOURCE}/jobs-by-department`, { params: { time_range: timeRange } });
  },

  /**
   * Get hiring funnel data
   * @param {string} timeRange - Time range for the data (week, month, quarter, year)
   * @returns {Promise} - Promise with response data
   */
  getHiringFunnel(timeRange = 'month') {
    return apiClient.get(`${RESOURCE}/hiring-funnel`, { params: { time_range: timeRange } });
  },

  /**
   * Get recent applications
   * @param {string} timeRange - Time range for the data (week, month, quarter, year)
   * @returns {Promise} - Promise with response data
   */
  getRecentApplications(timeRange = 'month') {
    return apiClient.get(`${RESOURCE}/recent-applications`, { 
      params: { time_range: timeRange } 
    });
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
  },

  /**
   * Get recent activity
   * @param {number} limit - Number of activities to return
   * @returns {Promise} - Promise with response data
   */
  getRecentActivity(limit = 10) {
    return apiClient.get(`${RESOURCE}/recent-activity`, { params: { limit } });
  },

  /**
   * Get application trend data
   * @param {string} timeRange - Time range for the data (week, month, quarter, year)
   * @returns {Promise} - Promise with response data
   */
  getApplicationTrend(timeRange = 'month') {
    return apiClient.get(`${RESOURCE}/application-trend`, { params: { time_range: timeRange } });
  },

  
}; 