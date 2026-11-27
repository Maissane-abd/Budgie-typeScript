<template>
  <div class="app">
    <main class="app-main">
      <RouterView />
    </main>
    <AppFooter :class="{ 'footer-with-sidebar': route.meta.requiresAuth }" />
  </div>
</template>

<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import AppFooter from '@/components/layout/AppFooter.vue';

const route = useRoute();
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  min-width: 0;
}

.footer-with-sidebar {
  margin-left: 210px;
}

@media (max-width: 900px) {
  .footer-with-sidebar {
    margin-left: 0;
  }
}
</style>
