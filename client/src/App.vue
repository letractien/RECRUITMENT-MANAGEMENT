<template>
  <div class="app" :class="appTheme">
    <a-layout class="layout">
      <!-- Header - Moved to top level -->
      <a-layout-header class="header">
        <div class="header-left">
          <a-button 
            class="toggle-btn" 
            type="text"
            @click="sidebarCollapsed = !sidebarCollapsed"
          >
            <menu-fold-outlined v-if="sidebarCollapsed" />
            <menu-unfold-outlined v-else />
          </a-button>
          <a-breadcrumb>
            <a-breadcrumb-item>Home</a-breadcrumb-item>
            <a-breadcrumb-item>{{ currentPage }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <div class="header-right">
          <a-dropdown>
            <template #overlay>
              <a-menu>
                <a-menu-item key="2" @click="toggleTheme">
                  <template #icon>
                    <bulb-outlined />
                  </template>
                  {{ appTheme === 'light-theme' ? 'Dark Theme' : 'Light Theme' }}
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="3">
                  <template #icon>
                    <logout-outlined />
                  </template>
                  Logout
                </a-menu-item>
              </a-menu>
            </template>
            <div class="user-avatar">
              <a-avatar>{{ 'Admin'[0] }}</a-avatar>
              <span v-if="!isMobile">Admin</span>
              <down-outlined />
            </div>
          </a-dropdown>
        </div>
      </a-layout-header>
      
      <!-- Main content with sidebar -->
      <a-layout class="main-layout">
        <a-layout-sider
          v-model:collapsed="sidebarCollapsed"
          :theme="sidebarTheme"
          :class="{ 'sidebar-expanded': !sidebarCollapsed && sidebarMode === 'expanded' }"
          collapsible
          :trigger="null"
          width="240"
        >
          <a-menu
            v-model:selectedKeys="activeRoute"
            :theme="sidebarTheme"
            mode="inline"
          >
            <a-menu-item key="dashboard">
              <template #icon><dashboard-outlined /></template>
              <span>Dashboard</span>
              <router-link to="/dashboard"></router-link>
            </a-menu-item>
            <a-menu-item key="jobs">
              <template #icon><profile-outlined /></template>
              <span>Jobs</span>
              <router-link to="/jobs"></router-link>
            </a-menu-item>
            <a-menu-item key="candidates">
              <template #icon><user-outlined /></template>
              <span>Candidates</span>
              <router-link to="/candidates"></router-link>
            </a-menu-item>
            <a-menu-item key="interviews">
              <template #icon><calendar-outlined /></template>
              <span>Interviews</span>
              <router-link to="/interviews"></router-link>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="settings">
              <template #icon><setting-outlined /></template>
              <span>Settings</span>
              <router-link to="/settings"></router-link>
            </a-menu-item>
          </a-menu>
        </a-layout-sider>
        
        <a-layout-content>
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  DashboardOutlined,
  ProfileOutlined,
  UserOutlined,
  CalendarOutlined, 
  BarChartOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  LogoutOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

const sidebarCollapsed = ref(false)
const sidebarTheme = ref('light')
const sidebarMode = ref('expanded')
const isMobile = ref(false)
const appTheme = ref('light-theme')
const route = useRoute()
const activeRoute = computed(() => {
  const path = route.path.split('/')[1] || 'dashboard'
  return [path]
})

const currentPage = computed(() => {
  const path = route.path.split('/')[1] || 'dashboard'
  return path.charAt(0).toUpperCase() + path.slice(1)
})

const toggleTheme = () => {
  appTheme.value = appTheme.value === 'light-theme' ? 'dark-theme' : 'light-theme'
  sidebarTheme.value = appTheme.value === 'light-theme' ? 'light' : 'dark'
  // Save theme preference
  localStorage.setItem('app-theme', appTheme.value)
}

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value && !sidebarCollapsed.value) {
    sidebarCollapsed.value = true
  }
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  
  // Load saved theme preference
  const savedTheme = localStorage.getItem('app-theme')
  if (savedTheme) {
    appTheme.value = savedTheme
    sidebarTheme.value = savedTheme === 'light-theme' ? 'light' : 'dark'
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// Watch for route changes to collapse sidebar on mobile
watch(route, () => {
  if (isMobile.value && !sidebarCollapsed.value) {
    sidebarCollapsed.value = true
  }
})
</script>

<style scoped>
/* Theme variables */
.light-theme {
  --bg-color: #f0f2f5;
  --text-color: rgba(0, 0, 0, 0.85);
  --header-bg: #fff;
  --card-bg: #fff;
  --border-color: #e8e8e8;
  --shadow-color: rgba(0, 0, 0, 0.05);
  --hover-color: #f5f5f5;
  --sidebar-bg: #fff;
  --sidebar-text: rgba(0, 0, 0, 0.85);
  --sidebar-active-bg: #e6f7ff;
  --sidebar-active-text: #1890ff;
  --sidebar-hover-bg: #f0f0f0;
}

.dark-theme {
  --bg-color: #1f1f1f;
  --text-color: rgba(255, 255, 255, 0.85);
  --header-bg: #141414;
  --card-bg: #262626;
  --border-color: #434343;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --hover-color: #1f1f1f;
  --sidebar-bg: #1f1f1f;
  --sidebar-text: rgba(255, 255, 255, 0.85);
  --sidebar-active-bg: #177ddc;
  --sidebar-active-text: #fff;
  --sidebar-hover-bg: #2a2a2a;
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--text-color);
  transition: all 0.3s ease;
}

.layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-layout {
  flex: 1;
  display: flex;
}

.logo {
  height: 64px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  color: white;
  font-size: 18px;
  font-weight: 700;
  overflow: hidden;
  white-space: nowrap;
}

.logo-img {
  height: 32px;
  margin-right: 10px;
}

.header {
  background: var(--header-bg);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px var(--shadow-color);
  z-index: 10;
  height: 64px;
  line-height: 64px;
  transition: background-color 0.3s ease;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-btn {
  padding: 0 12px;
  margin-right: 12px;
  font-size: 18px;
  color: var(--text-color);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
}

.user-avatar span {
  margin: 0 8px;
  color: var(--text-color);
}

/* Fixed sidebar to align text with icons */
:deep(.ant-menu-item), :deep(.ant-menu-submenu-title) {
  display: flex;
  align-items: center;
}

:deep(.ant-menu-item .anticon), :deep(.ant-menu-submenu-title .anticon) {
  margin-right: 10px;
}

:deep(.ant-menu-item span), :deep(.ant-menu-submenu-title span) {
  line-height: 40px;
  height: 40px;
  display: flex;
  align-items: center;
}

/* Override sidebar styles to match theme */
:deep(.ant-layout-sider-light) {
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
}

:deep(.ant-layout-sider-dark) {
  background-color: var(--sidebar-bg);
}

:deep(.ant-menu.ant-menu-light) {
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text);
}

:deep(.ant-menu.ant-menu-dark) {
  background-color: var(--sidebar-bg);
}

:deep(.ant-menu-light .ant-menu-item-selected) {
  background-color: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
}

:deep(.ant-menu-light .ant-menu-item:hover:not(.ant-menu-item-selected)) {
  background-color: var(--sidebar-hover-bg);
}

:deep(.ant-layout-sider-light .ant-layout-sider-trigger) {
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text);
  border-top: 1px solid var(--border-color);
}

:deep(.ant-menu-light .ant-menu-item-active) {
  color: var(--sidebar-active-text);
}

:deep(.ant-menu.ant-menu-dark .ant-menu-item-selected) {
  background-color: var(--sidebar-active-bg);
}

/* Normal view settings */
:deep(.ant-layout-content) {
  padding: 8px 0 0 8px;
  overflow: hidden;
  background: var(--bg-color);
  transition: all 0.3s ease;
}

/* Apply theme to Ant Design components */
.dark-theme :deep(.ant-breadcrumb-link),
.dark-theme :deep(.ant-breadcrumb-separator) {
  color: var(--text-color);
}

.dark-theme :deep(.ant-dropdown-menu) {
  background-color: var(--card-bg);
}

.dark-theme :deep(.ant-dropdown-menu-item) {
  color: var(--text-color);
}

.dark-theme :deep(.ant-dropdown-menu-item:hover) {
  background-color: var(--hover-color);
}

.dark-theme :deep(.ant-divider) {
  background-color: var(--border-color);
}

@media (max-width: 768px) {
  .toggle-btn {
    margin-right: 8px;
  }
  
  .header {
    padding: 0 8px;
  }
  
  .logo {
    padding: 0 8px;
  }
}
</style> 