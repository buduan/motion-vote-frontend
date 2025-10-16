<template>
  <div class="login-page bg-base-200">
    <h1 class="text-4xl font-bold mb-8">Motion Vote</h1>
    <div class="card w-96 bg-base-100 shadow-base-300 shadow-2xl">
      <div class="card-body">
        <!-- Tab Switch -->
        <div class="tabs tabs-box justify-center mb-6">
          <button class="tab" :class="{ 'tab-active': activeTab === 'login' }" @click="activeTab = 'login'">
            Login
          </button>
          <button class="tab" :class="{ 'tab-active': activeTab === 'register' }" @click="activeTab = 'register'">
            Register
          </button>
        </div>

        <Transition name="fade" mode="out-in">
          <!-- Login Form -->
          <div v-if="activeTab === 'login'" class="flex flex-col gap-4">
            <label class="floating-label">
              <input
                v-model="loginForm.email"
                type="email"
                placeholder="Email"
                class="input input-md border-0 bg-base-200 min-w-full"
                @keyup.enter="handleLogin"
              />
              <span>Email</span>
            </label>
            <label class="floating-label">
              <input
                v-model="loginForm.password"
                type="password"
                placeholder="Password"
                class="input input-md border-0 bg-base-200 min-w-full"
                @keyup.enter="handleLogin"
              />
              <span>Password</span>
            </label>
            <div class="flex justify-between items-center">
              <router-link to="/auth/forgot-password" class="link link-info text-sm">Forgot Password?</router-link>
              <button class="btn btn-primary" :disabled="isLoading" @click="handleLogin">
                <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
                {{ isLoading ? 'Logging in...' : 'Login' }}
              </button>
            </div>
          </div>

          <!-- Register Form -->
          <div v-else-if="activeTab === 'register'" class="flex flex-col gap-4">
            <label class="floating-label">
              <input
                v-model="registerForm.name"
                type="text"
                placeholder="Username"
                class="input input-md border-0 bg-base-200 min-w-full"
              />
              <span>Username</span>
            </label>
            <label class="floating-label">
              <input
                v-model="registerForm.email"
                type="email"
                placeholder="Email"
                class="input input-md border-0 bg-base-200 min-w-full"
              />
              <span>Email</span>
            </label>
            <div class="flex flex-row gap-2">
              <label class="floating-label w-full">
                <input
                  v-model="registerForm.code"
                  type="text"
                  placeholder="Verification Code"
                  class="input input-md border-0 bg-base-200"
                />
                <span>Code</span>
              </label>
              <button
                class="btn btn-primary"
                :disabled="!canSendCode || codeCooldown > 0"
                @click="handleSendCode('register')"
              >
                {{ codeCooldown > 0 ? `${codeCooldown}s` : 'Send Code' }}
              </button>
            </div>
            <label class="floating-label">
              <input
                v-model="registerForm.password"
                type="password"
                placeholder="Password"
                class="input input-md border-0 bg-base-200 min-w-full"
              />
              <span>Password</span>
            </label>
            <label class="floating-label">
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                class="input input-md border-0 bg-base-200 min-w-full"
              />
              <span>Confirm Password</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input v-model="agreeTerms" type="checkbox" class="checkbox checkbox-primary" />
              <span class="ml-2">I agree to the terms and privacy policy</span>
            </label>
            <button class="btn btn-primary" :disabled="!canRegister || isLoading" @click="handleRegister">
              <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
              {{ isLoading ? 'Registering...' : 'Register' }}
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Token Refresh Dialog -->
    <dialog ref="refreshDialog" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Token Expiring Soon</h3>
        <p class="py-4">Your session is about to expire. Would you like to refresh your token to stay logged in?</p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="handleRefreshDecline">Later</button>
          <button class="btn btn-primary" @click="handleRefreshToken">Refresh Token</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { AuthApi } from '@/api/auth';
import toast from '@/utils/toast';

const router = useRouter();
const authStore = useAuthStore();

// Tab状态
const activeTab = ref<'login' | 'register'>('login');

// 登录表单
const loginForm = ref({
  email: '',
  password: '',
});

// 注册表单
const registerForm = ref({
  name: '',
  email: '',
  password: '',
  code: '',
  session: '',
});

const confirmPassword = ref('');
const agreeTerms = ref(false);
const isLoading = ref(false);

// 验证码相关
const codeCooldown = ref(0);
const codeCooldownTimer = ref<ReturnType<typeof setInterval> | null>(null);

// Token刷新对话框
const refreshDialog = ref<HTMLDialogElement | null>(null);
const tokenCheckTimer = ref<ReturnType<typeof setInterval> | null>(null);

// 计算属性
const canSendCode = computed(() => {
  return registerForm.value.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.value.email);
});

const canRegister = computed(() => {
  return (
    registerForm.value.name &&
    registerForm.value.email &&
    registerForm.value.password &&
    confirmPassword.value &&
    registerForm.value.password === confirmPassword.value &&
    registerForm.value.code &&
    registerForm.value.session &&
    agreeTerms.value
  );
});

// Send verification code
const handleSendCode = async (type: 'register' | 'forgot') => {
  const email = type === 'register' ? registerForm.value.email : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    toast.error('Please enter a valid email address');
    return;
  }

  try {
    const response = await AuthApi.sendVerificationCode(email);
    if (response.success && response.data) {
      registerForm.value.session = response.data.session;

      // Start countdown
      codeCooldown.value = 60;
      codeCooldownTimer.value = setInterval(() => {
        codeCooldown.value--;
        if (codeCooldown.value <= 0 && codeCooldownTimer.value) {
          clearInterval(codeCooldownTimer.value);
          codeCooldownTimer.value = null;
        }
      }, 1000);

      toast.success('Verification code sent to your email');
    } else {
      toast.error(response.message || 'Failed to send verification code');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send verification code';
    toast.error(errorMessage);
  }
};

// Login
const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    toast.error('Please enter email and password');
    return;
  }

  isLoading.value = true;
  const result = await authStore.login(loginForm.value);
  isLoading.value = false;

  if (result.success) {
    router.push('/');
  } else {
    toast.error(result.message || 'Login failed');
  }
};

// Register
const handleRegister = async () => {
  if (!canRegister.value) {
    return;
  }

  if (registerForm.value.password.length < 6) {
    toast.error('Password must be at least 6 characters');
    return;
  }

  isLoading.value = true;
  const result = await authStore.register(registerForm.value);
  isLoading.value = false;

  if (result?.success) {
    toast.success(result?.message || 'Registration successful');
    activeTab.value = 'login';
    loginForm.value.email = registerForm.value.email;
  } else {
    toast.error(result?.message || 'Registration failed');
  }
};

// Token refresh
const handleRefreshToken = async () => {
  refreshDialog.value?.close();
  const result = await authStore.refreshToken();
  if (result.success) {
    toast.success('Token refreshed successfully');
  } else {
    toast.error('Token refresh failed, please login again');
    router.push('/auth/login');
  }
};

const handleRefreshDecline = () => {
  refreshDialog.value?.close();
};

// Check if token is expiring soon
const checkTokenExpiry = () => {
  if (authStore.isTokenExpiringSoon && refreshDialog.value && !refreshDialog.value.open) {
    refreshDialog.value.showModal();
  }
};

// 生命周期
onMounted(() => {
  // 如果已经登录，跳转到首页
  if (authStore.isAuthenticated) {
    router.push('/');
  }

  // 定期检查Token状态
  tokenCheckTimer.value = setInterval(checkTokenExpiry, 30000); // 每30秒检查一次
});

onUnmounted(() => {
  if (codeCooldownTimer.value) {
    clearInterval(codeCooldownTimer.value);
  }
  if (tokenCheckTimer.value) {
    clearInterval(tokenCheckTimer.value);
  }
});

// 监听认证状态变化
watch(
  () => authStore.isAuthenticated,
  newVal => {
    if (newVal) {
      router.push('/');
    }
  },
);
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
