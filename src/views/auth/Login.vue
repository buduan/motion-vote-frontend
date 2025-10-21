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
          <form v-if="activeTab === 'login'" class="flex flex-col gap-4" @submit.prevent="handleLogin">
            <label class="floating-label">
              <input
                v-model="loginForm.email"
                type="email"
                placeholder="Email"
                class="input input-md border-0 bg-base-200 min-w-full"
              />
              <span>Email</span>
            </label>
            <label class="floating-label">
              <input
                v-model="loginForm.password"
                type="password"
                placeholder="Password"
                class="input input-md border-0 bg-base-200 min-w-full"
              />
              <span>Password</span>
            </label>
            <div class="flex justify-between items-center">
              <router-link to="/auth/forgot-password" class="link link-info text-sm">Forgot Password?</router-link>
              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
                {{ isLoading ? 'Logging in...' : 'Login' }}
              </button>
            </div>
          </form>

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
                :disabled="!canSendCode || codeCooldown > 0 || isSendingCode"
                @click="handleSendCode('register')"
              >
                <span v-if="isSendingCode" class="loading loading-spinner loading-sm"></span>
                {{ isSendingCode ? 'Sending...' : codeCooldown > 0 ? `${codeCooldown}s` : 'Send Code' }}
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
            <!-- Password Validation Feedback -->
            <div v-if="registerForm.password" class="space-y-2">
              <!-- Password Strength Indicator -->
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold">Strength:</span>
                <div class="flex gap-1">
                  <div
                    v-for="i in 5"
                    :key="i"
                    :class="[
                      'h-1 w-3 rounded-full transition-colors',
                      i <= passwordStrength ? `bg-${passwordStrengthColor}` : 'bg-base-300',
                    ]"
                  />
                </div>
                <span :class="`text-sm font-semibold text-${passwordStrengthColor}`">
                  {{ passwordStrengthLabel }}
                </span>
              </div>

              <!-- Error Messages -->
              <div v-if="passwordValidation.errors.length" class="space-y-1">
                <div v-for="(error, idx) in passwordValidation.errors" :key="`error-${idx}`" class="text-sm text-error">
                  • {{ error }}
                </div>
              </div>

              <!-- Warning Messages -->
              <div v-if="passwordValidation.warnings.length" class="space-y-1">
                <div
                  v-for="(warning, idx) in passwordValidation.warnings"
                  :key="`warning-${idx}`"
                  class="text-sm text-warning"
                >
                  ⚠ {{ warning }}
                </div>
              </div>
            </div>

            <label class="floating-label">
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                class="input input-md border-0 bg-base-200 min-w-full"
                :class="confirmPassword && confirmPassword !== registerForm.password ? 'input-error' : ''"
              />
              <span>Confirm Password</span>
            </label>
            <!-- Password Match Validation -->
            <div v-if="confirmPassword && confirmPassword !== registerForm.password" class="text-sm text-error">
              • Passwords do not match
            </div>
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
import {
  validateRegisterPassword,
  getPasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from '@/utils/passwordValidator';

const router = useRouter();
const authStore = useAuthStore();

// Helper function to extract number from message and convert to English
const extractWaitTimeMessage = (message: string): string => {
  // Match patterns like "Please wait 60 seconds" or "wait 60 seconds" or "retry after 60 seconds"
  const numberMatch = message.match(/(\d+)/);
  if (numberMatch) {
    const seconds = numberMatch[1];
    return `Please wait ${seconds} seconds before requesting another code`;
  }
  // If no number found, return a generic message
  if (message.includes('wait') || message.includes('等待') || message.includes('稍后')) {
    return 'Please wait before requesting another code';
  }
  return message;
};

// Tab state
const activeTab = ref<'login' | 'register'>('login');

// Login form
const loginForm = ref({
  email: '',
  password: '',
});

// Register form
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

// Verification code related
const codeCooldown = ref(0);
const codeCooldownTimer = ref<ReturnType<typeof setInterval> | null>(null);
const isSendingCode = ref(false);

// Token refresh dialog
const refreshDialog = ref<HTMLDialogElement | null>(null);
const tokenCheckTimer = ref<ReturnType<typeof setInterval> | null>(null);

// Computed properties
const canSendCode = computed(() => {
  return registerForm.value.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.value.email);
});

// Password validation
const passwordValidation = computed(() => {
  return validateRegisterPassword(registerForm.value.password);
});

const passwordStrength = computed(() => {
  return getPasswordStrength(registerForm.value.password);
});

const passwordStrengthLabel = computed(() => {
  return getPasswordStrengthLabel(passwordStrength.value);
});

const passwordStrengthColor = computed(() => {
  return getPasswordStrengthColor(passwordStrength.value);
});

const passwordsMatch = computed(() => {
  return confirmPassword.value === registerForm.value.password;
});

const canRegister = computed(() => {
  return (
    registerForm.value.name &&
    registerForm.value.email &&
    passwordValidation.value.isValid &&
    passwordsMatch.value &&
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

  isSendingCode.value = true;
  const dismissLoading = toast.loading('Sending verification code...');

  try {
    const response = await AuthApi.sendVerificationCode(email);
    dismissLoading();

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
    dismissLoading();

    // Handle different error types
    let errorMessage = 'Failed to send verification code';

    if (error && typeof error === 'object') {
      // Check if it's a 422 error (validation error)
      if ('response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 422) {
          const rawMessage = axiosError.response?.data?.message || 'Please wait before requesting another code';
          errorMessage = extractWaitTimeMessage(rawMessage);
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if ('message' in error) {
        errorMessage = (error as { message: string }).message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);
  } finally {
    isSendingCode.value = false;
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
    // Redirect to admin page after successful login
    const redirect = (router.currentRoute.value.query.redirect as string) || '/admin';
    router.push(redirect);
  } else {
    toast.error(result.message || 'Login failed');
  }
};

// Register
const handleRegister = async () => {
  if (!canRegister.value) {
    return;
  }

  // Additional validation
  if (!passwordValidation.value.isValid) {
    toast.error(passwordValidation.value.errors[0] || 'Invalid password');
    return;
  }

  if (!passwordsMatch.value) {
    toast.error('Passwords do not match');
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

// Lifecycle
onMounted(() => {
  // If already logged in, redirect to admin page
  if (authStore.isAuthenticated) {
    router.push('/admin');
    return;
  }

  // Periodically check token status
  tokenCheckTimer.value = setInterval(checkTokenExpiry, 30000); // Check every 30 seconds
});

onUnmounted(() => {
  if (codeCooldownTimer.value) {
    clearInterval(codeCooldownTimer.value);
  }
  if (tokenCheckTimer.value) {
    clearInterval(tokenCheckTimer.value);
  }
});

// Listen for authentication state changes
watch(
  () => authStore.isAuthenticated,
  newVal => {
    if (newVal) {
      const redirect = (router.currentRoute.value.query.redirect as string) || '/admin';
      router.push(redirect);
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
