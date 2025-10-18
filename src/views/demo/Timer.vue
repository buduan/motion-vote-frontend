<template>
  <div class="timer-demo">
    <div class="demo-container">
      <h1>辩论计时器测试 Demo</h1>

      <!-- 计时器显示区域 -->
      <div class="timer-section">
        <Timer ref="timerRef" :duration="duration" @timeup="handleTimeUp" />
      </div>

      <!-- 状态显示 -->
      <div class="status-section">
        <div class="status-item">
          <span class="label">运行状态:</span>
          <span :class="['status-value', timerRef?.isRunning ? 'running' : 'stopped']">
            {{ timerRef?.isRunning ? '运行中' : '已停止' }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">剩余时间:</span>
          <span class="status-value">{{ timerRef?.timeLeft }} 秒</span>
        </div>
        <div class="status-item">
          <span class="label">格式化时间:</span>
          <span class="status-value">{{ timerRef?.formattedTime }}</span>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="controls-section">
        <button class="btn btn-primary" :disabled="timerRef?.isRunning" @click="timerRef?.start()">▶️ 开始</button>
        <button class="btn btn-warning" :disabled="!timerRef?.isRunning" @click="timerRef?.pause()">⏸️ 暂停</button>
        <button class="btn btn-secondary" @click="timerRef?.reset()">🔄 重置</button>
      </div>

      <!-- 时长设置 -->
      <div class="settings-section">
        <h3>时长设置</h3>
        <div class="preset-buttons">
          <button class="btn btn-preset" @click="setDuration(30)">30秒</button>
          <button class="btn btn-preset" @click="setDuration(60)">1分钟</button>
          <button class="btn btn-preset" @click="setDuration(120)">2分钟</button>
          <button class="btn btn-preset" @click="setDuration(180)">3分钟</button>
          <button class="btn btn-preset" @click="setDuration(300)">5分钟</button>
        </div>

        <div class="custom-duration">
          <label for="customDuration">自定义时长（秒）:</label>
          <input
            id="customDuration"
            v-model.number="customDuration"
            type="number"
            min="1"
            max="3600"
            class="duration-input"
          />
          <button class="btn btn-info" @click="setCustomDuration">设置</button>
        </div>
      </div>

      <!-- 日志区域 -->
      <div class="log-section">
        <h3>事件日志</h3>
        <div class="log-container">
          <div v-for="(log, index) in logs" :key="index" class="log-item">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="logs.length === 0" class="log-empty">暂无日志记录</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Timer from '../../components/screen/timer.vue';

const timerRef = ref<InstanceType<typeof Timer>>();
const duration = ref(60); // 默认 60 秒
const customDuration = ref(60);
const logs = ref<Array<{ time: string; message: string }>>([]);

// 设置预设时长
const setDuration = (seconds: number) => {
  duration.value = seconds;
  addLog(`设置时长为 ${seconds} 秒`);
};

// 设置自定义时长
const setCustomDuration = () => {
  if (customDuration.value > 0) {
    duration.value = customDuration.value;
    addLog(`设置自定义时长为 ${customDuration.value} 秒`);
  }
};

// 时间到的处理
const handleTimeUp = () => {
  addLog('⏰ 时间到！计时结束');
  // 可以添加声音提示或其他效果
  alert('时间到！');
};

// 添加日志
const addLog = (message: string) => {
  const now = new Date();
  const time = now.toLocaleTimeString('zh-CN');
  logs.value.unshift({ time, message });

  // 只保留最近 20 条日志
  if (logs.value.length > 20) {
    logs.value.pop();
  }
};
</script>

<style scoped>
.timer-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.demo-container {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
}

h3 {
  color: #555;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.timer-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.timer-section :deep(.timer-display) {
  color: white;
  font-size: 4rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.status-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.status-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #666;
}

.status-value {
  font-weight: bold;
  color: #333;
  font-size: 1.1rem;
}

.status-value.running {
  color: #28a745;
}

.status-value.stopped {
  color: #dc3545;
}

.controls-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #28a745;
  color: white;
}

.btn-warning {
  background: #ffc107;
  color: #333;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-preset {
  background: #667eea;
  color: white;
  padding: 0.75rem 1.5rem;
}

.settings-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.preset-buttons {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.custom-duration {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.custom-duration label {
  font-weight: 600;
  color: #666;
}

.duration-input {
  padding: 0.5rem 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  width: 120px;
  transition: border-color 0.3s ease;
}

.duration-input:focus {
  outline: none;
  border-color: #667eea;
}

.log-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
}

.log-container {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
}

.log-item {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #999;
  font-family: monospace;
  min-width: 100px;
}

.log-message {
  color: #333;
}

.log-empty {
  text-align: center;
  color: #999;
  padding: 2rem;
}

/* 滚动条样式 */
.log-container::-webkit-scrollbar {
  width: 8px;
}

.log-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

@media (max-width: 768px) {
  .demo-container {
    padding: 1.5rem;
  }

  .controls-section {
    flex-direction: column;
  }

  .preset-buttons {
    flex-direction: column;
  }

  .custom-duration {
    flex-direction: column;
    align-items: stretch;
  }

  .timer-section :deep(.timer-display) {
    font-size: 3rem;
  }
}
</style>
