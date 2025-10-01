<template>
  <div class="dashboard-page">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">仪表盘</h1>
      <p class="text-gray-600 mt-2">Motion Vote 管理后台概览</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- 总议题数 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总议题数</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.totalMotions }}
            </p>
          </div>
        </div>
      </div>

      <!-- 活跃投票 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              ></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">活跃投票</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.activeVotes }}
            </p>
          </div>
        </div>
      </div>

      <!-- 总投票数 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总投票数</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.totalVotes }}
            </p>
          </div>
        </div>
      </div>

      <!-- 注册用户 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              ></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">注册用户</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.totalUsers }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近活动和快速操作 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 最近议题 -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">最近议题</h2>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="motion in recentMotions" :key="motion.id" class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-sm font-medium text-gray-900">
                  {{ motion.title }}
                </h3>
                <p class="text-xs text-gray-500 mt-1">{{ motion.createdAt }}</p>
              </div>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusClass(motion.status)"
              >
                {{ getStatusText(motion.status) }}
              </span>
            </div>
          </div>
          <div class="mt-6">
            <router-link to="/admin/motions" class="text-sm text-blue-600 hover:text-blue-500 font-medium">
              查看所有议题 →
            </router-link>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">快速操作</h2>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <button
              class="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              创建新议题
            </button>

            <button
              class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                ></path>
              </svg>
              查看大屏展示
            </button>

            <button
              class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
              导出投票数据
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 响应式数据
const stats = ref({
  totalMotions: 24,
  activeVotes: 3,
  totalVotes: 1247,
  totalUsers: 156,
});

const recentMotions = ref([
  {
    id: 1,
    title: '关于提高员工福利待遇的提案',
    status: 'active',
    createdAt: '2024-01-15 14:30',
  },
  {
    id: 2,
    title: '办公环境改善方案',
    status: 'ended',
    createdAt: '2024-01-14 09:15',
  },
  {
    id: 3,
    title: '年度预算分配讨论',
    status: 'pending',
    createdAt: '2024-01-13 16:45',
  },
  {
    id: 4,
    title: '新产品开发计划',
    status: 'ended',
    createdAt: '2024-01-12 11:20',
  },
]);

// 方法
const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'ended':
      return 'bg-gray-100 text-gray-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '进行中';
    case 'ended':
      return '已结束';
    case 'pending':
      return '待开始';
    default:
      return '未知';
  }
};
</script>

<style scoped>
.dashboard-page {
  font-family: 'Inter', sans-serif;
}
</style>
