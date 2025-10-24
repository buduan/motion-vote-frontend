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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VotesApi } from '@/api/votes';
import { setCookie } from '@/utils/cookie';
import toast from '@/utils/toast';

const route = useRoute();
const router = useRouter();

// State
const loading = ref(true);
const error = ref('');
const success = ref(false);
const activityName = ref('');
const participantCode = ref('');

// 参与者入场处理
const handleEnter = async () => {
  try {
    loading.value = true;
    error.value = '';
    success.value = false;

    // 获取 participantID
    const participantId = (route.query.participantID as string) || (route.query.participantId as string);
    console.log('[Participant] URL查询参数:', route.query);
    console.log('[Participant] 解析的participantId:', participantId);

    if (!participantId) {
      const errorMsg = '缺少参与者ID参数';
      console.error('[Participant] 错误:', errorMsg);
      error.value = errorMsg;
      return;
    }

    console.log('[Participant] 开始调用入场API，participantId:', participantId);

    // 调用新的入场接口（通过 participantID 直接入场）
    const enterResponse = await VotesApi.participantEnterById(participantId);
    console.log('[Participant] API响应 - 完整响应:', enterResponse);
    console.log('[Participant] API响应 - success:', enterResponse.success);
    console.log('[Participant] API响应 - message:', enterResponse.message);
    console.log('[Participant] API响应 - data:', enterResponse.data);

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
      console.error('[Participant] 响应数据结构:', enterResponse.data);
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

    // 1秒后跳转到投票页面（简化的URL，不带 debateID）
    setTimeout(() => {
      const targetUrl = {
        path: '/vote',
        query: {
          activityId: activityId,
          participantCode: code,
        },
      };
      console.log('[Participant] 跳转到投票页面:', targetUrl);
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
    console.log('[Participant] 处理完成，loading状态:', loading.value);
  }
};

// 重试
const retry = () => {
  handleEnter();
};

// 组件挂载时自动调用入场接口
onMounted(() => {
  handleEnter();
});
</script>

<style scoped>
/* daisyUI components with Tailwind utilities */
</style>
