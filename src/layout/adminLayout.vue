<template>
  <div class="navbar bg-base-100 shadow-sm">
    <div class="flex-1">
      <a class="btn btn-ghost text-xl">Console</a>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        <li>
          <details>
            <summary>Activities</summary>
            <ul class="bg-base-100 rounded-t-none p-2">
              <li><RouterLink to="/admin/activities/lists">Lists</RouterLink></li>
              <li><RouterLink to="/admin/activities/create">Create</RouterLink></li>
            </ul>
          </details>
        </li>
        <li>
          <details>
            <summary>Users</summary>
            <ul class="bg-base-100 rounded-t-none p-2">
              <li><RouterLink to="/admin/users/lists">Lists</RouterLink></li>
              <li><RouterLink to="/admin/users/create">Create</RouterLink></li>
            </ul>
          </details>
        </li>
        <li>
          <details>
            <summary>Settings</summary>
            <ul class="bg-base-100 rounded-t-none p-2">
              <li><RouterLink to="/admin/settings/general">General</RouterLink></li>
              <li><RouterLink to="/admin/settings/super">Super</RouterLink></li>
            </ul>
          </details>
        </li>
      </ul>
    </div>
  </div>
  <router-view />
</template>

<script setup lang="ts">
// 管理后台布局组件逻辑
</script>
