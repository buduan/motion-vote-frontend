<template>
  <div class="login-page bg-base-200">
    <h1 class="text-4xl font-bold mb-8">Motion Vote</h1>
    <div class="card w-96 bg-base-100 shadow-base-300 shadow-2xl">
      <div class="card-body">
        <div class="flex flex-col gap-4">
          <label class="floating-label">
            <input type="text" placeholder="Email" class="input input-md border-0 bg-base-200 min-w-full" />
            <span>Email</span>
          </label>
          <div class="flex flex-row gap-2">
            <label class="floating-label w-full">
              <input type="number" placeholder="Verify Code" class="input input-md border-0 bg-base-200" />
              <span>Verify Code</span>
            </label>
            <button class="btn btn-primary">Send Code</button>
          </div>

          <label class="floating-label">
            <input type="password" placeholder="Password" class="input input-md border-0 bg-base-200 min-w-full" />
            <span>Password</span>
          </label>
          <label class="floating-label">
            <input
              type="password"
              placeholder="Confirm Password"
              class="input input-md border-0 bg-base-200 min-w-full"
            />
            <span>Confirm Password</span>
          </label>
          <button class="btn btn-primary">Reset Password</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
//
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
}

.fade-leave-active {
  transition: opacity 0.15s ease-out;
}

.fade-enter-active {
  transition: opacity 0.15s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
