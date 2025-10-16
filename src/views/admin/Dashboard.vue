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
    id: 1,
    title: 'Activity 1',
    status: 'On-going',
    createdAt: '2023-01-01',
    createdBy: 'User 1',
  },
]);

const latestActivities = ref([
  {
    id: 2,
    title: 'Activity 2',
    status: 'Completed',
    createdAt: '2023-01-02',
    createdBy: 'User 2',
  },
]);
</script>

<style scoped>
/* */
</style>
