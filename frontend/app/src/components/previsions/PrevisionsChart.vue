<template>
  <div class="chart-container">
    <div class="chart-bars">
      <div
        v-for="(month, index) in monthlyDetails.slice(0, 12)"
        :key="index"
        class="chart-bar-wrapper"
      >
        <div class="chart-bar-container">
          <div
            class="chart-bar positive"
            :style="{
              height: `${Math.abs((month.income / maxValue) * 100)}%`
            }"
            :title="`Revenus: ${formatCurrency(month.income)}`"
          ></div>
          <div
            class="chart-bar negative"
            :style="{
              height: `${Math.abs((month.expense / maxValue) * 100)}%`
            }"
            :title="`Dépenses: ${formatCurrency(month.expense)}`"
          ></div>
        </div>
        <div class="chart-label">
          {{ formatMonth(month.month) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  monthlyDetails: {
    type: Array,
    required: true,
  },
  maxValue: {
    type: Number,
    required: true,
  },
});

function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

function formatMonth(date) {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', { month: 'short' });
}
</script>

<style scoped>
.chart-container {
  margin-bottom: 32px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.chart-bars {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  padding: 16px 0;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-bar-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  position: relative;
}

.chart-bar {
  width: 50%;
  min-height: 2px;
  border-radius: 4px 4px 0 0;
  transition: opacity 0.2s;
}

.chart-bar.positive {
  background: #10b981;
}

.chart-bar.negative {
  background: #ef4444;
}

.chart-label {
  font-size: 11px;
  color: #6b7280;
  margin-top: 8px;
  text-align: center;
}

@media (max-width: 768px) {
  .chart-container {
    display: none;
  }
}
</style>

