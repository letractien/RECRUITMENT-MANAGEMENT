import { createRouter, createWebHistory } from 'vue-router'

// Define routes with lazy loading for better performance
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../features/dashboard/pages/Dashboard.vue'),
    meta: {
      title: 'Dashboard'
    }
  },
  {
    path: '/jobs',
    name: 'Jobs',
    component: () => import('../features/jobs/pages/Jobs.vue'),
    meta: {
      title: 'Job Postings'
    }
  },
  {
    path: '/candidates',
    name: 'Candidates',
    component: () => import('../features/candidates/pages/Candidates.vue'),
    meta: {
      title: 'Candidates'
    }
  },
  {
    path: '/interviews',
    name: 'Interviews',
    component: () => import('../features/interviews/pages/Interviews.vue'),
    meta: {
      title: 'Interviews'
    }
  },
  {
    path: '/reports',
    redirect: '/dashboard#reports'
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../core/pages/Settings.vue'),
    meta: {
      title: 'Settings'
    }
  },
  {
    path: '/jobs/:jobId/applications',
    name: 'JobApplications',
    component: () => import('../features/jobs/components/JobApplications.vue'),
    props: true
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../core/pages/NotFound.vue'),
    meta: {
      title: 'Page Not Found'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard to handle page titles
router.beforeEach((to, from, next) => {
  // Set the document title
  document.title = to.meta.title ? `${to.meta.title} | Recruitment Management` : 'Recruitment Management';
  next();
});

export default router 