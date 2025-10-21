<template>
  <div class="card bg-base-100 w-96 shadow-sm">
    <div class="card-body">
      <h2 class="card-title">
        {{ activity.title }}
        <div class="badge badge-primary">{{ activity.status }}</div>
      </h2>
      <p class="text-sm text-slate-500">Created At: {{ activity.createdAt }}</p>
      <p class="text-sm text-slate-500">Created By: {{ activity.createdBy }}</p>
      <div class="card-actions justify-end">
        <button class="btn btn-primary btn-sm">Show in screen</button>
        <button class="btn btn-sm">Control</button>
        <button class="btn btn-sm">Setup</button>
      </div>
    </div>
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
