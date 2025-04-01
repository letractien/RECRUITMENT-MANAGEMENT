<template>
  <div class="settings-container">
    <div class="page-header">
      <h2>Settings</h2>
      <div class="header-actions">
        <a-button type="primary">
          Save Changes
        </a-button>
      </div>
    </div>

    <a-card>
      <a-tabs default-active-key="1">
        <a-tab-pane key="1" tab="General">
          <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
            <a-form-item label="Company Name">
              <a-input v-model:value="settings.companyName" />
            </a-form-item>
            <a-form-item label="Website">
              <a-input v-model:value="settings.website" />
            </a-form-item>
            <a-form-item label="Email">
              <a-input v-model:value="settings.email" />
            </a-form-item>
            <a-form-item label="Phone">
              <a-input v-model:value="settings.phone" />
            </a-form-item>
            <a-form-item label="Address">
              <a-textarea v-model:value="settings.address" :rows="3" />
            </a-form-item>
          </a-form>
        </a-tab-pane>
        
        <a-tab-pane key="2" tab="Notifications">
          <a-list>
            <a-list-item>
              <div class="notification-setting">
                <div>
                  <div class="setting-title">New Application Notifications</div>
                  <div class="setting-description">Receive notifications when new candidates apply</div>
                </div>
                <a-switch v-model:checked="settings.notifications.newApplications" />
              </div>
            </a-list-item>
            <a-list-item>
              <div class="notification-setting">
                <div>
                  <div class="setting-title">Interview Reminders</div>
                  <div class="setting-description">Get reminded of upcoming interviews</div>
                </div>
                <a-switch v-model:checked="settings.notifications.interviewReminders" />
              </div>
            </a-list-item>
            <a-list-item>
              <div class="notification-setting">
                <div>
                  <div class="setting-title">Task Deadlines</div>
                  <div class="setting-description">Be notified of approaching task deadlines</div>
                </div>
                <a-switch v-model:checked="settings.notifications.taskDeadlines" />
              </div>
            </a-list-item>
            <a-list-item>
              <div class="notification-setting">
                <div>
                  <div class="setting-title">Weekly Reports</div>
                  <div class="setting-description">Receive weekly recruitment performance reports</div>
                </div>
                <a-switch v-model:checked="settings.notifications.weeklyReports" />
              </div>
            </a-list-item>
          </a-list>
        </a-tab-pane>
        
        <a-tab-pane key="3" tab="System">
          <a-list>
            <a-list-item>
              <div class="notification-setting">
                <div>
                  <div class="setting-title">Dark Mode</div>
                  <div class="setting-description">Use dark color scheme</div>
                </div>
                <a-switch v-model:checked="settings.system.darkMode" />
              </div>
            </a-list-item>
            <a-list-item>
              <div class="notification-setting">
                <div>
                  <div class="setting-title">Compact View</div>
                  <div class="setting-description">Use compact layout for tables and lists</div>
                </div>
                <a-switch v-model:checked="settings.system.compactView" />
              </div>
            </a-list-item>
            <a-list-item>
              <div class="notification-setting">
                <div>
                  <div class="setting-title">Language</div>
                  <div class="setting-description">Select your preferred language</div>
                </div>
                <a-select v-model:value="settings.system.language" style="width: 200px">
                  <a-select-option value="en">English</a-select-option>
                  <a-select-option value="vi">Vietnamese</a-select-option>
                  <a-select-option value="fr">French</a-select-option>
                  <a-select-option value="es">Spanish</a-select-option>
                </a-select>
              </div>
            </a-list-item>
          </a-list>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const settings = reactive({
  companyName: 'RecruitPro Inc.',
  website: 'www.recruitpro.com',
  email: 'contact@recruitpro.com',
  phone: '+1 (555) 123-4567',
  address: '123 Recruitment Street, Tech District, San Francisco, CA 94105',
  notifications: {
    newApplications: true,
    interviewReminders: true,
    taskDeadlines: false,
    weeklyReports: true
  },
  system: {
    darkMode: false,
    compactView: false,
    language: 'en'
  }
})
</script>

<style scoped>
.settings-container {
  padding: 4px;
  background-color: var(--bg-color);
  min-height: 100%;
  overflow-x: hidden;
  color: var(--text-color);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-setting {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.setting-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-color);
}

.setting-description {
  color: var(--text-color);
  opacity: 0.45;
  font-size: 14px;
}

:deep(.ant-card) {
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

:deep(.ant-card-head) {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

:deep(.ant-card-body) {
  background-color: var(--card-bg);
}

:deep(.ant-tabs-nav) {
  background-color: var(--card-bg);
}

:deep(.ant-tabs-tab) {
  color: var(--text-color);
  opacity: 0.8;
}

:deep(.ant-tabs-tab-active) {
  color: #1890ff;
  opacity: 1;
}

:deep(.ant-tabs-ink-bar) {
  background-color: #1890ff;
}

:deep(.ant-list-item) {
  border-bottom: 1px solid var(--border-color);
}

:deep(.ant-form-item-label > label) {
  color: var(--text-color);
}

:deep(.ant-input) {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

:deep(.ant-select-selector) {
  background-color: var(--card-bg) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-color);
}

:deep(.ant-select-selection-item) {
  color: var(--text-color);
}

:deep(.ant-textarea) {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

:deep(.ant-list-empty-text) {
  color: var(--text-color);
  opacity: 0.6;
}
</style> 