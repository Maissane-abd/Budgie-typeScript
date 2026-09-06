<template>
  <header class="app-header">

    <div class="header-left">
      <button class="burger-btn" @click="$emit('toggle-sidebar')" title="Menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div class="logo">Budgie</div>
    </div>

    <div class="header-right">
      <button class="icon-btn logout-btn" title="Se déconnecter" @click="handleLogout">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </button>
    </div>

  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

// Déclaration de l'événement pour le parent (AppLayout)
defineEmits(['toggle-sidebar'])

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  localStorage.removeItem('budgie_token')
  userStore.clearUser()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  z-index: 1000;
}

.header-left {
  width: 210px; /* Largeur de la sidebar PC */
  display: flex;
  align-items: center;
  /* Pas de gap ici pour coller le burger à gauche si besoin, on gère avec margin */
}

/* --- BOUTON BURGER --- */
.burger-btn {
  display: none; /* Caché par défaut (Desktop) */
  background: none;
  border: none;
  cursor: pointer;
  color: #374151;
  padding: 0;
  margin-right: 16px;
  transition: color 0.2s;
}

.burger-btn:hover {
  color: #6b21a8;
}

.logo {
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #6b21a8;
  letter-spacing: -0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.icon-btn:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.logout-btn:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

@media (max-width: 900px) {
  .app-header {
    padding: 0 16px;
  }

  .header-left {
    width: auto;
  }

  .burger-btn {
    display: block;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>