<template>
  <div class="summary-cards">
    <div class="summary-card">
      <div class="summary-label">Solde initial</div>
      <div class="summary-value">
        {{ formatCurrency(startingBalance) }}
      </div>
    </div>
    <div class="summary-card highlight">
      <div class="summary-label">Solde prévisionnel</div>
      <div class="summary-value">
        {{ formatCurrency(forecastedBalance) }}
      </div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Évolution</div>
      <div
        class="summary-value"
        :class="{
          positive: evolution >= 0,
          negative: evolution < 0
        }"
      >
        {{ formatCurrency(evolution) }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  startingBalance: {
    type: Number,
    default: 0,
  },
  forecastedBalance: {
    type: Number,
    default: 0,
  },
  evolution: {
    type: Number,
    default: 0,
  },
});

function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}
</script>

<style scoped>
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.summary-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-card.highlight {
  background: linear-gradient(135deg, #3f2b96 0%, #2f1f72 100%);
  color: white;
}

.summary-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.summary-card.highlight .summary-label {
  color: rgba(255, 255, 255, 0.8);
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.summary-card.highlight .summary-value {
  color: white;
}

.summary-value.positive {
  color: #059669;
}

.summary-value.negative {
  color: #dc2626;
}
</style>

