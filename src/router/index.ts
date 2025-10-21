import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import DefaultLayout from '@/layout/defaultLayout.vue';
import AdminLayout from '@/layout/adminLayout.vue';
import Home from '@/views/Home.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Default layout routes - for home page, screen display, audience page
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: Home,
        },
        {
          path: 'screen',
          name: 'screen',
          component: () => import('@/views/Screen.vue'),
        },
        {
          path: 'screen/:activityId',
          name: 'screen-activity',
          component: () => import('@/views/Screen.vue'),
        },
        {
          path: 'audience',
          name: 'audience',
          component: () => import('@/views/Audience.vue'),
        },
        {
          path: 'vote',
          name: 'vote',
          component: () => import('@/views/Vote.vue'),
        },
        {
          path: 'vote/:activityId',
          name: 'vote-activity',
          component: () => import('@/views/Vote.vue'),
        },
        {
          path: 'timer-demo',
          name: 'timer-demo',
          component: () => import('@/views/demo/Timer.vue'),
        },
      ],
    },
    // Authentication related routes
    {
      path: '/auth',
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/auth/Login.vue'),
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('@/views/auth/ForgotPassword.vue'),
        },
      ],
    },
    // Admin backend layout routes
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
        },
        // Activity management
        {
          path: 'activities',
          name: 'activities',
          component: () => import('@/views/admin/Activities.vue'),
        },
        {
          path: 'activities/create',
          name: 'admin-activities-create',
          component: () => import('@/views/admin/ActivityCreate.vue'),
        },
        {
          path: 'activities/:id',
          name: 'admin-activities-detail',
          component: () => import('@/views/admin/ActivityDetail.vue'),
        },
        {
          path: 'activities/:id/edit',
          name: 'admin-activities-edit',
          component: () => import('@/views/admin/ActivityEdit.vue'),
        },
        // Debate management
        {
          path: 'debates',
          name: 'debates',
          component: () => import('@/views/admin/Debates.vue'),
        },
        {
          path: 'debates/create',
          name: 'admin-debates-create',
          component: () => import('@/views/admin/DebateCreate.vue'),
        },
        {
          path: 'debates/:id',
          name: 'admin-debates-detail',
          component: () => import('@/views/admin/DebateDetail.vue'),
        },
        {
          path: 'debates/:id/edit',
          name: 'admin-debates-edit',
          component: () => import('@/views/admin/DebateEdit.vue'),
        },
        // Participant management
        {
          path: 'participants',
          name: 'participants',
          component: () => import('@/views/admin/Participants.vue'),
        },
        // 投票管理
        {
          path: 'votes',
          name: 'admin-votes',
          component: () => import('@/views/admin/Votes.vue'),
        },
        // 用户管理
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/Users.vue'),
        },
        // Collaborator management
        {
          path: 'collaborators',
          name: 'collaborators',
          component: () => import('@/views/admin/Collaborators.vue'),
        },
        // Screen control
        {
          path: 'screen-control',
          name: 'screen-control',
          component: () => import('@/views/admin/ScreenControl.vue'),
        },
        // Statistics reports
        {
          path: 'statistics',
          name: 'statistics',
          component: () => import('@/views/admin/Statistics.vue'),
        },
        {
          path: 'reports',
          name: 'admin-reports',
          component: () => import('@/views/admin/Reports.vue'),
        },
      ],
    },
  ],
});

// Route guards
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  // If already logged in and accessing login page, redirect to admin
  if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'admin-dashboard' });
    return;
  }

  // Check if authentication is required
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      // Not logged in, redirect to login page
      next({
        name: 'login',
        query: { redirect: to.fullPath },
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
