<template>
  <div class="min-h-screen bg-base-100 p-4 md:p-8">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="max-w-2xl mx-auto mt-8">
      <div role="alert" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
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
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div class="flex items-center gap-2 text-sm">
          <span class="font-medium">活动：</span>
          <span class="badge badge-primary badge-lg">{{ activityInfo?.name || '加载中...' }}</span>
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
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-base-content">为当前辩题投票</h1>
          </div>

          <!-- 背景信息 - 隐藏具体辩题内容 -->
          <!-- <div v-if="currentDebate?.background" class="collapse collapse-arrow bg-base-100 mt-4">
            <input type="checkbox" />
            <div class="collapse-title font-semibold">📋 背景信息</div>
            <div class="collapse-content">
              <p class="text-base-content/70">{{ currentDebate.background }}</p>
            </div>
          </div> -->
        </div>
      </div>

      <!-- 投票区域 -->
      <div v-if="['ongoing', 'active', 'final_vote'].includes(currentDebate?.status as string)">
        <!-- 如果没有sessionToken，显示提示 -->
        <div v-if="!sessionToken" class="alert alert-warning mb-4">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span>请通过参与者页面进入以参与投票</span>
        </div>

        <!-- 投票按钮 - 横向并列各占一半，黄金比例 1.618:1 -->
        <div class="grid grid-cols-2 gap-0">
          <!-- 正方按钮 - 左半边 -->
          <button
            class="btn btn-info btn-lg flex flex-col items-center justify-center gap-4 p-8 rounded-r-none border-0"
            :disabled="!sessionToken || isVoting || isLastVotedPosition('pro')"
            :class="{
              'btn-disabled opacity-60': !sessionToken || isVoting || isLastVotedPosition('pro'),
            }"
            style="aspect-ratio: 1.618 / 1; width: 100%; height: auto"
            @click="vote('pro')"
          >
            <svg
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
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            <span class="text-3xl md:text-5xl font-black">正方</span>
          </button>

          <!-- 反方按钮 - 右半边 -->
          <button
            :disabled="!sessionToken || isVoting || isLastVotedPosition('con')"
            class="btn btn-error btn-lg flex flex-col items-center justify-center gap-4 p-8 rounded-l-none border-0"
            :class="{
              'btn-disabled opacity-60': !sessionToken || isVoting || isLastVotedPosition('con'),
            }"
            style="aspect-ratio: 1.618 / 1; width: 100%; height: auto"
            @click="vote('con')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-16 w-16 md:h-20 md:w-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              transform="scale(-1,1)"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            <span class="text-3xl md:text-5xl font-black">反方</span>
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
          <div class="flex flex-col gap-1">
            <span v-if="!voteStatus?.hasVoted">💡 请选择您支持的立场进行投票</span>
            <span v-else-if="voteStatus?.remainingChanges !== undefined && voteStatus.remainingChanges > 0">
              🔄 剩余改票次数: {{ voteStatus.remainingChanges }}
            </span>
            <span v-else-if="voteStatus?.hasVoted">✅ 投票已完成</span>
            <span v-if="voteStatus?.currentVote?.position" class="text-xs opacity-75">
              📝 上次选择: {{ voteStatus.currentVote.position === 'pro' ? '正方' : '反方' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 辩题未开始或已结束提示 -->
      <div v-else role="alert" class="alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { VotesApi } from '@/api/votes';
import { ActivitiesApi } from '@/api/activities';
import { HttpClient } from '@/utils/http';
import { getCookie } from '@/utils/cookie';
import toast from '@/utils/toast';
import type { Debate, VoteStatus, VoteStats, ActivityDetail } from '@/types/api';

const route = useRoute();

// 响应式数据
const loading = ref(true);
const error = ref('');
const isVoting = ref(false);
const showResults = ref(false);

const activityInfo = ref<ActivityDetail | null>(null);
const currentDebate = ref<Debate | null>(null);
const voteStatus = ref<VoteStatus | null>(null);
const VoteStats = ref<VoteStats | null>(null);

// 从 Cookie 读取 sessionToken
const sessionToken = computed(() => getCookie('sessionToken') || '');

// 从URL或localStorage获取参数
const activityId = computed(() => {
  const fromQuery = (route.query.activityId as string) || (route.query.activityID as string);
  const fromStorage = localStorage.getItem('activityId');
  return fromQuery || fromStorage || '';
});

// debateId 不再从 URL 读取，只从活动中获取当前辩题

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

// Check if position is the last voted position
const isLastVotedPosition = (position: 'pro' | 'con') => {
  return voteStatus.value?.currentVote?.position === position;
};

// Auto refresh every 15 minutes
let refreshTimer: number | null = null;

const startAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  refreshTimer = window.setInterval(
    () => {
      window.location.reload();
    },
    15 * 60 * 1000,
  ); // 15 minutes
};

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    error.value = '';

    if (!activityId.value) {
      const errorMsg = 'Missing activity ID';
      error.value = errorMsg;
      toast.error(errorMsg);
      return;
    }

    // 检查是否有 sessionToken - 如果没有，仍然可以查看活动信息，但不能投票
    const hasSessionToken = !!sessionToken.value;
    if (!hasSessionToken) {
      console.warn('No session token found - user can view activity but cannot vote');
    }

    // 获取活动信息
    const activityData = await ActivitiesApi.getActivityById(activityId.value);

    // 设置活动信息
    activityInfo.value = activityData;

    // 获取当前辩题（从活动的辩题列表中找到正在进行的辩题）
    const debates = activityData.debates || [];
    currentDebate.value =
      debates.find((d: Debate) => ['ongoing', 'active', 'final_vote'].includes(d.status)) || debates[0] || null;

    // 如果有当前辩题，加载投票状态
    if (currentDebate.value) {
      // 只有在有sessionToken时才加载投票状态
      if (hasSessionToken) {
        try {
          const statusResponse = await HttpClient.get<VoteStatus>(`/votes/debates/${currentDebate.value.id}`, {
            params: { sessionToken: sessionToken.value },
          });
          if (statusResponse.success) {
            voteStatus.value = statusResponse.data || null;
          }
        } catch (err: unknown) {
          // Failed to get vote status - show warning toast
          const errorMsg =
            err && typeof err === 'object' && 'message' in err
              ? (err as { message: string }).message
              : 'Failed to get vote status';
          toast.warning(errorMsg);
        }
      }

      // 加载投票结果（如果需要）
      try {
        const resultsResponse = await VotesApi.getVoteStats(currentDebate.value.id);
        if (resultsResponse.success) {
          VoteStats.value = resultsResponse.data || null;
          showResults.value = true;
        }
      } catch {
        // Failed to get vote results - just log, don't show toast
        // as this is not critical
      }
    }
  } catch (err: unknown) {
    let errorMsg = 'Failed to load data';
    if (typeof err === 'object' && err !== null) {
      const e = err as { response?: { data?: { message?: string } }; message?: string; stack?: string };
      errorMsg = e.response?.data?.message || e.message || errorMsg;
    }
    error.value = errorMsg;
    toast.error(errorMsg);
  } finally {
    loading.value = false;
  }
};

// 投票函数
const vote = async (position: 'pro' | 'con') => {
  if (!activityId.value || !currentDebate.value) {
    const missingParams = [];
    if (!activityId.value) missingParams.push('activityId');
    if (!currentDebate.value) missingParams.push('currentDebate');

    toast.error('Missing required parameters: ' + missingParams.join(', '));
    return;
  }

  if (isVoting.value) {
    return;
  }

  try {
    isVoting.value = true;

    // 检查是否有 sessionToken（从 Cookie）
    if (!sessionToken.value) {
      toast.error('Missing session token, please enter via participant page');
      return;
    }

    const response = await VotesApi.submitVote(currentDebate.value.id, sessionToken.value, position);
    if (response.success) {
      toast.success(position === 'pro' ? 'Voted for Pro' : 'Voted for Con');

      // 直接更新本地状态，不刷新页面
      voteStatus.value = {
        hasVoted: true,
        currentVote: {
          position: position,
          votedAt: new Date().toISOString(),
        },
        canChangeVote: (response.data?.remaining_changes ?? 0) > 0,
        remainingChanges: response.data?.remaining_changes,
      };
    } else {
      toast.error(response.message || 'Failed to submit vote');
    }
  } catch (err: unknown) {
    let errorMsg = 'Failed to submit vote';
    if (typeof err === 'object' && err !== null) {
      const e = err as { response?: { data?: { message?: string } }; message?: string; stack?: string };
      errorMsg = e.response?.data?.message || e.message || errorMsg;
    }
    toast.error(errorMsg);
  } finally {
    isVoting.value = false;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadData();
  startAutoRefresh();
});

// 组件卸载时清理定时器
onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style scoped>
/* daisyUI components with Tailwind utilities */
</style>
