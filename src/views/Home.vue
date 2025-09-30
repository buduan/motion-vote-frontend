<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Welcome to Debate System</h1>
    <div class="flex items-center gap-4">
      <button
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        @click="counterStore.increment()"
      >
        Count is: {{ counterStore.count }}
      </button>
      <p>Double count is: {{ counterStore.doubleCount }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore } from '../stores/counter';

const counterStore = useCounterStore();
</script>
