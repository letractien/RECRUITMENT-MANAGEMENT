import { dashboardService } from '@/utils/api';
import { generateDashboardData } from '@/utils/mockData';

const state = {
  stats: {
    activeJobs: 0,
    newApplications: 0,
    scheduledInterviews: 0,
    positionsFilled: 0
  },
  recentActivity: [],
  jobsByDepartment: [],
  hiringFunnel: [],
  applicationTrend: [],
  timeRange: 'month', // 'week', 'month', 'quarter', 'year'
  loading: false,
  error: null
};

const getters = {
  dashboardStats: state => state.stats,
  recentActivity: state => state.recentActivity,
  jobsByDepartment: state => state.jobsByDepartment,
  hiringFunnel: state => state.hiringFunnel,
  applicationTrend: state => state.applicationTrend,
  timeRange: state => state.timeRange,
  isLoading: state => state.loading,
  hasError: state => !!state.error,
  errorMessage: state => state.error
};

const actions = {
  async fetchDashboardData({ commit, state, rootState }) {
    try {
      commit('SET_LOADING', true);
      
      // Get candidates, jobs, and interviews from state if available
      const candidates = rootState.candidates?.candidates || [];
      const jobs = rootState.jobs?.jobs || [];
      const interviews = rootState.interviews?.interviews || [];
      
      // Generate random dashboard data instead of API call
      // This simulates a successful API response
      const dashboardData = generateDashboardData(jobs, candidates, interviews);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update all dashboard data at once
      commit('SET_DASHBOARD_STATS', dashboardData.stats);
      commit('SET_RECENT_ACTIVITY', dashboardData.recentActivity);
      commit('SET_JOBS_BY_DEPARTMENT', dashboardData.jobsByDepartment);
      commit('SET_HIRING_FUNNEL', dashboardData.hiringFunnel);
      commit('SET_APPLICATION_TREND', dashboardData.applicationTrend);
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
  
  async fetchStats({ commit, state, rootState }) {
    try {
      commit('SET_LOADING', true);
      
      // Get candidates, jobs, and interviews from state if available
      const candidates = rootState.candidates?.candidates || [];
      const jobs = rootState.jobs?.jobs || [];
      const interviews = rootState.interviews?.interviews || [];
      
      // Generate only stats data
      const dashboardData = generateDashboardData(jobs, candidates, interviews);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      commit('SET_DASHBOARD_STATS', dashboardData.stats);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched dashboard stats');
      return dashboardData.stats;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to fetch stats');
      console.error('Error fetching stats:', error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchRecentActivity({ commit, rootState }) {
    try {
      commit('SET_LOADING', true);
      
      // Get candidates, jobs, and interviews from state if available
      const candidates = rootState.candidates?.candidates || [];
      const jobs = rootState.jobs?.jobs || [];
      const interviews = rootState.interviews?.interviews || [];
      
      // Generate only recent activity data
      const dashboardData = generateDashboardData(jobs, candidates, interviews);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 350));
      
      commit('SET_RECENT_ACTIVITY', dashboardData.recentActivity);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched recent activity');
      return dashboardData.recentActivity;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to fetch recent activity');
      console.error('Error fetching recent activity:', error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchJobsByDepartment({ commit, state, rootState }) {
    try {
      commit('SET_LOADING', true);
      
      // Get jobs from state if available
      const jobs = rootState.jobs?.jobs || [];
      
      // Generate only jobs by department data
      const dashboardData = generateDashboardData(jobs, [], []);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      commit('SET_JOBS_BY_DEPARTMENT', dashboardData.jobsByDepartment);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched jobs by department');
      return dashboardData.jobsByDepartment;
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
      
      // Generate random hiring funnel data
      const hiringFunnel = [
        { stage: "Applied", count: Math.floor(Math.random() * 50) + 50 },
        { stage: "Screening", count: Math.floor(Math.random() * 30) + 20 },
        { stage: "Interview", count: Math.floor(Math.random() * 15) + 10 },
        { stage: "Offer", count: Math.floor(Math.random() * 8) + 2 },
        { stage: "Hired", count: Math.floor(Math.random() * 5) + 1 }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 450));
      
      commit('SET_HIRING_FUNNEL', hiringFunnel);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched hiring funnel');
      return hiringFunnel;
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
      
      // Generate random application trend data
      const applicationTrend = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - (i * 7)); // Weekly data
        
        applicationTrend.push({
          date: date.toISOString().split('T')[0],
          applications: Math.floor(Math.random() * 20) + 10
        });
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 350));
      
      commit('SET_APPLICATION_TREND', applicationTrend);
      commit('SET_ERROR', null);
      
      console.log('Successfully fetched application trend');
      return applicationTrend;
    } catch (error) {
      commit('SET_ERROR', error.message || 'Failed to fetch application trend');
      console.error('Error fetching application trend:', error);
      return null;
    } finally {
      commit('SET_LOADING', false);
    }
  }
};

const mutations = {
  SET_DASHBOARD_STATS(state, stats) {
    state.stats = stats;
  },
  
  SET_RECENT_ACTIVITY(state, activity) {
    state.recentActivity = activity;
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
  
  SET_TIME_RANGE(state, timeRange) {
    state.timeRange = timeRange;
  },
  
  SET_LOADING(state, isLoading) {
    state.loading = isLoading;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}; 