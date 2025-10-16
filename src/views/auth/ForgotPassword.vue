<template>
  <div class="login-page bg-base-200">
    <h1 class="text-4xl font-bold mb-8">Motion Vote</h1>
    <div class="card w-96 bg-base-100 shadow-base-300 shadow-2xl">
      <div class="card-body">
        <h2 class="card-title mb-4">重置密码</h2>
        <div class="flex flex-col gap-4">
          <label class="floating-label">
            <input
              v-model="form.email"
              type="email"
              placeholder="邮箱"
              class="input input-md border-0 bg-base-200 min-w-full"
            />
            <span>邮箱</span>
          </label>
          <div class="flex flex-row gap-2">
            <label class="floating-label w-full">
              <input v-model="form.code" type="text" placeholder="验证码" class="input input-md border-0 bg-base-200" />
              <span>验证码</span>
            </label>
            <button class="btn btn-primary" :disabled="!canSendCode || codeCooldown > 0" @click="handleSendCode">
              {{ codeCooldown > 0 ? `${codeCooldown}s` : '发送验证码' }}
            </button>
          </div>

          <label class="floating-label">
            <input
              v-model="form.newPassword"
              type="password"
              placeholder="新密码"
              class="input input-md border-0 bg-base-200 min-w-full"
            />
            <span>新密码</span>
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
          <div class="flex justify-between items-center gap-2">
            <router-link to="/auth/login" class="link link-info text-sm">返回登录</router-link>
            <button class="btn btn-primary" :disabled="!canReset || isLoading" @click="handleResetPassword">
              <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
              {{ isLoading ? '重置中...' : '重置密码' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { AuthApi } from '@/api/auth';
import toast from '@/utils/toast';

const router = useRouter();

// 表单数据
const form = ref({
  email: '',
  code: '',
  newPassword: '',
  session: '',
});

const confirmPassword = ref('');
const isLoading = ref(false);

// 验证码相关
const codeCooldown = ref(0);
const codeCooldownTimer = ref<ReturnType<typeof setInterval> | null>(null);

// 计算属性
const canSendCode = computed(() => {
  return form.value.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email);
});

const canReset = computed(() => {
  return (
    form.value.email &&
    form.value.code &&
    form.value.newPassword &&
    confirmPassword.value &&
    form.value.newPassword === confirmPassword.value &&
    form.value.session
  );
});

// 发送验证码
const handleSendCode = async () => {
  if (!canSendCode.value) {
    toast.error('请输入有效的邮箱地址');
    return;
  }

  try {
    const response = await AuthApi.sendVerificationCode({ email: form.value.email });
    if (response.success && response.data) {
      form.value.session = response.data.session;

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

// 重置密码
const handleResetPassword = async () => {
  if (!canReset.value) {
    return;
  }

  if (form.value.newPassword.length < 6) {
    toast.error('密码长度至少6位');
    return;
  }

  isLoading.value = true;
  try {
    const response = await AuthApi.forgotPassword(form.value);
    if (response.success) {
      toast.success('密码重置成功，请使用新密码登录');
      router.push('/auth/login');
    } else {
      toast.error(response.message || '密码重置失败');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '密码重置失败';
    toast.error(errorMessage);
  } finally {
    isLoading.value = false;
  }
}; // 生命周期
onUnmounted(() => {
  if (codeCooldownTimer.value) {
    clearInterval(codeCooldownTimer.value);
  }
});
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
</style>
