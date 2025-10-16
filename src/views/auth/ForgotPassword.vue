<template>
  <div class="login-page bg-base-200">
    <h1 class="text-4xl font-bold mb-8">Motion Vote</h1>
    <div class="card w-96 bg-base-100 shadow-base-300 shadow-2xl">
      <div class="card-body">
        <h2 class="card-title mb-4">Reset Password</h2>
        <div class="flex flex-col gap-4">
          <label class="floating-label">
            <input
              v-model="form.email"
              type="email"
              placeholder="Email"
              class="input input-md border-0 bg-base-200 min-w-full"
            />
            <span>Email</span>
          </label>
          <div class="flex flex-row gap-2">
            <label class="floating-label w-full">
              <input
                v-model="form.code"
                type="text"
                placeholder="Verification Code"
                class="input input-md border-0 bg-base-200"
              />
              <span>Code</span>
            </label>
            <button class="btn btn-primary" :disabled="!canSendCode || codeCooldown > 0" @click="handleSendCode">
              {{ codeCooldown > 0 ? `${codeCooldown}s` : 'Send Code' }}
            </button>
          </div>

          <label class="floating-label">
            <input
              v-model="form.newPassword"
              type="password"
              placeholder="New Password"
              class="input input-md border-0 bg-base-200 min-w-full"
            />
            <span>New Password</span>
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
          <div class="flex justify-between items-center gap-2">
            <router-link to="/auth/login" class="link link-info text-sm">Back to Login</router-link>
            <button class="btn btn-primary" :disabled="!canReset || isLoading" @click="handleResetPassword">
              <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
              {{ isLoading ? 'Resetting...' : 'Reset Password' }}
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

// Send verification code
const handleSendCode = async () => {
  if (!canSendCode.value) {
    toast.error('Please enter a valid email address');
    return;
  }

  try {
    const response = await AuthApi.sendVerificationCode(form.value.email);
    if (response.success && response.data) {
      form.value.session = response.data.session;

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

// Reset password
const handleResetPassword = async () => {
  if (!canReset.value) {
    return;
  }

  if (form.value.newPassword.length < 6) {
    toast.error('Password must be at least 6 characters');
    return;
  }

  isLoading.value = true;
  try {
    const response = await AuthApi.forgotPassword(form.value);
    if (response.success) {
      toast.success('Password reset successful, please login with your new password');
      router.push('/auth/login');
    } else {
      toast.error(response.message || 'Password reset failed');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
    toast.error(errorMessage);
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle
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
