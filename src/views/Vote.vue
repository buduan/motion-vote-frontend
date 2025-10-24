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
        <div class="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
          <div class="flex items-center gap-2">
            <span class="font-medium">参与者:</span>
            <span class="badge badge-primary badge-lg">{{ participantCode || '未设置' }}</span>
          </div>
          <div class="divider divider-horizontal hidden sm:flex"></div>
          <span class="text-base-content/70">
            {{ activityInfo?.name || '加载中...' }}
          </span>
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
                为当前辩题投票
              </span>
            </h1>
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
        <!-- 投票按钮 - 横向并列各占一半，黄金比例 1.618:1 -->
        <div class="grid grid-cols-2 gap-0">
          <!-- 正方按钮 - 左半边 -->
          <button
            class="btn btn-info btn-lg flex flex-col items-center justify-center gap-4 p-8 rounded-r-none border-0"
            :disabled="isVoting || voteStatus?.currentVote?.position === 'pro'"
            :class="{
              'btn-active ring-4 ring-info ring-inset': voteStatus?.currentVote?.position === 'pro',
              'btn-disabled opacity-60': isVoting,
            }"
            style="aspect-ratio: 1.618 / 1; width: 100%; height: auto"
            @click="vote('pro')"
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
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            <span class="text-3xl md:text-5xl font-black">正方</span>
            <span v-if="voteStatus?.currentVote?.position === 'pro'" class="text-lg md:text-xl font-normal">
              ✓ 已投票
            </span>
          </button>

          <!-- 反方按钮 - 右半边 -->
          <button
            :disabled="isVoting || voteStatus?.currentVote?.position === 'con'"
            class="btn btn-error btn-lg flex flex-col items-center justify-center gap-4 p-8 rounded-l-none border-0"
            :class="{
              'btn-active ring-4 ring-error ring-inset': voteStatus?.currentVote?.position === 'con',
              'btn-disabled opacity-60': isVoting,
            }"
            style="aspect-ratio: 1.618 / 1; width: 100%; height: auto"
            @click="vote('con')"
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
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
              />
            </svg>
            <span class="text-3xl md:text-5xl font-black">反方</span>
            <span v-if="voteStatus?.currentVote?.position === 'con'" class="text-lg md:text-xl font-normal">
              ✓ 已投票
            </span>
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
import { ref, onMounted, computed } from 'vue';
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

const participantCode = computed(() => {
  const fromQuery = route.query.participantCode as string;
  const fromStorage = localStorage.getItem('participantCode');
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

    // 检查是否有 sessionToken
    if (!sessionToken.value) {
      error.value = 'Missing session token, please enter via participant page';
      toast.error('请通过参与者页面进入');
      return;
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
      // 刷新投票状态
      await loadData();
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
});
</script>

<style scoped>
/* daisyUI components with Tailwind utilities */
</style>
