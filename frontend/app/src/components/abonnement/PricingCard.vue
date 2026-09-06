<template>
  <div class="price-card" :class="{ premium: isPremium }">
    <div v-if="isPremium" class="premium-header">
      <h3>{{ plan.name }}</h3>
      <div class="price-display">
        <span class="amount">{{ displayedPrice }}</span>
        <span class="period">{{ pricePeriod }}</span>
      </div>
    </div>
    <h3 v-else>{{ plan.name }}</h3>
    <p class="card-desc">{{ plan.description }}</p>

    <ul class="features-list">
      <li
        v-for="(feature, index) in plan.features"
        :key="index"
        :class="{ disabled: feature.disabled }"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          :stroke="feature.disabled ? '#d1d5db' : (isPremium ? '#7c3aed' : '#8b5cf6')"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline v-if="!feature.disabled" points="20 6 9 17 4 12"></polyline>
          <template v-else>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </template>
        </svg>
        {{ feature.text }}
      </li>
    </ul>

    <div class="spacer"></div>
    
    <div v-if="isPremium && hasActiveSubscription" class="subscription-actions">
      <button class="btn-plan secondary" disabled>Plan actif</button>
      <button
        v-if="canChangePlan"
        class="btn-plan primary"
        @click="$emit('update')"
        :disabled="loadingUpdate"
      >
        {{ loadingUpdate ? 'Modification...' : 'Changer de plan' }}
      </button>
      <button
        class="btn-plan cancel"
        @click="$emit('cancel')"
        :disabled="loadingCancel || loadingUpdate"
      >
        {{ loadingCancel ? 'Annulation...' : 'Résilier' }}
      </button>
    </div>
    <button
      v-else-if="isPremium"
      class="btn-plan primary"
      @click="$emit('subscribe')"
      :disabled="loadingCheckout"
    >
      {{ loadingCheckout ? 'Redirection...' : 'S\'abonner maintenant' }}
    </button>
    <button
      v-else-if="!hasActiveSubscription"
      class="btn-plan secondary"
      disabled
    >
      Plan actuel
    </button>
  </div>
</template>

<script setup>
defineProps({
  plan: {
    type: Object,
    required: true,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  displayedPrice: {
    type: String,
    required: true,
  },
  pricePeriod: {
    type: String,
    required: true,
  },
  hasActiveSubscription: {
    type: Boolean,
    default: false,
  },
  canChangePlan: {
    type: Boolean,
    default: false,
  },
  loadingCheckout: {
    type: Boolean,
    default: false,
  },
  loadingUpdate: {
    type: Boolean,
    default: false,
  },
  loadingCancel: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['subscribe', 'update', 'cancel']);
</script>

<style scoped>
.price-card {
  background: white;
  width: 400px;
  padding: 40px 32px;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  text-align: left;
  display: flex;
  flex-direction: column;
}

.price-card.premium {
  border: 2px solid #a78bfa;
  box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.1);
}

.price-card h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 24px;
  line-height: 1.4;
  min-height: 40px;
}

.premium-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.price-display {
  text-align: right;
  color: #7c3aed;
}

.price-display .amount {
  font-size: 28px;
  font-weight: 800;
  display: block;
}

.price-display .period {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #374151;
  margin-bottom: 12px;
}

.features-list li.disabled {
  color: #9ca3af;
  text-decoration: line-through;
  text-decoration-color: #e5e7eb;
}

.spacer {
  flex: 1;
  margin-bottom: 20px;
}

.btn-plan {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-plan.primary {
  background: #7c3aed;
  color: white;
}

.btn-plan.primary:hover:not(:disabled) {
  background: #6d28d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.btn-plan.secondary {
  background: #f3f4f6;
  color: #6b7280;
  cursor: default;
}

.btn-plan.secondary:disabled {
  opacity: 1;
  cursor: default;
}

.btn-plan:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.subscription-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-plan.cancel {
  background: #ef4444;
  color: white;
}

.btn-plan.cancel:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

@media (max-width: 768px) {
  .price-card {
    width: 100%;
    max-width: 400px;
  }
}
</style>

