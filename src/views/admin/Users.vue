<template>
  <div class="users-page p-4 lg:p-8">
    <!-- 页面标题和操作 -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">User Management</h1>
        <p class="text-base-content/70 mt-2">Manage system users and permissions</p>
      </div>
      <button class="btn btn-primary" @click="openAddUserModal">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Add User
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats stats-vertical lg:stats-horizontal shadow w-full mb-8">
      <div class="stat">
        <div class="stat-figure text-primary">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            ></path>
          </svg>
        </div>
        <div class="stat-title">Total Users</div>
        <div class="stat-value text-primary">{{ stats.totalUsers }}</div>
      </div>

      <div class="stat">
        <div class="stat-figure text-secondary">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            ></path>
          </svg>
        </div>
        <div class="stat-title">Administrators</div>
        <div class="stat-value text-secondary">{{ stats.adminUsers }}</div>
      </div>

      <div class="stat">
        <div class="stat-figure text-success">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
        </div>
        <div class="stat-title">Organizers</div>
        <div class="stat-value text-success">{{ stats.organizerUsers }}</div>
      </div>

      <!--<div class="stat">
        <div class="stat-figure text-accent">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <div class="stat-title">今日新增</div>
        <div class="stat-value text-accent">{{ stats.newUsersToday }}</div>
      </div>-->
    </div>

    <!-- Search and Filter -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <!-- Search Users -->
          <div class="flex items-center gap-4 w-full md:flex-1">
            <label class="w-24 text-right font-medium text-base-content/80 flex-shrink-0">Search Users</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Enter username or email..."
              class="input input-bordered flex-1"
              @input="debouncedFetchUsers"
            />
          </div>

          <!-- Role Filter -->
          <div class="flex items-center gap-4 w-full md:w-auto md:min-w-[280px]">
            <label class="w-24 text-right font-medium text-base-content/80 flex-shrink-0">Role Filter</label>
            <select v-model="roleFilter" class="select select-bordered flex-1" @change="fetchUsers">
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>

          <!-- 重置按钮 -->
          <button class="btn btn-outline min-w-[100px]" @click="resetFilters">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            重置
          </button>
        </div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <Table
          :data="users"
          :columns="tableColumns"
          :loading="loading"
          :pagination="true"
          :current-page="pagination.page"
          :page-size="pagination.limit"
          :total="pagination.total"
          :actions="tableActions"
          row-key="id"
          empty-text="暂无用户数据"
          @update:current-page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        >
          <!-- 用户信息列 -->
          <template #cell-user="{ row }">
            <div class="flex items-center gap-3">
              <div class="avatar placeholder">
                <div class="bg-neutral text-neutral-content rounded-full w-10">
                  <span class="text-sm">{{ (row as any).name?.charAt(0)?.toUpperCase() || '' }}</span>
                </div>
              </div>
              <div>
                <div class="font-medium">{{ (row as any).name }}</div>
                <div class="text-sm opacity-50">{{ (row as any).email }}</div>
                <div v-if="(row as any).phone" class="text-xs opacity-40">{{ (row as any).phone }}</div>
              </div>
            </div>
          </template>

          <!-- Role Column -->
          <template #cell-role="{ row }">
            <span
              class="badge"
              :class="{
                'badge-secondary': (row as any).role === 'admin',
                'badge-primary': (row as any).role === 'organizer',
              }"
            >
              {{ getRoleText((row as any).role) }}
            </span>
          </template>

          <!-- 注册时间列 -->
          <template #cell-created_at="{ row }">
            <span class="text-sm">{{ formatDate((row as any).created_at) }}</span>
          </template>

          <!-- 更新时间列 -->
          <template #cell-updated_at="{ row }">
            <span class="text-sm">{{ formatDate((row as any).updated_at) }}</span>
          </template>
        </Table>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <dialog ref="userModalRef" class="modal">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-2xl mb-6 text-center">{{ isEditMode ? 'Edit User Information' : 'Add New User' }}</h3>

        <form class="space-y-4" @submit.prevent="submitUserForm">
          <!-- 邮箱 -->
          <div class="flex items-center gap-4">
            <label class="w-20 text-right font-medium text-base-content/80">Email</label>
            <div class="flex-1">
              <input
                v-model="userForm.email"
                type="email"
                placeholder="user@example.com"
                class="input input-bordered w-full"
                :class="{ 'input-error': userFormErrors.email }"
                required
                :disabled="isEditMode"
              />
              <p v-if="userFormErrors.email" class="text-error text-xs mt-1">{{ userFormErrors.email }}</p>
            </div>
          </div>

          <!-- 用户名 -->
          <div class="flex items-center gap-4">
            <label class="w-20 text-right font-medium text-base-content/80">Username</label>
            <div class="flex-1">
              <input
                v-model="userForm.name"
                type="text"
                placeholder="请输入用户名"
                class="input input-bordered w-full"
                :class="{ 'input-error': userFormErrors.name }"
                required
              />
              <p v-if="userFormErrors.name" class="text-error text-xs mt-1">{{ userFormErrors.name }}</p>
            </div>
          </div>

          <!-- Password (Only when adding user) -->
          <div v-if="!isEditMode" class="flex items-center gap-4">
            <label class="w-20 text-right font-medium text-base-content/80">Password</label>
            <div class="flex-1">
              <input
                v-model="userForm.password"
                type="password"
                placeholder="Enter password (at least 6 characters)"
                class="input input-bordered w-full"
                :class="{ 'input-error': userFormErrors.password }"
                required
              />
              <p v-if="userFormErrors.password" class="text-error text-xs mt-1">{{ userFormErrors.password }}</p>
            </div>
          </div>

          <!-- Phone Number -->
          <div class="flex items-center gap-4">
            <label class="w-20 text-right font-medium text-base-content/80">Phone Number</label>
            <div class="flex-1">
              <input
                v-model="userForm.phone"
                type="tel"
                placeholder="Enter phone number (optional)"
                class="input input-bordered w-full"
              />
            </div>
          </div>

          <!-- Role -->
          <div class="flex items-center gap-4">
            <label class="w-20 text-right font-medium text-base-content/80">Role</label>
            <div class="flex-1">
              <select v-model="userForm.role" class="select select-bordered w-full" required>
                <option value="organizer">Organizer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <!-- 验证码（仅添加用户时） -->
          <div v-if="!isEditMode" class="flex items-start gap-4">
            <label class="w-20 text-right font-medium text-base-content/80 pt-3">Verification Code</label>
            <div class="flex-1">
              <div class="flex gap-2">
                <input
                  v-model="userForm.code"
                  type="text"
                  placeholder="Enter verification code"
                  class="input input-bordered flex-1"
                  :class="{ 'input-error': userFormErrors.code }"
                  required
                />
                <button
                  type="button"
                  class="btn btn-outline min-w-[120px]"
                  :disabled="!userForm.email || sendingCode || countdown > 0"
                  @click="sendVerificationCode"
                >
                  <span v-if="sendingCode" class="loading loading-spinner loading-xs"></span>
                  <span v-else>{{ countdown > 0 ? `${countdown}s` : 'Get Code' }}</span>
                </button>
              </div>
              <p v-if="userFormErrors.code" class="text-error text-xs mt-1">{{ userFormErrors.code }}</p>
            </div>
          </div>

          <!-- 分隔线 -->
          <div class="divider my-6"></div>

          <!-- 操作按钮 -->
          <div class="flex justify-end gap-3">
            <button type="button" class="btn btn-ghost min-w-[100px]" @click="closeUserModal">Cancel</button>
            <button type="submit" class="btn btn-primary min-w-[100px]" :disabled="submitting">
              <span v-if="submitting" class="loading loading-spinner loading-sm"></span>
              <span v-else>{{ isEditMode ? 'Save' : 'Add' }}</span>
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { UsersApi, AuthApi } from '@/api';
import type { User, UserListParams, UserUpdateRequest } from '@/types/api';
import toast from '@/utils/toast';
import Table from '@/components/table.vue';

// Helper function to show toast
const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  toast[type](message);
};

// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const sendingCode = ref(false);
const countdown = ref(0);

const searchQuery = ref('');
const roleFilter = ref('');

const stats = ref({
  totalUsers: 0,
  adminUsers: 0,
  organizerUsers: 0,
  newUsersToday: 0,
});

const users = ref<User[]>([]);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const userModalRef = ref<HTMLDialogElement | null>(null);
const isEditMode = ref(false);
const selectedUser = ref<User | null>(null);

const userForm = ref({
  email: '',
  name: '',
  password: '',
  phone: '',
  role: 'organizer' as 'admin' | 'organizer',
  code: '',
  session: '',
});

const userFormErrors = ref({
  email: '',
  name: '',
  password: '',
  code: '',
});

// 表格列配置
const tableColumns = [
  {
    key: 'user',
    title: '用户信息',
    width: '35%',
  },
  {
    key: 'role',
    title: '角色',
    width: '15%',
  },
  {
    key: 'created_at',
    title: '注册时间',
    width: '20%',
  },
  {
    key: 'updated_at',
    title: '更新时间',
    width: '20%',
  },
];

// 表格操作按钮配置
const tableActions = [
  {
    key: 'edit',
    label: 'Edit',
    handler: (row: any) => {
      editUser(row as User);
    },
    class: 'btn btn-ghost btn-xs',
  },
];

// 防抖函数
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedFetchUsers = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    fetchUsers();
  }, 300);
};

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true;
  try {
    const params: UserListParams = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };

    if (searchQuery.value) {
      params.search = searchQuery.value;
    }

    const response = await UsersApi.getUsers(params);

    users.value = response.items;
    pagination.value = {
      page: response.page,
      limit: response.limit,
      total: response.total,
      totalPages: response.total_pages,
    };

    // 更新统计数据
    updateStats();
  } catch (error: any) {
    // console.error('获取用户列表失败:', error);
    showToast('获取用户列表失败: ' + (error.message || '未知错误'), 'error');
  } finally {
    loading.value = false;
  }
};

// 更新统计数据
const updateStats = () => {
  stats.value.totalUsers = pagination.value.total;
  stats.value.adminUsers = users.value.filter(u => u.role === 'admin').length;
  stats.value.organizerUsers = users.value.filter(u => u.role === 'organizer').length;

  // 计算今日新增用户
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  stats.value.newUsersToday = users.value.filter(u => {
    const createdDate = new Date(u.created_at);
    return createdDate >= today;
  }).length;
};

// 重置筛选
const resetFilters = () => {
  searchQuery.value = '';
  roleFilter.value = '';
  pagination.value.page = 1;
  fetchUsers();
};

// 处理页码变化
const handlePageChange = (page: number) => {
  pagination.value.page = page;
  fetchUsers();
};

// 处理每页条数变化
const handlePageSizeChange = (size: number) => {
  pagination.value.limit = size;
  pagination.value.page = 1; // 重置到第一页
  fetchUsers();
};

// 打开添加用户 Modal
const openAddUserModal = () => {
  isEditMode.value = false;
  resetUserForm();
  userModalRef.value?.showModal();
};

// 打开编辑用户 Modal
const editUser = (user: User) => {
  isEditMode.value = true;
  selectedUser.value = user;
  userForm.value = {
    email: user.email,
    name: user.name,
    password: '',
    phone: user.phone || '',
    role: user.role,
    code: '',
    session: '',
  };
  userFormErrors.value = {
    email: '',
    name: '',
    password: '',
    code: '',
  };
  userModalRef.value?.showModal();
};

// 关闭用户 Modal
const closeUserModal = () => {
  userModalRef.value?.close();
  resetUserForm();
};

// 重置用户表单
const resetUserForm = () => {
  userForm.value = {
    email: '',
    name: '',
    password: '',
    phone: '',
    role: 'organizer',
    code: '',
    session: '',
  };
  userFormErrors.value = {
    email: '',
    name: '',
    password: '',
    code: '',
  };
};

// 发送验证码
const sendVerificationCode = async () => {
  if (!userForm.value.email) {
    showToast('请先输入邮箱地址', 'error');
    return;
  }

  sendingCode.value = true;
  try {
    const response = await AuthApi.sendVerificationCode(userForm.value.email);
    if (response.data) {
      userForm.value.session = response.data.session;
      showToast('验证码已发送到您的邮箱', 'success');

      // 开始倒计时
      countdown.value = 60;
      const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    }
  } catch (error: any) {
    // console.error('发送验证码失败:', error);
    showToast('发送验证码失败: ' + (error.message || '未知错误'), 'error');
  } finally {
    sendingCode.value = false;
  }
};

// 提交用户表单
const submitUserForm = async () => {
  // 验证表单
  userFormErrors.value = {
    email: '',
    name: '',
    password: '',
    code: '',
  };

  if (!userForm.value.email) {
    userFormErrors.value.email = '邮箱不能为空';
    return;
  }
  if (!userForm.value.name) {
    userFormErrors.value.name = '用户名不能为空';
    return;
  }
  if (!isEditMode.value && !userForm.value.password) {
    userFormErrors.value.password = '密码不能为空';
    return;
  }
  if (!isEditMode.value && !userForm.value.code) {
    userFormErrors.value.code = '验证码不能为空';
    return;
  }

  submitting.value = true;
  try {
    if (isEditMode.value && selectedUser.value) {
      // 编辑用户
      const updateData: UserUpdateRequest = {
        name: userForm.value.name,
        phone: userForm.value.phone || undefined,
        role: userForm.value.role,
      };
      await UsersApi.updateUser(selectedUser.value.id, updateData);
      showToast('用户更新成功', 'success');
    } else {
      // 添加用户
      const registerData = {
        email: userForm.value.email,
        name: userForm.value.name,
        password: userForm.value.password,
        phone: userForm.value.phone || undefined,
        code: userForm.value.code,
        session: userForm.value.session,
      };
      await AuthApi.register(registerData);
      showToast('用户添加成功', 'success');
    }

    closeUserModal();
    fetchUsers();
  } catch (error: any) {
    // console.error('操作失败:', error);
    showToast('操作失败: ' + (error.message || '未知错误'), 'error');
  } finally {
    submitting.value = false;
  }
};

// 工具方法
const getRoleText = (role: string) => {
  switch (role) {
    case 'admin':
      return '管理员';
    case 'organizer':
      return '组织者';
    default:
      return '未知';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 组件挂载时获取数据
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.users-page {
  min-height: calc(100vh - 5rem);
}
</style>
