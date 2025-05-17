import dashboardService from './api/dashboard.service.js';

const state = {
  stats: {
    activeJobs: 0,
    newApplications: 0,
    scheduledInterviews: 0,
    positionsFilled: 0
  },
  recentActivity: [],
  recentApplications: [],
  jobsByDepartment: [],
  hiringFunnel: [],
  applicationTrend: [],
  upcomingInterviews: [],
  timeRange: 'month', // 'week', 'month', 'quarter', 'year'
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0
  }
};

const getters = {
  dashboardStats: state => state.stats,
  recentActivity: state => state.recentActivity,
  recentApplications: state => state.recentApplications,
  jobsByDepartment: state => state.jobsByDepartment,
  hiringFunnel: state => state.hiringFunnel,
  applicationTrend: state => state.applicationTrend,
  upcomingInterviews: state => state.upcomingInterviews,
  timeRange: state => state.timeRange,
  isLoading: state => state.loading,
  hasError: state => !!state.error,
  errorMessage: state => state.error,
  pagination: state => state.pagination
};

const actions = {
  async fetchDashboardData({ commit, dispatch, state }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to fetch dashboard data
      const response = await dashboardService.getDashboardData(state.timeRange);
      const dashboardData = response.data;
      
      // Update all dashboard data at once
      if (dashboardData.stats) commit('SET_DASHBOARD_STATS', dashboardData.stats);
      if (dashboardData.recentActivity) commit('SET_RECENT_ACTIVITY', dashboardData.recentActivity);
      if (dashboardData.jobsByDepartment) commit('SET_JOBS_BY_DEPARTMENT', dashboardData.jobsByDepartment);
      if (dashboardData.hiringFunnel) commit('SET_HIRING_FUNNEL', dashboardData.hiringFunnel);
      if (dashboardData.applicationTrend) commit('SET_APPLICATION_TREND', dashboardData.applicationTrend);
      
      // Fetch recent applications and upcoming interviews separately
      try {
        await Promise.all([
          dispatch('fetchRecentApplications'),
          dispatch('fetchUpcomingInterviews')
        ]);
      } catch (innerError) {
        console.warn('Failed to fetch some additional dashboard data:', innerError);
      }
      
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched dashboard data');
      return dashboardData;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch dashboard data';
      commit('SET_ERROR', errorMessage);
      console.error('Error fetching dashboard data:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async setTimeRange({ commit, dispatch }, timeRange) {
    commit('SET_TIME_RANGE', timeRange);
    console.log('Time range updated to:', timeRange);
    await dispatch('fetchDashboardData');
  },
  
  async fetchStats({ commit, state }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to fetch stats
      const response = await dashboardService.getStats(state.timeRange);
      
      commit('SET_DASHBOARD_STATS', response.data);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched dashboard stats');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch stats';
      commit('SET_ERROR', errorMessage);
      console.error('Error fetching stats:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchRecentActivity({ commit, state }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to fetch recent activity
      const response = await dashboardService.getRecentActivity();
      
      commit('SET_RECENT_ACTIVITY', response.data);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched recent activity');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch recent activity';
      commit('SET_ERROR', errorMessage);
      console.error('Error fetching recent activity:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchRecentApplications({ commit, state }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to fetch all recent applications with timeRange
      const response = await dashboardService.getRecentApplications(state.timeRange);
      
      commit('SET_RECENT_APPLICATIONS', response.data);
      // Still keep track of total count
      commit('SET_PAGINATION', {
        ...state.pagination,
        total: response.data.length || 0,
        currentPage: 1
      });
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched recent applications');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch recent applications';
      commit('SET_ERROR', errorMessage);
      console.error('Error fetching recent applications:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchJobsByDepartment({ commit, state }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to fetch jobs by department
      const response = await dashboardService.getJobsByDepartment(state.timeRange);
      
      commit('SET_JOBS_BY_DEPARTMENT', response.data);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched jobs by department');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch jobs by department';
      commit('SET_ERROR', errorMessage);
      console.error('Error fetching jobs by department:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchHiringFunnel({ commit, state }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to fetch hiring funnel
      const response = await dashboardService.getHiringFunnel(state.timeRange);
      
      commit('SET_HIRING_FUNNEL', response.data);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched hiring funnel');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch hiring funnel';
      commit('SET_ERROR', errorMessage);
      console.error('Error fetching hiring funnel:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchApplicationTrend({ commit, state }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to fetch application trend
      const response = await dashboardService.getApplicationTrend(state.timeRange);
      
      commit('SET_APPLICATION_TREND', response.data);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched application trend');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch application trend';
      commit('SET_ERROR', errorMessage);
      console.error('Error fetching application trend:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchUpcomingInterviews({ commit }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to fetch upcoming interviews
      const response = await dashboardService.getUpcomingInterviews(7, 5);
      
      commit('SET_UPCOMING_INTERVIEWS', response.data);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched upcoming interviews');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch upcoming interviews';
      commit('SET_ERROR', errorMessage);
      console.error('Error fetching upcoming interviews:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  setPage({ commit }) {
    console.log('Pagination is disabled, showing all applications');
    // No action needed
  },
  
  setPageSize({ commit }) {
    console.log('Pagination is disabled, showing all applications');
    // No action needed
  }
};

const mutations = {
  SET_DASHBOARD_STATS(state, stats) {
    state.stats = stats;
  },
  
  SET_RECENT_ACTIVITY(state, activity) {
    state.recentActivity = activity;
  },
  
  SET_RECENT_APPLICATIONS(state, applications) {
    state.recentApplications = applications;
  },
  
  SET_JOBS_BY_DEPARTMENT(state, data) {
    state.jobsByDepartment = data;
  },
  
  SET_HIRING_FUNNEL(state, data) {
    state.hiringFunnel = data;
  },
  
  SET_APPLICATION_TREND(state, data) {
    state.applicationTrend = data;
  },
  
  SET_UPCOMING_INTERVIEWS(state, interviews) {
    state.upcomingInterviews = interviews;
  },
  
  SET_TIME_RANGE(state, timeRange) {
    state.timeRange = timeRange;
  },
  
  SET_LOADING(state, isLoading) {
    state.loading = isLoading;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination };
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}; 