import { createStore } from 'vuex';
import candidates from './modules/candidates';
import jobs from './modules/jobs';
import interviews from './modules/interviews';
import dashboard from './modules/dashboard';

export default createStore({
  state: {
    appName: 'Recruitment Management',
    user: null,
    loading: false,
    error: null,
    darkMode: localStorage.getItem('darkMode') === 'true',
    notifications: []
  },
  
  getters: {
    isAuthenticated: state => !!state.user,
    currentUser: state => state.user,
    isLoading: state => state.loading,
    hasError: state => !!state.error,
    errorMessage: state => state.error,
    isDarkMode: state => state.darkMode,
    notifications: state => state.notifications
  },
  
  actions: {
    setUser({ commit }, user) {
      commit('SET_USER', user);
    },
    
    logOut({ commit }) {
      // Clear user data
      commit('SET_USER', null);
      
      // Clear any stored token
      localStorage.removeItem('token');
    },
    
    toggleDarkMode({ commit, state }) {
      const newMode = !state.darkMode;
      localStorage.setItem('darkMode', newMode);
      commit('SET_DARK_MODE', newMode);
    },
    
    addNotification({ commit }, notification) {
      // Generate a unique ID for the notification
      const id = Date.now() + Math.random().toString(36).substr(2, 5);
      const newNotification = {
        id,
        ...notification,
        time: new Date()
      };
      
      commit('ADD_NOTIFICATION', newNotification);
      
      // Automatically remove notification after timeout
      if (!notification.persistent) {
        setTimeout(() => {
          commit('REMOVE_NOTIFICATION', id);
        }, notification.timeout || 5000);
      }
      
      return id;
    },
    
    removeNotification({ commit }, id) {
      commit('REMOVE_NOTIFICATION', id);
    },
    
    clearNotifications({ commit }) {
      commit('CLEAR_NOTIFICATIONS');
    }
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    
    SET_ERROR(state, error) {
      state.error = error;
    },
    
    SET_DARK_MODE(state, isDarkMode) {
      state.darkMode = isDarkMode;
      
      // Update body class for global styling
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    },
    
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push(notification);
    },
    
    REMOVE_NOTIFICATION(state, id) {
      state.notifications = state.notifications.filter(n => n.id !== id);
    },
    
    CLEAR_NOTIFICATIONS(state) {
      state.notifications = [];
    }
  },
  
  modules: {
    candidates,
    jobs,
    interviews,
    dashboard
  }
}); 