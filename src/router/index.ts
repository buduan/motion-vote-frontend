import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '@/layout/defaultLayout.vue';
import AdminLayout from '@/layout/adminLayout.vue';
import Home from '@/views/Home.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 默认布局路由 - 用于首页、大屏展示、观众页面
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
    // 认证相关路由
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
    // 管理后台布局路由
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
        },
        // 活动管理
        {
          path: 'activities',
          name: 'admin-activities',
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
        // 辩题管理
        {
          path: 'debates',
          name: 'admin-debates',
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
        // 参与者管理
        {
          path: 'participants',
          name: 'admin-participants',
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
        // 协作者管理
        {
          path: 'collaborators',
          name: 'admin-collaborators',
          component: () => import('@/views/admin/Collaborators.vue'),
        },
        // 大屏控制
        {
          path: 'screen-control',
          name: 'admin-screen-control',
          component: () => import('@/views/admin/ScreenControl.vue'),
        },
        // 统计报告
        {
          path: 'statistics',
          name: 'admin-statistics',
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

export default router;
