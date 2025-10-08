<template>
  <div class="login-page bg-base-200">
    <h1 class="text-4xl font-bold mb-8">Motion Vote</h1>
    <div class="card w-96 bg-base-100 shadow-base-300 shadow-2xl">
      <div class="card-body">
        <!-- 使用Vue绑定变量控制的tab切换 -->
        <div class="tabs tabs-box justify-center mb-6">
          <button class="tab" :class="{ 'tab-active': activeTab === 'login' }" @click="activeTab = 'login'">
            Login
          </button>
          <button class="tab" :class="{ 'tab-active': activeTab === 'register' }" @click="activeTab = 'register'">
            Register
          </button>
        </div>
        <Transition name="fade" mode="out-in">
          <!-- 使用v-if控制内容显示 -->
          <div v-if="activeTab === 'login'" class="flex flex-col gap-4">
            <label class="floating-label">
              <input type="text" placeholder="Email" class="input input-md border-0 bg-base-200 min-w-full" />
              <span>Email</span>
            </label>
            <label class="floating-label">
              <input type="text" placeholder="Password" class="input input-md border-0 bg-base-200 min-w-full" />
              <span>Password</span>
            </label>
            <div class="flex justify-between items-center">
              <a href="/auth/forgot-password" class="text-info text-sm">Forgot Password?</a>
              <button class="btn btn-primary">Login</button>
            </div>
          </div>

          <div v-else-if="activeTab === 'register'" class="flex flex-col gap-4">
            <label class="floating-label">
              <input type="text" placeholder="Email" class="input input-md border-0 bg-base-200 min-w-full" />
              <span>Email</span>
            </label>
            <div class="flex flex-row gap-2">
              <label class="floating-label w-full">
                <input type="number" placeholder="Verify Code" class="input input-md border-0 bg-base-200" />
                <span>Verify Code</span>
              </label>
              <button class="btn btn-primary">Send Code</button>
            </div>

            <label class="floating-label">
              <input type="password" placeholder="Password" class="input input-md border-0 bg-base-200 min-w-full" />
              <span>Password</span>
            </label>
            <label class="floating-label">
              <input
                type="password"
                placeholder="Confirm Password"
                class="input input-md border-0 bg-base-200 min-w-full"
              />
              <span>Confirm Password</span>
            </label>
            <label for="register-checkbox" class="flex items-center">
              <input type="checkbox" id="register-checkbox" class="checkbox checkbox-primary" />
              <span class="ml-2">I agree to the terms and conditions</span>
            </label>
            <button class="btn btn-primary">Register</button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 使用Vue响应式变量控制当前激活的tab
const activeTab = ref<'login' | 'register'>('login');
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
}

.fade-leave-active {
  transition: opacity 0.15s ease-out;
}

.fade-enter-active {
  transition: opacity 0.15s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
