<template>
  <div class="card card-border bg-base-100 shadow-md hover:shadow-lg transition-shadow">
    <!-- Card Header with Image -->
    <figure v-if="activity.coverImage" class="h-48">
      <img :src="activity.coverImage" :alt="activity.name" class="w-full h-full object-cover" />
    </figure>

    <!-- Card Body -->
    <div class="card-body">
      <!-- Title and Status Badge -->
      <div class="flex items-start justify-between gap-2">
        <h2 class="card-title text-lg">{{ activity.name }}</h2>
        <span :class="statusBadgeClass">{{ statusText }}</span>
      </div>

      <!-- Description -->
      <p class="text-sm text-base-content/70 line-clamp-2">{{ activity.description }}</p>

      <!-- Activity Info -->
      <div class="space-y-2 mt-2">
        <div class="flex items-center gap-2 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span class="text-base-content/70">{{ formatDate(activity.startTime) }}</span>
        </div>

        <div class="flex items-center gap-2 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-base-content/70">{{ activity.location }}</span>
        </div>

        <div class="flex items-center gap-2 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span class="text-base-content/70"
            >{{ activity.currentParticipants || 0 }} 参与者</span
          >
        </div>
      </div>

      <!-- Tags -->
      <div v-if="activity.tags && activity.tags.length" class="flex flex-wrap gap-2 mt-3">
        <span v-for="tag in activity.tags" :key="tag" class="badge badge-outline badge-sm">{{ tag }}</span>
      </div>

      <!-- Current Debate Info -->
      <div v-if="currentDebate" class="mt-3 p-3 bg-base-200 rounded-lg">
        <div class="text-xs text-base-content/60 mb-1">当前辩题</div>
        <div class="text-sm font-medium">{{ currentDebate.title }}</div>
      </div>

      <!-- Card Actions -->
      <div class="card-actions justify-between mt-4 pt-4 border-t border-base-content/10">
        <!-- Left Side Actions -->
        <div class="flex gap-2">
          <button class="btn btn-sm btn-primary" @click="$emit('switch-debate', activity)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            切换辩题
          </button>

          <button class="btn btn-sm btn-outline" @click="$emit('manage-debates', activity)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            辩题管理
          </button>
        </div>

        <!-- Dropdown Menu -->
        <details class="dropdown dropdown-end">
          <summary class="btn btn-sm btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </summary>
          <ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-content/10">
            <li>
              <button @click="$emit('manage-participants', activity)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                参与者管理
              </button>
            </li>
            <li>
              <button @click="$emit('manage-collaborators', activity)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                协作者管理
              </button>
            </li>
            <li class="divider"></li>
            <li>
              <button @click="$emit('view-detail', activity)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                查看详情
              </button>
            </li>
            <li>
              <button @click="$emit('edit', activity)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                编辑活动
              </button>
            </li>
            <li>
              <button class="text-error" @click="$emit('delete', activity)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                删除活动
              </button>
            </li>
          </ul>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Activity, Debate } from '@/types/api';

interface Props {
  activity: Activity;
  currentDebate?: Debate | null;
}

const props = defineProps<Props>();

defineEmits<{
  'switch-debate': [activity: Activity];
  'manage-debates': [activity: Activity];
  'manage-participants': [activity: Activity];
  'manage-collaborators': [activity: Activity];
  'view-detail': [activity: Activity];
  edit: [activity: Activity];
  delete: [activity: Activity];
}>();

const statusBadgeClass = computed(() => {
  const baseClass = 'badge badge-sm';
  switch (props.activity.status) {
    case 'ongoing':
      return `${baseClass} badge-success`;
    case 'upcoming':
      return `${baseClass} badge-info`;
    case 'ended':
      return `${baseClass} badge-neutral`;
    default:
      return baseClass;
  }
});

const statusText = computed(() => {
  switch (props.activity.status) {
    case 'ongoing':
      return '进行中';
    case 'upcoming':
      return '未开始';
    case 'ended':
      return '已结束';
    default:
      return '未知';
  }
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>
