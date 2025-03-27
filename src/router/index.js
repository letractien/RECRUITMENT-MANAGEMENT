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
    component: () => import('../pages/Dashboard.vue'),
    meta: {
      title: 'Dashboard',
      requiresAuth: true
    }
  },
  {
    path: '/jobs',
    name: 'Jobs',
    component: () => import('../pages/Jobs.vue'),
    meta: {
      title: 'Job Postings',
      requiresAuth: true
    }
  },
  {
    path: '/candidates',
    name: 'Candidates',
    component: () => import('../pages/Candidates.vue'),
    meta: {
      title: 'Candidates',
      requiresAuth: true
    }
  },
  {
    path: '/interviews',
    name: 'Interviews',
    component: () => import('../pages/Interviews.vue'),
    meta: {
      title: 'Interviews',
      requiresAuth: true
    }
  },
  {
    path: '/reports',
    redirect: '/dashboard#reports'
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/Settings.vue'),
    meta: {
      title: 'Settings',
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue'),
    meta: {
      title: 'Page Not Found',
      requiresAuth: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard to handle authentication and page titles
router.beforeEach((to, from, next) => {
  // Set the document title
  document.title = to.meta.title ? `${to.meta.title} | Recruitment Management` : 'Recruitment Management';
  
  // Check authentication if required
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      // In a real app, redirect to login page
      // next({ name: 'Login' });
      // For now, just proceed
      next();
      return;
    }
  }
  
  next();
});

export default router 