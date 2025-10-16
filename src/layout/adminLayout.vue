<template>
  <div
    class="navbar bg-base-100/75 backdrop-blur-xl shadow-2xl shadow-base-content/5 fixed top-0 border-1 border-base-300/50 z-50"
  >
    <div class="flex-1">
      <a class="btn btn-ghost text-xl">Motion Vote Console</a>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        <li>
          <RouterLink to="/admin">Dashboard</RouterLink>
        </li>
        <li>
          <RouterLink to="/admin/activities">Activities</RouterLink>
        </li>
        <li>
          <RouterLink to="/admin/users">Users</RouterLink>
        </li>
        <li>
          <details>
            <summary>
              <div class="avatar avatar-placeholder">
                <div class="w-8 mask mask-squircle bg-neutral text-neutral-content">
                  <span class="text-xs">{{ userInitials }}</span>
                </div>
              </div>
            </summary>
            <ul class="bg-base-100 rounded-box z-10 p-2 shadow-xl">
              <li><a @click="handleLogout">登出</a></li>
            </ul>
          </details>
        </li>
      </ul>
    </div>
  </div>
  <router-view class="pt-16" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import toast from '@/utils/toast';

const router = useRouter();
const authStore = useAuthStore();

// 获取用户名首字母
const userInitials = computed(() => {
  if (!authStore.user) return 'U';
  const name = authStore.user.name || authStore.user.email;
  return name.substring(0, 2).toUpperCase();
});

// 登出
const handleLogout = async () => {
  if (toast.confirm('确定要登出吗？')) {
    await authStore.logout();
    toast.success('已成功登出');
    router.push('/auth/login');
  }
};
</script>
