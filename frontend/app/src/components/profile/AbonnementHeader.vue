<template>
  <div class="card sub-card">
    <div class="card-header">
      <div class="header-left">
        <h2>Mon Abonnement</h2>
        <span class="badge" :class="isPremium ? 'badge-premium' : 'badge-free'">
          {{ user.plan_name || 'Free' }}
        </span>
      </div>
      <div class="price-tag">
        {{ formatPrice(user.price) }} <span class="period">/ mois</span>
      </div>
    </div>

    <div class="sub-content">
      <div class="limits-grid">
        <div class="limit-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
          <div class="limit-info">
            <span class="label">Comptes</span>
            <span class="value">
              {{ user.max_accounts >= 999 ? 'Illimités' : (user.max_accounts || 1) + ' max' }}
            </span>
          </div>
        </div>
        <div class="limit-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <div class="limit-info">
            <span class="label">Statut</span>
            <span class="value capitalize">{{ user.sub_status || 'Actif' }}</span>
          </div>
        </div>
      </div>

      <div class="actions-area">
        <p v-if="!isPremium" class="upsell-text">
          Débloquez la puissance illimitée de Budgie.
        </p>
        <p v-else class="upsell-text">
          Merci pour votre confiance !
        </p>

        <button class="btn-sub" :class="isPremium ? 'btn-manage' : 'btn-upgrade'" @click="handleAction">
          {{ isPremium ? 'Gérer mon abonnement' : 'Passer Premium' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import axios from 'axios';

// On recup l'objet user complet depuis profile.vue
const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const API_URL = "/api";

const isPremium = computed(() => props.user?.plan_name === 'Premium');

const formatPrice = (p) => {
  return (!p || p === 0) ? 'Gratuit' : `${p} €`;
};

const handleAction = async () => {
  // Exemple d'action vers le backend (Stripe)
  const token = localStorage.getItem("budgie_token");
  if (!token) return;

  // Si  premium -> Portail client sinon -> Paiement
  alert("Redirection vers la gestion d'abonnement (soon)");
};
</script>

<style scoped>
.sub-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  margin-bottom: 20px;
}

.card-header {
  background: #f9fafb;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
  font-weight: 700;
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-free {
  background: #e5e7eb;
  color: #374151;
}

.badge-premium {
  background: #f3e8ff;
  color: #6b21a8;
  border: 1px solid #d8b4fe;
}

.price-tag {
  font-weight: 800;
  color: #1f2937;
  font-size: 16px;
}

.period {
  font-size: 12px;
  color: #6b7280;
  font-weight: 400;
}

.sub-content {
  padding: 24px;
}

.limits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.limit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
}

.icon {
  font-size: 18px;
  background: #f9fafb;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.limit-info {
  display: flex;
  flex-direction: column;
}

.limit-info .label {
  font-size: 10px;
  color: #9ca3af;
  text-transform: uppercase;
  font-weight: 600;
}

.limit-info .value {
  font-size: 13px;
  color: #374151;
  font-weight: 600;
}

.capitalize {
  text-transform: capitalize;
}

.upsell-text {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 15px;
  line-height: 1.5;
}

.btn-sub {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: 0.2s;
}

.btn-upgrade {
  background: linear-gradient(135deg, #6b21a8 0%, #4a1d96 100%);
  color: white;
  box-shadow: 0 4px 10px rgba(107, 33, 168, 0.2);
}

.btn-upgrade:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(107, 33, 168, 0.3);
}

.btn-manage {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn-manage:hover {
  background: #e5e7eb;
}
</style>