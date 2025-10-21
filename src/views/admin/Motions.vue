<template>
  <div class="motions-page">
    <!-- 页面标题和操作 -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Motion Management</h1>
        <p class="text-gray-600 mt-2">Manage all voting motions</p>
      </div>
      <button
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Create New Motion
      </button>
    </div>

    <!-- 筛选和搜索 -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">搜索议题</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="输入议题标题..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">状态筛选</label>
            <select
              v-model="statusFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">全部状态</option>
              <option value="pending">待开始</option>
              <option value="active">进行中</option>
              <option value="ended">已结束</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Creation Time</label>
            <input
              v-model="dateFilter"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div class="flex items-end">
            <button
              class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="resetFilters"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 议题列表 -->
    <div class="bg-white rounded-lg shadow">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Motion Information
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Voting Statistics
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creation Time
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="motion in filteredMotions" :key="motion.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-start">
                  <div class="flex-1">
                    <div class="text-sm font-medium text-gray-900">
                      {{ motion.title }}
                    </div>
                    <div class="text-sm text-gray-500 mt-1 line-clamp-2">
                      {{ motion.description }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusClass(motion.status)"
                >
                  <div class="w-1.5 h-1.5 rounded-full mr-1.5" :class="getStatusDotClass(motion.status)"></div>
                  {{ getStatusText(motion.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">总计: {{ motion.votes.total }}</div>
                <div class="text-xs text-gray-500">
                  赞成: {{ motion.votes.agree }} | 反对: {{ motion.votes.disagree }} | 弃权: {{ motion.votes.abstain }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ motion.createdAt }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button class="text-blue-600 hover:text-blue-900" @click="viewMotion(motion)">View</button>
                  <button class="text-indigo-600 hover:text-indigo-900" @click="editMotion(motion)">Edit</button>
                  <button
                    v-if="motion.status === 'pending'"
                    class="text-green-600 hover:text-green-900"
                    @click="startMotion(motion)"
                  >
                    开始
                  </button>
                  <button
                    v-if="motion.status === 'active'"
                    class="text-red-600 hover:text-red-900"
                    @click="endMotion(motion)"
                  >
                    结束
                  </button>
                  <button class="text-red-600 hover:text-red-900" @click="deleteMotion(motion)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            上一页
          </button>
          <button
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              显示第
              <span class="font-medium">1</span>
              到
              <span class="font-medium">10</span>
              条， 共
              <span class="font-medium">{{ filteredMotions.length }}</span>
              条结果
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span class="sr-only">上一页</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              <button
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                1
              </button>
              <button
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span class="sr-only">下一页</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// 响应式数据
const searchQuery = ref('');
const statusFilter = ref('');
const dateFilter = ref('');

const motions = ref([
  {
    id: 1,
    title: '关于提高员工福利待遇的提案',
    description:
      '本提案旨在改善员工工作环境，提高薪资待遇，增加带薪休假天数。我们希望通过这项提案，能够更好地保障员工权益，提升工作满意度。',
    status: 'active',
    votes: { total: 211, agree: 156, disagree: 43, abstain: 12 },
    createdAt: '2024-01-15 14:30',
  },
  {
    id: 2,
    title: '办公环境改善方案',
    description: '针对当前办公环境存在的问题，提出改善方案，包括空调系统升级、办公桌椅更换、绿植布置等。',
    status: 'ended',
    votes: { total: 189, agree: 134, disagree: 32, abstain: 23 },
    createdAt: '2024-01-14 09:15',
  },
  {
    id: 3,
    title: '年度预算分配讨论',
    description: '讨论2024年度预算分配方案，包括各部门预算、项目投资、设备采购等方面的资金安排。',
    status: 'pending',
    votes: { total: 0, agree: 0, disagree: 0, abstain: 0 },
    createdAt: '2024-01-13 16:45',
  },
  {
    id: 4,
    title: '新产品开发计划',
    description: '关于新产品线的开发计划，包括市场调研、技术方案、时间安排和预算评估。',
    status: 'ended',
    votes: { total: 167, agree: 98, disagree: 45, abstain: 24 },
    createdAt: '2024-01-12 11:20',
  },
  {
    id: 5,
    title: '远程办公政策调整',
    description: '根据实际情况调整远程办公政策，平衡工作效率和员工需求。',
    status: 'active',
    votes: { total: 89, agree: 67, disagree: 15, abstain: 7 },
    createdAt: '2024-01-11 13:45',
  },
]);

// 计算属性
const filteredMotions = computed(() => {
  return motions.value.filter(motion => {
    const matchesSearch =
      !searchQuery.value ||
      motion.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      motion.description.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesStatus = !statusFilter.value || motion.status === statusFilter.value;

    const matchesDate = !dateFilter.value || motion.createdAt.startsWith(dateFilter.value);

    return matchesSearch && matchesStatus && matchesDate;
  });
});

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

const getStatusDotClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-400';
    case 'ended':
      return 'bg-gray-400';
    case 'pending':
      return 'bg-yellow-400';
    default:
      return 'bg-gray-400';
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

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = '';
  dateFilter.value = '';
};

const viewMotion = (_motion: any) => {
  // 这里可以跳转到议题详情页面
};

const editMotion = (_motion: any) => {
  // 这里可以打开编辑对话框或跳转到编辑页面
};

const startMotion = (motion: any) => {
  motion.status = 'active';
  // 这里可以调用API开始投票
};

const endMotion = (motion: any) => {
  motion.status = 'ended';
  // 这里可以调用API结束投票
};

const deleteMotion = (motion: any) => {
  if (confirm('Are you sure you want to delete this motion? This action cannot be undone.')) {
    const index = motions.value.findIndex(m => m.id === motion.id);
    if (index > -1) {
      motions.value.splice(index, 1);
    }
    // 这里可以调用API删除议题
  }
};
</script>

<style scoped>
.motions-page {
  font-family: 'Inter', sans-serif;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
