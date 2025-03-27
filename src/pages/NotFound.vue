<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <a-button type="primary" @click="goHome">Back to Dashboard</a-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/dashboard');
};
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  padding: 4px;
  padding-bottom: 24px;
  animation: fadeIn 0.3s ease-in-out;
  height: calc(100vh - 64px);
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.not-found-content {
  max-width: 500px;
  padding: 40px;
  border-radius: 12px;
  background-color: var(--card-bg, #fff);
  box-shadow: 0 2px 8px var(--shadow-color, rgba(0, 0, 0, 0.1));
}

h1 {
  font-size: 72px;
  font-weight: 700;
  color: #1890ff;
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 12px 0 24px;
}

p {
  margin-bottom: 24px;
  color: var(--text-color, rgba(0, 0, 0, 0.65));
}
</style> 