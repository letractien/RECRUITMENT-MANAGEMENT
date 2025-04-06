import { createStore } from 'vuex';

// Dynamically import feature modules
const featureModules = {};
const globModules = import.meta.glob('../features/*/store.js', { eager: true });

for (const path in globModules) {
  const moduleName = path.match(/\.\.\/features\/(.*?)\/store\.js$/)[1];
  if (moduleName && globModules[path].default) {
    featureModules[moduleName] = globModules[path].default;
  }
}

export default createStore({
  state: {
    appName: 'Recruitment Management',
    loading: false,
    error: null,
    darkMode: localStorage.getItem('darkMode') === 'true',
    notifications: []
  },
  
  getters: {
    isLoading: state => state.loading,
    hasError: state => !!state.error,
    errorMessage: state => state.error,
    isDarkMode: state => state.darkMode,
    notifications: state => state.notifications
  },
  
  actions: {
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
    // Register dynamically loaded modules
    ...featureModules
  }
}); 