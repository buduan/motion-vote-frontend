<template>
  <div class="min-h-screen bg-base-100 flex items-center justify-center p-4">
    <!-- 加载中状态 -->
    <div v-if="loading" class="text-center space-y-4">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      <p class="text-lg">正在验证身份...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="max-w-md w-full">
      <div role="alert" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div class="flex-1">
          <h3 class="font-bold">入场失败</h3>
          <div class="text-sm">{{ error }}</div>
        </div>
      </div>
      <button class="btn btn-primary btn-block mt-4" @click="retry">重试</button>
    </div>

    <!-- 成功状态 -->
    <div v-else-if="success" class="max-w-md w-full text-center space-y-4">
      <div role="alert" class="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>入场成功！正在跳转...</span>
      </div>
      <div class="text-base-content/70">
        <p class="mb-2">活动：{{ activityName }}</p>
        <p>参与者编号：{{ participantCode }}</p>
      </div>
    </div>

    <!-- PIN输入界面 -->
    <div v-else class="max-w-md w-full text-center space-y-6">
      <!-- 标题 -->
      <div class="space-y-2">
        <h1 class="text-2xl font-bold">参与者入场</h1>
        <p class="text-base-content/70">请输入您的6位参与者编号</p>
      </div>

      <!-- PIN输入框 -->
      <div class="space-y-4">
        <div class="flex justify-center gap-2">
          <input
            v-for="(_, index) in pinDigits"
            :key="index"
            :ref="(el: any) => (pinInputRefs[index] = el as HTMLInputElement)"
            v-model="pinDigits[index]"
            type="text"
            inputmode="numeric"
            pattern="[0-9]"
            maxlength="1"
            class="input input-bordered input-lg w-12 h-12 text-center text-xl font-mono"
            :class="{
              'input-primary': pinDigits[index],
              'input-error': hasError && !pinDigits[index],
            }"
            @input="handlePinInput(index, $event)"
            @keydown="handleKeyDown(index, $event)"
            @paste="handlePaste($event)"
          />
        </div>
        <div v-if="hasError" class="text-error text-sm">请输入完整的6位数字编号</div>
      </div>

      <!-- 提交按钮 -->
      <button class="btn btn-primary btn-block btn-lg" :disabled="!isPinComplete || isSubmitting" @click="handleSubmit">
        <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
        {{ isSubmitting ? '验证中...' : '进入活动' }}
      </button>

      <!-- 帮助信息 -->
      <div class="text-xs text-base-content/50">
        <p>参与者编号由活动组织者提供</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VotesApi } from '@/api/votes';
import { setCookie } from '@/utils/cookie';
import toast from '@/utils/toast';

const route = useRoute();
const router = useRouter();

// State
const loading = ref(false);
const error = ref('');
const success = ref(false);
const isSubmitting = ref(false);
const hasError = ref(false);
const activityName = ref('');
const participantCode = ref('');

// PIN输入相关
const pinDigits = ref<string[]>(['', '', '', '', '', '']);
const pinInputRefs = ref<(HTMLInputElement | null)[]>([]);

// 计算属性
const isPinComplete = computed(() => {
  return pinDigits.value.every(digit => digit !== '' && /^\d$/.test(digit));
});

const pinValue = computed(() => {
  return pinDigits.value.join('');
});

// PIN输入处理
const handlePinInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  // 只允许数字
  if (value && !/^\d$/.test(value)) {
    target.value = '';
    pinDigits.value[index] = '';
    return;
  }

  pinDigits.value[index] = value;
  hasError.value = false;

  // 自动跳转到下一个输入框
  if (value && index < 5) {
    nextTick(() => {
      const nextInput = pinInputRefs.value[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    });
  }
};

const handleKeyDown = (index: number, event: KeyboardEvent) => {
  // 退格键处理
  if (event.key === 'Backspace' && !pinDigits.value[index] && index > 0) {
    const prevInput = pinInputRefs.value[index - 1];
    if (prevInput) {
      prevInput.focus();
      pinDigits.value[index - 1] = '';
    }
  }

  // 左右箭头键导航
  if (event.key === 'ArrowLeft' && index > 0) {
    const prevInput = pinInputRefs.value[index - 1];
    if (prevInput) {
      prevInput.focus();
    }
  }

  if (event.key === 'ArrowRight' && index < 5) {
    const nextInput = pinInputRefs.value[index + 1];
    if (nextInput) {
      nextInput.focus();
    }
  }

  // 回车键提交
  if (event.key === 'Enter' && isPinComplete.value) {
    handleSubmit();
  }
};

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData('text') || '';
  const digits = pastedData.replace(/\D/g, '').slice(0, 6);

  if (digits.length > 0) {
    for (let i = 0; i < 6; i++) {
      pinDigits.value[i] = digits[i] || '';
    }

    // 聚焦到最后一个有值的输入框或第一个空的输入框
    const lastFilledIndex = digits.length - 1;
    const targetIndex = Math.min(lastFilledIndex + 1, 5);
    nextTick(() => {
      const targetInput = pinInputRefs.value[targetIndex];
      if (targetInput) {
        targetInput.focus();
      }
    });
  }
};

// 参与者入场处理
const handleEnter = async (participantId: string) => {
  try {
    loading.value = true;
    error.value = '';
    success.value = false;

    console.log('[Participant] 开始调用入场API，participantId:', participantId);

    // 调用新的入场接口（通过 participantID 直接入场）
    const enterResponse = await VotesApi.participantEnterById(participantId);
    console.log('[Participant] API响应 - 完整响应:', enterResponse);

    if (!enterResponse.success || !enterResponse.data) {
      const errorMsg = enterResponse.message || '入场失败';
      console.error('[Participant] 入场失败:', errorMsg);
      error.value = errorMsg;
      return;
    }

    const { session_token, activity, participant } = enterResponse.data;
    console.log('[Participant] 解析响应数据:');
    console.log('  - session_token:', session_token);
    console.log('  - activity:', activity);
    console.log('  - participant:', participant);

    if (!session_token) {
      const errorMsg = '未获取到会话令牌';
      console.error('[Participant] 错误:', errorMsg);
      error.value = errorMsg;
      return;
    }

    console.log('[Participant] 入场成功，准备存储sessionToken到Cookie');

    // 存储 sessionToken 到 Cookie（24小时过期）
    setCookie('sessionToken', session_token, 1);
    console.log('[Participant] sessionToken已存储到Cookie');

    // 保存信息用于显示和跳转
    const activityId = activity?.id || '';
    const code = participant?.code || '';
    activityName.value = activity?.name || '';
    participantCode.value = code;

    console.log('[Participant] 准备跳转信息:');
    console.log('  - activityId:', activityId);
    console.log('  - participantCode:', code);
    console.log('  - activityName:', activityName.value);

    // 标记成功
    success.value = true;
    console.log('[Participant] 标记成功状态，准备跳转');

    // 1秒后跳转到vote页面
    setTimeout(() => {
      const targetUrl = {
        path: '/vote',
        query: {
          activityId: activityId,
        },
      };
      console.log('[Participant] 跳转到vote页面:', targetUrl);
      router.push(targetUrl);
    }, 1000);
  } catch (err: unknown) {
    const errorMsg =
      err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : '入场失败，请稍后重试';
    console.error('[Participant] 异常捕获:', err);
    console.error('[Participant] 错误信息:', errorMsg);
    error.value = errorMsg;
    toast.error(errorMsg);
  } finally {
    loading.value = false;
    isSubmitting.value = false;
    console.log('[Participant] 处理完成，loading状态:', loading.value);
  }
};

// 提交处理
const handleSubmit = async () => {
  if (!isPinComplete.value) {
    hasError.value = true;
    return;
  }

  isSubmitting.value = true;
  hasError.value = false;

  await handleEnter(pinValue.value);
};

// 重试
const retry = () => {
  error.value = '';
  success.value = false;
  // 重置PIN输入
  pinDigits.value = ['', '', '', '', '', ''];
  hasError.value = false;

  // 如果有GET参数，重新预填
  const participantId = (route.query.participantID as string) || (route.query.participantId as string) || '';
  if (participantId && participantId.length === 6 && /^\d{6}$/.test(participantId)) {
    for (let i = 0; i < 6; i++) {
      pinDigits.value[i] = participantId[i] || '';
    }
  }
};

// 组件挂载时处理GET参数
onMounted(() => {
  // 检查是否有GET参数
  const participantId = (route.query.participantID as string) || (route.query.participantId as string) || '';
  console.log('[Participant] URL查询参数:', route.query);
  console.log('[Participant] 解析的participantId:', participantId);

  if (participantId) {
    // 如果有GET参数且是6位数字，预填到输入框
    if (participantId.length === 6 && /^\d{6}$/.test(participantId)) {
      for (let i = 0; i < 6; i++) {
        pinDigits.value[i] = participantId[i] || '';
      }
      // 自动提交
      nextTick(() => {
        handleSubmit();
      });
    } else {
      // 如果参数格式不正确，显示错误
      error.value = '参与者编号格式不正确，请输入6位数字';
    }
  }

  // 聚焦到第一个输入框
  nextTick(() => {
    const firstInput = pinInputRefs.value[0];
    if (firstInput) {
      firstInput.focus();
    }
  });
});
</script>

<style scoped>
/* 移除数字输入框的箭头 */
input[type='text']::-webkit-outer-spin-button,
input[type='text']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='text'] {
  -moz-appearance: textfield;
}
</style>
