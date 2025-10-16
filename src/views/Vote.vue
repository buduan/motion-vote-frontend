<template>
  <div class="min-h-screen bg-base-100 p-4 md:p-8">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="max-w-2xl mx-auto mt-8">
      <div class="alert alert-error">
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
    <div v-else class="max-w-4xl mx-auto">
      <!-- 用户信息栏 -->
      <div class="alert bg-base-200 shadow-lg mb-4">
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-info shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="flex flex-col md:flex-row md:items-center md:gap-4 text-sm">
              <span class="font-semibold">参与者编号: <span class="font-number text-primary">{{ participantNumber || '未设置' }}</span></span>
              <span class="hidden md:inline text-base-content/50">|</span>
              <span>活动: {{ (activityInfo as any)?.name || activityInfo?.title || '加载中...' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 头部信息卡片 -->
      <div class="card bg-base-200 shadow-xl mb-6">
        <div class="card-body">
          <!-- 活动标题 -->
          <h2 class="text-2xl md:text-3xl font-bold text-center mb-2">
            {{ (activityInfo as any)?.name || activityInfo?.title || '加载中...' }}
          </h2>

          <!-- 辩题信息 -->
          <div class="divider"></div>
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-black text-center mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent">
            {{ currentDebate?.title || '暂无辩题' }}
          </h1>

          <!-- 辩题状态 -->
          <div class="flex justify-center items-center gap-2 mt-2">
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
            <!-- 调试信息 -->
            <span class="text-xs text-gray-400 ml-2">({{ currentDebate?.status || 'undefined' }})</span>
          </div>

          <!-- 辩题描述 -->
          <div v-if="currentDebate" class="mt-6 grid md:grid-cols-2 gap-4">
            <div class="p-4 bg-blue-50 rounded-lg">
              <h3 class="font-bold text-blue-600 mb-2">正方观点</h3>
              <p class="text-sm text-gray-700">{{ currentDebate.proDescription }}</p>
            </div>
            <div class="p-4 bg-red-50 rounded-lg">
              <h3 class="font-bold text-red-600 mb-2">反方观点</h3>
              <p class="text-sm text-gray-700">{{ currentDebate.conDescription }}</p>
            </div>
          </div>

          <!-- 背景信息 -->
          <div v-if="currentDebate?.background" class="mt-4 p-4 bg-base-100 rounded-lg">
            <h3 class="font-bold mb-2">背景信息</h3>
            <p class="text-sm text-gray-600">{{ currentDebate.background }}</p>
          </div>
        </div>
      </div>

      <!-- 投票按钮区域 -->
      <div v-if="['ongoing', 'active', 'final_vote'].includes(currentDebate?.status as string)" class="grid md:grid-cols-2 gap-4 mb-6">
        <!-- 正方按钮 -->
        <button
          @click="vote('pro')"
          :disabled="isVoting || voteStatus?.currentVote?.position === 'pro'"
          class="btn btn-lg h-32 md:h-40 bg-blue-400 hover:bg-blue-500 border-none text-white text-2xl md:text-3xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
          :class="{
            'ring-4 ring-blue-600': voteStatus?.currentVote?.position === 'pro',
            'opacity-50': isVoting
          }"
        >
          <div class="flex flex-col items-center gap-2">
            <svg
              v-if="voteStatus?.currentVote?.position === 'pro'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
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
            <span>正方</span>
            <span v-if="voteStatus?.currentVote?.position === 'pro'" class="text-sm font-normal">已投票</span>
          </div>
        </button>

        <!-- 反方按钮 -->
        <button
          @click="vote('con')"
          :disabled="isVoting || voteStatus?.currentVote?.position === 'con'"
          class="btn btn-lg h-32 md:h-40 bg-red-400 hover:bg-red-500 border-none text-white text-2xl md:text-3xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
          :class="{
            'ring-4 ring-red-600': voteStatus?.currentVote?.position === 'con',
            'opacity-50': isVoting
          }"
        >
          <div class="flex flex-col items-center gap-2">
            <svg
              v-if="voteStatus?.currentVote?.position === 'con'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
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
            <span>反方</span>
            <span v-if="voteStatus?.currentVote?.position === 'con'" class="text-sm font-normal">已投票</span>
          </div>
        </button>
      </div>

      <!-- 投票提示信息 -->
      <div v-if="['ongoing', 'active', 'final_vote'].includes(currentDebate?.status as string)" class="text-center text-sm text-gray-500 mb-6">
        <p v-if="!voteStatus?.hasVoted">请选择您支持的立场</p>
        <p v-else-if="voteStatus?.canChangeVote">您已投票，可以修改投票</p>
        <p v-else>您已投票，投票已锁定</p>
      </div>

      <!-- 辩题未开始或已结束提示 -->
      <div v-else class="alert alert-info">
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
        <span>{{ currentDebate?.status === 'pending' ? '投票尚未开始' : '投票已结束' }}</span>
      </div>

      <!-- 投票结果（可选显示） -->
      <div v-if="voteResults && showResults" class="card bg-base-200 shadow-xl mt-6">
        <div class="card-body">
          <h3 class="card-title">投票结果</h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-blue-600 font-semibold">正方</span>
                <span class="font-number">{{ voteResults.proPercentage.toFixed(1) }}%</span>
              </div>
              <progress
                class="progress progress-primary w-full"
                :value="voteResults.proVotes"
                :max="voteResults.totalVotes"
              ></progress>
            </div>
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-red-600 font-semibold">反方</span>
                <span class="font-number">{{ voteResults.conPercentage.toFixed(1) }}%</span>
              </div>
              <progress
                class="progress progress-error w-full"
                :value="voteResults.conVotes"
                :max="voteResults.totalVotes"
              ></progress>
            </div>
            <div class="text-center text-sm text-gray-500 mt-2">
              总投票数: {{ voteResults.totalVotes }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 通知 -->
    <div v-if="toast.show" class="toast toast-top toast-center">
      <div
        class="alert"
        :class="{
          'alert-success': toast.type === 'success',
          'alert-error': toast.type === 'error',
          'alert-info': toast.type === 'info',
        }"
      >
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
/* 自定义样式 */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-blue-600 {
  --tw-gradient-from: #2563eb;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(37, 99, 235, 0));
}

.via-purple-600 {
  --tw-gradient-stops: var(--tw-gradient-from), #9333ea, var(--tw-gradient-to, rgba(147, 51, 234, 0));
}

.to-red-600 {
  --tw-gradient-to: #dc2626;
}

.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

.text-transparent {
  color: transparent;
}
</style>
