<template>
  <div class="app-layout">
    <AppHeader @toggle-sidebar="toggleSidebar" />

    <div class="sidebar-wrapper" :class="{ 'mobile-open': isSidebarOpen }">
      <AppSidebar @click="closeSidebar" />

      <div class="overlay" @click="closeSidebar"></div>
    </div>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue' // Ajout de 'ref'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import { useRoute } from 'vue-router' // Pour fermer au changement de page

const userStore = useUserStore()
const isSidebarOpen = ref(false)

// Actions pour le menu
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

onMounted(async () => {
  const token = localStorage.getItem('budgie_token')

  // Logique de persistance de l'utilisateur (inchangée)
  if (token && !userStore.user) {
    try {
      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      userStore.setUser(res.data)
    } catch (error) {
      console.error('Session expirée ou invalide', error)
      localStorage.removeItem('budgie_token')
      userStore.clearUser()
    }
  }
})
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
}

.content {
  margin-left: 210px;
  margin-top: 60px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
  transition: margin-left 0.3s ease, padding 0.3s ease;
}

.overlay {
  display: none;
}

.sidebar-wrapper {
  display: contents;
}

@media (max-width: 900px) {
  .content {
    margin-left: 0;
    padding: 20px;
  }

  .sidebar-wrapper :deep(.sidebar) {
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 4px 0 15px rgba(0,0,0,0.1);
  }

  .sidebar-wrapper.mobile-open :deep(.sidebar) {
    transform: translateX(0);
  }

  .overlay {
    display: block;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 899;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(1px);
  }

  .sidebar-wrapper.mobile-open .overlay {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>