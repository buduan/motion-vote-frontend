<template>
  <div class="login-page bg-base-200">
    <h1 class="text-4xl font-bold mb-8">Motion Vote</h1>
    <div class="card w-96 bg-base-100 shadow-base-300 shadow-2xl">
      <div class="card-body">
        <!-- Tab切换 -->
        <div class="tabs tabs-box justify-center mb-6">
          <button class="tab" :class="{ 'tab-active': activeTab === 'login' }" @click="activeTab = 'login'">
            登录
          </button>
          <button class="tab" :class="{ 'tab-active': activeTab === 'register' }" @click="activeTab = 'register'">
            注册
          </button>
        </div>

        <Transition name="fade" mode="out-in">
          <!-- 登录表单 -->
          <div v-if="activeTab === 'login'" class="flex flex-col gap-4">
            <label class="floating-label">
              <input
                v-model="loginForm.email"
                type="email"
                placeholder="邮箱"
                class="input input-md border-0 bg-base-200 min-w-full"
                @keyup.enter="handleLogin"
              />
              <span>邮箱</span>
            </label>
            <label class="floating-label">
              <input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                class="input input-md border-0 bg-base-200 min-w-full"
                @keyup.enter="handleLogin"
              />
              <span>密码</span>
            </label>
            <div class="flex justify-between items-center">
              <router-link to="/auth/forgot-password" class="link link-info text-sm">忘记密码？</router-link>
              <button class="btn btn-primary" :disabled="isLoading" @click="handleLogin">
                <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
                {{ isLoading ? '登录中...' : '登录' }}
              </button>
            </div>
          </div>

          <!-- 注册表单 -->
          <div v-else-if="activeTab === 'register'" class="flex flex-col gap-4">
            <label class="floating-label">
              <input
                v-model="registerForm.name"
                type="text"
                placeholder="用户名"
                class="input input-md border-0 bg-base-200 min-w-full"
              />
              <span>用户名</span>
            </label>
            <label class="floating-label">
              <input
                v-model="registerForm.email"
                type="email"
                placeholder="邮箱"
                class="input input-md border-0 bg-base-200 min-w-full"
              />
              <span>邮箱</span>
            </label>
            <div class="flex flex-row gap-2">
              <label class="floating-label w-full">
                <input
                  v-model="registerForm.code"
                  type="text"
                  placeholder="验证码"
                  class="input input-md border-0 bg-base-200"
                />
                <span>验证码</span>
              </label>
              <button
                class="btn btn-primary"
                :disabled="!canSendCode || codeCooldown > 0"
                @click="handleSendCode('register')"
              >
                {{ codeCooldown > 0 ? `${codeCooldown}s` : '发送验证码' }}
              </button>
            </div>
            <label class="floating-label">
              <input
                v-model="registerForm.password"
                type="password"
                placeholder="密码"
                class="input input-md border-0 bg-base-200 min-w-full"
              />
              <span>密码</span>
            </label>
            <label class="floating-label">
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="确认密码"
                class="input input-md border-0 bg-base-200 min-w-full"
              />
              <span>确认密码</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input v-model="agreeTerms" type="checkbox" class="checkbox checkbox-primary" />
              <span class="ml-2">我同意服务条款和隐私政策</span>
            </label>
            <button class="btn btn-primary" :disabled="!canRegister || isLoading" @click="handleRegister">
              <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
              {{ isLoading ? '注册中...' : '注册' }}
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Token刷新提示对话框 -->
    <dialog ref="refreshDialog" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Token即将过期</h3>
        <p class="py-4">您的登录状态即将过期，是否刷新Token以保持登录？</p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="handleRefreshDecline">稍后</button>
          <button class="btn btn-primary" @click="handleRefreshToken">刷新Token</button>
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

// 发送验证码
const handleSendCode = async (type: 'register' | 'forgot') => {
  const email = type === 'register' ? registerForm.value.email : '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    toast.error('请输入有效的邮箱地址');
    return;
  }

  try {
    const response = await AuthApi.sendVerificationCode({ email });
    if (response.success && response.data) {
      registerForm.value.session = response.data.session;

      // 开始倒计时
      codeCooldown.value = 60;
      codeCooldownTimer.value = setInterval(() => {
        codeCooldown.value--;
        if (codeCooldown.value <= 0 && codeCooldownTimer.value) {
          clearInterval(codeCooldownTimer.value);
          codeCooldownTimer.value = null;
        }
      }, 1000);

      toast.success('验证码已发送到您的邮箱');
    } else {
      toast.error(response.message || '发送验证码失败');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '发送验证码失败';
    toast.error(errorMessage);
  }
};

// 登录
const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    toast.error('请输入邮箱和密码');
    return;
  }

  isLoading.value = true;
  const result = await authStore.login(loginForm.value);
  isLoading.value = false;

  if (result.success) {
    router.push('/');
  } else {
    toast.error(result.message || '登录失败');
  }
};

// 注册
const handleRegister = async () => {
  if (!canRegister.value) {
    return;
  }

  if (registerForm.value.password.length < 6) {
    toast.error('密码长度至少6位');
    return;
  }

  isLoading.value = true;
  const result = await authStore.register(registerForm.value);
  isLoading.value = false;

  if (result?.success) {
    toast.success(result?.message || '注册成功');
    activeTab.value = 'login';
    loginForm.value.email = registerForm.value.email;
  } else {
    toast.error(result?.message || '注册失败');
  }
};

// Token刷新
const handleRefreshToken = async () => {
  refreshDialog.value?.close();
  const result = await authStore.refreshToken();
  if (result.success) {
    toast.success('Token刷新成功');
  } else {
    toast.error('Token刷新失败，请重新登录');
    router.push('/auth/login');
  }
};
const handleRefreshDecline = () => {
  refreshDialog.value?.close();
};

// 检查Token是否即将过期
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
