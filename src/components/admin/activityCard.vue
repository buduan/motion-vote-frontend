<template>
  <div class="activity-card">
    <h2 class="text-lg font-bold">{{ activity.title }}</h2>
    <p class="text-sm text-gray-500">Status: {{ activity.status }}</p>
    <p class="text-sm text-gray-500">Created At: {{ activity.createdAt }}</p>
    <p class="text-sm text-gray-500">Created By: {{ activity.createdBy }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  activity: {
    type: Object,
    default: () => ({
      title: '',
      status: '',
      createdAt: '',
      createdBy: '',
    }),
  },
});
</script>
