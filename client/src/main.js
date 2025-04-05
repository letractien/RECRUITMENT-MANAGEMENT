import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import store from './store'

// Import Ant Design Vue
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

// Create app instance
const app = createApp(App)

// Set app configuration from environment variables
app.config.globalProperties.$appConfig = {
  title: import.meta.env.VUE_APP_TITLE || 'Recruitment Management',
  apiUrl: import.meta.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  enableDarkMode: import.meta.env.VUE_APP_ENABLE_DARK_MODE === 'true',
  enableNotifications: import.meta.env.VUE_APP_ENABLE_NOTIFICATIONS === 'true'
}

// Register plugins
app.use(createPinia())
app.use(router)
app.use(store)
app.use(Antd)

// Mount app
app.mount('#app') 