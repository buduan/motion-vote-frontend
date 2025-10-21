<template>
  <div class="container mx-auto px-4 mt-8">
    <div>
      <h1 class="text-2xl font-bold">Dashboard</h1>
    </div>
    <div>
      <h3>On-going Activities</h3>
      <div v-for="activity in onGoingActivities" :key="activity.id">
        <ActivityCard :activity="activity" />
      </div>
    </div>
    <div>
      <h3>Latest Activities</h3>
      <div v-for="activity in latestActivities" :key="activity.id">
        <ActivityCard :activity="activity" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 管理后台首页组件逻辑
import { ref } from 'vue';
import ActivityCard from '@/components/admin/activityCard.vue';

const onGoingActivities = ref([
  {
    id: '1',
    name: 'Activity 1',
    description: 'Description for Activity 1',
    startTime: '2023-01-01T10:00:00Z',
    endTime: '2023-01-01T12:00:00Z',
    location: 'Location 1',
    status: 'ongoing' as const,
    currentParticipants: 10,
    ownerId: 'user1',
    owner: {
      id: 'user1',
      email: 'user1@example.com',
      name: 'User 1',
      role: 'admin' as const,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
]);

const latestActivities = ref([
  {
    id: '2',
    name: 'Activity 2',
    description: 'Description for Activity 2',
    startTime: '2023-01-02T10:00:00Z',
    endTime: '2023-01-02T12:00:00Z',
    location: 'Location 2',
    status: 'ended' as const,
    currentParticipants: 20,
    ownerId: 'user2',
    owner: {
      id: 'user2',
      email: 'user2@example.com',
      name: 'User 2',
      role: 'admin' as const,
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
    },
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
]);
</script>

<style scoped>
/* */
</style>
