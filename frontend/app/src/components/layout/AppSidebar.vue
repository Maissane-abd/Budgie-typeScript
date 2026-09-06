<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { RouterLink } from 'vue-router'

const userStore = useUserStore()
const firstName = computed(() => userStore.user?.first_name || 'Utilisateur')

const menuItems = [
  {
    to: '/accounts',
    label: 'Comptes',
    icon: `<path d="M20 7h-4V4c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v5H4c-1.103 0-2 .897-2 2v9a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V9c0-1.103-.897-2-2-2zM4 11h4v8H4v-8zm6-1V4h4v6h-4zm10 9h-4v-8h4v8z"/>`
  },
  {
    to: '/depenses',
    label: 'Dépenses',
    icon: `<path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm.707-13.707-1.414-1.414-4 4a1 1 0 0 0 0 1.414l4 4 1.414-1.414L10.414 12l4.293-4.293z"/><path d="M16 11h-3V8h-2v3H8v2h3v3h2v-3h3z"/>`
  },
  {
    to: '/revenus',
    label: 'Revenus',
    icon: `<path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-.707-7.707-1.414 1.414 4 4a1 1 0 0 0 1.414 0l4-4-1.414-1.414L14.586 11l-4.293 4.293z"/><path d="M8 11h3V8h2v3h3v2h-3v3h-2v-3H8z"/>`
  },
  {
    to: '/previsions',
    label: 'Prévisions',
    icon: `<path d="M5 19h14v2H5zM19 5h-2v8h-2V9h-2v6h-2v-4H9v8H7V5h12z"/>`
  },
  {
    to: '/abonnement',
    label: 'Abonnement',
    icon: `<path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm.707-13.707-1.414-1.414-4 4a1 1 0 0 0 0 1.414l4 4 1.414-1.414L10.414 12l4.293-4.293z"/><path d="M16 11h-3V8h-2v3H8v2h3v3h2v-3h3z"/>`
  },
  {
    to: '/profile',
    label: 'Profil',
    icon: `<path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z"/>`
  },

]
</script>

<template>
  <aside class="sidebar">
    <div class="user-info">
      <div class="avatar-circle">
        {{ firstName.charAt(0).toUpperCase() }}
      </div>
      <div class="welcome-text">
        <span class="label">Bonjour,</span>
        <span class="name">{{ firstName }}</span>
      </div>
    </div>

    <nav class="nav-links">
      <RouterLink
          v-for="link in menuItems"
          :key="link.to"
          :to="link.to"
          class="sidebar-link"
          active-class="active"
      >
        <svg
            class="icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            v-html="link.icon"
        ></svg>
        <span class="link-label">{{ link.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  bottom: 0;
  width: 210px;

  /* Style */
  background: #ffffff;
  padding: 24px 16px;
  border-right: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 32px;
  overflow-y: auto;
  z-index: 900;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
  margin-bottom: 8px;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  background-color: #f3e8ff;
  color: #6b21a8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
}

.welcome-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.welcome-text .label {
  font-size: 12px;
  color: #6b7280;
}

.welcome-text .name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #4b5563;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 14px;
}

.icon {
  width: 20px;
  height: 20px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.sidebar-link:hover {
  background-color: #f9fafb;
  color: #6b21a8;
}

.sidebar-link:hover .icon {
  opacity: 1;
}

.sidebar-link.active {
  background-color: #6b21a8;
  color: white;
  box-shadow: 0 4px 12px rgba(107, 33, 168, 0.2);
}

.sidebar-link.active .icon {
  opacity: 1;
  fill: white;
}
</style>