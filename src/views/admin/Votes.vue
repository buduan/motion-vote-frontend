<template>
  <div class="votes-page">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Vote Management</h1>
      <p class="text-gray-600 mt-2">View and manage all voting records</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              ></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Votes</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.totalVotes }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Pro Votes</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.agreeVotes }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Con Votes</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.disagreeVotes }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-gray-100 rounded-lg">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Abstain Votes</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.abstainVotes }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 投票记录列表 -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Vote Records</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voter</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motion</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vote Choice
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vote Time</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="vote in voteRecords" :key="vote.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-600">{{ vote.voter.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">
                      {{ vote.voter }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ vote.motionTitle }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getVoteClass(vote.choice)"
                >
                  {{ getVoteText(vote.choice) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ vote.createdAt }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ vote.ipAddress }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 响应式数据
const stats = ref({
  totalVotes: 1247,
  agreeVotes: 756,
  disagreeVotes: 321,
  abstainVotes: 170,
});

const voteRecords = ref([
  {
    id: 1,
    voter: '张三',
    motionTitle: '关于提高员工福利待遇的提案',
    choice: 'agree',
    createdAt: '2024-01-15 15:30:25',
    ipAddress: '192.168.1.100',
  },
  {
    id: 2,
    voter: '李四',
    motionTitle: '关于提高员工福利待遇的提案',
    choice: 'disagree',
    createdAt: '2024-01-15 15:28:12',
    ipAddress: '192.168.1.101',
  },
  {
    id: 3,
    voter: '王五',
    motionTitle: '办公环境改善方案',
    choice: 'agree',
    createdAt: '2024-01-14 10:15:33',
    ipAddress: '192.168.1.102',
  },
  {
    id: 4,
    voter: '赵六',
    motionTitle: '办公环境改善方案',
    choice: 'abstain',
    createdAt: '2024-01-14 10:12:45',
    ipAddress: '192.168.1.103',
  },
  {
    id: 5,
    voter: '孙七',
    motionTitle: '新产品开发计划',
    choice: 'agree',
    createdAt: '2024-01-12 14:20:18',
    ipAddress: '192.168.1.104',
  },
]);

// 方法
const getVoteClass = (choice: string) => {
  switch (choice) {
    case 'agree':
      return 'bg-green-100 text-green-800';
    case 'disagree':
      return 'bg-red-100 text-red-800';
    case 'abstain':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getVoteText = (choice: string) => {
  switch (choice) {
    case 'agree':
      return '赞成';
    case 'disagree':
      return '反对';
    case 'abstain':
      return '弃权';
    default:
      return '未知';
  }
};
</script>

<style scoped>
.votes-page {
  font-family: 'Inter', sans-serif;
}
</style>
