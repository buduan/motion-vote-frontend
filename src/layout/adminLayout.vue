<template>
  <div
    class="navbar bg-base-100/75 backdrop-blur-xl shadow-2xl shadow-base-content/5 fixed top-0 border-1 border-base-300/50"
  >
    <div class="flex-1">
      <a class="btn btn-ghost text-xl">Console</a>
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
          <RouterLink to="/admin/settings/general">Settings</RouterLink>
        </li>
      </ul>
    </div>
  </div>
  <router-view class="pt-16" />
</template>

<script setup lang="ts">
// 管理后台布局组件逻辑
</script>
