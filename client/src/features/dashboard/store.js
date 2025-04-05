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
      commit('SET_DASHBOARD_STATS', dashboardData.stats);
      commit('SET_RECENT_ACTIVITY', dashboardData.recentActivity);
      commit('SET_JOBS_BY_DEPARTMENT', dashboardData.jobsByDepartment);
      commit('SET_HIRING_FUNNEL', dashboardData.hiringFunnel);
      commit('SET_APPLICATION_TREND', dashboardData.applicationTrend);
      
      // Fetch recent applications and upcoming interviews separately
      await Promise.all([
        dispatch('fetchRecentApplications'),
        dispatch('fetchUpcomingInterviews')
      ]);
      
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched dashboard data');
      return dashboardData;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', error);
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
      commit('SET_ERROR', error.message || 'Failed to fetch stats');
      console.error('Error fetching stats:', error);
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
      commit('SET_ERROR', error.message || 'Failed to fetch recent activity');
      console.error('Error fetching recent activity:', error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchRecentApplications({ commit, state }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to fetch recent applications
      const response = await dashboardService.getRecentApplications(
        10, // limit
        state.pagination.currentPage,
        state.pagination.pageSize
      );
      
      commit('SET_RECENT_APPLICATIONS', response.data.applications);
      commit('SET_PAGINATION', {
        ...state.pagination,
        total: response.data.total
      });
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched recent applications');
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to fetch recent applications');
      console.error('Error fetching recent applications:', error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchJobsByDepartment({ commit, state }) {
    try {
      commit('SET_LOADING', true);
      
      // Use API service to fetch jobs by department
      const response = await dashboardService.getJobsByDepartmentStats(state.timeRange);
      
      commit('SET_JOBS_BY_DEPARTMENT', response.data);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched jobs by department');
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to fetch jobs by department');
      console.error('Error fetching jobs by department:', error);
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
      commit('SET_ERROR', error.message || 'Failed to fetch hiring funnel');
      console.error('Error fetching hiring funnel:', error);
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
      commit('SET_ERROR', error.message || 'Failed to fetch application trend');
      console.error('Error fetching application trend:', error);
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
      commit('SET_ERROR', error.message || 'Failed to fetch upcoming interviews');
      console.error('Error fetching upcoming interviews:', error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  setPage({ commit, dispatch }, page) {
    commit('SET_PAGINATION', { ...state.pagination, currentPage: page });
    dispatch('fetchRecentApplications');
  },
  
  setPageSize({ commit, dispatch }, pageSize) {
    commit('SET_PAGINATION', { 
      ...state.pagination, 
      pageSize,
      currentPage: 1 // Reset to first page when changing page size
    });
    dispatch('fetchRecentApplications');
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