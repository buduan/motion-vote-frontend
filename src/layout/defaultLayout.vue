<template>
  <div class="default-layout min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Motion Vote</h1>
          </div>
          <nav class="flex space-x-8">
            <router-link
              to="/"
              class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-blue-600"
            >
              首页
            </router-link>
            <router-link
              to="/screen"
              class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-blue-600"
            >
              大屏展示
            </router-link>
            <router-link
              to="/audience"
              class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-blue-600"
            >
              观众页面
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- 底部 -->
    <footer class="bg-white border-t">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500">
          © 2024 Motion Vote. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 默认布局组件逻辑
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
}
</style>
