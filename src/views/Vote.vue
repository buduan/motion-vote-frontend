<template>
  <div class="min-h-screen bg-base-100 p-4 md:p-8">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="max-w-2xl mx-auto mt-8">
      <div role="alert" class="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- 投票主界面 -->
    <div v-else class="max-w-5xl mx-auto space-y-6">
      <!-- 用户信息栏 -->
      <div role="alert" class="alert alert-soft bg-base-200">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-info shrink-0">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
          <div class="flex items-center gap-2">
            <span class="font-medium">参与者:</span>
            <span class="badge badge-primary badge-lg">{{ participantNumber || '未设置' }}</span>
          </div>
          <div class="divider divider-horizontal hidden sm:flex"></div>
          <span class="text-base-content/70">{{ (activityInfo as any)?.name || activityInfo?.title || '加载中...' }}</span>
        </div>
      </div>

      <!-- 辩题信息卡片 -->
      <div class="card card-border bg-base-200">
        <div class="card-body">
          <!-- 活动标题 -->
          <div class="text-center space-y-2">
            <div class="flex items-center justify-center gap-2">
              <span
                class="badge badge-lg"
                :class="{
                  'badge-success': ['ongoing', 'active'].includes(currentDebate?.status as string),
                  'badge-info': (currentDebate?.status as string) === 'final_vote',
                  'badge-warning': currentDebate?.status === 'pending',
                  'badge-error': currentDebate?.status === 'ended',
                }"
              >
                {{ getDebateStatusText(currentDebate?.status) }}
              </span>
            </div>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
              <span class="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent">
                {{ currentDebate?.title || '暂无辩题' }}
              </span>
            </h1>
          </div>

          <!-- 背景信息 -->
          <div v-if="currentDebate?.background" class="collapse collapse-arrow bg-base-100 mt-4">
            <input type="checkbox" />
            <div class="collapse-title font-semibold">
              📋 背景信息
            </div>
            <div class="collapse-content">
              <p class="text-base-content/70">{{ currentDebate.background }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 投票区域 -->
      <div v-if="['ongoing', 'active', 'final_vote'].includes(currentDebate?.status as string)">
        <!-- 投票按钮 - 横向并列各占一半，黄金比例 1.618:1 -->
        <div class="grid grid-cols-2 gap-0">
          <!-- 正方按钮 - 左半边 -->
          <button
            @click="vote('pro')"
            :disabled="isVoting || voteStatus?.currentVote?.position === 'pro'"
            class="btn btn-info btn-lg flex flex-col items-center justify-center gap-4 p-8 rounded-r-none border-0"
            :class="{
              'btn-active ring-4 ring-info ring-inset': voteStatus?.currentVote?.position === 'pro',
              'btn-disabled opacity-60': isVoting
            }"
            style="aspect-ratio: 1.618 / 1; width: 100%; height: auto;"
          >
            <svg
              v-if="voteStatus?.currentVote?.position === 'pro'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-16 w-16 md:h-20 md:w-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-16 w-16 md:h-20 md:w-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span class="text-3xl md:text-5xl font-black">正方</span>
            <span v-if="voteStatus?.currentVote?.position === 'pro'" class="text-lg md:text-xl font-normal">✓ 已投票</span>
          </button>

          <!-- 反方按钮 - 右半边 -->
          <button
            @click="vote('con')"
            :disabled="isVoting || voteStatus?.currentVote?.position === 'con'"
            class="btn btn-error btn-lg flex flex-col items-center justify-center gap-4 p-8 rounded-l-none border-0"
            :class="{
              'btn-active ring-4 ring-error ring-inset': voteStatus?.currentVote?.position === 'con',
              'btn-disabled opacity-60': isVoting
            }"
            style="aspect-ratio: 1.618 / 1; width: 100%; height: auto;"
          >
            <svg
              v-if="voteStatus?.currentVote?.position === 'con'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-16 w-16 md:h-20 md:w-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-16 w-16 md:h-20 md:w-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
            <span class="text-3xl md:text-5xl font-black">反方</span>
            <span v-if="voteStatus?.currentVote?.position === 'con'" class="text-lg md:text-xl font-normal">✓ 已投票</span>
          </button>
        </div>

        <!-- 投票提示信息 -->
        <div role="alert" class="alert alert-info alert-soft mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="stroke-current shrink-0 w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span v-if="!voteStatus?.hasVoted">💡 请选择您支持的立场进行投票</span>
          <span v-else-if="voteStatus?.canChangeVote">✏️ 您已投票，可以修改投票</span>
          <span v-else>🔒 您已投票，投票已锁定</span>
        </div>
      </div>

      <!-- 辩题未开始或已结束提示 -->
      <div v-else role="alert" class="alert alert-warning">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current shrink-0 w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span>{{ currentDebate?.status === 'pending' ? '⏳ 投票尚未开始' : '🏁 投票已结束' }}</span>
      </div>
    </div>

    <!-- Toast 通知 -->
    <div v-if="toast.show" class="toast toast-top toast-center z-50">
      <div
        role="alert"
        class="alert shadow-lg"
        :class="{
          'alert-success': toast.type === 'success',
          'alert-error': toast.type === 'error',
          'alert-info': toast.type === 'info',
        }"
      >
        <svg
          v-if="toast.type === 'success'"
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <svg
          v-else-if="toast.type === 'error'"
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current shrink-0 w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { VotesApi } from '@/api/votes';
import { ActivitiesApi } from '@/api/activities';
import { HttpClient } from '@/utils/http';
import type { Debate, VoteStatus, VoteResults, ActivityDetail } from '@/types/api';

const route = useRoute();

// 响应式数据
const loading = ref(true);
const error = ref('');
const isVoting = ref(false);
const showResults = ref(false);

const activityInfo = ref<ActivityDetail | null>(null);
const currentDebate = ref<Debate | null>(null);
const voteStatus = ref<VoteStatus | null>(null);
const voteResults = ref<VoteResults | null>(null);
const sessionToken = ref<string>(''); // 会话令牌

// Toast 通知
const toast = ref({
  show: false,
  message: '',
  type: 'info' as 'success' | 'error' | 'info',
});

// 从URL或localStorage获取参数
const activityId = computed(() => {
  const fromQuery = route.query.activityId as string || route.query.activityID as string;
  const fromStorage = localStorage.getItem('activityId');
  const result = fromQuery || fromStorage || '';
  console.log('[Vote Page] Activity ID:', {
    fromQuery,
    fromStorage,
    result,
    allQueryParams: route.query
  });
  return result;
});

const participantNumber = computed(() => {
  const fromQuery = route.query.participantNumber as string;
  const fromStorage = localStorage.getItem('participantNumber');
  const result = fromQuery || fromStorage || '';
  console.log('[Vote Page] Participant Number:', {
    fromQuery,
    fromStorage,
    result
  });
  return result;
});

const debateId = computed(() => {
  const fromQuery = route.query.debateId as string || route.query.debateID as string;
  const fromStorage = localStorage.getItem('debateId');
  const result = fromQuery || fromStorage || '';
  console.log('[Vote Page] Debate ID:', {
    fromQuery,
    fromStorage,
    result
  });
  return result;
});

// 显示Toast
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// 获取辩题状态文本
const getDebateStatusText = (status?: string) => {
  switch (status) {
    case 'ongoing':
    case 'active':
      return '投票中';
    case 'final_vote':
      return '最终投票';
    case 'pending':
      return '未开始';
    case 'ended':
      return '已结束';
    default:
      return '未知';
  }
};

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    error.value = '';

    console.log('[Vote Page] Loading data...', {
      activityId: activityId.value,
      participantNumber: participantNumber.value,
      debateId: debateId.value
    });

    if (!activityId.value) {
      const errorMsg = '缺少活动ID';
      console.error('[Vote Page] Error:', errorMsg);
      console.log('[Vote Page] Debug Info:', {
        route: route.fullPath,
        query: route.query,
        params: route.params,
        localStorage_activityId: localStorage.getItem('activityId')
      });
      error.value = errorMsg;
      return;
    }

    console.log('[Vote Page] Fetching activity info for ID:', activityId.value);
    // 获取活动信息
    const activityResponse = await ActivitiesApi.getActivityById(activityId.value);
    console.log('[Vote Page] Activity response:', activityResponse);
    
    // 适配后端返回的数据结构
    const rawData = activityResponse as any;
    
    // 检查是否是直接返回的数据（没有 success 字段）
    if (rawData && !rawData.success) {
      // 后端直接返回数据，没有包装在 ApiResponse 中
      activityInfo.value = {
        ...rawData,
        title: rawData.name || rawData.title, // 适配 name 字段
        debates: rawData.debates || (rawData.current_debate ? [rawData.current_debate] : [])
      } as any;
      console.log('[Vote Page] Activity info loaded (direct response):', activityInfo.value);

      // 获取当前辩题
      if (rawData.current_debate) {
        currentDebate.value = rawData.current_debate;
        console.log('[Vote Page] Current debate from current_debate field:', currentDebate.value);
        console.log('[Vote Page] Debate status:', currentDebate.value?.status);
        console.log('[Vote Page] Debate status type:', typeof currentDebate.value?.status);
      } else if (rawData.debates) {
        const debates = rawData.debates;
        console.log('[Vote Page] All debates:', debates);
        
        if (debateId.value) {
          currentDebate.value = debates.find((d: any) => d.id === debateId.value) || 
                               debates.find((d: any) => d.status === 'ongoing' || d.status === 'active' || d.status === 'final_vote') || 
                               null;
        } else {
          currentDebate.value = debates.find((d: any) => d.status === 'ongoing' || d.status === 'active' || d.status === 'final_vote') || 
                               debates[0] || 
                               null;
        }
      }
      console.log('[Vote Page] Current debate:', currentDebate.value);
    } else if (activityResponse.success && activityResponse.data) {
      // 标准的 ApiResponse 包装
      activityInfo.value = activityResponse.data;
      console.log('[Vote Page] Activity info loaded:', activityInfo.value);

      // 获取当前活跃的辩题
      const debates = activityResponse.data.debates;
      console.log('[Vote Page] All debates:', debates);
      
      if (debateId.value) {
        currentDebate.value = debates.find(d => d.id === debateId.value) || 
                             debates.find(d => ['ongoing', 'active', 'final_vote'].includes(d.status as string)) || 
                             null;
      } else {
        currentDebate.value = debates.find(d => ['ongoing', 'active', 'final_vote'].includes(d.status as string)) || 
                             debates[0] || 
                             null;
      }
      console.log('[Vote Page] Current debate:', currentDebate.value);
    }

    // 如果有参与者信息和辩题，加载投票状态
    if (participantNumber.value && currentDebate.value) {
      // 先尝试参与者入场获取 sessionToken
      if (!sessionToken.value) {
        console.log('[Vote Page] Attempting participant check-in...');
        try {
          const enterResponse = await HttpClient.post('/votes/enter', {
            activityId: activityId.value,
            participantCode: participantNumber.value,
          });
          console.log('[Vote Page] Enter response:', enterResponse);
          if (enterResponse.data?.sessionToken) {
            sessionToken.value = enterResponse.data.sessionToken;
            console.log('[Vote Page] Session token obtained:', sessionToken.value);
          }
        } catch (err) {
          console.error('[Vote Page] Failed to enter/check-in:', err);
        }
      }

      // 如果有 sessionToken，获取投票状态
      if (sessionToken.value) {
        console.log('[Vote Page] Fetching vote status...');
        try {
          const statusResponse = await VotesApi.getVoteStatus(
            currentDebate.value.id,
            sessionToken.value
          );
          console.log('[Vote Page] Vote status response:', statusResponse);
          if (statusResponse.success) {
            voteStatus.value = statusResponse.data || null;
          }
        } catch (err) {
          console.error('[Vote Page] Failed to get vote status:', err);
        }
      }

      // 加载投票结果（如果需要）
      console.log('[Vote Page] Fetching vote results...');
      try {
        const resultsResponse = await VotesApi.getVoteResults(
          currentDebate.value.id
        );
        console.log('[Vote Page] Vote results response:', resultsResponse);
        if (resultsResponse.success) {
          voteResults.value = resultsResponse.data || null;
          showResults.value = true;
        }
      } catch (err) {
        console.error('[Vote Page] Failed to get vote results:', err);
      }
    } else {
      console.log('[Vote Page] Skipping vote status/results - missing participant or debate:', {
        hasParticipant: !!participantNumber.value,
        hasDebate: !!currentDebate.value
      });
    }
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.message || '加载数据失败';
    console.error('[Vote Page] Load data error:', err);
    console.error('[Vote Page] Error details:', {
      message: errorMsg,
      response: err.response,
      stack: err.stack
    });
    error.value = errorMsg;
  } finally {
    loading.value = false;
    console.log('[Vote Page] Loading completed');
  }
};

// 投票函数
const vote = async (position: 'pro' | 'con') => {
  console.log('[Vote Page] Vote button clicked:', position);
  
  if (!activityId.value || !participantNumber.value || !currentDebate.value) {
    const missingParams = [];
    if (!activityId.value) missingParams.push('activityId');
    if (!participantNumber.value) missingParams.push('participantNumber');
    if (!currentDebate.value) missingParams.push('currentDebate');
    
    console.error('[Vote Page] Missing required parameters:', missingParams);
    showToast('缺少必要参数: ' + missingParams.join(', '), 'error');
    return;
  }

  if (isVoting.value) {
    console.log('[Vote Page] Already voting, skipping...');
    return;
  }

  try {
    isVoting.value = true;
    
    // 检查是否有 sessionToken
    if (!sessionToken.value) {
      console.error('[Vote Page] Missing sessionToken, cannot vote');
      showToast('缺少会话令牌，请刷新页面重试', 'error');
      return;
    }
    
    console.log('[Vote Page] Submitting vote...', {
      debateId: currentDebate.value.id,
      sessionToken: sessionToken.value,
      position
    });

    const response = await VotesApi.submitVote(
      currentDebate.value.id,
      sessionToken.value,
      position
    );

    console.log('[Vote Page] Vote response:', response);

    if (response.success) {
      const message = position === 'pro' ? '已投票支持正方' : '已投票支持反方';
      console.log('[Vote Page] Vote successful:', message);
      showToast(message, 'success');

      // 重新加载投票状态和结果
      console.log('[Vote Page] Reloading data after vote...');
      await loadData();
    }
  } catch (err: any) {
    console.error('[Vote Page] Vote error:', err);
    console.error('[Vote Page] Error details:', {
      message: err.message,
      response: err.response,
      stack: err.stack
    });
    showToast(
      err.response?.data?.message || err.message || '投票失败',
      'error'
    );
  } finally {
    isVoting.value = false;
    console.log('[Vote Page] Vote process completed');
  }
};

// 组件挂载时加载数据
onMounted(() => {
  console.log('[Vote Page] Component mounted');
  console.log('[Vote Page] Current route:', {
    fullPath: route.fullPath,
    path: route.path,
    query: route.query,
    params: route.params
  });
  loadData();
});
</script>

<style scoped>
/* daisyUI components with Tailwind utilities */
</style>
